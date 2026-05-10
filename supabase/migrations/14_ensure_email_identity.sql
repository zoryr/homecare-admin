-- Fonction utilitaire appelée après inviteUserByEmail() pour réparer
-- les comptes nouvellement créés en garantissant que :
--
--  1. auth.identities provider='email' existe pour le user (sans ça,
--     signInWithOtp({ shouldCreateUser: false }) renvoie "Database error
--     finding user").
--
--  2. Les colonnes texte de auth.users sont à '' et non NULL — sinon
--     GoTrue crash avec "Scan error on column index N: converting NULL
--     to string is unsupported". Bug GoTrue connu déclenché par
--     inviteUserByEmail selon les versions.
--     Cf https://github.com/supabase/auth/issues/1255

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

  -- Fix GoTrue : NULL → '' sur les colonnes texte d'auth.users
  update auth.users
  set
    confirmation_token = coalesce(confirmation_token, ''),
    recovery_token = coalesce(recovery_token, ''),
    email_change_token_new = coalesce(email_change_token_new, ''),
    email_change = coalesce(email_change, ''),
    email_change_token_current = coalesce(email_change_token_current, ''),
    phone_change = coalesce(phone_change, ''),
    phone_change_token = coalesce(phone_change_token, ''),
    reauthentication_token = coalesce(reauthentication_token, '')
  where id = p_user_id;

  -- Garantit qu'une identity provider='email' existe
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
revoke execute on function public.ensure_email_identity(uuid, text) from anon, authenticated, public;
