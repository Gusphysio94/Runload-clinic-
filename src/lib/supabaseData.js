import { supabase } from './supabase'

function requireSupabase() {
  if (!supabase) throw new Error('Supabase not configured')
}

// ─── Mapping camelCase ↔ snake_case ──────────────────────────────────────────

const patientToRow = (p, userId) => ({
  id: p.id,
  user_id: userId,
  first_name: p.firstName || '',
  last_name: p.lastName || '',
  age: p.age || null,
  weight: p.weight || null,
  height: p.height || null,
  level: p.level || '',
  objective: p.objective || '',
  weekly_volume_ref: p.weeklyVolumeRef || null,
  fc_max: p.fcMax || null,
  vma: p.vma || null,
  critical_speed: p.criticalSpeed || null,
  intensity_reference: p.intensityReference || 'fcmax',
  running_experience: p.runningExperience || null,
  notes: p.notes || '',
  injuries: p.injuries || [],
  shoes: p.shoes || [],
  riegel_k: p.riegelK || null,
  d_prime: p.dPrime || null,
})

const rowToPatient = (r) => ({
  id: r.id,
  firstName: r.first_name || '',
  lastName: r.last_name || '',
  age: r.age,
  weight: r.weight,
  height: r.height,
  level: r.level || '',
  objective: r.objective || '',
  weeklyVolumeRef: r.weekly_volume_ref,
  fcMax: r.fc_max,
  vma: r.vma,
  criticalSpeed: r.critical_speed,
  intensityReference: r.intensity_reference || 'fcmax',
  runningExperience: r.running_experience,
  notes: r.notes || '',
  injuries: r.injuries || [],
  shoes: r.shoes || [],
  riegelK: r.riegel_k,
  dPrime: r.d_prime,
})

const sessionToRow = (s, userId, patientId) => ({
  id: s.id,
  user_id: userId,
  patient_id: patientId,
  date: s.date || null,
  distance: s.distance || null,
  duration: s.duration || null,
  elevation_gain: s.elevationGain || null,
  session_type: s.sessionType || '',
  surface: s.surface || '',
  use_zones: s.useZones || false,
  zones: s.zones || {},
  rpe: s.rpe || null,
  fatigue: s.fatigue || null,
  sleep_quality: s.sleepQuality || null,
  has_pain: s.hasPain || false,
  pain_location: s.painLocation || '',
  pain_intensity: s.painIntensity || null,
  life_stress: s.lifeStress || null,
  mood: s.mood || null,
  contextual_factors: s.contextualFactors || [],
  contextual_note: s.contextualNote || '',
  imported: s._imported || false,
  source: s._source || null,
  avg_hr: s._avgHR || null,
  max_hr: s._maxHR || null,
  avg_cadence: s._avgCadence || null,
  avg_pace: s._avgPace || null,
  strava_id: s._stravaId || null,
  created_at: s.createdAt || new Date().toISOString(),
})

const rowToSession = (r) => ({
  id: r.id,
  date: r.date,
  distance: r.distance,
  duration: r.duration,
  elevationGain: r.elevation_gain,
  sessionType: r.session_type || '',
  surface: r.surface || '',
  useZones: r.use_zones || false,
  zones: r.zones || {},
  rpe: r.rpe,
  fatigue: r.fatigue,
  sleepQuality: r.sleep_quality,
  hasPain: r.has_pain || false,
  painLocation: r.pain_location || '',
  painIntensity: r.pain_intensity,
  lifeStress: r.life_stress,
  mood: r.mood,
  contextualFactors: r.contextual_factors || [],
  contextualNote: r.contextual_note || '',
  _imported: r.imported || false,
  _source: r.source,
  _avgHR: r.avg_hr,
  _maxHR: r.max_hr,
  _avgCadence: r.avg_cadence,
  _avgPace: r.avg_pace,
  _stravaId: r.strava_id,
  createdAt: r.created_at,
})

const noteToRow = (n, userId, patientId) => ({
  id: n.id,
  user_id: userId,
  patient_id: patientId,
  title: n.title || '',
  content: n.content || '',
  category: n.category || '',
  date: n.date || null,
  created_at: n.createdAt || new Date().toISOString(),
})

const rowToNote = (r) => ({
  id: r.id,
  title: r.title || '',
  content: r.content || '',
  category: r.category || '',
  date: r.date || null,
  createdAt: r.created_at,
})

const wellnessToRow = (w, userId, patientId) => ({
  id: w.id,
  user_id: userId,
  patient_id: patientId,
  date: w.date || null,
  fatigue: w.fatigue || null,
  sleep_quality: w.sleepQuality || null,
  has_pain: w.hasPain || false,
  pain_location: w.painLocation || '',
  pain_intensity: w.painIntensity || null,
  life_stress: w.lifeStress || null,
  mood: w.mood || null,
  notes: w.notes || '',
  created_at: w.createdAt || new Date().toISOString(),
})

const rowToWellness = (r) => ({
  id: r.id,
  date: r.date,
  fatigue: r.fatigue,
  sleepQuality: r.sleep_quality,
  hasPain: r.has_pain || false,
  painLocation: r.pain_location || '',
  painIntensity: r.pain_intensity,
  lifeStress: r.life_stress,
  mood: r.mood,
  notes: r.notes || '',
  createdAt: r.created_at,
})

// ─── Fetch all data for a user ───────────────────────────────────────────────

export async function fetchAllData(userId) {
  requireSupabase()
  const [patientsRes, sessionsRes, notesRes, wellnessRes, plansRes] = await Promise.all([
    supabase.from('patients').select('*').eq('user_id', userId),
    supabase.from('sessions').select('*').eq('user_id', userId),
    supabase.from('clinical_notes').select('*').eq('user_id', userId),
    supabase.from('wellness_logs').select('*').eq('user_id', userId),
    supabase.from('training_plans').select('*').eq('user_id', userId),
  ])

  // Check for auth errors
  for (const res of [patientsRes, sessionsRes, notesRes, wellnessRes, plansRes]) {
    if (res.error) throw new Error(res.error.message)
  }

  // Assemble into the store shape: { patients: { [id]: { info, sessions, ... } }, activePatientId }
  const patients = {}

  for (const row of patientsRes.data) {
    patients[row.id] = {
      info: rowToPatient(row),
      sessions: [],
      wellnessLogs: [],
      trainingPlan: null,
      clinicalNotes: [],
    }
  }

  for (const row of sessionsRes.data) {
    if (patients[row.patient_id]) {
      patients[row.patient_id].sessions.push(rowToSession(row))
    }
  }

  for (const row of notesRes.data) {
    if (patients[row.patient_id]) {
      patients[row.patient_id].clinicalNotes.push(rowToNote(row))
    }
  }

  for (const row of wellnessRes.data) {
    if (patients[row.patient_id]) {
      patients[row.patient_id].wellnessLogs.push(rowToWellness(row))
    }
  }

  for (const row of plansRes.data) {
    if (patients[row.patient_id]) {
      patients[row.patient_id].trainingPlan = row.plan_data
    }
  }

  const patientIds = Object.keys(patients)
  return {
    patients,
    activePatientId: patientIds[0] || null,
  }
}

// ─── Patient CRUD ────────────────────────────────────────────────────────────

export async function upsertPatient(userId, patient) {
  requireSupabase()
  const { error } = await supabase
    .from('patients')
    .upsert(patientToRow(patient, userId))
  if (error) throw error
}

export async function deletePatientRow(patientId) {
  requireSupabase()
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', patientId)
  if (error) throw error
}

// ─── Session CRUD ────────────────────────────────────────────────────────────

export async function insertSession(userId, patientId, session) {
  requireSupabase()
  const { error } = await supabase
    .from('sessions')
    .upsert(sessionToRow(session, userId, patientId))
  if (error) throw error
}

export async function updateSessionRow(sessionId, updates, userId, patientId) {
  requireSupabase()
  const row = sessionToRow({ id: sessionId, ...updates }, userId, patientId)
  const { error } = await supabase
    .from('sessions')
    .update(row)
    .eq('id', sessionId)
  if (error) throw error
}

export async function deleteSessionRow(sessionId) {
  requireSupabase()
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId)
  if (error) throw error
}

// ─── Clinical Notes CRUD ─────────────────────────────────────────────────────

export async function insertNote(userId, patientId, note) {
  requireSupabase()
  const { error } = await supabase
    .from('clinical_notes')
    .upsert(noteToRow(note, userId, patientId))
  if (error) throw error
}

export async function updateNoteRow(noteId, updates, userId, patientId) {
  requireSupabase()
  const row = noteToRow({ id: noteId, ...updates }, userId, patientId)
  const { error } = await supabase
    .from('clinical_notes')
    .update(row)
    .eq('id', noteId)
  if (error) throw error
}

export async function deleteNoteRow(noteId) {
  requireSupabase()
  const { error } = await supabase
    .from('clinical_notes')
    .delete()
    .eq('id', noteId)
  if (error) throw error
}

// ─── Wellness Logs CRUD ──────────────────────────────────────────────────────

export async function insertWellnessLog(userId, patientId, log) {
  requireSupabase()
  const { error } = await supabase
    .from('wellness_logs')
    .upsert(wellnessToRow(log, userId, patientId))
  if (error) throw error
}

export async function updateWellnessRow(logId, updates, userId, patientId) {
  requireSupabase()
  const row = wellnessToRow({ id: logId, ...updates }, userId, patientId)
  const { error } = await supabase
    .from('wellness_logs')
    .update(row)
    .eq('id', logId)
  if (error) throw error
}

// ─── Training Plan ───────────────────────────────────────────────────────────

export async function upsertTrainingPlan(userId, patientId, planData) {
  requireSupabase()
  const { error } = await supabase
    .from('training_plans')
    .upsert({
      user_id: userId,
      patient_id: patientId,
      plan_data: planData,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'patient_id' })
  if (error) throw error
}

export async function deleteTrainingPlan(patientId) {
  requireSupabase()
  const { error } = await supabase
    .from('training_plans')
    .delete()
    .eq('patient_id', patientId)
  if (error) throw error
}
