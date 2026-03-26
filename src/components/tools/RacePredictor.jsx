import { useState, useMemo } from 'react'
import { Card } from '../ui/Card'

// Distances cibles avec catégorisation
const TARGET_DISTANCES = [
  { label: '1 500 m', meters: 1500, category: 'piste' },
  { label: '3 000 m', meters: 3000, category: 'piste' },
  { label: '5 km', meters: 5000, category: 'route' },
  { label: '10 km', meters: 10000, category: 'route' },
  { label: 'Semi-marathon', meters: 21097, category: 'route' },
  { label: 'Marathon', meters: 42195, category: 'route' },
  { label: '50 km', meters: 50000, category: 'ultra' },
  { label: '100 km', meters: 100000, category: 'ultra' },
]

// Distances de référence (input)
const REF_DISTANCES = [
  { value: 1500, label: '1 500 m' },
  { value: 3000, label: '3 000 m' },
  { value: 5000, label: '5 km' },
  { value: 10000, label: '10 km' },
  { value: 21097, label: 'Semi-marathon' },
  { value: 42195, label: 'Marathon' },
  { value: 0, label: 'Autre distance...' },
]

// Profils Riegel
const RIEGEL_PROFILES = [
  { value: 1.02, label: 'Endurant (1.02)', detail: 'Très endurant — marathonien confirmé' },
  { value: 1.04, label: 'Plutôt endurant (1.04)', detail: 'Bon maintien de l\'allure sur la distance' },
  { value: 1.06, label: 'Standard (1.06)', detail: 'Profil moyen — valeur par défaut de Riegel' },
  { value: 1.08, label: 'Plutôt rapide (1.08)', detail: 'Plus de perte sur la distance' },
  { value: 1.10, label: 'Explosif (1.10)', detail: 'Profil vitesse — perd beaucoup sur les longues distances' },
]

export function RacePredictor({ patient }) {
  const [refDistance, setRefDistance] = useState(10000)
  const [customDistance, setCustomDistance] = useState('')
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [riegelK, setRiegelK] = useState(1.06)

  const actualRefDistance = refDistance === 0 ? Number(customDistance) || 0 : refDistance
  const totalSeconds = (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60 + (Number(seconds) || 0)

  const predictions = useMemo(() => {
    if (!actualRefDistance || !totalSeconds || actualRefDistance <= 0 || totalSeconds <= 0) return null

    // Vérification cohérence : vitesse entre 3 et 30 km/h
    const refSpeedKmh = (actualRefDistance / totalSeconds) * 3.6
    if (refSpeedKmh < 3 || refSpeedKmh > 30) return null

    return TARGET_DISTANCES
      .filter(d => d.meters !== actualRefDistance) // Exclure la distance de référence
      .map(d => {
        const predictedTime = totalSeconds * Math.pow(d.meters / actualRefDistance, riegelK)
        return {
          ...d,
          timeSeconds: predictedTime,
          timeFormatted: formatTime(predictedTime),
          pace: formatPace(predictedTime / (d.meters / 1000)),
          speedKmh: ((d.meters / predictedTime) * 3.6).toFixed(1),
        }
      })
  }, [actualRefDistance, totalSeconds, riegelK])

  // Vitesse et allure de la référence
  const refStats = useMemo(() => {
    if (!actualRefDistance || !totalSeconds) return null
    const speedKmh = (actualRefDistance / totalSeconds) * 3.6
    const paceSec = totalSeconds / (actualRefDistance / 1000)
    return {
      speedKmh: speedKmh.toFixed(1),
      pace: formatPace(paceSec),
    }
  }, [actualRefDistance, totalSeconds])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
          Prédicteur de temps de course
        </h2>
        <p className="text-text-secondary text-sm mt-1">
          Estimation des temps sur différentes distances — Modèle de Riegel (1981)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <div className="lg:col-span-1 space-y-5">
          <Card title="Performance de référence">
            <div className="space-y-4">
              {/* Distance */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Distance</label>
                <select
                  value={refDistance}
                  onChange={(e) => setRefDistance(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                >
                  {REF_DISTANCES.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              {refDistance === 0 && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Distance personnalisée <span className="text-text-muted">(m)</span>
                  </label>
                  <input
                    type="number"
                    value={customDistance}
                    onChange={(e) => setCustomDistance(e.target.value)}
                    min={100}
                    max={200000}
                    placeholder="ex: 15000"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm
                      focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all
                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              )}

              {/* Temps */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Temps réalisé</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <input
                      type="number"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      min={0} max={24} placeholder="h"
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm text-center
                        focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <p className="text-[0.6rem] text-text-muted text-center mt-1">Heures</p>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                      min={0} max={59} placeholder="min"
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm text-center
                        focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <p className="text-[0.6rem] text-text-muted text-center mt-1">Minutes</p>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={seconds}
                      onChange={(e) => setSeconds(e.target.value)}
                      min={0} max={59} placeholder="s"
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm text-center
                        focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <p className="text-[0.6rem] text-text-muted text-center mt-1">Secondes</p>
                  </div>
                </div>
              </div>

              {/* Stats de référence */}
              {refStats && (
                <div className="flex gap-4 pt-2 border-t border-border/40">
                  <div>
                    <p className="text-[0.6rem] text-text-muted uppercase tracking-wider font-semibold">Allure</p>
                    <p className="text-sm font-bold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{refStats.pace}/km</p>
                  </div>
                  <div>
                    <p className="text-[0.6rem] text-text-muted uppercase tracking-wider font-semibold">Vitesse</p>
                    <p className="text-sm font-bold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{refStats.speedKmh} km/h</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Profil Riegel */}
          <Card title="Profil coureur">
            <div className="space-y-2">
              <p className="text-[0.7rem] text-text-muted mb-3">
                L'exposant de Riegel (k) ajuste la perte de vitesse sur la distance. Un coureur endurant perd moins.
              </p>
              {RIEGEL_PROFILES.map(p => (
                <button
                  key={p.value}
                  onClick={() => setRiegelK(p.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-all duration-200 ${
                    riegelK === p.value
                      ? 'border-primary-400/50 bg-primary-500/10'
                      : 'border-border/40 hover:border-border hover:bg-surface-dark/20'
                  }`}
                >
                  <p className={`text-xs font-semibold ${riegelK === p.value ? 'text-primary-500' : 'text-text-primary'}`}>
                    {p.label}
                  </p>
                  <p className="text-[0.65rem] text-text-muted">{p.detail}</p>
                </button>
              ))}
              {patient?.riegelK && (
                <p className="text-[0.65rem] text-text-muted pt-1">
                  Profil calculé via vitesse critique : k = {patient.riegelK.toFixed(3)}
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Résultats */}
        <div className="lg:col-span-2">
          {predictions ? (
            <Card title="Prédictions de temps">
              <div className="space-y-2">
                {['piste', 'route', 'ultra'].map(cat => {
                  const items = predictions.filter(p => p.category === cat)
                  if (items.length === 0) return null
                  const catLabels = { piste: 'Piste', route: 'Route', ultra: 'Ultra' }
                  return (
                    <div key={cat}>
                      <p className="text-[0.6rem] font-semibold text-text-muted uppercase tracking-widest mb-1.5 mt-3 first:mt-0">
                        {catLabels[cat]}
                      </p>
                      {items.map(pred => (
                        <div
                          key={pred.meters}
                          className="flex items-center gap-4 px-4 py-3 rounded-xl bg-surface-dark/20 border border-border/30 mb-1.5"
                        >
                          <div className="w-28 shrink-0">
                            <p className="text-sm font-semibold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                              {pred.label}
                            </p>
                          </div>
                          <div className="flex-1 text-center">
                            <p className="text-lg font-bold text-primary-500" style={{ fontFamily: 'var(--font-heading)' }}>
                              {pred.timeFormatted}
                            </p>
                          </div>
                          <div className="flex gap-6 shrink-0">
                            <div className="text-right">
                              <p className="text-[0.6rem] text-text-muted uppercase tracking-wider">Allure</p>
                              <p className="text-xs font-semibold text-text-secondary">{pred.pace}/km</p>
                            </div>
                            <div className="text-right hidden sm:block">
                              <p className="text-[0.6rem] text-text-muted uppercase tracking-wider">Vitesse</p>
                              <p className="text-xs font-semibold text-text-secondary">{pred.speedKmh} km/h</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-border/40">
                <p className="text-[0.65rem] text-text-muted">
                  <strong>Modèle :</strong> T₂ = T₁ × (D₂/D₁)<sup>k</sup> avec k = {riegelK.toFixed(2)}.
                  Les prédictions sont indicatives et supposent un entraînement adapté à la distance cible.
                  La fiabilité diminue pour les distances très éloignées de la référence.
                </p>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-16">
                <div className="w-14 h-14 mx-auto rounded-xl bg-primary-100/60 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-text-muted max-w-sm mx-auto">
                  Entrez une performance récente (distance + temps) pour obtenir les prédictions sur toutes les distances.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Références */}
      <div className="text-[0.6rem] text-text-muted space-y-0.5 pt-2">
        <p className="font-semibold uppercase tracking-wider mb-1">Références</p>
        <p>Riegel P.S. (1981). Athletic Records and Human Endurance. <em>American Scientist</em>, 69(3), 285-290.</p>
        <p>Mercier D., Léger L. (1986). Prédiction de la performance en course à pied. <em>Médecine du Sport</em>.</p>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.round(totalSeconds % 60)
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}"`
  return `${m}'${String(s).padStart(2, '0')}"`
}

function formatPace(totalSecondsPerKm) {
  const m = Math.floor(totalSecondsPerKm / 60)
  const s = Math.round(totalSecondsPerKm % 60)
  return `${m}'${String(s).padStart(2, '0')}"`
}
