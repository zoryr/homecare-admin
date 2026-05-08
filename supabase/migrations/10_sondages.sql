-- BANQUE DE QUESTIONS
create table public.survey_questions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in (
    'choix_unique', 'choix_multiple', 'etoiles_5',
    'smileys_5', 'oui_non', 'texte_libre'
  )),
  titre text not null,
  description text,
  options jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  cree_par uuid not null references auth.users(id),
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

create index survey_questions_tags_idx on public.survey_questions using gin (tags);

create or replace function public.set_survey_question_modifie_le()
returns trigger language plpgsql as $$
begin new.modifie_le = now(); return new; end;
$$;

create trigger survey_questions_set_modifie_le
  before update on public.survey_questions
  for each row execute function public.set_survey_question_modifie_le();

alter table public.survey_questions enable row level security;

create policy "admins_all_questions"
  on public.survey_questions for all
  using (public.is_admin())
  with check (public.is_admin());

-- SONDAGES
create table public.surveys (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  description text not null default '',
  image_couverture_url text,
  image_source jsonb,
  statut text not null default 'brouillon' check (statut in ('brouillon','publie','ferme')),
  open_at timestamptz,
  close_at timestamptz,
  notif_envoyee boolean not null default false,
  cree_par uuid not null references auth.users(id),
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now(),
  publie_le timestamptz,
  ferme_le timestamptz
);

create index surveys_statut_idx on public.surveys (statut);
create index surveys_publie_le_idx on public.surveys (publie_le desc);

create or replace function public.set_survey_modifie_le()
returns trigger language plpgsql as $$
begin new.modifie_le = now(); return new; end;
$$;

create trigger surveys_set_modifie_le
  before update on public.surveys
  for each row execute function public.set_survey_modifie_le();

alter table public.surveys enable row level security;

create policy "admins_all_surveys"
  on public.surveys for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "salaries_read_published_surveys"
  on public.surveys for select
  using (
    statut = 'publie'
    and (close_at is null or close_at > now())
    and exists (select 1 from public.profiles where id = auth.uid() and actif = true)
  );

-- ITEMS
create table public.survey_items (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  ordre int not null,
  type text not null check (type in ('question', 'texte', 'image', 'section_break')),
  question_id uuid references public.survey_questions(id) on delete restrict,
  required boolean not null default false,
  content text,
  image_source jsonb,
  cree_le timestamptz not null default now()
);

create index survey_items_survey_idx on public.survey_items (survey_id, ordre);

alter table public.survey_items enable row level security;

create policy "admins_all_items"
  on public.survey_items for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "salaries_read_items_of_published_surveys"
  on public.survey_items for select
  using (
    exists (
      select 1 from public.surveys s
      where s.id = survey_items.survey_id
        and s.statut = 'publie'
        and (s.close_at is null or s.close_at > now())
    )
    and exists (select 1 from public.profiles where id = auth.uid() and actif = true)
  );

-- PARTICIPATIONS
create table public.survey_participations (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  unique(survey_id, user_id)
);

create index participations_survey_idx on public.survey_participations (survey_id);

alter table public.survey_participations enable row level security;

create policy "users_read_own_participations"
  on public.survey_participations for select
  using (auth.uid() = user_id);

create policy "users_insert_own_participations"
  on public.survey_participations for insert
  with check (auth.uid() = user_id);

create policy "admins_read_all_participations"
  on public.survey_participations for select
  using (public.is_admin());

-- RÉPONSES (anonymes)
create table public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  item_id uuid not null references public.survey_items(id) on delete cascade,
  submission_token uuid not null,
  answer jsonb not null,
  created_at timestamptz not null default now()
);

create index responses_survey_idx on public.survey_responses (survey_id);
create index responses_item_idx on public.survey_responses (item_id);
create index responses_submission_idx on public.survey_responses (submission_token);

alter table public.survey_responses enable row level security;

create policy "active_users_insert_responses"
  on public.survey_responses for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and actif = true)
    and exists (
      select 1 from public.surveys s
      where s.id = survey_responses.survey_id
        and s.statut = 'publie'
        and (s.close_at is null or s.close_at > now())
    )
  );

create policy "admins_read_responses"
  on public.survey_responses for select
  using (public.is_admin());

-- BUCKET STORAGE
insert into storage.buckets (id, name, public)
values ('sondages-images', 'sondages-images', true)
on conflict (id) do nothing;

create policy "anyone_read_sondages_images"
  on storage.objects for select
  using (bucket_id = 'sondages-images');

create policy "admins_upload_sondages_images"
  on storage.objects for insert
  with check (bucket_id = 'sondages-images' and public.is_admin());

create policy "admins_update_sondages_images"
  on storage.objects for update
  using (bucket_id = 'sondages-images' and public.is_admin());

create policy "admins_delete_sondages_images"
  on storage.objects for delete
  using (bucket_id = 'sondages-images' and public.is_admin());
