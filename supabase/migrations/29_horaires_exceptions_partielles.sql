-- Fermetures exceptionnelles partielles : matin seul, après-midi seul, ou toute la journée.
alter table public.horaires_exceptions
  add column if not exists ferme_matin boolean not null default true,
  add column if not exists ferme_apres_midi boolean not null default true;

-- Les fermetures existantes deviennent "toute la journée" (matin + après-midi).
update public.horaires_exceptions
  set ferme_matin = true, ferme_apres_midi = true;

-- Au moins une des deux demi-journées doit être fermée (sinon l'exception n'a pas de sens).
alter table public.horaires_exceptions
  drop constraint if exists horaires_exceptions_at_least_one_closed;
alter table public.horaires_exceptions
  add constraint horaires_exceptions_at_least_one_closed
  check (ferme_matin = true or ferme_apres_midi = true);
