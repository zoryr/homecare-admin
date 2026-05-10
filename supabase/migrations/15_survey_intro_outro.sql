-- Ajout des textes d'introduction et de fin personnalisables sur les sondages.
-- texte_intro : affiché au début du sondage côté salarié (sous la description).
-- texte_fin : affiché sur l'écran de remerciement après soumission.
-- Les deux sont optionnels (default '').

alter table public.surveys
  add column if not exists texte_intro text not null default '',
  add column if not exists texte_fin text not null default '';
