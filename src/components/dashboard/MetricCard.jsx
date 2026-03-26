import { useState } from 'react'

const STATUS_COLORS = {
  green: 'border-l-risk-green bg-gradient-to-r from-emerald-50/50 to-transparent',
  yellow: 'border-l-risk-yellow bg-gradient-to-r from-amber-50/50 to-transparent',
  orange: 'border-l-risk-orange bg-gradient-to-r from-orange-50/50 to-transparent',
  red: 'border-l-risk-red bg-gradient-to-r from-red-50/50 to-transparent',
  neutral: 'border-l-slate-200',
}

export function MetricCard({ label, value, unit, status = 'neutral', detail, tooltip }) {
  const [showTip, setShowTip] = useState(false)

  return (
    <div className={`bg-surface-card rounded-2xl border border-border/60 border-l-[3px] ${STATUS_COLORS[status]}
      p-4 shadow-sm shadow-black/[0.02] hover:shadow-md hover:shadow-black/[0.04] transition-all duration-300 relative`}>
      <div className="flex items-center gap-1.5">
        <p
          className="text-[0.65rem] text-text-muted font-semibold uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {label}
        </p>
        {tooltip && (
          <button
            type="button"
            className="text-text-muted/50 hover:text-text-secondary transition-colors"
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            onClick={() => setShowTip(!showTip)}
            aria-label={`Info ${label}`}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </button>
        )}
        {showTip && tooltip && (
          <div className="absolute z-50 left-2 right-2 bottom-full mb-1 p-2.5 bg-slate-800 text-white text-[0.65rem]
            rounded-lg shadow-xl leading-relaxed pointer-events-none">
            {tooltip}
            <div className="absolute left-4 top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-slate-800" />
          </div>
        )}
      </div>
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
