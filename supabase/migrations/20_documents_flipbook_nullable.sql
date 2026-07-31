-- Phase 2.4 — Les flipbooks (Livret d'accueil, Règlement intérieur) sont des
-- lignes documents SANS fichier (juste flipbook_url). On rend donc les colonnes
-- fichier_* nullable. Les documents classiques (notes, infos personnel) gardent
-- un fichier (validation applicative côté API).
alter table public.documents alter column fichier_url drop not null;
alter table public.documents alter column fichier_nom drop not null;
alter table public.documents alter column fichier_taille drop not null;
alter table public.documents alter column mime_type drop not null;
