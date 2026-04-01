import { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { FormField, Input, TextArea } from '../ui/FormField'

const today = () => new Date().toISOString().slice(0, 10)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function ClinicalNotes({ notes, onAdd, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null) // null | 'new' | noteId
  const [form, setForm] = useState({ date: today(), content: '' })

  const sorted = [...(notes || [])].sort((a, b) =>
    (b.date || b.createdAt).localeCompare(a.date || a.createdAt)
  )

  const startAdd = () => {
    setForm({ date: today(), content: '' })
    setEditing('new')
  }

  const startEdit = (note) => {
    setForm({ date: note.date, content: note.content })
    setEditing(note.id)
  }

  const save = () => {
    if (!form.content.trim()) return
    if (editing === 'new') {
      onAdd({ date: form.date, content: form.content.trim() })
    } else {
      onUpdate(editing, { date: form.date, content: form.content.trim() })
    }
    setEditing(null)
    setForm({ date: today(), content: '' })
  }

  const handleDelete = (id) => {
    if (confirm('Supprimer cette note ?')) {
      onDelete(id)
    }
  }

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      save()
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-text-secondary">
            Notes de consultation, anamnèse et observations cliniques.
          </p>
          {editing === null && (
            <Button onClick={startAdd} size="sm">
              + Nouvelle note
            </Button>
          )}
        </div>

        {/* Formulaire inline */}
        {editing !== null && (
          <div className="mb-4 p-4 rounded-xl border border-primary-200 bg-primary-50/30">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 mb-3">
              <FormField label="Date">
                <Input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </FormField>
            </div>
            <FormField label={editing === 'new' ? 'Note' : 'Modifier la note'}>
              <TextArea
                value={form.content}
                onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                onKeyDown={handleKeyDown}
                placeholder="Observations de la consultation..."
                rows={4}
                autoFocus
              />
            </FormField>
            <div className="flex items-center gap-2 mt-3">
              <Button onClick={save} size="sm" disabled={!form.content.trim()}>
                Enregistrer
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>
                Annuler
              </Button>
              <span className="text-[0.65rem] text-text-muted ml-auto hidden sm:inline">
                Ctrl+Entrée pour enregistrer
              </span>
            </div>
          </div>
        )}

        {/* Liste des notes */}
        {sorted.length === 0 && editing === null && (
          <p className="text-center text-text-muted py-8">
            Aucune note clinique. Ajoutez une note lors de votre prochain bilan.
          </p>
        )}

        <div className="space-y-2">
          {sorted.map(note => (
            <div
              key={note.id}
              className="p-4 rounded-xl border border-border/60 hover:bg-surface hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-primary-500">
                    {formatDate(note.date)}
                  </span>
                  <p className="text-sm text-text-primary mt-1 whitespace-pre-wrap break-words">
                    {note.content}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(note)}>
                    Modifier
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(note.id)}>
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
