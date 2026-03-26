import { useState } from 'react'
import { Card } from '../ui/Card'
import { generateReturnToRunProtocol, getSupportedInjuries } from '../../utils/returnToRunProtocol'
import { INJURY_TYPES, RUNNER_LEVELS } from '../../constants'

const SUPPORTED = getSupportedInjuries()

function getInjuryLabel(value) {
  return INJURY_TYPES.find(t => t.value === value)?.label || value
}

export function ReturnToRun({ patient }) {
  const [injuryType, setInjuryType] = useState('')
  const [weeksOff, setWeeksOff] = useState('4')
  const [level, setLevel] = useState(patient?.level || 'intermediaire')
  const [targetVolume, setTargetVolume] = useState(patient?.weeklyVolumeRef || '30')
  const [painRest, setPainRest] = useState('0')
  const [protocol, setProtocol] = useState(null)
  const [expandedPhase, setExpandedPhase] = useState(null)

  const canGenerate = injuryType && weeksOff && Number(painRest) <= 5

  const handleGenerate = () => {
    const result = generateReturnToRunProtocol({
      injuryType,
      weeksOff: Number(weeksOff),
      level,
      targetWeeklyVolume: Number(targetVolume),
      currentPainRest: Number(painRest),
    })
    setProtocol(result)
    setExpandedPhase(1)
  }

  const handleReset = () => {
    setProtocol(null)
    setExpandedPhase(null)
  }

  // Grouper les blessures par catégorie
  const groupedInjuries = {}
  for (const s of SUPPORTED) {
    if (!groupedInjuries[s.categoryLabel]) groupedInjuries[s.categoryLabel] = []
    groupedInjuries[s.categoryLabel].push(s)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Protocole de reprise course
        </h2>
        <p className="text-text-secondary text-sm mt-1">
          Génération d'un plan walk/run progressif post-blessure basé sur les guidelines actuelles
        </p>
      </div>

      {/* Configuration */}
      {!protocol && (
        <Card>
          <div className="space-y-5">
            {/* Blessure */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Pathologie</label>
              <select
                value={injuryType}
                onChange={e => setInjuryType(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm text-text-primary
                  focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
              >
                <option value="">Sélectionner la pathologie...</option>
                {Object.entries(groupedInjuries).map(([catLabel, injuries]) => (
                  <optgroup key={catLabel} label={catLabel}>
                    {injuries.map(s => (
                      <option key={s.value} value={s.value}>{getInjuryLabel(s.value)}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Semaines d'arrêt */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Semaines d'arrêt de course</label>
                <input
                  type="number"
                  value={weeksOff}
                  onChange={e => setWeeksOff(e.target.value)}
                  min="1" max="52"
                  className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm text-text-primary
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                />
              </div>

              {/* Douleur au repos */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Douleur actuelle au repos (0-10)</label>
                <input
                  type="number"
                  value={painRest}
                  onChange={e => setPainRest(e.target.value)}
                  min="0" max="10"
                  className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm text-text-primary
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Niveau */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Niveau du coureur</label>
                <select
                  value={level}
                  onChange={e => setLevel(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm text-text-primary
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                >
                  {RUNNER_LEVELS.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>

              {/* Volume cible */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Volume hebdo pré-blessure (km)</label>
                <input
                  type="number"
                  value={targetVolume}
                  onChange={e => setTargetVolume(e.target.value)}
                  min="5" max="200"
                  className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm text-text-primary
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                />
              </div>
            </div>

            {/* Warning douleur */}
            {Number(painRest) > 3 && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-xs text-red-700">
                  Douleur au repos élevée. La reprise de la course n'est pas recommandée tant que la douleur au repos n'est pas ≤ 2/10.
                  Le protocole sera généré avec un avertissement.
                </p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`w-full px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                canGenerate
                  ? 'bg-gradient-to-b from-primary-500 to-primary-600 text-white hover:from-primary-500 hover:to-primary-700 shadow-sm shadow-primary-600/25'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Générer le protocole de reprise
            </button>
          </div>
        </Card>
      )}

      {/* Protocole généré */}
      {protocol && !protocol.error && (
        <>
          {/* Header résumé */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                  {getInjuryLabel(protocol.injuryType)}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">{protocol.categoryLabel}</p>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs font-medium text-text-secondary bg-surface-card border border-border rounded-lg
                  hover:text-text-primary transition-all shrink-0"
              >
                Modifier les paramètres
              </button>
            </div>

            {/* Métriques résumé */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SummaryMetric label="Durée totale" value={`~${protocol.totalWeeks} sem.`} />
              <SummaryMetric label="Phases" value={protocol.phases.length} />
              <SummaryMetric label="Arrêt" value={`${protocol.weeksOff} sem.`} />
              <SummaryMetric label="Volume cible" value={`${protocol.targetWeeklyVolume} km/sem`} />
            </div>

            {/* Readiness issues */}
            {protocol.readinessIssues.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs font-semibold text-amber-800 mb-1">Points d'attention :</p>
                {protocol.readinessIssues.map((issue, i) => (
                  <p key={i} className="text-xs text-amber-700">{issue}</p>
                ))}
              </div>
            )}
          </Card>

          {/* Règle de douleur */}
          <Card>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 0h.008v.008H12v-.008zm0 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                  Règle de monitoring — {protocol.painMonitoring.key}
                </h4>
                <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                  {protocol.painMonitoring.rule}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`text-[0.65rem] font-semibold px-2 py-1 rounded-full ${
                    protocol.painMonitoring.allowedDuring
                      ? 'bg-amber-50 border border-amber-200 text-amber-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {protocol.painMonitoring.allowedDuring
                      ? `≤ ${protocol.painMonitoring.threshold}/10 toléré`
                      : '0/10 requis pendant la course'
                    }
                  </span>
                  <span className="text-[0.65rem] font-semibold px-2 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
                    Règle des 24h
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Prérequis */}
          <Card>
            <h4 className="text-sm font-semibold text-text-primary mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Prérequis avant de démarrer
            </h4>
            <div className="space-y-2">
              {protocol.prerequisites.map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0 mt-0.5 flex items-center justify-center">
                    <span className="text-[0.5rem] text-slate-400 font-bold">{i + 1}</span>
                  </div>
                  <p className="text-sm text-text-secondary">{p}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Phases du protocole */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
              Protocole — {protocol.phases.length} phases
            </h4>

            {protocol.phases.map(phase => {
              const isExpanded = expandedPhase === phase.number
              const progressPercent = Math.round((phase.number / protocol.phases.length) * 100)

              return (
                <div key={phase.number} className="rounded-xl border border-border overflow-hidden bg-surface-card">
                  {/* Phase header — toujours visible */}
                  <button
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.number)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      phase.isContinuous
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-primary-100 text-primary-700'
                    }`} style={{ fontFamily: 'var(--font-heading)' }}>
                      {phase.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{phase.name}</p>
                      <p className="text-[0.65rem] text-text-muted mt-0.5">
                        {phase.walkRun} · {phase.frequency} · {phase.duration}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-primary-400 transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[0.6rem] text-text-muted w-8">{progressPercent}%</span>
                    </div>
                    <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {/* Phase détail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border/50 space-y-4">
                      {/* Objectif */}
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs font-medium text-text-secondary">
                          <strong className="text-text-primary">Objectif :</strong> {phase.objective}
                        </p>
                      </div>

                      {/* Détail séance */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <MiniMetric label="Séance" value={`${phase.totalSessionMin} min`} />
                        <MiniMetric label="Course" value={phase.isContinuous ? `${phase.runMin} min` : `${phase.runMin}' × ${phase.reps}`} />
                        <MiniMetric label="Distance est." value={`~${phase.estDistancePerSession} km`} />
                        <MiniMetric label="Volume est." value={`~${phase.estWeeklyVolume} km/sem`} />
                      </div>

                      {/* Visualisation walk/run */}
                      {!phase.isContinuous && (
                        <div>
                          <p className="text-[0.65rem] text-text-muted mb-2 font-medium">Structure de la séance</p>
                          <div className="flex gap-0.5 h-6 rounded-lg overflow-hidden">
                            {Array.from({ length: phase.reps }, (_, i) => (
                              <div key={i} className="flex flex-1">
                                <div
                                  className="bg-primary-400 h-full"
                                  style={{ flex: phase.runMin }}
                                  title={`Course ${phase.runMin} min`}
                                />
                                <div
                                  className="bg-slate-200 h-full"
                                  style={{ flex: phase.walkMin }}
                                  title={`Marche ${phase.walkMin} min`}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-3 mt-1">
                            <span className="text-[0.55rem] text-text-muted flex items-center gap-1">
                              <span className="w-2 h-2 rounded-sm bg-primary-400" /> Course
                            </span>
                            <span className="text-[0.55rem] text-text-muted flex items-center gap-1">
                              <span className="w-2 h-2 rounded-sm bg-slate-200" /> Marche
                            </span>
                          </div>
                        </div>
                      )}

                      {phase.isContinuous && (
                        <div>
                          <p className="text-[0.65rem] text-text-muted mb-2 font-medium">Structure de la séance</p>
                          <div className="flex gap-0.5 h-6 rounded-lg overflow-hidden">
                            <div className="bg-emerald-400 h-full flex-1 rounded-lg" title={`Course continue ${phase.runMin} min`} />
                          </div>
                          <span className="text-[0.55rem] text-text-muted flex items-center gap-1 mt-1">
                            <span className="w-2 h-2 rounded-sm bg-emerald-400" /> Course continue
                          </span>
                        </div>
                      )}

                      {/* Restrictions */}
                      {phase.restrictions.length > 0 && (
                        <div>
                          <p className="text-[0.65rem] text-text-muted mb-1.5 font-medium">Restrictions</p>
                          <div className="flex flex-wrap gap-1.5">
                            {phase.restrictions.map((r, i) => (
                              <span key={i} className="text-[0.6rem] font-medium px-2 py-1 rounded-full bg-slate-100 text-text-secondary">
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Critères de progression */}
                      <div>
                        <p className="text-[0.65rem] text-text-muted mb-1.5 font-medium">
                          Critères pour passer à la phase suivante
                        </p>
                        <div className="space-y-1.5">
                          {phase.progressionCriteria.map((c, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              <p className="text-xs text-text-secondary">{c}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Red flags */}
          <Card>
            <h4 className="text-sm font-semibold text-red-700 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Signaux d'alerte — Arrêt et réévaluation
            </h4>
            <div className="space-y-2">
              {protocol.redFlags.map((flag, i) => (
                <div key={i} className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-sm text-text-secondary">{flag}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Travail complémentaire */}
          <Card>
            <h4 className="text-sm font-semibold text-text-primary mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Travail complémentaire recommandé
            </h4>
            <div className="space-y-2">
              {protocol.complementary.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center text-[0.6rem] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-text-secondary">{c}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Règles générales */}
          <Card>
            <h4 className="text-sm font-semibold text-text-primary mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Règles générales du protocole
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {protocol.generalRules.map((rule, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                  <span className="text-primary-400 mt-0.5">•</span>
                  {rule}
                </div>
              ))}
            </div>
          </Card>

          {/* Références */}
          <p className="text-[0.6rem] text-text-muted text-center leading-relaxed px-4">
            Protocole basé sur : Warden et al. (2014), Silbernagel et al. (2020), Mascaro et al. (2023),
            Esculier et al. (2020), La Clinique du Coureur (2024), Gabbett (2016).
            Ce protocole est un guide. L'adaptation clinique individuelle reste indispensable.
          </p>
        </>
      )}

      {protocol?.error && (
        <Card>
          <p className="text-sm text-red-600 text-center py-4">{protocol.error}</p>
        </Card>
      )}
    </div>
  )
}

// ─── Sous-composants ────────────────────────────────────────────────────────

function SummaryMetric({ label, value }) {
  return (
    <div className="p-3 bg-slate-50 rounded-lg text-center">
      <p className="text-[0.6rem] text-text-muted uppercase tracking-wider font-medium">{label}</p>
      <p className="text-sm font-bold text-text-primary mt-0.5">{value}</p>
    </div>
  )
}

function MiniMetric({ label, value }) {
  return (
    <div className="px-2.5 py-2 bg-white border border-border/50 rounded-lg">
      <p className="text-[0.55rem] text-text-muted uppercase tracking-wider font-medium">{label}</p>
      <p className="text-xs font-semibold text-text-primary mt-0.5">{value}</p>
    </div>
  )
}
