import { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { FormField, Input, Select, TextArea } from '../ui/FormField'
import { InjuryHistory } from './InjuryHistory'
import { ClinicalNotes } from './ClinicalNotes'
import {
  RUNNER_LEVELS,
  OBJECTIVES,
  INTENSITY_REFERENCES,
} from '../../constants'

const EMPTY_PATIENT = {
  firstName: '',
  lastName: '',
  age: '',
  weight: '',
  height: '',
  level: '',
  objective: '',
  weeklyVolumeRef: '',
  fcMax: '',
  vma: '',
  criticalSpeed: '',
  intensityReference: 'fcmax',
  runningExperience: '',
  notes: '',
  injuries: [],
}

export function PatientProfile({ patient, onSave, clinicalNotes, onAddNote, onUpdateNote, onDeleteNote }) {
  const [form, setForm] = useState({ ...EMPTY_PATIENT, ...patient })
  const [activeTab, setActiveTab] = useState('general')

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    onSave({
      ...form,
      age: form.age ? Number(form.age) : null,
      weight: form.weight ? Number(form.weight) : null,
      height: form.height ? Number(form.height) : null,
      weeklyVolumeRef: form.weeklyVolumeRef ? Number(form.weeklyVolumeRef) : null,
      fcMax: form.fcMax ? Number(form.fcMax) : null,
      vma: form.vma ? Number(form.vma) : null,
      criticalSpeed: form.criticalSpeed ? Number(form.criticalSpeed) : null,
      runningExperience: form.runningExperience ? Number(form.runningExperience) : null,
    })
  }

  const tabs = [
    { id: 'general', label: 'Informations générales' },
    { id: 'physio', label: 'Données physiologiques' },
    { id: 'injuries', label: `Blessures (${form.injuries.length})` },
    { id: 'notes', label: `Notes (${(clinicalNotes || []).length})` },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Profil Patient</h2>
          <p className="text-text-secondary text-sm mt-1">
            Renseignez les informations, objectifs et antécédents du patient.
          </p>
        </div>
        <Button onClick={handleSave}>
          {patient ? 'Mettre à jour' : 'Créer le profil'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100/80 rounded-xl p-1 border border-border/50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-white text-primary-700 shadow-sm shadow-black/[0.04]'
                : 'text-text-secondary hover:text-text-primary'
              }`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Informations générales */}
      {activeTab === 'general' && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Prénom" required>
              <Input
                value={form.firstName}
                onChange={e => update('firstName', e.target.value)}
                placeholder="Prénom"
              />
            </FormField>
            <FormField label="Nom" required>
              <Input
                value={form.lastName}
                onChange={e => update('lastName', e.target.value)}
                placeholder="Nom"
              />
            </FormField>
            <FormField label="Âge">
              <Input
                type="number"
                value={form.age}
                onChange={e => update('age', e.target.value)}
                placeholder="ans"
              />
            </FormField>
            <FormField label="Poids (kg)">
              <Input
                type="number"
                value={form.weight}
                onChange={e => update('weight', e.target.value)}
                placeholder="kg"
              />
            </FormField>
            <FormField label="Taille (cm)">
              <Input
                type="number"
                value={form.height}
                onChange={e => update('height', e.target.value)}
                placeholder="cm"
              />
            </FormField>
            <FormField label="Expérience running (années)">
              <Input
                type="number"
                value={form.runningExperience}
                onChange={e => update('runningExperience', e.target.value)}
                placeholder="années"
              />
            </FormField>
            <FormField label="Niveau">
              <Select
                options={RUNNER_LEVELS}
                value={form.level}
                onChange={e => update('level', e.target.value)}
                placeholder="Sélectionner..."
              />
            </FormField>
            <FormField label="Objectif">
              <Select
                options={OBJECTIVES}
                value={form.objective}
                onChange={e => update('objective', e.target.value)}
                placeholder="Sélectionner..."
              />
            </FormField>
            <FormField label="Volume hebdomadaire habituel (km)" hint="Sert de référence pour le calcul de la charge chronique">
              <Input
                type="number"
                value={form.weeklyVolumeRef}
                onChange={e => update('weeklyVolumeRef', e.target.value)}
                placeholder="km/semaine"
              />
            </FormField>
          </div>
          <div className="mt-4">
            <FormField label="Observations générales">
              <TextArea
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                placeholder="Observations, antécédents particuliers..."
                rows={3}
              />
            </FormField>
          </div>
        </Card>
      )}

      {/* Tab: Données physiologiques */}
      {activeTab === 'physio' && (
        <Card>
          <p className="text-sm text-text-secondary mb-4">
            Ces valeurs servent à définir les zones d'intensité. Renseignez au moins un référentiel.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Référentiel d'intensité principal">
              <Select
                options={INTENSITY_REFERENCES}
                value={form.intensityReference}
                onChange={e => update('intensityReference', e.target.value)}
              />
            </FormField>
            <div /> {/* spacer */}
            <FormField label="FC Max (bpm)" hint="Fréquence cardiaque maximale">
              <Input
                type="number"
                value={form.fcMax}
                onChange={e => update('fcMax', e.target.value)}
                placeholder="bpm"
              />
            </FormField>
            <FormField label="VMA (km/h)" hint="Vitesse maximale aérobie">
              <Input
                type="number"
                step="0.1"
                value={form.vma}
                onChange={e => update('vma', e.target.value)}
                placeholder="km/h"
              />
            </FormField>
            <FormField label="Vitesse critique (km/h)" hint="Seuil de vitesse soutenable">
              <Input
                type="number"
                step="0.1"
                value={form.criticalSpeed}
                onChange={e => update('criticalSpeed', e.target.value)}
                placeholder="km/h"
              />
            </FormField>
          </div>
        </Card>
      )}

      {/* Tab: Blessures */}
      {activeTab === 'injuries' && (
        <InjuryHistory
          injuries={form.injuries}
          onChange={injuries => update('injuries', injuries)}
        />
      )}

      {/* Tab: Notes cliniques */}
      {activeTab === 'notes' && (
        <ClinicalNotes
          notes={clinicalNotes}
          onAdd={onAddNote}
          onUpdate={onUpdateNote}
          onDelete={onDeleteNote}
        />
      )}
    </div>
  )
}
