-- Lockdown des fonctions SECURITY DEFINER exposées via /rest/v1/rpc.
-- handle_new_user et mark_invitation_accepted sont des triggers, jamais appelés en RPC.
-- is_admin reste callable (utilisée par les policies RLS, et retourne juste un booléen
-- qui n'est pas un secret).

revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.mark_invitation_accepted() from anon, authenticated, public;
