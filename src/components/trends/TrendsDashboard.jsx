import { useState, useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart,
  Legend,
} from 'recharts'
import { Card } from '../ui/Card'
import { getWeeklyHistory } from '../../utils/calculations'

const PERIOD_OPTIONS = [
  { value: 4, label: '4 sem.' },
  { value: 8, label: '8 sem.' },
  { value: 12, label: '12 sem.' },
]

const COLORS = {
  primary: '#ee7b18',
  accent: '#14b8a6',
  green: '#10b981',
  red: '#ef4444',
  yellow: '#f59e0b',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  grid: '#f1f5f9',
  border: '#e2e8f0',
}

const tooltipStyle = {
  borderRadius: '12px',
  border: `1px solid ${COLORS.border}`,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '13px',
}

const AXIS_TICK = { fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }

export function TrendsDashboard({ patient, sessions }) {
  const [weeks, setWeeks] = useState(8)

  const history = useMemo(
    () => patient ? getWeeklyHistory(sessions, patient, weeks) : [],
    [sessions, patient, weeks]
  )

  // Calcul des tendances (comparaison semaine courante vs précédente)
  const trends = useMemo(() => {
    if (history.length < 2) return null
    const curr = history[history.length - 1]
    const prev = history[history.length - 2]
    return {
      volume: curr.volume && prev.volume ? ((curr.volume - prev.volume) / (prev.volume || 1) * 100) : null,
      load: curr.load && prev.load ? ((curr.load - prev.load) / (prev.load || 1) * 100) : null,
      wellness: curr.wellness !== null && prev.wellness !== null ? curr.wellness - prev.wellness : null,
      riskScore: curr.riskScore - prev.riskScore,
    }
  }, [history])

  if (!patient) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">Tendances</h2>
        <Card>
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Aucun patient actif</h3>
            <p className="text-text-secondary text-sm max-w-md mx-auto">
              Sélectionnez ou créez un patient pour afficher les courbes de tendance.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  const hasData = sessions.length > 0
  const hasEnoughData = sessions.length >= 2

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
            Tendances
          </h2>
          <p className="text-text-secondary text-sm mt-1 truncate">
            Visualisez l'évolution de la charge, du bien-être et des indicateurs sur plusieurs semaines.
          </p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-1 bg-surface-dark/50 rounded-xl p-1 border border-border/40">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setWeeks(opt.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                weeks === opt.value
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <Card>
          <p className="text-center text-text-muted py-12 text-sm">
            Aucune séance enregistrée. Les courbes apparaîtront après les premières séances.
          </p>
        </Card>
      ) : (
        <>
          {/* Résumé tendances */}
          {trends && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <TrendBadge label="Volume" value={trends.volume} unit="%" format="delta" />
              <TrendBadge label="Charge" value={trends.load} unit="%" format="delta" />
              <TrendBadge label="Bien-être" value={trends.wellness} unit="pts" format="delta" inverted />
              <TrendBadge label="Risque" value={trends.riskScore} unit="pts" format="delta" />
            </div>
          )}

          {/* Charge & Volume combiné */}
          <Card title="Charge & Volume" subtitle="Barres = volume (km), ligne = charge (UA)">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                <XAxis dataKey="week" tick={AXIS_TICK} axisLine={{ stroke: COLORS.border }} tickLine={false} />
                <YAxis yAxisId="vol" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis yAxisId="load" orientation="right" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'DM Sans' }} />
                <Bar
                  yAxisId="vol"
                  dataKey="volume"
                  fill={COLORS.primary}
                  fillOpacity={0.7}
                  radius={[4, 4, 0, 0]}
                  name="Volume (km)"
                />
                <Line
                  yAxisId="load"
                  type="monotone"
                  dataKey="load"
                  stroke={COLORS.accent}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: COLORS.accent, strokeWidth: 2, stroke: 'white' }}
                  connectNulls
                  name="Charge (UA)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          {/* ACWR avec zone sweet spot */}
          <Card title="ACWR" subtitle="Zone verte = sweet spot (0.8–1.3)">
            {!hasEnoughData ? (
              <p className="text-center text-text-muted py-8 text-sm">
                Minimum 2 semaines de données nécessaires.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                  <XAxis dataKey="week" tick={AXIS_TICK} axisLine={{ stroke: COLORS.border }} tickLine={false} />
                  <YAxis domain={[0, 'auto']} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, 'ACWR']} />
                  {/* Sweet spot zone */}
                  <ReferenceLine y={0.8} stroke={COLORS.green} strokeDasharray="5 5" strokeOpacity={0.5} />
                  <ReferenceLine y={1.3} stroke={COLORS.green} strokeDasharray="5 5" strokeOpacity={0.5} />
                  <ReferenceLine y={1.5} stroke={COLORS.red} strokeDasharray="5 5" strokeOpacity={0.5} label={{ value: 'Danger', fontSize: 10, fill: COLORS.red }} />
                  <Area
                    type="monotone"
                    dataKey="acwr"
                    fill={COLORS.primary}
                    fillOpacity={0.08}
                    stroke={COLORS.primary}
                    strokeWidth={2.5}
                    connectNulls
                    dot={{ r: 4, fill: COLORS.primary, strokeWidth: 2, stroke: 'white' }}
                    activeDot={{ r: 6, fill: COLORS.primary, strokeWidth: 2, stroke: 'white' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Bien-être décomposé */}
          <Card title="Composantes du bien-être" subtitle="Fatigue & douleur : plus bas = mieux. Sommeil & humeur : plus haut = mieux.">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                <XAxis dataKey="week" tick={AXIS_TICK} axisLine={{ stroke: COLORS.border }} tickLine={false} />
                <YAxis domain={[0, 'auto']} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => {
                    const labels = {
                      fatigue: 'Fatigue (1-10)',
                      sleep: 'Sommeil (1-5)',
                      stress: 'Stress (1-5)',
                      mood: 'Humeur (1-5)',
                      pain: 'Douleur (0-10)',
                    }
                    return [value, labels[name] || name]
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'DM Sans' }} />
                <Line type="monotone" dataKey="fatigue" stroke={COLORS.red} strokeWidth={2} dot={{ r: 3 }} connectNulls name="Fatigue" />
                <Line type="monotone" dataKey="sleep" stroke={COLORS.blue} strokeWidth={2} dot={{ r: 3 }} connectNulls name="Sommeil" />
                <Line type="monotone" dataKey="stress" stroke={COLORS.yellow} strokeWidth={2} dot={{ r: 3 }} connectNulls name="Stress" />
                <Line type="monotone" dataKey="mood" stroke={COLORS.green} strokeWidth={2} dot={{ r: 3 }} connectNulls name="Humeur" />
                <Line type="monotone" dataKey="pain" stroke={COLORS.purple} strokeWidth={2} dot={{ r: 3 }} connectNulls name="Douleur" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* RPE vs Charge — détection surmenage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="RPE moyen" subtitle="Effort perçu par semaine (Borg CR-10)">
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                  <XAxis dataKey="week" tick={AXIS_TICK} axisLine={{ stroke: COLORS.border }} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, 'RPE moyen']} />
                  <ReferenceLine y={7} stroke={COLORS.yellow} strokeDasharray="3 3" strokeOpacity={0.5} />
                  <Area
                    type="monotone"
                    dataKey="avgRpe"
                    fill={COLORS.pink}
                    fillOpacity={0.1}
                    stroke={COLORS.pink}
                    strokeWidth={2}
                    dot={{ r: 3, fill: COLORS.pink, strokeWidth: 2, stroke: 'white' }}
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Monotonie & Strain" subtitle="Monotonie > 2.0 = alerte">
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                  <XAxis dataKey="week" tick={AXIS_TICK} axisLine={{ stroke: COLORS.border }} tickLine={false} />
                  <YAxis yAxisId="mono" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="strain" orientation="right" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'DM Sans' }} />
                  <ReferenceLine yAxisId="mono" y={2.0} stroke={COLORS.red} strokeDasharray="3 3" strokeOpacity={0.5} />
                  <Line
                    yAxisId="mono"
                    type="monotone"
                    dataKey="monotony"
                    stroke={COLORS.yellow}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                    name="Monotonie"
                  />
                  <Bar
                    yAxisId="strain"
                    dataKey="strain"
                    fill={COLORS.purple}
                    fillOpacity={0.5}
                    radius={[4, 4, 0, 0]}
                    name="Strain (UA)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Score de risque + bien-être overlay */}
          <Card title="Risque vs Bien-être" subtitle="Divergence = signal d'alerte (charge en hausse + bien-être en baisse)">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                <XAxis dataKey="week" tick={AXIS_TICK} axisLine={{ stroke: COLORS.border }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'DM Sans' }} />
                <ReferenceLine y={25} stroke={COLORS.green} strokeDasharray="3 3" strokeOpacity={0.3} />
                <ReferenceLine y={45} stroke={COLORS.yellow} strokeDasharray="3 3" strokeOpacity={0.3} />
                <ReferenceLine y={65} stroke={COLORS.red} strokeDasharray="3 3" strokeOpacity={0.3} />
                <Area
                  type="monotone"
                  dataKey="riskScore"
                  fill={COLORS.red}
                  fillOpacity={0.08}
                  stroke={COLORS.red}
                  strokeWidth={2}
                  dot={{ r: 3, fill: COLORS.red, strokeWidth: 2, stroke: 'white' }}
                  connectNulls
                  name="Score de risque"
                />
                <Line
                  type="monotone"
                  dataKey="wellness"
                  stroke={COLORS.accent}
                  strokeWidth={2}
                  dot={{ r: 3, fill: COLORS.accent, strokeWidth: 2, stroke: 'white' }}
                  connectNulls
                  name="Bien-être (%)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          {/* Séances par semaine */}
          <Card title="Fréquence d'entraînement" subtitle="Nombre de séances par semaine">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                <XAxis dataKey="week" tick={AXIS_TICK} axisLine={{ stroke: COLORS.border }} tickLine={false} />
                <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, 'Séances']} />
                <Bar dataKey="sessions" fill={COLORS.blue} fillOpacity={0.7} radius={[4, 4, 0, 0]} name="Séances" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  )
}

// ─── Composant badge de tendance ──────────────────────────────────────────────

function TrendBadge({ label, value, unit, inverted = false }) {
  if (value === null || value === undefined) {
    return (
      <div className="bg-surface-card rounded-xl border border-border/60 px-4 py-3">
        <p className="text-[0.65rem] font-semibold text-text-muted uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-text-muted mt-0.5">—</p>
      </div>
    )
  }

  // Pour le bien-être, une hausse est positive ; pour les autres, une baisse est positive
  const isPositive = inverted ? value > 0 : value < 0
  const isNeutral = Math.abs(value) < 1

  const color = isNeutral ? 'text-text-muted' : isPositive ? 'text-green-500' : 'text-red-500'
  const bgColor = isNeutral ? 'bg-surface-dark/30' : isPositive ? 'bg-green-50 border-green-200/50' : 'bg-red-50 border-red-200/50'
  const arrow = value > 0 ? '\u2191' : value < 0 ? '\u2193' : '\u2192'

  return (
    <div className={`rounded-xl border border-border/60 px-4 py-3 ${bgColor}`}>
      <p className="text-[0.65rem] font-semibold text-text-muted uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-bold mt-0.5 ${color}`} style={{ fontFamily: 'var(--font-heading)' }}>
        {arrow} {Math.abs(value).toFixed(0)}{unit}
      </p>
      <p className="text-[0.6rem] text-text-muted mt-0.5">vs semaine préc.</p>
    </div>
  )
}
