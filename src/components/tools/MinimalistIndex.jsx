import { useState, useRef, useEffect } from 'react'
import { Card } from '../ui/Card'

// ─── Base de données LCDC 2024-2025 ────────────────────────────────────────
// Source : La Clinique du Coureur — Indices minimalistes 50-100% (2024-2025)
// flexLong/flexTors : scores selon le barème Esculier et al. (2014)

const SHOE_DATABASE = [
  { brand: 'Inov8', model: 'Trailfly', year: 2024, type: 'Trail', weightMen: 282, weightWomen: 256, heelHeight: 30.1, drop: 6, stabilityCount: 1, flexLong: 2.0, flexTors: 1.5, index: 50 },
  { brand: 'NNormal', model: 'Kjerag Brut', year: 2025, type: 'Trail', weightMen: 230, weightWomen: 200, heelHeight: 28.5, drop: 6, stabilityCount: 1, flexLong: 1.5, flexTors: 1.0, index: 50 },
  { brand: 'On', model: 'Cloud 6', year: 2025, type: 'Route', weightMen: 267, weightWomen: 241, heelHeight: 28, drop: 8, stabilityCount: 1, flexLong: 2.0, flexTors: 1.5, index: 50 },
  { brand: 'On', model: 'Cloudventure Peak 3', year: 2024, type: 'Trail', weightMen: 240, weightWomen: 218, heelHeight: 21, drop: 4, stabilityCount: 0, flexLong: 0, flexTors: 0, index: 50 },
  { brand: 'Adidas', model: 'Adios 9', year: 2024, type: 'Route', weightMen: 177, weightWomen: 155, heelHeight: 27, drop: 7, stabilityCount: 0, flexLong: 1.5, flexTors: 0.5, index: 52 },
  { brand: 'Altra', model: 'Experience Flow 2', year: 2025, type: 'Route', weightMen: 231, weightWomen: 200, heelHeight: 32, drop: 4, stabilityCount: 1, flexLong: 2.0, flexTors: 2.0, index: 52 },
  { brand: 'Altra', model: 'Torin 8', year: 2025, type: 'Route', weightMen: 288, weightWomen: 238, heelHeight: 30, drop: 0, stabilityCount: 1, flexLong: 1.5, flexTors: 0.5, index: 52 },
  { brand: 'Brooks', model: 'Hyperion GTS 2', year: 2024, type: 'Route', weightMen: 216, weightWomen: 196, heelHeight: 30, drop: 8, stabilityCount: 2, flexLong: 2.0, flexTors: 2.0, index: 52 },
  { brand: 'Kiprun', model: 'Racewalk Comp 900', year: 2024, type: 'Route', weightMen: 221, weightWomen: null, heelHeight: 20, drop: 6, stabilityCount: 3, flexLong: 2.0, flexTors: 1.0, index: 52 },
  { brand: 'Lowa', model: 'ATR Citux', year: 2024, type: 'Trail', weightMen: 250, weightWomen: 210, heelHeight: 21.5, drop: 4, stabilityCount: 2, flexLong: 1.5, flexTors: 1.5, index: 52 },
  { brand: 'Norda', model: '005', year: 2025, type: 'Trail', weightMen: 214, weightWomen: 177, heelHeight: 28.5, drop: 7.5, stabilityCount: 1, flexLong: 1.5, flexTors: 1.5, index: 52 },
  { brand: 'Saucony', model: 'Kinvara 15', year: 2024, type: 'Route', weightMen: 200, weightWomen: 180, heelHeight: 28, drop: 4, stabilityCount: 2, flexLong: 1.5, flexTors: 1.5, index: 52 },
  { brand: 'New Balance', model: 'Rebel V4', year: 2024, type: 'Route', weightMen: 212, weightWomen: 184, heelHeight: 28, drop: 6.5, stabilityCount: 2, flexLong: 2.0, flexTors: 1.5, index: 54 },
  { brand: 'Topo Athletic', model: 'MT-5', year: 2024, type: 'Trail', weightMen: 264, weightWomen: 218, heelHeight: 28, drop: 5, stabilityCount: 1, flexLong: 2.0, flexTors: 1.5, index: 54 },
  { brand: 'Topo Athletic', model: 'Pursuit 2', year: 2024, type: 'Trail', weightMen: 293, weightWomen: 244, heelHeight: 28, drop: 0, stabilityCount: 1, flexLong: 1.5, flexTors: 1.0, index: 54 },
  { brand: 'Altra', model: 'Lone Peak 9+', year: 2025, type: 'Trail', weightMen: 309, weightWomen: 264, heelHeight: 23.3, drop: 0, stabilityCount: 1, flexLong: 1.5, flexTors: 0.5, index: 56 },
  { brand: 'Altra', model: 'Timp 5', year: 2024, type: 'Trail', weightMen: 269, weightWomen: 243, heelHeight: 28.6, drop: 0, stabilityCount: 1, flexLong: 1.5, flexTors: 0.5, index: 56 },
  { brand: 'Brooks', model: 'Hyperion 2', year: 2024, type: 'Route', weightMen: 195, weightWomen: 179, heelHeight: 29, drop: 8, stabilityCount: 1, flexLong: 2.0, flexTors: 2.0, index: 56 },
  { brand: 'Inov8', model: 'Trailtalon Speed', year: 2024, type: 'Trail', weightMen: 270, weightWomen: 261, heelHeight: 24, drop: 4, stabilityCount: 1, flexLong: 1.5, flexTors: 1.5, index: 56 },
  { brand: 'NNormal', model: 'Kjerag 02', year: 2025, type: 'Trail', weightMen: 230, weightWomen: 214, heelHeight: 26, drop: 6, stabilityCount: 1, flexLong: 2.0, flexTors: 2.0, index: 56 },
  { brand: 'Brooks', model: 'Catamount Agil', year: 2024, type: 'Trail', weightMen: 218, weightWomen: 197, heelHeight: 16, drop: 6, stabilityCount: 2, flexLong: 1.5, flexTors: 1.5, index: 60 },
  { brand: 'Millet', model: 'Intense Pro Boa', year: 2025, type: 'Trail', weightMen: 260, weightWomen: null, heelHeight: 22, drop: 4, stabilityCount: 0, flexLong: 1.5, flexTors: 1.5, index: 60 },
  { brand: 'Topo Athletic', model: 'Cyclone 3', year: 2025, type: 'Route', weightMen: 196, weightWomen: 156, heelHeight: 28, drop: 5, stabilityCount: 1, flexLong: 2.0, flexTors: 2.0, index: 60 },
  { brand: 'Topo Athletic', model: 'Magnifly 5', year: 2024, type: 'Route', weightMen: 247, weightWomen: 204, heelHeight: 25, drop: 0, stabilityCount: 1, flexLong: 1.5, flexTors: 1.0, index: 60 },
  { brand: 'Nike', model: 'Streakfly 2', year: 2025, type: 'Route', weightMen: 128, weightWomen: 115, heelHeight: 27, drop: 3.7, stabilityCount: 1, flexLong: 2.0, flexTors: 1.0, index: 62 },
  { brand: 'Altra', model: 'Lone Peak 8', year: 2024, type: 'Trail', weightMen: 303, weightWomen: 261, heelHeight: 25, drop: 0, stabilityCount: 1, flexLong: 2.0, flexTors: 2.0, index: 64 },
  { brand: 'Salomon', model: 'S/Lab Pulsar 3', year: 2024, type: 'Trail', weightMen: 205, weightWomen: 175, heelHeight: 24, drop: 6, stabilityCount: 1, flexLong: 2.0, flexTors: 2.0, index: 64 },
  { brand: 'Kiprun', model: 'KD900 Light', year: 2024, type: 'Route', weightMen: 196, weightWomen: 165, heelHeight: 25, drop: 6, stabilityCount: 0, flexLong: 2.0, flexTors: 1.5, index: 66 },
  { brand: 'Kiprun', model: 'Racewalk One', year: 2024, type: 'Route', weightMen: 221, weightWomen: null, heelHeight: 20, drop: 6, stabilityCount: 0, flexLong: 2.0, flexTors: 1.5, index: 66 },
  { brand: 'Scarpa', model: 'Spin Race', year: 2024, type: 'Trail', weightMen: 215, weightWomen: 195, heelHeight: 18, drop: 4, stabilityCount: 1, flexLong: 2.0, flexTors: 2.0, index: 68 },
  { brand: 'Topo Athletic', model: 'Fli-Lyte 6', year: 2025, type: 'Route', weightMen: 219, weightWomen: 181, heelHeight: 23, drop: 3, stabilityCount: 1, flexLong: 2.0, flexTors: 2.0, index: 68 },
  { brand: 'Altra', model: 'Escalante 4', year: 2024, type: 'Route', weightMen: 237, weightWomen: 212, heelHeight: 24, drop: 0, stabilityCount: 0, flexLong: 2.0, flexTors: 2.5, index: 74 },
  { brand: 'Altra', model: 'Escalante Racer 2', year: 2024, type: 'Route', weightMen: 224, weightWomen: 181, heelHeight: 22, drop: 0, stabilityCount: 0, flexLong: 2.0, flexTors: 2.5, index: 78 },
  { brand: 'Xero Shoes', model: 'HFS II', year: 2024, type: 'Route', weightMen: 244, weightWomen: 190, heelHeight: 13.1, drop: 1, stabilityCount: 0, flexLong: 2.5, flexTors: 2.5, index: 80 },
]

// ─── Barèmes Esculier, Dubois, Roy & Dionne (2014) ─────────────────────────

const WEIGHT_SCALE = [
  { score: 5, label: '< 125 g', min: 0, max: 124 },
  { score: 4, label: '125 – 174 g', min: 125, max: 174 },
  { score: 3, label: '175 – 224 g', min: 175, max: 224 },
  { score: 2, label: '225 – 274 g', min: 225, max: 274 },
  { score: 1, label: '275 – 324 g', min: 275, max: 324 },
  { score: 0, label: '325 g et +', min: 325, max: 9999 },
]

const HEEL_SCALE = [
  { score: 5, label: '< 8 mm', min: 0, max: 7.9 },
  { score: 4, label: '8 – 13 mm', min: 8, max: 13.9 },
  { score: 3, label: '14 – 19 mm', min: 14, max: 19.9 },
  { score: 2, label: '20 – 25 mm', min: 20, max: 25.9 },
  { score: 1, label: '26 – 31 mm', min: 26, max: 31.9 },
  { score: 0, label: '32 mm et +', min: 32, max: 9999 },
]

const DROP_SCALE = [
  { score: 5, label: '< 1 mm', min: 0, max: 0.9 },
  { score: 4, label: '1 – 3 mm', min: 1, max: 3.9 },
  { score: 3, label: '4 – 6 mm', min: 4, max: 6.9 },
  { score: 2, label: '7 – 9 mm', min: 7, max: 9.9 },
  { score: 1, label: '10 – 12 mm', min: 10, max: 12.9 },
  { score: 0, label: '13 mm et +', min: 13, max: 9999 },
]

const STABILITY_TECHS = [
  { id: 'dual_density', label: 'Semelle moyenne à densités multiples', description: 'Couleur ou densité différente sur la face médiale de la semelle intercalaire' },
  { id: 'medial_post', label: 'Renforts médiaux en plastique', description: 'Plastique rigide renforçant la portion médiale de la semelle' },
  { id: 'heel_cup', label: 'Coupole calcanéenne rigide', description: 'Contrefort arrière rigide enveloppant le talon' },
  { id: 'raised_insole', label: 'Semelle interne médiale surélevée', description: 'Semelle intérieure avec surélévation du bord médial (vs. plate)' },
  { id: 'medial_upper', label: 'Empeigne médiale renforcée', description: 'Matériaux rigides sur la face interne de la tige pour limiter la pronation' },
  { id: 'medial_flare', label: 'Élargissement médial des semelles', description: 'La semelle est plus large côté médial que le contour du pied' },
]

const FLEX_LONG_OPTIONS = [
  { score: 2.5, label: '> 360°', description: 'La chaussure peut se rouler sur elle-même' },
  { score: 2.0, label: '360°', description: 'L\'avant touche l\'arrière, déformation maximale' },
  { score: 1.5, label: '90° – 360°', description: 'L\'avant n\'atteint pas l\'arrière mais angle ≥ 90°' },
  { score: 1.0, label: '45° – 90°', description: 'Forte résistance, angle entre 45° et 90°' },
  { score: 0.5, label: '< 45°', description: 'Très forte résistance, angle maximal < 45°' },
  { score: 0, label: 'Rigide', description: 'Aucune déformation longitudinale significative' },
]

const FLEX_TORS_OPTIONS = [
  { score: 2.5, label: '360°', description: 'Torsion complète, semelle retournée' },
  { score: 2.0, label: '180° – 360°', description: 'Semelle orientée vers le haut' },
  { score: 1.5, label: '90° – 180°', description: 'Semelle orientée vers le côté' },
  { score: 1.0, label: '45° – 90°', description: 'Forte résistance à la torsion' },
  { score: 0.5, label: '< 45°', description: 'Très forte résistance, torsion minime' },
  { score: 0, label: 'Rigide', description: 'Aucune torsion significative' },
]

function scoreFromScale(value, scale) {
  if (value === '' || value === null || value === undefined) return null
  const num = Number(value)
  if (isNaN(num)) return null
  for (const tier of scale) {
    if (num >= tier.min && num <= tier.max) return tier.score
  }
  return 0
}

function getCategory(percent) {
  if (percent >= 91) return { label: 'Ultra-minimaliste', color: '#10b981', bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', description: 'Proche du pied nu. Sollicitation maximale des structures du pied.' }
  if (percent >= 71) return { label: 'Minimaliste', color: '#22c55e', bg: 'bg-green-50 border-green-200 text-green-800', description: 'Faible amorti et drop, bonne proprioception. Transition progressive recommandée.' }
  if (percent >= 51) return { label: 'Partiellement minimaliste', color: '#eab308', bg: 'bg-yellow-50 border-yellow-200 text-yellow-800', description: 'Compromis entre minimalisme et protection. Bon point de départ pour une transition.' }
  if (percent >= 26) return { label: 'Modéré', color: '#f97316', bg: 'bg-orange-50 border-orange-200 text-orange-800', description: 'Chaussure conventionnelle avec amorti et support modérés.' }
  return { label: 'Maximaliste', color: '#ef4444', bg: 'bg-red-50 border-red-200 text-red-800', description: 'Amorti maximal, technologies de contrôle. Haut niveau de protection mais faible proprioception.' }
}

// ─── Composant principal ────────────────────────────────────────────────────

export function MinimalistIndex() {
  const [shoeName, setShoeName] = useState('')
  const [weight, setWeight] = useState('')
  const [heelHeight, setHeelHeight] = useState('')
  const [forefootHeight, setForefootHeight] = useState('')
  const [stabilityTechs, setStabilityTechs] = useState([])
  const [flexLong, setFlexLong] = useState(null)
  const [flexTors, setFlexTors] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedShoe, setSelectedShoe] = useState(null)
  const [gender, setGender] = useState('men') // 'men' | 'women'
  const suggestionsRef = useRef(null)
  const inputRef = useRef(null)

  // Fermer les suggestions au clic extérieur
  useEffect(() => {
    const handleClick = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Filtrer les suggestions
  const suggestions = shoeName.length >= 1
    ? SHOE_DATABASE.filter(s => {
        const fullName = `${s.brand} ${s.model}`.toLowerCase()
        const terms = shoeName.toLowerCase().split(/\s+/)
        return terms.every(t => fullName.includes(t))
      })
    : SHOE_DATABASE

  // Mapping stabilityCount → techIds cochés (on coche les N premières)
  const STABILITY_IDS_ORDER = ['dual_density', 'medial_post', 'heel_cup', 'raised_insole', 'medial_upper', 'medial_flare']

  const applyShoe = (shoe) => {
    const w = gender === 'women' && shoe.weightWomen ? shoe.weightWomen : shoe.weightMen
    setShoeName(`${shoe.brand} ${shoe.model}`)
    setWeight(String(w))
    setHeelHeight(String(shoe.heelHeight))
    setForefootHeight(String(shoe.heelHeight - shoe.drop))
    setStabilityTechs(STABILITY_IDS_ORDER.slice(0, shoe.stabilityCount))
    setFlexLong(shoe.flexLong)
    setFlexTors(shoe.flexTors)
    setSelectedShoe(shoe)
    setShowSuggestions(false)
    setShowResult(false)
  }

  const toggleTech = (id) => {
    setStabilityTechs(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
    setSelectedShoe(null)
  }

  // Calculs
  const weightScore = scoreFromScale(weight, WEIGHT_SCALE)
  const heelScore = scoreFromScale(heelHeight, HEEL_SCALE)
  const drop = (heelHeight !== '' && forefootHeight !== '') ? Math.max(0, Number(heelHeight) - Number(forefootHeight)) : null
  const dropScore = drop !== null ? scoreFromScale(drop, DROP_SCALE) : null
  const stabilityScore = Math.max(0, 5 - stabilityTechs.length)
  const flexScore = (flexLong !== null && flexTors !== null) ? flexLong + flexTors : null

  const allFilled = weightScore !== null && heelScore !== null && dropScore !== null && flexScore !== null
  const totalRaw = allFilled ? weightScore + heelScore + dropScore + stabilityScore + flexScore : null
  const totalPercent = totalRaw !== null ? Math.round((totalRaw / 25) * 100) : null
  const category = totalPercent !== null ? getCategory(totalPercent) : null

  const handleCalculate = () => {
    if (allFilled) setShowResult(true)
  }

  const handleReset = () => {
    setShoeName('')
    setWeight('')
    setHeelHeight('')
    setForefootHeight('')
    setStabilityTechs([])
    setFlexLong(null)
    setFlexTors(null)
    setShowResult(false)
    setSelectedShoe(null)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Indice Minimaliste
        </h2>
        <p className="text-text-secondary text-sm mt-1">
          Calculez le score minimaliste d'une chaussure selon le bar&egrave;me Esculier et al. (2014).
        </p>
      </div>

      {/* Nom chaussure avec auto-complétion */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs font-medium text-text-secondary">Rechercher un modèle ou saisir manuellement</label>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => {
                setGender('men')
                if (selectedShoe) {
                  setWeight(String(selectedShoe.weightMen))
                }
              }}
              className={`px-2.5 py-1 text-[0.65rem] font-semibold rounded-md transition-all ${
                gender === 'men' ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Homme
            </button>
            <button
              onClick={() => {
                setGender('women')
                if (selectedShoe && selectedShoe.weightWomen) {
                  setWeight(String(selectedShoe.weightWomen))
                }
              }}
              className={`px-2.5 py-1 text-[0.65rem] font-semibold rounded-md transition-all ${
                gender === 'women' ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Femme
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={shoeName}
              onChange={(e) => {
                setShoeName(e.target.value)
                setShowSuggestions(true)
                setSelectedShoe(null)
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Ex : Altra Escalante, Brooks Hyperion, Nike..."
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-border rounded-xl text-sm text-text-primary
                focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
            />
          </div>

          {/* Dropdown suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-border rounded-xl shadow-lg shadow-black/10 overflow-hidden max-h-72 overflow-y-auto"
            >
              <div className="px-3 py-1.5 bg-slate-50 border-b border-border">
                <p className="text-[0.6rem] text-text-muted font-medium uppercase tracking-wider">
                  {suggestions.length} modèle{suggestions.length > 1 ? 's' : ''} — Source : La Clinique du Coureur 2024-2025
                </p>
              </div>
              {suggestions.map((shoe, i) => {
                const w = gender === 'women' && shoe.weightWomen ? shoe.weightWomen : shoe.weightMen
                return (
                  <button
                    key={i}
                    onClick={() => applyShoe(shoe)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-primary-50/50 transition-colors border-b border-slate-50 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {shoe.brand} <span className="font-semibold">{shoe.model}</span>
                      </p>
                      <p className="text-[0.65rem] text-text-muted mt-0.5">
                        {w}g · {shoe.heelHeight}mm · drop {shoe.drop}mm · {shoe.type}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      shoe.index >= 71 ? 'bg-green-50 text-green-700' :
                      shoe.index >= 51 ? 'bg-yellow-50 text-yellow-700' :
                      'bg-orange-50 text-orange-700'
                    }`}>
                      {shoe.index}%
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Badge chaussure sélectionnée */}
        {selectedShoe && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-primary-50/50 border border-primary-200/60 rounded-lg">
            <svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-primary-700">
              Données pré-remplies depuis la base LCDC — {selectedShoe.brand} {selectedShoe.model} ({selectedShoe.year})
              {gender === 'women' && !selectedShoe.weightWomen && ' · Poids femme non disponible, poids homme utilisé'}
            </span>
            <button
              onClick={handleReset}
              className="ml-auto text-primary-400 hover:text-primary-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </Card>

      {/* A) Poids */}
      <CriterionCard
        letter="A"
        title="Poids"
        description="Pesez la chaussure sur une balance (en grammes)."
        score={weightScore}
        maxScore={5}
      >
        <NumberInput
          label="Poids (g)"
          value={weight}
          onChange={setWeight}
          placeholder="grammes"
          min={0}
          max={600}
        />
        {weightScore !== null && (
          <ScoreBadge score={weightScore} max={5} scale={WEIGHT_SCALE} />
        )}
      </CriterionCard>

      {/* B) Épaisseur au talon */}
      <CriterionCard
        letter="B"
        title="Épaisseur au talon"
        description="Mesurez l'épaisseur sous le talon (semelles interne + intercalaire + externe) au milieu du talon."
        score={heelScore}
        maxScore={5}
      >
        <NumberInput
          label="Épaisseur talon (mm)"
          value={heelHeight}
          onChange={setHeelHeight}
          placeholder="mm"
          min={0}
          max={50}
          step="0.5"
        />
        {heelScore !== null && (
          <ScoreBadge score={heelScore} max={5} scale={HEEL_SCALE} />
        )}
      </CriterionCard>

      {/* C) Dénivelé (drop) */}
      <CriterionCard
        letter="C"
        title="Dénivelé (drop)"
        description="Mesurez l'épaisseur sous les têtes métatarsiennes. Le drop = épaisseur talon − épaisseur avant-pied."
        score={dropScore}
        maxScore={5}
      >
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Épaisseur avant-pied (mm)"
            value={forefootHeight}
            onChange={setForefootHeight}
            placeholder="mm"
            min={0}
            max={40}
            step="0.5"
          />
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Drop calculé</label>
            <div className="px-3 py-2.5 bg-slate-50 border border-border rounded-xl text-sm font-semibold text-text-primary">
              {drop !== null ? `${drop.toFixed(1)} mm` : '—'}
            </div>
          </div>
        </div>
        {dropScore !== null && (
          <ScoreBadge score={dropScore} max={5} scale={DROP_SCALE} />
        )}
      </CriterionCard>

      {/* D) Technologies de stabilité */}
      <CriterionCard
        letter="D"
        title="Technologies de stabilité"
        description="Cochez les technologies présentes sur la chaussure (0 = plus minimaliste)."
        score={stabilityScore}
        maxScore={5}
      >
        <div className="space-y-2">
          {STABILITY_TECHS.map(tech => (
            <label
              key={tech.id}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                stabilityTechs.includes(tech.id)
                  ? 'border-primary-300 bg-primary-50/50'
                  : 'border-border hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <input
                type="checkbox"
                checked={stabilityTechs.includes(tech.id)}
                onChange={() => toggleTech(tech.id)}
                className="mt-0.5 accent-primary-500"
              />
              <div>
                <p className="text-sm font-medium text-text-primary">{tech.label}</p>
                <p className="text-xs text-text-muted mt-0.5">{tech.description}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="mt-3">
          <p className="text-xs text-text-muted">
            {stabilityTechs.length} technologie{stabilityTechs.length !== 1 ? 's' : ''} → <strong className="text-text-primary">{stabilityScore}/5</strong>
          </p>
        </div>
      </CriterionCard>

      {/* E) Flexibilité */}
      <CriterionCard
        letter="E"
        title="Flexibilité"
        description="Évaluez la résistance de la chaussure à la déformation longitudinale et torsionnelle."
        score={flexScore}
        maxScore={5}
      >
        {/* Longitudinale */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-text-primary mb-2">Flexibilité longitudinale</p>
          <p className="text-xs text-text-muted mb-3">Pliez la chaussure en rapprochant l'avant et l'arrière. Quel angle maximal ?</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {FLEX_LONG_OPTIONS.map(opt => (
              <button
                key={opt.score}
                onClick={() => setFlexLong(opt.score)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  flexLong === opt.score
                    ? 'border-primary-400 bg-primary-50 shadow-sm'
                    : 'border-border hover:border-slate-300'
                }`}
              >
                <p className="text-sm font-semibold text-text-primary">{opt.label}</p>
                <p className="text-[0.65rem] text-text-muted mt-0.5">{opt.description}</p>
                <p className="text-xs font-bold text-primary-600 mt-1">{opt.score}/2.5</p>
              </button>
            ))}
          </div>
        </div>

        {/* Torsionnelle */}
        <div>
          <p className="text-sm font-semibold text-text-primary mb-2">Flexibilité torsionnelle</p>
          <p className="text-xs text-text-muted mb-3">Tordez la chaussure en appliquant une force de pronation à l'avant-pied. Quel angle maximal ?</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {FLEX_TORS_OPTIONS.map(opt => (
              <button
                key={opt.score}
                onClick={() => setFlexTors(opt.score)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  flexTors === opt.score
                    ? 'border-primary-400 bg-primary-50 shadow-sm'
                    : 'border-border hover:border-slate-300'
                }`}
              >
                <p className="text-sm font-semibold text-text-primary">{opt.label}</p>
                <p className="text-[0.65rem] text-text-muted mt-0.5">{opt.description}</p>
                <p className="text-xs font-bold text-primary-600 mt-1">{opt.score}/2.5</p>
              </button>
            ))}
          </div>
        </div>

        {flexScore !== null && (
          <div className="mt-3 text-xs text-text-muted">
            Longitudinale {flexLong}/2.5 + Torsionnelle {flexTors}/2.5 = <strong className="text-text-primary">{flexScore}/5</strong>
          </div>
        )}
      </CriterionCard>

      {/* Bouton calcul */}
      <div className="flex gap-3">
        <button
          onClick={handleCalculate}
          disabled={!allFilled}
          className={`flex-1 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
            allFilled
              ? 'bg-gradient-to-b from-primary-500 to-primary-600 text-white hover:from-primary-500 hover:to-primary-700 shadow-sm shadow-primary-600/25'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Calculer l'indice minimaliste
        </button>
        {showResult && (
          <button
            onClick={handleReset}
            className="px-5 py-3 text-sm font-medium text-text-secondary bg-surface-card border border-border rounded-xl
              hover:text-text-primary transition-all"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Résultat */}
      {showResult && totalPercent !== null && category && (
        <Card>
          <div className="space-y-5">
            {/* Score principal */}
            <div className="text-center">
              {shoeName && (
                <p className="text-sm text-text-secondary mb-1">{shoeName}</p>
              )}
              <div className="inline-flex items-baseline gap-1">
                <span className="text-5xl font-bold" style={{ color: category.color, fontFamily: 'var(--font-heading)' }}>
                  {totalPercent}
                </span>
                <span className="text-xl text-text-muted font-semibold">%</span>
              </div>
              <p className="text-sm text-text-muted mt-0.5">{totalRaw}/25 points</p>
              <div className={`inline-block mt-2 px-4 py-1.5 rounded-full border text-sm font-semibold ${category.bg}`}>
                {category.label}
              </div>
            </div>

            {/* Barre visuelle */}
            <div>
              <div className="h-4 rounded-full bg-slate-100 overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${totalPercent}%`, backgroundColor: category.color }}
                />
                {/* Marqueurs de catégorie */}
                {[25, 50, 70, 90].map(mark => (
                  <div
                    key={mark}
                    className="absolute top-0 bottom-0 w-px bg-slate-300"
                    style={{ left: `${mark}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[0.55rem] text-text-muted">
                <span>Maximaliste</span>
                <span>Modéré</span>
                <span>Partiel</span>
                <span>Minimaliste</span>
                <span>Ultra</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-text-secondary text-center">{category.description}</p>

            {/* Détail par critère */}
            <div className="grid grid-cols-5 gap-2">
              <ScoreDetail label="Poids" score={weightScore} max={5} />
              <ScoreDetail label="Épaisseur" score={heelScore} max={5} />
              <ScoreDetail label="Drop" score={dropScore} max={5} />
              <ScoreDetail label="Stabilité" score={stabilityScore} max={5} />
              <ScoreDetail label="Flexibilité" score={flexScore} max={5} />
            </div>

            {/* Référence */}
            <p className="text-[0.6rem] text-text-muted text-center leading-relaxed">
              Esculier JF, Dubois B, Roy JS, Dionne CE. (2014).
              A consensus definition and rating scale for minimalist shoes.
              <em> Journal of Foot and Ankle Research</em>, 7:42.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── Sous-composants ────────────────────────────────────────────────────────

function CriterionCard({ letter, title, description, score, maxScore, children }) {
  return (
    <Card>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold shrink-0" style={{ fontFamily: 'var(--font-heading)' }}>
          {letter}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
              {title}
            </h3>
            {score !== null && (
              <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                {score}/{maxScore}
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </Card>
  )
}

function NumberInput({ label, value, onChange, placeholder, min, max, step }) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step || '1'}
        className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm text-text-primary
          focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
      />
    </div>
  )
}

function ScoreBadge({ score, max, scale }) {
  const tier = scale.find(t => t.score === score)
  const percent = max > 0 ? (score / max) * 100 : 0
  const color = percent >= 80 ? '#10b981' : percent >= 60 ? '#22c55e' : percent >= 40 ? '#eab308' : percent >= 20 ? '#f97316' : '#ef4444'

  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs text-text-muted whitespace-nowrap">
        {tier?.label}
      </span>
    </div>
  )
}

function ScoreDetail({ label, score, max }) {
  const percent = max > 0 ? (score / max) * 100 : 0
  const color = percent >= 80 ? '#10b981' : percent >= 60 ? '#22c55e' : percent >= 40 ? '#eab308' : percent >= 20 ? '#f97316' : '#ef4444'

  return (
    <div className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
      <p className="text-[0.6rem] text-text-muted uppercase tracking-wider font-medium">{label}</p>
      <p className="text-lg font-bold mt-0.5" style={{ color }}>{score}</p>
      <p className="text-[0.6rem] text-text-muted">/{max}</p>
    </div>
  )
}
