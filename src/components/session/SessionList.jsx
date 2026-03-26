import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { SESSION_TYPES, SURFACES } from '../../constants'

export function SessionList({ sessions, onEdit, onDelete }) {
  const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date))

  if (sorted.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <p className="text-text-muted text-sm">
            Aucune séance enregistrée. Ajoutez la première séance pour commencer le suivi.
          </p>
        </div>
      </Card>
    )
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  const getRPEColor = (rpe) => {
    if (rpe <= 3) return 'text-risk-green'
    if (rpe <= 5) return 'text-risk-yellow'
    if (rpe <= 7) return 'text-risk-orange'
    return 'text-risk-red'
  }

  const getRPEBg = (rpe) => {
    if (rpe <= 3) return 'bg-emerald-50'
    if (rpe <= 5) return 'bg-amber-50'
    if (rpe <= 7) return 'bg-orange-50'
    return 'bg-red-50'
  }

  return (
    <div className="space-y-2 stagger-children">
      {sorted.map(session => {
        const typeLabel = SESSION_TYPES.find(t => t.value === session.sessionType)?.label || session.sessionType
        const surfaceLabel = SURFACES.find(s => s.value === session.surface)?.label || ''

        return (
          <div
            key={session.id}
            className="flex items-center gap-4 p-4 bg-surface-card rounded-2xl border border-border/60
              hover:shadow-md hover:shadow-black/[0.04] hover:border-border transition-all duration-200"
          >
            {/* Date */}
            <div className="w-20 shrink-0 text-center">
              <span className="text-sm font-semibold text-text-primary block" style={{ fontFamily: 'var(--font-heading)' }}>
                {formatDate(session.date)}
              </span>
            </div>

            {/* Type & Surface */}
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-text-primary">{typeLabel}</span>
              {surfaceLabel && (
                <span className="text-xs text-text-muted ml-2">{surfaceLabel}</span>
              )}
              {session.contextualFactors?.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-amber-100/80 text-amber-700 text-xs rounded-md font-medium">
                  {session.contextualFactors.length} facteur(s)
                </span>
              )}
            </div>

            {/* Métriques */}
            <div className="flex items-center gap-4 text-sm shrink-0">
              <div className="text-center">
                <span className="text-text-muted block text-[0.65rem] uppercase tracking-wide font-medium">Dist.</span>
                <span className="font-semibold tabular-nums" style={{ fontFamily: 'var(--font-heading)' }}>{session.distance} km</span>
              </div>
              <div className="text-center">
                <span className="text-text-muted block text-[0.65rem] uppercase tracking-wide font-medium">Durée</span>
                <span className="font-semibold tabular-nums" style={{ fontFamily: 'var(--font-heading)' }}>{session.duration} min</span>
              </div>
              {session.elevationGain > 0 && (
                <div className="text-center">
                  <span className="text-text-muted block text-[0.65rem] uppercase tracking-wide font-medium">D+</span>
                  <span className="font-semibold tabular-nums" style={{ fontFamily: 'var(--font-heading)' }}>{session.elevationGain} m</span>
                </div>
              )}
              <div className={`text-center px-2.5 py-1.5 rounded-lg ${getRPEBg(session.rpe)}`}>
                <span className="text-text-muted block text-[0.65rem] uppercase tracking-wide font-medium">RPE</span>
                <span className={`font-bold tabular-nums ${getRPEColor(session.rpe)}`} style={{ fontFamily: 'var(--font-heading)' }}>{session.rpe}/10</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => onEdit(session)}>Modifier</Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(session.id)}>Suppr.</Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
