import { useRef } from 'react'
import {
  calcRiskScore, calcACWR, calcVolumeChange, calcMonotony,
  calcStrain, calcAvgWellness, calcAvgDecoupling,
  getSessionsInWindow, calcTotalVolume,
  generateAlerts, generateRecommendations,
} from '../../utils/calculations'

export function ExportReport({ patient, sessions, trainingPlan, onClose }) {
  const reportRef = useRef(null)

  const now = new Date()
  const risk = calcRiskScore(sessions, patient, now)
  const acwr = calcACWR(sessions, now, patient)
  const volumeChange = calcVolumeChange(sessions, now, patient)
  const monotony = calcMonotony(sessions, now)
  const strain = calcStrain(sessions, now)
  const wellness = calcAvgWellness(sessions, now)
  const decoupling = calcAvgDecoupling(sessions, now)
  const weekSessions = getSessionsInWindow(sessions, now, 7)
  const weekVolume = calcTotalVolume(weekSessions)
  const alerts = generateAlerts(sessions, patient, now)
  const recommendations = generateRecommendations(sessions, patient, now)

  const handlePrint = () => {
    const content = reportRef.current
    if (!content) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Bilan RunLoad Clinic — ${patient.firstName} ${patient.lastName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #1e293b;
            padding: 24px;
            font-size: 12px;
            line-height: 1.5;
          }
          .header {
            display: flex; justify-content: space-between; align-items: flex-start;
            border-bottom: 2px solid #ee7b18; padding-bottom: 16px; margin-bottom: 20px;
          }
          .header h1 { font-size: 22px; color: #ee7b18; font-weight: 700; }
          .header .subtitle { color: #64748b; font-size: 12px; margin-top: 2px; }
          .header .date { color: #94a3b8; font-size: 11px; text-align: right; }
          .section { margin-bottom: 20px; }
          .section h2 {
            font-size: 14px; font-weight: 700; color: #1e293b;
            border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 10px;
          }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
          .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; }
          .metric {
            background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
            padding: 10px; text-align: center;
          }
          .metric .label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
          .metric .value { font-size: 20px; font-weight: 700; color: #1e293b; margin-top: 2px; }
          .metric .unit { font-size: 12px; color: #94a3b8; }
          .metric .detail { font-size: 10px; color: #94a3b8; margin-top: 2px; }
          .risk-badge {
            display: inline-block; padding: 4px 12px; border-radius: 20px;
            font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;
          }
          .risk-green { background: #dcfce7; color: #166534; }
          .risk-yellow { background: #fef9c3; color: #854d0e; }
          .risk-orange { background: #ffedd5; color: #9a3412; }
          .risk-red { background: #fee2e2; color: #991b1b; }
          .alert { padding: 8px 12px; border-radius: 8px; margin-bottom: 6px; font-size: 12px; }
          .alert-danger { background: #fee2e2; border-left: 3px solid #ef4444; }
          .alert-warning { background: #fef9c3; border-left: 3px solid #f59e0b; }
          .alert-info { background: #e0f2fe; border-left: 3px solid #3b82f6; }
          .alert .title { font-weight: 600; }
          .rec-item { padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
          .rec-item:last-child { border-bottom: none; }
          .profile-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
          .profile-item .plabel { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
          .profile-item .pvalue { font-size: 13px; font-weight: 600; color: #1e293b; }
          .plan-week { margin-bottom: 12px; }
          .plan-week h3 { font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
          .plan-sessions { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
          .plan-session {
            background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;
            padding: 6px; font-size: 10px; min-height: 50px;
          }
          .plan-session .pstype { font-weight: 700; font-size: 10px; }
          .plan-session .psdur { color: #64748b; }
          .plan-rest { background: #fafafa; border: 1px solid #f1f5f9; border-radius: 6px; padding: 6px; min-height: 50px; color: #cbd5e1; font-size: 10px; text-align: center; display: flex; align-items: center; justify-content: center; }
          .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 10px; text-align: center; }
          @media print {
            body { padding: 12px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 300)
  }

  const riskColorClass = risk.level.color === 'green' ? 'risk-green'
    : risk.level.color === 'yellow' ? 'risk-yellow'
    : risk.level.color === 'orange' ? 'risk-orange'
    : 'risk-red'

  const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Aperçu du bilan</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
              Imprimer / PDF
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Report content */}
        <div ref={reportRef} className="p-8">
          {/* Header */}
          <div className="header">
            <div>
              <h1>RunLoad Clinic — Bilan Patient</h1>
              <div className="subtitle">{patient.firstName} {patient.lastName}</div>
            </div>
            <div className="date">
              <div>{dateStr}</div>
              <div>Généré par RunLoad Clinic</div>
            </div>
          </div>

          {/* Profil */}
          <div className="section">
            <h2>Profil patient</h2>
            <div className="profile-grid">
              <div className="profile-item"><div className="plabel">Objectif</div><div className="pvalue">{patient.objective || '—'}</div></div>
              <div className="profile-item"><div className="plabel">Niveau</div><div className="pvalue">{patient.level || '—'}</div></div>
              <div className="profile-item"><div className="plabel">Volume hebdo réf.</div><div className="pvalue">{patient.weeklyVolumeRef ? `${patient.weeklyVolumeRef} km` : '—'}</div></div>
              <div className="profile-item"><div className="plabel">VMA</div><div className="pvalue">{patient.vma ? `${patient.vma} km/h` : '—'}</div></div>
              <div className="profile-item"><div className="plabel">Vitesse critique</div><div className="pvalue">{patient.criticalSpeed ? `${patient.criticalSpeed} km/h` : '—'}</div></div>
              <div className="profile-item"><div className="plabel">FCmax</div><div className="pvalue">{patient.fcMax ? `${patient.fcMax} bpm` : '—'}</div></div>
            </div>
          </div>

          {/* Score de risque + métriques */}
          <div className="section">
            <h2>Score de risque</h2>
            <div className="grid-4">
              <div className="metric">
                <div className="label">Score global</div>
                <div className="value">{risk.score}/100</div>
                <div style={{ marginTop: '4px' }}>
                  <span className={`risk-badge ${riskColorClass}`}>{risk.level.label}</span>
                </div>
              </div>
              <div className="metric">
                <div className="label">ACWR</div>
                <div className="value">{acwr !== null ? acwr.toFixed(2) : '—'}</div>
                <div className="detail">Sweet spot : 0.8–1.3</div>
              </div>
              <div className="metric">
                <div className="label">Δ Volume</div>
                <div className="value">{volumeChange >= 0 ? '+' : ''}{volumeChange.toFixed(0)}%</div>
                <div className="detail">{weekVolume.toFixed(1)} km cette semaine</div>
              </div>
              <div className="metric">
                <div className="label">Bien-être</div>
                <div className="value">{wellness !== null ? `${wellness}%` : '—'}</div>
                <div className="detail">Composite Hooper</div>
              </div>
            </div>
            <div className="grid-4" style={{ marginTop: '8px' }}>
              <div className="metric">
                <div className="label">Monotonie</div>
                <div className="value">{monotony.toFixed(1)}</div>
                <div className="detail">Seuil : &lt; 2.0</div>
              </div>
              <div className="metric">
                <div className="label">Strain</div>
                <div className="value">{Math.round(strain)}<span className="unit"> UA</span></div>
              </div>
              <div className="metric">
                <div className="label">Découplage RPE</div>
                <div className="value">{decoupling !== null ? `${decoupling >= 0 ? '+' : ''}${decoupling.toFixed(0)}%` : '—'}</div>
              </div>
              <div className="metric">
                <div className="label">Séances/sem</div>
                <div className="value">{weekSessions.length}</div>
              </div>
            </div>
          </div>

          {/* Alertes */}
          {alerts.length > 0 && (
            <div className="section">
              <h2>Alertes ({alerts.length})</h2>
              {alerts.map((a, i) => (
                <div key={i} className={`alert alert-${a.type}`}>
                  <span className="title">{a.title}</span> — {a.message}
                </div>
              ))}
            </div>
          )}

          {/* Recommandations */}
          <div className="section">
            <h2>Recommandations</h2>
            {recommendations.map((r, i) => (
              <div key={i} className="rec-item">{i + 1}. {r}</div>
            ))}
          </div>

          {/* Plan d'entraînement */}
          {trainingPlan?.weeks && (
            <div className="section">
              <h2>Plan d&apos;entraînement ({trainingPlan.runsPerWeek} séances/sem)</h2>
              {trainingPlan.weeks.map(week => (
                <div key={week.weekNumber} className="plan-week">
                  <h3>
                    {week.label} — {week.totalVolume.toFixed(0)} km · {week.totalDuration} min
                    {week.isDeload ? ' (Décharge)' : ''}
                  </h3>
                  <div className="plan-sessions">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, di) => {
                      const s = week.sessions.find(sess => sess.dayOfWeek === di)
                      const isDone = trainingPlan.completedSessions?.[s?.id]?.done
                      if (!s) return <div key={di} className="plan-rest">{day}<br />Repos</div>
                      return (
                        <div key={di} className="plan-session" style={{ borderLeft: `3px solid ${s.paces?.color || '#6b7280'}` }}>
                          <div className="pstype">{isDone ? '✓ ' : ''}{s.label}</div>
                          <div className="psdur">{s.duration}' · ~{s.estimatedDistance}km</div>
                          <div className="psdur">Z{s.primaryZone}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="footer">
            RunLoad Clinic — Bilan généré le {dateStr} — Outil d&apos;aide à la décision clinique, ne remplace pas le jugement professionnel.
          </div>
        </div>
      </div>
    </div>
  )
}
