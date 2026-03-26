// Types de séance
export const SESSION_TYPES = [
  { value: 'ef', label: 'Endurance fondamentale' },
  { value: 'seuil', label: 'Seuil' },
  { value: 'vma', label: 'VMA / Fractionné' },
  { value: 'sl', label: 'Sortie longue' },
  { value: 'competition', label: 'Compétition' },
  { value: 'recup', label: 'Récupération active' },
  { value: 'cotes', label: 'Côtes / Dénivelé' },
  { value: 'ppg', label: 'PPG / Renforcement' },
]

// Surfaces
export const SURFACES = [
  { value: 'route', label: 'Route' },
  { value: 'chemin', label: 'Chemin / Terre' },
  { value: 'trail', label: 'Trail' },
  { value: 'piste', label: 'Piste' },
  { value: 'tapis', label: 'Tapis' },
  { value: 'sable', label: 'Sable' },
  { value: 'mixte', label: 'Mixte' },
]

// Niveaux du coureur
export const RUNNER_LEVELS = [
  { value: 'debutant', label: 'Débutant (< 1 an)' },
  { value: 'intermediaire', label: 'Intermédiaire (1-3 ans)' },
  { value: 'confirme', label: 'Confirmé (3-7 ans)' },
  { value: 'elite', label: 'Élite (> 7 ans)' },
]

// Objectifs
export const OBJECTIVES = [
  { value: 'sante', label: 'Santé / Bien-être' },
  { value: '5k', label: '5 km' },
  { value: '10k', label: '10 km' },
  { value: 'semi', label: 'Semi-marathon' },
  { value: 'marathon', label: 'Marathon' },
  { value: 'trail_court', label: 'Trail court (< 40 km)' },
  { value: 'trail_long', label: 'Trail long (40-80 km)' },
  { value: 'ultra', label: 'Ultra-trail (> 80 km)' },
]

// Référentiels d'intensité
export const INTENSITY_REFERENCES = [
  { value: 'fcmax', label: '% FCmax' },
  { value: 'vma', label: '% VMA' },
  { value: 'vc', label: '% Vitesse critique' },
  { value: 'allure', label: 'Allure (min/km)' },
]

// Zones d'intensité avec coefficients
// Coefficients de charge pour chaque zone
export const INTENSITY_ZONES = [
  { zone: 1, label: 'Z1 — Récupération', coeff: 0.5, color: '#93c5fd',
    ranges: { fcmax: '50-60%', vma: '55-65%', vc: '< 75%' } },
  { zone: 2, label: 'Z2 — Endurance', coeff: 0.8, color: '#22c55e',
    ranges: { fcmax: '60-70%', vma: '65-75%', vc: '75-85%' } },
  { zone: 3, label: 'Z3 — Tempo', coeff: 1.0, color: '#eab308',
    ranges: { fcmax: '70-80%', vma: '75-85%', vc: '85-95%' } },
  { zone: 4, label: 'Z4 — Seuil', coeff: 1.3, color: '#f97316',
    ranges: { fcmax: '80-90%', vma: '85-95%', vc: '95-105%' } },
  { zone: 5, label: 'Z5 — VMA+', coeff: 1.5, color: '#ef4444',
    ranges: { fcmax: '90-100%', vma: '95-110%', vc: '> 105%' } },
]

// Types de blessures courantes en course à pied
export const INJURY_TYPES = [
  // Lombaire / Bassin
  { value: 'lombalgie', label: 'Lombalgie' },
  { value: 'douleur_sacro_iliaque', label: 'Douleur sacro-iliaque' },
  // Hanche
  { value: 'tendinopathie_psoas', label: 'Tendinopathie du psoas' },
  { value: 'tendinopathie_moyen_fessier', label: 'Tendinopathie du moyen fessier' },
  { value: 'douleur_hanche', label: 'Douleur de hanche (conflit / arthrose)' },
  // Cuisse
  { value: 'tendinopathie_ischio', label: 'Tendinopathie des ischio-jambiers' },
  { value: 'lesion_musculaire', label: 'Lésion musculaire (mollet, ischio, quad)' },
  // Genou
  { value: 'syndrome_it_proximal', label: 'Syndrome IT proximal (hanche)' },
  { value: 'syndrome_it', label: 'Syndrome IT distal (genou)' },
  { value: 'syndrome_rotulien', label: 'Syndrome fémoro-patellaire' },
  { value: 'tendinopathie_quadricipitale', label: 'Tendinopathie quadricipitale' },
  { value: 'tendinopathie_patellaire', label: 'Tendinopathie patellaire' },
  { value: 'plica_synoviale', label: 'Plica synoviale' },
  // Jambe
  { value: 'periostite', label: 'Périostite tibiale (MTSS)' },
  { value: 'syndrome_loge', label: 'Syndrome de loge chronique' },
  { value: 'fracture_stress_tibiale', label: 'Fracture de stress tibiale (postéro-médiale)' },
  { value: 'fracture_stress_tibiale_ant', label: 'Fracture de stress tibiale (antérieure)' },
  // Cheville
  { value: 'tendinopathie_achille', label: 'Tendinopathie d\'Achille (portion moyenne)' },
  { value: 'tendinopathie_achille_insertionnelle', label: 'Tendinopathie d\'Achille insertionnelle' },
  { value: 'tendinopathie_fibulaires', label: 'Tendinopathie des fibulaires' },
  { value: 'tendinopathie_tibial_post', label: 'Tendinopathie du tibial postérieur' },
  { value: 'entorse_cheville', label: 'Entorse de cheville' },
  { value: 'releveur_pied', label: 'Douleur du releveur du pied' },
  // Pied
  { value: 'aponevrosite', label: 'Aponévrosite plantaire (fasciapathie)' },
  { value: 'fracture_stress_metatarse', label: 'Fracture de stress métatarsienne' },
  { value: 'metatarsalgie', label: 'Métatarsalgie' },
  { value: 'coussinet_graisseux', label: 'Atrophie du coussinet graisseux' },
  { value: 'sesamoidopathie', label: 'Sésamoïdopathie' },
  { value: 'hallux_limitus', label: 'Hallux limitus / rigidus' },
  // Autre
  { value: 'autre', label: 'Autre' },
]

// Localisations anatomiques
export const BODY_LOCATIONS = [
  { value: 'lombaire', label: 'Lombaire' },
  { value: 'bassin', label: 'Bassin / Sacro-iliaque' },
  { value: 'hanche', label: 'Hanche' },
  { value: 'cuisse_ant', label: 'Cuisse antérieure' },
  { value: 'cuisse_post', label: 'Cuisse postérieure' },
  { value: 'genou', label: 'Genou' },
  { value: 'jambe_ant', label: 'Jambe antérieure' },
  { value: 'jambe_post', label: 'Jambe postérieure (mollet)' },
  { value: 'tibia', label: 'Tibia' },
  { value: 'cheville', label: 'Cheville' },
  { value: 'talon', label: 'Talon' },
  { value: 'medio_pied', label: 'Médio-pied' },
  { value: 'avant_pied', label: 'Avant-pied' },
  { value: 'orteil', label: 'Orteil' },
  { value: 'autre', label: 'Autre' },
]

// Facteurs contextuels
export const CONTEXTUAL_FACTORS = [
  { value: 'new_shoes', label: 'Nouvelles chaussures' },
  { value: 'surface_change', label: 'Changement de surface habituelle' },
  { value: 'return_from_break', label: 'Reprise après arrêt (> 7 jours)' },
  { value: 'sleep_deficit', label: 'Déficit de sommeil' },
  { value: 'illness', label: 'Maladie récente' },
  { value: 'travel', label: 'Voyage / Décalage horaire' },
  { value: 'altitude', label: 'Changement d\'altitude' },
  { value: 'heat', label: 'Chaleur inhabituelle' },
  { value: 'cold', label: 'Froid extrême' },
  { value: 'other', label: 'Autre' },
]

// Échelle RPE de Borg CR-10
export const RPE_SCALE = [
  { value: 1, label: '1 — Très très facile' },
  { value: 2, label: '2 — Facile' },
  { value: 3, label: '3 — Modéré' },
  { value: 4, label: '4 — Un peu difficile' },
  { value: 5, label: '5 — Difficile' },
  { value: 6, label: '6 — Assez difficile' },
  { value: 7, label: '7 — Très difficile' },
  { value: 8, label: '8 — Très très difficile' },
  { value: 9, label: '9 — Presque maximal' },
  { value: 10, label: '10 — Maximal' },
]

// Options nombre de sorties / semaine (planification)
export const RUNS_PER_WEEK_OPTIONS = [
  { value: 3, label: '3 sorties / semaine' },
  { value: 4, label: '4 sorties / semaine' },
  { value: 5, label: '5 sorties / semaine' },
  { value: 6, label: '6 sorties / semaine' },
]

// Couleurs par type de séance (planification)
export const PLAN_SESSION_COLORS = {
  ef: '#22c55e',
  sl: '#3b82f6',
  seuil: '#f97316',
  vma: '#ef4444',
  tempo: '#eab308',
  recup: '#93c5fd',
  cotes: '#8b5cf6',
  ppg: '#6b7280',
}
