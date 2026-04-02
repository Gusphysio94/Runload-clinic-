import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AUTH_ERRORS = {
  'Invalid login credentials': 'Email ou mot de passe incorrect.',
  'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter.',
  'User already registered': 'Un compte existe déjà avec cet email.',
  'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères.',
  'Unable to validate email address: invalid format': 'Format d\'email invalide.',
}

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
    setError(null)
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (err) {
      setError(translateError(err.message))
      return false
    }
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

  return { user, loading, error, signUp, signIn, signOut, resetPassword, setError }
}
