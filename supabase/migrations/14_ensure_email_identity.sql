-- Fonction utilitaire appelée après inviteUserByEmail() pour garantir
-- qu'une entrée auth.identities provider='email' existe pour le user.
-- Sans ça, signInWithOtp({ shouldCreateUser: false }) renvoie l'erreur
-- "Database error finding user" car Supabase Auth fait sa lookup sur
-- auth.identities (et pas seulement auth.users).
--
-- Bug observé sur les comptes créés via supabase.auth.admin.inviteUserByEmail()
-- selon certaines versions du module @supabase/supabase-js.

create or replace function public.ensure_email_identity(p_user_id uuid, p_email text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if p_user_id is null or p_email is null or p_email = '' then
    return;
  end if;

  if not exists (
    select 1 from auth.identities
    where user_id = p_user_id and provider = 'email'
  ) then
    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    )
    values (
      gen_random_uuid(),
      p_user_id,
      jsonb_build_object(
        'sub', p_user_id::text,
        'email', p_email,
        'email_verified', true
      ),
      'email',
      p_user_id::text,
      null,
      now(),
      now()
    );
  end if;
end;
$$;

-- Appelable uniquement depuis le service role (côté server admin).
-- Pas besoin pour anon/authenticated/public.
revoke execute on function public.ensure_email_identity(uuid, text) from anon, authenticated, public;
