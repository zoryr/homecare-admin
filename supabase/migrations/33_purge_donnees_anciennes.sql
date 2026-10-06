-- 33 — Purge automatique des données personnelles de plus de 12 mois.
--
-- La politique de confidentialité annonce des durées de conservation. Pour
-- qu'elles soient tenues sans intervention humaine, un travail planifié tourne
-- le 1er de chaque mois et supprime :
--   - l'historique d'envoi et de lecture des notifications (notification_deliveries) ;
--   - la participation aux sondages (survey_participations), qui relie un
--     salarié à un sondage.
--
-- Ne sont pas touchés : le contenu des notifications et les réponses aux
-- sondages, qui ne sont reliées à personne (identifiant aléatoire).
-- La suppression des comptes de salariés partis reste manuelle : seule l'agence
-- sait qui a quitté l'entreprise.

create or replace function public.purger_donnees_anciennes()
returns table (table_cible text, lignes_supprimees bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  n_deliveries bigint;
  n_participations bigint;
begin
  delete from public.notification_deliveries
   where created_at < now() - interval '12 months';
  get diagnostics n_deliveries = row_count;

  delete from public.survey_participations
   where submitted_at < now() - interval '12 months';
  get diagnostics n_participations = row_count;

  return query
    select 'notification_deliveries'::text, n_deliveries
    union all
    select 'survey_participations'::text, n_participations;
end;
$$;

comment on function public.purger_donnees_anciennes() is
  'Supprime les données personnelles de plus de 12 mois (historique des notifications, participations aux sondages). Planifiée chaque 1er du mois.';

revoke all on function public.purger_donnees_anciennes() from public, anon, authenticated;

-- Planification : le 1er de chaque mois à 3h UTC.
select cron.unschedule('purge-donnees-12-mois')
 where exists (select 1 from cron.job where jobname = 'purge-donnees-12-mois');

select cron.schedule(
  'purge-donnees-12-mois',
  '0 3 1 * *',
  $$select public.purger_donnees_anciennes()$$
);
