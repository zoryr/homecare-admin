-- Phase 2.10 — Horaires du bureau (widget temps réel côté app).

create table if not exists public.horaires_config (
  id uuid primary key default gen_random_uuid(),
  jour_semaine int not null check (jour_semaine between 0 and 6), -- 0=dim … 6=sam
  ouvert boolean not null default true,
  matin_debut time,
  matin_fin time,
  apres_midi_debut time,
  apres_midi_fin time,
  actif boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (jour_semaine)
);

insert into public.horaires_config
  (jour_semaine, ouvert, matin_debut, matin_fin, apres_midi_debut, apres_midi_fin)
values
  (1, true, '09:00', '13:00', '14:00', '18:00'),
  (2, true, '09:00', '13:00', '14:00', '18:00'),
  (3, true, '09:00', '13:00', '14:00', '18:00'),
  (4, true, '09:00', '13:00', '14:00', '18:00'),
  (5, true, '09:00', '13:00', '14:00', '18:00'),
  (0, false, null, null, null, null),
  (6, false, null, null, null, null)
on conflict (jour_semaine) do nothing;

create table if not exists public.horaires_exceptions (
  id uuid primary key default gen_random_uuid(),
  date_debut date not null,
  date_fin date not null,
  raison text,
  cree_par uuid not null references auth.users(id),
  cree_le timestamptz not null default now(),
  check (date_fin >= date_debut)
);

create index if not exists horaires_exceptions_dates_idx
  on public.horaires_exceptions (date_debut, date_fin);

alter table public.horaires_config enable row level security;
alter table public.horaires_exceptions enable row level security;

create policy "active_users_read_horaires_config"
  on public.horaires_config for select
  using (exists (select 1 from public.profiles where id = auth.uid() and actif = true));

create policy "admins_all_horaires_config"
  on public.horaires_config for all
  using (public.is_admin()) with check (public.is_admin());

create policy "active_users_read_horaires_exceptions"
  on public.horaires_exceptions for select
  using (exists (select 1 from public.profiles where id = auth.uid() and actif = true));

create policy "admins_all_horaires_exceptions"
  on public.horaires_exceptions for all
  using (public.is_admin()) with check (public.is_admin());

-- Realtime (idempotent)
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='horaires_config') then
    alter publication supabase_realtime add table public.horaires_config;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='horaires_exceptions') then
    alter publication supabase_realtime add table public.horaires_exceptions;
  end if;
end $$;
