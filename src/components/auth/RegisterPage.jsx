import { useState } from 'react'
import { Button } from '../ui/Button'

export function RegisterPage({ auth, onSwitch }) {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      auth.setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 6) {
      auth.setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    setSubmitting(true)
    const ok = await auth.signUp(email, password, displayName)
    if (ok) setSuccess(true)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-grain px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-4 shadow-lg shadow-primary-600/20">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            RunLoad Clinic
          </h1>
          <p className="text-sm text-text-secondary mt-1">Gestion de charge pour coureurs</p>
        </div>

        {/* Card */}
        <div className="bg-surface-card border border-border/60 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text-primary mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
            Créer un compte
          </h2>

          {auth.error && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {auth.error}
            </div>
          )}

          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-1">Compte créé</h3>
              <p className="text-xs text-text-secondary mb-4">
                Vérifiez votre boîte mail pour confirmer votre compte, puis connectez-vous.
              </p>
              <Button onClick={onSwitch} className="w-full">
                Se connecter
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Votre nom</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border/80 rounded-xl text-sm text-text-primary
                    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                  placeholder="Dr. Martin"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border/80 rounded-xl text-sm text-text-primary
                    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border/80 rounded-xl text-sm text-text-primary
                    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                  placeholder="6 caractères minimum"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border/80 rounded-xl text-sm text-text-primary
                    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                  placeholder="••••••"
                  required
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Création...' : 'Créer mon compte'}
              </Button>
            </form>
          )}
        </div>

        {/* Link to login */}
        {!success && (
          <p className="text-center text-sm text-text-secondary mt-5">
            Déjà un compte ?{' '}
            <button onClick={onSwitch} className="text-primary-500 hover:text-primary-600 font-semibold transition-colors">
              Se connecter
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
