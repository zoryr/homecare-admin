-- Drop des policies bugées
drop policy if exists "admins_read_all_profiles" on public.profiles;
drop policy if exists "admins_update_all_profiles" on public.profiles;

-- Fonction helper : retourne true si l'utilisateur courant est admin
-- security definer = bypass RLS pour éviter la récursion
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and actif = true
  );
$$;

-- Policies réparées
create policy "admins_read_all_profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "admins_update_all_profiles"
  on public.profiles for update
  using (public.is_admin());

-- Les admins peuvent aussi insérer (pour inviter des salariés via service role)
create policy "admins_insert_profiles"
  on public.profiles for insert
  with check (public.is_admin());
