import { INTENSITY_ZONES } from '../constants'

// ─── Calcul de l'intensité pondérée d'une séance ───────────────────────────

/**
 * Calcule l'intensité pondérée d'une séance en mixant zones et RPE.
 *
 * Si zones renseignées :
 *   intensité_zone = Σ(min_zone_i × coeff_i) / durée_totale
 *   intensité_pondérée = (intensité_zone × 0.6) + (RPE/10 × 0.4)
 *
 * Si zones NON renseignées :
 *   intensité = RPE / 10 (fallback pur RPE)
 */
export function calcWeightedIntensity(session) {
  const rpeNormalized = (session.rpe || 5) / 10

  if (!session.useZones || !session.zones) {
    return rpeNormalized
  }

  const zoneKeys = ['z1', 'z2', 'z3', 'z4', 'z5']
  const totalZoneMinutes = zoneKeys.reduce(
    (sum, key) => sum + (Number(session.zones[key]) || 0), 0
  )

  if (totalZoneMinutes === 0) {
    return rpeNormalized
  }

  // Intensité basée sur les zones (pondérée par les coefficients)
  const zoneIntensity = zoneKeys.reduce((sum, key, i) => {
    const minutes = Number(session.zones[key]) || 0
    return sum + minutes * INTENSITY_ZONES[i].coeff
  }, 0) / totalZoneMinutes

  // Mix 60% zones + 40% RPE
  return zoneIntensity * 0.6 + rpeNormalized * 0.4
}

/**
 * Détecte le découplage RPE/zones.
 * Retourne l'écart en % entre le RPE normalisé et l'intensité zone.
 * Un écart positif signifie que le RPE est supérieur à ce que les zones suggèrent
 * → signal de fatigue accumulée.
 */
export function calcRPEZoneDecoupling(session) {
  if (!session.useZones || !session.zones) return null

  const zoneKeys = ['z1', 'z2', 'z3', 'z4', 'z5']
  const totalZoneMinutes = zoneKeys.reduce(
    (sum, key) => sum + (Number(session.zones[key]) || 0), 0
  )

  if (totalZoneMinutes === 0) return null

  const zoneIntensity = zoneKeys.reduce((sum, key, i) => {
    const minutes = Number(session.zones[key]) || 0
    return sum + minutes * INTENSITY_ZONES[i].coeff
  }, 0) / totalZoneMinutes

  const rpeNormalized = (session.rpe || 5) / 10

  // Écart en pourcentage : positif = RPE > zones (signal de fatigue)
  if (zoneIntensity === 0) return null
  return ((rpeNormalized - zoneIntensity) / zoneIntensity) * 100
}

// ─── Coefficient de dénivelé ───────────────────────────────────────────────

/**
 * Coefficient multiplicateur pour le dénivelé.
 * coeff = 1 + (D+ / 1000) × 0.3
 */
export function calcElevationCoeff(elevationGain) {
  return 1 + ((elevationGain || 0) / 1000) * 0.3
}

// ─── Charge de séance (sRPE modifié) ──────────────────────────────────────

/**
 * Charge de séance = intensité_pondérée × durée × coeff_dénivelé
 */
export function calcSessionLoad(session) {
  const intensity = calcWeightedIntensity(session)
  const duration = session.duration || 0
  const elevCoeff = calcElevationCoeff(session.elevationGain)
  return intensity * duration * elevCoeff
}

// ─── Score de bien-être composite ─────────────────────────────────────────

/**
 * Hooper Index modifié — score de bien-être composite (0-100%).
 *
 * Composantes (toutes ramenées sur 0-1, 1 = bien) :
 * - Fatigue : inversé (1=frais=1.0, 10=épuisé=0.0)
 * - Sommeil : (1=mauvais=0.0, 5=excellent=1.0)
 * - Stress vie : inversé (1=faible=1.0, 5=élevé=0.0)
 * - Humeur : (1=basse=0.0, 5=excellente=1.0)
 * - Douleur : inversé (0=aucune=1.0, 10=intense=0.0)
 */
export function calcWellnessScore(session) {
  const fatigue = 1 - ((session.fatigue || 5) - 1) / 9        // 1-10 inversé
  const sleep = ((session.sleepQuality || 3) - 1) / 4          // 1-5
  const stress = 1 - ((session.lifeStress || 3) - 1) / 4       // 1-5 inversé
  const mood = ((session.mood || 3) - 1) / 4                   // 1-5
  const pain = session.hasPain
    ? 1 - ((session.painIntensity || 1) - 1) / 9
    : 1.0

  // Pondération : fatigue et sommeil pèsent plus
  const score = (fatigue * 0.25 + sleep * 0.25 + stress * 0.15 + mood * 0.15 + pain * 0.20)
  return Math.round(score * 100)
}

// ─── Métriques hebdomadaires ──────────────────────────────────────────────

/**
 * Filtre les séances dans une fenêtre de jours glissants à partir d'une date de référence.
 */
export function getSessionsInWindow(sessions, refDate, days) {
  const ref = new Date(refDate)
  const start = new Date(ref.getTime() - days * 24 * 60 * 60 * 1000)

  return sessions.filter(s => {
    const d = new Date(s.date)
    return d > start && d <= ref
  })
}

/**
 * Charge totale sur une fenêtre = Σ charge de chaque séance
 */
export function calcTotalLoad(sessions) {
  return sessions.reduce((sum, s) => sum + calcSessionLoad(s), 0)
}

/**
 * Volume total (km) sur une liste de séances
 */
export function calcTotalVolume(sessions) {
  return sessions.reduce((sum, s) => sum + (s.distance || 0), 0)
}

/**
 * ACWR = charge aiguë (7j) / charge chronique (28j)
 * Utilise la méthode du rolling average.
 *
 * Si l'historique est insuffisant (< 4 semaines de données), on utilise
 * le volume hebdomadaire habituel du patient (weeklyVolumeRef) comme
 * estimation de la charge chronique, converti en charge via une intensité
 * moyenne estimée (RPE 5/10, allure ~6 min/km).
 */
export function calcACWR(sessions, refDate = new Date(), patient = null) {
  const acute = getSessionsInWindow(sessions, refDate, 7)
  const chronic = getSessionsInWindow(sessions, refDate, 28)

  const acuteLoad = calcTotalLoad(acute)
  const chronicLoad = calcTotalLoad(chronic)

  // Compter le nombre de semaines avec au moins une séance sur les 28j
  const weeksWithData = countWeeksWithData(sessions, refDate, 28)

  let chronicWeekly

  if (weeksWithData >= 3) {
    // Assez d'historique : moyenne hebdo classique
    chronicWeekly = chronicLoad / 4
  } else if (patient?.weeklyVolumeRef) {
    // Historique insuffisant : estimer la charge chronique à partir du volume habituel
    // Estimation : volume_ref × intensité moyenne (0.5 = RPE 5) × allure ~6min/km
    const estimatedWeeklyLoad = estimateLoadFromVolume(patient.weeklyVolumeRef)

    if (weeksWithData === 0) {
      // Aucune donnée historique : 100% estimation
      chronicWeekly = estimatedWeeklyLoad
    } else {
      // Mix progressif : on blende données réelles et estimation
      // Plus on a de semaines, plus on fait confiance aux données réelles
      const realWeekly = chronicLoad / weeksWithData
      const blendRatio = weeksWithData / 4 // 0.25 à 0.75
      chronicWeekly = realWeekly * blendRatio + estimatedWeeklyLoad * (1 - blendRatio)
    }
  } else {
    // Pas d'historique ET pas de volume de référence → impossible de calculer
    if (chronicLoad === 0) return null
    chronicWeekly = chronicLoad / Math.max(weeksWithData, 1)
  }

  if (chronicWeekly === 0) return null
  return acuteLoad / chronicWeekly
}

/**
 * Estime une charge hebdomadaire à partir d'un volume en km.
 * Hypothèse : intensité moyenne RPE 5/10 (0.5), allure ~6 min/km.
 */
function estimateLoadFromVolume(volumeKm) {
  const estimatedDurationPerKm = 6 // min/km (allure moyenne)
  const estimatedIntensity = 0.5   // RPE 5/10
  return volumeKm * estimatedDurationPerKm * estimatedIntensity
}

/**
 * Compte le nombre de semaines distinctes contenant au moins une séance
 * dans la fenêtre de N jours.
 */
function countWeeksWithData(sessions, refDate, days) {
  const ref = new Date(refDate)
  let count = 0
  for (let w = 0; w < Math.ceil(days / 7); w++) {
    const weekEnd = new Date(ref.getTime() - w * 7 * 24 * 60 * 60 * 1000)
    const weekSessions = getSessionsInWindow(sessions, weekEnd, 7)
    if (weekSessions.length > 0) count++
  }
  return count
}

/**
 * Monotonie = moyenne des charges quotidiennes / écart-type
 * Calculée sur 7 jours
 */
export function calcMonotony(sessions, refDate = new Date()) {
  const windowSessions = getSessionsInWindow(sessions, refDate, 7)

  // Construire les charges quotidiennes sur 7 jours
  const dailyLoads = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(refDate)
    day.setDate(day.getDate() - i)
    const dayStr = day.toISOString().split('T')[0]

    const daySessions = windowSessions.filter(s => s.date === dayStr)
    const dayLoad = daySessions.reduce((sum, s) => sum + calcSessionLoad(s), 0)
    dailyLoads.push(dayLoad)
  }

  const mean = dailyLoads.reduce((a, b) => a + b, 0) / 7
  if (mean === 0) return 0

  const variance = dailyLoads.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / 7
  const stdDev = Math.sqrt(variance)

  if (stdDev === 0) return 7 // Charge identique chaque jour = monotonie maximale
  return mean / stdDev
}

/**
 * Strain (contrainte) = charge hebdo × monotonie
 */
export function calcStrain(sessions, refDate = new Date()) {
  const weekSessions = getSessionsInWindow(sessions, refDate, 7)
  const weekLoad = calcTotalLoad(weekSessions)
  const monotony = calcMonotony(sessions, refDate)
  return weekLoad * monotony
}

/**
 * Variation de volume hebdomadaire en %
 * Δ = (semaine courante - référence) / référence × 100
 *
 * La référence est :
 * - La semaine précédente si elle contient des données
 * - Le volume hebdomadaire habituel du patient (weeklyVolumeRef) sinon
 */
export function calcVolumeChange(sessions, refDate = new Date(), patient = null) {
  const currentWeek = getSessionsInWindow(sessions, refDate, 7)
  const prevWeekEnd = new Date(refDate)
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 7)
  const prevWeek = getSessionsInWindow(sessions, prevWeekEnd, 7)

  const currentVol = calcTotalVolume(currentWeek)
  const prevVol = calcTotalVolume(prevWeek)

  // Si pas de données la semaine précédente, utiliser le volume de référence du patient
  let referenceVol = prevVol
  if (prevVol === 0 && patient?.weeklyVolumeRef) {
    referenceVol = patient.weeklyVolumeRef
  }

  if (referenceVol === 0) return 0 // Pas de référence du tout → pas de variation
  return ((currentVol - referenceVol) / referenceVol) * 100
}

/**
 * Bien-être moyen de la semaine (0-100%)
 */
export function calcAvgWellness(sessions, refDate = new Date()) {
  const weekSessions = getSessionsInWindow(sessions, refDate, 7)
  if (weekSessions.length === 0) return null

  const total = weekSessions.reduce((sum, s) => sum + calcWellnessScore(s), 0)
  return Math.round(total / weekSessions.length)
}

/**
 * Découplage RPE/zones moyen de la semaine
 */
export function calcAvgDecoupling(sessions, refDate = new Date()) {
  const weekSessions = getSessionsInWindow(sessions, refDate, 7)
  const decouplings = weekSessions
    .map(s => calcRPEZoneDecoupling(s))
    .filter(d => d !== null)

  if (decouplings.length === 0) return null
  return decouplings.reduce((a, b) => a + b, 0) / decouplings.length
}

// ─── Score de risque dynamique ────────────────────────────────────────────

/**
 * Calcule le multiplicateur de risque lié à l'historique de blessures.
 *
 * - Blessure < 6 mois : ×1.5
 * - Blessure 6-12 mois : ×1.2
 * - Blessure > 12 mois : ×1.1
 * - Récidive : multiplicateur supplémentaire ×1.3
 * - Blessure en cours / chronique : ×1.5
 */
export function calcInjuryMultiplier(injuries) {
  if (!injuries || injuries.length === 0) return 1.0

  let maxMultiplier = 1.0

  for (const injury of injuries) {
    let mult = 1.0

    if (injury.status === 'ongoing') {
      mult = 1.5
    } else if (injury.status === 'chronic') {
      mult = 1.4
    } else if (injury.date) {
      const months = (Date.now() - new Date(injury.date).getTime()) / (1000 * 60 * 60 * 24 * 30)
      if (months < 6) mult = 1.5
      else if (months < 12) mult = 1.2
      else mult = 1.1
    }

    if (injury.isRecurrence) mult *= 1.3

    maxMultiplier = Math.max(maxMultiplier, mult)
  }

  return maxMultiplier
}

/**
 * Vérifie si une douleur signalée correspond à une localisation de blessure antérieure.
 */
export function checkPainInjuryMatch(session, injuries) {
  if (!session.hasPain || !session.painLocation || !injuries) return null

  return injuries.find(inj =>
    inj.location === session.painLocation &&
    (inj.status !== 'resolved' || isRecentInjury(inj))
  )
}

function isRecentInjury(injury) {
  if (!injury.date) return false
  const months = (Date.now() - new Date(injury.date).getTime()) / (1000 * 60 * 60 * 24 * 30)
  return months < 12
}

/**
 * Score de risque composite (0-100).
 *
 * Pondération :
 * - ACWR : 25%
 * - Δ volume : 20%
 * - Monotonie : 10%
 * - Bien-être : 15%
 * - Découplage RPE/zones : 10%
 * - Facteurs contextuels : 10%
 * - Historique blessures : 10%
 */
export function calcRiskScore(sessions, patient, refDate = new Date()) {
  const acwr = calcACWR(sessions, refDate, patient)
  const volumeChange = calcVolumeChange(sessions, refDate, patient)
  const monotony = calcMonotony(sessions, refDate)
  const wellness = calcAvgWellness(sessions, refDate)
  const decoupling = calcAvgDecoupling(sessions, refDate)
  const weekSessions = getSessionsInWindow(sessions, refDate, 7)

  // Sous-scores (0-100, 100 = risque max)

  // ACWR : sweet spot 0.8-1.3, danger > 1.5
  let acwrScore = 0
  if (acwr !== null) {
    if (acwr < 0.8) acwrScore = 30 // sous-entraînement = risque modéré
    else if (acwr <= 1.3) acwrScore = 0
    else if (acwr <= 1.5) acwrScore = 50
    else acwrScore = Math.min(100, 50 + (acwr - 1.5) * 100)
  }

  // Δ volume : < 10% ok, > 15% danger
  let volumeScore = 0
  const absChange = Math.abs(volumeChange)
  if (absChange <= 10) volumeScore = 0
  else if (absChange <= 15) volumeScore = 40
  else if (absChange <= 25) volumeScore = 70
  else volumeScore = 100

  // Monotonie : < 1.5 ok, > 2.0 danger
  let monotonyScore = 0
  if (monotony < 1.5) monotonyScore = 0
  else if (monotony <= 2.0) monotonyScore = 50
  else monotonyScore = Math.min(100, 50 + (monotony - 2.0) * 50)

  // Bien-être : inversé (100% bien-être = 0 risque)
  let wellnessScore = 0
  if (wellness !== null) {
    wellnessScore = Math.max(0, 100 - wellness)
  }

  // Découplage : > 20% = alerte
  let decouplingScore = 0
  if (decoupling !== null) {
    if (Math.abs(decoupling) <= 10) decouplingScore = 0
    else if (Math.abs(decoupling) <= 20) decouplingScore = 40
    else decouplingScore = Math.min(100, 40 + (Math.abs(decoupling) - 20) * 2)
  }

  // Facteurs contextuels : chaque facteur ajoute du risque
  let contextScore = 0
  const allFactors = weekSessions.flatMap(s => s.contextualFactors || [])
  const uniqueFactors = [...new Set(allFactors)]
  contextScore = Math.min(100, uniqueFactors.length * 25)

  // Historique blessures
  const injuryMultiplier = calcInjuryMultiplier(patient?.injuries)
  const injuryBaseScore = Math.min(100, (injuryMultiplier - 1) * 200)

  // Score composite pondéré
  const rawScore =
    acwrScore * 0.25 +
    volumeScore * 0.20 +
    monotonyScore * 0.10 +
    wellnessScore * 0.15 +
    decouplingScore * 0.10 +
    contextScore * 0.10 +
    injuryBaseScore * 0.10

  // Appliquer le multiplicateur de blessure au score final
  const finalScore = Math.min(100, rawScore * injuryMultiplier)

  return {
    score: Math.round(finalScore),
    level: getRiskLevel(finalScore),
    components: {
      acwr: { value: acwr, score: acwrScore },
      volumeChange: { value: volumeChange, score: volumeScore },
      monotony: { value: monotony, score: monotonyScore },
      wellness: { value: wellness, score: wellnessScore },
      decoupling: { value: decoupling, score: decouplingScore },
      context: { value: uniqueFactors.length, score: contextScore },
      injury: { value: injuryMultiplier, score: injuryBaseScore },
    },
  }
}

/**
 * Niveau de risque basé sur le score composite.
 */
export function getRiskLevel(score) {
  if (score < 25) return { label: 'Optimal', color: 'green', emoji: '✅' }
  if (score < 45) return { label: 'Vigilance', color: 'yellow', emoji: '⚠️' }
  if (score < 65) return { label: 'Risque élevé', color: 'orange', emoji: '🟠' }
  return { label: 'Danger', color: 'red', emoji: '🔴' }
}

// ─── Génération d'alertes ─────────────────────────────────────────────────

/**
 * Génère les alertes contextuelles basées sur l'analyse des données.
 */
export function generateAlerts(sessions, patient, refDate = new Date()) {
  const alerts = []
  const risk = calcRiskScore(sessions, patient, refDate)

  // ACWR
  if (risk.components.acwr.value !== null) {
    if (risk.components.acwr.value > 1.5) {
      alerts.push({
        type: 'danger',
        title: 'ACWR critique',
        message: `Ratio charge aiguë/chronique à ${risk.components.acwr.value.toFixed(2)} (seuil : 1.5). Risque de blessure significativement augmenté.`,
      })
    } else if (risk.components.acwr.value > 1.3) {
      alerts.push({
        type: 'warning',
        title: 'ACWR élevé',
        message: `Ratio à ${risk.components.acwr.value.toFixed(2)}. Zone de vigilance (sweet spot : 0.8-1.3).`,
      })
    } else if (risk.components.acwr.value < 0.8) {
      alerts.push({
        type: 'info',
        title: 'Sous-entraînement',
        message: `ACWR à ${risk.components.acwr.value.toFixed(2)}. Charge insuffisante pour maintenir la condition physique.`,
      })
    }
  }

  // Volume
  const volChange = risk.components.volumeChange.value
  if (Math.abs(volChange) > 15) {
    alerts.push({
      type: 'danger',
      title: 'Variation de volume excessive',
      message: `${volChange > 0 ? 'Augmentation' : 'Diminution'} de ${Math.abs(volChange).toFixed(0)}% du volume cette semaine (règle des 10%).`,
    })
  } else if (Math.abs(volChange) > 10) {
    alerts.push({
      type: 'warning',
      title: 'Variation de volume',
      message: `${volChange > 0 ? '+' : ''}${volChange.toFixed(0)}% de volume cette semaine. Approche du seuil de 10%.`,
    })
  }

  // Monotonie
  if (risk.components.monotony.value > 2.0) {
    alerts.push({
      type: 'warning',
      title: 'Monotonie élevée',
      message: `Monotonie à ${risk.components.monotony.value.toFixed(1)} (seuil : 2.0). Varier l'intensité et le volume des séances.`,
    })
  }

  // Bien-être
  if (risk.components.wellness.value !== null && risk.components.wellness.value < 50) {
    alerts.push({
      type: 'warning',
      title: 'Bien-être dégradé',
      message: `Score de bien-être à ${risk.components.wellness.value}%. Fatigue, sommeil ou stress nécessitent attention.`,
    })
  }

  // Découplage
  if (risk.components.decoupling.value !== null && Math.abs(risk.components.decoupling.value) > 20) {
    alerts.push({
      type: 'warning',
      title: 'Découplage RPE/Zones',
      message: `L'effort perçu est disproportionné par rapport aux zones objectives (${risk.components.decoupling.value > 0 ? '+' : ''}${risk.components.decoupling.value.toFixed(0)}%). Signal potentiel de fatigue accumulée.`,
    })
  }

  // Douleur sur localisation de blessure antérieure
  const lastSession = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  if (lastSession && patient?.injuries) {
    const match = checkPainInjuryMatch(lastSession, patient.injuries)
    if (match) {
      const typeLabel = match.type
      alerts.push({
        type: 'danger',
        title: 'Douleur sur zone de blessure antérieure',
        message: `Douleur signalée au niveau ${lastSession.painLocation} — antécédent de ${typeLabel} sur la même localisation. Vigilance accrue.`,
      })
    }
  }

  return alerts
}

// ─── Recommandations ──────────────────────────────────────────────────────

/**
 * Génère des recommandations basées sur le score de risque et les composantes.
 */
export function generateRecommendations(sessions, patient, refDate = new Date()) {
  const risk = calcRiskScore(sessions, patient, refDate)
  const recommendations = []

  if (risk.score >= 65) {
    recommendations.push('Envisager une semaine de décharge (réduction de 30-40% du volume).')
  } else if (risk.score >= 45) {
    recommendations.push('Réduire le volume de 10-15% la semaine prochaine.')
  }

  if (risk.components.acwr.value > 1.5) {
    recommendations.push('Ramener progressivement l\'ACWR sous 1.3 en réduisant la charge aiguë.')
  }

  if (risk.components.monotony.value > 2.0) {
    recommendations.push('Alterner séances intenses et séances légères pour réduire la monotonie.')
  }

  if (risk.components.wellness.value !== null && risk.components.wellness.value < 50) {
    recommendations.push('Prioriser la récupération : sommeil, nutrition, gestion du stress.')
  }

  if (risk.components.volumeChange.value > 15) {
    recommendations.push('Respecter la règle des 10% : ne pas augmenter le volume de plus de 10% par semaine.')
  }

  if (risk.components.context.value > 0) {
    recommendations.push('Changements contextuels détectés — adapter la charge en conséquence durant 1-2 semaines.')
  }

  if (recommendations.length === 0) {
    recommendations.push('Charge bien gérée. Continuer la progression actuelle.')
  }

  return recommendations
}

// ─── Données pour graphiques (historique hebdomadaire) ─────────────────────

/**
 * Génère les données pour les graphiques sur N semaines.
 */
export function getWeeklyHistory(sessions, patient, weeks = 8) {
  const history = []
  const now = new Date()

  for (let w = weeks - 1; w >= 0; w--) {
    const refDate = new Date(now)
    refDate.setDate(refDate.getDate() - w * 7)

    const weekSessions = getSessionsInWindow(sessions, refDate, 7)
    const weekLabel = refDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

    const acwr = calcACWR(sessions, refDate, patient)
    const volume = calcTotalVolume(weekSessions)
    const load = calcTotalLoad(weekSessions)
    const wellness = calcAvgWellness(sessions, refDate)
    const monotony = calcMonotony(sessions, refDate)
    const risk = calcRiskScore(sessions, patient, refDate)
    const strainVal = calcStrain(sessions, refDate)

    // Composantes bien-être détaillées (moyennes de la semaine)
    const wellnessComponents = calcWellnessComponents(weekSessions)

    // RPE moyen de la semaine
    const avgRpe = weekSessions.length > 0
      ? Number((weekSessions.reduce((sum, s) => sum + (s.rpe || 5), 0) / weekSessions.length).toFixed(1))
      : null

    // Découplage moyen
    const decoupling = calcAvgDecoupling(sessions, refDate)

    history.push({
      week: weekLabel,
      acwr: acwr !== null ? Number(acwr.toFixed(2)) : null,
      volume: Number(volume.toFixed(1)),
      load: Math.round(load),
      wellness,
      monotony: Number(monotony.toFixed(2)),
      strain: Math.round(strainVal),
      riskScore: risk.score,
      sessions: weekSessions.length,
      avgRpe,
      decoupling: decoupling !== null ? Number(decoupling.toFixed(1)) : null,
      ...wellnessComponents,
    })
  }

  return history
}

/**
 * Calcule les moyennes des composantes de bien-être pour une liste de séances.
 * Retourne les valeurs brutes moyennées (pas normalisées).
 */
function calcWellnessComponents(sessions) {
  if (sessions.length === 0) {
    return { fatigue: null, sleep: null, stress: null, mood: null, pain: null }
  }

  const n = sessions.length
  const fatigue = Number((sessions.reduce((s, x) => s + (x.fatigue || 5), 0) / n).toFixed(1))
  const sleep = Number((sessions.reduce((s, x) => s + (x.sleepQuality || 3), 0) / n).toFixed(1))
  const stress = Number((sessions.reduce((s, x) => s + (x.lifeStress || 3), 0) / n).toFixed(1))
  const mood = Number((sessions.reduce((s, x) => s + (x.mood || 3), 0) / n).toFixed(1))
  const painSessions = sessions.filter(x => x.hasPain)
  const pain = painSessions.length > 0
    ? Number((painSessions.reduce((s, x) => s + (x.painIntensity || 0), 0) / painSessions.length).toFixed(1))
    : 0

  return { fatigue, sleep, stress, mood, pain }
}
