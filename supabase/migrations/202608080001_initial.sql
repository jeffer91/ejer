-- Fitness Jeff v1: esquema mínimo, seguro y multiusuario.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.body_records (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_kg numeric(5,2) not null check (weight_kg between 25 and 300),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists public.measurements (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  waist_cm numeric(5,2), chest_cm numeric(5,2), arm_cm numeric(5,2), hip_cm numeric(5,2),
  created_at timestamptz not null, updated_at timestamptz not null, deleted_at timestamptz
);

create table if not exists public.workout_plans (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null, updated_at timestamptz not null, deleted_at timestamptz
);

create table if not exists public.workout_sessions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  duration_minutes integer not null default 0 check (duration_minutes between 0 and 600),
  completed_at timestamptz not null,
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamptz not null, updated_at timestamptz not null, deleted_at timestamptz
);

create table if not exists public.hydration_logs (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_ml integer not null check (amount_ml between 1 and 5000),
  logged_at timestamptz not null,
  created_at timestamptz not null, updated_at timestamptz not null, deleted_at timestamptz
);

create table if not exists public.schedule_logs (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null, updated_at timestamptz not null, deleted_at timestamptz
);

create table if not exists public.recommendations (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'general',
  content text not null,
  created_at timestamptz not null, updated_at timestamptz not null, deleted_at timestamptz
);

create table if not exists public.user_settings (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null, updated_at timestamptz not null, deleted_at timestamptz
);

do $$
declare t text;
begin
  foreach t in array array['profiles','body_records','measurements','workout_plans','workout_sessions','hydration_logs','schedule_logs','recommendations','user_settings']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own_rows_select" on public.%I', t);
    execute format('drop policy if exists "own_rows_insert" on public.%I', t);
    execute format('drop policy if exists "own_rows_update" on public.%I', t);
    execute format('drop policy if exists "own_rows_delete" on public.%I', t);
    execute format('create policy "own_rows_select" on public.%I for select using (auth.uid() = user_id)', t);
    execute format('create policy "own_rows_insert" on public.%I for insert with check (auth.uid() = user_id)', t);
    execute format('create policy "own_rows_update" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('create policy "own_rows_delete" on public.%I for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;

create index if not exists body_records_user_updated_idx on public.body_records(user_id, updated_at desc);
create index if not exists measurements_user_updated_idx on public.measurements(user_id, updated_at desc);
create index if not exists workout_sessions_user_completed_idx on public.workout_sessions(user_id, completed_at desc);
create index if not exists hydration_logs_user_logged_idx on public.hydration_logs(user_id, logged_at desc);
create index if not exists recommendations_user_updated_idx on public.recommendations(user_id, updated_at desc);
