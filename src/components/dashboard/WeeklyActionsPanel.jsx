import { Card } from '../ui/Card'

export function WeeklyActionsPanel({ risk, acwr, volumeChange, wellness, weekSessions, recommendations, onNavigate }) {
  const actions = generateActions(risk, acwr, volumeChange, wellness, weekSessions, recommendations)

  if (actions.length === 0) return null

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-6 rounded-full bg-primary-500" />
        <h3 className="text-sm font-semibold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
          Cette semaine
        </h3>
      </div>
      <div className="space-y-2">
        {actions.map((action, i) => (
          <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border ${
            action.severity === 'danger' ? 'bg-red-50/50 border-red-200/50' :
            action.severity === 'warning' ? 'bg-amber-50/50 border-amber-200/50' :
            action.severity === 'success' ? 'bg-emerald-50/50 border-emerald-200/50' :
            'bg-surface-dark/20 border-border/30'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              action.severity === 'danger' ? 'bg-red-100 text-red-600' :
              action.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
              action.severity === 'success' ? 'bg-emerald-100 text-emerald-600' :
              'bg-slate-100 text-slate-500'
            }`}>
              {action.severity === 'success' ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary">{action.message}</p>
              {action.detail && <p className="text-[0.65rem] text-text-muted mt-0.5">{action.detail}</p>}
            </div>
            {action.actionLabel && onNavigate && (
              <button
                onClick={() => onNavigate(action.actionTarget)}
                className="text-[0.65rem] font-semibold text-primary-500 hover:text-primary-600 whitespace-nowrap shrink-0 px-2 py-1 rounded-lg hover:bg-primary-50 transition-colors"
              >
                {action.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

function generateActions(risk, acwr, volumeChange, wellness, weekSessions, _recommendations) {
  const actions = []

  // Risk-based actions
  if (risk.score >= 65) {
    actions.push({
      severity: 'danger',
      message: 'Score de risque critique — réduire la charge immédiatement.',
      detail: `Score actuel : ${risk.score}/100. Privilégier les séances de récupération active.`,
      actionLabel: 'Voir le plan',
      actionTarget: 'planification',
    })
  } else if (risk.score >= 45) {
    actions.push({
      severity: 'warning',
      message: 'Risque élevé — modérer l\'intensité cette semaine.',
      detail: `Score : ${risk.score}/100. Réduire le volume de 10-15% et éviter les séances intenses.`,
      actionLabel: 'Ajuster le plan',
      actionTarget: 'planification',
    })
  }

  // ACWR
  if (acwr !== null && acwr > 1.5) {
    actions.push({
      severity: 'danger',
      message: `ACWR à ${acwr.toFixed(2)} — pic de charge détecté.`,
      detail: 'La charge aiguë est très supérieure à la charge chronique. Risque de blessure augmenté.',
      actionLabel: 'Voir tendances',
      actionTarget: 'trends',
    })
  } else if (acwr !== null && acwr > 1.3) {
    actions.push({
      severity: 'warning',
      message: `ACWR à ${acwr.toFixed(2)} — charge en augmentation rapide.`,
      detail: 'Approche du seuil de risque. Maintenir ou réduire légèrement le volume.',
    })
  }

  // Volume change
  if (Math.abs(volumeChange) > 15) {
    const direction = volumeChange > 0 ? 'augmentation' : 'diminution'
    actions.push({
      severity: 'warning',
      message: `${direction.charAt(0).toUpperCase() + direction.slice(1)} de volume de ${Math.abs(volumeChange).toFixed(0)}% vs semaine précédente.`,
      detail: volumeChange > 0 ? 'Progression > 10%/semaine recommandée.' : 'Baisse importante pouvant affecter la charge chronique.',
    })
  }

  // Wellness
  if (wellness !== null && wellness < 50) {
    actions.push({
      severity: 'warning',
      message: 'Bien-être dégradé — prioriser la récupération.',
      detail: `Score bien-être : ${wellness}%. Évaluer fatigue, sommeil et stress avant la prochaine séance.`,
      actionLabel: 'Nouvelle séance',
      actionTarget: 'session',
    })
  }

  // No sessions this week
  if (weekSessions.length === 0) {
    actions.push({
      severity: 'info',
      message: 'Aucune séance enregistrée cette semaine.',
      detail: 'Pensez à enregistrer les séances pour un suivi précis de la charge.',
      actionLabel: 'Ajouter une séance',
      actionTarget: 'session',
    })
  }

  // All good
  if (actions.length === 0) {
    actions.push({
      severity: 'success',
      message: 'Charge optimale cette semaine.',
      detail: 'Tous les indicateurs sont dans les zones vertes. Continuez sur cette lancée.',
    })
  }

  return actions.slice(0, 3)
}
