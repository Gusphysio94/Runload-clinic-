-- RunLoad Clinic — Supabase PostgreSQL Schema
-- Exécuter dans l'éditeur SQL de Supabase Dashboard

-- ─── Patients ────────────────────────────────────────────────────────────────

create table patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  first_name text default '',
  last_name text default '',
  age integer,
  weight numeric,
  height numeric,
  level text default '',
  objective text default '',
  weekly_volume_ref numeric,
  fc_max integer,
  vma numeric,
  critical_speed numeric,
  intensity_reference text default 'fcmax',
  running_experience numeric,
  notes text default '',
  injuries jsonb default '[]',
  shoes jsonb default '[]',
  riegel_k numeric,
  d_prime numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table patients enable row level security;
create policy "Users manage own patients" on patients
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Sessions ────────────────────────────────────────────────────────────────

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  date date,
  distance numeric,
  duration numeric,
  elevation_gain numeric,
  session_type text default '',
  surface text default '',
  use_zones boolean default false,
  zones jsonb default '{}',
  rpe integer,
  fatigue integer,
  sleep_quality integer,
  has_pain boolean default false,
  pain_location text default '',
  pain_intensity integer,
  life_stress integer,
  mood integer,
  contextual_factors jsonb default '[]',
  contextual_note text default '',
  imported boolean default false,
  source text,
  avg_hr numeric,
  max_hr numeric,
  avg_cadence numeric,
  avg_pace numeric,
  strava_id bigint,
  created_at timestamptz default now()
);

alter table sessions enable row level security;
create policy "Users manage own sessions" on sessions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Wellness Logs ───────────────────────────────────────────────────────────

create table wellness_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  date date,
  fatigue integer,
  sleep_quality integer,
  has_pain boolean default false,
  pain_location text default '',
  pain_intensity integer,
  life_stress integer,
  mood integer,
  notes text default '',
  created_at timestamptz default now()
);

alter table wellness_logs enable row level security;
create policy "Users manage own wellness_logs" on wellness_logs
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Training Plans ──────────────────────────────────────────────────────────

create table training_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  plan_data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(patient_id)
);

alter table training_plans enable row level security;
create policy "Users manage own training_plans" on training_plans
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Clinical Notes ──────────────────────────────────────────────────────────

create table clinical_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  title text default '',
  content text default '',
  category text default '',
  date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table clinical_notes enable row level security;
create policy "Users manage own clinical_notes" on clinical_notes
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Index utiles ────────────────────────────────────────────────────────────

create index idx_patients_user on patients(user_id);
create index idx_sessions_patient on sessions(patient_id);
create index idx_sessions_user on sessions(user_id);
create index idx_notes_patient on clinical_notes(patient_id);
create index idx_wellness_patient on wellness_logs(patient_id);
create index idx_plans_patient on training_plans(patient_id);
