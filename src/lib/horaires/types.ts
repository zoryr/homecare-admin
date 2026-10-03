export interface HoraireConfig {
  id: string;
  jour_semaine: number; // 0=dimanche … 6=samedi
  ouvert: boolean;
  matin_debut: string | null;
  matin_fin: string | null;
  apres_midi_debut: string | null;
  apres_midi_fin: string | null;
  actif: boolean;
  updated_at: string;
}

export type HoraireRecurrence = 'aucune' | 'hebdomadaire';

export interface HoraireException {
  id: string;
  date_debut: string; // YYYY-MM-DD
  date_fin: string; // YYYY-MM-DD
  raison: string | null;
  standard_ouvert: boolean;
  /** Plage fermée. Les deux à null : fermeture toute la journée. */
  heure_debut: string | null; // HH:MM:SS
  heure_fin: string | null; // HH:MM:SS
  recurrence: HoraireRecurrence;
  /** Dernier jour de répétition, pour une fermeture hebdomadaire. */
  recurrence_fin: string | null; // YYYY-MM-DD
  /** Déduits de la plage par un trigger, pour les app déjà installées. */
  ferme_matin: boolean;
  ferme_apres_midi: boolean;
  cree_par: string;
  cree_le: string;
}

/** Pause déjeuner imposée : l'agence ferme de 13h à 14h tous les jours. */
export const PAUSE_DEJEUNER = { debut: '13:00', fin: '14:00' } as const;

export const JOURS_LABELS = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];

/** Ordre d'affichage : lundi → dimanche. */
export const JOURS_ORDRE = [1, 2, 3, 4, 5, 6, 0];
