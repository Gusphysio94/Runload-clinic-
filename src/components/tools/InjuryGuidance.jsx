import { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { FormField, Input, Select, Slider } from '../ui/FormField'
import { INJURY_DATABASE, generateReturnPlan } from '../../utils/injuryGuidance'

const INJURY_OPTIONS = Object.entries(INJURY_DATABASE).map(([key, val]) => ({
  value: key,
  label: val.name,
}))

const STRATEGY_LABELS = {
  cut: { label: 'Couper', color: 'bg-red-100 text-red-800', icon: '🔴' },
  reduce: { label: 'Réduire', color: 'bg-amber-100 text-amber-800', icon: '🟡' },
  maintain: { label: 'Maintenir', color: 'bg-green-100 text-green-800', icon: '🟢' },
}

export function InjuryGuidance({ patient }) {
  const [selectedInjury, setSelectedInjury] = useState('')
  const [painLevel, setPainLevel] = useState(4)
  const [weeksSince, setWeeksSince] = useState('')
  const [currentVolume, setCurrentVolume] = useState(patient?.weeklyVolumeRef || '')
  const [plan, setPlan] = useState(null)

  const injury = selectedInjury ? INJURY_DATABASE[selectedInjury] : null

  const handleGenerate = () => {
    if (!selectedInjury) return
    const result = generateReturnPlan(
      selectedInjury,
      Number(currentVolume) || 0,
      null,
      painLevel,
      Number(weeksSince) || 0,
    )
    setPlan(result)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Je suis bless&eacute;</h2>
        <p className="text-text-secondary text-sm mt-1">
          Consultez les recommandations de gestion de la charge adapt&eacute;es &agrave; chaque pathologie du coureur.
        </p>
      </div>

      {/* Sélection pathologie */}
      <Card title="Quelle est la blessure ?">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Pathologie" required>
            <Select
              options={INJURY_OPTIONS}
              value={selectedInjury}
              onChange={e => { setSelectedInjury(e.target.value); setPlan(null) }}
              placeholder="S&eacute;lectionner la pathologie..."
            />
          </FormField>
          <FormField label="Depuis combien de semaines ?">
            <Input
              type="number"
              value={weeksSince}
              onChange={e => setWeeksSince(e.target.value)}
              placeholder="semaines"
            />
          </FormField>
          <FormField label="Douleur actuelle (0-10)">
            <Slider
              value={painLevel}
              onChange={setPainLevel}
              min={0}
              max={10}
              labels={['Aucune', 'Maximale']}
            />
          </FormField>
          <FormField label="Volume hebdo actuel ou habituel (km)">
            <Input
              type="number"
              value={currentVolume}
              onChange={e => setCurrentVolume(e.target.value)}
              placeholder="km/semaine"
            />
          </FormField>
        </div>
      </Card>

      {/* Aperçu rapide de la pathologie */}
      {injury && !plan && (
        <InjuryQuickView injury={injury} />
      )}

      {/* Bouton */}
      {selectedInjury && (
        <div className="flex justify-center">
          <Button size="lg" onClick={handleGenerate}>
            G&eacute;n&eacute;rer le plan de retour
          </Button>
        </div>
      )}

      {/* Plan de retour */}
      {plan && (
        <ReturnPlanView plan={plan} formatPace={() => {}} />
      )}
    </div>
  )
}

// ─── Aperçu rapide ──────────────────────────────────────────────────────

function InjuryQuickView({ injury }) {
  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary">{injury.name}</h3>
          <p className="text-sm text-text-secondary mt-1">{injury.summary}</p>
        </div>

        {/* Stratégie volume / intensité / impact */}
        <div className="grid grid-cols-3 gap-3">
          <StrategyBadge label="Volume" strategy={injury.volumeStrategy} />
          <StrategyBadge label="Intensit&eacute;" strategy={injury.intensityStrategy} />
          <StrategyBadge label="Impact" strategy={injury.impactStrategy} />
        </div>

        <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
          <p className="text-sm font-semibold text-primary-800">Principe cl&eacute;</p>
          <p className="text-sm text-primary-700 mt-1">{injury.keyPrinciple}</p>
        </div>
      </div>
    </Card>
  )
}

function StrategyBadge({ label, strategy }) {
  const s = STRATEGY_LABELS[strategy]
  return (
    <div className={`p-3 rounded-lg text-center ${s.color}`}>
      <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className="text-lg font-bold mt-1">{s.icon} {s.label}</p>
    </div>
  )
}

// ─── Plan de retour complet ─────────────────────────────────────────────

function ReturnPlanView({ plan }) {
  const { injury, currentPhase, phases, painLevel } = plan

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-text-primary">{injury.name}</h3>
              <p className="text-sm text-text-secondary mt-1">{injury.summary}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-800">
              {injury.category === 'os' ? 'Osseuse'
                : injury.category === 'tendon_fascia' ? 'Tendineuse / Fasciale'
                : injury.category === 'articulaire' ? 'Articulaire'
                : 'Musculaire'}
            </span>
          </div>

          {/* Stratégie résumée */}
          <div className="grid grid-cols-3 gap-3">
            <StrategyBadge label="Volume" strategy={injury.volumeStrategy} />
            <StrategyBadge label="Intensit&eacute;" strategy={injury.intensityStrategy} />
            <StrategyBadge label="Impact" strategy={injury.impactStrategy} />
          </div>

          <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-sm font-semibold text-primary-800">Principe cl&eacute;</p>
            <p className="text-sm text-primary-700 mt-1">{injury.keyPrinciple}</p>
          </div>
        </div>
      </Card>

      {/* Terrain */}
      <Card title="Recommandations terrain">
        <p className="text-sm text-text-secondary">{injury.terrainAdvice}</p>
      </Card>

      {/* Contre-indications */}
      <Card title="Contre-indications">
        <ul className="space-y-1.5">
          {injury.contraindications.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-red-700">
              <span className="shrink-0 mt-0.5">✕</span>
              {c}
            </li>
          ))}
        </ul>
      </Card>

      {/* Alternatives cross-training */}
      <Card title="Alternatives (cross-training)">
        <div className="flex flex-wrap gap-2">
          {injury.alternatives.map((alt, i) => (
            <span key={i} className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              {alt}
            </span>
          ))}
        </div>
      </Card>

      {/* Phases de retour */}
      <Card title="Plan de retour progressif">
        {/* Indicateur de phase estimée */}
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-sm font-semibold text-amber-800">
            Phase estim&eacute;e actuelle : Phase {currentPhase + 1} — {phases[currentPhase]?.name}
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Bas&eacute; sur la douleur ({painLevel}/10) et le d&eacute;lai depuis la blessure.
            Le passage de phase est guid&eacute; par les crit&egrave;res cliniques, pas uniquement le temps.
          </p>
        </div>

        {/* Timeline des phases */}
        <div className="space-y-4">
          {phases.map((phase, i) => (
            <div
              key={i}
              className={`relative border rounded-xl p-5 transition-colors ${
                phase.isCurrent
                  ? 'border-primary-400 bg-primary-50 shadow-sm'
                  : 'border-border'
              }`}
            >
              {/* Badge phase */}
              <div className="flex items-center gap-3 mb-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  phase.isCurrent
                    ? 'bg-primary-600 text-white'
                    : i < currentPhase
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {i < currentPhase ? '✓' : phase.phase}
                </span>
                <div>
                  <h4 className="font-semibold text-text-primary">{phase.name}</h4>
                  <p className="text-xs text-text-muted">{phase.duration}</p>
                </div>
                {phase.isCurrent && (
                  <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-primary-600 text-white">
                    Phase actuelle
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-11">
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Volume</p>
                  <p className="text-sm text-text-primary mt-0.5">{phase.volume}</p>
                  {phase.suggestedVolumeKm > 0 && (
                    <p className="text-xs text-primary-600 mt-0.5 font-medium">
                      ≈ {phase.suggestedVolumeKm} km/semaine
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Intensit&eacute;</p>
                  <p className="text-sm text-text-primary mt-0.5">{phase.intensity}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Crit&egrave;res de passage</p>
                  <p className="text-sm text-text-secondary mt-0.5">{phase.criteria}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide">D&eacute;tails</p>
                  <p className="text-sm text-text-secondary mt-0.5">{phase.details}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Seuil de douleur */}
      <Card title="R&egrave;gle de la douleur">
        <div className="p-4 rounded-lg bg-surface">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-text-primary">≤ {injury.painThreshold}/10</p>
              <p className="text-xs text-text-muted">Seuil tol&eacute;rable pendant l&apos;effort</p>
            </div>
            <div className="flex-1 text-sm text-text-secondary space-y-1">
              <p><strong>Pendant la course :</strong> la douleur doit rester ≤ {injury.painThreshold}/10.</p>
              <p><strong>Apr&egrave;s la course :</strong> pas d&apos;aggravation dans les 24h.</p>
              <p><strong>Le lendemain :</strong> retour au niveau de douleur d&apos;avant la s&eacute;ance.</p>
              <p className="text-xs text-text-muted mt-2">
                Si l&apos;un de ces crit&egrave;res n&apos;est pas respect&eacute;, la charge &eacute;tait trop importante. R&eacute;duire au prochain entra&icirc;nement.
              </p>
            </div>
          </div>
          {/* Barre visuelle */}
          <div className="mt-4">
            <div className="flex h-6 rounded-full overflow-hidden text-xs font-medium">
              {Array.from({ length: 11 }, (_, i) => (
                <div
                  key={i}
                  className={`flex-1 flex items-center justify-center ${
                    i <= injury.painThreshold
                      ? 'bg-green-400 text-green-900'
                      : i <= injury.painThreshold + 2
                        ? 'bg-amber-400 text-amber-900'
                        : 'bg-red-400 text-red-900'
                  }`}
                >
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>Aucune douleur</span>
              <span>Douleur maximale</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Renforcement */}
      <Card title="Programme de renforcement">
        <ul className="space-y-2">
          {injury.strengthening.map((ex, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              {ex}
            </li>
          ))}
        </ul>
      </Card>

      {/* Repos entre séances */}
      <Card title="Fr&eacute;quence recommand&eacute;e">
        <div className="flex items-center gap-4">
          <div className="text-center p-4 bg-surface rounded-xl">
            <p className="text-2xl font-bold text-text-primary">{injury.restDays}j</p>
            <p className="text-xs text-text-muted">repos minimum entre s&eacute;ances</p>
          </div>
          <div className="text-sm text-text-secondary flex-1">
            <p>
              En phase aigu&euml;, respecter au minimum <strong>{injury.restDays} jour(s)</strong> de repos
              entre les s&eacute;ances de course. Ce d&eacute;lai peut &ecirc;tre r&eacute;duit progressivement
              au fur et &agrave; mesure de la progression dans les phases de retour.
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Le cross-training (v&eacute;lo, natation) peut &ecirc;tre pratiqu&eacute; les jours sans course si indolore.
            </p>
          </div>
        </div>
      </Card>

      {/* Références */}
      <Card title="R&eacute;f&eacute;rences scientifiques">
        <ul className="space-y-1">
          {injury.references.map((ref, i) => (
            <li key={i} className="text-xs text-text-muted">
              {ref}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
