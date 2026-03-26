import { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { FormField, Input, Select, Slider, Checkbox } from '../ui/FormField'
import { ZoneInput } from './ZoneInput'
import { FileImportZone } from './FileImportZone'
import {
  SESSION_TYPES,
  SURFACES,
  CONTEXTUAL_FACTORS,
  BODY_LOCATIONS,
} from '../../constants'

const TODAY = new Date().toISOString().split('T')[0]

const EMPTY_SESSION = {
  date: TODAY,
  // Charge externe
  distance: '',
  duration: '',
  elevationGain: '',
  sessionType: '',
  surface: '',
  // Zones d'intensité (optionnel)
  useZones: false,
  zones: { z1: '', z2: '', z3: '', z4: '', z5: '' },
  // Charge interne
  rpe: 5,
  // Bien-être du jour
  fatigue: 5,
  sleepQuality: 3,
  hasPain: false,
  painLocation: '',
  painIntensity: 3,
  lifeStress: 3,
  mood: 3,
  // Facteurs contextuels
  contextualFactors: [],
  contextualNote: '',
}

export function SessionForm({ patient, onSave, initialData, onCancel }) {
  const [form, setForm] = useState(initialData || EMPTY_SESSION)
  const [step, setStep] = useState(1) // 1: séance, 2: bien-être, 3: contexte, 4: résumé

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleImport = (imported) => {
    setForm(prev => ({
      ...prev,
      date: imported.date || prev.date,
      distance: imported.distance || prev.distance,
      duration: imported.duration || prev.duration,
      elevationGain: imported.elevationGain || prev.elevationGain,
      useZones: imported.useZones || prev.useZones,
      zones: imported.useZones ? imported.zones : prev.zones,
      _imported: true,
      _source: imported._source,
      _avgHR: imported._avgHR,
      _maxHR: imported._maxHR,
      _avgCadence: imported._avgCadence,
      _avgPace: imported._avgPace,
    }))
  }

  const toggleFactor = (factorValue) => {
    setForm(prev => ({
      ...prev,
      contextualFactors: prev.contextualFactors.includes(factorValue)
        ? prev.contextualFactors.filter(f => f !== factorValue)
        : [...prev.contextualFactors, factorValue],
    }))
  }

  const handleSave = () => {
    const session = {
      ...form,
      distance: form.distance ? Number(form.distance) : 0,
      duration: form.duration ? Number(form.duration) : 0,
      elevationGain: form.elevationGain ? Number(form.elevationGain) : 0,
      rpe: Number(form.rpe),
      fatigue: Number(form.fatigue),
      sleepQuality: Number(form.sleepQuality),
      painIntensity: form.hasPain ? Number(form.painIntensity) : 0,
      lifeStress: Number(form.lifeStress),
      mood: Number(form.mood),
    }
    onSave(session)
    setForm({ ...EMPTY_SESSION, date: TODAY })
    setStep(1)
  }

  const steps = [
    { num: 1, label: 'Séance' },
    { num: 2, label: 'Bien-être' },
    { num: 3, label: 'Contexte' },
    { num: 4, label: 'Résumé' },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Journal de séance</h2>
          <p className="text-text-secondary text-sm mt-1">
            Enregistrez les détails d'une séance : type, durée, zones d'intensité et ressenti.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex gap-1 bg-slate-100/80 rounded-xl p-1 border border-border/50">
        {steps.map(s => (
          <button
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200
              ${step === s.num
                ? 'bg-white text-primary-700 shadow-sm shadow-black/[0.04]'
                : 'text-text-secondary hover:text-text-primary'
              }`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[0.65rem] font-bold mr-2
              ${step === s.num ? 'bg-primary-500 text-white' : 'bg-slate-200 text-text-muted'}`}>
              {s.num}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Step 1: Données de séance */}
      {step === 1 && (
        <Card>
          {/* Import fichier */}
          <div className="mb-5">
            <FileImportZone onImport={handleImport} patient={patient} />
          </div>

          {/* Import metadata banner */}
          {form._imported && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <span className="text-xs text-blue-700">
                Données importées depuis {form._source?.toUpperCase()}
                {form._avgHR && ` · FC moy. ${form._avgHR} bpm`}
                {form._avgCadence && ` · Cadence ${form._avgCadence * 2} pas/min`}
              </span>
              <button
                onClick={() => setForm(prev => ({ ...prev, _imported: false, _source: null, _avgHR: null, _maxHR: null, _avgCadence: null, _avgPace: null }))}
                className="ml-auto text-blue-400 hover:text-blue-600"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Date" required>
              <Input
                type="date"
                value={form.date}
                onChange={e => update('date', e.target.value)}
              />
            </FormField>
            <FormField label="Type de séance" required>
              <Select
                options={SESSION_TYPES}
                value={form.sessionType}
                onChange={e => update('sessionType', e.target.value)}
                placeholder="Sélectionner..."
              />
            </FormField>
            <FormField label="Distance (km)" required>
              <Input
                type="number"
                step="0.1"
                value={form.distance}
                onChange={e => update('distance', e.target.value)}
                placeholder="km"
              />
            </FormField>
            <FormField label="Durée (min)" required>
              <Input
                type="number"
                value={form.duration}
                onChange={e => update('duration', e.target.value)}
                placeholder="minutes"
              />
            </FormField>
            <FormField label="Dénivelé D+ (m)">
              <Input
                type="number"
                value={form.elevationGain}
                onChange={e => update('elevationGain', e.target.value)}
                placeholder="mètres"
              />
            </FormField>
            <FormField label="Surface">
              <Select
                options={SURFACES}
                value={form.surface}
                onChange={e => update('surface', e.target.value)}
                placeholder="Sélectionner..."
              />
            </FormField>
          </div>

          {/* RPE */}
          <div className="mt-6">
            <FormField label="RPE — Effort perçu (échelle de Borg CR-10)" required>
              <Slider
                value={form.rpe}
                onChange={v => update('rpe', v)}
                min={1}
                max={10}
                labels={['Très facile', 'Maximal']}
              />
            </FormField>
          </div>

          {/* Zones optionnelles */}
          <div className="mt-6 pt-4 border-t border-border">
            <Checkbox
              label="Renseigner les zones d'intensité (optionnel)"
              checked={form.useZones}
              onChange={v => update('useZones', v)}
            />
            {form.useZones && (
              <div className="mt-4">
                <ZoneInput
                  zones={form.zones}
                  onChange={zones => update('zones', zones)}
                  totalDuration={form.duration ? Number(form.duration) : 0}
                  intensityReference={patient?.intensityReference || 'fcmax'}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={() => setStep(2)}>Suivant</Button>
          </div>
        </Card>
      )}

      {/* Step 2: Bien-être */}
      {step === 2 && (
        <Card>
          <div className="space-y-5">
            <FormField label="Fatigue perçue">
              <Slider
                value={form.fatigue}
                onChange={v => update('fatigue', v)}
                min={1}
                max={10}
                labels={['Frais', 'Épuisé']}
              />
            </FormField>
            <FormField label="Qualité du sommeil">
              <Slider
                value={form.sleepQuality}
                onChange={v => update('sleepQuality', v)}
                min={1}
                max={5}
                labels={['Très mauvais', 'Excellent']}
              />
            </FormField>
            <FormField label="Stress de vie">
              <Slider
                value={form.lifeStress}
                onChange={v => update('lifeStress', v)}
                min={1}
                max={5}
                labels={['Faible', 'Très élevé']}
              />
            </FormField>
            <FormField label="Humeur / Motivation">
              <Slider
                value={form.mood}
                onChange={v => update('mood', v)}
                min={1}
                max={5}
                labels={['Très basse', 'Excellente']}
              />
            </FormField>

            <div className="pt-4 border-t border-border">
              <Checkbox
                label="Douleur / gêne signalée"
                checked={form.hasPain}
                onChange={v => update('hasPain', v)}
              />
              {form.hasPain && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <FormField label="Localisation">
                    <Select
                      options={BODY_LOCATIONS}
                      value={form.painLocation}
                      onChange={e => update('painLocation', e.target.value)}
                      placeholder="Sélectionner..."
                    />
                  </FormField>
                  <FormField label="Intensité de la douleur">
                    <Slider
                      value={form.painIntensity}
                      onChange={v => update('painIntensity', v)}
                      min={1}
                      max={10}
                      labels={['Légère', 'Intense']}
                    />
                  </FormField>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={() => setStep(1)}>Précédent</Button>
            <Button onClick={() => setStep(3)}>Suivant</Button>
          </div>
        </Card>
      )}

      {/* Step 3: Facteurs contextuels */}
      {step === 3 && (
        <Card>
          <p className="text-sm text-text-secondary mb-4">
            Tout changement récent susceptible d'influencer la charge mécanique ou physiologique.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CONTEXTUAL_FACTORS.map(factor => (
              <Checkbox
                key={factor.value}
                label={factor.label}
                checked={form.contextualFactors.includes(factor.value)}
                onChange={() => toggleFactor(factor.value)}
              />
            ))}
          </div>
          <div className="mt-4">
            <FormField label="Précisions (optionnel)">
              <Input
                value={form.contextualNote}
                onChange={e => update('contextualNote', e.target.value)}
                placeholder="Ex: passage chaussures minimalistes, reprise après 2 semaines d'arrêt..."
              />
            </FormField>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={() => setStep(2)}>Précédent</Button>
            <Button onClick={() => setStep(4)}>Suivant</Button>
          </div>
        </Card>
      )}

      {/* Step 4: Résumé */}
      {step === 4 && (
        <div className="space-y-4">
          {/* Séance */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>Séance</h4>
              <button onClick={() => setStep(1)} className="text-xs text-primary-500 hover:text-primary-600 font-medium">Modifier</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryItem label="Date" value={new Date(form.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} />
              <SummaryItem label="Type" value={SESSION_TYPES.find(t => t.value === form.sessionType)?.label || '—'} />
              <SummaryItem label="Distance" value={form.distance ? `${form.distance} km` : '—'} />
              <SummaryItem label="Durée" value={form.duration ? `${form.duration} min` : '—'} />
              <SummaryItem label="D+" value={form.elevationGain ? `${form.elevationGain} m` : '0 m'} />
              <SummaryItem label="Surface" value={SURFACES.find(s => s.value === form.surface)?.label || '—'} />
              <SummaryItem label="RPE" value={`${form.rpe}/10`} highlight={form.rpe >= 7} />
              {form.useZones && (
                <SummaryItem label="Zones" value={Object.entries(form.zones).filter(([, v]) => v).map(([k, v]) => `${k.toUpperCase()}:${v}'`).join(' · ') || '—'} />
              )}
            </div>
          </Card>

          {/* Bien-être */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>Bien-être</h4>
              <button onClick={() => setStep(2)} className="text-xs text-primary-500 hover:text-primary-600 font-medium">Modifier</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryItem label="Fatigue" value={`${form.fatigue}/10`} highlight={form.fatigue >= 7} />
              <SummaryItem label="Sommeil" value={`${form.sleepQuality}/5`} highlight={form.sleepQuality <= 2} />
              <SummaryItem label="Stress" value={`${form.lifeStress}/5`} highlight={form.lifeStress >= 4} />
              <SummaryItem label="Humeur" value={`${form.mood}/5`} highlight={form.mood <= 2} />
              {form.hasPain && (
                <>
                  <SummaryItem label="Douleur" value={`${form.painIntensity}/10`} highlight />
                  <SummaryItem label="Localisation" value={BODY_LOCATIONS.find(b => b.value === form.painLocation)?.label || form.painLocation || '—'} />
                </>
              )}
            </div>
          </Card>

          {/* Contexte */}
          {(form.contextualFactors.length > 0 || form.contextualNote) && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>Contexte</h4>
                <button onClick={() => setStep(3)} className="text-xs text-primary-500 hover:text-primary-600 font-medium">Modifier</button>
              </div>
              {form.contextualFactors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.contextualFactors.map(f => (
                    <span key={f} className="text-xs px-2 py-1 rounded-lg bg-amber-50 border border-amber-200/50 text-amber-700 font-medium">
                      {CONTEXTUAL_FACTORS.find(c => c.value === f)?.label || f}
                    </span>
                  ))}
                </div>
              )}
              {form.contextualNote && (
                <p className="text-xs text-text-secondary italic">{form.contextualNote}</p>
              )}
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setStep(3)}>Précédent</Button>
            <div className="flex gap-2">
              {onCancel && <Button variant="secondary" onClick={onCancel}>Annuler</Button>}
              <Button onClick={handleSave}>Enregistrer la séance</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryItem({ label, value, highlight }) {
  return (
    <div className={`px-3 py-2 rounded-lg ${highlight ? 'bg-amber-50 border border-amber-200/40' : 'bg-surface-dark/20 border border-border/30'}`}>
      <p className="text-[0.6rem] font-semibold text-text-muted uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 ${highlight ? 'text-amber-700' : 'text-text-primary'}`} style={{ fontFamily: 'var(--font-heading)' }}>{value}</p>
    </div>
  )
}
