import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart,
} from 'recharts'
import { Card } from '../ui/Card'
import { RiskGauge } from './RiskGauge'
import { AlertPanel } from './AlertPanel'
import { MetricCard } from './MetricCard'
import { ExportReport } from './ExportReport'
import { RiskProjection } from './RiskProjection'
import {
  calcRiskScore,
  calcACWR,
  calcVolumeChange,
  calcMonotony,
  calcStrain,
  calcAvgWellness,
  calcAvgDecoupling,
  calcTotalVolume,
  getSessionsInWindow,
  generateAlerts,
  generateRecommendations,
  getWeeklyHistory,
} from '../../utils/calculations'

const CHART_COLORS = {
  primary: '#ee7b18',
  accent: '#14b8a6',
  green: '#10b981',
  red: '#ef4444',
  yellow: '#f59e0b',
  grid: '#f1f5f9',
  border: '#e2e8f0',
}

const tooltipStyle = {
  borderRadius: '12px',
  border: `1px solid ${CHART_COLORS.border}`,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '13px',
}

function getACWRStatus(val) {
  if (val === null) return 'neutral'
  if (val >= 0.8 && val <= 1.3) return 'green'
  if (val <= 1.5) return 'yellow'
  return 'red'
}

function getVolumeStatus(val) {
  const abs = Math.abs(val)
  if (abs <= 10) return 'green'
  if (abs <= 15) return 'yellow'
  return 'red'
}

function getMonotonyStatus(val) {
  if (val < 1.5) return 'green'
  if (val <= 2.0) return 'yellow'
  return 'red'
}

function getWellnessStatus(val) {
  if (val === null) return 'neutral'
  if (val >= 70) return 'green'
  if (val >= 50) return 'yellow'
  return 'red'
}

export function Dashboard({ patient, sessions, trainingPlan }) {
  const [showExport, setShowExport] = useState(false)

  if (!patient) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Tableau de bord</h2>
        <Card>
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2 tracking-tight">Bienvenue sur RunLoad Clinic</h3>
            <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
              Commencez par créer le profil de votre patient pour débuter le suivi de la charge d'entraînement.
            </p>
          </div>
        </Card>
      </div>
    )
  }

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
  const history = getWeeklyHistory(sessions, patient, 8)

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">Tableau de bord</h2>
          <p className="text-text-secondary text-sm mt-1 truncate">
            Synthèse hebdomadaire de la charge, du risque et du bien-être de {patient.firstName}.
          </p>
        </div>
        <button
          onClick={() => setShowExport(true)}
          className="inline-flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-text-secondary
            bg-surface-card border border-border rounded-xl hover:text-text-primary hover:border-border/80
            transition-all duration-200 shrink-0"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
          </svg>
          <span className="hidden sm:inline">Exporter le bilan</span>
        </button>
      </div>

      {/* Modal export */}
      {showExport && (
        <ExportReport
          patient={patient}
          sessions={sessions}
          trainingPlan={trainingPlan}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* Jauge + Alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Score de risque">
          <RiskGauge score={risk.score} level={risk.level} />
        </Card>
        <div className="lg:col-span-2">
          <Card title={`Alertes (${alerts.length})`}>
            <AlertPanel alerts={alerts} />
          </Card>
        </div>
      </div>

      {/* Métriques clés */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        <MetricCard
          label="ACWR"
          value={acwr !== null ? acwr.toFixed(2) : '—'}
          status={getACWRStatus(acwr)}
          detail="Sweet spot : 0.8–1.3"
        />
        <MetricCard
          label="Δ Volume"
          value={`${volumeChange >= 0 ? '+' : ''}${volumeChange.toFixed(0)}`}
          unit="%"
          status={getVolumeStatus(volumeChange)}
          detail={`${weekVolume.toFixed(1)} km cette semaine`}
        />
        <MetricCard
          label="Monotonie"
          value={monotony.toFixed(1)}
          status={getMonotonyStatus(monotony)}
          detail="Seuil : < 2.0"
        />
        <MetricCard
          label="Bien-être"
          value={wellness !== null ? wellness : '—'}
          unit="%"
          status={getWellnessStatus(wellness)}
          detail="Composite Hooper"
        />
      </div>

      {/* Métriques secondaires */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        <MetricCard
          label="Strain"
          value={Math.round(strain)}
          unit="UA"
          status="neutral"
          detail="Charge × Monotonie"
        />
        <MetricCard
          label="Séances/semaine"
          value={weekSessions.length}
          status="neutral"
        />
        <MetricCard
          label="Découplage RPE"
          value={decoupling !== null ? `${decoupling >= 0 ? '+' : ''}${decoupling.toFixed(0)}` : '—'}
          unit="%"
          status={decoupling !== null && Math.abs(decoupling) > 20 ? 'orange' : 'neutral'}
          detail="RPE vs Zones"
        />
        <MetricCard
          label="Multiplicateur blessure"
          value={`×${risk.components.injury.value.toFixed(1)}`}
          status={risk.components.injury.value > 1.2 ? 'orange' : 'neutral'}
          detail="Pondération historique"
        />
      </div>

      {/* Projection prochaine séance */}
      {trainingPlan && (
        <RiskProjection
          sessions={sessions}
          patient={patient}
          trainingPlan={trainingPlan}
        />
      )}

      {/* Graphique ACWR */}
      <Card title="Évolution ACWR (8 semaines)">
        {sessions.length < 2 ? (
          <p className="text-center text-text-muted py-8 text-sm">
            Minimum 2 semaines de données nécessaires pour afficher l'évolution.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }}
                axisLine={{ stroke: CHART_COLORS.border }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 'auto']}
                tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => {
                  const labels = { acwr: 'ACWR', riskScore: 'Score risque' }
                  return [value, labels[name] || name]
                }}
              />
              <ReferenceLine y={0.8} stroke={CHART_COLORS.green} strokeDasharray="5 5" strokeOpacity={0.6} label={{ value: '0.8', fontSize: 10, fill: '#94a3b8' }} />
              <ReferenceLine y={1.3} stroke={CHART_COLORS.green} strokeDasharray="5 5" strokeOpacity={0.6} label={{ value: '1.3', fontSize: 10, fill: '#94a3b8' }} />
              <ReferenceLine y={1.5} stroke={CHART_COLORS.red} strokeDasharray="5 5" strokeOpacity={0.6} label={{ value: '1.5', fontSize: 10, fill: '#94a3b8' }} />
              <Line
                type="monotone"
                dataKey="acwr"
                stroke={CHART_COLORS.primary}
                strokeWidth={2.5}
                dot={{ r: 4, fill: CHART_COLORS.primary, strokeWidth: 2, stroke: 'white' }}
                activeDot={{ r: 6, fill: CHART_COLORS.primary, strokeWidth: 2, stroke: 'white' }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Graphiques Volume + Charge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Volume hebdomadaire (km)">
          {sessions.length === 0 ? (
            <p className="text-center text-text-muted py-8 text-sm">Aucune donnée</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }}
                  axisLine={{ stroke: CHART_COLORS.border }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="volume"
                  fill={CHART_COLORS.primary}
                  radius={[6, 6, 0, 0]}
                  name="Volume (km)"
                  fillOpacity={0.85}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Bien-être (%)">
          {sessions.length === 0 ? (
            <p className="text-center text-text-muted py-8 text-sm">Aucune donnée</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }}
                  axisLine={{ stroke: CHART_COLORS.border }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <ReferenceLine y={70} stroke={CHART_COLORS.green} strokeDasharray="3 3" strokeOpacity={0.5} />
                <ReferenceLine y={50} stroke={CHART_COLORS.yellow} strokeDasharray="3 3" strokeOpacity={0.5} />
                <Area
                  type="monotone"
                  dataKey="wellness"
                  fill={CHART_COLORS.accent}
                  fillOpacity={0.1}
                  stroke={CHART_COLORS.accent}
                  strokeWidth={2}
                  connectNulls
                  name="Bien-être (%)"
                  dot={{ r: 3, fill: CHART_COLORS.accent, strokeWidth: 2, stroke: 'white' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Score de risque évolution */}
      <Card title="Évolution du score de risque">
        {sessions.length === 0 ? (
          <p className="text-center text-text-muted py-8 text-sm">Aucune donnée</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }}
                axisLine={{ stroke: CHART_COLORS.border }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={25} stroke={CHART_COLORS.green} strokeDasharray="3 3" strokeOpacity={0.4} />
              <ReferenceLine y={45} stroke={CHART_COLORS.yellow} strokeDasharray="3 3" strokeOpacity={0.4} />
              <ReferenceLine y={65} stroke={CHART_COLORS.red} strokeDasharray="3 3" strokeOpacity={0.4} />
              <Area
                type="monotone"
                dataKey="riskScore"
                fill={CHART_COLORS.primary}
                fillOpacity={0.1}
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                connectNulls
                name="Score de risque"
                dot={{ r: 3, fill: CHART_COLORS.primary, strokeWidth: 2, stroke: 'white' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Recommandations */}
      <Card title="Recommandations">
        <ul className="space-y-3">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-text-secondary leading-relaxed">
              <span className="shrink-0 w-5 h-5 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center text-[0.65rem] font-bold mt-0.5"
                style={{ fontFamily: 'var(--font-heading)' }}>
                {i + 1}
              </span>
              {rec}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
