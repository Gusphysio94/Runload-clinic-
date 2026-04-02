import { useState } from 'react'
import { Card } from '../ui/Card'
import { getWearPercent, getWearStatus, getMinimalistCategory, getRotationAdvice, SHOE_LIFESPAN } from '../../utils/shoeAdvisor'

const SHOE_TYPES = [
  { value: 'route', label: 'Route' },
  { value: 'trail', label: 'Trail' },
  { value: 'competition', label: 'Compétition' },
  { value: 'minimaliste', label: 'Minimaliste' },
]

const EMPTY_SHOE = {
  brand: '',
  model: '',
  type: 'route',
  drop: '',
  minimalistIndex: '',
  kmRun: '0',
  dateAdded: new Date().toISOString().split('T')[0],
  retired: false,
  notes: '',
}

export function ShoeRotation({ shoes, onUpdate, patient }) {
  const [editing, setEditing] = useState(null) // null | 'new' | index
  const [form, setForm] = useState(EMPTY_SHOE)
  const [showRetired, setShowRetired] = useState(false)

  const activeShoes = shoes.filter(s => !s.retired)
  const retiredShoes = shoes.filter(s => s.retired)

  // Conseil rotation
  const runsPerWeek = patient?.runsPerWeek || 4
  const rotationAdvice = getRotationAdvice(runsPerWeek, activeShoes)

  const startAdd = () => {
    setForm(EMPTY_SHOE)
    setEditing('new')
  }

  const startEdit = (index) => {
    setForm({ ...shoes[index] })
    setEditing(index)
  }

  const handleSave = () => {
    const shoe = {
      ...form,
      drop: Number(form.drop) || 0,
      minimalistIndex: Number(form.minimalistIndex) || 0,
      kmRun: Number(form.kmRun) || 0,
    }

    if (editing === 'new') {
      shoe.id = crypto.randomUUID()
      onUpdate([...shoes, shoe])
    } else {
      const updated = [...shoes]
      updated[editing] = { ...updated[editing], ...shoe }
      onUpdate(updated)
    }
    setEditing(null)
  }

  const handleDelete = (index) => {
    onUpdate(shoes.filter((_, i) => i !== index))
  }

  const handleRetire = (index) => {
    const updated = [...shoes]
    updated[index] = { ...updated[index], retired: true, retiredDate: new Date().toISOString().split('T')[0] }
    onUpdate(updated)
  }

  const handleUpdateKm = (index, km) => {
    const updated = [...shoes]
    updated[index] = { ...updated[index], kmRun: Number(km) || 0 }
    onUpdate(updated)
  }

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="space-y-5">
      {/* Résumé rotation */}
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Rotation</p>
            <p className="text-sm text-text-secondary">
              <span className="font-bold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                {activeShoes.length}
              </span>
              {' '}paire{activeShoes.length !== 1 ? 's' : ''} active{activeShoes.length !== 1 ? 's' : ''}
              {' · '}
              Idéal : {rotationAdvice.idealCount} paires pour {runsPerWeek} sorties/sem
            </p>
            {!rotationAdvice.sufficient && (
              <p className="text-xs text-amber-600 mt-1">
                Ajouter {rotationAdvice.idealCount - rotationAdvice.currentCount} paire(s) pour une rotation optimale
              </p>
            )}
          </div>
          <button
            onClick={startAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-b from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl
              hover:from-primary-500 hover:to-primary-700 shadow-sm shadow-primary-600/25 transition-all shrink-0"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Ajouter
          </button>
        </div>

        {rotationAdvice.suggestions.length > 0 && activeShoes.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/40">
            <p className="text-[0.65rem] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Suggestions</p>
            <ul className="space-y-1">
              {rotationAdvice.suggestions.map((s, i) => (
                <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Formulaire ajout/édition */}
      {editing !== null && (
        <Card title={editing === 'new' ? 'Nouvelle paire' : 'Modifier la paire'}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Marque</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={e => update('brand', e.target.value)}
                  placeholder="Ex: Altra, Brooks..."
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Modèle</label>
                <input
                  type="text"
                  value={form.model}
                  onChange={e => update('model', e.target.value)}
                  placeholder="Ex: Escalante 4"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Type</label>
                <select
                  value={form.type}
                  onChange={e => update('type', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                >
                  {SHOE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Drop (mm)</label>
                <input
                  type="number"
                  value={form.drop}
                  onChange={e => update('drop', e.target.value)}
                  min={0} max={15} step={0.5}
                  placeholder="mm"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm text-center
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Indice min. (%)</label>
                <input
                  type="number"
                  value={form.minimalistIndex}
                  onChange={e => update('minimalistIndex', e.target.value)}
                  min={0} max={100}
                  placeholder="%"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm text-center
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Km parcourus</label>
                <input
                  type="number"
                  value={form.kmRun}
                  onChange={e => update('kmRun', e.target.value)}
                  min={0} max={5000}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm text-center
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Date d'achat</label>
                <input
                  type="date"
                  value={form.dateAdded}
                  onChange={e => update('dateAdded', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                placeholder="Ex: Utilisée pour les sorties longues..."
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface-card text-text-primary text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!form.brand || !form.model}
                className="flex-1 px-4 py-2.5 bg-gradient-to-b from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl
                  hover:from-primary-500 hover:to-primary-700 shadow-sm shadow-primary-600/25
                  disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {editing === 'new' ? 'Ajouter' : 'Enregistrer'}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2.5 text-sm font-medium text-text-secondary bg-surface-card border border-border rounded-xl
                  hover:text-text-primary transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Liste des chaussures actives */}
      {activeShoes.length > 0 ? (
        <div className="space-y-3">
          {shoes.map((shoe, index) => {
            if (shoe.retired) return null
            const wear = getWearPercent(shoe.kmRun || 0, shoe.type || 'route')
            const status = getWearStatus(shoe.kmRun || 0, shoe.type || 'route')
            const category = shoe.minimalistIndex ? getMinimalistCategory(shoe.minimalistIndex) : null
            const lifespan = SHOE_LIFESPAN[shoe.type || 'route']

            return (
              <Card key={shoe.id || index}>
                <div className="flex items-start gap-4">
                  {/* Couleur indicateur */}
                  <div className="w-1.5 h-full min-h-[60px] rounded-full shrink-0" style={{ backgroundColor: status.color }} />

                  <div className="flex-1 min-w-0">
                    {/* Titre + badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                          {shoe.brand} {shoe.model}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-surface-dark/30 border border-border/40 text-text-muted font-medium">
                            {SHOE_TYPES.find(t => t.value === shoe.type)?.label || 'Route'}
                          </span>
                          {shoe.drop !== undefined && shoe.drop !== '' && (
                            <span className="text-[0.65rem] text-text-muted">
                              Drop {shoe.drop}mm
                            </span>
                          )}
                          {category && (
                            <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: category.color + '15', color: category.color }}>
                              IM {shoe.minimalistIndex}%
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(index)}
                          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-dark/30 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="Modifier"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRetire(index)}
                          className="p-2 rounded-lg text-text-muted hover:text-amber-500 hover:bg-amber-50 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="Retirer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Barre d'usure */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[0.65rem] mb-1">
                        <span className="text-text-muted">
                          <span className="font-bold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                            {shoe.kmRun || 0}
                          </span> km
                        </span>
                        <span className="font-semibold" style={{ color: status.color }}>{status.label}</span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-dark/30 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${wear}%`, backgroundColor: status.color }}
                        />
                      </div>
                      <p className="text-[0.6rem] text-text-muted mt-1">
                        Durée de vie estimée : {lifespan.min}–{lifespan.max} km
                      </p>
                    </div>

                    {/* Mise à jour rapide km */}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateKm(index, (shoe.kmRun || 0) + 5)}
                        className="text-[0.65rem] px-3 py-2 rounded-lg border border-border/40 text-text-muted hover:text-text-primary hover:bg-surface-dark/20 transition-colors min-h-[36px]"
                      >
                        +5 km
                      </button>
                      <button
                        onClick={() => handleUpdateKm(index, (shoe.kmRun || 0) + 10)}
                        className="text-[0.65rem] px-3 py-2 rounded-lg border border-border/40 text-text-muted hover:text-text-primary hover:bg-surface-dark/20 transition-colors min-h-[36px]"
                      >
                        +10 km
                      </button>
                      <button
                        onClick={() => handleUpdateKm(index, (shoe.kmRun || 0) + 20)}
                        className="text-[0.65rem] px-3 py-2 rounded-lg border border-border/40 text-text-muted hover:text-text-primary hover:bg-surface-dark/20 transition-colors min-h-[36px]"
                      >
                        +20 km
                      </button>
                      {shoe.notes && (
                        <span className="text-[0.6rem] text-text-muted ml-auto truncate max-w-[150px]">{shoe.notes}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : editing === null && (
        <Card>
          <div className="text-center py-10">
            <div className="w-14 h-14 mx-auto rounded-xl bg-primary-100/60 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 18h18v1.5H3V18zm0-1.5c0-1.5 1.5-3 3-4.5 1-1 2.5-1.5 4-1.5h1c1.5 0 3-.5 4-1.5l3-3c.5-.5 1.2-.8 1.8-.5.8.4 1.2 1.2 1.2 2v3c0 2-1 3.5-2 4.5-.8.8-2 1.5-3.5 1.5H3z" />
              </svg>
            </div>
            <p className="text-sm text-text-muted mb-4">
              Aucune chaussure enregistrée. Ajoutez vos paires pour suivre l'usure et optimiser la rotation.
            </p>
            <button
              onClick={startAdd}
              className="px-5 py-2.5 bg-gradient-to-b from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl
                hover:from-primary-500 hover:to-primary-700 shadow-sm shadow-primary-600/25 transition-all"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Ajouter une paire
            </button>
          </div>
        </Card>
      )}

      {/* Chaussures retirées */}
      {retiredShoes.length > 0 && (
        <div>
          <button
            onClick={() => setShowRetired(!showRetired)}
            className="flex items-center gap-2 text-xs font-medium text-text-muted hover:text-text-secondary transition-colors py-2 min-h-[36px]"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${showRetired ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            {retiredShoes.length} paire{retiredShoes.length > 1 ? 's' : ''} retirée{retiredShoes.length > 1 ? 's' : ''}
          </button>

          {showRetired && (
            <div className="mt-2 space-y-2">
              {shoes.map((shoe, index) => {
                if (!shoe.retired) return null
                return (
                  <div key={shoe.id || index} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-dark/10 border border-border/30 opacity-60">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-secondary line-through">
                        {shoe.brand} {shoe.model}
                      </p>
                      <p className="text-[0.6rem] text-text-muted">
                        {shoe.kmRun || 0} km · Retiré {shoe.retiredDate ? `le ${shoe.retiredDate}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-2 rounded-lg text-text-muted hover:text-red-500 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Supprimer définitivement"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Info rotation */}
      {activeShoes.length >= 2 && (
        <div className="text-[0.6rem] text-text-muted space-y-0.5 pt-2">
          <p className="font-semibold uppercase tracking-wider mb-1">Références</p>
          <p>Malisoux L. et al. (2015). Can parallel use of different running shoes decrease running-related injury risk? <em>Scand J Med Sci Sports</em>, 25(1), 110-115.</p>
        </div>
      )}
    </div>
  )
}
