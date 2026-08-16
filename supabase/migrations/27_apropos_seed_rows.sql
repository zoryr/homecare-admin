-- Fix "À propos" : garantir l'existence des 2 lignes (public / interne).
-- La route admin faisait un UPDATE seul → sans ligne préexistante, rien n'était
-- sauvegardé (la table restait vide) et l'app n'affichait donc aucun contenu.
-- La route passe désormais en upsert, et ce seed garantit l'état initial.
insert into public.apropos (cle) values ('public'), ('interne')
on conflict (cle) do nothing;
