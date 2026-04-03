import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { saveVideo, loadVideo, deleteVideo } from '../../lib/videoStore'

// ─── Constants ───────────────────────────────────────────────────────────────

const FOOT_STRIKE_OPTIONS = [
  { value: 'heel', label: 'Talon' },
  { value: 'midfoot', label: 'Médio-pied' },
  { value: 'forefoot', label: 'Avant-pied' },
]

const VIEW_OPTIONS = [
  { value: 'sagittal', label: 'Vue sagittale (côté)' },
  { value: 'posterior', label: 'Vue postérieure (dos)' },
]

const SEVERITY_LABELS = ['Absent', 'Léger', 'Modéré', 'Sévère']
const SEVERITY_COLORS = ['text-emerald-600', 'text-amber-500', 'text-orange-500', 'text-red-500']
const SEVERITY_BG = ['bg-emerald-100', 'bg-amber-100', 'bg-orange-100', 'bg-red-100']

const CRITERIA = [
  { key: 'overstride', label: 'Overstride', description: 'Pied qui se pose loin devant le centre de gravité' },
  { key: 'hipAdduction', label: 'Adduction de hanche', description: 'Genou qui croise la ligne médiane à l\'appui' },
  { key: 'pelvicDrop', label: 'Drop du bassin (Trendelenburg)', description: 'Bassin qui s\'affaisse du côté oscillant' },
  { key: 'verticalOscillation', label: 'Oscillation verticale', description: 'Rebond vertical excessif à chaque foulée' },
]

const PLAYBACK_RATES = [0.25, 0.5, 1]

const EMPTY_ANALYSIS = {
  date: new Date().toISOString().split('T')[0],
  view: 'sagittal',
  speed: '',
  cadence: '',
  footStrike: '',
  overstride: 0,
  hipAdduction: 0,
  pelvicDrop: 0,
  verticalOscillation: 0,
  notes: '',
  videoId: null,
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function GaitAnalysis({ patient, gaitAnalyses, onAdd, onUpdate: _onUpdate, onDelete }) {
  const [mode, setMode] = useState('list') // 'list' | 'new' | 'view'
  const [viewingId, setViewingId] = useState(null)
  const [form, setForm] = useState(EMPTY_ANALYSIS)
  const [videoBlob, setVideoBlob] = useState(null) // File or Blob for playback
  const [confirmDelete, setConfirmDelete] = useState(null)

  const analyses = [...(gaitAnalyses || [])].sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  const startNew = () => {
    setForm({ ...EMPTY_ANALYSIS, date: new Date().toISOString().split('T')[0] })
    setVideoBlob(null)
    setMode('new')
  }

  const handleSave = async () => {
    let videoId = form.videoId
    if (videoBlob) {
      videoId = crypto.randomUUID()
      try {
        await saveVideo(videoId, videoBlob)
      } catch {
        videoId = null
      }
    }
    onAdd({ ...form, videoId })
    setMode('list')
    setVideoBlob(null)
  }

  const handleView = async (analysis) => {
    setViewingId(analysis.id)
    setMode('view')
    setVideoBlob(null)
    if (analysis.videoId) {
      try {
        const blob = await loadVideo(analysis.videoId)
        if (blob) setVideoBlob(blob)
      } catch {
        // Video not available
      }
    }
  }

  const handleDelete = async (id) => {
    const analysis = analyses.find(a => a.id === id)
    if (analysis?.videoId) {
      try { await deleteVideo(analysis.videoId) } catch { /* ignore */ }
    }
    onDelete(id)
    setConfirmDelete(null)
    if (mode === 'view') setMode('list')
  }

  const handleBack = () => {
    setMode('list')
    setVideoBlob(null)
  }

  if (!patient) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">Analyse de foulée</h2>
        <Card>
          <p className="text-center text-text-muted py-8 text-sm">
            Sélectionnez un patient pour accéder à l'analyse de foulée.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
            {mode === 'new' ? 'Nouvelle analyse' : mode === 'view' ? 'Détail analyse' : 'Analyse de foulée'}
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            {mode === 'list'
              ? `${analyses.length} analyse${analyses.length > 1 ? 's' : ''} pour ${patient.firstName}`
              : mode === 'new' ? 'Filmez, observez, scorez.' : ''
            }
          </p>
        </div>
        {mode === 'list' ? (
          <Button onClick={startNew}>+ Nouvelle analyse</Button>
        ) : (
          <Button variant="secondary" onClick={handleBack}>Retour</Button>
        )}
      </div>

      {/* New analysis form */}
      {mode === 'new' && (
        <AnalysisForm
          form={form}
          setForm={setForm}
          videoBlob={videoBlob}
          setVideoBlob={setVideoBlob}
          onSave={handleSave}
        />
      )}

      {/* View analysis detail */}
      {mode === 'view' && (() => {
        const analysis = analyses.find(a => a.id === viewingId)
        if (!analysis) return null
        return (
          <AnalysisDetail
            analysis={analysis}
            videoBlob={videoBlob}
            onDelete={() => setConfirmDelete(analysis)}
          />
        )
      })()}

      {/* List */}
      {mode === 'list' && (
        <>
          {analyses.length === 0 ? (
            <Card>
              <div className="text-center py-10">
                <div className="w-14 h-14 mx-auto rounded-xl bg-primary-100/60 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-text-primary mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  Aucune analyse de foulée
                </p>
                <p className="text-xs text-text-muted mb-4">
                  Filmez votre patient sur tapis et évaluez sa biomécanique de course.
                </p>
                <Button onClick={startNew}>Commencer une analyse</Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {analyses.map(a => (
                <AnalysisCard
                  key={a.id}
                  analysis={a}
                  onClick={() => handleView(a)}
                  onDelete={() => setConfirmDelete(a)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-surface-card rounded-2xl border border-border shadow-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h3 className="text-center text-sm font-semibold text-text-primary mb-1">
              Supprimer cette analyse ?
            </h3>
            <p className="text-center text-xs text-text-muted mb-5">
              L'analyse et la vidéo associée seront supprimées définitivement.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-3 py-2 text-sm font-medium text-text-secondary bg-surface-dark/30 rounded-xl hover:bg-surface-dark/50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Analysis Form ───────────────────────────────────────────────────────────

function AnalysisForm({ form, setForm, videoBlob, setVideoBlob, onSave }) {
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Read file data into memory immediately via FileReader —
    // iOS Safari invalidates the File reference after the camera picker closes.
    // FileReader is more reliable than file.arrayBuffer() on older iOS versions.
    const reader = new FileReader()
    reader.onload = () => {
      const blob = new Blob([reader.result], { type: file.type || 'video/mp4' })
      setVideoBlob(blob)
    }
    reader.onerror = () => {
      // Fallback: use original file
      setVideoBlob(file)
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <div className="space-y-5">
      {/* Video capture */}
      <Card title="Vidéo">
        {!videoBlob ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  capture="environment"
                  onChange={handleVideoChange}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 border-dashed border-primary-300 bg-primary-50/30
                  hover:bg-primary-50/60 transition-colors text-sm font-medium text-primary-600 min-h-[56px]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  Filmer
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 border-dashed border-border bg-surface-dark/10
                  hover:bg-surface-dark/20 transition-colors text-sm font-medium text-text-secondary min-h-[56px]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  Importer
                </div>
              </label>
            </div>
            <p className="text-[0.65rem] text-text-muted">
              La vidéo est stockée localement sur votre appareil uniquement.
            </p>
          </div>
        ) : (
          <VideoPlayer
            videoBlob={videoBlob}
            onRemove={() => setVideoBlob(null)}
          />
        )}
      </Card>

      {/* Metadata */}
      <Card title="Informations">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => update('date', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-text-primary text-sm
                focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Vue</label>
            <select
              value={form.view}
              onChange={e => update('view', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-text-primary text-sm
                focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-all"
            >
              {VIEW_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Vitesse tapis (km/h)</label>
            <input
              type="number"
              value={form.speed}
              onChange={e => update('speed', e.target.value)}
              min={0} max={25} step={0.5}
              placeholder="Ex: 10"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-text-primary text-sm text-center
                focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-all
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Attaque de pied</label>
            <select
              value={form.footStrike}
              onChange={e => update('footStrike', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-text-primary text-sm
                focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-all"
            >
              <option value="">—</option>
              {FOOT_STRIKE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Cadence — tap-tempo */}
      <Card title="Cadence (pas/min)">
        <TapTempo
          value={form.cadence}
          onChange={(val) => update('cadence', val)}
        />
      </Card>

      {/* Criteria scoring */}
      <Card title="Observations qualitatives">
        <div className="space-y-4">
          {CRITERIA.map(c => (
            <SeverityScale
              key={c.key}
              label={c.label}
              description={c.description}
              value={form[c.key]}
              onChange={(val) => update(c.key, val)}
            />
          ))}
        </div>
      </Card>

      {/* Notes */}
      <Card title="Notes et recommandations">
        <textarea
          value={form.notes}
          onChange={e => update('notes', e.target.value)}
          placeholder="Observations complémentaires, recommandations pour le patient..."
          rows={4}
          className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-text-primary text-sm
            placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400
            transition-all resize-y min-h-[80px]"
        />
      </Card>

      {/* Save */}
      <div className="flex gap-3">
        <Button onClick={onSave} className="flex-1">
          Enregistrer l'analyse
        </Button>
      </div>
    </div>
  )
}

// ─── Video Player with speed controls ────────────────────────────────────────

function VideoPlayer({ videoBlob, onRemove }) {
  const videoRef = useRef(null)
  const [rate, setRate] = useState(1)
  const mimeType = videoBlob?.type || 'video/mp4'

  const objectUrl = useMemo(() => {
    if (!videoBlob) return null
    return URL.createObjectURL(videoBlob)
  }, [videoBlob])

  // Revoke URL on change or unmount
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  // Force video.load() after mount — required for iOS Safari
  useEffect(() => {
    if (objectUrl && videoRef.current) {
      videoRef.current.load()
    }
  }, [objectUrl])

  const changeRate = (newRate) => {
    if (!videoRef.current) return
    videoRef.current.playbackRate = newRate
    setRate(newRate)
  }

  const stepFrame = (direction) => {
    if (!videoRef.current) return
    videoRef.current.pause()
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime + (direction * (1 / 30)))
  }

  return (
    <div className="space-y-3">
      {/* Video with native controls — required for iOS Safari */}
      <div className="rounded-xl overflow-hidden bg-black">
        {objectUrl && (
          <video
            key={objectUrl}
            ref={videoRef}
            className="w-full max-h-[50vh] object-contain"
            controls
            playsInline
            preload="auto"
          >
            <source src={objectUrl} type={mimeType} />
            {/* Fallback without type for iOS compatibility */}
            <source src={objectUrl} />
          </video>
        )}
      </div>

      {/* Extra controls: frame-by-frame + speed */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => stepFrame(-1)}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-dark/20 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          title="Image précédente"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 0 1 0-1.953l7.108-4.062A1.125 1.125 0 0 1 21 8.688v8.123ZM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 0 1 0-1.953l7.108-4.062a1.125 1.125 0 0 1 1.683.977v8.123Z" />
          </svg>
        </button>

        <span className="text-[0.65rem] text-text-muted">Image</span>

        <button
          onClick={() => stepFrame(1)}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-dark/20 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          title="Image suivante"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 0 1 0 1.953l-7.108 4.062A1.125 1.125 0 0 1 3 16.81V8.688ZM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 0 1 0 1.953l-7.108 4.062a1.125 1.125 0 0 1-1.683-.977V8.688Z" />
          </svg>
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <span className="text-[0.65rem] text-text-muted">Vitesse</span>

        {PLAYBACK_RATES.map(r => (
          <button
            key={r}
            onClick={() => changeRate(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors min-h-[36px] ${
              rate === r
                ? 'bg-primary-500 text-white'
                : 'bg-surface-dark/10 text-text-secondary hover:bg-surface-dark/20'
            }`}
          >
            {r}x
          </button>
        ))}
      </div>

      {onRemove && (
        <button
          onClick={onRemove}
          className="text-xs text-text-muted hover:text-red-500 transition-colors py-2 min-h-[36px]"
        >
          Supprimer la vidéo
        </button>
      )}
    </div>
  )
}

// ─── Tap-Tempo Cadence Tool ──────────────────────────────────────────────────

function TapTempo({ value, onChange }) {
  const [taps, setTaps] = useState([])
  const [tapping, setTapping] = useState(false)
  const timeoutRef = useRef(null)

  const handleTap = useCallback(() => {
    const now = Date.now()
    setTaps(prev => {
      const newTaps = [...prev, now]
      // Keep only last 20 taps
      if (newTaps.length > 20) newTaps.shift()

      if (newTaps.length >= 4) {
        // Calculate average interval
        const intervals = []
        for (let i = 1; i < newTaps.length; i++) {
          intervals.push(newTaps[i] - newTaps[i - 1])
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
        const bpm = Math.round(60000 / avgInterval)
        // Running cadence is typically 140-210 spm
        if (bpm >= 100 && bpm <= 250) {
          onChange(bpm)
        }
      }
      return newTaps
    })

    setTapping(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setTapping(false), 3000)
  }, [onChange])

  const reset = () => {
    setTaps([])
    setTapping(false)
    onChange('')
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {/* Manual input */}
        <div className="flex-1">
          <input
            type="number"
            value={value}
            onChange={e => onChange(e.target.value ? Number(e.target.value) : '')}
            min={100} max={250}
            placeholder="Ex: 180"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-text-primary text-sm text-center
              focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-all
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Cadence display */}
        {value && (
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600" style={{ fontFamily: 'var(--font-heading)' }}>
              {value}
            </p>
            <p className="text-[0.6rem] text-text-muted">pas/min</p>
          </div>
        )}
      </div>

      {/* Tap button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleTap}
          className={`flex-1 py-4 rounded-xl text-sm font-bold transition-all min-h-[56px] ${
            tapping
              ? 'bg-primary-500 text-white scale-[0.98]'
              : 'bg-primary-50 text-primary-600 border-2 border-primary-200 hover:bg-primary-100'
          }`}
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {taps.length < 4
            ? `TAP (${taps.length}/4 min.)`
            : `TAP — ${value || '...'} pas/min`
          }
        </button>
        {taps.length > 0 && (
          <button
            onClick={reset}
            className="px-3 py-2 text-xs text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-dark/20 transition-colors min-h-[36px]"
          >
            Reset
          </button>
        )}
      </div>
      <p className="text-[0.65rem] text-text-muted">
        Tapez au rythme des pas du patient pendant la vidéo. Minimum 4 taps pour le calcul.
      </p>
    </div>
  )
}

// ─── Severity Scale (0-3) ────────────────────────────────────────────────────

function SeverityScale({ label, description, value, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-text-primary">{label}</p>
          {description && <p className="text-[0.65rem] text-text-muted">{description}</p>}
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${SEVERITY_BG[value]} ${SEVERITY_COLORS[value]}`}>
          {SEVERITY_LABELS[value]}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map(level => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={`py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[40px] ${
              value === level
                ? `${SEVERITY_BG[level]} ${SEVERITY_COLORS[level]} ring-2 ring-current/30`
                : 'bg-surface-dark/10 text-text-muted hover:bg-surface-dark/20'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Analysis Card (list item) ───────────────────────────────────────────────

function AnalysisCard({ analysis, onClick, onDelete }) {
  const a = analysis
  const dateLabel = a.date
    ? new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date inconnue'
  const viewLabel = a.view === 'posterior' ? 'Postérieure' : 'Sagittale'
  const maxSeverity = Math.max(a.overstride || 0, a.hipAdduction || 0, a.pelvicDrop || 0, a.verticalOscillation || 0)
  const severityColor = maxSeverity === 0 ? 'bg-emerald-500' : maxSeverity === 1 ? 'bg-amber-500' : maxSeverity === 2 ? 'bg-orange-500' : 'bg-red-500'

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-border/60 bg-surface-card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        {/* Severity indicator */}
        <div className={`w-2 h-12 rounded-full shrink-0 ${severityColor}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
              {dateLabel}
            </p>
            <span className="text-[0.6rem] px-2 py-0.5 rounded-full bg-surface-dark/10 text-text-muted font-medium">
              {viewLabel}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-text-secondary">
            {a.speed && <span>{a.speed} km/h</span>}
            {a.cadence && <span>{a.cadence} pas/min</span>}
            {a.footStrike && (
              <span>Attaque : {FOOT_STRIKE_OPTIONS.find(o => o.value === a.footStrike)?.label}</span>
            )}
          </div>

          {/* Mini severity summary */}
          <div className="flex gap-2 mt-2">
            {CRITERIA.map(c => (
              <span
                key={c.key}
                className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded ${SEVERITY_BG[a[c.key] || 0]} ${SEVERITY_COLORS[a[c.key] || 0]}`}
                title={c.label}
              >
                {c.label.split(' ')[0].slice(0, 4)} {a[c.key] || 0}
              </span>
            ))}
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="md:opacity-0 md:group-hover:opacity-100 p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Analysis Detail View ────────────────────────────────────────────────────

function AnalysisDetail({ analysis, videoBlob, onDelete }) {
  const a = analysis
  const dateLabel = a.date
    ? new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date inconnue'
  const viewLabel = a.view === 'posterior' ? 'Vue postérieure' : 'Vue sagittale'

  return (
    <div className="space-y-5">
      {/* Video player if available */}
      {videoBlob && (
        <Card title="Vidéo">
          <VideoPlayer videoBlob={videoBlob} />
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="text-text-muted text-xs">Date</span>
            <p className="font-semibold text-text-primary">{dateLabel}</p>
          </div>
          <div>
            <span className="text-text-muted text-xs">Vue</span>
            <p className="font-semibold text-text-primary">{viewLabel}</p>
          </div>
          {a.speed && (
            <div>
              <span className="text-text-muted text-xs">Vitesse</span>
              <p className="font-semibold text-text-primary">{a.speed} km/h</p>
            </div>
          )}
          {a.cadence && (
            <div>
              <span className="text-text-muted text-xs">Cadence</span>
              <p className="font-semibold text-text-primary">{a.cadence} pas/min</p>
            </div>
          )}
          {a.footStrike && (
            <div>
              <span className="text-text-muted text-xs">Attaque de pied</span>
              <p className="font-semibold text-text-primary">
                {FOOT_STRIKE_OPTIONS.find(o => o.value === a.footStrike)?.label}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Criteria results */}
      <Card title="Observations">
        <div className="space-y-3">
          {CRITERIA.map(c => {
            const val = a[c.key] || 0
            return (
              <div key={c.key} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-sm font-medium text-text-primary">{c.label}</p>
                  <p className="text-[0.65rem] text-text-muted">{c.description}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${SEVERITY_BG[val]} ${SEVERITY_COLORS[val]}`}>
                  {val}/3 — {SEVERITY_LABELS[val]}
                </span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Notes */}
      {a.notes && (
        <Card title="Notes">
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{a.notes}</p>
        </Card>
      )}

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="text-xs text-text-muted hover:text-red-500 transition-colors py-2 min-h-[36px]"
      >
        Supprimer cette analyse
      </button>
    </div>
  )
}
