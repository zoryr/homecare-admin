-- Phase correctifs Élodie — flag "standard téléphonique ouvert" pendant les fermetures.

-- Flag "standard téléphonique actif" pendant les fermetures exceptionnelles.
alter table public.horaires_exceptions
  add column if not exists standard_ouvert boolean not null default false;

-- Flag global "standard ouvert weekends/jours fériés"
-- (au cas où Élodie voudrait un jour l'activer par défaut).
insert into public.app_parametres (cle, valeur)
values ('horaires_standard_defaut', '{"weekend": false, "feries": false}'::jsonb)
on conflict (cle) do nothing;
