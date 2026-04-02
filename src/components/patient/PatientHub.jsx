import { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/FormField'

const OBJECTIVES_LABELS = {
  sante: 'Santé', '5k': '5K', '10k': '10K', semi: 'Semi',
  marathon: 'Marathon', trail_court: 'Trail court', trail_long: 'Trail long', ultra: 'Ultra',
}
const LEVEL_LABELS = {
  debutant: 'Débutant', intermediaire: 'Intermédiaire', confirme: 'Confirmé', elite: 'Élite',
}

function getInitials(p) {
  return ((p.firstName?.[0] || '') + (p.lastName?.[0] || '')).toUpperCase() || '?'
}

function getTimeSince(dateStr) {
  if (!dateStr) return null
  const days = Math.round((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24))
  if (days === 0) return "aujourd'hui"
  if (days === 1) return 'hier'
  if (days < 7) return `il y a ${days}j`
  if (days < 30) return `il y a ${Math.round(days / 7)} sem.`
  if (days < 365) return `il y a ${Math.round(days / 30)} mois`
  return `il y a ${Math.round(days / 365)} an(s)`
}

function getCompletion(p) {
  const checks = [
    !!p.firstName, !!p.lastName, !!p.level, !!p.objective,
    !!p.weeklyVolumeRef, !!(p.fcMax || p.vma || p.criticalSpeed),
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

export function PatientHub({
  patients, activePatientId,
  onSelect, onCreate, onDelete, onEdit,
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const handleCreate = () => {
    if (!firstName.trim() && !lastName.trim()) return
    onCreate(firstName.trim(), lastName.trim())
    setFirstName('')
    setLastName('')
    setShowCreate(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCreate()
    }
  }

  const handleDelete = (id, name, e) => {
    e.stopPropagation()
    if (confirm(`Supprimer le patient ${name} et toutes ses données ?`)) {
      onDelete(id)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
            Mes patients
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            {patients.length === 0
              ? 'Commencez par créer votre premier patient.'
              : `${patients.length} patient${patients.length > 1 ? 's' : ''}`
            }
          </p>
        </div>
        {!showCreate && (
          <Button onClick={() => setShowCreate(true)}>
            + Nouveau patient
          </Button>
        )}
      </div>

      {/* Création rapide inline */}
      {showCreate && (
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            Nouveau patient
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Prénom"
              autoFocus
              className="flex-1"
            />
            <Input
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nom"
              className="flex-1"
            />
            <div className="flex gap-2 shrink-0">
              <Button onClick={handleCreate} disabled={!firstName.trim() && !lastName.trim()}>
                Créer
              </Button>
              <Button variant="secondary" onClick={() => { setShowCreate(false); setFirstName(''); setLastName('') }}>
                Annuler
              </Button>
            </div>
          </div>
          <p className="text-[0.65rem] text-text-muted mt-2">
            Seuls le nom et prénom suffisent. Complétez le profil au fil du suivi.
          </p>
        </Card>
      )}

      {/* État vide — Onboarding guidé */}
      {patients.length === 0 && !showCreate && (
        <Card>
          <div className="py-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                Bienvenue sur RunLoad Clinic
              </h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto">
                Démarrez en 3 étapes pour suivre la charge de vos patients coureurs.
              </p>
            </div>

            <div className="max-w-lg mx-auto space-y-3">
              <OnboardingStep
                step={1}
                title="Créer votre premier patient"
                detail="Prénom et nom suffisent. Vous compléterez le profil au fil du suivi."
                action={() => setShowCreate(true)}
                actionLabel="Créer un patient"
              />
              <OnboardingStep
                step={2}
                title="Enregistrer sa première séance"
                detail="Distance, durée, RPE et bien-être pour calculer la charge initiale."
                disabled
              />
              <OnboardingStep
                step={3}
                title="Analyser les signaux de risque"
                detail="ACWR, monotonie et score de risque s'affinent après 2+ semaines de données."
                disabled
              />
            </div>
          </div>
        </Card>
      )}

      {/* Grille de cartes patients */}
      {patients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map(p => {
            const isActive = p.id === activePatientId
            const completion = getCompletion(p)
            const name = `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Sans nom'
            const completionColor = completion >= 75 ? 'bg-emerald-500' : completion >= 40 ? 'bg-amber-500' : 'bg-red-400'

            return (
              <div
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={`relative group cursor-pointer rounded-2xl border p-5 transition-all duration-200
                  hover:shadow-md hover:-translate-y-0.5
                  ${isActive
                    ? 'border-primary-300 bg-primary-50/30 shadow-sm shadow-primary-100'
                    : 'border-border/60 bg-surface-card hover:border-border'
                  }`}
              >
                {/* Badge actif */}
                {isActive && (
                  <div className="absolute -top-2 right-4 px-2.5 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wider bg-primary-500 text-white shadow-sm">
                    Actif
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {getInitials(p)}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary text-sm truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                      {name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {p.objective && (
                        <span className="px-2 py-0.5 rounded-md text-[0.6rem] font-medium bg-slate-100 text-text-secondary">
                          {OBJECTIVES_LABELS[p.objective] || p.objective}
                        </span>
                      )}
                      {p.level && (
                        <span className="px-2 py-0.5 rounded-md text-[0.6rem] font-medium bg-slate-100 text-text-secondary">
                          {LEVEL_LABELS[p.level] || p.level}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-4 text-xs text-text-muted">
                  <span>{p.sessionCount || 0} séance{(p.sessionCount || 0) !== 1 ? 's' : ''}</span>
                  {p.lastSessionDate && (
                    <span>Dernière : {getTimeSince(p.lastSessionDate)}</span>
                  )}
                  {p.noteCount > 0 && (
                    <span>{p.noteCount} note{p.noteCount > 1 ? 's' : ''}</span>
                  )}
                </div>

                {/* Barre complétion */}
                <div className="mt-3">
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${completionColor}`}
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <p className="text-[0.6rem] text-text-muted mt-1">Profil {completion}%</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(p.id) }}
                    className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={(e) => handleDelete(p.id, name, e)}
                    className="px-3 py-1.5 text-xs font-medium text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function OnboardingStep({ step, done, title, detail, action, actionLabel, disabled }) {
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${
      done ? 'bg-emerald-50/50 border-emerald-200/50' :
      disabled ? 'bg-surface-dark/10 border-border/30 opacity-50' :
      'bg-primary-50/30 border-primary-200/40'
    }`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
        done ? 'bg-emerald-500 text-white' :
        disabled ? 'bg-slate-200 text-slate-400' :
        'bg-primary-500 text-white'
      }`} style={{ fontFamily: 'var(--font-heading)' }}>
        {done ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : step}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${done ? 'text-emerald-700' : disabled ? 'text-text-muted' : 'text-text-primary'}`}>
          {title}
        </p>
        {detail && <p className="text-xs text-text-muted mt-0.5">{detail}</p>}
      </div>
      {action && actionLabel && (
        <button
          onClick={action}
          className="text-xs font-semibold text-primary-500 hover:text-primary-600 px-3 py-1.5 rounded-lg
            hover:bg-primary-50 transition-colors shrink-0"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
