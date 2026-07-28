-- Phase 2.2 (pivot) — Deux systèmes d'auth en parallèle :
--   - ADMINS   : OTP email (identifiant NULL, créés via le Dashboard Supabase)
--   - SALARIÉS : matricule + mot de passe (identifiant renseigné par l'API)
--
-- La migration 16 avait mis identifiant NOT NULL. Or les admins n'ont pas de
-- matricule → toute création d'admin (Dashboard) échouerait sur la contrainte.
-- On retire donc le NOT NULL. La contrainte UNIQUE reste (Postgres autorise
-- plusieurs NULL).
alter table public.profiles alter column identifiant drop not null;

-- Restaure le trigger d'origine : il ne renseigne PAS identifiant (il reste NULL
-- pour les admins créés via le Dashboard). C'est l'API /admin/salaries/create qui
-- set identifiant + prenom pour les salariés, juste après createUser().
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, created_by)
  values (new.id, new.email, (new.raw_user_meta_data->>'invited_by')::uuid);
  return new;
end;
$$;
