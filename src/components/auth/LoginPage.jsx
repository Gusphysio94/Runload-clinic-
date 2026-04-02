import { useState } from 'react'
import { Button } from '../ui/Button'

export function LoginPage({ auth, onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [showReset, setShowReset] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    await auth.signIn(email, password)
    setSubmitting(false)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      auth.setError('Entrez votre email pour réinitialiser le mot de passe.')
      return
    }
    setSubmitting(true)
    const ok = await auth.resetPassword(email)
    if (ok) setResetSent(true)
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
            {showReset ? 'Réinitialiser le mot de passe' : 'Connexion'}
          </h2>

          {auth.error && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {auth.error}
            </div>
          )}

          {resetSent && (
            <div className="mb-4 px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700">
              Un email de réinitialisation a été envoyé. Vérifiez votre boîte mail.
            </div>
          )}

          {showReset ? (
            <form onSubmit={handleReset} className="space-y-4">
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
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Envoi...' : 'Envoyer le lien'}
              </Button>
              <button type="button" onClick={() => { setShowReset(false); auth.setError(null) }} className="w-full text-xs text-primary-500 hover:text-primary-600 font-medium">
                Retour à la connexion
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  autoFocus
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
                  placeholder="••••••"
                  required
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Connexion...' : 'Se connecter'}
              </Button>
              <button type="button" onClick={() => { setShowReset(true); auth.setError(null); setResetSent(false) }} className="w-full text-xs text-text-muted hover:text-primary-500 font-medium transition-colors">
                Mot de passe oublié ?
              </button>
            </form>
          )}
        </div>

        {/* Link to register */}
        <p className="text-center text-sm text-text-secondary mt-5">
          Pas encore de compte ?{' '}
          <button onClick={onSwitch} className="text-primary-500 hover:text-primary-600 font-semibold transition-colors">
            Créer un compte
          </button>
        </p>
      </div>
    </div>
  )
}
