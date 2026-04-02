import { useState } from 'react'
import { fetchStravaActivities, mapStravaActivityToSession } from '../../utils/strava'

/**
 * Liste les activités Strava récentes et permet de les importer.
 * Produit le même format que FileImportZone pour être consommé par handleImport.
 */
export function StravaActivityPicker({ onImport, existingSessions }) {
  const [activities, setActivities] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selected, setSelected] = useState(null) // activité sélectionnée pour preview

  // Set de stravaIds déjà importés
  const importedIds = new Set(
    (existingSessions || [])
      .filter(s => s._stravaId)
      .map(s => s._stravaId)
  )

  const loadActivities = async (pageNum = 1) => {
    setLoading(true)
    setError(null)
    try {
      const { activities: data } = await fetchStravaActivities({ page: pageNum, perPage: 20 })
      if (pageNum === 1) {
        setActivities(data)
      } else {
        setActivities(prev => [...(prev || []), ...data])
      }
      setHasMore(data.length === 20)
      setPage(pageNum)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (activity) => {
    const mapped = mapStravaActivityToSession(activity)
    setSelected(mapped)
  }

  const handleImport = () => {
    if (selected) {
      onImport(selected.session)
      setSelected(null)
      setActivities(null)
    }
  }

  // ─── Preview d'une activité sélectionnée ──────────────────────────────

  if (selected) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold text-green-800">Activité Strava</span>
            <span className="text-[0.65rem] font-medium px-2 py-0.5 rounded-full border text-orange-600 bg-orange-50 border-orange-200">
              Strava
            </span>
          </div>
          <button onClick={() => setSelected(null)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            Retour
          </button>
        </div>

        {/* Summary grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {selected.summary.map((item, i) => (
            <div key={i} className="bg-white rounded-lg border border-green-100 px-3 py-2">
              <p className="text-[0.6rem] text-slate-400 uppercase tracking-wider font-medium">{item.label}</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Nom activité Strava */}
        {selected.raw?.name && (
          <p className="text-xs text-slate-500 italic">{selected.raw.name}</p>
        )}

        <button
          onClick={handleImport}
          className="w-full px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Appliquer au formulaire
        </button>
      </div>
    )
  }

  // ─── État initial : bouton "Charger" ──────────────────────────────────

  if (!activities && !loading) {
    return (
      <button
        onClick={() => loadActivities(1)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-orange-200 bg-orange-50/30 hover:bg-orange-50 text-sm font-medium text-orange-700 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Charger mes activités Strava
      </button>
    )
  }

  // ─── Loading ──────────────────────────────────────────────────────────

  if (loading && !activities) {
    return (
      <div className="flex items-center justify-center gap-2 py-6">
        <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-orange-600 font-medium">Chargement depuis Strava...</span>
      </div>
    )
  }

  // ─── Liste d'activités ────────────────────────────────────────────────

  return (
    <div className="space-y-2">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-text-muted font-medium">
          {activities.length} activité{activities.length !== 1 ? 's' : ''} de course
        </p>
        <button
          onClick={() => { setActivities(null); setPage(1); setHasMore(true) }}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          Fermer
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto rounded-xl border border-border/50 divide-y divide-border/30">
        {activities.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-text-muted">Aucune activité de course trouvée.</p>
          </div>
        )}
        {activities.map(activity => {
          const alreadyImported = importedIds.has(activity.id)
          const dist = (activity.distance / 1000).toFixed(1)
          const dur = Math.round(activity.moving_time / 60)
          const dateStr = new Date(activity.start_date_local).toLocaleDateString('fr-FR', {
            weekday: 'short', day: 'numeric', month: 'short',
          })

          return (
            <div
              key={activity.id}
              onClick={() => !alreadyImported && handleSelect(activity)}
              className={`flex items-center gap-3 px-4 py-3 transition-colors
                ${alreadyImported
                  ? 'opacity-50 cursor-default bg-slate-50/50'
                  : 'cursor-pointer hover:bg-primary-50/30'
                }`}
            >
              {/* Icône type */}
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                {activity.type === 'TrailRun' ? (
                  <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l4-4 4 4 4-8 4 4" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048" />
                  </svg>
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {activity.name}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {dateStr} · {dist} km · {dur} min
                  {activity.total_elevation_gain > 0 && ` · ${Math.round(activity.total_elevation_gain)}m D+`}
                  {activity.average_heartrate && ` · ${Math.round(activity.average_heartrate)} bpm`}
                </p>
              </div>

              {/* Badge */}
              {alreadyImported ? (
                <span className="text-[0.6rem] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                  Déjà importé
                </span>
              ) : (
                <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              )}
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {hasMore && activities.length > 0 && (
        <button
          onClick={() => loadActivities(page + 1)}
          disabled={loading}
          className="w-full py-2 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Chargement...' : 'Charger plus d\'activités'}
        </button>
      )}
    </div>
  )
}
