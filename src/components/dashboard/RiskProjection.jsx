import { Card } from '../ui/Card'
import { PLAN_SESSION_COLORS } from '../../constants'
import { projectNextSession } from '../../utils/riskProjection'

export function RiskProjection({ sessions, patient, trainingPlan }) {
  const projection = projectNextSession(sessions, patient, trainingPlan)

  if (!projection) return null

  const { nextSession, current, projected, delta } = projection
  const color = PLAN_SESSION_COLORS[nextSession.type] || '#6b7280'

  const sessionDate = nextSession.date instanceof Date
    ? nextSession.date
    : new Date(nextSession.date)
  const isToday = isSameDay(sessionDate, new Date())
  const dayLabel = isToday
    ? "Aujourd'hui"
    : sessionDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })

  const acwrDanger = projected.acwr !== null && projected.acwr > 1.5
  const acwrWarning = projected.acwr !== null && projected.acwr > 1.3
  const riskIncrease = delta.riskScore > 10
  const riskDanger = projected.riskScore >= 65

  return (
    <Card>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
              Projection prochaine séance
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {dayLabel} — {nextSession.label} · {nextSession.duration}' · ~{nextSession.estimatedDistance} km
            </p>
          </div>
        </div>

        {/* Projections */}
        <div className="grid grid-cols-3 gap-3">
          {/* ACWR */}
          <ProjectionMetric
            label="ACWR"
            current={current.acwr !== null ? current.acwr.toFixed(2) : '—'}
            projected={projected.acwr !== null ? projected.acwr.toFixed(2) : '—'}
            delta={delta.acwr !== null ? (delta.acwr >= 0 ? '+' : '') + delta.acwr.toFixed(2) : null}
            status={acwrDanger ? 'danger' : acwrWarning ? 'warning' : 'ok'}
          />

          {/* Risk score */}
          <ProjectionMetric
            label="Score risque"
            current={`${current.riskScore}`}
            projected={`${projected.riskScore}`}
            delta={(delta.riskScore >= 0 ? '+' : '') + delta.riskScore}
            status={riskDanger ? 'danger' : riskIncrease ? 'warning' : 'ok'}
          />

          {/* Volume */}
          <ProjectionMetric
            label="Volume semaine"
            current={`${current.weekVolume.toFixed(1)} km`}
            projected={`${projected.weekVolume.toFixed(1)} km`}
            delta={projected.volumeChange !== undefined
              ? (projected.volumeChange >= 0 ? '+' : '') + projected.volumeChange.toFixed(0) + '%'
              : null}
            status={Math.abs(projected.volumeChange || 0) > 15 ? 'danger'
              : Math.abs(projected.volumeChange || 0) > 10 ? 'warning' : 'ok'}
          />
        </div>

        {/* Avertissement si nécessaire */}
        {(acwrDanger || riskDanger) && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-xs text-red-700">
              <strong>Attention :</strong> cette séance risque de faire basculer les indicateurs en zone de danger.
              Envisager de réduire l'intensité ou la durée, ou de reporter.
            </p>
          </div>
        )}

        {(acwrWarning || riskIncrease) && !acwrDanger && !riskDanger && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-xs text-amber-700">
              <strong>Vigilance :</strong> les indicateurs restent acceptables mais approchent des seuils.
              Surveiller la récupération et les sensations.
            </p>
          </div>
        )}

        {!acwrWarning && !acwrDanger && !riskIncrease && !riskDanger && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-green-700">
              <strong>Feu vert :</strong> cette séance est cohérente avec la charge actuelle. Les indicateurs restent dans les zones optimales.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

function ProjectionMetric({ label, current, projected, delta, status }) {
  const statusColors = {
    ok: 'text-green-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
  }

  return (
    <div className="bg-surface-dark/30 rounded-xl p-3 text-center">
      <p className="text-[0.6rem] text-text-muted uppercase tracking-wider font-medium">{label}</p>
      <div className="mt-1.5">
        <span className="text-[0.65rem] text-text-muted">{current}</span>
        <span className="text-text-muted mx-1">→</span>
        <span className="text-sm font-bold text-text-primary">{projected}</span>
      </div>
      {delta && (
        <p className={`text-[0.65rem] font-semibold mt-0.5 ${statusColors[status] || 'text-text-muted'}`}>
          {delta}
        </p>
      )}
    </div>
  )
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate()
}
