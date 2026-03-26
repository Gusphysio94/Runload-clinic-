/**
 * Calculateur de VMA à partir de tests terrain.
 *
 * Références :
 * - Cooper K.H. (1968) — Test de Cooper 12 min
 * - Léger L., Boucher R. (1980) — UMTT / Léger-Boucher
 * - Léger L., Gadoury C. (1989) — VAMEVAL
 * - Buchheit M. (2008) — 30-15 IFT
 * - Lacour J.R., Bourdin M. (2015) — Corrections temps/distance
 */

// ─── Tests disponibles ──────────────────────────────────────────────────────

export const VMA_TESTS = [
  {
    id: 'cooper',
    label: 'Test de Cooper (12 min)',
    description: 'Distance maximale parcourue en 12 minutes sur piste.',
    inputs: [{ id: 'distance', label: 'Distance parcourue', unit: 'm', min: 800, max: 5000, step: 10 }],
    calculate: ({ distance }) => distance / 200,
  },
  {
    id: 'demi-cooper',
    label: 'Demi-Cooper (6 min)',
    description: 'Distance maximale parcourue en 6 minutes sur piste.',
    inputs: [{ id: 'distance', label: 'Distance parcourue', unit: 'm', min: 400, max: 2800, step: 10 }],
    calculate: ({ distance }) => distance / 100,
  },
  {
    id: 'vameval',
    label: 'VAMEVAL',
    description: 'Test progressif continu. Départ 8 km/h, +0.5 km/h par minute. Bips sonores sur piste 200m.',
    inputs: [{ id: 'lastSpeed', label: 'Dernier palier complété', unit: 'km/h', min: 8, max: 26, step: 0.5 }],
    calculate: ({ lastSpeed }) => lastSpeed,
  },
  {
    id: 'leger-boucher',
    label: 'Léger-Boucher (UMTT)',
    description: 'Test progressif continu sur piste. Départ variable, +1 km/h toutes les 2 minutes.',
    inputs: [{ id: 'lastSpeed', label: 'Dernier palier complété', unit: 'km/h', min: 8, max: 26, step: 0.5 }],
    calculate: ({ lastSpeed }) => lastSpeed,
  },
  {
    id: '30-15-ift',
    label: '30-15 IFT (Buchheit)',
    description: 'Test intermittent : 30s course / 15s marche. +0.5 km/h par palier. Résultat = VIFT (≠ VMA). Conversion approximative.',
    inputs: [{ id: 'vift', label: 'VIFT (dernier palier)', unit: 'km/h', min: 10, max: 26, step: 0.5 }],
    // VIFT surestime la VMA à cause de la composante intermittente
    // Facteur de conversion empirique ~0.83 (Buchheit 2008, Sandford 2019)
    calculate: ({ vift }) => vift * 0.83,
    note: 'La VIFT surestime la VMA (~×0.83). Ce test est davantage conçu pour les sports collectifs.',
  },
  {
    id: 'time-trial',
    label: 'Temps sur distance (piste)',
    description: 'Effort maximal sur une distance connue. Correction appliquée selon la distance.',
    inputs: [
      {
        id: 'ttDistance', label: 'Distance', unit: 'm', type: 'select',
        options: [
          { value: 1500, label: '1 500 m' },
          { value: 2000, label: '2 000 m' },
          { value: 3000, label: '3 000 m' },
          { value: 5000, label: '5 000 m' },
        ],
      },
      { id: 'minutes', label: 'Minutes', unit: 'min', min: 0, max: 40, step: 1 },
      { id: 'seconds', label: 'Secondes', unit: 's', min: 0, max: 59, step: 1 },
    ],
    calculate: ({ ttDistance, minutes, seconds }) => {
      const totalSeconds = (minutes || 0) * 60 + (seconds || 0)
      if (totalSeconds === 0) return null
      const avgSpeedKmh = (ttDistance / totalSeconds) * 3.6
      // Corrections selon la distance (Lacour & Bourdin 2015)
      // Plus la distance est courte, plus la vitesse moyenne surestime la VMA
      const corrections = { 1500: 0.94, 2000: 0.97, 3000: 1.0, 5000: 1.035 }
      const factor = corrections[ttDistance] || 1.0
      return avgSpeedKmh * factor
    },
  },
]

// ─── Estimation VO2max ──────────────────────────────────────────────────────

/**
 * VO2max estimé à partir de la VMA (formule de Léger).
 * VO2max (ml/kg/min) ≈ VMA (km/h) × 3.5
 */
export function estimateVO2max(vmaKmh) {
  return vmaKmh * 3.5
}

// ─── Table de référence VMA par niveau ──────────────────────────────────────

export const VMA_REFERENCE = [
  { level: 'Débutant', men: '10-13', women: '8-11', vo2max: '35-46' },
  { level: 'Intermédiaire', men: '13-16', women: '11-14', vo2max: '46-56' },
  { level: 'Confirmé', men: '16-19', women: '14-17', vo2max: '56-67' },
  { level: 'Expert', men: '19-22', women: '17-19', vo2max: '67-77' },
  { level: 'Élite', men: '22+', women: '19+', vo2max: '77+' },
]
