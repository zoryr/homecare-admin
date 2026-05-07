-- Table des invitations envoyées (pour suivi côté admin)
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  prenom text,
  nom text,
  invited_by uuid not null references auth.users(id),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique(email)
);

alter table public.invitations enable row level security;

create policy "admins_all_invitations"
  on public.invitations for all
  using (public.is_admin())
  with check (public.is_admin());

-- Quand un user complète son inscription, on marque l'invitation comme acceptée
create or replace function public.mark_invitation_accepted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.invitations
  set accepted_at = now()
  where email = new.email and accepted_at is null;
  return new;
end;
$$;

create trigger on_user_signup_mark_invitation
  after insert on auth.users
  for each row execute function public.mark_invitation_accepted();
