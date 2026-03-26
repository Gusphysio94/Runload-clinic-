import { INTENSITY_ZONES } from '../constants'

/**
 * Parse une chaîne de plage de zone (ex: "65-75%", "< 75%", "> 105%")
 * en valeurs décimales { low, high }.
 */
export function parseZoneRange(rangeStr) {
  if (!rangeStr) return null

  // "< 75%" → { low: 0, high: 0.75 }
  const ltMatch = rangeStr.match(/^<\s*(\d+)%$/)
  if (ltMatch) return { low: 0, high: Number(ltMatch[1]) / 100 }

  // "> 105%" → { low: 1.05, high: 1.20 }
  const gtMatch = rangeStr.match(/^>\s*(\d+)%$/)
  if (gtMatch) return { low: Number(gtMatch[1]) / 100, high: Number(gtMatch[1]) / 100 + 0.15 }

  // "65-75%" → { low: 0.65, high: 0.75 }
  const rangeMatch = rangeStr.match(/^(\d+)-(\d+)%$/)
  if (rangeMatch) return { low: Number(rangeMatch[1]) / 100, high: Number(rangeMatch[2]) / 100 }

  return null
}

/**
 * Convertit une vitesse en km/h en allure min/km.
 * @returns {{ min: number, sec: number }}
 */
export function calcPaceFromSpeed(speedKmh) {
  if (!speedKmh || speedKmh <= 0) return null
  const paceMinKm = 60 / speedKmh
  const min = Math.floor(paceMinKm)
  const sec = Math.round((paceMinKm - min) * 60)
  return { min, sec: sec === 60 ? 0 : sec, ...(sec === 60 ? { min: min + 1 } : {}) }
}

/**
 * Formate une allure { min, sec } en chaîne lisible "5'30".
 */
export function formatPace(pace) {
  if (!pace) return '—'
  return `${pace.min}'${String(pace.sec).padStart(2, '0')}`
}

/**
 * Convertit une vitesse en km/h directement en chaîne d'allure "5'30"/km".
 * Raccourci pratique pour éviter calcPaceFromSpeed + formatPace.
 */
export function formatPaceFromSpeed(speedKmh) {
  if (!speedKmh || speedKmh <= 0) return '—'
  const pace = calcPaceFromSpeed(speedKmh)
  return pace ? `${pace.min}'${String(pace.sec).padStart(2, '0')}"/km` : '—'
}

/**
 * Convertit des secondes/km en chaîne d'allure "5'30"".
 */
export function formatPaceFromSeconds(totalSecondsPerKm) {
  if (!totalSecondsPerKm || totalSecondsPerKm <= 0) return '—'
  const m = Math.floor(totalSecondsPerKm / 60)
  const s = Math.round(totalSecondsPerKm % 60)
  return `${m}'${String(s).padStart(2, '0')}"`
}

/**
 * Convertit des secondes totales en chaîne de temps "1h23'45"" ou "23'45"".
 */
export function formatTime(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '—'
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.round(totalSeconds % 60)
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}"`
  return `${m}'${String(s).padStart(2, '0')}"`
}

/**
 * Calcule les allures / FC / % pour chaque zone Z1-Z5
 * en fonction des données du patient.
 *
 * @param {object} patient
 * @returns {Array<{ zone, label, vma?, vc?, fcmax?, ranges }>}
 */
export function calcZonePaces(patient) {
  if (!patient) return null

  return INTENSITY_ZONES.map((zone) => {
    const result = {
      zone: zone.zone,
      label: zone.label,
      color: zone.color,
      ranges: { ...zone.ranges },
    }

    // Allures depuis %VMA
    if (patient.vma) {
      const range = parseZoneRange(zone.ranges.vma)
      if (range) {
        const speedLow = patient.vma * range.low
        const speedHigh = patient.vma * range.high
        result.vma = {
          speedRange: { low: speedLow, high: speedHigh },
          // Allure lente = vitesse basse, allure rapide = vitesse haute
          paceSlow: calcPaceFromSpeed(speedLow),
          paceFast: calcPaceFromSpeed(speedHigh),
        }
      }
    }

    // Allures depuis %VC
    if (patient.criticalSpeed) {
      const range = parseZoneRange(zone.ranges.vc)
      if (range) {
        const speedLow = patient.criticalSpeed * range.low
        const speedHigh = patient.criticalSpeed * range.high
        result.vc = {
          speedRange: { low: speedLow, high: speedHigh },
          paceSlow: calcPaceFromSpeed(speedLow),
          paceFast: calcPaceFromSpeed(speedHigh),
        }
      }
    }

    // Plages FC depuis %FCmax
    if (patient.fcMax) {
      const range = parseZoneRange(zone.ranges.fcmax)
      if (range) {
        result.fcmax = {
          low: Math.round(patient.fcMax * range.low),
          high: Math.round(patient.fcMax * range.high),
        }
      }
    }

    return result
  })
}

/**
 * Retourne la meilleure représentation d'allure disponible pour une zone donnée.
 * Priorité : allure VMA > allure VC > FC > % bruts
 */
export function getBestPaceDisplay(zonePace) {
  if (!zonePace) return null

  if (zonePace.vma) {
    return {
      type: 'pace',
      label: `${formatPace(zonePace.vma.paceFast)} - ${formatPace(zonePace.vma.paceSlow)} /km`,
      detail: zonePace.ranges.vma ? `${zonePace.ranges.vma} VMA` : null,
    }
  }

  if (zonePace.vc) {
    return {
      type: 'pace',
      label: `${formatPace(zonePace.vc.paceFast)} - ${formatPace(zonePace.vc.paceSlow)} /km`,
      detail: zonePace.ranges.vc ? `${zonePace.ranges.vc} VC` : null,
    }
  }

  if (zonePace.fcmax) {
    return {
      type: 'hr',
      label: `${zonePace.fcmax.low} - ${zonePace.fcmax.high} bpm`,
      detail: zonePace.ranges.fcmax ? `${zonePace.ranges.fcmax} FCmax` : null,
    }
  }

  // Fallback : afficher les ranges %
  const refs = ['vma', 'vc', 'fcmax'].filter(r => zonePace.ranges[r])
  if (refs.length > 0) {
    return {
      type: 'percent',
      label: refs.map(r => `${zonePace.ranges[r]} ${r.toUpperCase()}`).join(' · '),
      detail: null,
    }
  }

  return null
}
