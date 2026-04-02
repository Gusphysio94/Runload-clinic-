/**
 * Vercel Serverless Function — Proxy pour récupérer les activités Strava
 * GET /api/strava/activities?access_token=...&page=1&per_page=20&after=EPOCH
 *
 * Filtre uniquement les activités de type course à pied.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { access_token, page = '1', per_page = '20', after } = req.query

  if (!access_token) {
    return res.status(400).json({ error: 'access_token required' })
  }

  try {
    const params = new URLSearchParams({
      page,
      per_page,
    })
    if (after) params.set('after', after)

    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    )

    // Transférer les headers de rate-limit pour que le client puisse les afficher
    const rateLimitUsage = response.headers.get('X-RateLimit-Usage')
    const rateLimitLimit = response.headers.get('X-RateLimit-Limit')
    if (rateLimitUsage) res.setHeader('X-RateLimit-Usage', rateLimitUsage)
    if (rateLimitLimit) res.setHeader('X-RateLimit-Limit', rateLimitLimit)

    if (!response.ok) {
      if (response.status === 401) {
        return res.status(401).json({ error: 'Token expired or invalid' })
      }
      if (response.status === 429) {
        return res.status(429).json({ error: 'Strava rate limit exceeded' })
      }
      return res.status(response.status).json({ error: 'Strava API error' })
    }

    const activities = await response.json()

    // Filtrer uniquement les activités de course
    const runTypes = ['Run', 'TrailRun', 'VirtualRun']
    const runs = activities.filter(a => runTypes.includes(a.type) || runTypes.includes(a.sport_type))

    return res.status(200).json(runs)
  } catch (err) {
    console.error('Strava activities error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
