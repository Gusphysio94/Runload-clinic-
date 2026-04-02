import { upsertPatient, insertSession, insertWellnessLog, insertNote, upsertTrainingPlan } from './supabaseData'

const MIGRATION_FLAG = 'runload-clinic-migrated'

/**
 * Vérifie si une migration localStorage → Supabase est nécessaire.
 */
export function needsMigration() {
  if (localStorage.getItem(MIGRATION_FLAG)) return false
  const raw = localStorage.getItem('runload-clinic')
  if (!raw) return false
  try {
    const data = JSON.parse(raw)
    return data.patients && Object.keys(data.patients).length > 0
  } catch {
    return false
  }
}

/**
 * Migre les données localStorage vers Supabase.
 * Utilise upsert pour être idempotent en cas de retry.
 */
export async function migrateToCloud(userId) {
  const raw = localStorage.getItem('runload-clinic')
  if (!raw) return

  let data
  try {
    data = JSON.parse(raw)
  } catch {
    return
  }

  if (!data.patients) return

  const entries = Object.entries(data.patients)
  let migrated = 0

  for (const [patientId, patientData] of entries) {
    const info = patientData.info
    if (!info) continue

    // Patient
    await upsertPatient(userId, { ...info, id: patientId })

    // Sessions
    const sessions = patientData.sessions || []
    for (const session of sessions) {
      await insertSession(userId, patientId, session)
    }

    // Wellness logs
    const logs = patientData.wellnessLogs || []
    for (const log of logs) {
      await insertWellnessLog(userId, patientId, log)
    }

    // Clinical notes
    const notes = patientData.clinicalNotes || []
    for (const note of notes) {
      await insertNote(userId, patientId, note)
    }

    // Training plan
    if (patientData.trainingPlan) {
      await upsertTrainingPlan(userId, patientId, patientData.trainingPlan)
    }

    migrated++
  }

  if (migrated > 0) {
    localStorage.setItem(MIGRATION_FLAG, 'true')
  }

  return migrated
}
