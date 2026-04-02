import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { fetchAllData, upsertPatient, deletePatientRow, insertSession, updateSessionRow, deleteSessionRow, insertNote, updateNoteRow, deleteNoteRow, insertWellnessLog, updateWellnessRow, upsertTrainingPlan, deleteTrainingPlan } from '../lib/supabaseData'
import { needsMigration, migrateToCloud } from '../lib/migration'

const STORAGE_KEY = 'runload-clinic'

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

function saveToStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ─── Migration depuis l'ancien format mono-patient ───────────────────────────

function migrateFromLegacy(data) {
  if (data.patients && data.activePatientId !== undefined) return data

  if (data.patient || data.sessions) {
    const patientId = crypto.randomUUID()
    const patients = {}

    if (data.patient) {
      patients[patientId] = {
        info: { ...data.patient, id: patientId },
        sessions: data.sessions || [],
        wellnessLogs: data.wellnessLogs || [],
        trainingPlan: data.trainingPlan || null,
        clinicalNotes: data.clinicalNotes || [],
      }
    }

    return {
      patients,
      activePatientId: data.patient ? patientId : null,
    }
  }

  return DEFAULT_STATE
}

const DEFAULT_STATE = {
  patients: {},
  activePatientId: null,
}

// ─── Background sync helper ─────────────────────────────────────────────────

function sync(promise) {
  promise.catch(err => console.error('[Supabase sync]', err))
}

// ─── Hook principal ──────────────────────────────────────────────────────────

export function useStore(user) {
  const userId = user?.id
  const [state, setState] = useState(() => {
    const raw = loadFromStorage()
    return raw ? migrateFromLegacy(raw) : DEFAULT_STATE
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const hasFetched = useRef(false)

  // ─── Fetch from Supabase on mount ─────────────────────────────────────

  useEffect(() => {
    if (!userId || hasFetched.current) return
    hasFetched.current = true

    const load = async () => {
      try {
        // Check if we need to migrate localStorage data first
        if (needsMigration()) {
          await migrateToCloud(userId)
        }

        const cloudData = await fetchAllData(userId)
        if (cloudData && Object.keys(cloudData.patients).length > 0) {
          setState(prev => ({
            ...cloudData,
            activePatientId: cloudData.activePatientId || prev.activePatientId,
          }))
        }
      } catch (err) {
        console.error('[Supabase fetch]', err)
        // Falls back to localStorage data already in state
      } finally {
        setIsLoaded(true)
      }
    }

    load()
  }, [userId])

  // ─── Persist to localStorage ──────────────────────────────────────────

  useEffect(() => {
    saveToStorage(state)
  }, [state])

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const activeData = useMemo(() => {
    if (!state.activePatientId || !state.patients[state.activePatientId]) {
      return { info: null, sessions: [], wellnessLogs: [], trainingPlan: null, clinicalNotes: [] }
    }
    return state.patients[state.activePatientId]
  }, [state])

  // ─── Gestion des patients ────────────────────────────────────────────────

  const patientsList = useMemo(() => {
    return Object.values(state.patients).map(p => p.info).filter(Boolean)
  }, [state.patients])

  const patientSummaries = useMemo(() => {
    return Object.entries(state.patients).map(([_id, data]) => {
      const sessions = data.sessions || []
      const sorted = sessions.length > 0
        ? [...sessions].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        : []
      return {
        ...data.info,
        sessionCount: sessions.length,
        lastSessionDate: sorted[0]?.date || null,
        noteCount: (data.clinicalNotes || []).length,
      }
    }).filter(p => p.id)
  }, [state.patients])

  const setActivePatient = useCallback((patientId) => {
    setState(prev => ({ ...prev, activePatientId: patientId }))
  }, [])

  const addPatient = useCallback((patientInfo) => {
    const id = crypto.randomUUID()
    const info = { ...patientInfo, id }
    setState(prev => ({
      ...prev,
      patients: {
        ...prev.patients,
        [id]: { info, sessions: [], wellnessLogs: [], trainingPlan: null, clinicalNotes: [] },
      },
      activePatientId: id,
    }))
    if (userId) sync(upsertPatient(userId, info))
    return id
  }, [userId])

  const deletePatient = useCallback((patientId) => {
    setState(prev => {
      const { [patientId]: _, ...rest } = prev.patients
      const remainingIds = Object.keys(rest)
      return {
        ...prev,
        patients: rest,
        activePatientId: prev.activePatientId === patientId
          ? (remainingIds[0] || null)
          : prev.activePatientId,
      }
    })
    if (userId) sync(deletePatientRow(patientId))
  }, [userId])

  // ─── Patient actif (API compatible avec l'ancien format) ─────────────────

  const setPatient = useCallback((patient) => {
    setState(prev => {
      if (prev.activePatientId && prev.patients[prev.activePatientId]) {
        const updated = { ...patient, id: prev.activePatientId }
        if (userId) sync(upsertPatient(userId, updated))
        return {
          ...prev,
          patients: {
            ...prev.patients,
            [prev.activePatientId]: {
              ...prev.patients[prev.activePatientId],
              info: updated,
            },
          },
        }
      }
      const id = patient.id || crypto.randomUUID()
      const info = { ...patient, id }
      if (userId) sync(upsertPatient(userId, info))
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [id]: {
            info,
            sessions: [],
            wellnessLogs: [],
            trainingPlan: null,
            clinicalNotes: [],
          },
        },
        activePatientId: id,
      }
    })
  }, [userId])

  const updatePatient = useCallback((updates) => {
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]) return prev
      const updated = { ...prev.patients[pid].info, ...updates }
      if (userId) sync(upsertPatient(userId, updated))
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [pid]: {
            ...prev.patients[pid],
            info: updated,
          },
        },
      }
    })
  }, [userId])

  // ─── Sessions (scoped au patient actif) ──────────────────────────────────

  const addSession = useCallback((session) => {
    const newSession = {
      ...session,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]) return prev
      if (userId) sync(insertSession(userId, pid, newSession))
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [pid]: {
            ...prev.patients[pid],
            sessions: [...prev.patients[pid].sessions, newSession],
          },
        },
      }
    })
    return newSession
  }, [userId])

  const updateSession = useCallback((id, updates) => {
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]) return prev
      const existing = prev.patients[pid].sessions.find(s => s.id === id)
      if (existing && userId) {
        sync(updateSessionRow(id, { ...existing, ...updates }, userId, pid))
      }
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [pid]: {
            ...prev.patients[pid],
            sessions: prev.patients[pid].sessions.map(s =>
              s.id === id ? { ...s, ...updates } : s
            ),
          },
        },
      }
    })
  }, [userId])

  const deleteSession = useCallback((id) => {
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]) return prev
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [pid]: {
            ...prev.patients[pid],
            sessions: prev.patients[pid].sessions.filter(s => s.id !== id),
          },
        },
      }
    })
    if (userId) sync(deleteSessionRow(id))
  }, [userId])

  // ─── Wellness Logs (scoped au patient actif) ─────────────────────────────

  const addWellnessLog = useCallback((log) => {
    const newLog = {
      ...log,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]) return prev
      if (userId) sync(insertWellnessLog(userId, pid, newLog))
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [pid]: {
            ...prev.patients[pid],
            wellnessLogs: [...prev.patients[pid].wellnessLogs, newLog],
          },
        },
      }
    })
    return newLog
  }, [userId])

  const updateWellnessLog = useCallback((id, updates) => {
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]) return prev
      const existing = prev.patients[pid].wellnessLogs.find(l => l.id === id)
      if (existing && userId) {
        sync(updateWellnessRow(id, { ...existing, ...updates }, userId, pid))
      }
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [pid]: {
            ...prev.patients[pid],
            wellnessLogs: prev.patients[pid].wellnessLogs.map(l =>
              l.id === id ? { ...l, ...updates } : l
            ),
          },
        },
      }
    })
  }, [userId])

  // ─── Notes cliniques (scoped au patient actif) ──────────────────────────

  const addClinicalNote = useCallback((note) => {
    const newNote = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]) return prev
      if (userId) sync(insertNote(userId, pid, newNote))
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [pid]: {
            ...prev.patients[pid],
            clinicalNotes: [...(prev.patients[pid].clinicalNotes || []), newNote],
          },
        },
      }
    })
    return newNote
  }, [userId])

  const updateClinicalNote = useCallback((id, updates) => {
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]) return prev
      const existing = (prev.patients[pid].clinicalNotes || []).find(n => n.id === id)
      if (existing && userId) {
        sync(updateNoteRow(id, { ...existing, ...updates }, userId, pid))
      }
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [pid]: {
            ...prev.patients[pid],
            clinicalNotes: (prev.patients[pid].clinicalNotes || []).map(n =>
              n.id === id ? { ...n, ...updates } : n
            ),
          },
        },
      }
    })
  }, [userId])

  const deleteClinicalNote = useCallback((id) => {
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]) return prev
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [pid]: {
            ...prev.patients[pid],
            clinicalNotes: (prev.patients[pid].clinicalNotes || []).filter(n => n.id !== id),
          },
        },
      }
    })
    if (userId) sync(deleteNoteRow(id))
  }, [userId])

  // ─── Training Plan (scoped au patient actif) ─────────────────────────────

  const setTrainingPlan = useCallback((plan) => {
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]) return prev
      if (userId) sync(upsertTrainingPlan(userId, pid, plan))
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [pid]: {
            ...prev.patients[pid],
            trainingPlan: plan,
          },
        },
      }
    })
  }, [userId])

  const clearTrainingPlan = useCallback(() => {
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]) return prev
      if (userId) sync(deleteTrainingPlan(pid))
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [pid]: {
            ...prev.patients[pid],
            trainingPlan: null,
          },
        },
      }
    })
  }, [userId])

  // ─── Suivi complétion du plan ──────────────────────────────────────────

  const markPlanSessionDone = useCallback((planSessionId, linkedSessionId = null) => {
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]?.trainingPlan) return prev
      const plan = prev.patients[pid].trainingPlan
      const updated = {
        ...plan,
        completedSessions: {
          ...(plan.completedSessions || {}),
          [planSessionId]: {
            done: true,
            linkedSessionId,
            completedAt: new Date().toISOString(),
          },
        },
      }
      if (userId) sync(upsertTrainingPlan(userId, pid, updated))
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [pid]: {
            ...prev.patients[pid],
            trainingPlan: updated,
          },
        },
      }
    })
  }, [userId])

  const updatePlanSession = useCallback((planSessionId, updates) => {
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]?.trainingPlan) return prev
      const plan = prev.patients[pid].trainingPlan
      const updatedWeeks = plan.weeks.map(week => ({
        ...week,
        sessions: week.sessions.map(s =>
          s.id === planSessionId ? { ...s, ...updates } : s
        ),
      }))
      // Recalculate week totals
      for (const week of updatedWeeks) {
        week.totalVolume = week.sessions.reduce((sum, s) => sum + (s.estimatedDistance || 0), 0)
        week.totalDuration = week.sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
      }
      const updated = { ...plan, weeks: updatedWeeks }
      if (userId) sync(upsertTrainingPlan(userId, pid, updated))
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [pid]: {
            ...prev.patients[pid],
            trainingPlan: updated,
          },
        },
      }
    })
  }, [userId])

  const deletePlanSession = useCallback((planSessionId) => {
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]?.trainingPlan) return prev
      const plan = prev.patients[pid].trainingPlan
      const updatedWeeks = plan.weeks.map(week => ({
        ...week,
        sessions: week.sessions.filter(s => s.id !== planSessionId),
      }))
      for (const week of updatedWeeks) {
        week.totalVolume = week.sessions.reduce((sum, s) => sum + (s.estimatedDistance || 0), 0)
        week.totalDuration = week.sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
      }
      const { [planSessionId]: _, ...restCompleted } = (plan.completedSessions || {})
      const updated = { ...plan, weeks: updatedWeeks, completedSessions: restCompleted }
      if (userId) sync(upsertTrainingPlan(userId, pid, updated))
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [pid]: {
            ...prev.patients[pid],
            trainingPlan: updated,
          },
        },
      }
    })
  }, [userId])

  const unmarkPlanSessionDone = useCallback((planSessionId) => {
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]?.trainingPlan) return prev
      const plan = prev.patients[pid].trainingPlan
      const { [planSessionId]: _, ...rest } = (plan.completedSessions || {})
      const updated = { ...plan, completedSessions: rest }
      if (userId) sync(upsertTrainingPlan(userId, pid, updated))
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [pid]: {
            ...prev.patients[pid],
            trainingPlan: updated,
          },
        },
      }
    })
  }, [userId])

  // ─── API publique ────────────────────────────────────────────────────────

  return {
    // Données du patient actif (rétrocompatible)
    patient: activeData.info,
    sessions: activeData.sessions,
    wellnessLogs: activeData.wellnessLogs,
    trainingPlan: activeData.trainingPlan,
    clinicalNotes: activeData.clinicalNotes || [],

    // Gestion multi-patients
    patientsList,
    patientSummaries,
    activePatientId: state.activePatientId,
    setActivePatient,
    addPatient,
    deletePatient,

    // Actions patient actif
    setPatient,
    updatePatient,
    addSession,
    updateSession,
    deleteSession,
    addWellnessLog,
    updateWellnessLog,
    addClinicalNote,
    updateClinicalNote,
    deleteClinicalNote,
    setTrainingPlan,
    clearTrainingPlan,
    markPlanSessionDone,
    unmarkPlanSessionDone,
    updatePlanSession,
    deletePlanSession,

    // État de chargement
    isLoaded,
  }
}
