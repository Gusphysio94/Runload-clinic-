import { useState } from 'react'
import { Card } from '../ui/Card'
import { VMA_TESTS, estimateVO2max, VMA_REFERENCE } from '../../utils/vmaTests'
import { formatPaceFromSpeed } from '../../utils/paceCalculator'

export function VMACalculator({ patient, onApplyToProfile }) {
  const [selectedTest, setSelectedTest] = useState(VMA_TESTS[0].id)
  const [inputs, setInputs] = useState({})
  const [result, setResult] = useState(null)

  const test = VMA_TESTS.find(t => t.id === selectedTest)

  const handleTestChange = (id) => {
    setSelectedTest(id)
    setInputs({})
    setResult(null)
  }

  const handleInput = (key, value) => {
    setInputs(prev => ({ ...prev, [key]: Number(value) }))
  }

  const handleCalculate = () => {
    const vma = test.calculate(inputs)
    if (vma && vma > 0) {
      setResult({
        vma: Number(vma.toFixed(1)),
        vo2max: Number(estimateVO2max(vma).toFixed(0)),
      })
    }
  }

  const handleApply = () => {
    if (result && onApplyToProfile) {
      onApplyToProfile(result.vma)
    }
  }

  const canCalculate = test.inputs.every(inp => {
    const val = inputs[inp.id]
    if (inp.type === 'select') return val !== undefined
    return val !== undefined && val > 0
  })

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
          Calculateur de VMA
        </h2>
        <p className="text-text-secondary text-sm mt-1">
          Estimation de la Vitesse Maximale Aérobie à partir de tests terrain
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche : sélection du test + inputs */}
        <div className="lg:col-span-2 space-y-5">
          {/* Sélection du test */}
          <Card title="Type de test">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VMA_TESTS.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTestChange(t.id)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                    selectedTest === t.id
                      ? 'border-primary-400/50 bg-primary-500/10 shadow-sm'
                      : 'border-border/60 bg-surface-card hover:border-border hover:bg-surface-dark/30'
                  }`}
                >
                  <p className={`text-sm font-semibold ${
                    selectedTest === t.id ? 'text-primary-500' : 'text-text-primary'
                  }`} style={{ fontFamily: 'var(--font-heading)' }}>
                    {t.label}
                  </p>
                  <p className="text-[0.7rem] text-text-muted mt-0.5 line-clamp-2">{t.description}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Formulaire de saisie */}
          <Card title="Données du test">
            <div className="space-y-4">
              {test.inputs.map(inp => (
                <div key={inp.id}>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    {inp.label}
                    {inp.unit && <span className="text-text-muted ml-1">({inp.unit})</span>}
                  </label>
                  {inp.type === 'select' ? (
                    <select
                      value={inputs[inp.id] || ''}
                      onChange={(e) => handleInput(inp.id, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm
                        focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                    >
                      <option value="">Sélectionner...</option>
                      {inp.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={inputs[inp.id] ?? ''}
                      onChange={(e) => handleInput(inp.id, e.target.value)}
                      min={inp.min}
                      max={inp.max}
                      step={inp.step}
                      placeholder={inp.min && inp.max ? `${inp.min} — ${inp.max}` : ''}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm
                        focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  )}
                </div>
              ))}

              {test.note && (
                <p className="text-[0.7rem] text-amber-600 bg-amber-50 border border-amber-200/50 rounded-lg px-3 py-2">
                  {test.note}
                </p>
              )}

              <button
                onClick={handleCalculate}
                disabled={!canCalculate}
                className="w-full px-5 py-2.5 bg-gradient-to-b from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl
                  hover:from-primary-500 hover:to-primary-700 shadow-sm shadow-primary-600/25
                  disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Calculer la VMA
              </button>
            </div>
          </Card>
        </div>

        {/* Colonne droite : résultat + référence */}
        <div className="space-y-5">
          {/* Résultat */}
          {result ? (
            <Card>
              <div className="text-center py-4">
                <p className="text-[0.65rem] font-semibold text-text-muted uppercase tracking-widest mb-2">
                  VMA estimée
                </p>
                <p className="text-5xl font-bold text-primary-500 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  {result.vma}
                </p>
                <p className="text-lg text-text-secondary font-medium mt-0.5">km/h</p>

                <div className="mt-5 pt-5 border-t border-border/60 flex justify-center gap-8">
                  <div>
                    <p className="text-[0.6rem] font-semibold text-text-muted uppercase tracking-wider">VO2max</p>
                    <p className="text-xl font-bold text-text-primary mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                      ~{result.vo2max}
                    </p>
                    <p className="text-[0.65rem] text-text-muted">ml/kg/min</p>
                  </div>
                  <div>
                    <p className="text-[0.6rem] font-semibold text-text-muted uppercase tracking-wider">Allure VMA</p>
                    <p className="text-xl font-bold text-text-primary mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                      {formatPaceFromSpeed(result.vma).replace('"/km', '')}
                    </p>
                    <p className="text-[0.65rem] text-text-muted">/km</p>
                  </div>
                </div>

                {/* Niveau estimé */}
                <div className="mt-5">
                  <VMALevelBadge vma={result.vma} gender={patient?.gender} />
                </div>

                {/* Appliquer au profil */}
                {patient && onApplyToProfile && (
                  <button
                    onClick={handleApply}
                    className="mt-5 w-full px-4 py-2.5 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-xl
                      hover:from-emerald-500 hover:to-emerald-700 shadow-sm shadow-emerald-600/25 transition-all duration-200"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Appliquer au profil de {patient.firstName || 'patient'}
                  </button>
                )}

                {patient?.vma && patient.vma !== result.vma && (
                  <p className="text-[0.65rem] text-text-muted mt-2">
                    VMA actuelle dans le profil : {patient.vma} km/h
                  </p>
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary-100/60 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                </div>
                <p className="text-sm text-text-muted">
                  Sélectionnez un test et renseignez les données pour estimer la VMA.
                </p>
              </div>
            </Card>
          )}

          {/* Table de référence */}
          <Card title="Valeurs de référence">
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[0.6rem] font-semibold text-text-muted uppercase tracking-wider">
                    <th className="text-left py-2 px-2">Niveau</th>
                    <th className="text-center py-2 px-2">H (km/h)</th>
                    <th className="text-center py-2 px-2">F (km/h)</th>
                    <th className="text-center py-2 px-2">VO2max</th>
                  </tr>
                </thead>
                <tbody>
                  {VMA_REFERENCE.map(ref => (
                    <tr key={ref.level} className="border-t border-border/40">
                      <td className="py-2 px-2 font-medium text-text-primary">{ref.level}</td>
                      <td className="py-2 px-2 text-center text-text-secondary">{ref.men}</td>
                      <td className="py-2 px-2 text-center text-text-secondary">{ref.women}</td>
                      <td className="py-2 px-2 text-center text-text-muted">{ref.vo2max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Références */}
      <div className="text-[0.6rem] text-text-muted space-y-0.5 pt-2">
        <p className="font-semibold uppercase tracking-wider mb-1">Références</p>
        <p>Cooper K.H. (1968). A means of assessing maximal oxygen intake. <em>JAMA</em>, 203(3), 201-204.</p>
        <p>Léger L., Boucher R. (1980). An indirect continuous running multistage field test. <em>Can J Appl Sport Sci</em>, 5(2), 77-84.</p>
        <p>Léger L., Gadoury C. (1989). Validity of the 20 m shuttle run test with 1 min stages. <em>Can J Sport Sci</em>, 14(1), 21-26.</p>
        <p>Buchheit M. (2008). The 30-15 Intermittent Fitness Test. <em>J Strength Cond Res</em>, 22(2), 365-374.</p>
        <p>Lacour J.R., Bourdin M. (2015). Factors affecting the energy cost of level running. <em>Eur J Appl Physiol</em>.</p>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function VMALevelBadge({ vma, gender }) {
  const isFemale = gender === 'F' || gender === 'female'
  let level, color

  if (isFemale) {
    if (vma >= 19) { level = 'Elite'; color = 'text-purple-600 bg-purple-50 border-purple-200/50' }
    else if (vma >= 17) { level = 'Expert'; color = 'text-blue-600 bg-blue-50 border-blue-200/50' }
    else if (vma >= 14) { level = 'Confirmé'; color = 'text-green-600 bg-green-50 border-green-200/50' }
    else if (vma >= 11) { level = 'Intermédiaire'; color = 'text-yellow-600 bg-yellow-50 border-yellow-200/50' }
    else { level = 'Débutant'; color = 'text-slate-600 bg-slate-50 border-slate-200/50' }
  } else {
    if (vma >= 22) { level = 'Elite'; color = 'text-purple-600 bg-purple-50 border-purple-200/50' }
    else if (vma >= 19) { level = 'Expert'; color = 'text-blue-600 bg-blue-50 border-blue-200/50' }
    else if (vma >= 16) { level = 'Confirmé'; color = 'text-green-600 bg-green-50 border-green-200/50' }
    else if (vma >= 13) { level = 'Intermédiaire'; color = 'text-yellow-600 bg-yellow-50 border-yellow-200/50' }
    else { level = 'Débutant'; color = 'text-slate-600 bg-slate-50 border-slate-200/50' }
  }

  return (
    <span className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${color}`}>
      Niveau : {level}
    </span>
  )
}
