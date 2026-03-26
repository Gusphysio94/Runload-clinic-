import { useState, useMemo } from 'react'
import { Card } from '../ui/Card'

// Zones d'intensité avec % VMA
const ZONES = [
  { id: 'z1', label: 'Z1 — Récupération', range: [55, 65], color: '#22c55e' },
  { id: 'z2', label: 'Z2 — Endurance fondamentale', range: [65, 75], color: '#10b981' },
  { id: 'z3', label: 'Z3 — Tempo / Seuil aérobie', range: [75, 85], color: '#f59e0b' },
  { id: 'z4', label: 'Z4 — Seuil anaérobie', range: [85, 95], color: '#f97316' },
  { id: 'z5', label: 'Z5 — VMA / PMA', range: [95, 110], color: '#ef4444' },
]

export function PaceConverter({ patient }) {
  const [mode, setMode] = useState('speed') // 'speed' | 'pace'
  const [speedInput, setSpeedInput] = useState('')
  const [paceMin, setPaceMin] = useState('')
  const [paceSec, setPaceSec] = useState('')

  // Conversion principale
  const conversion = useMemo(() => {
    if (mode === 'speed') {
      const speed = Number(speedInput)
      if (!speed || speed <= 0 || speed > 40) return null
      const paceTotal = 60 / speed // min/km
      const m = Math.floor(paceTotal)
      const s = Math.round((paceTotal - m) * 60)
      return {
        speedKmh: speed,
        paceMin: m,
        paceSec: s,
        paceFormatted: `${m}'${String(s).padStart(2, '0')}"/km`,
        speedMs: (speed / 3.6).toFixed(2),
        speedMph: (speed * 0.621371).toFixed(1),
        paceMile: formatPace((paceTotal * 1.60934)),
        per400m: formatPace(paceTotal * 0.4),
        per200m: formatPace(paceTotal * 0.2),
      }
    } else {
      const m = Number(paceMin) || 0
      const s = Number(paceSec) || 0
      const totalMin = m + s / 60
      if (totalMin <= 0 || totalMin > 20) return null
      const speed = 60 / totalMin
      return {
        speedKmh: Number(speed.toFixed(1)),
        paceMin: m,
        paceSec: s,
        paceFormatted: `${m}'${String(s).padStart(2, '0')}"/km`,
        speedMs: (speed / 3.6).toFixed(2),
        speedMph: (speed * 0.621371).toFixed(1),
        paceMile: formatPace(totalMin * 1.60934),
        per400m: formatPace(totalMin * 0.4),
        per200m: formatPace(totalMin * 0.2),
      }
    }
  }, [mode, speedInput, paceMin, paceSec])

  // Tableau de zones basé sur la VMA du patient
  const zoneTable = useMemo(() => {
    const vma = patient?.vma
    if (!vma || vma <= 0) return null
    return ZONES.map(z => {
      const speedLow = vma * z.range[0] / 100
      const speedHigh = vma * z.range[1] / 100
      const paceLow = 60 / speedHigh // allure rapide = vitesse haute
      const paceHigh = 60 / speedLow // allure lente = vitesse basse
      return {
        ...z,
        speedLow: speedLow.toFixed(1),
        speedHigh: speedHigh.toFixed(1),
        paceLow: formatPaceMinSec(paceLow),
        paceHigh: formatPaceMinSec(paceHigh),
      }
    })
  }, [patient?.vma])

  // Tableau de correspondance rapide
  const quickTable = useMemo(() => {
    const rows = []
    for (let speed = 7; speed <= 22; speed += 0.5) {
      const pace = 60 / speed
      const m = Math.floor(pace)
      const s = Math.round((pace - m) * 60)
      rows.push({ speed, pace: `${m}'${String(s).padStart(2, '0')}"` })
    }
    return rows
  }, [])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
          Convertisseur allure / vitesse
        </h2>
        <p className="text-text-secondary text-sm mt-1">
          Conversion instantanée min/km ↔ km/h avec tableau de zones
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Convertisseur principal */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            {/* Mode toggle */}
            <div className="flex items-center gap-2 mb-5 bg-surface-dark/50 rounded-xl p-1 border border-border/40">
              <button
                onClick={() => setMode('speed')}
                className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === 'speed'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Vitesse → Allure
              </button>
              <button
                onClick={() => setMode('pace')}
                className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === 'pace'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Allure → Vitesse
              </button>
            </div>

            {/* Input */}
            {mode === 'speed' ? (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Vitesse <span className="text-text-muted">(km/h)</span>
                </label>
                <input
                  type="number"
                  value={speedInput}
                  onChange={(e) => setSpeedInput(e.target.value)}
                  min={1} max={40} step={0.1}
                  placeholder="ex: 12.5"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface-card text-text-primary text-lg font-semibold
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ fontFamily: 'var(--font-heading)' }}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Allure <span className="text-text-muted">(min/km)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      value={paceMin}
                      onChange={(e) => setPaceMin(e.target.value)}
                      min={2} max={15} placeholder="min"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface-card text-text-primary text-lg font-semibold text-center
                        focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    />
                    <p className="text-[0.6rem] text-text-muted text-center mt-1">Minutes</p>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={paceSec}
                      onChange={(e) => setPaceSec(e.target.value)}
                      min={0} max={59} placeholder="sec"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface-card text-text-primary text-lg font-semibold text-center
                        focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    />
                    <p className="text-[0.6rem] text-text-muted text-center mt-1">Secondes</p>
                  </div>
                </div>
              </div>
            )}

            {/* Résultat */}
            {conversion && (
              <div className="mt-6 pt-5 border-t border-border/60">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <ResultBox
                    label={mode === 'speed' ? 'Allure' : 'Vitesse'}
                    value={mode === 'speed' ? conversion.paceFormatted : `${conversion.speedKmh} km/h`}
                    highlight
                  />
                  <ResultBox label="m/s" value={conversion.speedMs} />
                  <ResultBox label="Allure/mile" value={conversion.paceMile} />
                  <ResultBox label="mph" value={conversion.speedMph} />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <ResultBox label="Temps au 400m" value={conversion.per400m} />
                  <ResultBox label="Temps au 200m" value={conversion.per200m} />
                </div>

                {/* Indication de zone si VMA disponible */}
                {patient?.vma && (
                  <div className="mt-4">
                    <ZoneIndicator speedKmh={conversion.speedKmh} vma={patient.vma} />
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Zones d'entraînement */}
          {zoneTable && (
            <Card title={`Zones d'entraînement — VMA ${patient.vma} km/h`}>
              <div className="space-y-1.5">
                {zoneTable.map(z => (
                  <div
                    key={z.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-dark/20 border border-border/30"
                  >
                    <div className="w-1.5 h-8 rounded-full shrink-0" style={{ backgroundColor: z.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-primary">{z.label}</p>
                      <p className="text-[0.65rem] text-text-muted">{z.range[0]}-{z.range[1]}% VMA</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                        {z.paceLow} — {z.paceHigh}
                      </p>
                      <p className="text-[0.6rem] text-text-muted">
                        {z.speedLow} — {z.speedHigh} km/h
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {!patient?.vma && (
                <p className="text-[0.65rem] text-text-muted mt-3">
                  Renseignez la VMA dans le profil patient pour afficher les zones personnalisées.
                </p>
              )}
            </Card>
          )}
        </div>

        {/* Tableau de correspondance rapide */}
        <div>
          <Card title="Table de correspondance">
            <div className="max-h-[70vh] overflow-y-auto -mx-2">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-surface-card">
                  <tr className="text-[0.6rem] font-semibold text-text-muted uppercase tracking-wider">
                    <th className="text-center py-2 px-2">km/h</th>
                    <th className="text-center py-2 px-2">min/km</th>
                  </tr>
                </thead>
                <tbody>
                  {quickTable.map(row => {
                    const isHighlighted = conversion && Math.abs(row.speed - conversion.speedKmh) < 0.3
                    return (
                      <tr
                        key={row.speed}
                        className={`border-t border-border/30 ${
                          isHighlighted ? 'bg-primary-500/10 font-bold' : ''
                        } ${row.speed % 1 === 0 ? '' : 'text-text-muted'}`}
                      >
                        <td className={`py-1.5 px-2 text-center ${isHighlighted ? 'text-primary-500' : 'text-text-primary'}`}>
                          {row.speed.toFixed(1)}
                        </td>
                        <td className={`py-1.5 px-2 text-center ${isHighlighted ? 'text-primary-500' : 'text-text-secondary'}`}>
                          {row.pace}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function ResultBox({ label, value, highlight }) {
  return (
    <div className={`rounded-xl border px-3 py-2.5 ${
      highlight ? 'border-primary-400/40 bg-primary-500/5' : 'border-border/40 bg-surface-dark/20'
    }`}>
      <p className="text-[0.6rem] font-semibold text-text-muted uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-bold mt-0.5 ${highlight ? 'text-primary-500' : 'text-text-primary'}`}
        style={{ fontFamily: 'var(--font-heading)' }}>
        {value}
      </p>
    </div>
  )
}

function ZoneIndicator({ speedKmh, vma }) {
  const pctVma = (speedKmh / vma) * 100
  const zone = ZONES.find(z => pctVma >= z.range[0] && pctVma < z.range[1])
    || (pctVma >= 110 ? { label: 'Au-dessus de Z5', color: '#dc2626' } : null)

  if (!zone) return null

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 bg-surface-dark/20">
      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
      <p className="text-xs text-text-secondary">
        <span className="font-semibold text-text-primary">{Math.round(pctVma)}% VMA</span>
        {' — '}
        {zone.label}
      </p>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPace(totalMinutes) {
  const m = Math.floor(totalMinutes)
  const s = Math.round((totalMinutes - m) * 60)
  return `${m}'${String(s).padStart(2, '0')}"`
}

function formatPaceMinSec(totalMinutes) {
  const m = Math.floor(totalMinutes)
  const s = Math.round((totalMinutes - m) * 60)
  return `${m}'${String(s).padStart(2, '0')}"`
}
