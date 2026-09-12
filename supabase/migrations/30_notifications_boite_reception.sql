-- La boîte de réception de l'app ne dépend plus du push.
--
-- Avant : notification_deliveries contenait 1 ligne par TOKEN, créée uniquement
-- par l'envoi push. Trois conséquences :
--   1. aucun téléphone enregistré => aucune ligne => message invisible dans l'app
--   2. un salarié avec 2 téléphones voyait le message 2 fois
--   3. les salariés n'avaient aucun droit de lecture sur `notifications`, donc la
--      jointure de l'app renvoyait null et la liste restait vide de toute façon
--
-- Après : 1 ligne par (notification, destinataire), déposée au moment de l'envoi
-- indépendamment du push, que le push vient ensuite compléter.

-- 1. Token et plateforme ne sont plus obligatoires : la ligne est déposée avant
--    tout envoi, et un destinataire peut n'avoir aucun téléphone enregistré.
alter table public.notification_deliveries alter column expo_push_token drop not null;
alter table public.notification_deliveries alter column platform drop not null;

-- 2. Une seule ligne par (notification, destinataire). On conserve la meilleure
--    ligne existante (lue, puis envoyée, puis la plus récente).
delete from public.notification_deliveries d
using (
  select id,
         row_number() over (
           partition by notification_id, user_id
           order by (read_at is not null) desc,
                    (status = 'sent') desc,
                    created_at desc
         ) as rn
    from public.notification_deliveries
) ranked
where ranked.id = d.id and ranked.rn > 1;

alter table public.notification_deliveries
  drop constraint if exists notification_deliveries_notification_id_user_id_expo_push_t_key;

alter table public.notification_deliveries
  add constraint notification_deliveries_notification_id_user_id_key
  unique (notification_id, user_id);

-- 3. Un salarié doit pouvoir lire le contenu des notifications qui lui ont été
--    adressées, sinon la jointure côté app renvoie null.
drop policy if exists users_read_own_notifications on public.notifications;
create policy users_read_own_notifications on public.notifications
  for select
  to authenticated
  using (
    exists (
      select 1
        from public.notification_deliveries d
       where d.notification_id = notifications.id
         and d.user_id = (select auth.uid())
    )
  );
