-- Phase correctifs Élodie — suppression des catégories de documents (double emploi avec les rubriques).

-- Supprimer la contrainte FK d'abord.
alter table public.documents
  drop constraint if exists documents_categorie_id_fkey;

-- Supprimer la colonne dans documents.
alter table public.documents
  drop column if exists categorie_id;

-- Supprimer la table des catégories.
drop table if exists public.document_categories cascade;
