import { useState } from 'react'
import {
  ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { FormField, Input } from '../ui/FormField'
import { analyzeLactateTest } from '../../utils/lactateTest'

const DEFAULT_STAGES = [
  { speed: '8', lactate: '', hr: '', rpe: '' },
  { speed: '9', lactate: '', hr: '', rpe: '' },
  { speed: '10', lactate: '', hr: '', rpe: '' },
  { speed: '11', lactate: '', hr: '', rpe: '' },
  { speed: '12', lactate: '', hr: '', rpe: '' },
  { speed: '13', lactate: '', hr: '', rpe: '' },
  { speed: '14', lactate: '', hr: '', rpe: '' },
]

const PROTOCOL_PRESETS = [
  {
    label: 'Standard 3\' / +1 km/h (8-16 km/h)',
    stages: Array.from({ length: 9 }, (_, i) => ({
      speed: String(8 + i), lactate: '', hr: '', rpe: '',
    })),
  },
  {
    label: 'Débutant 4\' / +1 km/h (6-12 km/h)',
    stages: Array.from({ length: 7 }, (_, i) => ({
      speed: String(6 + i), lactate: '', hr: '', rpe: '',
    })),
  },
  {
    label: 'Élite 3\' / +1 km/h (10-18 km/h)',
    stages: Array.from({ length: 9 }, (_, i) => ({
      speed: String(10 + i), lactate: '', hr: '', rpe: '',
    })),
  },
  { label: 'Personnalisé', stages: null },
]

const INTERP_STYLES = {
  positive: { bg: 'bg-green-50 border-green-200', icon: '✅', title: 'text-green-800', text: 'text-green-700' },
  warning: { bg: 'bg-amber-50 border-amber-200', icon: '⚠️', title: 'text-amber-800', text: 'text-amber-700' },
  info: { bg: 'bg-blue-50 border-blue-200', icon: 'ℹ️', title: 'text-blue-800', text: 'text-blue-700' },
}

export function LactateTestCalculator({ patient }) {
  const [stages, setStages] = useState(DEFAULT_STAGES)
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0])
  const [protocol, setProtocol] = useState('')
  const [result, setResult] = useState(null)

  const updateStage = (index, field, value) => {
    setStages(prev => prev.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    ))
  }

  const addStage = () => {
    const lastSpeed = stages.length > 0 ? Number(stages[stages.length - 1].speed) || 0 : 7
    setStages(prev => [...prev, { speed: String(lastSpeed + 1), lactate: '', hr: '', rpe: '' }])
  }

  const removeStage = (index) => {
    if (stages.length <= 3) return
    setStages(prev => prev.filter((_, i) => i !== index))
  }

  const applyPreset = (preset) => {
    if (preset.stages) {
      setStages(preset.stages)
    }
    setProtocol(preset.label)
  }

  const handleCalculate = () => {
    const parsed = stages
      .map(s => ({
        speed: Number(s.speed) || 0,
        lactate: Number(s.lactate) || 0,
        hr: s.hr ? Number(s.hr) : null,
        rpe: s.rpe ? Number(s.rpe) : null,
      }))
    setResult(analyzeLactateTest(parsed))
  }

  const formatPace = (speedKmh) => {
    if (!speedKmh || speedKmh === 0) return '—'
    const paceMin = 60 / speedKmh
    const min = Math.floor(paceMin)
    const sec = Math.round((paceMin - min) * 60)
    return `${min}'${String(sec).padStart(2, '0')}"/km`
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Test Lactate</h2>
        <p className="text-text-secondary text-sm mt-1">
          Analyse des seuils et zones d'entraînement par test lactate par paliers
        </p>
      </div>

      {/* Explication protocole */}
      <Card>
        <div className="text-sm text-text-secondary space-y-2">
          <p>
            Le <strong>test lactate par paliers</strong> consiste à mesurer la lactatémie capillaire
            à la fin de chaque palier d'intensité croissante (typiquement 3-4 minutes par palier,
            incréments de 1 km/h). Il permet de déterminer les <strong>seuils lactiques individuels</strong> (LT1 et LT2)
            et d'en dériver des zones d'entraînement personnalisées.
          </p>
          <p className="text-xs text-text-muted">
            Protocole recommandé : échauffement 10 min, paliers de 3 min, prélèvement en fin de palier,
            incréments de 1 km/h jusqu&apos;à épuisement ou lactate &gt; 8-10 mmol/L.
          </p>
        </div>
      </Card>

      {/* Presets de protocole */}
      <Card title="Protocole">
        <div className="flex flex-wrap gap-2 mb-4">
          {PROTOCOL_PRESETS.map((preset, i) => (
            <button
              key={i}
              onClick={() => applyPreset(preset)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
                ${protocol === preset.label
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'border-border text-text-secondary hover:bg-surface'
                }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <FormField label="Date du test">
          <Input
            type="date"
            value={testDate}
            onChange={e => setTestDate(e.target.value)}
            className="w-48"
          />
        </FormField>
      </Card>

      {/* Saisie des paliers */}
      <Card title="Données par palier" subtitle="Vitesse et lactate obligatoires, FC et RPE optionnels">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-2 font-medium text-text-muted w-10">#</th>
                <th className="text-left py-2 pr-2 font-medium text-text-muted">Vitesse (km/h)</th>
                <th className="text-left py-2 pr-2 font-medium text-text-muted">Lactate (mmol/L)</th>
                <th className="text-left py-2 pr-2 font-medium text-text-muted">FC (bpm)</th>
                <th className="text-left py-2 pr-2 font-medium text-text-muted">RPE (1-10)</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {stages.map((stage, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-1.5 pr-2 text-text-muted">{i + 1}</td>
                  <td className="py-1.5 pr-2">
                    <Input
                      type="number"
                      step="0.5"
                      value={stage.speed}
                      onChange={e => updateStage(i, 'speed', e.target.value)}
                      className="w-24"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={stage.lactate}
                      onChange={e => updateStage(i, 'lactate', e.target.value)}
                      className="w-24"
                      placeholder="mmol/L"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <Input
                      type="number"
                      value={stage.hr}
                      onChange={e => updateStage(i, 'hr', e.target.value)}
                      className="w-24"
                      placeholder="bpm"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={stage.rpe}
                      onChange={e => updateStage(i, 'rpe', e.target.value)}
                      className="w-20"
                    />
                  </td>
                  <td className="py-1.5">
                    {stages.length > 3 && (
                      <Button variant="ghost" size="sm" onClick={() => removeStage(i)}>×</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2 mt-3">
          <Button variant="secondary" size="sm" onClick={addStage}>+ Ajouter un palier</Button>
        </div>
      </Card>

      {/* Bouton calcul */}
      <div className="flex justify-center">
        <Button size="lg" onClick={handleCalculate}>
          Analyser le test lactate
        </Button>
      </div>

      {/* Résultats */}
      {result && (
        result.error ? (
          <Card>
            <p className="text-center text-risk-red font-medium py-4">{result.error}</p>
          </Card>
        ) : (
          <LactateResults result={result} formatPace={formatPace} patient={patient} />
        )
      )}
    </div>
  )
}

// ─── Sous-composant résultats ───────────────────────────────────────────

function LactateResults({ result, formatPace, patient: _patient }) {
  const { lt1, lt2, lt1HR, lt2HR, methods, zones, interpretation, stats, curve, stages } = result

  return (
    <div className="space-y-6">
      {/* Seuils principaux */}
      <Card title="Seuils lactiques">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LT1 */}
          {lt1 && (
            <div className="p-5 rounded-xl bg-green-50 border border-green-200">
              <p className="text-xs font-medium uppercase tracking-wide text-green-600">
                Seuil aérobie (LT1)
              </p>
              <p className="text-3xl font-bold text-green-800 mt-1">
                {lt1.speed.toFixed(1)} <span className="text-lg">km/h</span>
              </p>
              <p className="text-sm text-green-700 mt-1">
                {formatPace(lt1.speed)} — {lt1.lactate.toFixed(1)} mmol/L
              </p>
              {lt1HR && (
                <p className="text-sm text-green-600 mt-0.5">FC : ~{lt1HR} bpm</p>
              )}
              <p className="text-xs text-green-600 mt-2">{lt1.method}</p>
            </div>
          )}

          {/* LT2 */}
          {lt2 && (
            <div className="p-5 rounded-xl bg-orange-50 border border-orange-200">
              <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
                Seuil anaérobie (LT2)
              </p>
              <p className="text-3xl font-bold text-orange-800 mt-1">
                {lt2.speed.toFixed(1)} <span className="text-lg">km/h</span>
              </p>
              <p className="text-sm text-orange-700 mt-1">
                {formatPace(lt2.speed)} — {lt2.lactate.toFixed(1)} mmol/L
              </p>
              {lt2HR && (
                <p className="text-sm text-orange-600 mt-0.5">FC : ~{lt2HR} bpm</p>
              )}
              <p className="text-xs text-orange-600 mt-2">Moyenne des méthodes</p>
            </div>
          )}
        </div>

        {/* Stats complémentaires */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <MiniStat label="Lactate repos" value={`${stats.restLactate.toFixed(1)} mmol/L`} />
          <MiniStat label="Lactate max" value={`${stats.maxLactate.toFixed(1)} mmol/L`} />
          <MiniStat label="Vitesse max test" value={`${stats.maxSpeed} km/h`} />
          <MiniStat label="Écart LT1-LT2" value={stats.lt1lt2Gap ? `${stats.lt1lt2Gap.toFixed(1)} km/h` : '—'} />
        </div>
      </Card>

      {/* Concordance des méthodes */}
      <Card title="Méthodes de détermination du seuil anaérobie">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium text-text-muted">Méthode</th>
                <th className="text-left py-2 pr-4 font-medium text-text-muted">Vitesse</th>
                <th className="text-left py-2 pr-4 font-medium text-text-muted">Allure</th>
                <th className="text-left py-2 font-medium text-text-muted">Lactate</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'OBLA 4 mmol/L', data: methods.obla4 },
                { label: 'Dmax (Cheng)', data: methods.dmax },
                { label: 'Baseline + 1.5', data: methods.baseline },
                { label: 'Log-log (Beaver)', data: methods.loglog },
              ].map(({ label, data }, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium">{label}</td>
                  <td className="py-2 pr-4">
                    {data ? `${data.speed.toFixed(1)} km/h` : <span className="text-text-muted">N/A</span>}
                  </td>
                  <td className="py-2 pr-4 text-text-secondary">
                    {data ? formatPace(data.speed) : '—'}
                  </td>
                  <td className="py-2">
                    {data ? `${data.lactate.toFixed(1)} mmol/L` : '—'}
                  </td>
                </tr>
              ))}
              {lt2 && (
                <tr className="border-t-2 border-border font-semibold">
                  <td className="py-2 pr-4">Seuil retenu (moyenne)</td>
                  <td className="py-2 pr-4">{lt2.speed.toFixed(1)} km/h</td>
                  <td className="py-2 pr-4">{formatPace(lt2.speed)}</td>
                  <td className="py-2">{lt2.lactate.toFixed(1)} mmol/L</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Graphique courbe lactate */}
      <Card title="Courbe lactate — vitesse">
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="speed"
              type="number"
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
              tick={{ fontSize: 11 }}
              label={{ value: 'Vitesse (km/h)', position: 'insideBottom', offset: -10, fontSize: 12 }}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              label={{ value: 'Lactate (mmol/L)', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              formatter={(val, name) => {
                if (name === 'lactate') return [`${val} mmol/L`, 'Lactate']
                if (name === 'lactateCurve') return [`${val} mmol/L`, 'Modèle']
                return [val, name]
              }}
              labelFormatter={v => `${v} km/h`}
            />

            {/* Zones colorées en arrière-plan */}
            {zones && lt1 && lt2 && (
              <>
                <ReferenceArea x1={zones[0].speedMin || stages[0].speed} x2={lt1.speed} fill="#22c55e" fillOpacity={0.08} />
                <ReferenceArea x1={lt1.speed} x2={lt2.speed} fill="#eab308" fillOpacity={0.08} />
                <ReferenceArea x1={lt2.speed} x2={stages[stages.length - 1].speed} fill="#ef4444" fillOpacity={0.08} />
              </>
            )}

            {/* Lignes de seuil */}
            {lt1 && (
              <ReferenceLine
                x={lt1.speed}
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="6 3"
                label={{ value: `LT1 ${lt1.speed.toFixed(1)}`, position: 'top', fontSize: 11, fill: '#16a34a' }}
              />
            )}
            {lt2 && (
              <ReferenceLine
                x={lt2.speed}
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="6 3"
                label={{ value: `LT2 ${lt2.speed.toFixed(1)}`, position: 'top', fontSize: 11, fill: '#ea580c' }}
              />
            )}

            {/* Référence 4 mmol/L */}
            <ReferenceLine
              y={4}
              stroke="#94a3b8"
              strokeDasharray="3 3"
              label={{ value: '4 mmol/L', position: 'right', fontSize: 10, fill: '#94a3b8' }}
            />

            {/* Courbe lissée */}
            <Line
              data={curve}
              dataKey="lactate"
              type="monotone"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              name="lactateCurve"
            />

            {/* Points réels */}
            <Scatter
              data={stages.map(s => ({ speed: s.speed, lactate: s.lactate }))}
              dataKey="lactate"
              fill="#1e293b"
              name="lactate"
              r={5}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex gap-6 justify-center mt-2 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-green-500" /> LT1 (seuil aérobie)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-orange-500" /> LT2 (seuil anaérobie)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-slate-800" /> Mesures
          </span>
        </div>
      </Card>

      {/* Zones d'entraînement */}
      {zones && (
        <Card title="Zones d'entraînement individualisées">
          <p className="text-sm text-text-secondary mb-4">
            Basées sur les seuils lactiques individuels du patient.
          </p>
          <div className="space-y-2">
            {zones.map((z) => (
              <div key={z.zone} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-surface transition-colors">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: z.color }} />
                <div className="w-52 shrink-0">
                  <span className="text-sm font-semibold">{z.label}</span>
                </div>
                <div className="w-40 shrink-0 text-sm">
                  {z.speedMin > 0 ? z.speedMin.toFixed(1) : '< '}{z.speedMin > 0 ? '–' : ''}{z.speedMax.toFixed(1)} km/h
                </div>
                <div className="w-36 shrink-0 text-sm text-text-secondary">
                  {formatPace(z.speedMax)} {z.speedMin > 0 ? `– ${formatPace(z.speedMin)}` : ''}
                </div>
                {z.hrMin && (
                  <div className="w-28 shrink-0 text-sm text-text-secondary">
                    {z.hrMin}–{z.hrMax || 'max'} bpm
                  </div>
                )}
                <div className="text-xs text-text-muted shrink-0 w-28">{z.lactateRange}</div>
                <div className="flex-1 text-xs text-text-muted hidden lg:block">{z.description}</div>
              </div>
            ))}
          </div>

          {/* Barre visuelle des zones */}
          <div className="mt-6">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wide mb-2">Répartition des zones</p>
            <div className="flex h-8 rounded-lg overflow-hidden">
              {zones.map((z) => {
                const totalRange = zones[zones.length - 1].speedMax - zones[0].speedMin
                const zoneRange = z.speedMax - (z.speedMin || zones[0].speedMin)
                const width = totalRange > 0 ? (zoneRange / totalRange) * 100 : 20
                return (
                  <div
                    key={z.zone}
                    className="flex items-center justify-center text-xs font-medium text-white"
                    style={{ width: `${width}%`, backgroundColor: z.color, minWidth: '30px' }}
                  >
                    Z{z.zone}
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>{zones[0].speedMin > 0 ? zones[0].speedMin.toFixed(0) : '—'} km/h</span>
              <span>{zones[zones.length - 1].speedMax.toFixed(0)} km/h</span>
            </div>
          </div>
        </Card>
      )}

      {/* Interprétation clinique */}
      <Card title="Interprétation clinique">
        <div className="space-y-3">
          {interpretation.map((item, i) => {
            const style = INTERP_STYLES[item.type] || INTERP_STYLES.info
            return (
              <div key={i} className={`p-3 rounded-lg border ${style.bg}`}>
                <div className="flex items-start gap-2">
                  <span className="text-sm shrink-0">{style.icon}</span>
                  <div>
                    <p className={`text-sm font-semibold ${style.title}`}>{item.title}</p>
                    <p className={`text-xs mt-0.5 ${style.text}`}>{item.message}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Graphique FC-Lactate si données FC disponibles */}
      {stages.some(s => s.hr > 0) && (
        <Card title="Relation FC — Lactate">
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={stages.filter(s => s.hr > 0).map(s => ({ hr: s.hr, lactate: s.lactate, speed: s.speed }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="hr"
                tick={{ fontSize: 11 }}
                label={{ value: 'FC (bpm)', position: 'insideBottom', offset: -5, fontSize: 12 }}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                label={{ value: 'Lactate (mmol/L)', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                formatter={(val, name) => {
                  if (name === 'lactate') return [`${val} mmol/L`, 'Lactate']
                  return [val, name]
                }}
                labelFormatter={v => `${v} bpm`}
              />
              <ReferenceLine y={4} stroke="#94a3b8" strokeDasharray="3 3" />
              {lt1HR && <ReferenceLine x={lt1HR} stroke="#22c55e" strokeDasharray="6 3" />}
              {lt2HR && <ReferenceLine x={lt2HR} stroke="#f97316" strokeDasharray="6 3" />}
              <Scatter dataKey="lactate" fill="#6366f1" r={5} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Données brutes */}
      <Card title="Données brutes du test">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-3 font-medium text-text-muted">Palier</th>
                <th className="text-left py-2 pr-3 font-medium text-text-muted">Vitesse</th>
                <th className="text-left py-2 pr-3 font-medium text-text-muted">Allure</th>
                <th className="text-left py-2 pr-3 font-medium text-text-muted">Lactate</th>
                <th className="text-left py-2 pr-3 font-medium text-text-muted">Δ Lactate</th>
                {stages.some(s => s.hr > 0) && (
                  <th className="text-left py-2 pr-3 font-medium text-text-muted">FC</th>
                )}
                {stages.some(s => s.rpe > 0) && (
                  <th className="text-left py-2 font-medium text-text-muted">RPE</th>
                )}
              </tr>
            </thead>
            <tbody>
              {stages.map((s, i) => {
                const delta = i > 0 ? s.lactate - stages[i - 1].lactate : 0
                const isLT1 = lt1 && Math.abs(s.speed - lt1.speed) < 0.5
                const isLT2 = lt2 && Math.abs(s.speed - lt2.speed) < 0.5

                return (
                  <tr
                    key={i}
                    className={`border-b border-border/50 ${isLT1 ? 'bg-green-50' : isLT2 ? 'bg-orange-50' : ''}`}
                  >
                    <td className="py-2 pr-3">{i + 1}</td>
                    <td className="py-2 pr-3 font-medium">{s.speed} km/h</td>
                    <td className="py-2 pr-3 text-text-secondary">{formatPace(s.speed)}</td>
                    <td className="py-2 pr-3 font-medium">{s.lactate.toFixed(1)}</td>
                    <td className={`py-2 pr-3 ${delta > 1 ? 'text-risk-red font-medium' : delta > 0.5 ? 'text-risk-orange' : 'text-text-muted'}`}>
                      {i > 0 ? `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}` : '—'}
                    </td>
                    {stages.some(st => st.hr > 0) && (
                      <td className="py-2 pr-3">{s.hr || '—'}</td>
                    )}
                    {stages.some(st => st.rpe > 0) && (
                      <td className="py-2">{s.rpe || '—'}</td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-surface rounded-lg p-3 text-center">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm font-bold text-text-primary mt-0.5">{value}</p>
    </div>
  )
}
