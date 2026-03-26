import { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { SESSION_TYPES, SURFACES } from '../../constants'

export function SessionList({ sessions, onEdit, onDelete, onRepeat }) {
  const [filters, setFilters] = useState({ sessionType: '', surface: '', rpeMin: '', rpeMax: '' })
  const [showFilters, setShowFilters] = useState(false)

  const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date))

  if (sorted.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <p className="text-text-muted text-sm">
            Aucune séance enregistrée. Ajoutez la première séance pour commencer le suivi.
          </p>
        </div>
      </Card>
    )
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  const getRPEColor = (rpe) => {
    if (rpe <= 3) return 'text-risk-green'
    if (rpe <= 5) return 'text-risk-yellow'
    if (rpe <= 7) return 'text-risk-orange'
    return 'text-risk-red'
  }

  const getRPEBg = (rpe) => {
    if (rpe <= 3) return 'bg-emerald-50'
    if (rpe <= 5) return 'bg-amber-50'
    if (rpe <= 7) return 'bg-orange-50'
    return 'bg-red-50'
  }

  const filtered = sorted.filter(s => {
    if (filters.sessionType && s.sessionType !== filters.sessionType) return false
    if (filters.surface && s.surface !== filters.surface) return false
    if (filters.rpeMin && s.rpe < Number(filters.rpeMin)) return false
    if (filters.rpeMax && s.rpe > Number(filters.rpeMax)) return false
    return true
  })

  const hasActiveFilters = filters.sessionType || filters.surface || filters.rpeMin || filters.rpeMax
  const updateFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }))
  const resetFilters = () => setFilters({ sessionType: '', surface: '', rpeMin: '', rpeMax: '' })

  return (
    <div>
      {/* Filtres */}
      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors mb-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          Filtres
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 bg-primary-500 text-white text-[0.6rem] rounded-full font-bold">
              {[filters.sessionType, filters.surface, filters.rpeMin, filters.rpeMax].filter(Boolean).length}
            </span>
          )}
        </button>

        {showFilters && (
          <div className="flex flex-wrap items-end gap-3 p-3 bg-surface-card rounded-xl border border-border/60 mb-3">
            <div className="min-w-[140px]">
              <label className="block text-[0.65rem] font-medium text-text-muted uppercase tracking-wider mb-1">Type</label>
              <select
                value={filters.sessionType}
                onChange={e => updateFilter('sessionType', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs text-text-primary
                  focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
              >
                <option value="">Tous</option>
                {SESSION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="min-w-[120px]">
              <label className="block text-[0.65rem] font-medium text-text-muted uppercase tracking-wider mb-1">Surface</label>
              <select
                value={filters.surface}
                onChange={e => updateFilter('surface', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs text-text-primary
                  focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
              >
                <option value="">Toutes</option>
                {SURFACES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-1.5">
              <div className="w-16">
                <label className="block text-[0.65rem] font-medium text-text-muted uppercase tracking-wider mb-1">RPE min</label>
                <input
                  type="number"
                  value={filters.rpeMin}
                  onChange={e => updateFilter('rpeMin', e.target.value)}
                  min={1} max={10} placeholder="1"
                  className="w-full px-2 py-1.5 rounded-lg border border-border bg-white text-xs text-center text-text-primary
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <span className="text-text-muted text-xs pb-1.5">—</span>
              <div className="w-16">
                <label className="block text-[0.65rem] font-medium text-text-muted uppercase tracking-wider mb-1">RPE max</label>
                <input
                  type="number"
                  value={filters.rpeMax}
                  onChange={e => updateFilter('rpeMax', e.target.value)}
                  min={1} max={10} placeholder="10"
                  className="w-full px-2 py-1.5 rounded-lg border border-border bg-white text-xs text-center text-text-primary
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-primary-500 hover:text-primary-600 font-medium pb-1.5"
              >
                Réinitialiser
              </button>
            )}
          </div>
        )}

        {hasActiveFilters && (
          <p className="text-xs text-text-muted mb-2">
            {filtered.length} séance{filtered.length !== 1 ? 's' : ''} sur {sorted.length}
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-text-muted text-sm">Aucune séance ne correspond aux filtres.</p>
          </div>
        </Card>
      ) : (
      <div className="space-y-2 stagger-children">
      {filtered.map(session => {
        const typeLabel = SESSION_TYPES.find(t => t.value === session.sessionType)?.label || session.sessionType
        const surfaceLabel = SURFACES.find(s => s.value === session.surface)?.label || ''

        return (
          <div
            key={session.id}
            className="flex items-center gap-4 p-4 bg-surface-card rounded-2xl border border-border/60
              hover:shadow-md hover:shadow-black/[0.04] hover:border-border transition-all duration-200"
          >
            {/* Date */}
            <div className="w-20 shrink-0 text-center">
              <span className="text-sm font-semibold text-text-primary block" style={{ fontFamily: 'var(--font-heading)' }}>
                {formatDate(session.date)}
              </span>
            </div>

            {/* Type & Surface */}
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-text-primary">{typeLabel}</span>
              {surfaceLabel && (
                <span className="text-xs text-text-muted ml-2">{surfaceLabel}</span>
              )}
              {session.contextualFactors?.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-amber-100/80 text-amber-700 text-xs rounded-md font-medium">
                  {session.contextualFactors.length} facteur(s)
                </span>
              )}
            </div>

            {/* Métriques */}
            <div className="flex items-center gap-4 text-sm shrink-0">
              <div className="text-center">
                <span className="text-text-muted block text-[0.65rem] uppercase tracking-wide font-medium">Dist.</span>
                <span className="font-semibold tabular-nums" style={{ fontFamily: 'var(--font-heading)' }}>{session.distance} km</span>
              </div>
              <div className="text-center">
                <span className="text-text-muted block text-[0.65rem] uppercase tracking-wide font-medium">Durée</span>
                <span className="font-semibold tabular-nums" style={{ fontFamily: 'var(--font-heading)' }}>{session.duration} min</span>
              </div>
              {session.elevationGain > 0 && (
                <div className="text-center">
                  <span className="text-text-muted block text-[0.65rem] uppercase tracking-wide font-medium">D+</span>
                  <span className="font-semibold tabular-nums" style={{ fontFamily: 'var(--font-heading)' }}>{session.elevationGain} m</span>
                </div>
              )}
              <div className={`text-center px-2.5 py-1.5 rounded-lg ${getRPEBg(session.rpe)}`}>
                <span className="text-text-muted block text-[0.65rem] uppercase tracking-wide font-medium">RPE</span>
                <span className={`font-bold tabular-nums ${getRPEColor(session.rpe)}`} style={{ fontFamily: 'var(--font-heading)' }}>{session.rpe}/10</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => onEdit(session)}>Modifier</Button>
              {onRepeat && (
                <Button variant="ghost" size="sm" onClick={() => onRepeat(session)}>
                  <svg className="w-3.5 h-3.5 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 14.652" />
                  </svg>
                  Répéter
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => onDelete(session.id)}>Suppr.</Button>
            </div>
          </div>
        )
      })}
      </div>
      )}
    </div>
  )
}
