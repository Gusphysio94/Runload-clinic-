import { calcZonePaces } from './paceCalculator'

// ─── Templates de séances ─────────────────────────────────────────────────

const SESSION_TEMPLATES = {
  recup: {
    type: 'recup',
    label: 'Récupération active',
    primaryZone: 1,
    zoneDistribution: { z1: 1.0 },
    rpeTarget: 3,
    durationFactor: 0.5,
    description: 'Footing très léger, aisance totale',
    buildDetails(duration) {
      return [{ phase: 'Principal', duration, zone: 1, description: 'Footing très léger en Z1, respiration nasale possible' }]
    },
  },
  ef: {
    type: 'ef',
    label: 'Endurance fondamentale',
    primaryZone: 2,
    zoneDistribution: { z1: 0.1, z2: 0.9 },
    rpeTarget: 4,
    durationFactor: 0.85,
    description: 'Footing en aisance respiratoire',
    buildDetails(duration) {
      return [{ phase: 'Principal', duration, zone: 2, description: 'Courir en Z2, conversation possible sans essoufflement' }]
    },
  },
  sl: {
    type: 'sl',
    label: 'Sortie longue',
    primaryZone: 2,
    zoneDistribution: { z1: 0.1, z2: 0.85, z3: 0.05 },
    rpeTarget: 5,
    durationFactor: 1.5,
    description: 'Sortie longue à allure modérée',
    buildDetails(duration) {
      const warmup = Math.round(duration * 0.1)
      const main = duration - warmup
      return [
        { phase: 'Mise en route', duration: warmup, zone: 1, description: 'Démarrer doucement en Z1' },
        { phase: 'Principal', duration: main, zone: 2, description: 'Maintenir Z2, finir les 5 dernières minutes en légère progression si sensations OK' },
      ]
    },
  },
  tempo: {
    type: 'tempo',
    label: 'Tempo / Allure spécifique',
    primaryZone: 3,
    zoneDistribution: { z2: 0.3, z3: 0.7 },
    rpeTarget: 6,
    durationFactor: 0.9,
    description: 'Séance à allure tempo (Z3)',
    buildDetails(duration) {
      const warmup = Math.round(duration * 0.2)
      const cooldown = Math.round(duration * 0.15)
      const main = duration - warmup - cooldown
      return [
        { phase: 'Échauffement', duration: warmup, zone: 2, description: 'Footing progressif en Z2' },
        { phase: 'Bloc tempo', duration: main, zone: 3, description: 'Maintenir allure Z3, respiration contrôlée mais soutenue' },
        { phase: 'Retour au calme', duration: cooldown, zone: 2, description: 'Décélérer progressivement en Z2' },
      ]
    },
  },
  seuil: {
    type: 'seuil',
    label: 'Seuil',
    primaryZone: 4,
    zoneDistribution: { z2: 0.4, z4: 0.6 },
    rpeTarget: 7,
    durationFactor: 0.85,
    description: 'Travail au seuil (Z4)',
    buildDetails(duration) {
      const warmup = Math.round(duration * 0.25)
      const cooldown = Math.round(duration * 0.2)
      const main = duration - warmup - cooldown
      return [
        { phase: 'Échauffement', duration: warmup, zone: 2, description: 'Footing progressif + gammes' },
        { phase: 'Bloc seuil', duration: main, zone: 4, description: `${main} min en Z4 — effort soutenu, parole difficile` },
        { phase: 'Retour au calme', duration: cooldown, zone: 2, description: 'Footing léger en Z2' },
      ]
    },
  },
  vma: {
    type: 'vma',
    label: 'VMA / Fractionné',
    primaryZone: 5,
    zoneDistribution: { z1: 0.15, z2: 0.35, z5: 0.5 },
    rpeTarget: 8,
    durationFactor: 0.75,
    description: 'Fractionné haute intensité (Z5)',
    buildDetails(duration) {
      const warmup = Math.round(duration * 0.3)
      const cooldown = Math.round(duration * 0.2)
      const mainDuration = duration - warmup - cooldown
      // Intervalles typiques : 30/30, 200m, 400m selon la durée du bloc
      const reps = Math.max(4, Math.round(mainDuration / 3))
      const workSec = 90
      const restSec = 90
      return [
        { phase: 'Échauffement', duration: warmup, zone: 2, description: 'Footing progressif + éducatifs + accélérations' },
        {
          phase: 'Fractionné',
          duration: mainDuration,
          zone: 5,
          description: `${reps} × ${workSec}s vite / ${restSec}s récup en Z5`,
          intervals: { reps, workDuration: workSec, workZone: 5, restDuration: restSec, restZone: 1 },
        },
        { phase: 'Retour au calme', duration: cooldown, zone: 1, description: 'Footing très léger + étirements' },
      ]
    },
  },
  cotes: {
    type: 'cotes',
    label: 'Côtes / Dénivelé',
    primaryZone: 4,
    zoneDistribution: { z2: 0.4, z4: 0.45, z5: 0.15 },
    rpeTarget: 7,
    durationFactor: 0.8,
    description: 'Travail en côtes (force + puissance)',
    buildDetails(duration) {
      const warmup = Math.round(duration * 0.25)
      const cooldown = Math.round(duration * 0.2)
      const main = duration - warmup - cooldown
      const reps = Math.max(4, Math.round(main / 3.5))
      return [
        { phase: 'Échauffement', duration: warmup, zone: 2, description: 'Footing plat progressif' },
        {
          phase: 'Côtes',
          duration: main,
          zone: 4,
          description: `${reps} × côte 30-45s en effort soutenu, redescente en récupération`,
          intervals: { reps, workDuration: 40, workZone: 5, restDuration: 90, restZone: 2 },
        },
        { phase: 'Retour au calme', duration: cooldown, zone: 2, description: 'Footing léger retour' },
      ]
    },
  },
}

// ─── Placement des séances dans la semaine ────────────────────────────────

// dayOfWeek: 0=Lundi … 6=Dimanche
const DAY_TEMPLATES = {
  3: [
    { day: 1, slot: 'quality' },   // Mardi
    { day: 3, slot: 'ef' },        // Jeudi
    { day: 6, slot: 'sl' },        // Dimanche
  ],
  4: [
    { day: 0, slot: 'ef' },        // Lundi
    { day: 2, slot: 'quality' },   // Mercredi
    { day: 4, slot: 'ef' },        // Vendredi
    { day: 6, slot: 'sl' },        // Dimanche
  ],
  5: [
    { day: 0, slot: 'ef' },        // Lundi
    { day: 1, slot: 'quality1' },  // Mardi
    { day: 3, slot: 'ef' },        // Jeudi
    { day: 5, slot: 'quality2' },  // Samedi
    { day: 6, slot: 'sl' },        // Dimanche
  ],
  6: [
    { day: 0, slot: 'ef' },        // Lundi
    { day: 1, slot: 'quality1' },  // Mardi
    { day: 2, slot: 'recup' },     // Mercredi
    { day: 3, slot: 'ef' },        // Jeudi
    { day: 5, slot: 'quality2' },  // Samedi
    { day: 6, slot: 'sl' },        // Dimanche
  ],
}

// ─── Résolution des slots qualité selon l'objectif ────────────────────────

function resolveQualitySlots(objective, runsPerWeek) {
  // Pour 3-4/sem : un seul slot "quality" → alterner semaine paire/impaire
  // Pour 5-6/sem : quality1 = VMA, quality2 = seuil (par défaut)

  const isShortDistance = ['sante', '5k', '10k'].includes(objective)
  const isLongDistance = ['marathon', 'trail_long', 'ultra'].includes(objective)
  const isTrail = ['trail_court', 'trail_long'].includes(objective)

  if (runsPerWeek <= 4) {
    // Un seul créneau qualité → alterner par semaine
    if (isLongDistance) return { quality: ['tempo', 'seuil', 'tempo', 'seuil'] }
    if (isShortDistance) return { quality: ['vma', 'seuil', 'vma', 'seuil'] }
    return { quality: ['seuil', 'vma', 'seuil', 'vma'] } // semi, trail_court
  }

  // 5-6/sem : deux créneaux qualité
  let q1 = 'vma'
  let q2 = 'seuil'

  if (isLongDistance) { q1 = 'tempo'; q2 = 'seuil' }
  if (isShortDistance) { q1 = 'vma'; q2 = 'tempo' }

  // Trail : remplacer q1 par côtes si possible
  if (isTrail && runsPerWeek >= 5) { q1 = 'cotes' }

  return { quality1: q1, quality2: q2 }
}

// ─── Durées de sortie longue plafonnées par objectif ──────────────────────

function getMaxSLDuration(objective) {
  switch (objective) {
    case 'sante': return 50
    case '5k': return 60
    case '10k': return 75
    case 'semi': return 90
    case 'marathon': return 130
    case 'trail_court': return 110
    case 'trail_long': return 150
    case 'ultra': return 180
    default: return 90
  }
}

// ─── Estimation du volume / durée de base ─────────────────────────────────

const DEFAULT_VOLUMES = { debutant: 15, intermediaire: 30, confirme: 45, elite: 60 }
const DEFAULT_PACES = { debutant: 7.0, intermediaire: 6.0, confirme: 5.5, elite: 5.0 }

function getBaseWeeklyDuration(patient) {
  const volumeKm = patient.weeklyVolumeRef || DEFAULT_VOLUMES[patient.level] || 30
  const avgPace = patient.vma
    ? 60 / (patient.vma * 0.70)
    : DEFAULT_PACES[patient.level] || 6.0
  return volumeKm * avgPace // minutes totales par semaine
}

function estimateAvgSpeed(patient) {
  if (patient.vma) return patient.vma * 0.70
  if (patient.criticalSpeed) return patient.criticalSpeed * 0.80
  const paces = DEFAULT_PACES[patient.level] || 6.0
  return 60 / paces
}

// ─── Suggestion du nombre de sorties ──────────────────────────────────────

export function suggestRunsPerWeek(patient) {
  if (!patient) return 3

  const vol = patient.weeklyVolumeRef || 0
  const level = patient.level

  // Volume-based
  if (vol >= 60) return 6
  if (vol >= 40) return 5
  if (vol >= 25) return 4

  // Level-based fallback
  if (level === 'elite') return 6
  if (level === 'confirme') return 5
  if (level === 'intermediaire') return 4
  return 3
}

// ─── Générateur principal ─────────────────────────────────────────────────

const WEEK_MULTIPLIERS = [1.0, 1.08, 1.16, 0.65]
const WEEK_LABELS = ['Semaine 1', 'Semaine 2 — Progression', 'Semaine 3 — Pic', 'Semaine 4 — Décharge']

/**
 * Génère un plan d'entraînement sur 4 semaines.
 *
 * @param {object} patient - Profil patient
 * @param {object} options - { runsPerWeek: 3-6, startDate: 'YYYY-MM-DD' }
 * @returns {object} Plan complet
 */
export function generateTrainingPlan(patient, options) {
  const { runsPerWeek = 4, startDate } = options
  const freq = Math.min(6, Math.max(3, runsPerWeek))

  const baseWeeklyDuration = getBaseWeeklyDuration(patient)
  const avgSpeed = estimateAvgSpeed(patient) // km/h
  const zonePaces = calcZonePaces(patient)
  const objective = patient.objective || 'sante'
  const qualitySlots = resolveQualitySlots(objective, freq)
  const dayTemplate = DAY_TEMPLATES[freq]
  const maxSL = getMaxSLDuration(objective)

  const weeks = []

  for (let w = 0; w < 4; w++) {
    const multiplier = WEEK_MULTIPLIERS[w]
    const weekDuration = baseWeeklyDuration * multiplier

    // Résoudre les types de séance pour cette semaine
    const resolvedSessions = dayTemplate.map(({ day, slot }) => {
      let type = slot
      if (slot === 'quality') type = qualitySlots.quality[w]
      else if (slot === 'quality1') type = qualitySlots.quality1
      else if (slot === 'quality2') type = qualitySlots.quality2
      return { day, type }
    })

    // Semaine de décharge : remplacer les séances qualité par EF ou les raccourcir
    const isDeload = w === 3
    const finalSessions = isDeload
      ? resolvedSessions.map(s => {
          if (['vma', 'cotes'].includes(s.type)) return { ...s, type: 'ef' }
          return s
        })
      : resolvedSessions

    // Calculer les durées proportionnelles
    const templates = finalSessions.map(s => ({ ...s, template: SESSION_TEMPLATES[s.type] }))
    const totalFactors = templates.reduce((sum, s) => sum + s.template.durationFactor, 0)

    const sessions = templates.map(({ day, type, template }) => {
      let duration = Math.round((weekDuration * template.durationFactor) / totalFactors)

      // Plafonner la SL
      if (type === 'sl') duration = Math.min(duration, Math.round(maxSL * multiplier))

      // Min 20 min par séance
      duration = Math.max(20, duration)

      // Zone breakdown en minutes
      const zoneBreakdown = {}
      for (const [zone, ratio] of Object.entries(template.zoneDistribution)) {
        zoneBreakdown[zone] = Math.round(duration * ratio)
      }

      // Distance estimée
      const sessionZonePace = zonePaces?.[template.primaryZone - 1]
      let estimatedDistance = duration * avgSpeed / 60
      if (sessionZonePace?.vma) {
        const avgZoneSpeed = (sessionZonePace.vma.speedRange.low + sessionZonePace.vma.speedRange.high) / 2
        estimatedDistance = duration * avgZoneSpeed / 60
      } else if (sessionZonePace?.vc) {
        const avgZoneSpeed = (sessionZonePace.vc.speedRange.low + sessionZonePace.vc.speedRange.high) / 2
        estimatedDistance = duration * avgZoneSpeed / 60
      }

      // Construire les détails structurés
      const details = template.buildDetails(duration)

      // Calculer la date si startDate fourni
      let date = null
      if (startDate) {
        const start = new Date(startDate)
        const d = new Date(start)
        d.setDate(d.getDate() + w * 7 + day)
        date = d.toISOString().split('T')[0]
      }

      return {
        id: crypto.randomUUID(),
        dayOfWeek: day,
        weekNumber: w + 1,
        date,
        type,
        label: template.label,
        duration,
        estimatedDistance: Number(estimatedDistance.toFixed(1)),
        primaryZone: template.primaryZone,
        zoneBreakdown,
        paces: sessionZonePace || null,
        rpeTarget: template.rpeTarget,
        description: template.description,
        details,
      }
    })

    const totalVolume = sessions.reduce((sum, s) => sum + s.estimatedDistance, 0)
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0)

    // Calcul 80/20 pour cette semaine
    const lowIntensityMin = sessions.reduce((sum, s) => sum + (s.zoneBreakdown.z1 || 0) + (s.zoneBreakdown.z2 || 0), 0)
    const _HighIntensityMin = sessions.reduce((sum, s) => sum + (s.zoneBreakdown.z3 || 0) + (s.zoneBreakdown.z4 || 0) + (s.zoneBreakdown.z5 || 0), 0)
    const lowPercent = totalDuration > 0 ? Math.round((lowIntensityMin / totalDuration) * 100) : 0

    weeks.push({
      weekNumber: w + 1,
      label: WEEK_LABELS[w],
      multiplier,
      isDeload,
      totalVolume: Number(totalVolume.toFixed(1)),
      totalDuration,
      lowIntensityPercent: lowPercent,
      sessions,
    })
  }

  // Stats globales
  const totalVolume4w = weeks.reduce((s, w) => s + w.totalVolume, 0)
  const totalDuration4w = weeks.reduce((s, w) => s + w.totalDuration, 0)
  const totalSessions4w = weeks.reduce((s, w) => s + w.sessions.length, 0)
  const globalLowMin = weeks.reduce((s, w) => s + w.sessions.reduce((ss, se) => ss + (se.zoneBreakdown.z1 || 0) + (se.zoneBreakdown.z2 || 0), 0), 0)
  const globalLowPercent = totalDuration4w > 0 ? Math.round((globalLowMin / totalDuration4w) * 100) : 0

  return {
    createdAt: new Date().toISOString(),
    runsPerWeek: freq,
    objective,
    startDate: startDate || null,
    patientName: `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
    summary: {
      totalVolume: Number(totalVolume4w.toFixed(1)),
      totalDuration: totalDuration4w,
      totalSessions: totalSessions4w,
      lowIntensityPercent: globalLowPercent,
    },
    weeks,
    zonePaces,
  }
}
