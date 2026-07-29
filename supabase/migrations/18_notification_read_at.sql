-- Phase 2.3 — Badge "non lu" sur la cloche de l'accueil.
-- read_at existe déjà (utilisé par l'app), on garantit + on ajoute l'index et
-- l'activation Realtime pour rafraîchir le compteur en temps réel.

alter table public.notification_deliveries
  add column if not exists read_at timestamptz;

create index if not exists notif_deliveries_unread_idx
  on public.notification_deliveries (user_id)
  where read_at is null;

-- Realtime (idempotent) : permet à l'app de rafraîchir le badge dès qu'une
-- livraison est créée ou marquée lue.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notification_deliveries'
  ) then
    alter publication supabase_realtime add table public.notification_deliveries;
  end if;
end $$;
