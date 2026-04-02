/**
 * Vercel Serverless Function — Rafraîchir un access token Strava
 * POST /api/strava/refresh  { refresh_token }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { refresh_token } = req.body || {}

  if (!refresh_token) {
    return res.status(400).json({ error: 'refresh_token required' })
  }

  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Strava refresh failed:', err)
      return res.status(response.status).json({ error: 'Strava refresh failed' })
    }

    const data = await response.json()

    return res.status(200).json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    })
  } catch (err) {
    console.error('Strava refresh error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
