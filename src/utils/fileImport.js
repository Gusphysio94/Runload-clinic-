import FitParser from 'fit-file-parser'
import gpxParser from 'gpxparser'

/**
 * Parse un fichier d'activité (FIT, GPX ou TCX) et retourne les données
 * de séance normalisées pour pré-remplir le formulaire SessionForm.
 *
 * @param {File} file — fichier uploadé
 * @returns {Promise<{session, raw, source}>}
 *   session: données mappées vers le format SessionForm
 *   raw: données brutes du parseur
 *   source: 'fit' | 'gpx' | 'tcx'
 */
export async function parseActivityFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext === 'fit') {
    return parseFitFile(file)
  } else if (ext === 'gpx') {
    return parseGpxFile(file)
  } else if (ext === 'tcx') {
    return parseTcxFile(file)
  }

  throw new Error(`Format non supporté : .${ext}. Formats acceptés : .fit, .gpx, .tcx`)
}

// ─── FIT ─────────────────────────────────────────────────────────────────────

async function parseFitFile(file) {
  const buffer = await file.arrayBuffer()

  const parser = new FitParser({
    force: true,
    speedUnit: 'km/h',
    lengthUnit: 'km',
    mode: 'list',
  })

  const data = await parser.parseAsync(buffer)

  // Extraire la session principale (résumé global)
  const fitSession = data.sessions?.[0] || {}
  const records = data.records || []
  const laps = data.laps || []

  // Distance en km
  const distance = fitSession.total_distance != null
    ? Number((fitSession.total_distance).toFixed(2))
    : calcDistanceFromRecords(records)

  // Durée en minutes (timer_time = temps effectif)
  const durationSec = fitSession.total_timer_time || fitSession.total_elapsed_time || 0
  const duration = Math.round(durationSec / 60)

  // Dénivelé positif
  const elevation = fitSession.total_ascent || calcElevationFromRecords(records)

  // Date de l'activité
  const dateObj = fitSession.start_time ? new Date(fitSession.start_time) : new Date()
  const date = dateObj.toISOString().split('T')[0]

  // Cadence moyenne
  const avgCadence = fitSession.avg_running_cadence || fitSession.avg_cadence || null

  // FC moyenne et max
  const avgHR = fitSession.avg_heart_rate || null
  const maxHR = fitSession.max_heart_rate || null

  // Zones HR à partir des records (grouper par zones)
  const zones = calcHRZonesFromRecords(records, maxHR || 190)

  // Allure moyenne (min/km)
  const avgPace = distance > 0 ? duration / distance : null

  return {
    session: {
      date,
      distance,
      duration,
      elevationGain: elevation || '',
      useZones: zones.hasData,
      zones: zones.distribution,
      // Métadonnées d'import
      _imported: true,
      _source: 'fit',
      _avgHR: avgHR,
      _maxHR: maxHR,
      _avgCadence: avgCadence,
      _avgPace: avgPace,
    },
    raw: { fitSession, records: records.length, laps: laps.length },
    source: 'fit',
    summary: buildSummary({ distance, duration, elevation, avgHR, maxHR, avgCadence, avgPace, date }),
  }
}

// ─── GPX ─────────────────────────────────────────────────────────────────────

async function parseGpxFile(file) {
  const text = await file.text()

  const gpx = new gpxParser()
  gpx.parse(text)

  const track = gpx.tracks?.[0]
  if (!track) {
    throw new Error('Aucune trace GPS trouvée dans le fichier GPX.')
  }

  const distance = Number((track.distance.total / 1000).toFixed(2))

  // Durée à partir des timestamps
  const points = track.points || []
  let durationMin = 0
  let date = new Date().toISOString().split('T')[0]

  if (points.length >= 2) {
    const first = new Date(points[0].time)
    const last = new Date(points[points.length - 1].time)
    durationMin = Math.round((last - first) / 60000)
    date = first.toISOString().split('T')[0]
  }

  // Dénivelé
  const elevation = track.elevation?.pos
    ? Math.round(track.elevation.pos)
    : calcElevationFromPoints(points)

  // HR depuis extensions GPX (Garmin/Strava incluent parfois la FC)
  const hrValues = extractHRFromGpxPoints(points)
  const avgHR = hrValues.length > 0
    ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length)
    : null
  const maxHR = hrValues.length > 0 ? Math.max(...hrValues) : null

  const avgPace = distance > 0 ? durationMin / distance : null

  return {
    session: {
      date,
      distance,
      duration: durationMin,
      elevationGain: elevation || '',
      useZones: false,
      zones: { z1: '', z2: '', z3: '', z4: '', z5: '' },
      _imported: true,
      _source: 'gpx',
      _avgHR: avgHR,
      _maxHR: maxHR,
      _avgPace: avgPace,
    },
    raw: { points: points.length, tracks: gpx.tracks.length },
    source: 'gpx',
    summary: buildSummary({ distance, duration: durationMin, elevation, avgHR, maxHR, avgPace, date }),
  }
}

// ─── TCX (parsing XML simple) ───────────────────────────────────────────────

async function parseTcxFile(file) {
  const text = await file.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'text/xml')

  const activities = doc.querySelectorAll('Activity')
  if (activities.length === 0) {
    throw new Error('Aucune activité trouvée dans le fichier TCX.')
  }

  const activity = activities[0]
  const laps = activity.querySelectorAll('Lap')
  const trackpoints = activity.querySelectorAll('Trackpoint')

  // Accumuler les métriques des laps
  let totalDistance = 0
  let totalTime = 0
  let _TotalCalories = 0
  let hrSum = 0
  let hrCount = 0
  let maxHR = 0

  laps.forEach(lap => {
    const dist = parseFloat(lap.querySelector('DistanceMeters')?.textContent || '0')
    const time = parseFloat(lap.querySelector('TotalTimeSeconds')?.textContent || '0')
    totalDistance += dist
    totalTime += time
    _TotalCalories += parseFloat(lap.querySelector('Calories')?.textContent || '0')

    const avgHrEl = lap.querySelector('AverageHeartRateBpm Value')
    const maxHrEl = lap.querySelector('MaximumHeartRateBpm Value')
    if (avgHrEl) {
      hrSum += parseFloat(avgHrEl.textContent) * (time / 60)
      hrCount += time / 60
    }
    if (maxHrEl) {
      maxHR = Math.max(maxHR, parseFloat(maxHrEl.textContent))
    }
  })

  const distance = Number((totalDistance / 1000).toFixed(2))
  const duration = Math.round(totalTime / 60)
  const avgHR = hrCount > 0 ? Math.round(hrSum / hrCount) : null

  // Dénivelé depuis les trackpoints
  const elevations = []
  trackpoints.forEach(tp => {
    const alt = tp.querySelector('AltitudeMeters')
    if (alt) elevations.push(parseFloat(alt.textContent))
  })
  const elevation = calcElevationFromArray(elevations)

  // Date
  const firstTime = activity.querySelector('Lap')?.getAttribute('StartTime')
    || trackpoints[0]?.querySelector('Time')?.textContent
  const date = firstTime ? new Date(firstTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

  // HR zones depuis trackpoints
  const hrFromTrackpoints = []
  trackpoints.forEach(tp => {
    const hrEl = tp.querySelector('HeartRateBpm Value')
    if (hrEl) hrFromTrackpoints.push(parseFloat(hrEl.textContent))
  })
  const zones = hrFromTrackpoints.length > 10
    ? calcHRZonesFromArray(hrFromTrackpoints, maxHR || 190)
    : { hasData: false, distribution: { z1: '', z2: '', z3: '', z4: '', z5: '' } }

  const avgPace = distance > 0 ? duration / distance : null

  return {
    session: {
      date,
      distance,
      duration,
      elevationGain: elevation || '',
      useZones: zones.hasData,
      zones: zones.distribution,
      _imported: true,
      _source: 'tcx',
      _avgHR: avgHR,
      _maxHR: maxHR > 0 ? maxHR : null,
      _avgPace: avgPace,
    },
    raw: { laps: laps.length, trackpoints: trackpoints.length },
    source: 'tcx',
    summary: buildSummary({ distance, duration, elevation, avgHR, maxHR: maxHR > 0 ? maxHR : null, avgPace, date }),
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcDistanceFromRecords(records) {
  let maxDist = 0
  for (const r of records) {
    if (r.distance != null && r.distance > maxDist) maxDist = r.distance
  }
  return Number(maxDist.toFixed(2))
}

function calcElevationFromRecords(records) {
  let gain = 0
  let prev = null
  for (const r of records) {
    if (r.altitude != null) {
      if (prev != null && r.altitude > prev) {
        gain += r.altitude - prev
      }
      prev = r.altitude
    }
  }
  return Math.round(gain)
}

function calcElevationFromPoints(points) {
  let gain = 0
  let prev = null
  for (const p of points) {
    if (p.ele != null) {
      if (prev != null && p.ele > prev) gain += p.ele - prev
      prev = p.ele
    }
  }
  return Math.round(gain)
}

function calcElevationFromArray(altitudes) {
  let gain = 0
  for (let i = 1; i < altitudes.length; i++) {
    if (altitudes[i] > altitudes[i - 1]) {
      gain += altitudes[i] - altitudes[i - 1]
    }
  }
  return Math.round(gain)
}

/**
 * Extrait les valeurs HR depuis les extensions GPX (format Garmin).
 * Cherche dans les extensions des trackpoints : <gpxtpx:hr>, <ns3:hr>, etc.
 */
function extractHRFromGpxPoints(points) {
  const hrs = []
  for (const p of points) {
    // gpxparser stocke les extensions dans p.extensions si disponibles
    if (p.extensions?.heartRate) {
      hrs.push(Number(p.extensions.heartRate))
    } else if (p.extensions?.hr) {
      hrs.push(Number(p.extensions.hr))
    }
  }
  return hrs.filter(v => v > 0 && v < 250)
}

/**
 * Calcule la distribution en zones (Z1-Z5) à partir des records FIT avec HR.
 * Zones basées sur %FCmax : Z1 <60%, Z2 60-70%, Z3 70-80%, Z4 80-90%, Z5 >90%
 */
function calcHRZonesFromRecords(records, estimatedMaxHR) {
  const hrValues = records
    .filter(r => r.heart_rate != null && r.heart_rate > 0)
    .map(r => r.heart_rate)

  if (hrValues.length < 10) {
    return { hasData: false, distribution: { z1: '', z2: '', z3: '', z4: '', z5: '' } }
  }

  return calcHRZonesFromArray(hrValues, estimatedMaxHR)
}

function calcHRZonesFromArray(hrValues, estimatedMaxHR) {
  const zones = { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 }
  const maxHR = estimatedMaxHR || 190

  for (const hr of hrValues) {
    const pct = hr / maxHR
    if (pct < 0.60) zones.z1++
    else if (pct < 0.70) zones.z2++
    else if (pct < 0.80) zones.z3++
    else if (pct < 0.90) zones.z4++
    else zones.z5++
  }

  // Convertir les compteurs en minutes (1 record ≈ 1 seconde pour FIT)
  const totalSec = hrValues.length
  const totalMin = totalSec / 60

  if (totalMin < 1) {
    return { hasData: false, distribution: { z1: '', z2: '', z3: '', z4: '', z5: '' } }
  }

  return {
    hasData: true,
    distribution: {
      z1: Math.round(zones.z1 / totalSec * totalMin),
      z2: Math.round(zones.z2 / totalSec * totalMin),
      z3: Math.round(zones.z3 / totalSec * totalMin),
      z4: Math.round(zones.z4 / totalSec * totalMin),
      z5: Math.round(zones.z5 / totalSec * totalMin),
    },
  }
}

function buildSummary({ distance, duration, elevation, avgHR, maxHR, avgCadence, avgPace, date }) {
  const items = []
  items.push({ label: 'Date', value: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) })
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

/**
 * Formate la taille d'un fichier pour l'affichage.
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}
