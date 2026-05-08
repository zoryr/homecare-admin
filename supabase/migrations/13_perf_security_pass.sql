-- ===============================================================
-- Migration 13 — Pass perf + sécurité
-- ===============================================================
-- Cibles :
-- 1) auth_rls_initplan (15) : wrap auth.uid() / is_admin() dans (select …)
-- 2) function_search_path_mutable (4) : fige search_path = public
-- 3) Sécurité : revoke EXECUTE is_admin() pour anon + authenticated
--    (la fonction reste utilisable depuis les policies SECURITY DEFINER)
-- 4) Storage : restreindre SELECT policies aux utilisateurs authentifiés
--    pour documents-fichiers et sondages-images (évite le listing anon)
-- 5) FK manquantes : index sur les FK les plus chaudes
-- ===============================================================

-- 1) Trigger functions — search_path explicite
alter function public.set_modifie_le() set search_path = public;
alter function public.set_survey_question_modifie_le() set search_path = public;
alter function public.set_survey_modifie_le() set search_path = public;
alter function public.set_document_modifie_le() set search_path = public;

-- 2) Sécurité is_admin : retirer l'execute aux rôles publics
revoke execute on function public.is_admin() from anon, authenticated, public;
-- (Les policies USING is_admin() continuent de fonctionner car PostgreSQL
--  les évalue avec le rôle propriétaire de la fonction.)

-- 3) Storage : durcir les policies SELECT broad
drop policy if exists "anyone_read_documents_fichiers" on storage.objects;
create policy "auth_users_read_documents_fichiers"
  on storage.objects for select
  using (
    bucket_id = 'documents-fichiers'
    and exists (select 1 from public.profiles where id = (select auth.uid()) and actif = true)
  );

drop policy if exists "anyone_read_sondages_images" on storage.objects;
create policy "auth_users_read_sondages_images"
  on storage.objects for select
  using (
    bucket_id = 'sondages-images'
    and exists (select 1 from public.profiles where id = (select auth.uid()) and actif = true)
  );

-- ===============================================================
-- 4) RLS perf — wrap auth.uid() et is_admin() dans (select …)
--    On DROP + CREATE chaque policy concernée.
-- ===============================================================

-- profiles
drop policy if exists "users_read_own_profile" on public.profiles;
create policy "users_read_own_profile" on public.profiles for select
  using ((select auth.uid()) = id);

-- (les policies admins_*_profiles utilisent is_admin() — wrap dans select)
drop policy if exists "admins_read_all_profiles" on public.profiles;
create policy "admins_read_all_profiles" on public.profiles for select
  using ((select public.is_admin()));

drop policy if exists "admins_update_all_profiles" on public.profiles;
create policy "admins_update_all_profiles" on public.profiles for update
  using ((select public.is_admin()));

drop policy if exists "admins_insert_profiles" on public.profiles;
create policy "admins_insert_profiles" on public.profiles for insert
  with check ((select public.is_admin()));

-- actualites
drop policy if exists "salaries_read_published_actus" on public.actualites;
create policy "salaries_read_published_actus" on public.actualites for select
  using (
    statut = 'publie'
    and exists (select 1 from public.profiles where id = (select auth.uid()) and actif = true)
  );

drop policy if exists "admins_all_actus" on public.actualites;
create policy "admins_all_actus" on public.actualites for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- apropos
drop policy if exists "active_users_read_all" on public.apropos;
create policy "active_users_read_all" on public.apropos for select
  using (exists (select 1 from public.profiles where id = (select auth.uid()) and actif = true));

drop policy if exists "admins_update_apropos" on public.apropos;
create policy "admins_update_apropos" on public.apropos for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- (anon_authed_read_public_row n'utilise pas auth.uid, on la laisse)

-- device_tokens
drop policy if exists "users_manage_own_tokens" on public.device_tokens;
create policy "users_manage_own_tokens" on public.device_tokens for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "admins_read_all_tokens" on public.device_tokens;
create policy "admins_read_all_tokens" on public.device_tokens for select
  using ((select public.is_admin()));

-- notification_settings
drop policy if exists "all_authenticated_read_settings" on public.notification_settings;
create policy "all_authenticated_read_settings" on public.notification_settings for select
  using ((select auth.role()) = 'authenticated');

drop policy if exists "admins_update_settings" on public.notification_settings;
create policy "admins_update_settings" on public.notification_settings for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- notifications
drop policy if exists "admins_all_notifications" on public.notifications;
create policy "admins_all_notifications" on public.notifications for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- notification_deliveries
drop policy if exists "users_read_own_deliveries" on public.notification_deliveries;
create policy "users_read_own_deliveries" on public.notification_deliveries for select
  using ((select auth.uid()) = user_id);

drop policy if exists "users_update_own_deliveries" on public.notification_deliveries;
create policy "users_update_own_deliveries" on public.notification_deliveries for update
  using ((select auth.uid()) = user_id);

drop policy if exists "admins_read_all_deliveries" on public.notification_deliveries;
create policy "admins_read_all_deliveries" on public.notification_deliveries for select
  using ((select public.is_admin()));

-- invitations
drop policy if exists "admins_all_invitations" on public.invitations;
create policy "admins_all_invitations" on public.invitations for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- documents
drop policy if exists "active_users_read_published_documents" on public.documents;
create policy "active_users_read_published_documents" on public.documents for select
  using (
    statut = 'publie'
    and exists (select 1 from public.profiles where id = (select auth.uid()) and actif = true)
  );

drop policy if exists "admins_all_documents" on public.documents;
create policy "admins_all_documents" on public.documents for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- document_categories
drop policy if exists "active_users_read_categories" on public.document_categories;
create policy "active_users_read_categories" on public.document_categories for select
  using (exists (select 1 from public.profiles where id = (select auth.uid()) and actif = true));

drop policy if exists "admins_all_categories" on public.document_categories;
create policy "admins_all_categories" on public.document_categories for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- surveys
drop policy if exists "salaries_read_published_surveys" on public.surveys;
create policy "salaries_read_published_surveys" on public.surveys for select
  using (
    statut = 'publie'
    and (close_at is null or close_at > now())
    and exists (select 1 from public.profiles where id = (select auth.uid()) and actif = true)
  );

drop policy if exists "admins_all_surveys" on public.surveys;
create policy "admins_all_surveys" on public.surveys for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- survey_items
drop policy if exists "salaries_read_items_of_published_surveys" on public.survey_items;
create policy "salaries_read_items_of_published_surveys" on public.survey_items for select
  using (
    exists (
      select 1 from public.surveys s
      where s.id = survey_items.survey_id
        and s.statut = 'publie'
        and (s.close_at is null or s.close_at > now())
    )
    and exists (select 1 from public.profiles where id = (select auth.uid()) and actif = true)
  );

drop policy if exists "admins_all_items" on public.survey_items;
create policy "admins_all_items" on public.survey_items for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- survey_questions
drop policy if exists "salaries_read_used_questions" on public.survey_questions;
create policy "salaries_read_used_questions" on public.survey_questions for select
  using (
    exists (
      select 1 from public.survey_items it
      join public.surveys s on s.id = it.survey_id
      where it.question_id = survey_questions.id
        and s.statut = 'publie'
        and (s.close_at is null or s.close_at > now())
    )
    and exists (select 1 from public.profiles where id = (select auth.uid()) and actif = true)
  );

drop policy if exists "admins_all_questions" on public.survey_questions;
create policy "admins_all_questions" on public.survey_questions for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- survey_participations
drop policy if exists "users_read_own_participations" on public.survey_participations;
create policy "users_read_own_participations" on public.survey_participations for select
  using ((select auth.uid()) = user_id);

drop policy if exists "users_insert_own_participations" on public.survey_participations;
create policy "users_insert_own_participations" on public.survey_participations for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "admins_read_all_participations" on public.survey_participations;
create policy "admins_read_all_participations" on public.survey_participations for select
  using ((select public.is_admin()));

-- survey_responses
drop policy if exists "active_users_insert_responses" on public.survey_responses;
create policy "active_users_insert_responses" on public.survey_responses for insert
  with check (
    exists (select 1 from public.profiles where id = (select auth.uid()) and actif = true)
    and exists (
      select 1 from public.surveys s
      where s.id = survey_responses.survey_id
        and s.statut = 'publie'
        and (s.close_at is null or s.close_at > now())
    )
  );

drop policy if exists "admins_read_responses" on public.survey_responses;
create policy "admins_read_responses" on public.survey_responses for select
  using ((select public.is_admin()));

-- ===============================================================
-- 5) Index sur les FK chaudes (couvrent les jointures et cascades)
-- ===============================================================

create index if not exists actualites_cree_par_idx on public.actualites (cree_par);
create index if not exists apropos_modifie_par_idx on public.apropos (modifie_par);
create index if not exists invitations_invited_by_idx on public.invitations (invited_by);
create index if not exists notifications_created_by_idx on public.notifications (created_by);
create index if not exists notification_deliveries_user_id_idx on public.notification_deliveries (user_id);
create index if not exists notification_deliveries_notification_id_idx on public.notification_deliveries (notification_id);
create index if not exists device_tokens_user_id_idx on public.device_tokens (user_id);
create index if not exists survey_items_question_id_idx on public.survey_items (question_id);
create index if not exists survey_responses_item_id_idx on public.survey_responses (item_id);
create index if not exists survey_participations_user_id_idx on public.survey_participations (user_id);
create index if not exists surveys_cree_par_idx on public.surveys (cree_par);
create index if not exists survey_questions_cree_par_idx on public.survey_questions (cree_par);
create index if not exists documents_cree_par_idx on public.documents (cree_par);
create index if not exists document_categories_cree_par_idx on public.document_categories (cree_par);
