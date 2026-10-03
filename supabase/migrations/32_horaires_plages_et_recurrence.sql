-- 32 — Fermetures exceptionnelles en plage horaire, récurrence, pause déjeuner fixe.
--
-- Avant : une fermeture valait pour le matin, l'après-midi ou la journée, avec
-- une coupure à midi. Deux conséquences : impossible de fermer de 14h à 16h, et
-- le standard téléphonique restait affiché ouvert toute la journée dès qu'une
-- fermeture de l'après-midi le prévoyait, même à 18h passées.
--
-- Après : heure_debut / heure_fin délimitent exactement la fermeture (null =
-- toute la journée), et une fermeture peut se répéter chaque semaine jusqu'à
-- une date de fin.

alter table public.horaires_exceptions
  add column if not exists heure_debut time,
  add column if not exists heure_fin time,
  add column if not exists recurrence text not null default 'aucune',
  add column if not exists recurrence_fin date;

alter table public.horaires_exceptions
  drop constraint if exists horaires_exceptions_recurrence_chk,
  drop constraint if exists horaires_exceptions_heures_chk,
  drop constraint if exists horaires_exceptions_recurrence_fin_chk;

alter table public.horaires_exceptions
  add constraint horaires_exceptions_recurrence_chk
    check (recurrence in ('aucune', 'hebdomadaire')),
  add constraint horaires_exceptions_heures_chk
    check (
      (heure_debut is null and heure_fin is null)
      or (heure_debut is not null and heure_fin is not null and heure_fin > heure_debut)
    ),
  add constraint horaires_exceptions_recurrence_fin_chk
    check (recurrence = 'aucune' or recurrence_fin is not null);

-- Reprise des fermetures existantes : les demi-journées deviennent des plages.
update public.horaires_exceptions
   set heure_debut = '00:00', heure_fin = '13:00'
 where heure_debut is null and ferme_matin and not ferme_apres_midi;

update public.horaires_exceptions
   set heure_debut = '13:00', heure_fin = '23:59'
 where heure_debut is null and ferme_apres_midi and not ferme_matin;

-- ferme_matin / ferme_apres_midi restent alimentés : les versions de l'app déjà
-- installées lisent encore ces deux colonnes. Elles sont déduites de la plage.
create or replace function public.horaires_exceptions_sync_demi_journees()
returns trigger
language plpgsql
as $$
begin
  new.ferme_matin := new.heure_debut is null or new.heure_debut < time '13:00';
  new.ferme_apres_midi := new.heure_fin is null or new.heure_fin > time '14:00';
  return new;
end;
$$;

drop trigger if exists trg_horaires_exceptions_demi_journees on public.horaires_exceptions;
create trigger trg_horaires_exceptions_demi_journees
  before insert or update on public.horaires_exceptions
  for each row execute function public.horaires_exceptions_sync_demi_journees();

-- Pause déjeuner : l'agence est fermée de 13h à 14h, tous les jours ouverts.
-- Les jours étaient enregistrés en continu (9h-18h), sans coupure.
update public.horaires_config
   set matin_debut = coalesce(matin_debut, time '09:00'),
       matin_fin = time '13:00',
       apres_midi_debut = time '14:00',
       apres_midi_fin = coalesce(apres_midi_fin, time '18:00'),
       updated_at = now()
 where ouvert;
