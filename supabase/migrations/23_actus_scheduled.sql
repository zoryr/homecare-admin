-- Phase 2.9 — Publication programmée des actualités : 3e état "programme".

alter table public.actualites
  add column if not exists publier_le timestamptz;

create index if not exists actualites_scheduled_idx
  on public.actualites (publier_le)
  where publier_le is not null and statut = 'programme';

alter table public.actualites drop constraint if exists actualites_statut_check;
alter table public.actualites
  add constraint actualites_statut_check
  check (statut in ('brouillon', 'programme', 'publie'));

-- Publication automatique via pg_cron (plan Vercel Hobby limité à 1 cron/jour,
-- donc on planifie côté Supabase).
create extension if not exists pg_cron;

create or replace function public.publish_scheduled_actualites()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.actualites
  set statut = 'publie', publie_le = now(), publier_le = null
  where statut = 'programme'
    and publier_le is not null
    and publier_le <= now();
end;
$$;

select cron.schedule(
  'publish-scheduled-actualites',
  '*/5 * * * *',
  $$ select public.publish_scheduled_actualites(); $$
);
