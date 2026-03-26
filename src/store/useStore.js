import { useState, useCallback, useEffect, useMemo } from 'react'

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
  // Déjà au nouveau format
  if (data.patients && data.activePatientId !== undefined) return data

  // Ancien format : { patient, sessions, wellnessLogs, trainingPlan }
  if (data.patient || data.sessions) {
    const patientId = crypto.randomUUID()
    const patients = {}

    if (data.patient) {
      patients[patientId] = {
        info: { ...data.patient, id: patientId },
        sessions: data.sessions || [],
        wellnessLogs: data.wellnessLogs || [],
        trainingPlan: data.trainingPlan || null,
      }
    }

    return {
      patients,
      activePatientId: data.patient ? patientId : null,
    }
  }

  return DEFAULT_STATE
}

// ─── State par défaut ────────────────────────────────────────────────────────

const DEFAULT_STATE = {
  patients: {},
  activePatientId: null,
}

// ─── Hook principal ──────────────────────────────────────────────────────────

export function useStore() {
  const [state, setState] = useState(() => {
    const raw = loadFromStorage()
    return raw ? migrateFromLegacy(raw) : DEFAULT_STATE
  })

  useEffect(() => {
    saveToStorage(state)
  }, [state])

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const activeData = useMemo(() => {
    if (!state.activePatientId || !state.patients[state.activePatientId]) {
      return { info: null, sessions: [], wellnessLogs: [], trainingPlan: null }
    }
    return state.patients[state.activePatientId]
  }, [state])

  // ─── Gestion des patients ────────────────────────────────────────────────

  const patientsList = useMemo(() => {
    return Object.values(state.patients).map(p => p.info).filter(Boolean)
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
        [id]: { info, sessions: [], wellnessLogs: [], trainingPlan: null },
      },
      activePatientId: id,
    }))
    return id
  }, [])

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
  }, [])

  // ─── Patient actif (API compatible avec l'ancien format) ─────────────────

  const setPatient = useCallback((patient) => {
    setState(prev => {
      if (prev.activePatientId && prev.patients[prev.activePatientId]) {
        // Mettre à jour le patient actif
        return {
          ...prev,
          patients: {
            ...prev.patients,
            [prev.activePatientId]: {
              ...prev.patients[prev.activePatientId],
              info: { ...patient, id: prev.activePatientId },
            },
          },
        }
      }
      // Pas de patient actif → en créer un
      const id = patient.id || crypto.randomUUID()
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [id]: {
            info: { ...patient, id },
            sessions: [],
            wellnessLogs: [],
            trainingPlan: null,
          },
        },
        activePatientId: id,
      }
    })
  }, [])

  const updatePatient = useCallback((updates) => {
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]) return prev
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [pid]: {
            ...prev.patients[pid],
            info: { ...prev.patients[pid].info, ...updates },
          },
        },
      }
    })
  }, [])

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
  }, [])

  const updateSession = useCallback((id, updates) => {
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]) return prev
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
  }, [])

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
  }, [])

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
  }, [])

  const updateWellnessLog = useCallback((id, updates) => {
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]) return prev
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
  }, [])

  // ─── Training Plan (scoped au patient actif) ─────────────────────────────

  const setTrainingPlan = useCallback((plan) => {
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]) return prev
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
  }, [])

  const clearTrainingPlan = useCallback(() => {
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]) return prev
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
  }, [])

  // ─── Suivi complétion du plan ──────────────────────────────────────────

  const markPlanSessionDone = useCallback((planSessionId, linkedSessionId = null) => {
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]?.trainingPlan) return prev
      const plan = prev.patients[pid].trainingPlan
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [pid]: {
            ...prev.patients[pid],
            trainingPlan: {
              ...plan,
              completedSessions: {
                ...(plan.completedSessions || {}),
                [planSessionId]: {
                  done: true,
                  linkedSessionId,
                  completedAt: new Date().toISOString(),
                },
              },
            },
          },
        },
      }
    })
  }, [])

  const unmarkPlanSessionDone = useCallback((planSessionId) => {
    setState(prev => {
      const pid = prev.activePatientId
      if (!pid || !prev.patients[pid]?.trainingPlan) return prev
      const plan = prev.patients[pid].trainingPlan
      const { [planSessionId]: _, ...rest } = (plan.completedSessions || {})
      return {
        ...prev,
        patients: {
          ...prev.patients,
          [pid]: {
            ...prev.patients[pid],
            trainingPlan: {
              ...plan,
              completedSessions: rest,
            },
          },
        },
      }
    })
  }, [])

  // ─── API publique ────────────────────────────────────────────────────────

  return {
    // Données du patient actif (rétrocompatible)
    patient: activeData.info,
    sessions: activeData.sessions,
    wellnessLogs: activeData.wellnessLogs,
    trainingPlan: activeData.trainingPlan,

    // Gestion multi-patients
    patientsList,
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
    setTrainingPlan,
    clearTrainingPlan,
    markPlanSessionDone,
    unmarkPlanSessionDone,
  }
}
