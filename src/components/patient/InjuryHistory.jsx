import { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { FormField, Input, Select, TextArea } from '../ui/FormField'
import { INJURY_TYPES, BODY_LOCATIONS } from '../../constants'

const EMPTY_INJURY = {
  type: '',
  location: '',
  date: '',
  isRecurrence: false,
  status: 'resolved',
  notes: '',
}

const INJURY_STATUSES = [
  { value: 'resolved', label: 'Résolu' },
  { value: 'ongoing', label: 'En cours' },
  { value: 'chronic', label: 'Chronique' },
]

export function InjuryHistory({ injuries, onChange }) {
  const [editing, setEditing] = useState(null) // index or 'new'
  const [form, setForm] = useState(EMPTY_INJURY)

  const startAdd = () => {
    setForm(EMPTY_INJURY)
    setEditing('new')
  }

  const startEdit = (index) => {
    setForm({ ...injuries[index] })
    setEditing(index)
  }

  const save = () => {
    if (editing === 'new') {
      onChange([...injuries, { ...form, id: crypto.randomUUID() }])
    } else {
      const updated = [...injuries]
      updated[editing] = { ...form }
      onChange(updated)
    }
    setEditing(null)
    setForm(EMPTY_INJURY)
  }

  const remove = (index) => {
    onChange(injuries.filter((_, i) => i !== index))
  }

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const getTimeSince = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const months = Math.round((now - date) / (1000 * 60 * 60 * 24 * 30))
    if (months < 1) return '< 1 mois'
    if (months < 12) return `${months} mois`
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    return remainingMonths > 0 ? `${years} an(s) et ${remainingMonths} mois` : `${years} an(s)`
  }

  const getRiskBadge = (injury) => {
    if (injury.status === 'ongoing') return { label: 'En cours', color: 'bg-risk-red text-white' }
    if (injury.status === 'chronic') return { label: 'Chronique', color: 'bg-risk-orange text-white' }
    const date = new Date(injury.date)
    const months = Math.round((new Date() - date) / (1000 * 60 * 60 * 24 * 30))
    if (months < 6) return { label: '< 6 mois', color: 'bg-risk-orange text-white' }
    if (months < 12) return { label: '< 12 mois', color: 'bg-risk-yellow text-black' }
    return { label: '> 12 mois', color: 'bg-gray-200 text-gray-700' }
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-text-secondary">
              L'historique de blessures pondère le score de risque. Les blessures récentes
              ou récidivantes augmentent les seuils d'alerte.
            </p>
          </div>
          <Button onClick={startAdd} size="sm">
            + Ajouter
          </Button>
        </div>

        {injuries.length === 0 && editing === null && (
          <p className="text-center text-text-muted py-8">
            Aucune blessure enregistrée
          </p>
        )}

        {/* Liste des blessures */}
        {injuries.map((injury, index) => {
          const badge = getRiskBadge(injury)
          const typeLabel = INJURY_TYPES.find(t => t.value === injury.type)?.label || injury.type
          const locationLabel = BODY_LOCATIONS.find(l => l.value === injury.location)?.label || injury.location

          return (
            <div key={injury.id || index} className="flex items-center gap-4 p-4 rounded-xl border border-border/60 mb-2 hover:bg-surface hover:shadow-sm transition-all duration-200">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{typeLabel}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                    {badge.label}
                  </span>
                  {injury.isRecurrence && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-risk-red text-white">
                      Récidive
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  {locationLabel} — {getTimeSince(injury.date)}
                  {injury.notes && ` — ${injury.notes}`}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => startEdit(index)}>Modifier</Button>
                <Button variant="ghost" size="sm" onClick={() => remove(index)}>Supprimer</Button>
              </div>
            </div>
          )
        })}
      </Card>

      {/* Formulaire d'ajout/édition */}
      {editing !== null && (
        <Card title={editing === 'new' ? 'Nouvelle blessure' : 'Modifier la blessure'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Type de blessure" required>
              <Select
                options={INJURY_TYPES}
                value={form.type}
                onChange={e => update('type', e.target.value)}
                placeholder="Sélectionner..."
              />
            </FormField>
            <FormField label="Localisation" required>
              <Select
                options={BODY_LOCATIONS}
                value={form.location}
                onChange={e => update('location', e.target.value)}
                placeholder="Sélectionner..."
              />
            </FormField>
            <FormField label="Date de survenue">
              <Input
                type="date"
                value={form.date}
                onChange={e => update('date', e.target.value)}
              />
            </FormField>
            <FormField label="Statut">
              <Select
                options={INJURY_STATUSES}
                value={form.status}
                onChange={e => update('status', e.target.value)}
              />
            </FormField>
            <FormField label="">
              <label className="flex items-center gap-2 cursor-pointer text-sm mt-6">
                <input
                  type="checkbox"
                  checked={form.isRecurrence}
                  onChange={e => update('isRecurrence', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                Récidive
              </label>
            </FormField>
          </div>
          <div className="mt-4">
            <FormField label="Notes">
              <TextArea
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                placeholder="Contexte, traitement, évolution..."
                rows={2}
              />
            </FormField>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={save}>Enregistrer</Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>Annuler</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
