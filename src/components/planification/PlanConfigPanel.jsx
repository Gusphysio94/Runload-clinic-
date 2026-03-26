import { useState } from 'react'
import { Card } from '../ui/Card'
import { RUNS_PER_WEEK_OPTIONS, OBJECTIVES, RUNNER_LEVELS } from '../../constants'
import { suggestRunsPerWeek } from '../../utils/planGenerator'

export function PlanConfigPanel({ patient, onGenerate }) {
  const suggested = suggestRunsPerWeek(patient)
  const [runsPerWeek, setRunsPerWeek] = useState(suggested)
  const [startDate, setStartDate] = useState(getNextMonday())

  const objectiveLabel = OBJECTIVES.find(o => o.value === patient?.objective)?.label || '—'
  const levelLabel = RUNNER_LEVELS.find(l => l.value === patient?.level)?.label || '—'

  const handleGenerate = () => {
    onGenerate({ runsPerWeek: Number(runsPerWeek), startDate })
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Planification
        </h2>
        <p className="text-text-secondary text-sm mt-1">
          Générer un plan d'entraînement sur 4 semaines adapté au profil patient
        </p>
      </div>

      {/* Résumé profil */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          Profil patient
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <ProfileItem label="Objectif" value={objectiveLabel} />
          <ProfileItem label="Niveau" value={levelLabel} />
          <ProfileItem label="Volume hebdo" value={patient?.weeklyVolumeRef ? `${patient.weeklyVolumeRef} km` : '—'} />
          <ProfileItem label="VMA" value={patient?.vma ? `${patient.vma} km/h` : '—'} />
          <ProfileItem label="Vitesse critique" value={patient?.criticalSpeed ? `${patient.criticalSpeed} km/h` : '—'} />
          <ProfileItem label="FCmax" value={patient?.fcMax ? `${patient.fcMax} bpm` : '—'} />
        </div>
        {!patient?.vma && !patient?.criticalSpeed && !patient?.fcMax && (
          <p className="mt-3 text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/10 rounded-lg px-3 py-2">
            Renseignez VMA, vitesse critique ou FCmax dans le profil pour afficher les allures cibles.
          </p>
        )}
      </Card>

      {/* Configuration */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Configuration du plan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre de sorties */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Nombre de sorties par semaine
            </label>
            <select
              value={runsPerWeek}
              onChange={(e) => setRunsPerWeek(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm text-text-primary
                focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
            >
              {RUNS_PER_WEEK_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Date de début */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Date de début (lundi)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm text-text-primary
                focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
            />
          </div>
        </div>

        {/* Info modèle */}
        <div className="mt-4 text-xs text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2.5 space-y-1">
          <p><strong className="text-slate-800">Modèle polarisé 80/20</strong> — ~80% en intensité basse (Z1-Z2), ~20% en haute intensité</p>
          <p><strong className="text-slate-800">Progression</strong> — Semaines 1-3 : +8%/semaine · Semaine 4 : décharge (~65%)</p>
        </div>

        <button
          onClick={handleGenerate}
          className="mt-5 w-full px-5 py-3 bg-gradient-to-b from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl
            hover:from-primary-500 hover:to-primary-700 shadow-sm shadow-primary-600/25 hover:shadow-md hover:shadow-primary-600/30
            transition-all duration-200"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Générer le plan d'entraînement
        </button>
      </Card>
    </div>
  )
}

function ProfileItem({ label, value }) {
  return (
    <div>
      <p className="text-[0.65rem] text-text-muted font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-text-primary mt-0.5">{value}</p>
    </div>
  )
}

function getNextMonday() {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 1 : 8 - day // Si dimanche → demain, sinon → lundi prochain
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  return monday.toISOString().split('T')[0]
}
