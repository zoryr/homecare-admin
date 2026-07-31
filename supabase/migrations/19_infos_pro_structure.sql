-- Phase 2.4 — Structure "Infos professionnelles" : rubrique + sous-rubrique fixe,
-- flipbook_url (prep Phase 2.6) et ordre (drag & drop).

alter table public.documents
  add column if not exists rubrique text not null default 'infos_pro'
  check (rubrique in ('infos_pro', 'avantages', 'conseils'));

create index if not exists documents_rubrique_idx
  on public.documents (rubrique);

alter table public.documents
  add column if not exists sous_rubrique text
  check (sous_rubrique in (
    'livret_accueil',
    'reglement_interieur',
    'notes_service',
    'informations_personnel'
  ) or sous_rubrique is null);

create index if not exists documents_sous_rubrique_idx
  on public.documents (sous_rubrique)
  where sous_rubrique is not null;

alter table public.documents
  add column if not exists flipbook_url text;

alter table public.documents
  add column if not exists ordre int not null default 0;

create index if not exists documents_ordre_idx
  on public.documents (rubrique, sous_rubrique, ordre);

-- Documents existants → infos_pro / notes_service par défaut (déplaçables ensuite).
update public.documents
set rubrique = 'infos_pro', sous_rubrique = 'notes_service'
where sous_rubrique is null and rubrique = 'infos_pro';
