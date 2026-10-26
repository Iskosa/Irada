-- =======================================================
-- СХЕМА ТАБЛИЦ ДЛЯ СИНХРОНИЗАЦИИ IRADA ЧЕРЕЗ SUPABASE
-- Скопируйте и выполните этот скрипт в Supabase SQL Editor
-- =======================================================

-- 1. Таблица задач
create table if not exists public.irada_tasks (
  id text primary key,
  sync_key text not null default 'my-personal-hq',
  title text not null,
  weight text not null default 'unassigned',
  status text not null default 'inbox',
  scheduled_hour integer,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at timestamptz not null default now()
);

-- 2. Таблица состояния приложения (режим "Нет сил", черновик)
create table if not exists public.irada_app_state (
  sync_key text primary key default 'my-personal-hq',
  low_energy_mode boolean not null default false,
  scratchpad text not null default '',
  updated_at timestamptz not null default now()
);

-- 3. Включение Realtime (мгновенная передача между телефоном и ПК)
alter publication supabase_realtime add table public.irada_tasks;
alter publication supabase_realtime add table public.irada_app_state;

-- 4. Политики безопасности (Row Level Security для анонимного ключа)
alter table public.irada_tasks enable row level security;
alter table public.irada_app_state enable row level security;

-- Разрешаем чтение и запись с публичным анонимным ключом (anon key)
drop policy if exists "Allow anon all on irada_tasks" on public.irada_tasks;
create policy "Allow anon all on irada_tasks"
  on public.irada_tasks
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow anon all on irada_app_state" on public.irada_app_state;
create policy "Allow anon all on irada_app_state"
  on public.irada_app_state
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- Индекс для быстрого поиска по sync_key
create index if not exists idx_irada_tasks_sync_key on public.irada_tasks (sync_key);

