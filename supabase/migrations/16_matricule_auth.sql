-- Phase 2.2 — Authentification par matricule + mot de passe (remplace l'OTP email)
--
-- Le "matricule" (identifiant humain saisi par la secrétaire depuis le logiciel
-- RH) est stocké dans profiles.identifiant. L'email d'auth devient fictif :
-- {matricule}@infocare.local (jamais envoyé). Le vrai email d'origine reste
-- conservé dans profiles.email pour référence.
--
-- NB : cette migration remplace le brief initial "13_matricule_auth.sql" — le
-- numéro 13 était déjà pris (13_perf_security_pass.sql).

-- 1. Colonne identifiant (nullable le temps de migrer les données existantes)
alter table public.profiles
  add column if not exists identifiant text unique;

-- 2. prenom / nom : déjà nullables depuis 01_init_profiles, on garantit l'état
--    (no-op si déjà nullable)
alter table public.profiles alter column nom drop not null;
alter table public.profiles alter column prenom drop not null;

-- 3. Trigger de création de profil : il DOIT désormais renseigner identifiant +
--    prenom depuis user_metadata (matricule / prenom), car identifiant devient
--    NOT NULL plus bas. Sans ça, createUser() échouerait sur la contrainte.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, prenom, identifiant, created_by)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data->>'prenom', ''),
    nullif(new.raw_user_meta_data->>'matricule', ''),
    (new.raw_user_meta_data->>'invited_by')::uuid
  );
  return new;
end;
$$;

-- 4. Migration des comptes existants : matricule provisoire = prénom (ou partie
--    locale de l'email si prénom null), slugifié (minuscules, sans accents ni
--    caractères spéciaux). Collision-safe : suffixe numérique en cas de doublon.
with base as (
  select
    id,
    coalesce(
      nullif(
        lower(regexp_replace(
          translate(
            coalesce(prenom, split_part(email, '@', 1)),
            'àâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ',
            'aaaeeeeiioouuuycAAAEEEEIIOOUUUYC'
          ),
          '[^a-zA-Z0-9]', '', 'g'
        )),
        ''
      ),
      'user'
    ) as slug
  from public.profiles
  where identifiant is null
),
numbered as (
  select id, slug,
         row_number() over (partition by slug order by id) as rn
  from base
)
update public.profiles p
set identifiant = case when n.rn = 1 then n.slug else n.slug || n.rn::text end
from numbered n
where p.id = n.id;

-- 5. Index de lookup
create index if not exists profiles_identifiant_idx
  on public.profiles (identifiant)
  where identifiant is not null;

-- 6. identifiant devient obligatoire pour tout nouveau profil
alter table public.profiles
  alter column identifiant set not null;

-- 7. Vue admin (liste + dernière connexion). La dernière connexion vient de
--    auth.users.last_sign_in_at (auth.sessions n'a PAS de colonne sign_in_at).
create or replace view public.admin_users as
select
  p.id,
  p.identifiant,
  p.email,
  p.prenom,
  p.role,
  p.actif,
  p.created_at,
  u.last_sign_in_at
from public.profiles p
join auth.users u on u.id = p.id;

-- Sécurité : la vue expose des données d'auth (emails, dernière connexion).
-- Réservée au service role (routes admin server-side). Jamais exposée aux
-- clients anon/authenticated (sinon un salarié pourrait tout lister).
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to service_role;
