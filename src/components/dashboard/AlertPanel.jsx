const ALERT_STYLES = {
  danger: {
    bg: 'bg-red-50/80 border-red-200/60',
    dot: 'bg-red-500',
    titleColor: 'text-red-800',
    textColor: 'text-red-700',
  },
  warning: {
    bg: 'bg-amber-50/80 border-amber-200/60',
    dot: 'bg-amber-500',
    titleColor: 'text-amber-800',
    textColor: 'text-amber-700',
  },
  info: {
    bg: 'bg-sky-50/80 border-sky-200/60',
    dot: 'bg-sky-500',
    titleColor: 'text-sky-800',
    textColor: 'text-sky-700',
  },
}

export function AlertPanel({ alerts }) {
  if (alerts.length === 0) {
    return (
      <div className="p-4 bg-emerald-50/60 border border-emerald-200/50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-sm text-emerald-700 font-medium">
            Aucune alerte — tous les indicateurs sont dans les normes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => {
        const style = ALERT_STYLES[alert.type] || ALERT_STYLES.info
        return (
          <div
            key={i}
            className={`p-3.5 rounded-xl border ${style.bg} animate-fade-in-up`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full ${style.dot} mt-1.5 shrink-0`} />
              <div>
                <p className={`text-sm font-semibold ${style.titleColor}`}>{alert.title}</p>
                <p className={`text-xs mt-0.5 ${style.textColor} leading-relaxed`}>{alert.message}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
