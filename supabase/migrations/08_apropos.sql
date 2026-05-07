-- Table apropos : 2 lignes uniques (public, interne)
create table public.apropos (
  cle text primary key check (cle in ('public','interne')),
  image_url text,
  corps text not null default '',
  email_contact text,
  telephone text,
  adresse text,
  site_web text,
  facebook_url text,
  instagram_url text,
  linkedin_url text,
  modifie_le timestamptz not null default now(),
  modifie_par uuid references auth.users(id)
);

create trigger apropos_set_modifie_le
  before update on public.apropos
  for each row execute function public.set_modifie_le();

insert into public.apropos (cle, corps, email_contact, adresse, site_web, facebook_url, instagram_url, linkedin_url) values (
  'public',
  '<p>Bienvenue chez Home &amp; Care, service d''aide à domicile sur le Pays de Grasse depuis 2014. Notre équipe d''auxiliaires de vie accompagne au quotidien les personnes âgées, handicapées ou temporairement dépendantes.</p><p>Cette application est un espace de communication interne, réservé aux salariés de Home &amp; Care.</p>',
  'agence06@homeandcare.fr',
  'Mouans-Sartoux, Pays de Grasse (06)',
  'https://www.homeandcare.fr',
  'https://facebook.com/homeandcare.fr',
  'https://www.instagram.com/home.and.care/',
  'https://www.linkedin.com/company/homeandcare/'
);

insert into public.apropos (cle, corps, email_contact, adresse, site_web, facebook_url, instagram_url, linkedin_url) values (
  'interne',
  '<p>Bienvenue dans votre espace dédié. Vous y retrouverez les actualités de l''agence, le règlement intérieur, des sondages, et toutes les communications importantes.</p>',
  'agence06@homeandcare.fr',
  'Mouans-Sartoux, Pays de Grasse (06)',
  'https://www.homeandcare.fr',
  'https://facebook.com/homeandcare.fr',
  'https://www.instagram.com/home.and.care/',
  'https://www.linkedin.com/company/homeandcare/'
);

alter table public.apropos enable row level security;

create policy "anon_authed_read_public_row"
  on public.apropos for select
  to anon, authenticated
  using (cle = 'public');

create policy "active_users_read_all"
  on public.apropos for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and actif = true
    )
  );

create policy "admins_update_apropos"
  on public.apropos for update
  using (public.is_admin())
  with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('apropos-images', 'apropos-images', true)
on conflict (id) do nothing;

create policy "admins_upload_apropos_images"
  on storage.objects for insert
  with check (bucket_id = 'apropos-images' and public.is_admin());

create policy "admins_update_apropos_images"
  on storage.objects for update
  using (bucket_id = 'apropos-images' and public.is_admin());

create policy "admins_delete_apropos_images"
  on storage.objects for delete
  using (bucket_id = 'apropos-images' and public.is_admin());
