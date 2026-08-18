-- Type de document "Article rédigé" : contenu riche (Tiptap) au lieu d'un fichier.
-- (Numéroté 28 : le 27 est déjà pris par apropos_seed_rows.)
alter table public.documents
  add column if not exists contenu_html text,
  add column if not exists contenu_json jsonb,
  add column if not exists est_article boolean not null default false;

-- Index partiel pour retrouver rapidement les articles rédigés.
create index if not exists documents_article_idx
  on public.documents (est_article)
  where est_article = true;
