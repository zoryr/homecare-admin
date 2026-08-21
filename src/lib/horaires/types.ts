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

export interface HoraireException {
  id: string;
  date_debut: string; // YYYY-MM-DD
  date_fin: string; // YYYY-MM-DD
  raison: string | null;
  standard_ouvert: boolean;
  ferme_matin: boolean;
  ferme_apres_midi: boolean;
  cree_par: string;
  cree_le: string;
}

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
