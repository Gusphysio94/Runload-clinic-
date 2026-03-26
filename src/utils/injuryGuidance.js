/**
 * Guide de gestion de la charge d'entraînement en cas de blessure.
 *
 * Structure par pathologie selon le modèle LCDC (La Clinique Du Coureur, 2024) :
 *   E  — Entraînement : ajustements du stress mécanique
 *   D  — Douleur : modalités antalgiques
 *   Ex — Exercices : renforcement court et long terme
 *   B  — Biomécanique : modifications spécifiques à la course
 *   QSM — Quantification du Stress Mécanique
 *
 * Principes fondamentaux (LCDC 2024, Blaise Dubois et al.) :
 * - Distinction stress MÉCANIQUE (impact, vitesse, charge articulaire)
 *   vs stress PHYSIOLOGIQUE (cardio, métabolique) — on réduit le mécanique,
 *   on maintient le physiologique via cross-training
 * - Zone d'adaptation : entre le stress minimal (désadaptation) et maximal (mésadaptation)
 * - Le repos complet est DÉLÉTÈRE pour les tendinopathies (continuum de Cook)
 * - Reprise : minimum 4×/semaine pour créer des adaptations tissulaires
 * - Fractionner les séquences course/marche pour maximiser le stress physio
 *   en minimisant le stress mécanique
 * - Cadence 170-190 pas/min = facteur protecteur transversal
 *
 * Sources :
 * - LCDC 1.0 2024 FR — Fondamentaux des blessures en course à pied
 * - Cook JL, Purdam CR. (2009). Is tendon pathology a continuum?
 * - Dye SF. (2005). The pathophysiology of patellofemoral pain (envelope of function)
 * - Gabbett TJ. (2016). The training-injury prevention paradox (ACWR 0.8-1.3)
 * - Esculier JF, et al. (2020). Running reconditioning programs
 * - Warden SJ, et al. (2014). Stress fractures: pathophysiology and management
 */

/**
 * Base de données des pathologies avec stratégies de gestion.
 *
 * Pour chaque pathologie :
 * - volumeStrategy : 'maintain' | 'reduce' | 'cut'
 * - intensityStrategy : 'maintain' | 'reduce' | 'cut'
 * - impactStrategy : 'maintain' | 'reduce' | 'cut'
 * - painThreshold : seuil de douleur acceptable pendant l'effort (0-10)
 * - painCriteria : critère spécifique de monitoring (ex: raideur matinale)
 * - restDays : jours de repos minimum entre séances en phase aiguë
 * - terrainAdvice : recommandations terrain
 * - biomechanics : { cadence, minimalistIndex, impact } — ajustements biomécaniques
 * - painModalities : modalités antalgiques (D)
 * - returnPhases : phases de retour progressif
 * - strengthening : exercices (Ex)
 */
export const INJURY_DATABASE = {
  // ══════════════════════════════════════════════════════════════════════
  // LOMBAIRE / BASSIN
  // ══════════════════════════════════════════════════════════════════════

  lombalgie: {
    name: 'Lombalgie du coureur',
    category: 'articulaire',
    summary: 'Douleur lombaire liée aux contraintes répétitives. Le volume prolongé est plus problématique que l\'intensité. Réduire la durée des séances et renforcer le tronc.',
    volumeStrategy: 'reduce',
    intensityStrategy: 'maintain',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Pas d\'irradiation dans les membres inférieurs. Si irradiation sciatique → avis médical.',
    restDays: 1,
    terrainAdvice: 'Surface régulière, éviter les dévers. Terrain plat à modérément vallonné. Éviter le trail technique.',
    keyPrinciple: 'La lombalgie du coureur est souvent liée à un déficit de stabilité du tronc et de contrôle pelvien. Le renforcement est plus important que le repos.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      minimalistIndex: 'Diminuer l\'indice minimaliste (plus d\'amorti)',
    },
    painModalities: [
      'Composante mécanique : mouvements répétés, préférence directionnelle, centralisation de la douleur, correction posturale',
      'Taping neuro-proprioceptif (?)',
      'Ceinture lombaire, chaleur (?)',
    ],
    contraindications: [
      'Sorties très longues (fatigue musculaire du tronc → perte de contrôle postural)',
      'Course en terrain très technique/instable',
      'Repos complet prolongé (délétère)',
    ],
    alternatives: [
      'Natation (dos crawlé)',
      'Vélo (position adaptée)',
      'Marche nordique',
      'Elliptique',
    ],
    returnPhases: [
      {
        phase: 1,
        name: 'Adaptation',
        duration: '1-2 semaines',
        volume: 'Réduction à 60% du volume, séances plus courtes',
        intensity: 'Toutes zones si indolore, réduire la durée pas l\'intensité',
        criteria: 'Douleur ≤ 3/10, pas d\'irradiation dans les membres inférieurs',
        details: 'Renforcement du tronc quotidien (10 min). Réduire sauts, volume, intensité et vitesse/côtes.',
      },
      {
        phase: 2,
        name: 'Progression',
        duration: '3-4 semaines',
        volume: 'Allonger les séances de 5 min/semaine',
        intensity: 'Maintenue',
        criteria: 'Douleur ≤ 2/10, raideur matinale < 15 min',
        details: 'Focus : gainage dynamique, exercices de contrôle pelvien. Activation du transverse pendant la course.',
      },
      {
        phase: 3,
        name: 'Retour complet',
        duration: '2-3 semaines',
        volume: '100%',
        intensity: 'Toutes zones et terrains',
        criteria: 'Aucune douleur',
        details: 'Maintenir le renforcement du tronc 3×/semaine en prévention à long terme.',
      },
    ],
    strengthening: [
      'Gainage ventral (planche) — 3×30-60s',
      'Gainage latéral — 3×30s/côté',
      'Bird-dog (extension croisée) — 3×10/côté',
      'Dead bug — 3×10/côté',
      'Pont fessier — 3×15',
      'Pallof press (anti-rotation) — 3×10/côté',
      'Squat unipodal avec contrôle pelvien — 3×10',
    ],
    references: [
      'LCDC 1.0 2024 — Fiche Lombalgie du coureur',
      'Maselli F, et al. (2020). Low back pain in runners.',
    ],
  },

  douleur_sacro_iliaque: {
    name: 'Douleur sacro-iliaque',
    category: 'articulaire',
    summary: 'Douleur de l\'articulation sacro-iliaque. Réduire les contraintes d\'impact, les côtes et la vitesse.',
    volumeStrategy: 'reduce',
    intensityStrategy: 'reduce',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Douleur localisée à la SI, pas d\'irradiation distale.',
    restDays: 1,
    terrainAdvice: 'Terrain plat, éviter les côtes et dévers.',
    keyPrinciple: 'Stabilisation du bassin et du plancher pelvien essentielle. Réduire les sauts, côtes, intensité et vitesse.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      minimalistIndex: 'Diminuer l\'indice minimaliste',
      impact: 'Réduire le bruit d\'impact',
    },
    painModalities: [
      'Ceinture sacro-iliaque',
    ],
    contraindications: [
      'Sauts',
      'Côtes (montée et descente)',
      'Intensité et vitesse élevées',
    ],
    alternatives: [
      'Vélo (si indolore)',
      'Natation',
      'Elliptique',
    ],
    returnPhases: [
      {
        phase: 1, name: 'Réduction', duration: '1-2 semaines',
        volume: 'Réduction à 60%', intensity: 'Z1-Z2, plat',
        criteria: 'Douleur ≤ 3/10', details: 'Gainage et stabilisation du tronc et plancher pelvien.',
      },
      {
        phase: 2, name: 'Progression', duration: '3-4 semaines',
        volume: '+10%/sem', intensity: 'Réintroduction Z3',
        criteria: 'Douleur ≤ 2/10', details: 'Réintroduire progressivement les côtes douces.',
      },
      {
        phase: 3, name: 'Retour complet', duration: '2-3 semaines',
        volume: '100%', intensity: 'Toutes zones',
        criteria: 'Aucune douleur', details: 'Maintenir le renforcement.',
      },
    ],
    strengthening: [
      'Gainage et stabilisation du tronc — 3×30-60s',
      'Renforcement du plancher pelvien',
      'Pont fessier — 3×15',
      'Bird-dog — 3×10/côté',
    ],
    references: ['LCDC 1.0 2024 — Fiche Douleur sacro-iliaque', '2019-LeHuec, 2017-Petersen'],
  },

  // ══════════════════════════════════════════════════════════════════════
  // HANCHE
  // ══════════════════════════════════════════════════════════════════════

  tendinopathie_psoas: {
    name: 'Tendinopathie du psoas-iliaque',
    category: 'tendon_fascia',
    summary: 'Douleur antérieure de hanche liée à la surcharge du tendon du psoas. Réduire les côtes, l\'intensité et la vitesse.',
    volumeStrategy: 'reduce',
    intensityStrategy: 'reduce',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Douleur au pli de l\'aine en flexion active de hanche.',
    restDays: 1,
    terrainAdvice: 'Éviter les côtes (montées). Terrain plat.',
    keyPrinciple: 'Le tendon du psoas est sollicité en montée de côte et à haute vitesse. Réduire ces deux paramètres.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      minimalistIndex: 'Diminuer l\'indice minimaliste',
    },
    painModalities: [
      'Taping neuro-proprioceptif (?)',
    ],
    contraindications: [
      'Côtes (montées surtout)',
      'Intensité et vitesse élevées',
    ],
    alternatives: ['Vélo', 'Natation', 'Elliptique'],
    returnPhases: [
      {
        phase: 1, name: 'Réduction', duration: '1-2 semaines',
        volume: 'Réduction à 60%', intensity: 'Z1-Z2, plat',
        criteria: 'Douleur ≤ 3/10', details: 'Renforcement des fléchisseurs de hanche. Étirement si rétraction (PRN).',
      },
      {
        phase: 2, name: 'Progression', duration: '3-4 semaines',
        volume: '+10%/sem', intensity: 'Réintroduction Z3',
        criteria: 'Douleur ≤ 2/10', details: 'Réintroduire les côtes douces progressivement.',
      },
      {
        phase: 3, name: 'Retour complet', duration: '2-3 semaines',
        volume: '100%', intensity: 'Toutes zones',
        criteria: 'Aucune douleur', details: 'Maintenir le renforcement.',
      },
    ],
    strengthening: [
      'Renforcement des fléchisseurs de hanche — 3×12',
      'Étirement psoas-iliaque (PRN) — 3×30s',
    ],
    references: ['LCDC 1.0 2024 — Fiche Tend. psoas-iliaque', '2017-Rauseo, 2016-Heiderscheit'],
  },

  tendinopathie_moyen_fessier: {
    name: 'Tendinopathie du moyen fessier',
    category: 'tendon_fascia',
    summary: 'Douleur latérale de hanche. Réduire sauts, descentes et volume. Éviter la compression en adduction-rotation interne.',
    volumeStrategy: 'reduce',
    intensityStrategy: 'reduce',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Douleur sur le grand trochanter. Pas d\'aggravation > 24h post-course.',
    restDays: 1,
    terrainAdvice: 'Éviter les descentes de côtes et les pistes (tourner du côté opposé à la jambe atteinte).',
    keyPrinciple: 'Éviter la compression tendineuse en adduction-rotation interne de hanche. Renforcement des abducteurs progressif.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      minimalistIndex: 'Diminuer l\'indice minimaliste',
      impact: 'Réduire le bruit d\'impact',
    },
    painModalities: [
      'Taping neuro-proprioceptif (?)',
      'Auto-massage muscle fessier (balle)',
    ],
    contraindications: [
      'Sauts',
      'Descentes de côtes',
      'Piste (tourner du côté opposé à la jambe atteinte)',
      'Positions en adduction-rotation interne prolongées (croiser les jambes, dormir côté atteint)',
    ],
    alternatives: ['Vélo (si indolore)', 'Natation', 'Elliptique'],
    returnPhases: [
      {
        phase: 1, name: 'Réduction', duration: '1-2 semaines',
        volume: 'Réduction à 50-60%', intensity: 'Z1-Z2, plat',
        criteria: 'Douleur ≤ 3/10', details: 'Renforcement abducteurs hanche (éviter initialement la compression en add-RI).',
      },
      {
        phase: 2, name: 'Progression', duration: '3-6 semaines',
        volume: '+10%/sem', intensity: 'Réintroduction Z3',
        criteria: 'Douleur ≤ 2/10', details: 'Progression renforcement. Réintroduire le terrain varié.',
      },
      {
        phase: 3, name: 'Retour complet', duration: '2-4 semaines',
        volume: '100%', intensity: 'Toutes zones',
        criteria: 'Aucune douleur', details: 'Réintroduire les descentes et terrains techniques.',
      },
    ],
    strengthening: [
      'Renforcement des abducteurs de hanche (clam shells, side-lying hip abd.) — 3×15',
      'Pont fessier unilatéral — 3×12',
      'Step-down latéral contrôlé — 3×10',
      'Gainage latéral — 3×30s',
    ],
    references: ['LCDC 1.0 2024 — Fiche Tend. moyen fessier', '2018-Mellor, 2018-Ganderton, 2015-Grimaldi'],
  },

  douleur_hanche: {
    name: 'Douleur de hanche (autre)',
    category: 'articulaire',
    summary: 'Douleur de hanche non spécifiée. Évaluation médicale recommandée si persistante.',
    volumeStrategy: 'reduce',
    intensityStrategy: 'reduce',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Douleur ≤ 3/10 pendant et pas d\'aggravation 24h post.',
    restDays: 1,
    terrainAdvice: 'Terrain plat, régulier.',
    keyPrinciple: 'Approche prudente. Réduire les contraintes et consulter si pas d\'amélioration en 2-3 semaines.',
    biomechanics: { cadence: 'Augmenter la cadence' },
    painModalities: [],
    contraindications: ['Intensité et volume élevés si douloureux'],
    alternatives: ['Vélo', 'Natation', 'Elliptique'],
    returnPhases: [
      { phase: 1, name: 'Réduction', duration: '1-2 semaines', volume: '50-60%', intensity: 'Z1-Z2', criteria: 'Douleur ≤ 3/10', details: 'Évaluation médicale si pas d\'amélioration.' },
      { phase: 2, name: 'Progression', duration: '3-4 semaines', volume: '+10%/sem', intensity: 'Réintroduction progressive', criteria: 'Douleur ≤ 2/10', details: 'Renforcement global membre inférieur.' },
      { phase: 3, name: 'Retour complet', duration: '2-3 semaines', volume: '100%', intensity: 'Toutes zones', criteria: 'Aucune douleur', details: 'Maintenir le renforcement.' },
    ],
    strengthening: ['Renforcement global des fessiers et du tronc'],
    references: ['LCDC 1.0 2024'],
  },

  // ══════════════════════════════════════════════════════════════════════
  // CUISSE
  // ══════════════════════════════════════════════════════════════════════

  tendinopathie_ischio: {
    name: 'Tendinopathie des ischio-jambiers (proximale)',
    category: 'tendon_fascia',
    summary: 'Douleur sous la fesse (ischion). Réduire les montées de côtes et l\'intensité. Éviter la compression tendineuse en flexion de hanche.',
    volumeStrategy: 'reduce',
    intensityStrategy: 'reduce',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Douleur à l\'ischion, aggravée en position assise prolongée.',
    restDays: 1,
    terrainAdvice: 'Éviter les montées de côtes. Terrain plat.',
    keyPrinciple: 'Éviter la compression tendineuse en flexion de hanche. Position assise sur coussin en « beigne ». Le tendon a besoin de charge progressive (continuum de Cook).',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      minimalistIndex: 'Diminuer l\'indice minimaliste',
    },
    painModalities: [
      'Coussin en « beigne » pour position assise',
    ],
    contraindications: [
      'Sauts',
      'Montées de côtes (forte flexion hanche = compression tendineuse)',
      'Étirements agressifs en flexion de hanche (phase aiguë)',
    ],
    alternatives: ['Vélo (si indolore)', 'Natation', 'Elliptique'],
    returnPhases: [
      {
        phase: 1, name: 'Réduction + isométrique', duration: '1-2 semaines',
        volume: 'Réduction à 50%', intensity: 'Z1-Z2, plat',
        criteria: 'Douleur ≤ 3/10', details: 'Renforcement ischio-jambiers (éviter initialement la compression en flexion de hanche). Étirement PRN.',
      },
      {
        phase: 2, name: 'Charge progressive', duration: '3-6 semaines',
        volume: '+10%/sem', intensity: 'Réintroduction Z3',
        criteria: 'Douleur ≤ 2/10', details: 'Renforcement excentrique progressif (Nordic hamstring).',
      },
      {
        phase: 3, name: 'Retour complet', duration: '2-4 semaines',
        volume: '100%', intensity: 'Toutes zones, réintroduction côtes',
        criteria: 'Aucune douleur', details: 'Maintenir le renforcement. Réintroduire les montées progressivement.',
      },
    ],
    strengthening: [
      'Phase 1 : Isométrique ischio-jambiers (bridge isométrique — 5×30s)',
      'Phase 2 : Excentrique (Nordic hamstring progressif) — 3×6-8',
      'Phase 3 : Renforcement concentrique + excentrique en charge — 3×10',
      'Renforcement fessiers et tronc',
    ],
    references: ['LCDC 1.0 2024 — Fiche Tend. ischio-jambiers', '2021-Nasser(SR), 2018-Korakakis, 2016-Goom'],
  },

  lesion_musculaire: {
    name: 'Lésion musculaire (mollet, ischio, quadriceps)',
    category: 'musculaire',
    summary: 'Lésion des fibres musculaires. Arrêt initial puis reprise progressive. L\'intensité (vitesse élevée, sprint) est réintroduite en DERNIER car c\'est le mécanisme lésionnel principal.',
    volumeStrategy: 'cut',
    intensityStrategy: 'cut',
    impactStrategy: 'reduce',
    painThreshold: 1,
    painCriteria: 'Douleur 0/10 pendant et dans les 24h. Contraction excentrique indolore avant de progresser.',
    restDays: 3,
    terrainAdvice: 'Terrain plat, régulier. Éviter les côtes (contrainte excentrique musculaire).',
    keyPrinciple: 'La fibre musculaire cicatrise en 2-6 semaines selon le grade. La vitesse élevée (sprint, fractionné) est le facteur de récidive principal.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      minimalistIndex: 'Diminuer l\'indice minimaliste',
    },
    painModalities: [],
    contraindications: [
      'Sprint ou accélérations brutales (réintroduits en dernier)',
      'Étirements passifs agressifs en phase aiguë',
      'Course en côte (contrainte excentrique)',
      'Retour prématuré (risque de récidive très élevé)',
    ],
    alternatives: ['Vélo (si indolore)', 'Natation', 'Aquajogging', 'Marche rapide progressive'],
    returnPhases: [
      {
        phase: 1, name: 'Protection / Cicatrisation', duration: '3-14 jours (selon grade)',
        volume: 'Arrêt course', intensity: 'Aucune',
        criteria: 'Marche normale sans douleur, contraction isométrique indolore',
        details: 'Contraction isométrique douce dès que possible. Pas d\'étirement phase aiguë.',
      },
      {
        phase: 2, name: 'Reprise footing lent', duration: '1-3 semaines',
        volume: '30% du volume, séances de 15-20 min', intensity: 'Z1 uniquement',
        criteria: 'Douleur 0/10 pendant et 24h après, étirement passif indolore',
        details: 'Footing très lent. Aucune accélération. Si douleur → marche.',
      },
      {
        phase: 3, name: 'Augmentation progressive', duration: '2-4 semaines',
        volume: '50-80%', intensity: 'Z1-Z2 puis Z3 doux',
        criteria: 'Contraction excentrique indolore, pas de tiraillement',
        details: 'Augmenter le volume avant l\'intensité. Renforcement excentrique progressif.',
      },
      {
        phase: 4, name: 'Retour à l\'intensité', duration: '2-4 semaines',
        volume: '80-100%', intensity: 'Z4 puis Z5. Sprint en dernier.',
        criteria: 'Sprint sous-maximal indolore, aucune appréhension',
        details: 'Accélérations progressives : 60% → 70% → 80% → 90% → 100% de la vitesse max.',
      },
    ],
    strengthening: [
      'Phase 1 : Isométrique du muscle concerné (50% — 5×10s)',
      'Phase 2 : Concentrique léger (amplitude contrôlée) — 3×15',
      'Phase 3 : Excentrique progressif (Nordic hamstring si ischio) — 3×8-12',
      'Phase 4 : Renforcement haute vitesse, pliométrie',
    ],
    references: ['LCDC 1.0 2024', '2010-Heiderscheit, 2012-Mendiguchia'],
  },

  // ══════════════════════════════════════════════════════════════════════
  // GENOU
  // ══════════════════════════════════════════════════════════════════════

  syndrome_it_proximal: {
    name: 'Syndrome de la BIT (bandelette proximale)',
    category: 'tendon_fascia',
    summary: 'Douleur latérale de hanche/cuisse (BIT proximale). Réduire sauts, descentes, intensité. Renforcer les abducteurs de hanche.',
    volumeStrategy: 'reduce',
    intensityStrategy: 'reduce',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Douleur latérale cuisse/hanche ≤ 3/10 pendant.',
    restDays: 1,
    terrainAdvice: 'Éviter les descentes de côtes et la piste (tourner du côté opposé à la jambe atteinte).',
    keyPrinciple: 'Forme proximale : réduire l\'intensité et les descentes. Renforcement des abducteurs et gainage du tronc.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      minimalistIndex: 'Diminuer l\'indice minimaliste',
    },
    painModalities: [
      'Éviter de croiser les jambes',
      'Éviter la pression externe (ne pas dormir sur le côté atteint)',
    ],
    contraindications: [
      'Sauts', 'Descentes de côtes', 'Intensité élevée',
      'Piste (tourner du côté opposé à la jambe atteinte)',
    ],
    alternatives: ['Vélo', 'Natation', 'Elliptique'],
    returnPhases: [
      {
        phase: 1, name: 'Réduction', duration: '1-2 semaines',
        volume: 'Réduction à 60%', intensity: 'Z1-Z2, plat, pas de descente',
        criteria: 'Douleur ≤ 3/10', details: 'Renforcement abducteurs hanche, gainage du tronc, step-down contrôlé.',
      },
      {
        phase: 2, name: 'Progression', duration: '3-4 semaines',
        volume: '+10%/sem', intensity: 'Réintroduction Z3',
        criteria: 'Douleur ≤ 2/10', details: 'Réintroduire progressivement le terrain varié.',
      },
      {
        phase: 3, name: 'Retour complet', duration: '2-4 semaines',
        volume: '100%', intensity: 'Toutes zones',
        criteria: 'Aucune douleur', details: 'Réintroduire les descentes. Maintenir le renforcement.',
      },
    ],
    strengthening: [
      'Renforcement abducteurs hanche (clam shells, abduction latérale) — 3×15',
      'Gainage du tronc — 3×30-60s',
      'Step-down latéral (contrôle) — 3×10',
    ],
    references: ['LCDC 1.0 2024 — Fiche SBIT proximale', '2019-Decker, 2016-Heiderscheit'],
  },

  syndrome_it: {
    name: 'Syndrome de la BIT (bandelette distale)',
    category: 'tendon_fascia',
    summary: 'Douleur latérale du genou. L\'intensité est souvent conservable mais le VOLUME doit être réduit. Douleur 0/10 pendant et après obligatoire.',
    volumeStrategy: 'cut',
    intensityStrategy: 'maintain',
    impactStrategy: 'reduce',
    painThreshold: 0,
    painCriteria: 'Aucune douleur permise pendant et après la course (0/10). La douleur apparaît typiquement après un seuil de distance.',
    restDays: 1,
    terrainAdvice: 'Éviter les descentes, les dévers, les surfaces cambrées. Privilégier le plat. Surfaces variées et irrégulières. Éviter la piste.',
    keyPrinciple: 'La douleur apparaît après un seuil de distance. Raccourcir les séances en-deçà. L\'intensité est moins en cause que la répétition. Fractionner par des minutes de marche.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      minimalistIndex: 'Diminuer l\'indice minimaliste',
    },
    painModalities: [
      'Taping neuro-proprioceptif (?)',
      'Massage cuisse latérale (stick, foam roller)',
      'AINS (per os, crème, injection de cortisone) — si persistant',
    ],
    contraindications: [
      'Sorties longues au-delà du seuil de douleur',
      'Course en descente',
      'Course sur piste (virages répétés dans un sens)',
      'Dévers / routes cambrées',
      'Étirements agressifs de la BIT (controversé et souvent délétère)',
    ],
    alternatives: [
      'Vélo (si indolore — vérifier position)',
      'Natation', 'Elliptique (souvent bien toléré)',
      'Course fractionnée : séances courtes et intenses plutôt que longues',
    ],
    returnPhases: [
      {
        phase: 1, name: 'Réduction sous le seuil douloureux', duration: '1-2 semaines',
        volume: '50% ou sous le seuil de distance provoquant la douleur',
        intensity: 'Conservée (Z2-Z4 possible si indolore)',
        criteria: 'Douleur 0/10 pendant et après. Identifier le seuil km.',
        details: 'Si la douleur apparaît à 8 km, faire des séances de 5-6 km. Fractionner par des minutes de marche. Le fractionné court est souvent mieux toléré.',
      },
      {
        phase: 2, name: 'Augmentation progressive du volume', duration: '3-6 semaines',
        volume: '+10-15%/sem, fractionner en séances courtes',
        intensity: 'Maintenue (tempo et fractionné inclus)',
        criteria: 'Douleur 0/10, pas d\'aggravation post-course',
        details: 'Préférer 4×6 km plutôt que 2×12 km. Augmenter fréquence avant durée. Terrain plat. Surfaces variées/irrégulières.',
      },
      {
        phase: 3, name: 'Réintroduction sortie longue', duration: '3-4 semaines',
        volume: 'Ajouter progressivement du volume sur une sortie hebdo',
        intensity: 'Toutes zones',
        criteria: 'Douleur 0/10 sur les séances courtes',
        details: 'La sortie longue est le dernier élément réintroduit. +10-15 min/semaine.',
      },
      {
        phase: 4, name: 'Retour complet', duration: '2-4 semaines',
        volume: '100% incluant sorties longues',
        intensity: 'Toutes zones',
        criteria: 'Aucune douleur quelle que soit la distance',
        details: 'Réintroduire les descentes et terrains variés. Maintenir le renforcement.',
      },
    ],
    strengthening: [
      'Gainage et stabilisation du tronc et plancher pelvien',
    ],
    references: ['LCDC 1.0 2024 — Fiche SBIT distale', '2023(SR)-Nguyen, 2022-Hutchinson, 2005-Hoch'],
  },

  syndrome_rotulien: {
    name: 'Douleurs fémoro-patellaires (DFP)',
    category: 'articulaire',
    summary: 'Douleur antérieure du genou. Réduire volume et intensité. Enveloppe de fonction (Dye) : rester dans la zone de charge tolérable.',
    volumeStrategy: 'reduce',
    intensityStrategy: 'reduce',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Douleur ≤ 3/10 pendant, pas d\'aggravation 24h post-course.',
    restDays: 1,
    terrainAdvice: 'Éviter montées et descentes raides. Plat. Surface régulière. Éviter les escaliers en charge.',
    keyPrinciple: 'La contrainte fémoro-patellaire augmente avec la vitesse, la pente et la flexion du genou. Concept d\'enveloppe de fonction (Dye).',
    biomechanics: {
      cadence: 'Augmenter la cadence (+5-10% = réduit la flexion du genou et la contrainte patellaire)',
      minimalistIndex: 'Diminuer l\'indice minimaliste',
      impact: 'Réduire le bruit d\'impact',
    },
    painModalities: [
      'Taping neuro-proprioceptif (!) — fortement recommandé (Chang-SR, Leibbrandt-SR, Barton-SR)',
    ],
    contraindications: [
      'Course en descente raide (contrainte patellaire maximale)',
      'Montées prolongées (forte flexion genou)',
      'Squats profonds en charge lourde (phase aiguë)',
      'Course avec cadence basse (overstriding = plus de flexion)',
    ],
    alternatives: ['Vélo (résistance modérée, selle haute)', 'Natation (éviter la brasse)', 'Elliptique', 'Marche en terrain plat'],
    returnPhases: [
      {
        phase: 1, name: 'Réduction de charge', duration: '1-2 semaines',
        volume: '50-60%', intensity: 'Z1-Z2, terrain plat',
        criteria: 'Douleur ≤ 3/10',
        details: 'Augmenter la cadence de 5-10%. Éviter les pentes. Réduire squats, descentes, intensité et volume.',
      },
      {
        phase: 2, name: 'Progression contrôlée', duration: '3-6 semaines',
        volume: '+10%/sem', intensity: 'Réintroduction Z3, fractionné sur plat',
        criteria: 'Douleur ≤ 2/10, pas d\'aggravation 24h post',
        details: 'Fractionné court sur plat souvent bien toléré. Éviter intervalles en côte.',
      },
      {
        phase: 3, name: 'Retour terrain varié', duration: '3-4 semaines',
        volume: '80-100%', intensity: 'Toutes zones, pentes douces',
        criteria: 'Douleur < 2/10 même en terrain vallonné',
        details: 'Pentes douces d\'abord. Descentes en dernier.',
      },
      {
        phase: 4, name: 'Retour complet', duration: '2 semaines',
        volume: '100%', intensity: 'Toutes zones et terrains',
        criteria: 'Aucune douleur',
        details: 'Maintenir renforcement quadriceps et fessiers à long terme.',
      },
    ],
    strengthening: [
      'Renforcement quadriceps : squats isométriques mur (wall sit) — 3×45s',
      'Renforcement quadriceps, fessiers et tronc',
      'Contrôle membre inférieur (valgus dynamique) — PRN',
      'Step-up progressif — 3×12',
      'Pont fessier — 3×15',
    ],
    references: ['LCDC 1.0 2024 — Fiche DFP', '2020-Esculier, 2019-Willy(CPG), 2016-Crossley'],
  },

  tendinopathie_quadricipitale: {
    name: 'Tendinopathie quadricipitale',
    category: 'tendon_fascia',
    summary: 'Douleur au-dessus de la rotule. Réduire squats, descentes, intensité et volume. Éviter la compression en flexion > 70°.',
    volumeStrategy: 'reduce',
    intensityStrategy: 'reduce',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Douleur ≤ 3/10 pendant, raideur matinale < 30 min.',
    restDays: 1,
    terrainAdvice: 'Terrain plat, éviter les descentes.',
    keyPrinciple: 'Continuum de Cook. Éviter la compression tendineuse en flexion de genou > 70°. Charge isométrique puis progressive.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      minimalistIndex: 'Diminuer l\'indice minimaliste',
      impact: 'Réduire le bruit d\'impact',
    },
    painModalities: ['Taping neuro-proprioceptif (?)'],
    contraindications: ['Squats profonds', 'Descentes de côtes', 'Intensité et volume élevés'],
    alternatives: ['Vélo (résistance modérée)', 'Natation'],
    returnPhases: [
      { phase: 1, name: 'Réduction + isométrique', duration: '1-2 semaines', volume: '50%', intensity: 'Z1-Z2', criteria: 'Douleur ≤ 3/10', details: 'Renforcement du quadriceps (éviter compression en flexion > 70°).' },
      { phase: 2, name: 'Charge progressive', duration: '3-6 semaines', volume: '+10%/sem', intensity: 'Réintroduction Z3', criteria: 'Douleur ≤ 2/10', details: 'HSR quadriceps progressif.' },
      { phase: 3, name: 'Retour complet', duration: '2-4 semaines', volume: '100%', intensity: 'Toutes zones', criteria: 'Aucune douleur', details: 'Réintroduire les descentes.' },
    ],
    strengthening: [
      'Renforcement du quadriceps (éviter initialement flexion > 70°)',
    ],
    references: ['LCDC 1.0 2024 — Fiche Tend. quadricipitale', '2018-Cook, 2009-Cook'],
  },

  tendinopathie_patellaire: {
    name: 'Tendinopathie patellaire (rotulienne)',
    category: 'tendon_fascia',
    summary: 'Douleur sous la rotule (tendon rotulien). Réduire squats, descentes, intensité et volume. Isométrique pour effet analgésique.',
    volumeStrategy: 'reduce',
    intensityStrategy: 'reduce',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Douleur ≤ 3/10, raideur matinale < 30 min.',
    restDays: 1,
    terrainAdvice: 'Terrain plat, éviter les descentes (forte contrainte excentrique).',
    keyPrinciple: 'Continuum de Cook. L\'isométrique a un effet analgésique immédiat (Rio 2015). Repos complet délétère. Charge progressive obligatoire.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      minimalistIndex: 'Diminuer l\'indice minimaliste',
    },
    painModalities: [
      'Orthèse de type brassard (?)',
      'Taping (?)',
    ],
    contraindications: [
      'Repos complet prolongé', 'Course en descente',
      'Sauts et pliométrie en phase aiguë',
      'Squats profonds en charge lourde',
    ],
    alternatives: ['Vélo (résistance faible-modérée)', 'Natation', 'Renforcement isométrique quadriceps'],
    returnPhases: [
      {
        phase: 1, name: 'Réduction + isométrique', duration: '1-2 semaines',
        volume: '50%', intensity: 'Z1-Z2, plat',
        criteria: 'Douleur ≤ 3/10, raideur matinale < 30 min',
        details: 'Isométrique quadriceps (leg extension 45° — 5×45s). Effet analgésique immédiat.',
      },
      {
        phase: 2, name: 'Charge progressive (HSR)', duration: '3-6 semaines',
        volume: '+10%/sem', intensity: 'Réintroduction Z3',
        criteria: 'Douleur ≤ 2/10, pas d\'aggravation post',
        details: 'HSR quadriceps (leg press, squat lent 3s/3s — 4×6). Excentrique sur plan incliné 25°.',
      },
      {
        phase: 3, name: 'Retour aux activités dynamiques', duration: '4-6 semaines',
        volume: '80-100%', intensity: 'Toutes zones, réintroduction pentes douces',
        criteria: 'Douleur 0-1/10',
        details: 'Pliométrie progressive (sauts box → drop jump). Réintroduire les descentes graduellement.',
      },
    ],
    strengthening: [
      'Phase 1 : Isométrique quadriceps (leg extension 45° — 5×45s)',
      'Phase 2 : HSR (squat lent 3s conc./3s exc. — 4×6)',
      'Phase 2 : Excentrique sur plan décliné 25° — 3×15',
      'Phase 3 : Pliométrie progressive',
      'Renforcement ischio-jambiers et fessiers',
    ],
    references: ['LCDC 1.0 2024 — Fiche Tend. patellaire', '2021-Breda, 2015-Rio, 2015-Malliaras'],
  },

  plica_synoviale: {
    name: 'Plica synoviale',
    category: 'articulaire',
    summary: 'Douleur interne du genou liée à un pli synovial irrité. Réduire squats, côtes, intensité et volume.',
    volumeStrategy: 'reduce',
    intensityStrategy: 'reduce',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Douleur ≤ 3/10 pendant.',
    restDays: 1,
    terrainAdvice: 'Terrain plat.',
    keyPrinciple: 'Réduire les contraintes en flexion-extension répétée du genou. Isométrique d\'extension à angle non douloureux.',
    biomechanics: { cadence: 'Augmenter la cadence', minimalistIndex: 'Diminuer l\'indice minimaliste' },
    painModalities: ['Taping neuro-proprioceptif', 'AINS (per os, crème, injection cortisone)'],
    contraindications: ['Squats profonds', 'Côtes', 'Intensité et volume élevés'],
    alternatives: ['Vélo', 'Natation'],
    returnPhases: [
      { phase: 1, name: 'Réduction', duration: '1-2 semaines', volume: '50%', intensity: 'Z1-Z2', criteria: 'Douleur ≤ 3/10', details: 'Isométrique d\'extension genou (angle non douloureux).' },
      { phase: 2, name: 'Progression', duration: '3-4 semaines', volume: '+10%/sem', intensity: 'Réintroduction Z3', criteria: 'Douleur ≤ 2/10', details: 'Progression renforcement.' },
      { phase: 3, name: 'Retour complet', duration: '2-3 semaines', volume: '100%', intensity: 'Toutes zones', criteria: 'Aucune douleur', details: '' },
    ],
    strengthening: ['Isométrique extension genou (angle non douloureux) — progressif'],
    references: ['LCDC 1.0 2024 — Fiche Plica synoviale', '2012-Al Hadithy(R)'],
  },

  // ══════════════════════════════════════════════════════════════════════
  // JAMBE (TIBIA)
  // ══════════════════════════════════════════════════════════════════════

  periostite: {
    name: 'SSTM — Périostopathie tibiale (postéro-médiale)',
    category: 'os',
    summary: 'Pathologie de surcharge osseuse. Volume ET intensité doivent être réduits car c\'est la charge cumulative et l\'impact qui sont en cause.',
    volumeStrategy: 'cut',
    intensityStrategy: 'cut',
    impactStrategy: 'cut',
    painThreshold: 2,
    painCriteria: 'Douleur ≤ 2/10 pendant, pas de douleur à la palpation tibiale au repos.',
    restDays: 2,
    terrainAdvice: 'Éviter surfaces dures (bitume). Privilégier surfaces souples (terre, herbe, tapis). Éviter les descentes.',
    keyPrinciple: 'Le stress osseux est fonction du nombre d\'impacts ET de leur magnitude. Réduire les deux. Réduire sauts, montées de côtes, intensité et vitesse.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      minimalistIndex: 'Diminuer l\'indice minimaliste (?)',
    },
    painModalities: [
      'Taping circulaire',
      'Taping neuro-proprioceptif (?)',
    ],
    contraindications: [
      'Course sur surface dure',
      'Augmentation rapide du volume (> 10%/semaine)',
      'Séances de fractionné sur piste dure',
      'Course en descente prolongée',
      'Chaussures minimalistes (drop < 4mm) en phase aiguë',
    ],
    alternatives: ['Vélo (sans impact)', 'Natation / Aquajogging', 'Elliptique', 'Marche rapide (si douleur < 2/10)'],
    returnPhases: [
      {
        phase: 1, name: 'Décharge', duration: '1-3 semaines',
        volume: 'Arrêt course ou réduction à 30%', intensity: 'Z1-Z2 uniquement',
        criteria: 'Douleur au repos < 1/10, pas de douleur à la palpation tibiale',
        details: 'Cross-training sans impact. Renforcement mollets et tibial postérieur progressif.',
      },
      {
        phase: 2, name: 'Reprise progressive', duration: '2-4 semaines',
        volume: '50%, +10%/sem max', intensity: 'Z1-Z2, pas de fractionné',
        criteria: 'Douleur ≤ 2/10 pendant, pas d\'aggravation 24h post',
        details: 'Alterner course/marche si nécessaire. Surface souple. Augmenter la fréquence avant le volume par séance.',
      },
      {
        phase: 3, name: 'Retour progressif à l\'intensité', duration: '3-6 semaines',
        volume: '70-90% puis 100%', intensity: 'Réintroduction Z3 puis Z4',
        criteria: 'Douleur < 2/10, pas de douleur le lendemain',
        details: 'Réintroduire le fractionné par séances courtes (4-5×3\' au tempo). Pas de piste dure encore.',
      },
      {
        phase: 4, name: 'Retour complet', duration: '2-4 semaines',
        volume: '100%', intensity: 'Toutes zones, réintroduction VMA',
        criteria: 'Aucune douleur, aucune appréhension',
        details: 'Retour complet. Surveiller toute récidive. Maintenir le renforcement.',
      },
    ],
    strengthening: [
      'Élévations de mollets (concentrique + excentrique lent) — 3×15',
      'Renforcement tibial antérieur (marche sur talons) — 3×30s',
      'Squats sur une jambe (contrôle valgus) — 3×10',
      'Proprioception (plateau instable)',
      'Gainage / renforcement du tronc',
    ],
    references: ['LCDC 1.0 2024 — Fiche SSTM', '2013-Winters, 2013-Liem, 2012-Moen'],
  },

  syndrome_loge: {
    name: 'Syndrome de loge antérieure',
    category: 'musculaire',
    summary: 'Compression musculaire dans la loge antérieure de la jambe. Réduire descentes et volume. Fractionner par des minutes de marche.',
    volumeStrategy: 'reduce',
    intensityStrategy: 'maintain',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Douleur disparaît rapidement à l\'arrêt de la course.',
    restDays: 1,
    terrainAdvice: 'Éviter les descentes de côtes.',
    keyPrinciple: 'Promouvoir l\'adaptation vers un appui avant-pied. Chaussures à faible drop. Fractionner par de la marche.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      minimalistIndex: 'Diminuer l\'indice minimaliste',
      impact: 'Promouvoir appui avant-pied',
    },
    painModalities: ['Chaussures à faible drop'],
    contraindications: ['Descentes de côtes', 'Volume prolongé sans pause'],
    alternatives: ['Vélo', 'Natation'],
    returnPhases: [
      { phase: 1, name: 'Réduction', duration: '1-2 semaines', volume: '50%, fractionner par marche', intensity: 'Maintenue si indolore', criteria: 'Douleur ≤ 3/10', details: 'Corde à sauter (adaptation appui avant-pied).' },
      { phase: 2, name: 'Progression', duration: '3-4 semaines', volume: '+10%/sem', intensity: 'Toutes zones', criteria: 'Douleur ≤ 2/10', details: 'Allonger les segments de course.' },
      { phase: 3, name: 'Retour complet', duration: '2-3 semaines', volume: '100%', intensity: 'Toutes zones', criteria: 'Aucune douleur', details: '' },
    ],
    strengthening: [
      'Corde à sauter (adaptation appui avant-pied)',
    ],
    references: ['LCDC 1.0 2024 — Fiche Synd. loge antérieure', '2022-Vogels, 2015-Helmhout, 2012-Diebal'],
  },

  fracture_stress_tibiale: {
    name: 'Fracture de stress tibiale (postéro-médiale)',
    category: 'os',
    summary: 'Fracture de stress tibiale (crête postéro-médiale). Arrêt total puis reprise extrêmement progressive. Aucune douleur tolérée (0/10).',
    volumeStrategy: 'cut',
    intensityStrategy: 'cut',
    impactStrategy: 'cut',
    painThreshold: 0,
    painCriteria: 'Aucune douleur tolérée (0/10) pendant et dans les 48h post-course.',
    restDays: 7,
    terrainAdvice: 'Aucune course tant que consolidation non confirmée par imagerie. Reprise sur surface souple uniquement.',
    keyPrinciple: 'L\'os fracturé ne tolère aucun stress d\'impact. Repos obligatoire suivi d\'une reprise extrêmement progressive.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      minimalistIndex: 'Diminuer l\'indice minimaliste (?)',
    },
    painModalities: [
      'Taping circulaire',
      'Ultrasons (??) — 0.05 W/cm², 20 min, 4×/sem',
    ],
    contraindications: [
      'Toute activité avec impact avant consolidation radiologique',
      'Sauts, course, marche prolongée en phase aiguë',
      'Montées de côtes', 'Reprise sans avis médical',
    ],
    alternatives: ['Natation (sans battements si fracture du tibia)', 'Vélo (sans douleur)', 'Rameur', 'Renforcement haut du corps'],
    returnPhases: [
      {
        phase: 1, name: 'Repos / Décharge', duration: '4-8 semaines',
        volume: 'Arrêt total', intensity: 'Aucune',
        criteria: 'Absence de douleur à la palpation, imagerie favorable',
        details: 'Activités sans impact uniquement. Optimiser nutrition (calcium, vitamine D, protéines).',
      },
      {
        phase: 2, name: 'Marche progressive', duration: '2-4 semaines',
        volume: 'Marche 20-30 min, augmentation progressive', intensity: 'Marche uniquement',
        criteria: 'Marche 45 min sans douleur',
        details: 'Terrain plat, surface souple. 0/10 obligatoire.',
      },
      {
        phase: 3, name: 'Alternance marche-course', duration: '4-8 semaines',
        volume: '1\' course / 4\' marche → 5\'/1\' → continu', intensity: 'Z1 uniquement',
        criteria: '0/10 à tout moment et dans les 48h post',
        details: 'Commencer par 15-20 min total. Surface souple. Min 4×/semaine pour les adaptations osseuses.',
      },
      {
        phase: 4, name: 'Course continue progressive', duration: '6-12 semaines',
        volume: '+5-10%/semaine', intensity: 'Z1-Z2, puis Z3 après 4 sem sans douleur',
        criteria: '0/10, volume à 70% du pré-blessure',
        details: 'Patience. L\'os met 12-16 semaines à se remodeler complètement.',
      },
    ],
    strengthening: [
      'Renforcement jambe postérieure (aucune douleur permise)',
      'Étirement jambe postérieure (aucune douleur, PRN)',
      'Proprioception (plateau instable)',
      'Gainage du tronc',
    ],
    references: ['LCDC 1.0 2024 — Fiche Fracture stress tibiale postéro-médiale', '2021-Warden, 2014-Warden'],
  },

  fracture_stress_tibiale_ant: {
    name: 'Fracture de stress tibiale (antérieure)',
    category: 'os',
    summary: 'Fracture de stress tibiale antérieure — HAUT RISQUE. Même protocole que la postéro-médiale mais avec accent sur l\'adaptation vers un appui avant-pied.',
    volumeStrategy: 'cut',
    intensityStrategy: 'cut',
    impactStrategy: 'cut',
    painThreshold: 0,
    painCriteria: 'Aucune douleur tolérée (0/10).',
    restDays: 7,
    terrainAdvice: 'Comme fracture de stress postéro-médiale. Surface souple uniquement.',
    keyPrinciple: 'Fracture à haut risque de non-consolidation. Même protocole que postéro-médiale avec en plus la promotion de l\'appui avant-pied.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      minimalistIndex: 'Diminuer l\'indice minimaliste',
      impact: 'Réduire le bruit d\'impact, promouvoir appui avant-pied',
    },
    painModalities: [
      'Taping circulaire',
      'Ultrasons (??) — 0.05 W/cm², 20 min, 4×/sem',
    ],
    contraindications: ['Comme fracture postéro-médiale + descentes de côtes spécifiquement'],
    alternatives: ['Natation', 'Vélo', 'Rameur'],
    returnPhases: [
      { phase: 1, name: 'Repos total', duration: '4-8 semaines', volume: 'Arrêt total', intensity: 'Aucune', criteria: 'Imagerie favorable', details: 'Marcher sur les talons (?). Corde à sauter (adaptation appui avant-pied) quand indolore.' },
      { phase: 2, name: 'Marche progressive', duration: '2-4 semaines', volume: 'Marche 20-45 min', intensity: 'Marche uniquement', criteria: 'Marche 45 min 0/10', details: '' },
      { phase: 3, name: 'Alternance marche-course', duration: '4-8 semaines', volume: 'Progressif', intensity: 'Z1', criteria: '0/10', details: 'Surface souple. Min 4×/semaine.' },
      { phase: 4, name: 'Course continue', duration: '6-12 semaines', volume: '+5-10%/sem', intensity: 'Z1-Z2 puis Z3', criteria: '0/10', details: '' },
    ],
    strengthening: [
      'Marcher sur les talons (?) — aucune douleur permise',
      'Corde à sauter (adaptation appui avant-pied)',
    ],
    references: ['LCDC 1.0 2024 — Fiche Fracture stress tibiale antérieure', '2014-Warden'],
  },

  // ══════════════════════════════════════════════════════════════════════
  // CHEVILLE
  // ══════════════════════════════════════════════════════════════════════

  tendinopathie_achille: {
    name: 'Tendinopathie d\'Achille (corporéale)',
    category: 'tendon_fascia',
    summary: 'Le tendon s\'adapte à la charge progressive. Repos complet DÉLÉTÈRE. Réduire volume et impact mais maintenir une charge mécanique contrôlée.',
    volumeStrategy: 'reduce',
    intensityStrategy: 'reduce',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Douleur ≤ 3/10 pendant et dans les 24h. Raideur matinale < 30 min = marqueur clé. Si raideur > 30 min → trop de charge la veille.',
    restDays: 1,
    terrainAdvice: 'Éviter montées raides et surfaces instables. Plat, surface régulière.',
    keyPrinciple: 'Continuum de Cook & Purdam (2009). Le tendon a besoin de charge pour se remodeler. Le repos complet est DÉLÉTÈRE. Charge progressive obligatoire.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      minimalistIndex: 'Augmenter l\'indice minimaliste si pathologie aiguë (plus de drop/amorti). Diminuer si pathologie persistante (renforcement progressif).',
    },
    painModalities: [
      'Taping neuro-proprioceptif (?)',
      'Talonnette (↑ drop = ↓ contrainte tendineuse)',
      'Désensibilisation (massage jambe postérieure)',
    ],
    contraindications: [
      'Repos complet prolongé (> 1 semaine)',
      'Course en côte montante',
      'Étirements passifs agressifs du mollet (phase réactive)',
      'Chaussures minimalistes / pieds nus',
      'Fractionné avec départs explosifs',
    ],
    alternatives: ['Vélo', 'Natation', 'Rameur', 'Marche (si douleur ≤ 3/10)'],
    returnPhases: [
      {
        phase: 1, name: 'Réduction + isométrique', duration: '1-2 semaines',
        volume: '50%, séances courtes', intensity: 'Z1-Z2',
        criteria: 'Douleur ≤ 3/10, raideur matinale < 30 min',
        details: 'Isométriques mollet (5×45s, charge progressive). Raideur matinale = marqueur clé.',
      },
      {
        phase: 2, name: 'Reprise + excentrique', duration: '3-6 semaines',
        volume: '+10%/sem', intensity: 'Réintroduction Z3. Fractionné court toléré si indolore.',
        criteria: 'Raideur matinale < 10 min, douleur ≤ 2/10',
        details: 'Excentriques (protocole Alfredson : 3×15, 2×/jour). Fractionné court (200-400m) souvent mieux toléré que les sorties longues.',
      },
      {
        phase: 3, name: 'HSR (Heavy Slow Resistance)', duration: '4-8 semaines',
        volume: '80-100%', intensity: 'Toutes zones, réintroduction progressive des côtes',
        criteria: 'Pas de raideur matinale, douleur 0-1/10',
        details: 'HSR : mollets en charge lourde, lente et contrôlée. Réintroduire côtes progressivement.',
      },
      {
        phase: 4, name: 'Retour complet + pliométrie', duration: '2-4 semaines',
        volume: '100%', intensity: 'Toutes zones incluant VMA et sprints',
        criteria: 'Aucune douleur ni raideur',
        details: 'Pliométrie progressive (sauts, bonds) pour préparer le tendon aux charges d\'impact élevées.',
      },
    ],
    strengthening: [
      'Phase 1 : Isométriques mollet (élévation maintenue 45s) — 5 rép.',
      'Phase 2 : Excentriques Alfredson (genou tendu + fléchi) — 3×15, 2×/jour',
      'Phase 3 : HSR (élévation mollet bilatéral → unilatéral, charge croissante) — 4×6-8',
      'Phase 4 : Pliométrie progressive (drop jumps, sauts unipodaux)',
      'Renforcement fessiers et tronc (chaîne postérieure)',
    ],
    references: ['LCDC 1.0 2024 — Fiche Tendinopathie Achille corporéale', '2009-Cook, 1998-Alfredson, 2015-Beyer'],
  },

  tendinopathie_achille_insertionnelle: {
    name: 'Tendinopathie d\'Achille (insertionnelle)',
    category: 'tendon_fascia',
    summary: 'Douleur à l\'insertion du tendon d\'Achille sur le calcanéum. Même principes que corporéale mais éviter la compression en dorsiflexion. Talonnette prononcée (jusqu\'à 5 cm).',
    volumeStrategy: 'reduce',
    intensityStrategy: 'reduce',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Douleur ≤ 3/10, raideur matinale < 30 min.',
    restDays: 1,
    terrainAdvice: 'Plat, éviter montées raides.',
    keyPrinciple: 'Éviter la compression tendineuse en dorsiflexion. Talonnette prononcée pour décharger l\'insertion. Renforcement sans aller en dorsiflexion complète initialement.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
    },
    painModalities: [
      'Talonnette prononcée (jusqu\'à 5 cm)',
      'Réduire la friction (chaussette avec gel, beigne protecteur, coupole calcanéenne coupée)',
    ],
    contraindications: [
      'Repos complet prolongé',
      'Montées de côtes',
      'Étirements en dorsiflexion maximale (phase aiguë)',
    ],
    alternatives: ['Vélo', 'Natation', 'Rameur'],
    returnPhases: [
      { phase: 1, name: 'Réduction + isométrique', duration: '1-2 semaines', volume: '50%', intensity: 'Z1-Z2', criteria: 'Douleur ≤ 3/10, raideur matinale < 30 min', details: 'Renforcement jambe postérieure (éviter dorsiflexion complète initialement). Talonnette.' },
      { phase: 2, name: 'Charge progressive', duration: '3-6 semaines', volume: '+10%/sem', intensity: 'Réintroduction Z3', criteria: 'Raideur matinale < 10 min', details: 'Excentriques avec prudence (pas de dorsiflexion maximale). Étirement PRN.' },
      { phase: 3, name: 'HSR', duration: '4-8 semaines', volume: '80-100%', intensity: 'Toutes zones', criteria: '0-1/10', details: 'HSR progressif.' },
      { phase: 4, name: 'Retour complet', duration: '2-4 semaines', volume: '100%', intensity: 'Toutes zones', criteria: 'Aucune douleur', details: '' },
    ],
    strengthening: [
      'Renforcement jambe postérieure (éviter initialement la dorsiflexion)',
      'Étirement avec prudence (PRN)',
    ],
    references: ['LCDC 1.0 2024 — Fiche Tendinopathie Achille insertionnelle', '2021-Rabusin, 2016-Rio, 2016-Cook'],
  },

  tendinopathie_fibulaires: {
    name: 'Tendinopathie des fibulaires (péroniers)',
    category: 'tendon_fascia',
    summary: 'Douleur latérale de cheville. Réduire sauts, côtes, intensité. Éviter les stress compressifs en mouvement initialement.',
    volumeStrategy: 'reduce',
    intensityStrategy: 'reduce',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Douleur ≤ 3/10 pendant.',
    restDays: 1,
    terrainAdvice: 'Éviter la piste (tourner du côté opposé à la jambe atteinte).',
    keyPrinciple: 'Débuter en isométrique pour éviter les stress compressifs en mouvement, puis progresser vers le dynamique.',
    biomechanics: { cadence: 'Augmenter la cadence' },
    painModalities: ['Taping neuro-proprioceptif (?)', 'Orthèse plantaire (si persistant)'],
    contraindications: ['Sauts', 'Côtes', 'Piste (tourner du côté opposé à la jambe atteinte)'],
    alternatives: ['Vélo', 'Natation'],
    returnPhases: [
      { phase: 1, name: 'Réduction + isométrique', duration: '1-2 semaines', volume: '50%', intensity: 'Z1-Z2', criteria: 'Douleur ≤ 3/10', details: 'Renforcement MIP (?). Isométrique puis dynamique.' },
      { phase: 2, name: 'Progression', duration: '3-6 semaines', volume: '+10%/sem', intensity: 'Réintroduction Z3', criteria: 'Douleur ≤ 2/10', details: 'Renforcement jambe postérieure avec élastique tirant la cheville en latéral.' },
      { phase: 3, name: 'Retour complet', duration: '2-4 semaines', volume: '100%', intensity: 'Toutes zones', criteria: 'Aucune douleur', details: '' },
    ],
    strengthening: [
      'Renforcement MIP (?)',
      'Renforcement jambe postérieure (élastique tirant en latéral, isométrique → dynamique) — 3×12',
    ],
    references: ['LCDC 1.0 2024 — Fiche Tend. fibulaires'],
  },

  tendinopathie_tibial_post: {
    name: 'Tendinopathie du tibial postérieur',
    category: 'tendon_fascia',
    summary: 'Douleur médiale de cheville. Réduire sauts, côtes, intensité. Piste : tourner du même côté que la jambe atteinte.',
    volumeStrategy: 'reduce',
    intensityStrategy: 'reduce',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Douleur ≤ 3/10 pendant.',
    restDays: 1,
    terrainAdvice: 'Piste : tourner du même côté que la jambe atteinte.',
    keyPrinciple: 'Isométrique puis dynamique. Orthèse plantaire efficace si persistant ou grade > 1.',
    biomechanics: { cadence: 'Augmenter la cadence' },
    painModalities: ['Taping neuro-proprioceptif (?)', 'Orthèse plantaire (si persistant ou grade > 1)'],
    contraindications: ['Sauts', 'Côtes', 'Piste (tourner même côté que la jambe atteinte)'],
    alternatives: ['Vélo', 'Natation'],
    returnPhases: [
      { phase: 1, name: 'Réduction + isométrique', duration: '1-2 semaines', volume: '50%', intensity: 'Z1-Z2', criteria: 'Douleur ≤ 3/10', details: 'Renforcement MIP. Isométrique puis dynamique.' },
      { phase: 2, name: 'Progression', duration: '3-6 semaines', volume: '+10%/sem', intensity: 'Réintroduction Z3', criteria: 'Douleur ≤ 2/10', details: 'Renforcement jambe postérieure (élastique tirant en médial).' },
      { phase: 3, name: 'Retour complet', duration: '2-4 semaines', volume: '100%', intensity: 'Toutes zones', criteria: 'Aucune douleur', details: '' },
    ],
    strengthening: [
      'Renforcement MIP',
      'Renforcement jambe postérieure (élastique tirant en médial, isométrique → dynamique) — 3×12',
    ],
    references: ['LCDC 1.0 2024 — Fiche Tend. tibial postérieur'],
  },

  entorse_cheville: {
    name: 'Entorse de cheville',
    category: 'articulaire',
    summary: 'Lésion ligamentaire. Reprise progressive guidée par stabilité et proprioception. Le terrain instable est le DERNIER élément réintroduit.',
    volumeStrategy: 'cut',
    intensityStrategy: 'cut',
    impactStrategy: 'reduce',
    painThreshold: 2,
    painCriteria: 'Pas de douleur, pas d\'instabilité ressentie.',
    restDays: 2,
    terrainAdvice: 'Surface plane et régulière uniquement en début de reprise. Pas de trail, pas de terrain accidenté.',
    keyPrinciple: 'La proprioception est LA clé de la récupération et de la prévention des récidives. Le travail d\'équilibre commence immédiatement (POLICE : Protection, Optimal Loading, Ice, Compression, Elevation).',
    biomechanics: {
      cadence: 'Augmenter la cadence',
    },
    painModalities: [],
    contraindications: [
      'Course sur terrain instable/accidenté (phase initiale)',
      'Trail technique', 'Changements de direction rapides (phase aiguë)',
      'Reprise sans travail proprioceptif préalable',
    ],
    alternatives: ['Vélo (si indolore)', 'Natation (battements si toléré)', 'Elliptique'],
    returnPhases: [
      {
        phase: 1, name: 'Protection + proprioception précoce', duration: '1-2 semaines (selon grade)',
        volume: 'Arrêt course, marche avec/sans attelle', intensity: 'Aucune',
        criteria: 'Marche sans boiterie, amplitude récupérée à 80%',
        details: 'POLICE. Proprioception dès J2-3 (appui unipodal, yeux ouverts puis fermés).',
      },
      {
        phase: 2, name: 'Reprise course sur plat', duration: '2-4 semaines',
        volume: '30-50%, séances courtes', intensity: 'Z1-Z2, ligne droite uniquement',
        criteria: 'Pas de douleur, pas d\'instabilité',
        details: 'Terrain plat, surface stable. Bandage/chevillère recommandé. Proprioception (plateau instable, squats unipodaux).',
      },
      {
        phase: 3, name: 'Progression + agilité', duration: '3-4 semaines',
        volume: '60-80%', intensity: 'Toutes zones sur plat, courbes légères',
        criteria: 'Stabilité unipodal yeux fermés > 30s',
        details: 'Agilité progressive (slalom, changements direction lents → rapides). Terrain légèrement irrégulier.',
      },
      {
        phase: 4, name: 'Retour complet + trail', duration: '2-4 semaines',
        volume: '100%', intensity: 'Toutes zones et terrains',
        criteria: 'Aucune appréhension, stabilité complète',
        details: 'Trail et terrains techniques en dernier. Maintenir le travail proprioceptif en prévention.',
      },
    ],
    strengthening: [
      'Proprioception : unipodal (sol → mousse → plateau instable → yeux fermés) — 3×30s',
      'Renforcement péroniers (éversion contre élastique) — 3×15',
      'Renforcement mollets unilatéraux — 3×12',
      'Agilité (échelle de rythme, slalom) — progressif',
      'Squats unipodaux contrôlés — 3×10',
    ],
    references: ['LCDC 1.0 2024', '2016-Gribble, 2017-Doherty'],
  },

  releveur_pied: {
    name: 'Problème de releveur du pied',
    category: 'musculaire',
    summary: 'Douleur ou faiblesse du releveur du pied. Réduire le volume et les descentes. Promouvoir l\'appui avant-pied.',
    volumeStrategy: 'reduce',
    intensityStrategy: 'maintain',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Douleur ≤ 3/10.',
    restDays: 1,
    terrainAdvice: 'Éviter les descentes de côtes.',
    keyPrinciple: 'Chaussures à faible drop. Réduire friction (languette, laçage, chaussette). Promouvoir appui avant-pied.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      minimalistIndex: 'Diminuer l\'indice minimaliste',
      impact: 'Appui avant-pied',
    },
    painModalities: ['Chaussures à faible drop', 'Réduire friction (languette, laçage, chaussette)'],
    contraindications: ['Volume excessif', 'Descentes de côtes'],
    alternatives: ['Vélo', 'Natation'],
    returnPhases: [
      { phase: 1, name: 'Réduction', duration: '1-2 semaines', volume: '60%', intensity: 'Maintenue si indolore', criteria: 'Douleur ≤ 3/10', details: 'Marcher sur les talons (aucune douleur). Corde à sauter.' },
      { phase: 2, name: 'Progression', duration: '3-4 semaines', volume: '+10%/sem', intensity: 'Toutes zones', criteria: 'Douleur ≤ 2/10', details: '' },
      { phase: 3, name: 'Retour complet', duration: '2 semaines', volume: '100%', intensity: 'Toutes zones', criteria: 'Aucune douleur', details: '' },
    ],
    strengthening: ['Marcher sur les talons (aucune douleur permise)', 'Corde à sauter (adaptation appui avant-pied)'],
    references: ['LCDC 1.0 2024 — Fiche Releveur du pied', '2018-Chan, 2017-Vernillo'],
  },

  // ══════════════════════════════════════════════════════════════════════
  // PIED
  // ══════════════════════════════════════════════════════════════════════

  aponevrosite: {
    name: 'Fasciapathie plantaire',
    category: 'tendon_fascia',
    summary: 'Surcharge du fascia plantaire. Le volume total de pas est le facteur principal. Réduire le volume est prioritaire sur l\'intensité.',
    volumeStrategy: 'cut',
    intensityStrategy: 'reduce',
    impactStrategy: 'cut',
    painThreshold: 3,
    painCriteria: 'Douleur au premier pas du matin ≤ 3/10 = marqueur clé. Pas plus de raideur matinale.',
    restDays: 1,
    terrainAdvice: 'Surface régulière et souple. Éviter cailloux, trail technique, sable mou. Chaussures avec bon amorti. Piste : tourner du même côté que la jambe atteinte.',
    keyPrinciple: 'Le fascia est sollicité à chaque pas. C\'est le volume total de pas qui compte le plus. Réduire le nombre de pas (volume) est prioritaire sur la réduction d\'intensité.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      minimalistIndex: 'Augmenter l\'indice minimaliste si pathologie aiguë (plus d\'amorti/drop). Diminuer si pathologie persistante.',
    },
    painModalities: [
      'Taping neuro-proprioceptif (?)',
      'Orthèse plantaire (?)',
      'Orthèse de nuit (si raideur matinale marquée)',
      'Désensibilisation (massage du fascia plantaire)',
    ],
    contraindications: [
      'Course pieds nus ou chaussures minimalistes',
      'Sorties longues (> seuil de douleur)',
      'Marche prolongée pieds nus sur sol dur',
      'Surfaces irrégulières',
    ],
    alternatives: ['Vélo', 'Natation', 'Elliptique', 'Aquajogging'],
    returnPhases: [
      {
        phase: 1, name: 'Décharge relative', duration: '1-3 semaines',
        volume: '40-50%', intensity: 'Z1-Z2, séances < 30 min',
        criteria: 'Douleur au premier pas du matin ≤ 3/10',
        details: 'Rouler une balle sous le pied matin et soir. Orthèses plantaires si indiquées. Réduire sauts, côtes, intensité et vitesse.',
      },
      {
        phase: 2, name: 'Reprise progressive', duration: '3-6 semaines',
        volume: '+10%/sem', intensity: 'Réintroduction Z3, fractionné court toléré',
        criteria: 'Douleur premier pas < 2/10, douleur course ≤ 2/10',
        details: 'Renforcement intrinsèques du pied (towel curls, short foot). Stretching mollet (genou tendu + fléchi).',
      },
      {
        phase: 3, name: 'Volume normal', duration: '3-4 semaines',
        volume: '80-100%', intensity: 'Toutes zones',
        criteria: 'Pas de douleur matinale, 0/10 à la course',
        details: 'Réintroduire sorties longues et terrains variés progressivement.',
      },
    ],
    strengthening: [
      'Renforcement intrinsèques du pied (short foot, towel curls) — 3×15',
      'Élévations mollets (genou tendu + fléchi) — 3×15',
      'Stretching mollet + soléaire — 3×30s, 2×/jour',
      'Auto-massage fascia plantaire (balle de tennis) — 5 min/jour',
      'Renforcement orteils en flexion contre résistance',
    ],
    references: ['LCDC 1.0 2024 — Fiche Fasciapathie plantaire', '2015-Rathleff'],
  },

  fracture_stress_metatarse: {
    name: 'Fracture de stress métatarsienne',
    category: 'os',
    summary: 'Fracture de stress du métatarse. Aucune douleur tolérée (0/10). Arrêt puis reprise très progressive.',
    volumeStrategy: 'cut',
    intensityStrategy: 'cut',
    impactStrategy: 'cut',
    painThreshold: 0,
    painCriteria: 'Aucune douleur tolérée (0/10).',
    restDays: 7,
    terrainAdvice: 'Surface souple. Semelle rigide, léger drop.',
    keyPrinciple: 'Même approche que les fractures de stress tibiales. Protection, consolidation, puis reprise très progressive.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      minimalistIndex: 'Augmenter l\'indice minimaliste si aigu. Diminuer si persistant.',
    },
    painModalities: [
      'Taping circulaire',
      'Semelle rigide, léger drop (?)',
      'Botte avec effet berceau',
      'Ultrasons (??) — 0.05 W/cm², 20 min, 4×/sem',
    ],
    contraindications: ['Toute activité avec impact avant consolidation', 'Sauts', 'Montées de côtes'],
    alternatives: ['Natation', 'Vélo', 'Rameur'],
    returnPhases: [
      { phase: 1, name: 'Repos', duration: '4-6 semaines', volume: 'Arrêt total', intensity: 'Aucune', criteria: 'Imagerie favorable, 0/10 à la palpation', details: 'Renforcement MIP si aucune douleur.' },
      { phase: 2, name: 'Marche progressive', duration: '2-4 semaines', volume: 'Marche 20-45 min', intensity: 'Marche uniquement', criteria: '0/10', details: '' },
      { phase: 3, name: 'Alternance marche-course', duration: '4-8 semaines', volume: 'Progressif', intensity: 'Z1', criteria: '0/10', details: 'Min 4×/semaine.' },
      { phase: 4, name: 'Course continue', duration: '6-12 semaines', volume: '+5-10%/sem', intensity: 'Z1-Z2 puis Z3', criteria: '0/10', details: '' },
    ],
    strengthening: ['Renforcement muscles intrinsèques du pied (?) — aucune douleur permise'],
    references: ['LCDC 1.0 2024 — Fiche Fracture stress métatarsienne', '2021-Warden, 2017-Mandell'],
  },

  metatarsalgie: {
    name: 'Métatarsalgie',
    category: 'articulaire',
    summary: 'Douleur sous les métatarses. Réduire sauts, montées de côtes, intensité et vitesse. Support métatarsien et semelle absorbante.',
    volumeStrategy: 'reduce',
    intensityStrategy: 'reduce',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Douleur ≤ 3/10 pendant.',
    restDays: 1,
    terrainAdvice: 'Surface souple. Chaussures avec semelle rigide et absorbante.',
    keyPrinciple: 'Décharger la zone plantaire. Support métatarsien et orthèses plantaires.',
    biomechanics: { cadence: 'Augmenter la cadence' },
    painModalities: ['Support métatarsien (ARC, BRC)', 'Chaussures semelle rigide et absorbante', 'Orthèses plantaires'],
    contraindications: ['Sauts', 'Montées de côtes', 'Intensité et vitesse élevées'],
    alternatives: ['Vélo', 'Natation', 'Elliptique'],
    returnPhases: [
      { phase: 1, name: 'Réduction', duration: '1-2 semaines', volume: '50%', intensity: 'Z1-Z2', criteria: 'Douleur ≤ 3/10', details: 'Support métatarsien. Marcher pieds nus (?).' },
      { phase: 2, name: 'Progression', duration: '3-4 semaines', volume: '+10%/sem', intensity: 'Réintroduction progressive', criteria: 'Douleur ≤ 2/10', details: '' },
      { phase: 3, name: 'Retour complet', duration: '2-3 semaines', volume: '100%', intensity: 'Toutes zones', criteria: 'Aucune douleur', details: '' },
    ],
    strengthening: ['Marcher pieds nus (?)'],
    references: ['LCDC 1.0 2024 — Fiche Métatarsalgie', '2018(SR)-Arias-Martin'],
  },

  coussinet_graisseux: {
    name: 'Syndrome du coussinet graisseux (pied)',
    category: 'articulaire',
    summary: 'Douleur plantaire liée à l\'atrophie ou surcharge du coussinet graisseux. Réduire les descentes.',
    volumeStrategy: 'reduce',
    intensityStrategy: 'maintain',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Douleur ≤ 3/10 pendant.',
    restDays: 1,
    terrainAdvice: 'Éviter les descentes de côtes.',
    keyPrinciple: 'Protéger la zone plantaire par taping, coussin de gel ou orthèse.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      impact: 'Appui avant-pied (?)',
      minimalistIndex: 'Chaussures faible drop',
    },
    painModalities: ['Taping', 'Coussin de gel', 'Orthèse plantaire', 'Coupole calcanéenne'],
    contraindications: ['Descentes de côtes'],
    alternatives: ['Vélo', 'Natation'],
    returnPhases: [
      { phase: 1, name: 'Réduction', duration: '1-2 semaines', volume: '60%', intensity: 'Maintenue', criteria: 'Douleur ≤ 3/10', details: 'Taping, coussin, orthèse. Marcher pieds nus (?).' },
      { phase: 2, name: 'Progression', duration: '3-4 semaines', volume: '+10%/sem', intensity: 'Toutes zones', criteria: 'Douleur ≤ 2/10', details: 'Renforcement jambe postérieure (?).' },
      { phase: 3, name: 'Retour complet', duration: '2 semaines', volume: '100%', intensity: 'Toutes zones', criteria: 'Aucune douleur', details: '' },
    ],
    strengthening: ['Renforcement jambe postérieure (?)', 'Marcher pieds nus (?)'],
    references: ['LCDC 1.0 2024 — Fiche Coussinet graisseux', '2017-Latey, 2012-Dragoo'],
  },

  sesamoidopathie: {
    name: 'Sésamoïdopathie',
    category: 'os',
    summary: 'Douleur sous le 1er métatarse (sésamoïdes). Aucune douleur tolérée si fracture de stress exclue.',
    volumeStrategy: 'reduce',
    intensityStrategy: 'reduce',
    impactStrategy: 'reduce',
    painThreshold: 0,
    painCriteria: 'Douleur 0/10 si fracture de stress exclue.',
    restDays: 2,
    terrainAdvice: 'Chaussures semelle rigide et absorbante.',
    keyPrinciple: 'Exclure la fracture de stress. Décharger la zone par support métatarsien et orthèse.',
    biomechanics: { cadence: 'Augmenter la cadence' },
    painModalities: ['Support métatarsien (ARC, BRC)', 'Chaussures semelle rigide et absorbante', 'Orthèses plantaires (?)'],
    contraindications: ['Montées de côtes', 'Intensité élevée'],
    alternatives: ['Vélo', 'Natation'],
    returnPhases: [
      { phase: 1, name: 'Réduction', duration: '2-4 semaines', volume: '50%', intensity: 'Z1-Z2', criteria: '0/10', details: 'Support métatarsien. Exclure fracture de stress.' },
      { phase: 2, name: 'Progression', duration: '4-6 semaines', volume: '+10%/sem', intensity: 'Réintroduction progressive', criteria: '0/10', details: 'Si fracture exclue : renforcement MIP et jambe postérieure.' },
      { phase: 3, name: 'Retour complet', duration: '2-4 semaines', volume: '100%', intensity: 'Toutes zones', criteria: 'Aucune douleur', details: '' },
    ],
    strengthening: ['Renforcement MIP et jambe postérieure (si fracture de stress exclue)'],
    references: ['LCDC 1.0 2024 — Fiche Sésamoïdopathie'],
  },

  hallux_limitus: {
    name: 'Hallux limitus / rigidus',
    category: 'articulaire',
    summary: 'Limitation de mobilité du gros orteil. Réduire montées de côtes et intensité. Semelle rigide et absorbante.',
    volumeStrategy: 'maintain',
    intensityStrategy: 'reduce',
    impactStrategy: 'reduce',
    painThreshold: 3,
    painCriteria: 'Douleur ≤ 3/10.',
    restDays: 1,
    terrainAdvice: 'Chaussures semelle rigide et absorbante, effet berceau.',
    keyPrinciple: 'Mobilisation métatarso-phalangienne en flexion et extension. Semelle rigide pour limiter la dorsiflexion du gros orteil.',
    biomechanics: {
      cadence: 'Augmenter la cadence',
      minimalistIndex: 'Diminuer l\'indice minimaliste',
    },
    painModalities: ['Chaussures semelle rigide et absorbante', 'Effet berceau'],
    contraindications: ['Montées de côtes', 'Intensité élevée'],
    alternatives: ['Vélo', 'Natation'],
    returnPhases: [
      { phase: 1, name: 'Adaptation', duration: '1-2 semaines', volume: 'Maintenu', intensity: 'Réduire Z4-Z5', criteria: 'Douleur ≤ 3/10', details: 'Mobilisation MTP hallux. Semelle rigide.' },
      { phase: 2, name: 'Progression', duration: '3-4 semaines', volume: 'Maintenu', intensity: 'Réintroduction progressive', criteria: 'Douleur ≤ 2/10', details: '' },
      { phase: 3, name: 'Retour complet', duration: '2 semaines', volume: '100%', intensity: 'Toutes zones', criteria: 'Aucune douleur', details: '' },
    ],
    strengthening: ['Mobilité MTP hallux (flexion + extension) — automobilisations et thérapie manuelle'],
    references: ['LCDC 1.0 2024 — Fiche Hallux limitus/rigidus', '2015-Hamid, 2011-Perera'],
  },
}

// ─── Fonction de génération du plan de retour ─────────────────────────────

/**
 * Génère un plan de retour personnalisé basé sur la pathologie et les données du patient.
 */
export function generateReturnPlan(injuryKey, currentVolume, currentIntensityMax, painLevel, weeksSinceOnset) {
  const injury = INJURY_DATABASE[injuryKey]
  if (!injury) return null

  // Déterminer la phase actuelle selon la douleur et le délai
  let currentPhase = 0
  if (painLevel <= injury.painThreshold && weeksSinceOnset >= 1) currentPhase = 1
  if (painLevel <= 2 && weeksSinceOnset >= 3) currentPhase = 2
  if (painLevel <= 1 && weeksSinceOnset >= 6) currentPhase = 3

  // Ajuster les volumes selon le volume actuel du patient
  const phases = injury.returnPhases.map((phase, i) => {
    const volumeMultipliers = { cut: [0.3, 0.5, 0.8, 1.0], reduce: [0.5, 0.7, 0.9, 1.0], maintain: [0.9, 0.95, 1.0, 1.0] }
    const strat = injury.volumeStrategy
    const mults = volumeMultipliers[strat] || volumeMultipliers.reduce
    const mult = mults[Math.min(i, 3)]

    return {
      ...phase,
      suggestedVolumeKm: currentVolume ? Math.round(currentVolume * mult) : null,
      isCurrent: i === currentPhase,
    }
  })

  return {
    injury,
    currentPhase,
    phases,
    painLevel,
    weeksSinceOnset,
  }
}
