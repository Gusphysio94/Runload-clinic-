/**
 * Analyse de test lactate et détermination des seuils et zones d'entraînement.
 *
 * Modèles implémentés :
 *
 * 1. SEUIL AÉROBIE (LT1 / premier seuil ventilatoire)
 *    Correspond au premier point d'inflexion de la courbe lactate-vitesse,
 *    généralement situé entre 1.5 et 2.0 mmol/L.
 *    Méthode : point où le lactate augmente de > 0.5 mmol/L par rapport au repos
 *    ou dépasse 2.0 mmol/L de façon soutenue.
 *    → Limite supérieure de la zone d'endurance fondamentale.
 *
 * 2. SEUIL ANAÉROBIE (LT2 / MLSS / OBLA)
 *    Plusieurs conventions :
 *    - Seuil fixe à 4 mmol/L (OBLA — Onset of Blood Lactate Accumulation, Sjödin & Jacobs 1981)
 *    - MLSS (Maximal Lactate Steady State) — vitesse max sans accumulation continue
 *    - Méthode Dmax (Cheng et al., 1992) — point de distance maximale entre la courbe
 *      et la droite reliant le premier et dernier point
 *    - Méthode du log-log (Beaver et al., 1985)
 *    → Limite supérieure de l'effort soutenable prolongé (~30-60 min).
 *
 * 3. SEUILS INDIVIDUALISÉS
 *    - Méthode +1.5 mmol/L au-dessus du minimum (Coyle et al., 1983)
 *    - Méthode Dmax modifiée (Bishop et al., 1998)
 *
 * Sources :
 * - Faude O, Kindermann W, Meyer T. (2009). Lactate threshold concepts.
 * - Billat VL. (1996). Use of blood lactate measurements for prediction of exercise performance.
 * - Jones AM, Carter H. (2000). The effect of endurance training on parameters of aerobic fitness.
 * - Beneke R, et al. (2011). Methodological aspects of MLSS determination.
 */

/**
 * Analyse complète d'un test lactate par paliers.
 *
 * @param {Array<{speed: number, lactate: number, hr: number|null, rpe: number|null}>} stages
 *   - speed : vitesse du palier (km/h)
 *   - lactate : lactatémie (mmol/L)
 *   - hr : fréquence cardiaque (bpm) — optionnel
 *   - rpe : effort perçu — optionnel
 * @returns {Object} résultats complets
 */
export function analyzeLactateTest(stages) {
  const valid = stages.filter(s => s.speed > 0 && s.lactate >= 0)

  if (valid.length < 3) {
    return { error: 'Minimum 3 paliers valides requis.' }
  }

  // Trier par vitesse croissante
  const sorted = [...valid].sort((a, b) => a.speed - b.speed)

  // ── Seuil aérobie (LT1) ──
  const lt1 = findLT1(sorted)

  // ── Seuil anaérobie par méthodes multiples ──
  const obla4 = findOBLA(sorted, 4.0)
  const dmax = findDmax(sorted)
  const baseline = findBaselinePlus(sorted, 1.5)
  const loglog = findLogLogThreshold(sorted)

  // Seuil anaérobie retenu = moyenne des méthodes valides (consensus)
  const lt2Methods = [obla4, dmax, baseline, loglog].filter(m => m !== null)
  const lt2 = lt2Methods.length > 0
    ? {
        speed: lt2Methods.reduce((s, m) => s + m.speed, 0) / lt2Methods.length,
        lactate: lt2Methods.reduce((s, m) => s + m.lactate, 0) / lt2Methods.length,
      }
    : null

  // FC aux seuils (interpolation)
  const lt1HR = lt1 && hasHR(sorted) ? interpolateHR(sorted, lt1.speed) : null
  const lt2HR = lt2 && hasHR(sorted) ? interpolateHR(sorted, lt2.speed) : null

  // Zones d'entraînement
  const zones = lt1 && lt2 ? buildZones(lt1, lt2, sorted, lt1HR, lt2HR) : null

  // Interprétation clinique
  const interpretation = generateInterpretation(sorted, lt1, lt2, obla4, dmax, zones)

  // Lactatémie de repos et max
  const restLactate = sorted[0].lactate
  const maxLactate = Math.max(...sorted.map(s => s.lactate))
  const maxSpeed = sorted[sorted.length - 1].speed

  // Courbe lactate interpolée pour le graphique
  const curve = generateSmoothCurve(sorted)

  return {
    stages: sorted,
    lt1,
    lt2,
    lt1HR,
    lt2HR,
    methods: {
      obla4,
      dmax,
      baseline,
      loglog,
    },
    zones,
    interpretation,
    stats: {
      restLactate,
      maxLactate,
      maxSpeed,
      stageCount: sorted.length,
      lt1lt2Gap: lt1 && lt2 ? lt2.speed - lt1.speed : null,
    },
    curve,
  }
}

// ─── Seuil aérobie (LT1) ────────────────────────────────────────────────

/**
 * LT1 : premier point d'inflexion significatif.
 * Méthode : premier palier où le lactate dépasse la valeur de repos + 0.5 mmol/L
 * ET dépasse 1.5 mmol/L, de manière soutenue (le palier suivant confirme).
 */
function findLT1(stages) {
  if (stages.length < 3) return null

  const baseline = stages[0].lactate

  for (let i = 1; i < stages.length - 1; i++) {
    const delta = stages[i].lactate - baseline
    if (delta >= 0.5 && stages[i].lactate >= 1.5 && stages[i + 1].lactate > stages[i].lactate) {
      // Interpoler pour plus de précision
      const prev = stages[i - 1]
      const curr = stages[i]
      const targetLactate = baseline + 0.5

      if (prev.lactate < targetLactate && curr.lactate >= targetLactate) {
        const ratio = (targetLactate - prev.lactate) / (curr.lactate - prev.lactate)
        return {
          speed: prev.speed + ratio * (curr.speed - prev.speed),
          lactate: targetLactate,
          method: 'Baseline + 0.5 mmol/L',
        }
      }
      return { speed: curr.speed, lactate: curr.lactate, method: 'Premier point d\'inflexion' }
    }
  }

  // Fallback : seuil fixe à 2.0 mmol/L
  return findFixedThreshold(stages, 2.0, 'Seuil fixe 2.0 mmol/L')
}

// ─── OBLA (seuil fixe) ─────────────────────────────────────────────────

/**
 * OBLA : interpolation linéaire pour trouver la vitesse à un seuil fixe de lactate.
 * Convention classique : 4 mmol/L (Sjödin & Jacobs, 1981).
 */
function findOBLA(stages, threshold) {
  return findFixedThreshold(stages, threshold, `OBLA ${threshold} mmol/L`)
}

function findFixedThreshold(stages, threshold, methodName) {
  for (let i = 1; i < stages.length; i++) {
    if (stages[i].lactate >= threshold && stages[i - 1].lactate < threshold) {
      const ratio = (threshold - stages[i - 1].lactate) / (stages[i].lactate - stages[i - 1].lactate)
      return {
        speed: stages[i - 1].speed + ratio * (stages[i].speed - stages[i - 1].speed),
        lactate: threshold,
        method: methodName,
      }
    }
  }
  // Si le lactate max n'atteint pas le seuil
  if (stages[stages.length - 1].lactate < threshold) return null
  // Si dès le départ on est au-dessus
  return { speed: stages[0].speed, lactate: threshold, method: methodName }
}

// ─── Méthode Dmax (Cheng et al., 1992) ─────────────────────────────────

/**
 * Dmax : point de distance maximale entre la courbe lactate réelle et
 * la droite reliant le premier et le dernier point de mesure.
 *
 * Procédure :
 * 1. Ajuster un polynôme de degré 3 aux données lactate = f(vitesse)
 * 2. Tracer la droite entre le premier et dernier point
 * 3. Le Dmax est le point où la distance perpendiculaire est maximale
 */
function findDmax(stages) {
  if (stages.length < 4) return null

  // Régression polynomiale de degré 3
  const coeffs = polyFit(
    stages.map(s => s.speed),
    stages.map(s => s.lactate),
    3
  )
  if (!coeffs) return null

  // Droite entre premier et dernier point
  const first = stages[0]
  const last = stages[stages.length - 1]
  const lineSlope = (last.lactate - first.lactate) / (last.speed - first.speed)
  const lineIntercept = first.lactate - lineSlope * first.speed

  // Chercher le point de distance maximale
  let maxDist = 0
  let dmaxSpeed = 0

  const steps = 200
  for (let i = 0; i <= steps; i++) {
    const speed = first.speed + (last.speed - first.speed) * (i / steps)
    const curveLactate = polyEval(coeffs, speed)
    const lineLactate = lineSlope * speed + lineIntercept

    // Distance perpendiculaire point-droite
    // Droite : ax + by + c = 0  →  a = lineSlope, b = -1, c = lineIntercept
    const dist = Math.abs(curveLactate - lineLactate) / Math.sqrt(lineSlope * lineSlope + 1)

    if (dist > maxDist) {
      maxDist = dist
      dmaxSpeed = speed
    }
  }

  if (dmaxSpeed === 0) return null

  return {
    speed: dmaxSpeed,
    lactate: polyEval(coeffs, dmaxSpeed),
    method: 'Dmax (Cheng et al., 1992)',
  }
}

// ─── Baseline + Δ (Coyle et al., 1983) ─────────────────────────────────

/**
 * Seuil individualisé : vitesse à laquelle le lactate dépasse
 * la valeur minimale de Δ mmol/L.
 */
function findBaselinePlus(stages, delta) {
  const minLactate = Math.min(...stages.map(s => s.lactate))
  const threshold = minLactate + delta
  return findFixedThreshold(stages, threshold, `Minimum + ${delta} mmol/L`)
}

// ─── Méthode Log-Log (Beaver et al., 1985) ──────────────────────────────

/**
 * Log-log : on applique log(lactate) = f(log(vitesse)).
 * Le seuil est le point d'intersection de deux droites ajustées
 * sur la phase basse et la phase haute.
 */
function findLogLogThreshold(stages) {
  if (stages.length < 5) return null

  const logData = stages.map(s => ({
    logSpeed: Math.log(s.speed),
    logLactate: Math.log(Math.max(s.lactate, 0.1)),
    speed: s.speed,
    lactate: s.lactate,
  }))

  // Chercher le meilleur point de coupure (minimum des résidus combinés)
  let bestCut = 2
  let bestError = Infinity

  for (let cut = 2; cut < logData.length - 1; cut++) {
    const low = logData.slice(0, cut + 1)
    const high = logData.slice(cut)

    const regLow = linearRegression(low.map(d => d.logSpeed), low.map(d => d.logLactate))
    const regHigh = linearRegression(high.map(d => d.logSpeed), high.map(d => d.logLactate))

    if (!regLow || !regHigh) continue

    const errorLow = low.reduce((s, d) =>
      s + Math.pow(d.logLactate - (regLow.slope * d.logSpeed + regLow.intercept), 2), 0)
    const errorHigh = high.reduce((s, d) =>
      s + Math.pow(d.logLactate - (regHigh.slope * d.logSpeed + regHigh.intercept), 2), 0)

    const totalError = errorLow + errorHigh
    if (totalError < bestError) {
      bestError = totalError
      bestCut = cut
    }
  }

  // Intersection des deux droites en espace log
  const low = logData.slice(0, bestCut + 1)
  const high = logData.slice(bestCut)
  const regLow = linearRegression(low.map(d => d.logSpeed), low.map(d => d.logLactate))
  const regHigh = linearRegression(high.map(d => d.logSpeed), high.map(d => d.logLactate))

  if (!regLow || !regHigh || regLow.slope === regHigh.slope) return null

  const logSpeedThreshold = (regHigh.intercept - regLow.intercept) / (regLow.slope - regHigh.slope)
  const speedThreshold = Math.exp(logSpeedThreshold)
  const lactateThreshold = Math.exp(regLow.slope * logSpeedThreshold + regLow.intercept)

  // Vérifier que le seuil est dans la plage des données
  if (speedThreshold < stages[0].speed || speedThreshold > stages[stages.length - 1].speed) return null

  return {
    speed: speedThreshold,
    lactate: lactateThreshold,
    method: 'Log-log (Beaver et al., 1985)',
  }
}

// ─── Zones d'entraînement basées sur les seuils lactate ─────────────────

/**
 * Construit 5 zones d'entraînement à partir de LT1 et LT2.
 *
 * Z1 — Récupération active : < 80% LT1
 * Z2 — Endurance fondamentale : 80% LT1 – LT1
 * Z3 — Endurance active / Tempo : LT1 – LT2
 * Z4 — Seuil : LT2 – 105% LT2
 * Z5 — VO2max / Supra-seuil : > 105% LT2
 */
function buildZones(lt1, lt2, stages, lt1HR, lt2HR) {
  const maxSpeed = stages[stages.length - 1].speed

  const zones = [
    {
      zone: 1,
      label: 'Z1 — Récupération active',
      color: '#93c5fd',
      speedMin: 0,
      speedMax: lt1.speed * 0.80,
      lactateRange: '< 1.5 mmol/L',
      description: 'Récupération, échauffement, retour au calme',
      hrMin: lt1HR ? Math.round(lt1HR * 0.70) : null,
      hrMax: lt1HR ? Math.round(lt1HR * 0.80) : null,
    },
    {
      zone: 2,
      label: 'Z2 — Endurance fondamentale',
      color: '#22c55e',
      speedMin: lt1.speed * 0.80,
      speedMax: lt1.speed,
      lactateRange: '1.5–2.0 mmol/L',
      description: 'Base aérobie, oxydation des graisses, volume',
      hrMin: lt1HR ? Math.round(lt1HR * 0.80) : null,
      hrMax: lt1HR ? Math.round(lt1HR) : null,
    },
    {
      zone: 3,
      label: 'Z3 — Tempo / Endurance active',
      color: '#eab308',
      speedMin: lt1.speed,
      speedMax: lt2.speed,
      lactateRange: '2.0–4.0 mmol/L',
      description: 'Zone de transition, développement du seuil, tempo runs',
      hrMin: lt1HR ? Math.round(lt1HR) : null,
      hrMax: lt2HR ? Math.round(lt2HR) : null,
    },
    {
      zone: 4,
      label: 'Z4 — Seuil anaérobie',
      color: '#f97316',
      speedMin: lt2.speed,
      speedMax: lt2.speed * 1.05,
      lactateRange: '4.0–6.0 mmol/L',
      description: 'Travail au seuil, intervalles longs, compétition 10k-semi',
      hrMin: lt2HR ? Math.round(lt2HR) : null,
      hrMax: lt2HR ? Math.round(lt2HR * 1.03) : null,
    },
    {
      zone: 5,
      label: 'Z5 — VO2max / Supra-seuil',
      color: '#ef4444',
      speedMin: lt2.speed * 1.05,
      speedMax: maxSpeed,
      lactateRange: '> 6 mmol/L',
      description: 'Intervalles courts, VMA, compétition 1500-5000m',
      hrMin: lt2HR ? Math.round(lt2HR * 1.03) : null,
      hrMax: null,
    },
  ]

  return zones
}

// ─── Interprétation clinique ────────────────────────────────────────────

function generateInterpretation(stages, lt1, lt2, obla4, dmax, _zones) {
  const items = []

  if (!lt1 || !lt2) {
    items.push({
      type: 'warning',
      title: 'Données insuffisantes',
      message: 'Impossible de déterminer les deux seuils avec fiabilité. Vérifiez le protocole et les données.',
    })
    return items
  }

  const restLactate = stages[0].lactate
  const maxLactate = Math.max(...stages.map(s => s.lactate))
  const maxSpeed = stages[stages.length - 1].speed
  const lt1Pct = (lt1.speed / maxSpeed) * 100
  const lt2Pct = (lt2.speed / maxSpeed) * 100
  const gap = lt2.speed - lt1.speed

  // ── Lactatémie de repos ──
  if (restLactate > 2.0) {
    items.push({
      type: 'warning',
      title: 'Lactatémie de repos élevée',
      message: `Lactate au repos à ${restLactate.toFixed(1)} mmol/L (norme < 2.0). Vérifier : alimentation pré-test, fatigue résiduelle, stress, consommation de glucides récente, protocole d'échauffement.`,
    })
  } else {
    items.push({
      type: 'info',
      title: 'Lactatémie de repos',
      message: `${restLactate.toFixed(1)} mmol/L — dans les normes (< 2.0 mmol/L).`,
    })
  }

  // ── Position du LT1 ──
  if (lt1Pct > 75) {
    items.push({
      type: 'positive',
      title: 'Seuil aérobie élevé',
      message: `LT1 à ${lt1.speed.toFixed(1)} km/h (${lt1Pct.toFixed(0)}% de Vmax). Bonne base aérobie — le patient utilise efficacement le métabolisme oxydatif à des intensités élevées.`,
    })
  } else if (lt1Pct < 60) {
    items.push({
      type: 'warning',
      title: 'Seuil aérobie bas',
      message: `LT1 à ${lt1.speed.toFixed(1)} km/h (${lt1Pct.toFixed(0)}% de Vmax). La base aérobie est à développer. Prioriser le volume en endurance fondamentale (Z2).`,
    })
  } else {
    items.push({
      type: 'info',
      title: 'Seuil aérobie (LT1)',
      message: `${lt1.speed.toFixed(1)} km/h (${lt1Pct.toFixed(0)}% de Vmax) — dans la moyenne.`,
    })
  }

  // ── Position du LT2 ──
  if (lt2Pct > 88) {
    items.push({
      type: 'positive',
      title: 'Seuil anaérobie élevé',
      message: `LT2 à ${lt2.speed.toFixed(1)} km/h (${lt2Pct.toFixed(0)}% de Vmax). Excellente capacité à soutenir des intensités élevées sans accumulation lactique.`,
    })
  } else if (lt2Pct < 78) {
    items.push({
      type: 'warning',
      title: 'Seuil anaérobie bas',
      message: `LT2 à ${lt2.speed.toFixed(1)} km/h (${lt2Pct.toFixed(0)}% de Vmax). Marge de progression importante. Travail au seuil (Z3-Z4) recommandé : tempo runs, intervalles longs.`,
    })
  } else {
    items.push({
      type: 'info',
      title: 'Seuil anaérobie (LT2)',
      message: `${lt2.speed.toFixed(1)} km/h (${lt2Pct.toFixed(0)}% de Vmax).`,
    })
  }

  // ── Écart LT1-LT2 (zone de transition) ──
  if (gap < 1.5) {
    items.push({
      type: 'warning',
      title: 'Zone de transition étroite',
      message: `Écart LT1-LT2 de seulement ${gap.toFixed(1)} km/h. Marge de manoeuvre faible entre endurance et seuil. L'accumulation lactique survient rapidement au-delà de l'endurance fondamentale.`,
    })
  } else if (gap > 3.5) {
    items.push({
      type: 'positive',
      title: 'Large zone de transition',
      message: `Écart LT1-LT2 de ${gap.toFixed(1)} km/h. Plage importante pour le travail tempo/seuil. Le patient tolère bien les intensités intermédiaires.`,
    })
  } else {
    items.push({
      type: 'info',
      title: 'Zone de transition',
      message: `Écart LT1-LT2 : ${gap.toFixed(1)} km/h — normal.`,
    })
  }

  // ── Lactatémie maximale (capacité tampon / glycolytique) ──
  if (maxLactate > 10) {
    items.push({
      type: 'positive',
      title: 'Bonne capacité glycolytique',
      message: `Pic lactate à ${maxLactate.toFixed(1)} mmol/L. Bonne capacité tampon et tolérance à l'acidose.`,
    })
  } else if (maxLactate < 6) {
    items.push({
      type: 'warning',
      title: 'Pic lactate faible',
      message: `Pic à ${maxLactate.toFixed(1)} mmol/L. Possible arrêt prématuré du test, ou faible sollicitation glycolytique. Vérifier si le test était vraiment maximal.`,
    })
  }

  // ── Concordance des méthodes ──
  const methods = [obla4, dmax].filter(m => m !== null)
  if (methods.length >= 2) {
    const speeds = methods.map(m => m.speed)
    const spread = Math.max(...speeds) - Math.min(...speeds)
    if (spread > 1.5) {
      items.push({
        type: 'warning',
        title: 'Divergence entre méthodes',
        message: `Les méthodes de détermination du seuil divergent de ${spread.toFixed(1)} km/h. Le seuil retenu est la moyenne, mais la fiabilité est réduite. Envisager un retest ou un protocole avec paliers plus fins.`,
      })
    } else {
      items.push({
        type: 'positive',
        title: 'Bonne concordance des méthodes',
        message: `Les différentes méthodes convergent (écart < ${spread.toFixed(1)} km/h). Le seuil retenu est fiable.`,
      })
    }
  }

  // ── Cinétique de la courbe ──
  // Vérifier si la courbe est "plate" longtemps (bonne endurance) ou monte vite
  const midpoint = Math.floor(stages.length / 2)
  const earlySlope = (stages[midpoint].lactate - stages[0].lactate) / (stages[midpoint].speed - stages[0].speed)
  const lateSlope = (stages[stages.length - 1].lactate - stages[midpoint].lactate) / (stages[stages.length - 1].speed - stages[midpoint].speed)

  if (earlySlope < 0.3 && lateSlope > 1.5) {
    items.push({
      type: 'positive',
      title: 'Courbe lactate typique "endurant"',
      message: 'Phase plateau prolongée suivie d\'une inflexion nette. Profil caractéristique d\'un bon développement aérobie.',
    })
  } else if (earlySlope > 0.8) {
    items.push({
      type: 'warning',
      title: 'Montée précoce du lactate',
      message: 'Le lactate augmente rapidement dès les premiers paliers. Suggère un déficit de base aérobie ou une fatigue pré-test. À développer avec du volume en Z1-Z2.',
    })
  }

  return items
}

// ─── Utilitaires mathématiques ──────────────────────────────────────────

function hasHR(stages) {
  return stages.some(s => s.hr && s.hr > 0)
}

function interpolateHR(stages, targetSpeed) {
  const withHR = stages.filter(s => s.hr && s.hr > 0)
  if (withHR.length < 2) return null

  for (let i = 1; i < withHR.length; i++) {
    if (withHR[i].speed >= targetSpeed && withHR[i - 1].speed <= targetSpeed) {
      const ratio = (targetSpeed - withHR[i - 1].speed) / (withHR[i].speed - withHR[i - 1].speed)
      return Math.round(withHR[i - 1].hr + ratio * (withHR[i].hr - withHR[i - 1].hr))
    }
  }
  // Extrapolation si hors limites
  if (targetSpeed <= withHR[0].speed) return withHR[0].hr
  return withHR[withHR.length - 1].hr
}

function linearRegression(x, y) {
  const n = x.length
  if (n < 2) return null
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((s, xi, i) => s + xi * y[i], 0)
  const sumX2 = x.reduce((s, xi) => s + xi * xi, 0)
  const denom = n * sumX2 - sumX * sumX
  if (denom === 0) return null
  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

/**
 * Régression polynomiale de degré n (méthode des moindres carrés).
 * Résout le système normal : (X^T X) β = X^T y
 */
function polyFit(xArr, yArr, degree) {
  const n = xArr.length
  if (n <= degree) return null

  // Construire la matrice X^T X et le vecteur X^T y
  const size = degree + 1
  const xtx = Array.from({ length: size }, () => Array(size).fill(0))
  const xty = Array(size).fill(0)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < size; j++) {
      for (let k = 0; k < size; k++) {
        xtx[j][k] += Math.pow(xArr[i], j + k)
      }
      xty[j] += yArr[i] * Math.pow(xArr[i], j)
    }
  }

  // Résolution par élimination de Gauss
  return gaussSolve(xtx, xty)
}

function gaussSolve(a, b) {
  const n = b.length
  const mat = a.map((row, i) => [...row, b[i]])

  for (let col = 0; col < n; col++) {
    let maxRow = col
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(mat[row][col]) > Math.abs(mat[maxRow][col])) maxRow = row
    }
    [mat[col], mat[maxRow]] = [mat[maxRow], mat[col]]
    if (Math.abs(mat[col][col]) < 1e-10) return null

    for (let row = col + 1; row < n; row++) {
      const factor = mat[row][col] / mat[col][col]
      for (let j = col; j <= n; j++) {
        mat[row][j] -= factor * mat[col][j]
      }
    }
  }

  const result = Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    result[i] = mat[i][n]
    for (let j = i + 1; j < n; j++) {
      result[i] -= mat[i][j] * result[j]
    }
    result[i] /= mat[i][i]
  }
  return result
}

function polyEval(coeffs, x) {
  return coeffs.reduce((sum, c, i) => sum + c * Math.pow(x, i), 0)
}

/**
 * Génère une courbe lissée (polynomiale degré 3) pour le graphique.
 */
function generateSmoothCurve(stages) {
  const coeffs = polyFit(
    stages.map(s => s.speed),
    stages.map(s => s.lactate),
    Math.min(3, stages.length - 1)
  )
  if (!coeffs) return stages.map(s => ({ speed: s.speed, lactate: s.lactate }))

  const minSpeed = stages[0].speed
  const maxSpeed = stages[stages.length - 1].speed
  const points = []
  const steps = 80

  for (let i = 0; i <= steps; i++) {
    const speed = minSpeed + (maxSpeed - minSpeed) * (i / steps)
    const lactate = Math.max(0, polyEval(coeffs, speed))
    points.push({ speed: Number(speed.toFixed(2)), lactate: Number(lactate.toFixed(2)) })
  }

  return points
}
