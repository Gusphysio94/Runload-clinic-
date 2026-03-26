import { useState, useMemo } from 'react'
import { Card } from '../ui/Card'
import { getTransitionAdvice, getMinimalistCategory } from '../../utils/shoeAdvisor'

export function ShoeTransition({ shoes, patient }) {
  const activeShoes = shoes.filter(s => !s.retired && s.minimalistIndex)

  // Calculer l'IM moyen actuel
  const avgIM = activeShoes.length > 0
    ? Math.round(activeShoes.reduce((sum, s) => sum + (s.minimalistIndex || 0), 0) / activeShoes.length)
    : null

  const [currentIM, setCurrentIM] = useState(String(avgIM || ''))
  const [targetIM, setTargetIM] = useState('')

  const advice = useMemo(() => {
    const cur = Number(currentIM) || 0
    const tar = Number(targetIM) || 0
    if (!cur || !tar || tar <= cur) return null
    return getTransitionAdvice(cur, tar, patient)
  }, [currentIM, targetIM, patient])

  const currentCat = Number(currentIM) ? getMinimalistCategory(Number(currentIM)) : null
  const targetCat = Number(targetIM) ? getMinimalistCategory(Number(targetIM)) : null

  return (
    <div className="space-y-5">
      <Card title="Planifier une transition minimaliste">
        <p className="text-xs text-text-muted mb-4">
          Évaluez le plan de transition entre votre chaussure actuelle et une chaussure cible.
          La règle LCDC recommande de ne pas augmenter l'indice minimaliste de plus de 10% à la fois.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* IM actuel */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Indice minimaliste actuel (%)
            </label>
            <input
              type="number"
              value={currentIM}
              onChange={e => setCurrentIM(e.target.value)}
              min={0} max={100}
              placeholder="Ex: 52"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm
                focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {currentCat && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentCat.color }} />
                <span className="text-[0.65rem] text-text-muted">{currentCat.label}</span>
              </div>
            )}
            {avgIM && (
              <p className="text-[0.6rem] text-primary-500 mt-1">
                Moyenne de vos chaussures actives : {avgIM}%
              </p>
            )}
          </div>

          {/* IM cible */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Indice minimaliste cible (%)
            </label>
            <input
              type="number"
              value={targetIM}
              onChange={e => setTargetIM(e.target.value)}
              min={0} max={100}
              placeholder="Ex: 74"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm
                focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {targetCat && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: targetCat.color }} />
                <span className="text-[0.65rem] text-text-muted">{targetCat.label}</span>
              </div>
            )}
          </div>
        </div>

        {/* Barre visuelle de transition */}
        {currentCat && targetCat && Number(targetIM) > Number(currentIM) && (
          <div className="mt-5">
            <div className="relative h-3 rounded-full bg-surface-dark/30 overflow-hidden">
              {/* Zone actuelle */}
              <div
                className="absolute left-0 top-0 h-full rounded-l-full"
                style={{ width: `${Number(currentIM)}%`, backgroundColor: currentCat.color, opacity: 0.5 }}
              />
              {/* Zone cible */}
              <div
                className="absolute top-0 h-full"
                style={{
                  left: `${Number(currentIM)}%`,
                  width: `${Number(targetIM) - Number(currentIM)}%`,
                  backgroundColor: targetCat.color,
                  opacity: 0.3,
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 6px)',
                }}
              />
              {/* Marqueur actuel */}
              <div
                className="absolute top-0 w-0.5 h-full bg-text-primary"
                style={{ left: `${Number(currentIM)}%` }}
              />
              {/* Marqueur cible */}
              <div
                className="absolute top-0 w-0.5 h-full"
                style={{ left: `${Number(targetIM)}%`, backgroundColor: targetCat.color }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[0.55rem] text-text-muted">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        )}
      </Card>

      {/* Résultat de la transition */}
      {advice && (
        <>
          <Card title={`Plan de transition — ${advice.totalWeeks} semaines`}>
            {advice.isHighRisk && (
              <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200/50 rounded-lg">
                <p className="text-xs text-amber-700 font-medium">
                  Pathologie active détectée — transition ralentie et supervision recommandée
                </p>
              </div>
            )}

            {/* Étapes */}
            <div className="space-y-2">
              {advice.steps.map((step, i) => {
                const cat = step.category
                return (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-dark/20 border border-border/30">
                    <div className="w-10 text-center shrink-0">
                      <p className="text-[0.6rem] text-text-muted uppercase tracking-wider">Sem.</p>
                      <p className="text-sm font-bold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                        {step.week}
                      </p>
                    </div>
                    <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-primary">
                        IM cible : {step.targetIM}%
                        <span className="text-text-muted font-normal ml-1">({cat.label})</span>
                      </p>
                      <p className="text-[0.65rem] text-text-muted">
                        Volume en nouvelle chaussure : ~{step.volumePercent}%
                      </p>
                    </div>
                    {i === advice.steps.length - 1 && (
                      <span className="text-[0.65rem] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                        Objectif
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Consignes */}
          <Card title="Consignes de transition">
            <ul className="space-y-2">
              {advice.guidelines.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                  <span className={`mt-0.5 shrink-0 ${g.includes('ATTENTION') ? 'text-amber-500' : 'text-primary-400'}`}>
                    {g.includes('ATTENTION') ? '⚠' : '•'}
                  </span>
                  <span className={g.includes('ATTENTION') ? 'text-amber-700 font-medium' : ''}>{g}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Références */}
          <div className="text-[0.6rem] text-text-muted space-y-0.5 pt-2">
            <p className="font-semibold uppercase tracking-wider mb-1">Références</p>
            <p>Esculier JF. et al. (2018). A consensus definition and rating scale for minimalist shoes. <em>J Foot Ankle Res</em>, 7:42.</p>
            <p>La Clinique du Coureur (2024). Recommandations de transition vers le minimalisme.</p>
            <p>Fuller JT. et al. (2017). The effect of footwear on running performance and injury risk. <em>J Sci Med Sport</em>, 20(8), 710-714.</p>
          </div>
        </>
      )}

      {/* État initial sans saisie */}
      {!advice && Number(currentIM) > 0 && Number(targetIM) > 0 && Number(targetIM) <= Number(currentIM) && (
        <Card>
          <div className="text-center py-8">
            <p className="text-sm text-text-muted">
              L'indice cible doit être supérieur à l'indice actuel pour planifier une transition vers le minimalisme.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
