-- Table device_tokens : 1 ligne par device d'un user
create table public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null,
  platform text not null check (platform in ('ios','android')),
  device_name text,
  active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, expo_push_token)
);

create index device_tokens_user_idx on public.device_tokens (user_id) where active = true;

alter table public.device_tokens enable row level security;

create policy "users_manage_own_tokens"
  on public.device_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "admins_read_all_tokens"
  on public.device_tokens for select
  using (public.is_admin());

-- Table notification_settings : config globale (1 seule ligne)
create table public.notification_settings (
  id int primary key default 1 check (id = 1),
  auto_on_actu_publish boolean not null default true,
  auto_on_reglement_publish boolean not null default true,
  auto_on_sondage_create boolean not null default true,
  quiet_hours_enabled boolean not null default true,
  quiet_hours_start int not null default 21 check (quiet_hours_start between 0 and 23),
  quiet_hours_end int not null default 7 check (quiet_hours_end between 0 and 23),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

insert into public.notification_settings (id) values (1) on conflict do nothing;

alter table public.notification_settings enable row level security;

create policy "all_authenticated_read_settings"
  on public.notification_settings for select
  using (auth.role() = 'authenticated');

create policy "admins_update_settings"
  on public.notification_settings for update
  using (public.is_admin())
  with check (public.is_admin());

-- Table notifications : 1 ligne par envoi
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  message text not null,
  source text not null check (source in ('auto_actu','auto_reglement','auto_sondage','manuelle')),
  source_id uuid,
  deeplink_path text,
  audience text not null default 'all' check (audience in ('all','selection')),
  audience_user_ids uuid[] not null default '{}',
  scheduled_at timestamptz,
  sent_at timestamptz,
  cancelled_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index notifications_scheduled_idx on public.notifications (scheduled_at) where sent_at is null and cancelled_at is null;
create index notifications_sent_idx on public.notifications (sent_at desc);

alter table public.notifications enable row level security;

create policy "admins_all_notifications"
  on public.notifications for all
  using (public.is_admin())
  with check (public.is_admin());

-- Table notification_deliveries : qui a reçu quoi
create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null,
  platform text not null,
  status text not null default 'pending' check (status in ('pending','sent','failed','read','clicked')),
  error_message text,
  sent_at timestamptz,
  read_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz not null default now(),
  unique(notification_id, user_id, expo_push_token)
);

create index deliveries_notification_idx on public.notification_deliveries (notification_id);
create index deliveries_user_idx on public.notification_deliveries (user_id);

alter table public.notification_deliveries enable row level security;

create policy "users_read_own_deliveries"
  on public.notification_deliveries for select
  using (auth.uid() = user_id);

create policy "users_update_own_deliveries"
  on public.notification_deliveries for update
  using (auth.uid() = user_id);

create policy "admins_read_all_deliveries"
  on public.notification_deliveries for select
  using (public.is_admin());
