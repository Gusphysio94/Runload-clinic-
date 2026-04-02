/**
 * Vercel Serverless Function — Strava OAuth callback
 * Échange le code d'autorisation contre des tokens, puis redirige vers l'app.
 */
export default async function handler(req, res) {
  const { code, scope } = req.query

  if (!code) {
    return res.redirect('/?strava_auth=error&reason=no_code')
  }

  // Vérifier que les scopes nécessaires sont présents
  if (scope && !scope.includes('activity:read')) {
    return res.redirect('/?strava_auth=error&reason=scope_denied')
  }

  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Strava token exchange failed:', err)
      return res.redirect('/?strava_auth=error&reason=token_exchange')
    }

    const data = await response.json()

    // Passer les tokens via fragment hash (pas dans les query params pour éviter les logs serveur)
    const params = new URLSearchParams({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: String(data.expires_at),
      athlete_id: String(data.athlete?.id || ''),
      athlete_name: `${data.athlete?.firstname || ''} ${data.athlete?.lastname || ''}`.trim(),
    })

    // Préserver le state (contient la page de retour éventuelle)
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:5173'

    return res.redirect(`${baseUrl}/?strava_auth=success#${params.toString()}`)
  } catch (err) {
    console.error('Strava callback error:', err)
    return res.redirect('/?strava_auth=error&reason=server_error')
  }
}
