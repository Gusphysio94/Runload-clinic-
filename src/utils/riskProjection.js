import {
  calcACWR, calcVolumeChange, calcRiskScore,
  calcTotalVolume, getSessionsInWindow,
} from './calculations'

/**
 * Projette l'impact de la prochaine séance planifiée sur le risque.
 *
 * Convertit une séance du plan (format planGenerator) en "pseudo-session"
 * compatible avec le moteur de calcul, puis recalcule ACWR et score de risque.
 */
export function projectNextSession(sessions, patient, trainingPlan) {
  if (!trainingPlan?.weeks || !patient) return null

  const now = new Date()
  const nextSession = findNextPlannedSession(trainingPlan, now)
  if (!nextSession) return null

  // Convertir la séance planifiée en pseudo-session compatible calculations.js
  const virtualSession = planToVirtualSession(nextSession)

  // Calcul actuel (avant la séance)
  const currentACWR = calcACWR(sessions, now, patient)
  const currentRisk = calcRiskScore(sessions, patient, now)
  const currentWeekVol = calcTotalVolume(getSessionsInWindow(sessions, now, 7))

  // Calcul projeté (après la séance)
  const projectedSessions = [...sessions, virtualSession]
  const projDate = new Date(virtualSession.date)
  // Utiliser la date de la séance virtuelle comme référence si elle est future
  const projRefDate = projDate > now ? projDate : now

  const projectedACWR = calcACWR(projectedSessions, projRefDate, patient)
  const projectedRisk = calcRiskScore(projectedSessions, patient, projRefDate)
  const projectedWeekVol = currentWeekVol + (nextSession.estimatedDistance || 0)
  const projectedVolChange = calcVolumeChange(projectedSessions, projRefDate, patient)

  return {
    nextSession,
    virtualSession,
    current: {
      acwr: currentACWR,
      riskScore: currentRisk.score,
      riskLevel: currentRisk.level,
      weekVolume: currentWeekVol,
    },
    projected: {
      acwr: projectedACWR,
      riskScore: projectedRisk.score,
      riskLevel: projectedRisk.level,
      weekVolume: projectedWeekVol,
      volumeChange: projectedVolChange,
    },
    delta: {
      acwr: projectedACWR !== null && currentACWR !== null
        ? projectedACWR - currentACWR
        : null,
      riskScore: projectedRisk.score - currentRisk.score,
    },
  }
}

/**
 * Trouve la prochaine séance planifiée non encore complétée.
 */
function findNextPlannedSession(plan, refDate) {
  const completed = plan.completedSessions || {}
  const startDate = new Date(plan.startDate)

  for (const week of plan.weeks) {
    for (const session of week.sessions) {
      // Skip si déjà marquée comme faite
      if (completed[session.id]?.done) continue

      // Calculer la date de cette séance
      const sessionDate = new Date(startDate)
      sessionDate.setDate(startDate.getDate() + (week.weekNumber - 1) * 7 + session.dayOfWeek)

      // Ne retourner que les séances futures ou d'aujourd'hui
      const today = new Date(refDate)
      today.setHours(0, 0, 0, 0)
      const sessDay = new Date(sessionDate)
      sessDay.setHours(0, 0, 0, 0)

      if (sessDay >= today) {
        return { ...session, date: sessionDate }
      }
    }
  }
  return null
}

/**
 * Convertit une séance du plan en pseudo-session compatible avec calculations.js.
 */
function planToVirtualSession(planSession) {
  const date = planSession.date instanceof Date
    ? planSession.date.toISOString().split('T')[0]
    : planSession.date

  // Estimer la durée en minutes
  const duration = planSession.duration || 45

  // Mapper le RPE cible du plan vers un RPE compatible
  const rpe = planSession.rpeTarget || 5

  // Estimer les zones à partir du zoneBreakdown du plan
  const zones = {}
  if (planSession.zoneBreakdown) {
    const totalPct = Object.values(planSession.zoneBreakdown).reduce((a, b) => a + b, 0)
    if (totalPct > 0) {
      for (const [zone, pct] of Object.entries(planSession.zoneBreakdown)) {
        zones[zone] = Math.round(duration * pct / totalPct)
      }
    }
  }

  const hasZones = Object.keys(zones).length > 0 &&
    Object.values(zones).some(v => v > 0)

  return {
    id: `virtual-${planSession.id}`,
    date,
    distance: planSession.estimatedDistance || 0,
    duration,
    elevationGain: 0,
    rpe,
    useZones: hasZones,
    zones: hasZones ? zones : null,
    fatigue: 5,
    sleepQuality: 3,
    lifeStress: 3,
    mood: 3,
    hasPain: false,
    contextualFactors: [],
    _isVirtual: true,
  }
}
