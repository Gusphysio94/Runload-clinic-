/**
 * Génération de protocoles de reprise course à pied post-blessure.
 *
 * Basé sur les guidelines de :
 * - Warden SJ et al. (2014) — Management and prevention of bone stress injuries
 * - Silbernagel KG et al. (2020) — Achilles tendinopathy: continuum model
 * - Mascaro A et al. (2023) — Return-to-sport after muscle injury
 * - Esculier JF et al. (2020) — Running reconditioning programs
 * - La Clinique du Coureur (2024) — Quantification du stress mécanique
 * - Gabbett TJ (2016) — ACWR & training-injury prevention paradox
 * - Dye SF (2005) — Envelope of function / tissue homeostasis
 * - Napier C et al. (2020) — Running injury prevention consensus
 *
 * Principes fondamentaux :
 * - Walk/run avant course continue
 * - Monitoring douleur : ≤ 3/10 pendant, pas d'augmentation J+1
 * - Volume avant intensité, plat avant dénivelé avant vitesse
 * - Progressions hebdo : 5% (os), 10% (tendons/muscles), max 15%
 * - Min 2 jours de repos entre séances en début de protocole
 * - Cadence ≥ 170 pas/min = facteur protecteur
 */

// ─── Catégories de blessure et paramètres spécifiques ───────────────────────

const INJURY_CATEGORIES = {
  bone_stress: {
    label: 'Fracture de stress / Réaction de stress osseux',
    injuries: ['fracture_stress_tibiale', 'fracture_stress_tibiale_ant', 'fracture_stress_metatarse', 'periostite'],
    totalPhases: 10,
    weeklyProgressionMax: 5,
    prerequisiteWalkMin: 45,
    startRunMin: 1,
    startWalkMin: 4,
    startReps: 5,
    sessionsPerWeek: 3,
    minRestDays: 2,
    painThreshold: 2,
    allowedPainDuring: false,
    monitoringKey: 'Douleur osseuse locale',
    monitoringRule: 'Aucune douleur acceptée pendant ou après la course. Si douleur > 0/10 au site de fracture → arrêt immédiat et retour au palier précédent.',
    prerequisites: [
      'Marche 45 minutes sans douleur sur terrain plat',
      'Palpation du site de fracture indolore',
      'Imagerie de contrôle favorable (si applicable)',
      'Hop test unilatéral sans douleur',
      'Minimum 6 semaines post-diagnostic (tibia) ou 4 semaines (métatarse)',
    ],
    redFlags: [
      'Douleur au site de fracture pendant ou après la course',
      'Douleur nocturne réapparue',
      'Douleur à la palpation du site',
      'Boiterie pendant la course',
    ],
    complementary: [
      'Renforcement musculaire du membre inférieur 3×/semaine',
      'Travail proprioceptif quotidien',
      'Cross-training cardiovasculaire (vélo, natation, elliptique)',
      'Apport calcique et vitamine D adéquat (vérifier bilan sanguin)',
      'Évaluer les facteurs de risque : RED-S, densité osseuse, charge antérieure',
    ],
    intensityRestrictions: {
      noHillsUntilPhase: 8,
      noSpeedUntilPhase: 9,
      noRaceUntilPhase: 10,
    },
  },

  tendinopathy: {
    label: 'Tendinopathie',
    injuries: [
      'tendinopathie_achille', 'tendinopathie_achille_insertionnelle',
      'tendinopathie_patellaire', 'tendinopathie_quadricipitale',
      'tendinopathie_ischio', 'tendinopathie_moyen_fessier',
      'tendinopathie_psoas', 'tendinopathie_fibulaires',
      'tendinopathie_tibial_post',
    ],
    totalPhases: 8,
    weeklyProgressionMax: 10,
    prerequisiteWalkMin: 30,
    startRunMin: 2,
    startWalkMin: 3,
    startReps: 5,
    sessionsPerWeek: 3,
    minRestDays: 1,
    painThreshold: 3,
    allowedPainDuring: true,
    monitoringKey: 'Raideur matinale + douleur à l\'effort',
    monitoringRule: 'Douleur ≤ 3/10 acceptée pendant la course SI elle ne persiste pas au-delà de 24h et SI la raideur matinale n\'augmente pas (règle des 24h). Si raideur matinale > 30 min → réduire la charge.',
    prerequisites: [
      'Marche 30 minutes sans aggravation de la douleur',
      'Raideur matinale < 30 minutes',
      'Programme de renforcement isométrique/isotonique en cours depuis ≥ 2 semaines',
      'Douleur au repos ≤ 2/10',
    ],
    redFlags: [
      'Douleur > 3/10 pendant la course',
      'Douleur qui ne revient pas au niveau de base dans les 24h',
      'Raideur matinale augmentée le lendemain (> 30 min)',
      'Gonflement notable du tendon',
    ],
    complementary: [
      'Renforcement progressif du tendon (isométrique → isotonique → pliométrique)',
      'Exercices de la chaîne cinétique complète',
      'Étirements doux post-activité (pas avant)',
      'Le repos complet est DÉLÉTÈRE — maintenir un stress mécanique adapté',
      'Cross-training : vélo, natation (maintien du fitness cardiovasculaire)',
    ],
    intensityRestrictions: {
      noHillsUntilPhase: 6,
      noSpeedUntilPhase: 7,
      noRaceUntilPhase: 8,
    },
  },

  muscle_injury: {
    label: 'Lésion musculaire',
    injuries: ['lesion_musculaire'],
    totalPhases: 6,
    weeklyProgressionMax: 15,
    prerequisiteWalkMin: 20,
    startRunMin: 3,
    startWalkMin: 2,
    startReps: 5,
    sessionsPerWeek: 3,
    minRestDays: 1,
    painThreshold: 2,
    allowedPainDuring: false,
    monitoringKey: 'Douleur à l\'étirement et à la contraction',
    monitoringRule: 'Aucune douleur musculaire au site lésionnel pendant la course. Étirement indolore à amplitude complète requis avant progression. Risque de récidive maximal dans les 2 premières semaines de reprise.',
    prerequisites: [
      'Marche rapide 20 minutes sans douleur',
      'Étirement passif du muscle indolore à amplitude complète',
      'Force ≥ 80% du côté sain (test isométrique)',
      'Pas de douleur à la palpation du site lésionnel',
    ],
    redFlags: [
      'Douleur vive et soudaine au site de lésion',
      'Sensation de « claquement » ou craquement',
      'Perte de force soudaine',
      'Ecchymose nouvelle',
    ],
    complementary: [
      'Renforcement excentrique progressif du muscle lésé',
      'Travail de gainage et stabilité du bassin',
      'Échauffement dynamique obligatoire avant chaque séance',
      'Sprints et changements de direction en fin de protocole uniquement',
    ],
    intensityRestrictions: {
      noHillsUntilPhase: 4,
      noSpeedUntilPhase: 5,
      noRaceUntilPhase: 6,
    },
  },

  joint_fascial: {
    label: 'Pathologie articulaire / fasciale',
    injuries: [
      'syndrome_rotulien', 'syndrome_it', 'syndrome_it_proximal',
      'aponevrosite', 'entorse_cheville', 'plica_synoviale',
      'douleur_hanche', 'douleur_sacro_iliaque', 'lombalgie',
      'metatarsalgie', 'coussinet_graisseux', 'sesamoidopathie',
      'hallux_limitus', 'releveur_pied', 'syndrome_loge',
    ],
    totalPhases: 7,
    weeklyProgressionMax: 10,
    prerequisiteWalkMin: 30,
    startRunMin: 2,
    startWalkMin: 3,
    startReps: 5,
    sessionsPerWeek: 3,
    minRestDays: 1,
    painThreshold: 3,
    allowedPainDuring: true,
    monitoringKey: 'Douleur pendant et après l\'effort',
    monitoringRule: 'Douleur ≤ 3/10 acceptée pendant SI retour au niveau de base dans les 24h. Si la douleur augmente progressivement au fil de la séance → arrêt et retour au palier précédent.',
    prerequisites: [
      'Marche 30 minutes sans aggravation',
      'Douleur au repos ≤ 2/10',
      'Amplitude articulaire fonctionnelle restaurée',
    ],
    redFlags: [
      'Douleur > 3/10 qui augmente pendant la séance',
      'Blocage articulaire',
      'Gonflement important post-course',
      'Douleur qui ne revient pas au baseline en 24h',
    ],
    complementary: [
      'Renforcement ciblé selon la pathologie',
      'Travail proprioceptif et neuromusculaire',
      'Cross-training à faible impact (vélo, aquajogging)',
      'Analyse biomécanique de la foulée si disponible',
    ],
    intensityRestrictions: {
      noHillsUntilPhase: 5,
      noSpeedUntilPhase: 6,
      noRaceUntilPhase: 7,
    },
  },
}

// ─── Progressions walk/run standardisées ────────────────────────────────────

// Chaque step = { runMin, walkMin, reps, totalMin }
const WALK_RUN_PROGRESSION = [
  { runMin: 1,  walkMin: 4,   reps: 5,  totalMin: 25 },   // 0
  { runMin: 2,  walkMin: 3,   reps: 5,  totalMin: 25 },   // 1
  { runMin: 3,  walkMin: 2,   reps: 5,  totalMin: 25 },   // 2
  { runMin: 4,  walkMin: 1,   reps: 5,  totalMin: 25 },   // 3
  { runMin: 5,  walkMin: 1,   reps: 5,  totalMin: 30 },   // 4
  { runMin: 8,  walkMin: 2,   reps: 3,  totalMin: 30 },   // 5
  { runMin: 12, walkMin: 1,   reps: 2,  totalMin: 26 },   // 6
  { runMin: 15, walkMin: 1,   reps: 2,  totalMin: 32 },   // 7
  { runMin: 20, walkMin: 0,   reps: 1,  totalMin: 20 },   // 8 - continu
  { runMin: 25, walkMin: 0,   reps: 1,  totalMin: 25 },   // 9
  { runMin: 30, walkMin: 0,   reps: 1,  totalMin: 30 },   // 10
  { runMin: 35, walkMin: 0,   reps: 1,  totalMin: 35 },   // 11
  { runMin: 40, walkMin: 0,   reps: 1,  totalMin: 40 },   // 12
]

// ─── Génération du protocole ────────────────────────────────────────────────

/**
 * Génère un protocole de reprise course post-blessure.
 *
 * @param {Object} params
 * @param {string} params.injuryType — clé de la pathologie (ex: 'fracture_stress_tibiale')
 * @param {number} params.weeksOff — semaines d'arrêt de course
 * @param {string} params.level — 'debutant' | 'intermediaire' | 'confirme'
 * @param {number} params.targetWeeklyVolume — volume hebdo cible (km) avant blessure
 * @param {number} params.currentPainRest — douleur actuelle au repos (0-10)
 * @returns {Object} protocol
 */
export function generateReturnToRunProtocol({
  injuryType,
  weeksOff = 4,
  level = 'intermediaire',
  targetWeeklyVolume = 30,
  currentPainRest = 0,
}) {
  // Trouver la catégorie de blessure
  const category = findCategory(injuryType)
  if (!category) {
    return { error: `Pathologie "${injuryType}" non reconnue pour la génération de protocole.` }
  }

  // Vérifier les prérequis
  const readinessIssues = []
  if (currentPainRest > 3) {
    readinessIssues.push(`Douleur au repos trop élevée (${currentPainRest}/10). Objectif : ≤ 2/10 avant de commencer.`)
  }

  // Calculer le step de départ dans la progression walk/run
  const startStep = calcStartStep(category, weeksOff, level)

  // Nombre de phases pour cette catégorie
  const totalPhases = category.totalPhases

  // Générer les phases
  const phases = []
  let currentStep = startStep
  let currentFreq = category.sessionsPerWeek

  for (let i = 0; i < totalPhases; i++) {
    const phaseNum = i + 1
    const isLast = i === totalPhases - 1
    const stepData = WALK_RUN_PROGRESSION[Math.min(currentStep, WALK_RUN_PROGRESSION.length - 1)]

    // Durée de la phase en semaines
    const phaseDuration = calcPhaseDuration(category, phaseNum, weeksOff)

    // Fréquence progressive
    if (phaseNum >= Math.ceil(totalPhases * 0.5)) {
      currentFreq = Math.min(currentFreq + 1, levelToMaxFreq(level))
    }

    // Restrictions d'intensité
    const restrictions = []
    const { noHillsUntilPhase, noSpeedUntilPhase, noRaceUntilPhase } = category.intensityRestrictions
    if (phaseNum < noHillsUntilPhase) restrictions.push('Terrain plat uniquement')
    else if (phaseNum === noHillsUntilPhase) restrictions.push('Introduction progressive des côtes légères')
    if (phaseNum < noSpeedUntilPhase) restrictions.push('Allure facile uniquement (conversationnelle)')
    else if (phaseNum === noSpeedUntilPhase) restrictions.push('Introduction de variations d\'allure légères (fartlek)')
    if (phaseNum >= noRaceUntilPhase && isLast) restrictions.push('Retour compétition possible si protocole complété')

    // Objectif de la phase
    const objective = getPhaseObjective(phaseNum, totalPhases, stepData, isLast, targetWeeklyVolume)

    // Critères de progression
    const progressionCriteria = getProgressionCriteria(category, phaseNum, totalPhases)

    // Volume estimé par séance (km, très approximatif à 6min/km de base)
    const estPaceMinKm = level === 'debutant' ? 7 : level === 'confirme' ? 5.5 : 6
    const runMinPerSession = stepData.runMin * stepData.reps
    const estDistancePerSession = runMinPerSession / estPaceMinKm
    const estWeeklyVolume = estDistancePerSession * currentFreq

    phases.push({
      number: phaseNum,
      name: getPhaseName(phaseNum, totalPhases, stepData),
      duration: `${phaseDuration} semaine${phaseDuration > 1 ? 's' : ''}`,
      durationWeeks: phaseDuration,
      frequency: `${currentFreq}×/semaine`,
      frequencyNum: currentFreq,
      walkRun: stepData.walkMin > 0
        ? `${stepData.runMin} min course / ${stepData.walkMin} min marche × ${stepData.reps}`
        : `${stepData.runMin} min course continue`,
      runMin: stepData.runMin,
      walkMin: stepData.walkMin,
      reps: stepData.reps,
      totalSessionMin: stepData.totalMin,
      estDistancePerSession: Number(estDistancePerSession.toFixed(1)),
      estWeeklyVolume: Number(estWeeklyVolume.toFixed(1)),
      restrictions,
      objective,
      progressionCriteria,
      isContinuous: stepData.walkMin === 0,
    })

    currentStep++
  }

  // Volume total estimé du protocole
  const totalWeeks = phases.reduce((s, p) => s + p.durationWeeks, 0)

  return {
    injuryType,
    categoryLabel: category.label,
    level,
    targetWeeklyVolume,
    weeksOff,
    totalWeeks,
    phases,
    painMonitoring: {
      threshold: category.painThreshold,
      allowedDuring: category.allowedPainDuring,
      key: category.monitoringKey,
      rule: category.monitoringRule,
    },
    prerequisites: category.prerequisites,
    readinessIssues,
    redFlags: category.redFlags,
    complementary: category.complementary,
    generalRules: [
      'Échauffement : 5 min de marche rapide avant chaque séance',
      'Retour au calme : 5 min de marche après chaque séance',
      'Cadence cible : 170-190 pas/min (facteur protecteur)',
      'Surface : privilégier terrain souple et plat (herbe, piste, chemin de terre)',
      'Hydratation et nutrition adaptées à la reprise',
      `Ne pas dépasser ${category.weeklyProgressionMax}% d'augmentation du volume par semaine`,
      'Si douleur → reculer d\'un palier pendant 1 semaine avant de retenter',
      'Tenir un journal de douleur quotidien (0-10 matin, pendant, après)',
    ],
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function findCategory(injuryType) {
  for (const cat of Object.values(INJURY_CATEGORIES)) {
    if (cat.injuries.includes(injuryType)) return cat
  }
  return null
}

export function getInjuryCategoryLabel(injuryType) {
  const cat = findCategory(injuryType)
  return cat ? cat.label : null
}

/**
 * Détermine le step de départ dans WALK_RUN_PROGRESSION.
 * Plus l'arrêt est long ou la blessure osseuse, plus on commence bas.
 */
function calcStartStep(category, weeksOff, _level) {
  // Base step selon la catégorie
  let step = 0
  if (category === INJURY_CATEGORIES.tendinopathy) step = 1
  if (category === INJURY_CATEGORIES.muscle_injury) step = 2
  if (category === INJURY_CATEGORIES.joint_fascial) step = 1

  // Si peu d'arrêt (< 2 semaines), on peut avancer d'un step
  if (weeksOff <= 2 && category !== INJURY_CATEGORIES.bone_stress) {
    step = Math.min(step + 1, 3)
  }

  // Si long arrêt (> 8 semaines), reculer d'un step
  if (weeksOff > 8) {
    step = Math.max(0, step - 1)
  }

  return step
}

function calcPhaseDuration(category, phaseNum, weeksOff) {
  // Phases plus longues pour fractures de stress
  if (category === INJURY_CATEGORIES.bone_stress) {
    if (phaseNum <= 3) return 2 // 2 semaines par phase au début
    return 1
  }
  // Phase 1 toujours 1-2 semaines
  if (phaseNum === 1 && weeksOff > 6) return 2
  if (phaseNum === 1) return 1
  return 1
}

function levelToMaxFreq(level) {
  if (level === 'debutant') return 4
  if (level === 'confirme') return 6
  return 5
}

function getPhaseName(phaseNum, totalPhases, stepData) {
  if (phaseNum === 1) return 'Initiation walk/run'
  if (phaseNum === 2) return 'Progression walk/run'
  if (stepData.walkMin > 0 && phaseNum < totalPhases - 2) return 'Walk/run avancé'
  if (stepData.walkMin > 0) return 'Transition vers continu'
  if (phaseNum === totalPhases) return 'Retour au volume cible'
  if (phaseNum === totalPhases - 1) return 'Course continue progressive'
  return 'Course continue'
}

function getPhaseObjective(phaseNum, totalPhases, stepData, isLast, targetVol) {
  if (phaseNum === 1) return 'Tolérance au stress d\'impact. Valider l\'absence de douleur sur les premières séquences de course.'
  if (phaseNum === 2) return 'Augmenter progressivement le temps de course relatif. Monitorer la réponse tissulaire sur 24-48h.'
  if (stepData.walkMin > 0) return 'Réduire les intervalles de marche. Le ratio course/marche augmente progressivement.'
  if (isLast) return `Retour progressif vers le volume cible (~${targetVol} km/sem). Introduction possible des séances qualité.`
  return 'Augmenter la durée de course continue. Maintenir l\'allure conversationnelle.'
}

function getProgressionCriteria(category, phaseNum, totalPhases) {
  const criteria = []

  if (category.allowedPainDuring) {
    criteria.push(`Douleur ≤ ${category.painThreshold}/10 pendant chaque séance de la phase`)
    criteria.push('Douleur revenue au niveau de base dans les 24h post-course')
  } else {
    criteria.push('Aucune douleur (0/10) pendant et après chaque séance')
    criteria.push('Pas de douleur au site lésionnel au réveil')
  }

  criteria.push('Toutes les séances de la phase complétées sans régression')

  if (phaseNum < totalPhases) {
    criteria.push('Pas de gonflement ou raideur matinale augmentée')
  }

  if (phaseNum === totalPhases - 1) {
    criteria.push('Capable de courir à allure facile sans modification de la foulée')
  }

  if (phaseNum === totalPhases) {
    criteria.push('Volume hebdomadaire proche du volume pré-blessure')
    criteria.push('Retour possible aux séances d\'intensité (fartlek, seuil)')
  }

  return criteria
}

// ─── Liste des blessures supportées ─────────────────────────────────────────

export function getSupportedInjuries() {
  const list = []
  for (const [key, cat] of Object.entries(INJURY_CATEGORIES)) {
    for (const injury of cat.injuries) {
      list.push({
        value: injury,
        categoryKey: key,
        categoryLabel: cat.label,
      })
    }
  }
  return list
}
