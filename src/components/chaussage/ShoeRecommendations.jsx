import { useState } from 'react'
import { Card } from '../ui/Card'
import { PATHOLOGY_SHOE_ADVICE } from '../../utils/shoeAdvisor'

const PHASES = [
  { id: 'phase_aigue', label: 'Phase aiguë' },
  { id: 'phase_retour', label: 'Phase de retour' },
]

export function ShoeRecommendations({ patient, shoes }) {
  const [selectedPathology, setSelectedPathology] = useState('')
  const [phase, setPhase] = useState('phase_aigue')

  // Détecter les blessures actives du patient
  const activeInjuries = (patient?.injuries || []).filter(i => i.status === 'ongoing' || i.status === 'chronic')
  const matchingInjuries = activeInjuries.filter(i => PATHOLOGY_SHOE_ADVICE[i.type])

  // Pré-sélectionner la première blessure active si match
  const effectivePathology = selectedPathology || (matchingInjuries[0]?.type || '')
  const advice = effectivePathology ? PATHOLOGY_SHOE_ADVICE[effectivePathology] : null
  const phaseAdvice = advice?.[phase] || null

  // Vérifier la compatibilité des chaussures actives
  const activeShoes = shoes.filter(s => !s.retired)
  const shoeWarnings = phaseAdvice && activeShoes.length > 0
    ? activeShoes.map(shoe => {
        const warnings = []
        if (phaseAdvice.drop && shoe.drop !== undefined && shoe.drop !== '') {
          if (Number(shoe.drop) < phaseAdvice.drop.min) {
            warnings.push(`Drop trop faible (${shoe.drop}mm < ${phaseAdvice.drop.min}mm recommandé)`)
          }
          if (Number(shoe.drop) > phaseAdvice.drop.max) {
            warnings.push(`Drop trop élevé (${shoe.drop}mm > ${phaseAdvice.drop.max}mm recommandé)`)
          }
        }
        if (phaseAdvice.im?.max && shoe.minimalistIndex && shoe.minimalistIndex > phaseAdvice.im.max) {
          warnings.push(`IM trop élevé (${shoe.minimalistIndex}% > ${phaseAdvice.im.max}% max recommandé)`)
        }
        if (phaseAdvice.im?.min && shoe.minimalistIndex && shoe.minimalistIndex < phaseAdvice.im.min) {
          warnings.push(`IM trop faible (${shoe.minimalistIndex}% < ${phaseAdvice.im.min}% min recommandé)`)
        }
        return { shoe, warnings, compatible: warnings.length === 0 }
      })
    : []

  return (
    <div className="space-y-5">
      {/* Sélection pathologie */}
      <Card title="Conseils chaussage par pathologie">
        <p className="text-xs text-text-muted mb-4">
          Recommandations de chaussage adaptées aux pathologies courantes du coureur,
          basées sur les données biomécaniques et les consensus cliniques.
        </p>

        {matchingInjuries.length > 0 && !selectedPathology && (
          <div className="mb-4 px-3 py-2 bg-primary-50 border border-primary-200/50 rounded-lg">
            <p className="text-xs text-primary-700">
              Blessure{matchingInjuries.length > 1 ? 's' : ''} active{matchingInjuries.length > 1 ? 's' : ''} détectée{matchingInjuries.length > 1 ? 's' : ''} dans le profil :
              {' '}<strong>{matchingInjuries.map(i => PATHOLOGY_SHOE_ADVICE[i.type]?.label).join(', ')}</strong>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(PATHOLOGY_SHOE_ADVICE).map(([key, val]) => {
            const isActive = effectivePathology === key
            const hasActiveInjury = matchingInjuries.some(i => i.type === key)
            return (
              <button
                key={key}
                onClick={() => setSelectedPathology(key)}
                className={`text-left px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                  isActive
                    ? 'border-primary-400/50 bg-primary-500/10 shadow-sm'
                    : 'border-border/60 bg-surface-card hover:border-border hover:bg-surface-dark/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <p className={`text-xs font-semibold ${isActive ? 'text-primary-500' : 'text-text-primary'}`}>
                    {val.label}
                  </p>
                  {hasActiveInjury && (
                    <span className="text-[0.55rem] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      Active
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Conseils pour la pathologie sélectionnée */}
      {advice && (
        <>
          {/* Toggle phase */}
          <div className="flex gap-1 bg-surface-dark/30 rounded-xl p-1 border border-border/40">
            {PHASES.map(p => (
              <button
                key={p.id}
                onClick={() => setPhase(p.id)}
                className={`flex-1 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  phase === p.id
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {phaseAdvice && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Recommandations */}
              <Card title="Recommandations">
                <div className="space-y-3">
                  {/* Drop */}
                  {phaseAdvice.drop && (
                    <div className="px-3 py-2.5 rounded-lg bg-surface-dark/20 border border-border/30">
                      <p className="text-[0.65rem] font-semibold text-text-muted uppercase tracking-wider">Drop recommandé</p>
                      <p className="text-sm font-bold text-text-primary mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                        {phaseAdvice.drop.min} — {phaseAdvice.drop.max} mm
                      </p>
                      {phaseAdvice.drop.note && (
                        <p className="text-[0.65rem] text-text-muted mt-1">{phaseAdvice.drop.note}</p>
                      )}
                    </div>
                  )}

                  {/* Amorti */}
                  {phaseAdvice.amorti && (
                    <div className="px-3 py-2.5 rounded-lg bg-surface-dark/20 border border-border/30">
                      <p className="text-[0.65rem] font-semibold text-text-muted uppercase tracking-wider">Amorti</p>
                      <p className="text-xs font-medium text-text-primary mt-0.5">{phaseAdvice.amorti}</p>
                    </div>
                  )}

                  {/* IM */}
                  {phaseAdvice.im && (
                    <div className="px-3 py-2.5 rounded-lg bg-surface-dark/20 border border-border/30">
                      <p className="text-[0.65rem] font-semibold text-text-muted uppercase tracking-wider">Indice minimaliste</p>
                      <p className="text-sm font-bold text-text-primary mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                        {phaseAdvice.im.min ? `≥ ${phaseAdvice.im.min}%` : ''}
                        {phaseAdvice.im.min && phaseAdvice.im.max ? ' · ' : ''}
                        {phaseAdvice.im.max ? `≤ ${phaseAdvice.im.max}%` : ''}
                      </p>
                      {phaseAdvice.im.note && (
                        <p className="text-[0.65rem] text-text-muted mt-1">{phaseAdvice.im.note}</p>
                      )}
                    </div>
                  )}

                  {/* À recommander */}
                  {phaseAdvice.recommend && phaseAdvice.recommend.length > 0 && (
                    <div>
                      <p className="text-[0.65rem] font-semibold text-emerald-600 uppercase tracking-wider mb-1.5">Recommandé</p>
                      <ul className="space-y-1">
                        {phaseAdvice.recommend.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                            <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>

              {/* À éviter */}
              <div className="space-y-5">
                {phaseAdvice.avoid && phaseAdvice.avoid.length > 0 && (
                  <Card title="À éviter">
                    <ul className="space-y-2">
                      {phaseAdvice.avoid.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                          <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Compatibilité chaussures actuelles */}
                {shoeWarnings.length > 0 && (
                  <Card title="Vos chaussures actuelles">
                    <div className="space-y-2">
                      {shoeWarnings.map(({ shoe, warnings, compatible }, i) => (
                        <div
                          key={i}
                          className={`px-3 py-2.5 rounded-lg border ${
                            compatible
                              ? 'border-emerald-200/50 bg-emerald-50/30'
                              : 'border-amber-200/50 bg-amber-50/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-xs ${compatible ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {compatible ? '✓' : '⚠'}
                            </span>
                            <p className="text-xs font-semibold text-text-primary">
                              {shoe.brand} {shoe.model}
                            </p>
                            {compatible && (
                              <span className="text-[0.6rem] text-emerald-600 font-medium ml-auto">Compatible</span>
                            )}
                          </div>
                          {warnings.length > 0 && (
                            <ul className="mt-1 space-y-0.5 ml-5">
                              {warnings.map((w, j) => (
                                <li key={j} className="text-[0.65rem] text-amber-700">{w}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* État initial */}
      {!advice && (
        <Card>
          <div className="text-center py-10">
            <div className="w-14 h-14 mx-auto rounded-xl bg-primary-100/60 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <p className="text-sm text-text-muted">
              Sélectionnez une pathologie pour afficher les recommandations de chaussage adaptées.
            </p>
          </div>
        </Card>
      )}

      {/* Références */}
      <div className="text-[0.6rem] text-text-muted space-y-0.5 pt-2">
        <p className="font-semibold uppercase tracking-wider mb-1">Références</p>
        <p>La Clinique du Coureur (2024). Guide de prescription de chaussures de course.</p>
        <p>Esculier JF. et al. (2015). Is combining gait retraining or an exercise programme with education better than education alone? <em>Br J Sports Med</em>.</p>
        <p>Nigg BM. et al. (2015). Running shoes and running injuries: mythbusting and a proposal for two new paradigms. <em>Br J Sports Med</em>, 49(20), 1290-1294.</p>
        <p>Davis IS. et al. (2017). Greater vertical impact loading in female runners with medically diagnosed injuries. <em>Br J Sports Med</em>, 50(14), 887-892.</p>
      </div>
    </div>
  )
}
