// ─── Conseils chaussage cliniques ─────────────────────────────────────────────
// Basé sur : La Clinique du Coureur, Esculier et al. (2014, 2018), Malisoux et al. (2015)

/**
 * Catégories d'indice minimaliste
 */
export function getMinimalistCategory(index) {
  if (index >= 91) return { label: 'Ultra-minimaliste', key: 'ultra', color: '#10b981' }
  if (index >= 71) return { label: 'Minimaliste', key: 'minimalist', color: '#22c55e' }
  if (index >= 51) return { label: 'Partiellement minimaliste', key: 'partial', color: '#eab308' }
  if (index >= 26) return { label: 'Modéré', key: 'moderate', color: '#f97316' }
  return { label: 'Maximaliste', key: 'maximalist', color: '#ef4444' }
}

/**
 * Durée de vie estimée d'une chaussure selon son type et l'utilisation
 */
export const SHOE_LIFESPAN = {
  route: { min: 600, max: 900, label: 'Route' },
  trail: { min: 500, max: 800, label: 'Trail' },
  competition: { min: 300, max: 500, label: 'Compétition' },
  minimaliste: { min: 400, max: 700, label: 'Minimaliste' },
}

/**
 * Calcule le pourcentage d'usure d'une chaussure
 */
export function getWearPercent(kmRun, type = 'route') {
  const lifespan = SHOE_LIFESPAN[type] || SHOE_LIFESPAN.route
  const avg = (lifespan.min + lifespan.max) / 2
  return Math.min(100, Math.round((kmRun / avg) * 100))
}

/**
 * Statut d'usure
 */
export function getWearStatus(kmRun, type = 'route') {
  const lifespan = SHOE_LIFESPAN[type] || SHOE_LIFESPAN.route
  if (kmRun < lifespan.min * 0.7) return { label: 'Bon état', color: '#10b981', level: 'good' }
  if (kmRun < lifespan.min) return { label: 'Usure modérée', color: '#eab308', level: 'moderate' }
  if (kmRun < lifespan.max) return { label: 'À surveiller', color: '#f97316', level: 'warning' }
  return { label: 'À remplacer', color: '#ef4444', level: 'replace' }
}

/**
 * Recommandations de transition minimaliste
 * Règle LCDC : ne pas augmenter l'IM de plus de 5% à la fois,
 * adapter sur 8-12 semaines minimum
 */
export function getTransitionAdvice(currentIM, targetIM, patient) {
  const diff = targetIM - currentIM
  if (diff <= 0) return null

  const isHighRisk = patient?.injuries?.some(i =>
    i.status === 'ongoing' &&
    ['tendinopathie_achille', 'fasciite_plantaire', 'metatarsalgie', 'fracture_stress'].includes(i.type)
  )

  const level = patient?.level || 'intermediaire'
  const isBeginnerOrInjured = level === 'debutant' || isHighRisk

  // Durée de transition
  let weeks
  if (diff <= 10) weeks = isBeginnerOrInjured ? 8 : 4
  else if (diff <= 20) weeks = isBeginnerOrInjured ? 12 : 8
  else weeks = isBeginnerOrInjured ? 16 : 12

  // Étapes intermédiaires
  const steps = []
  const stepSize = isBeginnerOrInjured ? 5 : 10
  let current = currentIM
  let weekNum = 0
  const weekIncrement = Math.ceil(weeks / Math.ceil(diff / stepSize))

  while (current < targetIM) {
    current = Math.min(current + stepSize, targetIM)
    weekNum += weekIncrement
    steps.push({
      week: weekNum,
      targetIM: current,
      category: getMinimalistCategory(current),
      volumePercent: Math.round(20 + (80 * Math.min(weekNum / weeks, 1))),
    })
  }

  return {
    currentIM,
    targetIM,
    totalWeeks: weeks,
    isHighRisk,
    steps,
    guidelines: [
      `Commencer par porter la nouvelle chaussure uniquement sur les séances faciles (Z1-Z2)`,
      `Semaines 1-${Math.ceil(weeks / 3)} : limiter à 20-30% du volume hebdomadaire`,
      `Semaines ${Math.ceil(weeks / 3) + 1}-${Math.ceil(weeks * 2 / 3)} : augmenter progressivement à 50%`,
      `Semaines ${Math.ceil(weeks * 2 / 3) + 1}-${weeks} : transition complète possible si aucune douleur`,
      `Surveiller : douleurs au mollet, tendon d'Achille, voûte plantaire`,
      isHighRisk ? `ATTENTION : pathologie active — transition plus lente recommandée, supervision régulière` : null,
    ].filter(Boolean),
  }
}

/**
 * Recommandations cliniques par pathologie
 * Source : La Clinique du Coureur, consensus experts biomécanique
 */
export const PATHOLOGY_SHOE_ADVICE = {
  tendinopathie_achille: {
    label: 'Tendinopathie d\'Achille',
    phase_aigue: {
      drop: { min: 8, max: 12, note: 'Drop plus élevé pour réduire la tension sur le tendon' },
      amorti: 'Modéré à élevé',
      im: { max: 52, note: 'Éviter les chaussures trop minimalistes' },
      avoid: ['Drop < 6mm', 'Chaussures minimalistes (IM > 70%)', 'Changement de chaussure pendant la phase aiguë'],
      recommend: ['Drop temporairement augmenté', 'Talonnette possible en appoint (3-5mm)', 'Chaussure habituelle si confortable'],
    },
    phase_retour: {
      drop: { min: 4, max: 8, note: 'Réduction progressive du drop possible' },
      amorti: 'Modéré',
      im: { max: 64, note: 'Transition très progressive' },
      recommend: ['Diminution progressive du drop sur 8-12 semaines', 'Renforcement excentrique en parallèle', 'Rotation avec ancien modèle'],
    },
  },
  fasciite_plantaire: {
    label: 'Fasciite plantaire',
    phase_aigue: {
      drop: { min: 6, max: 10, note: 'Drop modéré pour réduire la mise en tension du fascia' },
      amorti: 'Élevé, surtout au talon',
      im: { max: 50, note: 'Chaussure avec bon soutien' },
      avoid: ['Chaussures plates (drop < 4mm)', 'Semelles trop souples', 'Marcher pieds nus sur sol dur'],
      recommend: ['Amorti arrière-pied', 'Semelle orthopédique si prescrite', 'Chaussure rigide pour le quotidien'],
    },
    phase_retour: {
      drop: { min: 4, max: 8 },
      amorti: 'Modéré',
      im: { max: 60 },
      recommend: ['Transition progressive possible', 'Exercices de renforcement du pied', 'Étirements du mollet et du fascia'],
    },
  },
  syndrome_femoro_patellaire: {
    label: 'Syndrome fémoro-patellaire',
    phase_aigue: {
      drop: { min: 0, max: 6, note: 'Drop faible peut réduire les forces sur le genou' },
      amorti: 'Modéré — trop d\'amorti peut augmenter la flexion du genou',
      im: { min: 56, note: 'Chaussure plus minimaliste souvent bénéfique' },
      avoid: ['Amorti excessif (stack > 30mm)', 'Chaussures de contrôle de mouvement rigides'],
      recommend: ['Chaussure favorisant l\'attaque médio-pied', 'Drop faible (0-6mm)', 'Cadence augmentée (5-10%)'],
    },
    phase_retour: {
      drop: { min: 0, max: 6 },
      amorti: 'Faible à modéré',
      im: { min: 56 },
      recommend: ['Maintenir le drop faible', 'Renforcement quadriceps/fessiers en parallèle'],
    },
  },
  periostite_tibiale: {
    label: 'Périostite tibiale',
    phase_aigue: {
      drop: { min: 6, max: 10, note: 'Drop modéré pour réduire le stress tibial' },
      amorti: 'Élevé — absorber les impacts',
      im: { max: 52, note: 'Éviter la transition minimaliste pendant la phase aiguë' },
      avoid: ['Surface dure exclusive', 'Chaussures usées', 'Transition minimaliste en cours'],
      recommend: ['Renouveler les chaussures si > 600km', 'Varier les surfaces', 'Rotation de 2+ paires'],
    },
    phase_retour: {
      drop: { min: 4, max: 8 },
      amorti: 'Modéré à élevé',
      im: { max: 60 },
      recommend: ['Augmentation progressive du volume', 'Garder la rotation de chaussures'],
    },
  },
  fracture_stress: {
    label: 'Fracture de stress',
    phase_aigue: {
      drop: null,
      amorti: 'Ne pas courir — immobilisation selon localisation',
      im: null,
      avoid: ['Toute course pendant la consolidation', 'Port de charge'],
      recommend: ['Chaussure de marche avec bon amorti', 'Reprise très progressive selon protocole médical'],
    },
    phase_retour: {
      drop: { min: 6, max: 10 },
      amorti: 'Élevé',
      im: { max: 52, note: 'Chaussure protectrice pour la reprise' },
      recommend: ['Chaussure neuve avec bon amorti', 'Éviter la transition minimaliste pendant 6 mois', 'Surface souple privilégiée'],
    },
  },
  entorse_cheville: {
    label: 'Entorse de cheville',
    phase_aigue: {
      drop: { min: 4, max: 8 },
      amorti: 'Modéré',
      im: { max: 56, note: 'Stabilité prioritaire' },
      avoid: ['Chaussures trop souples latéralement', 'Trail technique sans rééducation proprioceptive'],
      recommend: ['Chaussure stable avec bon maintien', 'Contrefort postérieur rigide', 'Strapping si nécessaire'],
    },
    phase_retour: {
      drop: { min: 2, max: 8 },
      amorti: 'Modéré',
      im: { max: 64 },
      recommend: ['Rééducation proprioceptive avant reprise trail', 'Progressivité dans la technicité du terrain'],
    },
  },
  tendinopathie_rotulienne: {
    label: 'Tendinopathie rotulienne',
    phase_aigue: {
      drop: { min: 0, max: 6, note: 'Drop faible pour réduire les contraintes sur le tendon rotulien' },
      amorti: 'Modéré — éviter l\'excès d\'amorti qui augmente la flexion du genou',
      im: { min: 52 },
      avoid: ['Descentes prolongées', 'Amorti excessif'],
      recommend: ['Chaussure neutre', 'Renforcement excentrique', 'Adapter la cadence'],
    },
    phase_retour: {
      drop: { min: 0, max: 6 },
      amorti: 'Faible à modéré',
      im: { min: 52 },
      recommend: ['Maintenir le drop faible', 'Reprise progressive des descentes'],
    },
  },
}

/**
 * Retourne les conseils pour une pathologie donnée
 */
export function getShoeAdviceForInjury(injuryType, phase = 'phase_aigue') {
  return PATHOLOGY_SHOE_ADVICE[injuryType]?.[phase] || null
}

/**
 * Conseils de rotation basés sur la fréquence d'entraînement
 * Source : Malisoux et al. (2015) — rotation réduit le risque de blessure de 39%
 */
export function getRotationAdvice(runsPerWeek, shoes = []) {
  const activeShoes = shoes.filter(s => {
    const status = getWearStatus(s.kmRun || 0, s.type || 'route')
    return status.level !== 'replace'
  })

  const idealCount = runsPerWeek <= 3 ? 2 : runsPerWeek <= 5 ? 3 : 4

  const advice = {
    idealCount,
    currentCount: activeShoes.length,
    sufficient: activeShoes.length >= idealCount,
    benefits: [
      'Réduction du risque de blessure de 39% (Malisoux et al. 2015)',
      'Temps de récupération des mousses entre les sorties',
      'Adaptation musculaire à différentes contraintes mécaniques',
      'Meilleure durée de vie globale du parc de chaussures',
    ],
    suggestions: [],
  }

  // Analyser la diversité
  const drops = activeShoes.map(s => s.drop || 0)
  const types = new Set(activeShoes.map(s => s.type || 'route'))
  const indices = activeShoes.map(s => s.minimalistIndex || 50)

  if (activeShoes.length < idealCount) {
    advice.suggestions.push(`Ajouter ${idealCount - activeShoes.length} paire(s) pour une rotation optimale`)
  }

  if (drops.length >= 2 && Math.max(...drops) - Math.min(...drops) < 2) {
    advice.suggestions.push('Varier les drops entre les paires (ex: une paire 4mm et une 8mm)')
  }

  if (indices.length >= 2 && Math.max(...indices) - Math.min(...indices) < 10) {
    advice.suggestions.push('Diversifier les niveaux minimalistes pour solliciter différentes chaînes musculaires')
  }

  if (runsPerWeek >= 4 && !types.has('competition') && !types.has('minimaliste')) {
    advice.suggestions.push('Envisager une paire plus légère pour les séances de qualité')
  }

  return advice
}
