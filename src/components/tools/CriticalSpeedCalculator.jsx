import { useState } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Line, ComposedChart,
} from 'recharts'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { FormField, Input } from '../ui/FormField'
import { calcCSFromFixedDistances, calcCSFromFixedDurations, analyzeRunnerProfile } from '../../utils/criticalSpeed'
import { formatPaceFromSpeed } from '../../utils/paceCalculator'

const DEFAULT_FIXED_DISTANCES = [
  { distanceM: 800, minutes: '', seconds: '' },
  { distanceM: 1600, minutes: '', seconds: '' },
  { distanceM: 3200, minutes: '', seconds: '' },
]

const DEFAULT_FIXED_DURATIONS = [
  { durationMin: 3, distanceM: '' },
  { durationMin: 6, distanceM: '' },
  { durationMin: 12, distanceM: '' },
]

export function CriticalSpeedCalculator({ patient, onApplyToProfile }) {
  const [mode, setMode] = useState('distance') // 'distance' | 'duration'
  const [distEntries, setDistEntries] = useState(DEFAULT_FIXED_DISTANCES)
  const [durEntries, setDurEntries] = useState(DEFAULT_FIXED_DURATIONS)
  const [result, setResult] = useState(null)

  // --- Mode distance fixe ---
  const updateDistEntry = (index, field, value) => {
    setDistEntries(prev => prev.map((e, i) =>
      i === index ? { ...e, [field]: value } : e
    ))
  }

  const addDistEntry = () => {
    setDistEntries(prev => [...prev, { distanceM: '', minutes: '', seconds: '' }])
  }

  const removeDistEntry = (index) => {
    if (distEntries.length <= 2) return
    setDistEntries(prev => prev.filter((_, i) => i !== index))
  }

  // --- Mode durée fixe ---
  const updateDurEntry = (index, field, value) => {
    setDurEntries(prev => prev.map((e, i) =>
      i === index ? { ...e, [field]: value } : e
    ))
  }

  const addDurEntry = () => {
    setDurEntries(prev => [...prev, { durationMin: '', distanceM: '' }])
  }

  const removeDurEntry = (index) => {
    if (durEntries.length <= 2) return
    setDurEntries(prev => prev.filter((_, i) => i !== index))
  }

  // --- Calcul ---
  const handleCalculate = () => {
    let res
    if (mode === 'distance') {
      const entries = distEntries.map(e => ({
        distanceM: Number(e.distanceM) || 0,
        minutes: Number(e.minutes) || 0,
        seconds: Number(e.seconds) || 0,
      }))
      res = calcCSFromFixedDistances(entries)
    } else {
      const entries = durEntries.map(e => ({
        durationMin: Number(e.durationMin) || 0,
        distanceM: Number(e.distanceM) || 0,
      }))
      res = calcCSFromFixedDurations(entries)
    }
    setResult(res)
  }

  const handleApply = () => {
    if (result && !result.error && onApplyToProfile) {
      // Sauvegarder VC + riegelK + dPrime en une seule opération
      const analysis = analyzeRunnerProfile(result)
      onApplyToProfile(result.csKmh, {
        riegelK: analysis?.riegelK || null,
        dPrime: result.dPrime ? Math.round(result.dPrime) : null,
      })
    }
  }

  // Données pour le graphique d = f(t)
  const getChartData = () => {
    if (!result || result.error || !result.details) return null

    const trials = result.details.trials
    const maxTime = Math.max(...trials.map(t => t.time)) * 1.15
    const minTime = Math.min(...trials.map(t => t.time)) * 0.85

    // Points de données réels
    const points = trials.map(t => ({
      time: Math.round(t.time),
      distance: Math.round(t.distance),
      type: 'réel',
    }))

    // Droite de régression
    const linePoints = []
    const steps = 50
    for (let i = 0; i <= steps; i++) {
      const t = minTime + (maxTime - minTime) * (i / steps)
      linePoints.push({
        time: Math.round(t),
        regression: Math.round(result.cs * t + result.dPrime),
      })
    }

    return { points, linePoints, maxTime, minTime }
  }

  const chartData = result && !result.error ? getChartData() : null

  const _formatPace = formatPaceFromSpeed

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Calculateur de Vitesse Critique</h2>
        <p className="text-text-secondary text-sm mt-1">
          Calculez la vitesse critique et le profil coureur à partir de 2 à 5 performances chronométrées.
        </p>
      </div>

      {/* Explication */}
      <Card>
        <div className="text-sm text-text-secondary space-y-2">
          <p>
            La <strong>vitesse critique (VC)</strong> correspond à la plus haute intensité soutenable
            sans accumulation continue de fatigue. Elle est calculée à partir du modèle :
          </p>
          <p className="font-mono text-center text-text-primary bg-surface rounded-lg py-2">
            d = VC × t + D'
          </p>
          <p>
            où <strong>D'</strong> (D-prime) représente la capacité de travail anaérobie
            (en mètres). Deux à trois essais à des distances ou durées différentes suffisent
            pour estimer ces paramètres par régression linéaire.
          </p>
        </div>
      </Card>

      {/* Choix du mode */}
      <div className="flex gap-1 bg-surface rounded-lg p-1 border border-border">
        <button
          onClick={() => { setMode('distance'); setResult(null) }}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${mode === 'distance'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
            }`}
        >
          Distances fixes (temps mesuré)
        </button>
        <button
          onClick={() => { setMode('duration'); setResult(null) }}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${mode === 'duration'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
            }`}
        >
          Durées fixes (distance mesurée)
        </button>
      </div>

      {/* Mode distance fixe */}
      {mode === 'distance' && (
        <Card title="Essais sur distances fixes" subtitle="Entrez le temps réalisé sur chaque distance (effort maximal)">
          <div className="space-y-3">
            {distEntries.map((entry, i) => (
              <div key={i} className="flex items-end gap-3">
                <FormField label={i === 0 ? 'Distance (m)' : undefined}>
                  <Input
                    type="number"
                    value={entry.distanceM}
                    onChange={e => updateDistEntry(i, 'distanceM', e.target.value)}
                    placeholder="m"
                    className="w-28"
                  />
                </FormField>
                <FormField label={i === 0 ? 'Minutes' : undefined}>
                  <Input
                    type="number"
                    value={entry.minutes}
                    onChange={e => updateDistEntry(i, 'minutes', e.target.value)}
                    placeholder="min"
                    className="w-20"
                  />
                </FormField>
                <FormField label={i === 0 ? 'Secondes' : undefined}>
                  <Input
                    type="number"
                    value={entry.seconds}
                    onChange={e => updateDistEntry(i, 'seconds', e.target.value)}
                    placeholder="sec"
                    className="w-20"
                  />
                </FormField>
                {distEntries.length > 2 && (
                  <Button variant="ghost" size="sm" onClick={() => removeDistEntry(i)}>×</Button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="secondary" size="sm" onClick={addDistEntry}>+ Ajouter un essai</Button>
          </div>
        </Card>
      )}

      {/* Mode durée fixe */}
      {mode === 'duration' && (
        <Card title="Essais sur durées fixes" subtitle="Entrez la distance parcourue en un temps donné (effort maximal)">
          <div className="space-y-3">
            {durEntries.map((entry, i) => (
              <div key={i} className="flex items-end gap-3">
                <FormField label={i === 0 ? 'Durée (min)' : undefined}>
                  <Input
                    type="number"
                    value={entry.durationMin}
                    onChange={e => updateDurEntry(i, 'durationMin', e.target.value)}
                    placeholder="min"
                    className="w-24"
                  />
                </FormField>
                <FormField label={i === 0 ? 'Distance parcourue (m)' : undefined}>
                  <Input
                    type="number"
                    value={entry.distanceM}
                    onChange={e => updateDurEntry(i, 'distanceM', e.target.value)}
                    placeholder="m"
                    className="w-32"
                  />
                </FormField>
                {durEntries.length > 2 && (
                  <Button variant="ghost" size="sm" onClick={() => removeDurEntry(i)}>×</Button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="secondary" size="sm" onClick={addDurEntry}>+ Ajouter un essai</Button>
          </div>
        </Card>
      )}

      {/* Bouton calcul */}
      <div className="flex justify-center">
        <Button size="lg" onClick={handleCalculate}>
          Calculer la Vitesse Critique
        </Button>
      </div>

      {/* Résultats */}
      {result && (
        result.error ? (
          <Card>
            <div className="text-center py-4">
              <p className="text-risk-red font-medium">{result.error}</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Résultat principal */}
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-primary-50 rounded-xl">
                  <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Vitesse Critique</p>
                  <p className="text-3xl font-bold text-primary-700 mt-1">
                    {result.csKmh.toFixed(2)}
                  </p>
                  <p className="text-sm text-primary-600">km/h</p>
                  <p className="text-sm text-text-secondary mt-1">
                    {formatPaceFromSpeed(result.csKmh)}
                  </p>
                </div>
                <div className="text-center p-4 bg-surface rounded-xl">
                  <p className="text-xs text-text-muted uppercase tracking-wide font-medium">D' (réserve anaérobie)</p>
                  <p className="text-3xl font-bold text-text-primary mt-1">
                    {Math.round(result.dPrime)}
                  </p>
                  <p className="text-sm text-text-muted">mètres</p>
                </div>
                <div className="text-center p-4 bg-surface rounded-xl">
                  <p className="text-xs text-text-muted uppercase tracking-wide font-medium">R² (qualité du modèle)</p>
                  <p className="text-3xl font-bold text-text-primary mt-1">
                    {result.r2.toFixed(4)}
                  </p>
                  <p className="text-sm text-text-muted">
                    {result.r2 >= 0.99 ? 'Excellent' : result.r2 >= 0.95 ? 'Très bon' : result.r2 >= 0.90 ? 'Bon' : 'Faible — vérifiez les données'}
                  </p>
                </div>
              </div>

              {/* Bouton appliquer au profil */}
              {onApplyToProfile && (
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <div className="text-sm text-text-secondary">
                    {patient?.criticalSpeed
                      ? `Valeur actuelle dans le profil : ${patient.criticalSpeed} km/h`
                      : 'Aucune vitesse critique renseignée dans le profil'
                    }
                  </div>
                  <Button onClick={handleApply}>
                    Appliquer au profil ({result.csKmh.toFixed(2)} km/h)
                  </Button>
                </div>
              )}
            </Card>

            {/* Détail des essais */}
            <Card title="Détail des essais">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 font-medium text-text-muted">Distance</th>
                      <th className="text-left py-2 pr-4 font-medium text-text-muted">Temps</th>
                      <th className="text-left py-2 pr-4 font-medium text-text-muted">Vitesse</th>
                      <th className="text-left py-2 pr-4 font-medium text-text-muted">Distance prédite</th>
                      <th className="text-left py-2 font-medium text-text-muted">Résidu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.details.trials.map((t, i) => {
                      const min = Math.floor(t.time / 60)
                      const sec = Math.round(t.time % 60)
                      return (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2 pr-4">{t.distance} m</td>
                          <td className="py-2 pr-4">{min}'{String(sec).padStart(2, '0')}"</td>
                          <td className="py-2 pr-4">{t.speedKmh.toFixed(2)} km/h</td>
                          <td className="py-2 pr-4">{Math.round(t.predicted)} m</td>
                          <td className={`py-2 ${Math.abs(t.residual) > 20 ? 'text-risk-orange' : 'text-risk-green'}`}>
                            {t.residual >= 0 ? '+' : ''}{Math.round(t.residual)} m
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Graphique */}
            {chartData && (
              <Card title="Modèle distance-temps (d = VC × t + D')">
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="time"
                      type="number"
                      domain={[Math.round(chartData.minTime), Math.round(chartData.maxTime)]}
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Temps (s)', position: 'insideBottom', offset: -5, fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Distance (m)', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      formatter={(value, name) => {
                        if (name === 'distance') return [`${value} m`, 'Réel']
                        if (name === 'regression') return [`${value} m`, 'Modèle']
                        return [value, name]
                      }}
                      labelFormatter={(v) => `${Math.floor(v / 60)}'${String(Math.round(v % 60)).padStart(2, '0')}"`}
                    />
                    {/* Droite de régression */}
                    <Line
                      data={chartData.linePoints}
                      dataKey="regression"
                      type="monotone"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      dot={false}
                      name="regression"
                    />
                    {/* Points réels */}
                    <Scatter
                      data={chartData.points}
                      dataKey="distance"
                      fill="#ef4444"
                      name="distance"
                      r={6}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                <p className="text-xs text-text-muted text-center mt-2">
                  Points rouges = essais réels — Ligne bleue = droite de régression (VC = pente)
                </p>
              </Card>
            )}

            {/* Zones dérivées */}
            <Card title="Zones d'intensité dérivées de la VC">
              <p className="text-sm text-text-secondary mb-4">
                Basées sur les pourcentages de la vitesse critique ({result.csKmh.toFixed(2)} km/h)
              </p>
              <div className="space-y-2">
                {[
                  { zone: 'Z1 — Récupération', pct: '< 75%', speed: result.csKmh * 0.75, color: '#93c5fd' },
                  { zone: 'Z2 — Endurance', pct: '75–85%', speed: result.csKmh * 0.85, color: '#22c55e' },
                  { zone: 'Z3 — Tempo', pct: '85–95%', speed: result.csKmh * 0.95, color: '#eab308' },
                  { zone: 'Z4 — Seuil (≈VC)', pct: '95–105%', speed: result.csKmh * 1.05, color: '#f97316' },
                  { zone: 'Z5 — Supra-VC', pct: '> 105%', speed: result.csKmh * 1.10, color: '#ef4444' },
                ].map((z, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: z.color }} />
                      <span className="text-sm font-medium w-40">{z.zone}</span>
                      <span className="text-xs text-text-muted w-20">{z.pct}</span>
                      <span className="text-sm font-medium w-24">≤ {z.speed.toFixed(1)} km/h</span>
                      <span className="text-xs text-text-secondary">
                        ({formatPaceFromSpeed(z.speed)})
                      </span>
                    </div>
                  ))}
              </div>
            </Card>

            {/* Analyse du profil coureur */}
            <RunnerProfileAnalysis result={result} />
          </div>
        )
      )}
    </div>
  )
}

// ─── Sous-composant : Analyse du profil coureur ───────────────────────────

function RunnerProfileAnalysis({ result }) {
  const analysis = analyzeRunnerProfile(result)
  if (!analysis) return null

  const { profile, indicators, predictions, riegelK, dPrimeRatio, speedDropPercent } = analysis

  return (
    <>
      {/* Profil global */}
      <Card title="Analyse du profil coureur">
        <div className="space-y-6">
          {/* Résultat principal */}
          <div className="flex items-start gap-5 p-5 rounded-xl" style={{ backgroundColor: `${profile.color}15` }}>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 text-2xl font-bold text-white"
              style={{ backgroundColor: profile.color }}
            >
              {profile.type === 'speed' ? 'V' : profile.type === 'endurance' ? 'E' : 'EQ'}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold" style={{ color: profile.color }}>
                {profile.label}
              </h4>
              <p className="text-sm text-text-secondary mt-1">{profile.description}</p>
              <p className="text-sm font-medium text-text-primary mt-2">{profile.recommendation}</p>
            </div>
          </div>

          {/* Jauge visuelle du continuum Endurance ← → Vitesse */}
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wide mb-2">
              Continuum endurance — vitesse
            </p>
            <div className="relative h-8 rounded-full overflow-hidden bg-gradient-to-r from-green-400 via-yellow-400 to-blue-500">
              {/* Marqueur position */}
              <div
                className="absolute top-0 h-full w-1 bg-white shadow-lg"
                style={{
                  // score va de -1 (endurant) à +1 (vitesse) → 0% à 100%
                  left: `${((profile.score + 1) / 2) * 100}%`,
                  transform: 'translateX(-50%)',
                }}
              />
              <div
                className="absolute -bottom-0.5 w-3 h-3 bg-white rounded-full border-2 border-gray-800 shadow"
                style={{
                  left: `${((profile.score + 1) / 2) * 100}%`,
                  transform: 'translateX(-50%)',
                  top: '50%',
                  marginTop: '-6px',
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>Endurant</span>
              <span>Équilibré</span>
              <span>Vitesse</span>
            </div>
          </div>

          {/* 3 indicateurs détaillés */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <IndicatorCard
              title="Exposant de Riegel"
              indicator={indicators.riegel}
              explanation="T₂ = T₁ × (D₂/D₁)^k — Plus k est élevé, plus la performance chute avec la distance."
              value={`k = ${riegelK.toFixed(3)}`}
              reference="Référence : k ≈ 1.06 (Riegel, 1981)"
            />
            <IndicatorCard
              title="Ratio D'/VC"
              indicator={indicators.dPrimeAnalysis}
              explanation="Capacité anaérobie relative. Un ratio élevé indique une réserve de vitesse importante."
              value={`${dPrimeRatio.toFixed(0)} s`}
              reference="Réf : 35-55 s (Vanhatalo et al., 2011)"
            />
            <IndicatorCard
              title="Perte de vitesse"
              indicator={indicators.speedDrop}
              explanation="Décroissance entre l'essai le plus court et le plus long. Reflète la résistance à la fatigue."
              value={`${speedDropPercent.toFixed(1)} %`}
              reference="Réf : 12-18 % (équilibré)"
            />
          </div>
        </div>
      </Card>

      {/* Recommandations d'entraînement */}
      <Card title="Orientations d'entraînement">
        <div className="space-y-4">
          <div className="p-4 rounded-lg border-l-4" style={{ borderColor: profile.color, backgroundColor: `${profile.color}08` }}>
            <p className="text-sm font-semibold text-text-primary mb-1">
              {profile.type === 'speed'
                ? 'Axes prioritaires : développement de l\'endurance aérobie'
                : profile.type === 'endurance'
                  ? 'Axes prioritaires : développement de la vitesse et de la puissance'
                  : 'Axes prioritaires : entraînement polarisé et spécifique à l\'objectif'
              }
            </p>
            <p className="text-xs text-text-secondary">{profile.recommendation}</p>
          </div>
          <ul className="space-y-2">
            {profile.training.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="mt-0.5 shrink-0" style={{ color: profile.color }}>
                  {i + 1}.
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Prédictions de temps */}
      <Card title="Prédictions de temps (modèle de Riegel)">
        <p className="text-sm text-text-secondary mb-4">
          Estimations basées sur l'exposant personnel k = {riegelK.toFixed(3)}.
          Plus l'exposant s'éloigne de 1.06, plus les prédictions sur longues distances
          divergeront des tables standards.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium text-text-muted">Distance</th>
                <th className="text-left py-2 pr-4 font-medium text-text-muted">Temps estimé</th>
                <th className="text-left py-2 pr-4 font-medium text-text-muted">Allure</th>
                <th className="text-left py-2 font-medium text-text-muted">Vitesse</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2.5 pr-4 font-medium">{p.label}</td>
                  <td className="py-2.5 pr-4 font-mono">{p.timeFormatted}</td>
                  <td className="py-2.5 pr-4 text-text-secondary">{p.pace}</td>
                  <td className="py-2.5 text-text-secondary">{p.speedKmh.toFixed(1)} km/h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-muted mt-3">
          Les prédictions au-delà du semi-marathon sont extrapolées et doivent être interprétées avec prudence.
          Le modèle de Riegel sous-estime généralement les temps sur marathon et ultra pour les profils vitesse.
        </p>
      </Card>
    </>
  )
}

function IndicatorCard({ title, indicator, explanation, value, reference }) {
  return (
    <div className="bg-surface-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-sm font-semibold text-text-primary">{title}</h5>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: indicator.color }}
        >
          {indicator.label}
        </span>
      </div>
      <p className="text-xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-muted mt-1">{indicator.detail}</p>
      <p className="text-xs text-text-secondary mt-2">{explanation}</p>
      <p className="text-xs text-text-muted mt-1 italic">{reference}</p>
    </div>
  )
}
