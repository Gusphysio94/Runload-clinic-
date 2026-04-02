import { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

export function AccountSettings({ user, auth, onBack }) {
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileSaved, setProfileSaved] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setProfileSaved(false)
    const ok = await auth.updateProfile({ display_name: displayName.trim() })
    if (ok) setProfileSaved(true)
    setSubmitting(false)
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setPasswordSaved(false)
    if (newPassword !== confirmPassword) {
      auth.setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (newPassword.length < 6) {
      auth.setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    setSubmitting(true)
    const ok = await auth.updatePassword(newPassword)
    if (ok) {
      setPasswordSaved(true)
      setNewPassword('')
      setConfirmPassword('')
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
            Paramètres du compte
          </h2>
          <p className="text-text-secondary text-sm mt-1">{user?.email}</p>
        </div>
        {onBack && (
          <Button variant="secondary" onClick={onBack}>Retour</Button>
        )}
      </div>

      {auth.error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {auth.error}
        </div>
      )}

      {/* Profil */}
      <Card>
        <h3 className="text-sm font-bold text-text-primary mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Profil
        </h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Nom d'affichage</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full max-w-sm px-3.5 py-2.5 bg-surface border border-border/80 rounded-xl text-sm text-text-primary
                focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Email</label>
            <p className="text-sm text-text-primary px-3.5 py-2.5 bg-slate-50 border border-border/40 rounded-xl max-w-sm">
              {user?.email}
            </p>
            <p className="text-[0.65rem] text-text-muted mt-1">L'email ne peut pas être modifié.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            {profileSaved && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Profil mis à jour
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* Mot de passe */}
      <Card>
        <h3 className="text-sm font-bold text-text-primary mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Changer le mot de passe
        </h3>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full max-w-sm px-3.5 py-2.5 bg-surface border border-border/80 rounded-xl text-sm text-text-primary
                focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
              placeholder="6 caractères minimum"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full max-w-sm px-3.5 py-2.5 bg-surface border border-border/80 rounded-xl text-sm text-text-primary
                focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
              placeholder="••••••"
              required
              minLength={6}
            />
          </div>
          {/* Password strength indicator */}
          {newPassword && (
            <PasswordStrength password={newPassword} />
          )}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Modification...' : 'Modifier le mot de passe'}
            </Button>
            {passwordSaved && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mot de passe modifié
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* Sécurité */}
      <Card>
        <h3 className="text-sm font-bold text-text-primary mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          Sécurité
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-6-2.25a3 3 0 116 0v3.75a3 3 0 01-6 0V10.5z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-text-primary">Email confirmé</p>
              <p className="text-xs text-text-muted">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-text-primary">Données chiffrées</p>
              <p className="text-xs text-text-muted">Connexion HTTPS + Row Level Security</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-text-primary">Protection brute force</p>
              <p className="text-xs text-text-muted">Verrouillage après 5 tentatives échouées</p>
            </div>
          </div>
          {user?.created_at && (
            <p className="text-xs text-text-muted pt-2 border-t border-border/30">
              Compte créé le {new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}

function PasswordStrength({ password }) {
  const checks = [
    { label: '6 caractères minimum', pass: password.length >= 6 },
    { label: 'Une majuscule', pass: /[A-Z]/.test(password) },
    { label: 'Un chiffre', pass: /\d/.test(password) },
    { label: 'Un caractère spécial', pass: /[^a-zA-Z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length
  const color = score <= 1 ? 'bg-red-400' : score <= 2 ? 'bg-amber-400' : score <= 3 ? 'bg-yellow-400' : 'bg-green-500'
  const label = score <= 1 ? 'Faible' : score <= 2 ? 'Moyen' : score <= 3 ? 'Bon' : 'Fort'

  return (
    <div className="max-w-sm space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${(score / 4) * 100}%` }} />
        </div>
        <span className={`text-[0.65rem] font-semibold ${score <= 2 ? 'text-amber-600' : 'text-green-600'}`}>{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c, i) => (
          <span key={i} className={`text-[0.6rem] flex items-center gap-1 ${c.pass ? 'text-green-600' : 'text-text-muted'}`}>
            {c.pass ? '✓' : '○'} {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}
