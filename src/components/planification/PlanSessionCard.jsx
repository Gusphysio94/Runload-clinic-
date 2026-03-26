import { PLAN_SESSION_COLORS } from '../../constants'
import { getBestPaceDisplay } from '../../utils/paceCalculator'

const SESSION_ICONS = {
  recup: (color) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke={color} strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  ),
  ef: (color) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke={color} strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c-1.5 2-3 4.5-3 4.5l1.5 3.5h3l1.5-3.5S13.5 14 12 12z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-1.5 1M15 20l1.5 1" />
    </svg>
  ),
  sl: (color) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke={color} strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l4-4 3 2 5-6 6 3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 7h4v4" />
    </svg>
  ),
  tempo: (color) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke={color} strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
  seuil: (color) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke={color} strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l3-8 4 16 3-8h4" />
    </svg>
  ),
  vma: (color) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke={color} strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  cotes: (color) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke={color} strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 20l5-8 4 4 5-10 4 6" />
    </svg>
  ),
  ppg: (color) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke={color} strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.008v.008H6.75V6.75zM6.75 12h.008v.008H6.75V12zm0 5.25h.008v.008H6.75v-.008zM17.25 6.75h.008v.008h-.008V6.75zm0 5.25h.008v.008h-.008V12zm0 5.25h.008v.008h-.008v-.008zM12 6.75h.008v.008H12V6.75zM12 12h.008v.008H12V12zm0 5.25h.008v.008H12v-.008z" />
    </svg>
  ),
}

export function PlanSessionCard({ session, onClick, isCompleted }) {
  const color = PLAN_SESSION_COLORS[session.type] || '#6b7280'
  const paceDisplay = getBestPaceDisplay(session.paces)
  const IconFn = SESSION_ICONS[session.type]

  return (
    <button
      onClick={() => onClick?.(session)}
      className={`w-full text-left rounded-lg border p-2.5 hover:shadow-sm transition-all duration-200 cursor-pointer group relative
        ${isCompleted
          ? 'bg-green-50/50 border-green-200/50 hover:border-green-300/60'
          : 'bg-surface-card border-border hover:border-primary-500/30'
        }`}
      style={{ borderLeftWidth: '3px', borderLeftColor: color }}
    >
      {/* Checkmark badge */}
      {isCompleted && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      )}

      {/* Icon + Type + durée */}
      <div className="flex items-start gap-2">
        {IconFn && (
          <div className={`shrink-0 mt-0.5 transition-opacity ${isCompleted ? 'opacity-60' : 'opacity-70 group-hover:opacity-100'}`}>
            {IconFn(color)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className={`text-xs font-semibold leading-tight ${isCompleted ? 'text-green-800' : 'text-text-primary'}`} style={{ fontFamily: 'var(--font-heading)' }}>
              {session.label}
            </p>
            <span className="text-[0.65rem] text-text-muted whitespace-nowrap font-medium">
              {session.duration}'
            </span>
          </div>

          {/* Zone cible */}
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: session.paces?.color || color }}
            />
            <span className="text-[0.65rem] text-text-secondary">
              Z{session.primaryZone}
            </span>
          </div>
        </div>
      </div>

      {/* Intensité */}
      {paceDisplay && (
        <div className="mt-1.5">
          <p className="text-[0.65rem] font-medium text-primary-400 leading-tight">
            {paceDisplay.label}
          </p>
          {paceDisplay.detail && (
            <p className="text-[0.6rem] text-text-muted mt-0.5">
              {paceDisplay.detail}
            </p>
          )}
        </div>
      )}

      {/* Distance estimée */}
      <p className="text-[0.6rem] text-text-muted mt-1">
        ~{session.estimatedDistance} km
      </p>
    </button>
  )
}
