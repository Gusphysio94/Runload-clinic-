export function PlanSummaryBar({ plan }) {
  if (!plan) return null

  const { summary, weeks } = plan

  return (
    <div className="bg-surface-card border border-border rounded-xl p-5 shadow-sm">
      {/* Stats globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatItem label="Volume total" value={`${summary.totalVolume.toFixed(0)} km`} />
        <StatItem label="Durée totale" value={formatDuration(summary.totalDuration)} />
        <StatItem label="Séances" value={summary.totalSessions} />
        <StatItem
          label="Répartition"
          value={`${summary.lowIntensityPercent}% / ${100 - summary.lowIntensityPercent}%`}
          detail="basse / haute"
          highlight={summary.lowIntensityPercent >= 75 && summary.lowIntensityPercent <= 85}
        />
      </div>

      {/* Barres de progression par semaine */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Volume par semaine</p>
        <div className="flex items-end gap-3 h-16">
          {weeks.map((week) => {
            const maxVol = Math.max(...weeks.map(w => w.totalVolume))
            const heightPercent = maxVol > 0 ? (week.totalVolume / maxVol) * 100 : 0
            return (
              <div key={week.weekNumber} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[0.6rem] text-text-muted font-medium">
                  {week.totalVolume.toFixed(0)} km
                </span>
                <div className="w-full relative" style={{ height: '40px' }}>
                  <div
                    className={`absolute bottom-0 w-full rounded-t-md transition-all ${
                      week.isDeload
                        ? 'bg-primary-400/30 border border-primary-400/20'
                        : 'bg-gradient-to-t from-primary-600 to-primary-400'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className={`text-[0.6rem] font-medium ${week.isDeload ? 'text-primary-400' : 'text-text-secondary'}`}>
                  S{week.weekNumber}
                  {week.isDeload && ' ↓'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatItem({ label, value, detail, highlight }) {
  return (
    <div className="text-center">
      <p className="text-xs text-text-muted font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold mt-0.5 ${highlight ? 'text-green-400' : 'text-text-primary'}`}
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {value}
      </p>
      {detail && <p className="text-[0.6rem] text-text-muted">{detail}</p>}
    </div>
  )
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return `${h}h${m > 0 ? String(m).padStart(2, '0') : ''}`
}
