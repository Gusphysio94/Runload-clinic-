/**
 * Strava integration — Auth, token management, activity fetching & mapping.
 * Tokens stockés dans localStorage séparément des données patient.
 */

const STRAVA_STORAGE_KEY = 'runload-clinic-strava'
const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID

// ─── Auth ────────────────────────────────────────────────────────────────────

export function getStravaAuthUrl() {
  const redirectUri = `${window.location.origin}/api/strava/callback`
  const params = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'read,activity:read_all',
    approval_prompt: 'auto',
  })
  return `https://www.strava.com/oauth/authorize?${params.toString()}`
}

// ─── Token management ────────────────────────────────────────────────────────

export function getStravaTokens() {
  try {
    const raw = localStorage.getItem(STRAVA_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveStravaTokens(tokens) {
  localStorage.setItem(STRAVA_STORAGE_KEY, JSON.stringify(tokens))
}

export function clearStravaTokens() {
  localStorage.removeItem(STRAVA_STORAGE_KEY)
}

export function isStravaConnected() {
  return !!getStravaTokens()?.access_token
}

/**
 * Retourne un access_token valide, en rafraîchissant si nécessaire.
 */
export async function getValidAccessToken() {
  const tokens = getStravaTokens()
  if (!tokens?.access_token) return null

  // Rafraîchir si le token expire dans moins de 5 minutes
  const now = Math.floor(Date.now() / 1000)
  if (tokens.expires_at && tokens.expires_at - now < 300) {
    try {
      const res = await fetch('/api/strava/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: tokens.refresh_token }),
      })
      if (!res.ok) {
        clearStravaTokens()
        return null
      }
      const data = await res.json()
      const updated = { ...tokens, ...data }
      saveStravaTokens(updated)
      return updated.access_token
    } catch {
      clearStravaTokens()
      return null
    }
  }

  return tokens.access_token
}

/**
 * Parse les tokens depuis le hash URL après le callback OAuth.
 * Retourne les tokens si trouvés, null sinon. Nettoie le hash.
 */
export function parseStravaCallbackHash() {
  const url = new URL(window.location.href)
  const authStatus = url.searchParams.get('strava_auth')

  if (!authStatus) return null

  if (authStatus === 'error') {
    const reason = url.searchParams.get('reason') || 'unknown'
    // Nettoyer l'URL
    url.searchParams.delete('strava_auth')
    url.searchParams.delete('reason')
    window.history.replaceState({}, '', url.pathname + url.search)
    return { error: true, reason }
  }

  if (authStatus === 'success' && window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const tokens = {
      access_token: hashParams.get('access_token'),
      refresh_token: hashParams.get('refresh_token'),
      expires_at: Number(hashParams.get('expires_at')),
      athlete_id: hashParams.get('athlete_id'),
      athlete_name: hashParams.get('athlete_name'),
    }

    if (tokens.access_token) {
      saveStravaTokens(tokens)
      // Nettoyer l'URL
      window.history.replaceState({}, '', url.pathname)
      return { error: false, tokens }
    }
  }

  // Nettoyer dans tous les cas
  url.searchParams.delete('strava_auth')
  window.history.replaceState({}, '', url.pathname + url.search)
  return null
}

// ─── Fetch activities ────────────────────────────────────────────────────────

/**
 * Récupère les activités de course depuis Strava.
 * @param {{ page?: number, perPage?: number, after?: number }} options
 * @returns {Promise<{ activities: Array, rateLimit?: string }>}
 */
export async function fetchStravaActivities({ page = 1, perPage = 20, after } = {}) {
  const accessToken = await getValidAccessToken()
  if (!accessToken) throw new Error('Non connecté à Strava')

  const params = new URLSearchParams({
    access_token: accessToken,
    page: String(page),
    per_page: String(perPage),
  })
  if (after) params.set('after', String(after))

  const res = await fetch(`/api/strava/activities?${params.toString()}`)

  if (res.status === 401) {
    clearStravaTokens()
    throw new Error('Session Strava expirée. Reconnectez-vous.')
  }
  if (res.status === 429) {
    throw new Error('Limite Strava atteinte. Réessayez dans quelques minutes.')
  }
  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des activités Strava.')
  }

  const activities = await res.json()
  const rateLimit = res.headers.get('X-RateLimit-Usage')

  return { activities, rateLimit }
}

// ─── Data mapping ────────────────────────────────────────────────────────────

/**
 * Convertit une activité Strava vers le format session de l'app.
 * Retourne le même format que parseActivityFile() dans fileImport.js.
 */
export function mapStravaActivityToSession(activity) {
  const date = activity.start_date_local
    ? activity.start_date_local.split('T')[0]
    : new Date().toISOString().split('T')[0]

  const distance = activity.distance
    ? Number((activity.distance / 1000).toFixed(2))
    : 0

  const duration = activity.moving_time
    ? Math.round(activity.moving_time / 60)
    : 0

  const elevation = activity.total_elevation_gain
    ? Math.round(activity.total_elevation_gain)
    : 0

  const avgHR = activity.average_heartrate || null
  const maxHR = activity.max_heartrate || null
  const avgCadence = activity.average_cadence || null // Strava = single-foot
  const avgPace = distance > 0 ? duration / distance : null

  // Inférer le type de séance
  const sessionType = inferSessionType(activity)

  return {
    session: {
      date,
      distance,
      duration,
      elevationGain: elevation || '',
      sessionType,
      useZones: false, // Strava summary ne contient pas les zones détaillées
      zones: { z1: '', z2: '', z3: '', z4: '', z5: '' },
      _imported: true,
      _source: 'strava',
      _stravaId: activity.id,
      _avgHR: avgHR,
      _maxHR: maxHR,
      _avgCadence: avgCadence,
      _avgPace: avgPace,
    },
    raw: activity,
    source: 'strava',
    summary: buildStravaSummary({ distance, duration, elevation, avgHR, maxHR, avgCadence, avgPace, date }),
  }
}

/**
 * Infère le type de séance depuis les métadonnées Strava.
 */
function inferSessionType(activity) {
  // Trail
  if (activity.type === 'TrailRun' || activity.sport_type === 'TrailRun') {
    return 'trail'
  }

  // Strava workout_type: 0=default, 1=race, 2=long run, 3=workout
  switch (activity.workout_type) {
    case 1: return 'competition'
    case 2: return 'sortie_longue'
    case 3: return 'seuil' // interval/workout → générique
    default: break
  }

  // Heuristique distance
  if (activity.distance > 15000) return 'sortie_longue'

  return 'ef' // Endurance fondamentale par défaut
}

function buildStravaSummary({ distance, duration, elevation, avgHR, maxHR, avgCadence, avgPace, date }) {
  const items = []
  items.push({
    label: 'Date',
    value: new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    }),
  })
  items.push({ label: 'Distance', value: `${distance} km` })
  items.push({ label: 'Durée', value: `${duration} min` })
  if (elevation) items.push({ label: 'D+', value: `${elevation} m` })
  if (avgPace) {
    const totalPaceSec = Math.round(avgPace * 60)
    const paceMin = Math.floor(totalPaceSec / 60)
    const paceSec = totalPaceSec % 60
    items.push({ label: 'Allure moy.', value: `${paceMin}'${paceSec.toString().padStart(2, '0')} /km` })
  }
  if (avgHR) items.push({ label: 'FC moy.', value: `${avgHR} bpm` })
  if (maxHR) items.push({ label: 'FC max', value: `${maxHR} bpm` })
  if (avgCadence) items.push({ label: 'Cadence moy.', value: `${avgCadence * 2} pas/min` })
  return items
}
