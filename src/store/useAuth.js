import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AUTH_ERRORS = {
  'Invalid login credentials': 'Email ou mot de passe incorrect.',
  'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter.',
  'User already registered': 'Un compte existe déjà avec cet email.',
  'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères.',
  'Unable to validate email address: invalid format': 'Format d\'email invalide.',
  'For security purposes, you can only request this after': 'Trop de tentatives. Veuillez patienter avant de réessayer.',
  'New password should be different from the old password': 'Le nouveau mot de passe doit être différent de l\'ancien.',
}

// ─── Rate limiting côté client ───────────────────────────────────────────────
const LOGIN_ATTEMPTS_KEY = 'runload-login-attempts'
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 5 * 60 * 1000 // 5 minutes

function checkRateLimit() {
  try {
    const raw = localStorage.getItem(LOGIN_ATTEMPTS_KEY)
    if (!raw) return { allowed: true }
    const data = JSON.parse(raw)
    if (Date.now() - data.firstAttempt > LOCKOUT_MS) {
      localStorage.removeItem(LOGIN_ATTEMPTS_KEY)
      return { allowed: true }
    }
    if (data.count >= MAX_ATTEMPTS) {
      const remaining = Math.ceil((LOCKOUT_MS - (Date.now() - data.firstAttempt)) / 60000)
      return { allowed: false, message: `Trop de tentatives. Réessayez dans ${remaining} min.` }
    }
    return { allowed: true }
  } catch {
    return { allowed: true }
  }
}

function recordFailedAttempt() {
  try {
    const raw = localStorage.getItem(LOGIN_ATTEMPTS_KEY)
    const data = raw ? JSON.parse(raw) : { count: 0, firstAttempt: Date.now() }
    if (Date.now() - data.firstAttempt > LOCKOUT_MS) {
      localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify({ count: 1, firstAttempt: Date.now() }))
    } else {
      data.count++
      localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(data))
    }
  } catch { /* ignore */ }
}

function clearFailedAttempts() {
  localStorage.removeItem(LOGIN_ATTEMPTS_KEY)
}

const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes

function translateError(msg) {
  return AUTH_ERRORS[msg] || msg || 'Une erreur est survenue.'
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!supabase) // false immediately if no supabase
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabase) return

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = useCallback(async (email, password, displayName) => {
    if (!supabase) { setError('Service non configuré.'); return false }
    setError(null)
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    })
    if (err) {
      setError(translateError(err.message))
      return false
    }
    return true
  }, [])

  const signIn = useCallback(async (email, password) => {
    if (!supabase) { setError('Service non configuré.'); return false }
    const limit = checkRateLimit()
    if (!limit.allowed) { setError(limit.message); return false }
    setError(null)
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (err) {
      recordFailedAttempt()
      setError(translateError(err.message))
      return false
    }
    clearFailedAttempts()
    return true
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    if (supabase) await supabase.auth.signOut()
    setUser(null)
  }, [])

  const resetPassword = useCallback(async (email) => {
    if (!supabase) { setError('Service non configuré.'); return false }
    setError(null)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    })
    if (err) {
      setError(translateError(err.message))
      return false
    }
    return true
  }, [])

  const updatePassword = useCallback(async (newPassword) => {
    if (!supabase) { setError('Service non configuré.'); return false }
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return false
    }
    setError(null)
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    if (err) {
      setError(translateError(err.message))
      return false
    }
    return true
  }, [])

  // ─── Auto-déconnexion après inactivité (30 min) ──────────────────────────
  const inactivityTimer = useRef(null)

  useEffect(() => {
    if (!user) return

    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
      inactivityTimer.current = setTimeout(() => {
        if (supabase) supabase.auth.signOut()
        setUser(null)
      }, INACTIVITY_TIMEOUT)
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer))
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    }
  }, [user])

  const deleteAccount = useCallback(async () => {
    if (!supabase) { setError('Service non configuré.'); return false }
    setError(null)
    // Get current session token for server-side verification
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) { setError('Session expirée. Reconnectez-vous.'); return false }

    const res = await fetch('/api/account/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: user?.id }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Erreur lors de la suppression du compte.')
      return false
    }
    // Clear local data
    localStorage.removeItem('runload-clinic')
    localStorage.removeItem('runload-clinic-migrated')
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY)
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    return true
  }, [user])

  const updateProfile = useCallback(async (updates) => {
    if (!supabase) { setError('Service non configuré.'); return false }
    setError(null)
    const { error: err } = await supabase.auth.updateUser({
      data: updates,
    })
    if (err) {
      setError(translateError(err.message))
      return false
    }
    // Refresh user data
    const { data: { user: refreshed } } = await supabase.auth.getUser()
    if (refreshed) setUser(refreshed)
    return true
  }, [])

  return { user, loading, error, signUp, signIn, signOut, resetPassword, updatePassword, updateProfile, deleteAccount, setError }
}
