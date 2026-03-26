/**
 * Calcul de la Vitesse Critique (VC) et de D' (capacité anaérobie de distance).
 *
 * Modèle linéaire distance-temps (Monod & Scherrer, 1965 ; Hill, 1993) :
 *   d = CS × t + D'
 *
 * Où :
 *   - d = distance parcourue (m)
 *   - t = temps (s)
 *   - CS (Critical Speed) = pente de la droite d vs t → vitesse soutenable
 *   - D' = ordonnée à l'origine → réserve anaérobie (en mètres)
 *
 * Régression linéaire de d en fonction de t :
 *   CS = (n × Σ(t×d) - Σt × Σd) / (n × Σ(t²) - (Σt)²)
 *   D' = (Σd - CS × Σt) / n
 *
 * Méthode alternative — modèle hyperbolique (temps = f(vitesse)) :
 *   t = D' / (v - CS)
 *   → linéarisé en : 1/t = (v - CS) / D'  →  t × v = CS × t + D'
 *   Revient au même modèle linéaire d = CS × t + D'
 *
 * Sources :
 * - Monod H, Scherrer J. (1965). The work capacity of a synergic muscular group.
 * - Hill DW. (1993). The critical power concept.
 * - Jones AM, Vanhatalo A. (2017). The 'Critical Power' concept.
 */

/**
 * Calcule la vitesse critique à partir de paires (distance_m, temps_s).
 * Nécessite au minimum 2 points, 3 recommandés pour la fiabilité.
 *
 * @param {Array<{distance: number, time: number}>} trials
 *   - distance en mètres
 *   - time en secondes
 * @returns {{ cs: number, dPrime: number, r2: number, details: object } | { error: string }}
 */
export function calculateCriticalSpeed(trials) {
  // Filtrer les essais valides
  const valid = trials.filter(t => t.distance > 0 && t.time > 0)

  if (valid.length < 2) {
    return { error: 'Minimum 2 essais valides requis pour le calcul.' }
  }

  const n = valid.length

  // Régression linéaire : d = CS × t + D'
  // x = temps (s), y = distance (m)
  const sumT = valid.reduce((s, v) => s + v.time, 0)
  const sumD = valid.reduce((s, v) => s + v.distance, 0)
  const sumTD = valid.reduce((s, v) => s + v.time * v.distance, 0)
  const sumT2 = valid.reduce((s, v) => s + v.time * v.time, 0)

  const denominator = n * sumT2 - sumT * sumT
  if (denominator === 0) {
    return { error: 'Données insuffisantes — les temps sont identiques.' }
  }

  // CS = pente (m/s)
  const cs = (n * sumTD - sumT * sumD) / denominator
  // D' = ordonnée à l'origine (m)
  const dPrime = (sumD - cs * sumT) / n

  if (cs <= 0) {
    return { error: 'Résultat incohérent (vitesse critique ≤ 0). Vérifiez les données saisies.' }
  }

  // Coefficient de détermination R²
  const meanD = sumD / n
  const ssTot = valid.reduce((s, v) => s + Math.pow(v.distance - meanD, 2), 0)
  const ssRes = valid.reduce((s, v) => {
    const predicted = cs * v.time + dPrime
    return s + Math.pow(v.distance - predicted, 2)
  }, 0)
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 1

  // Vitesses dérivées
  const csKmh = cs * 3.6 // m/s → km/h
  const csPaceMinKm = 1000 / cs / 60 // min/km
  const paceMin = Math.floor(csPaceMinKm)
  const paceSec = Math.round((csPaceMinKm - paceMin) * 60)

  return {
    cs,                         // m/s
    csKmh,                      // km/h
    csPace: { min: paceMin, sec: paceSec }, // allure min/km
    dPrime,                     // mètres
    r2,                         // qualité du modèle (0-1)
    n: valid.length,
    details: {
      trials: valid.map(v => ({
        distance: v.distance,
        time: v.time,
        speed: v.distance / v.time,          // m/s
        speedKmh: (v.distance / v.time) * 3.6, // km/h
        predicted: cs * v.time + dPrime,     // distance prédite
        residual: v.distance - (cs * v.time + dPrime),
      })),
    },
  }
}

/**
 * Mode "distance fixe" : l'utilisateur entre des distances types et le temps mis.
 * Ex: 800m en 2:45, 1600m en 6:10, 3200m en 13:30
 *
 * @param {Array<{distanceM: number, minutes: number, seconds: number}>} entries
 */
export function calcCSFromFixedDistances(entries) {
  const trials = entries
    .filter(e => e.distanceM > 0 && (e.minutes > 0 || e.seconds > 0))
    .map(e => ({
      distance: e.distanceM,
      time: e.minutes * 60 + e.seconds,
    }))
  return calculateCriticalSpeed(trials)
}

/**
 * Mode "temps fixe" : l'utilisateur entre des durées fixes et la distance parcourue.
 * Ex: 3 min → 850m, 6 min → 1550m, 12 min → 2900m
 *
 * @param {Array<{durationMin: number, distanceM: number}>} entries
 */
export function calcCSFromFixedDurations(entries) {
  const trials = entries
    .filter(e => e.durationMin > 0 && e.distanceM > 0)
    .map(e => ({
      distance: e.distanceM,
      time: e.durationMin * 60,
    }))
  return calculateCriticalSpeed(trials)
}

// ─── Analyse du profil coureur ────────────────────────────────────────────

/**
 * Analyse du profil coureur (vitesse vs endurance) à partir des données de VC.
 *
 * Trois indicateurs complémentaires :
 *
 * 1. EXPOSANT DE RIEGEL (fatigue factor)
 *    Modèle de Riegel (1981) : T2 = T1 × (D2/D1)^k
 *    - k ≈ 1.06 pour un coureur "moyen" (Riegel, 1981)
 *    - k < 1.06 → profil endurant (moins de perte sur la distance)
 *    - k > 1.06 → profil vitesse (plus de perte sur la distance)
 *    Calculé par régression log-log : log(T) = k × log(D) + c
 *
 * 2. RATIO D'/VC (Anaerobic Speed Reserve relative)
 *    D' = capacité de travail au-dessus de la VC (en mètres).
 *    Le ratio D'/VC (secondes) reflète la contribution anaérobie relative.
 *    - D' élevé / VC → profil explosif/vitesse
 *    - D' faible / VC → profil aérobie/endurant
 *    Valeurs typiques (Vanhatalo et al., 2011 ; Jones & Vanhatalo, 2017) :
 *      - Entraînés : D' = 100–300 m, ratio D'/VC ≈ 25–80 s
 *      - Sprinters/vitesse : D' > 250 m, ratio > 60 s
 *      - Endurants purs : D' < 150 m, ratio < 40 s
 *
 * 3. PENTE DE DÉCROISSANCE DE VITESSE (Speed-Distance Relationship)
 *    Taux de décroissance de la vitesse entre le plus court et le plus long essai.
 *    Un fort taux = profil vitesse, un faible taux = profil endurant.
 *
 * Sources :
 * - Riegel PS. (1981). Athletic Records and Human Endurance.
 * - Vanhatalo A, Jones AM, Burnley M. (2011). Application of critical power in sport.
 * - Billat V, et al. (1999). Interval training at VO2max.
 * - Kennelly AE. (1906). An approximate law of fatigue in the speeds of racing animals.
 * - Péronnet F, Thibault G. (1989). Mathematical analysis of running performance.
 */
export function analyzeRunnerProfile(csResult) {
  if (!csResult || csResult.error || !csResult.details?.trials) {
    return null
  }

  const trials = csResult.details.trials
  if (trials.length < 2) return null

  const cs = csResult.cs         // m/s
  const dPrime = csResult.dPrime // m
  const _csKmh = csResult.csKmh

  // ── 1. Exposant de Riegel ──
  // Régression log-log : log(t) = k × log(d) + c
  const riegelK = calcRiegelExponent(trials)

  // ── 2. Ratio D'/VC ──
  // D' en mètres, VC en m/s → ratio en secondes
  // Représente le temps pendant lequel le coureur peut maintenir un effort
  // au-dessus de la VC en utilisant sa réserve anaérobie
  const dPrimeRatio = cs > 0 ? dPrime / cs : 0

  // ── 3. Pente de décroissance de vitesse ──
  const sorted = [...trials].sort((a, b) => a.distance - b.distance)
  const shortest = sorted[0]
  const longest = sorted[sorted.length - 1]
  const speedDropPercent = shortest.speed > 0
    ? ((shortest.speed - longest.speed) / shortest.speed) * 100
    : 0

  // ── Classification composite ──
  const profile = classifyProfile(riegelK, dPrimeRatio, speedDropPercent)

  // ── Prédictions de temps sur distances standards (Riegel) ──
  const predictions = generatePredictions(trials, riegelK)

  return {
    riegelK,
    dPrime,
    dPrimeRatio,           // secondes
    speedDropPercent,
    profile,
    predictions,
    indicators: {
      riegel: classifyRiegel(riegelK),
      dPrimeAnalysis: classifyDPrime(dPrimeRatio),
      speedDrop: classifySpeedDrop(speedDropPercent),
    },
  }
}

/**
 * Calcul de l'exposant de Riegel par régression log-log.
 * log(t) = k × log(d) + c  →  k = pente
 */
function calcRiegelExponent(trials) {
  const n = trials.length
  const logD = trials.map(t => Math.log(t.distance))
  const logT = trials.map(t => Math.log(t.time))

  const sumLogD = logD.reduce((a, b) => a + b, 0)
  const sumLogT = logT.reduce((a, b) => a + b, 0)
  const sumLogDLogT = logD.reduce((s, ld, i) => s + ld * logT[i], 0)
  const sumLogD2 = logD.reduce((s, ld) => s + ld * ld, 0)

  const denom = n * sumLogD2 - sumLogD * sumLogD
  if (denom === 0) return 1.06 // fallback

  return (n * sumLogDLogT - sumLogD * sumLogT) / denom
}

/**
 * Classification composite du profil.
 *
 * Scoring : chaque indicateur donne un score de -1 (endurant) à +1 (vitesse).
 * Le score composite détermine le profil.
 */
function classifyProfile(riegelK, dPrimeRatio, speedDropPercent) {
  let score = 0
  let count = 0

  // Riegel : 1.06 = neutre, < 1.03 = endurant, > 1.09 = vitesse
  if (riegelK < 1.00) { score -= 1; count++ }
  else if (riegelK < 1.03) { score -= 0.7; count++ }
  else if (riegelK < 1.05) { score -= 0.3; count++ }
  else if (riegelK <= 1.07) { score += 0; count++ }
  else if (riegelK <= 1.09) { score += 0.3; count++ }
  else if (riegelK <= 1.12) { score += 0.7; count++ }
  else { score += 1; count++ }

  // D'/VC ratio : < 35s = endurant, 35-55s = équilibré, > 55s = vitesse
  if (dPrimeRatio < 25) { score -= 1; count++ }
  else if (dPrimeRatio < 35) { score -= 0.5; count++ }
  else if (dPrimeRatio <= 55) { score += 0; count++ }
  else if (dPrimeRatio <= 70) { score += 0.5; count++ }
  else { score += 1; count++ }

  // Speed drop : < 10% = endurant, 10-18% = équilibré, > 18% = vitesse
  if (speedDropPercent < 8) { score -= 0.7; count++ }
  else if (speedDropPercent < 12) { score -= 0.3; count++ }
  else if (speedDropPercent <= 18) { score += 0; count++ }
  else if (speedDropPercent <= 25) { score += 0.5; count++ }
  else { score += 1; count++ }

  const avg = count > 0 ? score / count : 0

  if (avg <= -0.4) {
    return {
      type: 'endurance',
      label: 'Profil endurant',
      color: '#22c55e',
      description: 'Le patient maintient bien sa vitesse sur la distance. Sa capacité aérobie est un point fort.',
      recommendation: 'Prioriser le travail de vitesse et la puissance musculaire pour développer le potentiel anaérobie.',
      training: [
        'Fractionné court (200-400m) à haute intensité (> 100% VMA)',
        'Travail de côtes courtes (8-12s) pour la puissance neuromusculaire',
        'Sprint en côte et exercices de pliométrie',
        'Séances de vitesse spécifique (rappels de vitesse en fin de sortie longue)',
        'Renforcement musculaire orienté puissance (squats, fentes dynamiques)',
      ],
      score: avg,
    }
  } else if (avg >= 0.4) {
    return {
      type: 'speed',
      label: 'Profil vitesse',
      color: '#3b82f6',
      description: 'Le patient a une bonne capacité anaérobie mais perd en efficacité sur les efforts longs.',
      recommendation: 'Prioriser le développement de l\'endurance aérobie et la capacité à maintenir l\'effort.',
      training: [
        'Augmenter progressivement le volume hebdomadaire (règle des 10%)',
        'Sorties longues régulières (> 60 min à intensité modérée)',
        'Travail au seuil / tempo runs (allure VC sur 20-40 min)',
        'Fractionné long (1000-2000m à 90-95% VC)',
        'Endurance fondamentale (70-75% VC) en volume',
      ],
      score: avg,
    }
  } else {
    return {
      type: 'balanced',
      label: 'Profil équilibré',
      color: '#eab308',
      description: 'Bon équilibre entre les qualités de vitesse et d\'endurance.',
      recommendation: 'Maintenir l\'équilibre avec un entraînement polarisé et cibler les points faibles spécifiques à l\'objectif.',
      training: [
        'Entraînement polarisé : 80% en endurance fondamentale, 20% en haute intensité',
        'Alterner semaines à dominante volume et semaines à dominante intensité',
        'Séances mixtes (ex: fractionné 6 × 1000m puis 15 min au seuil)',
        'Cibler les exigences spécifiques de l\'objectif (distance de compétition)',
        'Maintenir la variété des stimuli (côtes, piste, terrain varié)',
      ],
      score: avg,
    }
  }
}

function classifyRiegel(k) {
  if (k < 1.03) return { label: 'Endurant', color: '#22c55e', detail: `k = ${k.toFixed(3)} (réf: 1.06)` }
  if (k <= 1.09) return { label: 'Équilibré', color: '#eab308', detail: `k = ${k.toFixed(3)} (réf: 1.06)` }
  return { label: 'Vitesse', color: '#3b82f6', detail: `k = ${k.toFixed(3)} (réf: 1.06)` }
}

function classifyDPrime(ratio) {
  if (ratio < 35) return { label: 'Endurant', color: '#22c55e', detail: `D'/VC = ${ratio.toFixed(0)}s (réf: 35-55s)` }
  if (ratio <= 55) return { label: 'Équilibré', color: '#eab308', detail: `D'/VC = ${ratio.toFixed(0)}s (réf: 35-55s)` }
  return { label: 'Vitesse', color: '#3b82f6', detail: `D'/VC = ${ratio.toFixed(0)}s (réf: 35-55s)` }
}

function classifySpeedDrop(drop) {
  if (drop < 12) return { label: 'Endurant', color: '#22c55e', detail: `Perte: ${drop.toFixed(1)}% (réf: 12-18%)` }
  if (drop <= 18) return { label: 'Équilibré', color: '#eab308', detail: `Perte: ${drop.toFixed(1)}% (réf: 12-18%)` }
  return { label: 'Vitesse', color: '#3b82f6', detail: `Perte: ${drop.toFixed(1)}% (réf: 12-18%)` }
}

/**
 * Prédictions de temps sur distances standards via le modèle de Riegel.
 * T2 = T1 × (D2/D1)^k
 * Utilise le meilleur essai comme référence.
 */
function generatePredictions(trials, riegelK) {
  // Utiliser l'essai le plus long comme référence (plus fiable pour prédire)
  const ref = [...trials].sort((a, b) => b.distance - a.distance)[0]

  const distances = [
    { label: '1 500 m', meters: 1500 },
    { label: '3 000 m', meters: 3000 },
    { label: '5 km', meters: 5000 },
    { label: '10 km', meters: 10000 },
    { label: 'Semi-marathon', meters: 21097 },
    { label: 'Marathon', meters: 42195 },
  ]

  return distances.map(d => {
    const predictedTime = ref.time * Math.pow(d.meters / ref.distance, riegelK)
    const hours = Math.floor(predictedTime / 3600)
    const minutes = Math.floor((predictedTime % 3600) / 60)
    const seconds = Math.round(predictedTime % 60)
    const pace = predictedTime / (d.meters / 1000) / 60 // min/km
    const paceMin = Math.floor(pace)
    const paceSec = Math.round((pace - paceMin) * 60)

    return {
      label: d.label,
      meters: d.meters,
      timeSeconds: predictedTime,
      timeFormatted: hours > 0
        ? `${hours}h${String(minutes).padStart(2, '0')}'${String(seconds).padStart(2, '0')}"`
        : `${minutes}'${String(seconds).padStart(2, '0')}"`,
      pace: `${paceMin}'${String(paceSec).padStart(2, '0')}"/km`,
      speedKmh: (d.meters / predictedTime) * 3.6,
    }
  })
}
