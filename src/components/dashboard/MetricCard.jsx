const STATUS_COLORS = {
  green: 'border-l-risk-green bg-gradient-to-r from-emerald-50/50 to-transparent',
  yellow: 'border-l-risk-yellow bg-gradient-to-r from-amber-50/50 to-transparent',
  orange: 'border-l-risk-orange bg-gradient-to-r from-orange-50/50 to-transparent',
  red: 'border-l-risk-red bg-gradient-to-r from-red-50/50 to-transparent',
  neutral: 'border-l-slate-200',
}

export function MetricCard({ label, value, unit, status = 'neutral', detail }) {
  return (
    <div className={`bg-surface-card rounded-2xl border border-border/60 border-l-[3px] ${STATUS_COLORS[status]}
      p-4 shadow-sm shadow-black/[0.02] hover:shadow-md hover:shadow-black/[0.04] transition-all duration-300`}>
      <p
        className="text-[0.65rem] text-text-muted font-semibold uppercase tracking-wider"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {label}
      </p>
      <div className="flex items-baseline gap-1 mt-2">
        <span
          className="text-2xl font-extrabold text-text-primary tabular-nums"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {value}
        </span>
        {unit && <span className="text-xs text-text-muted font-medium">{unit}</span>}
      </div>
      {detail && <p className="text-[0.7rem] text-text-secondary mt-1.5 leading-relaxed">{detail}</p>}
    </div>
  )
}
