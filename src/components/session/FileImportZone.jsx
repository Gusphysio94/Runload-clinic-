import { useState, useRef } from 'react'
import { parseActivityFile, formatFileSize } from '../../utils/fileImport'

const ACCEPTED_EXTENSIONS = ['.fit', '.gpx', '.tcx']
const ACCEPTED_MIME = 'application/octet-stream,.fit,.gpx,.tcx,application/gpx+xml,application/xml,text/xml'

const SOURCE_LABELS = {
  fit: { label: 'Garmin FIT', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  gpx: { label: 'GPX', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  tcx: { label: 'Strava TCX', color: 'text-orange-600 bg-orange-50 border-orange-200' },
}

export function FileImportZone({ onImport, patient }) {
  const [isDragging, setIsDragging] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    if (!ACCEPTED_EXTENSIONS.includes(`.${ext}`)) {
      setError(`Format .${ext} non supporté. Formats acceptés : .fit, .gpx, .tcx`)
      return
    }

    setParsing(true)
    setError(null)
    setResult(null)

    try {
      const parsed = await parseActivityFile(file)

      // Si le patient a une FCmax, recalculer les zones avec la vraie valeur
      if (patient?.fcMax && parsed.session._maxHR) {
        // On garde les zones calculées, elles seront basées sur la FCmax du fichier
        // Le kiné pourra ajuster dans le formulaire
      }

      setResult({ ...parsed, fileName: file.name, fileSize: file.size })
    } catch (err) {
      setError(err.message || 'Erreur lors de la lecture du fichier.')
    } finally {
      setParsing(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleInputChange = (e) => {
    const file = e.target.files[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleApply = () => {
    if (result) {
      onImport(result.session)
      setResult(null)
    }
  }

  const handleCancel = () => {
    setResult(null)
    setError(null)
  }

  // ─── Résultat parsé : affichage résumé ────────────────────────────────

  if (result) {
    const srcInfo = SOURCE_LABELS[result.source] || SOURCE_LABELS.fit

    return (
      <div className="rounded-xl border border-green-200 bg-green-50/50 p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold text-green-800">Fichier importé</span>
            <span className={`text-[0.65rem] font-medium px-2 py-0.5 rounded-full border ${srcInfo.color}`}>
              {srcInfo.label}
            </span>
          </div>
          <button onClick={handleCancel} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            Annuler
          </button>
        </div>

        {/* File info */}
        <p className="text-xs text-slate-500">
          {result.fileName} · {formatFileSize(result.fileSize)}
        </p>

        {/* Summary grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {result.summary.map((item, i) => (
            <div key={i} className="bg-white rounded-lg border border-green-100 px-3 py-2">
              <p className="text-[0.6rem] text-slate-400 uppercase tracking-wider font-medium">{item.label}</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Zone distribution if available */}
        {result.session.useZones && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Zones HR :</span>
            {Object.entries(result.session.zones).map(([zone, min]) => (
              min > 0 && (
                <span key={zone} className="text-[0.65rem] font-medium text-slate-600 bg-white border border-slate-200 rounded px-1.5 py-0.5">
                  {zone.toUpperCase()} {min}'
                </span>
              )
            ))}
          </div>
        )}

        {/* Warnings */}
        {!result.session.useZones && result.source === 'gpx' && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Les fichiers GPX ne contiennent pas toujours les données de fréquence cardiaque. Les zones devront être renseignées manuellement.
          </p>
        )}

        {/* Apply button */}
        <button
          onClick={handleApply}
          className="w-full px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Appliquer au formulaire
        </button>
      </div>
    )
  }

  // ─── Zone de drop ─────────────────────────────────────────────────────

  return (
    <div className="space-y-1">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-200
          ${isDragging
            ? 'border-primary-400 bg-primary-50/50 scale-[1.01]'
            : 'border-slate-200 hover:border-primary-300 hover:bg-primary-50/20'
          }
          ${parsing ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_MIME}
          onChange={handleInputChange}
          className="hidden"
        />

        {parsing ? (
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-primary-600 font-medium">Analyse du fichier...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-600">
                Importer un fichier Garmin / Strava
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Glissez un fichier .fit, .gpx ou .tcx — ou cliquez pour parcourir
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-xs text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
