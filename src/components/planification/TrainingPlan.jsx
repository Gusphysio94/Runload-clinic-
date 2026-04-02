import { useState } from 'react'
import { Card } from '../ui/Card'
import { PlanConfigPanel } from './PlanConfigPanel'
import { PlanSummaryBar } from './PlanSummaryBar'
import { WeekCalendar } from './WeekCalendar'
import { generateTrainingPlan } from '../../utils/planGenerator'

export function TrainingPlan({ patient, store }) {
  const plan = store.trainingPlan
  const [confirmReset, setConfirmReset] = useState(false)

  // Guard : pas de patient
  if (!patient) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Planification
          </h2>
        </div>
        <Card>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Aucun patient</h3>
            <p className="text-text-secondary text-sm max-w-md mx-auto">
              Créez un profil patient pour générer un plan d'entraînement personnalisé sur 4 semaines.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  const handleGenerate = (options) => {
    const newPlan = generateTrainingPlan(patient, options)
    store.setTrainingPlan(newPlan)
  }

  const handleReset = () => {
    store.clearTrainingPlan()
  }

  // Pas de plan → afficher la config
  if (!plan) {
    return <PlanConfigPanel patient={patient} onGenerate={handleGenerate} />
  }

  // Calcul du taux d'adhérence
  const totalPlanned = plan.weeks?.reduce((sum, w) => sum + w.sessions.length, 0) || 0
  const totalCompleted = Object.keys(plan.completedSessions || {}).length
  const adherencePercent = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0

  // Plan existant → afficher le résumé + calendrier
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Planification
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Suivez et ajustez le plan d'entraînement du patient — {plan.runsPerWeek} séances/semaine.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Adherence badge */}
          {totalCompleted > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-card border border-border">
              <div className="relative w-8 h-8">
                <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="14" fill="none"
                    stroke={adherencePercent >= 80 ? '#22c55e' : adherencePercent >= 50 ? '#f59e0b' : '#94a3b8'}
                    strokeWidth="3"
                    strokeDasharray={`${adherencePercent * 0.88} 88`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[0.55rem] font-bold text-text-primary">
                  {adherencePercent}%
                </span>
              </div>
              <div>
                <p className="text-[0.6rem] text-text-muted uppercase tracking-wider font-medium">Adhérence</p>
                <p className="text-xs font-semibold text-text-primary">{totalCompleted}/{totalPlanned}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setConfirmReset(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary
              bg-surface-card border border-border rounded-xl hover:text-text-primary hover:border-border/80
              transition-all duration-200"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Régénérer
          </button>
        </div>
      </div>

      {/* Confirmation régénération */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setConfirmReset(false)}>
          <div className="bg-surface-card rounded-2xl border border-border shadow-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-center text-sm font-semibold text-text-primary mb-1">Régénérer le plan ?</h3>
            <p className="text-center text-xs text-text-muted mb-5">
              Le plan actuel et le suivi d'adhérence seront supprimés. Vous pourrez en générer un nouveau.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 px-3 py-2 text-sm font-medium text-text-secondary bg-surface-dark/30 rounded-xl
                  hover:bg-surface-dark/50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => { handleReset(); setConfirmReset(false) }}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-amber-500 rounded-xl
                  hover:bg-amber-600 transition-colors"
              >
                Régénérer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Résumé */}
      <PlanSummaryBar plan={plan} />

      {/* Légende */}
      <Legend />

      {/* Calendrier */}
      <WeekCalendar plan={plan} store={store} />
    </div>
  )
}

function Legend() {
  const items = [
    { label: 'EF', color: '#22c55e' },
    { label: 'Sortie longue', color: '#3b82f6' },
    { label: 'Seuil', color: '#f97316' },
    { label: 'VMA', color: '#ef4444' },
    { label: 'Tempo', color: '#eab308' },
    { label: 'Récup', color: '#93c5fd' },
    { label: 'Côtes', color: '#8b5cf6' },
  ]
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
          <span className="text-[0.65rem] text-text-muted">{item.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-border">
        <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        <span className="text-[0.65rem] text-text-muted">Réalisée</span>
      </div>
    </div>
  )
}
