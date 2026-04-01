import { useState } from 'react'
import { PLAN_SESSION_COLORS } from '../../constants'
import { getBestPaceDisplay, formatPace } from '../../utils/paceCalculator'

export function SessionDetailModal({
  session, zonePaces, completionData, linkedSession,
  allSessions, onMarkDone, onUnmark, onClose,
}) {
  const [showLinkPicker, setShowLinkPicker] = useState(false)
  if (!session) return null

  const color = PLAN_SESSION_COLORS[session.type] || '#6b7280'
  const isDone = !!completionData?.done

  // Sessions récentes triées par date (pour le linking)
  const recentSessions = [...(allSessions || [])]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-10 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                  {session.label}
                </h3>
                {isDone && (
                  <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-semibold bg-green-100 text-green-700">
                    Réalisée
                  </span>
                )}
              </div>
              <p className="text-sm text-text-secondary mt-0.5">
                {session.duration} min · ~{session.estimatedDistance} km · RPE {session.rpeTarget}/10
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <div className="px-6 py-4 border-b border-border">
          <p className="text-sm text-text-secondary">{session.description}</p>
        </div>

        {/* Comparaison prévu vs réalisé */}
        {isDone && linkedSession && (
          <div className="px-6 py-4 border-b border-border">
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Prévu vs Réalisé
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <CompareMetric
                label="Distance"
                planned={`${session.estimatedDistance} km`}
                actual={`${linkedSession.distance || '—'} km`}
                delta={linkedSession.distance
                  ? ((linkedSession.distance - session.estimatedDistance) / session.estimatedDistance * 100).toFixed(0)
                  : null}
              />
              <CompareMetric
                label="Durée"
                planned={`${session.duration} min`}
                actual={`${linkedSession.duration || '—'} min`}
                delta={linkedSession.duration
                  ? ((linkedSession.duration - session.duration) / session.duration * 100).toFixed(0)
                  : null}
              />
              <CompareMetric
                label="RPE"
                planned={`${session.rpeTarget}/10`}
                actual={linkedSession.rpe ? `${linkedSession.rpe}/10` : '—'}
                delta={linkedSession.rpe
                  ? ((linkedSession.rpe - session.rpeTarget) / session.rpeTarget * 100).toFixed(0)
                  : null}
              />
            </div>
          </div>
        )}

        {/* Structure détaillée */}
        <div className="px-6 py-4 space-y-3">
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Structure de la séance
          </h4>
          {session.details?.map((detail, i) => {
            const detailZonePace = zonePaces?.[detail.zone - 1]
            const paceInfo = getBestPaceDisplay(detailZonePace)

            return (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-1 rounded-full shrink-0 self-stretch min-h-[2.5rem]"
                  style={{ backgroundColor: detailZonePace?.color || '#6b7280' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {detail.phase}
                    </span>
                    <span className="text-xs text-text-muted">
                      {detail.duration} min · Z{detail.zone}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {detail.description}
                  </p>
                  {paceInfo && (
                    <p className="text-xs text-primary-400 mt-1 font-medium">
                      {paceInfo.label}
                      {paceInfo.detail && <span className="text-text-muted ml-1">({paceInfo.detail})</span>}
                    </p>
                  )}
                  {detail.intervals && (
                    <div className="mt-1 text-xs text-text-muted bg-surface-dark/50 rounded-lg px-3 py-2">
                      {detail.intervals.reps} × {detail.intervals.workDuration}s effort
                      {' / '}{detail.intervals.restDuration}s récup
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Toutes les métriques */}
        <div className="px-6 py-4 border-t border-border">
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Intensité cible — Zone {session.primaryZone}
          </h4>
          <AllMetrics zonePace={session.paces} />
        </div>

        {/* Actions complétion */}
        <div className="px-6 py-4 border-t border-border space-y-3">
          {isDone ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">
                  Marquée le {completionData?.completedAt ? new Date(completionData.completedAt).toLocaleDateString('fr-FR') : '—'}
                  {linkedSession && ` — liée à la séance du ${new Date(linkedSession.date).toLocaleDateString('fr-FR')}`}
                </span>
              </div>
              <button
                onClick={onUnmark}
                className="text-xs text-text-muted hover:text-red-500 transition-colors"
              >
                Annuler
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <button
                  onClick={() => onMarkDone(null)}
                  className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Marquer comme réalisée
                </button>
                {recentSessions.length > 0 && (
                  <button
                    onClick={() => setShowLinkPicker(!showLinkPicker)}
                    className="px-4 py-2.5 bg-surface-dark border border-border text-text-secondary text-sm font-medium rounded-xl
                      hover:text-text-primary hover:border-border/80 transition-all"
                    title="Lier à une séance existante"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.114-3.114a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.374" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Sélecteur de séance à lier */}
              {showLinkPicker && recentSessions.length > 0 && (
                <div className="bg-surface-dark/50 border border-border rounded-xl p-3 space-y-1.5">
                  <p className="text-xs text-text-muted font-medium mb-2">
                    Lier à une séance enregistrée :
                  </p>
                  {recentSessions.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { onMarkDone(s.id); setShowLinkPicker(false) }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left
                        hover:bg-white/[0.04] transition-colors border border-transparent hover:border-border/50"
                    >
                      <div>
                        <p className="text-xs font-medium text-text-primary">
                          {new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-[0.6rem] text-text-muted">
                          {s.distance || '?'} km · {s.duration || '?'} min
                          {s.rpe && ` · RPE ${s.rpe}`}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.114-3.114a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.374" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Composants internes ──────────────────────────────────────────────────

function CompareMetric({ label, planned, actual, delta }) {
  const numDelta = Number(delta)
  const deltaColor = !delta ? 'text-text-muted'
    : Math.abs(numDelta) <= 10 ? 'text-green-600'
    : Math.abs(numDelta) <= 20 ? 'text-amber-600'
    : 'text-red-600'

  return (
    <div className="bg-surface-dark/30 rounded-lg p-2.5 text-center">
      <p className="text-[0.6rem] text-text-muted uppercase tracking-wider font-medium">{label}</p>
      <div className="mt-1.5 space-y-0.5">
        <p className="text-[0.6rem] text-text-muted">Prévu : <span className="text-text-secondary font-medium">{planned}</span></p>
        <p className="text-[0.6rem] text-text-muted">Réel : <span className="text-text-primary font-semibold">{actual}</span></p>
        {delta && (
          <p className={`text-[0.65rem] font-semibold ${deltaColor}`}>
            {numDelta > 0 ? '+' : ''}{delta}%
          </p>
        )}
      </div>
    </div>
  )
}

function AllMetrics({ zonePace }) {
  if (!zonePace) {
    return <p className="text-xs text-text-muted">Aucune donnée physiologique renseignée dans le profil.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {zonePace.vma && (
        <MetricRow
          label="Allure (VMA)"
          value={`${formatPace(zonePace.vma.paceFast)} - ${formatPace(zonePace.vma.paceSlow)} /km`}
          detail={zonePace.ranges.vma}
        />
      )}
      {zonePace.vc && (
        <MetricRow
          label="Allure (VC)"
          value={`${formatPace(zonePace.vc.paceFast)} - ${formatPace(zonePace.vc.paceSlow)} /km`}
          detail={zonePace.ranges.vc}
        />
      )}
      {zonePace.fcmax && (
        <MetricRow
          label="Fréquence cardiaque"
          value={`${zonePace.fcmax.low} - ${zonePace.fcmax.high} bpm`}
          detail={zonePace.ranges.fcmax}
        />
      )}
      {!zonePace.vma && !zonePace.vc && !zonePace.fcmax && (
        <p className="text-xs text-text-muted">Renseignez VMA, VC ou FCmax dans le profil pour voir les allures.</p>
      )}
    </div>
  )
}

function MetricRow({ label, value, detail }) {
  return (
    <div className="flex items-center justify-between bg-surface-dark/30 rounded-lg px-3 py-2">
      <span className="text-xs text-text-secondary">{label}</span>
      <div className="text-right">
        <span className="text-sm font-semibold text-text-primary">{value}</span>
        {detail && <span className="text-xs text-text-muted ml-2">{detail}</span>}
      </div>
    </div>
  )
}
