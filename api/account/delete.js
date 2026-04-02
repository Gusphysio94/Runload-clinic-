import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.body || {}
  if (!userId) {
    return res.status(400).json({ error: 'userId requis' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Configuration serveur manquante' })
  }

  // Verify the request comes from the authenticated user
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Non authentifié' })
  }

  const anonClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY)
  const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace('Bearer ', ''))

  if (authError || !user || user.id !== userId) {
    return res.status(403).json({ error: 'Non autorisé' })
  }

  // Use admin client to delete the user (cascades to all data via schema)
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error } = await adminClient.auth.admin.deleteUser(userId)
  if (error) {
    return res.status(500).json({ error: 'Erreur lors de la suppression: ' + error.message })
  }

  return res.status(200).json({ success: true })
}
