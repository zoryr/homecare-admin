-- Fix : autoriser les salariés actifs à lire les questions utilisées
-- dans un sondage publié non fermé. Sans cette policy l'écran de réponse
-- mobile affichait "Question introuvable" car la RLS bloquait le SELECT.

create policy "salaries_read_used_questions"
  on public.survey_questions for select
  using (
    exists (
      select 1
      from public.survey_items it
      join public.surveys s on s.id = it.survey_id
      where it.question_id = survey_questions.id
        and s.statut = 'publie'
        and (s.close_at is null or s.close_at > now())
    )
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and actif = true
    )
  );
