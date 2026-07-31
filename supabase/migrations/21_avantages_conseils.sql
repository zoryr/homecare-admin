-- Phase 2.5 — Rubriques Avantages + Conseils (listes simples). La structure
-- rubrique/ordre existe déjà (migration 19). On prépare juste les vidéos
-- verticales (lecteur Phase 2.7).

alter table public.documents
  add column if not exists est_video_verticale boolean not null default false;

create index if not exists documents_video_idx
  on public.documents (est_video_verticale)
  where est_video_verticale = true;

-- est_video_verticale ne peut être true que pour un fichier vidéo.
alter table public.documents
  add constraint documents_video_check
  check (
    not est_video_verticale
    or (est_video_verticale and mime_type like 'video/%')
  );
