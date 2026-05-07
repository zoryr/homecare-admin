-- Table profils (1 ligne par utilisateur, créée auto à l'inscription)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nom text,
  prenom text,
  role text not null default 'salarie' check (role in ('salarie','admin')),
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

-- Trigger : créer la ligne profile à chaque nouvel auth user
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;

create policy "users_read_own_profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "admins_read_all_profiles"
  on public.profiles for select
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "admins_update_all_profiles"
  on public.profiles for update
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));
