-- Phase 2.11 — Vidéo de bienvenue à la 1re connexion.

-- Paramètres généraux de l'app (extensible)
create table if not exists public.app_parametres (
  cle text primary key,
  valeur jsonb not null,
  updated_at timestamptz not null default now(),
  updated_par uuid references auth.users(id)
);

insert into public.app_parametres (cle, valeur)
values ('video_bienvenue', '{"url": null, "actif": false, "duree_skip_ms": 5000}'::jsonb)
on conflict (cle) do nothing;

-- Tracking "vue" par utilisateur
alter table public.profiles
  add column if not exists video_bienvenue_vue_le timestamptz;

alter table public.app_parametres enable row level security;

create policy "active_users_read_parametres"
  on public.app_parametres for select
  using (exists (select 1 from public.profiles where id = auth.uid() and actif = true));

create policy "admins_all_parametres"
  on public.app_parametres for all
  using (public.is_admin()) with check (public.is_admin());

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='app_parametres'
  ) then
    alter publication supabase_realtime add table public.app_parametres;
  end if;
end $$;

-- Bucket + policies : voir 24b (storage) appliqué séparément.
