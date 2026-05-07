-- Table actualites
create table public.actualites (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  description text not null default '',
  corps text not null default '', -- HTML Tiptap
  image_couverture_url text,
  tags text[] not null default '{}',
  statut text not null default 'brouillon' check (statut in ('brouillon','publie')),
  publie_le timestamptz,
  featured_jusqua date,
  cree_par uuid not null references auth.users(id),
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

create index actualites_statut_idx on public.actualites (statut);
create index actualites_publie_le_idx on public.actualites (publie_le desc);
create index actualites_featured_jusqua_idx on public.actualites (featured_jusqua);

-- Trigger pour modifie_le auto
create or replace function public.set_modifie_le()
returns trigger
language plpgsql
as $$
begin
  new.modifie_le = now();
  return new;
end;
$$;

create trigger actualites_set_modifie_le
  before update on public.actualites
  for each row execute function public.set_modifie_le();

-- RLS
alter table public.actualites enable row level security;

-- Les salariés actifs lisent les actus PUBLIÉES uniquement
create policy "salaries_read_published_actus"
  on public.actualites for select
  using (
    statut = 'publie'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and actif = true
    )
  );

-- Les admins ont tous les droits
create policy "admins_all_actus"
  on public.actualites for all
  using (public.is_admin())
  with check (public.is_admin());

-- Buckets storage
insert into storage.buckets (id, name, public)
values ('actus-images', 'actus-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('actus-fichiers', 'actus-fichiers', true)
on conflict (id) do nothing;

-- Storage policies : tout le monde peut LIRE (les buckets sont public),
-- mais seuls les admins peuvent ÉCRIRE
create policy "admins_upload_actus_images"
  on storage.objects for insert
  with check (bucket_id = 'actus-images' and public.is_admin());

create policy "admins_update_actus_images"
  on storage.objects for update
  using (bucket_id = 'actus-images' and public.is_admin());

create policy "admins_delete_actus_images"
  on storage.objects for delete
  using (bucket_id = 'actus-images' and public.is_admin());

create policy "admins_upload_actus_fichiers"
  on storage.objects for insert
  with check (bucket_id = 'actus-fichiers' and public.is_admin());

create policy "admins_update_actus_fichiers"
  on storage.objects for update
  using (bucket_id = 'actus-fichiers' and public.is_admin());

create policy "admins_delete_actus_fichiers"
  on storage.objects for delete
  using (bucket_id = 'actus-fichiers' and public.is_admin());
