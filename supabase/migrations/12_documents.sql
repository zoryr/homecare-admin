-- ================================================================
-- CATÉGORIES (créées par les admins, libres)
-- ================================================================
create table public.document_categories (
  id uuid primary key default gen_random_uuid(),
  nom text not null unique,
  ordre int not null default 0,
  couleur text not null default 'gray'
    check (couleur in ('gray','blue','green','amber','red','purple','rose')),
  cree_par uuid not null references auth.users(id),
  cree_le timestamptz not null default now()
);

create index document_categories_ordre_idx on public.document_categories (ordre);

alter table public.document_categories enable row level security;

create policy "active_users_read_categories"
  on public.document_categories for select
  using (
    exists (select 1 from public.profiles
            where id = auth.uid() and actif = true)
  );

create policy "admins_all_categories"
  on public.document_categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed best-effort (n'échoue pas si auth.users vide)
do $$
declare
  first_uid uuid;
begin
  select id into first_uid from auth.users limit 1;
  if first_uid is not null then
    insert into public.document_categories (nom, ordre, couleur, cree_par)
    values
      ('Règlement intérieur', 1, 'blue', first_uid),
      ('Notes de service', 2, 'amber', first_uid)
    on conflict (nom) do nothing;
  end if;
end $$;

-- ================================================================
-- DOCUMENTS
-- ================================================================
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  description text not null default '',
  categorie_id uuid references public.document_categories(id) on delete set null,

  -- Fichier (PDF ou image)
  fichier_url text not null,
  fichier_nom text not null,
  fichier_taille bigint not null,
  mime_type text not null,

  -- Couverture optionnelle (sinon placeholder selon mime_type)
  image_couverture_url text,
  image_source jsonb,

  -- Publication
  statut text not null default 'brouillon'
    check (statut in ('brouillon','publie')),
  publie_le timestamptz,
  featured_jusqua date,
  notif_envoyee boolean not null default false,

  cree_par uuid not null references auth.users(id),
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

create index documents_categorie_idx on public.documents (categorie_id);
create index documents_statut_idx on public.documents (statut);
create index documents_publie_le_idx on public.documents (publie_le desc);
create index documents_featured_jusqua_idx on public.documents (featured_jusqua);

create or replace function public.set_document_modifie_le()
returns trigger language plpgsql as $$
begin new.modifie_le = now(); return new; end;
$$;

create trigger documents_set_modifie_le
  before update on public.documents
  for each row execute function public.set_document_modifie_le();

alter table public.documents enable row level security;

create policy "active_users_read_published_documents"
  on public.documents for select
  using (
    statut = 'publie'
    and exists (select 1 from public.profiles
                where id = auth.uid() and actif = true)
  );

create policy "admins_all_documents"
  on public.documents for all
  using (public.is_admin())
  with check (public.is_admin());

-- ================================================================
-- BUCKET STORAGE
-- ================================================================
insert into storage.buckets (id, name, public)
values ('documents-fichiers', 'documents-fichiers', true)
on conflict (id) do nothing;

create policy "anyone_read_documents_fichiers"
  on storage.objects for select
  using (bucket_id = 'documents-fichiers');

create policy "admins_upload_documents_fichiers"
  on storage.objects for insert
  with check (bucket_id = 'documents-fichiers' and public.is_admin());

create policy "admins_update_documents_fichiers"
  on storage.objects for update
  using (bucket_id = 'documents-fichiers' and public.is_admin());

create policy "admins_delete_documents_fichiers"
  on storage.objects for delete
  using (bucket_id = 'documents-fichiers' and public.is_admin());
