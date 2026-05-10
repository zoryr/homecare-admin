import type { ImageSource } from '@/lib/images/types';

export type QuestionType =
  | 'choix_unique'
  | 'choix_multiple'
  | 'etoiles_5'
  | 'smileys_5'
  | 'oui_non'
  | 'texte_libre';

export interface ChoiceOption {
  label: string;
  value: string;
}

export interface QuestionOptions {
  /** choix_unique / choix_multiple */
  choices?: ChoiceOption[];
  /** etoiles_5 / smileys_5 */
  labels_extremes?: { min: string; max: string };
  /** oui_non */
  oui_label?: string;
  non_label?: string;
  /** texte_libre */
  max_length?: number;
  multiline?: boolean;
  placeholder?: string;
}

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  titre: string;
  description: string | null;
  options: QuestionOptions;
  tags: string[];
  cree_par: string;
  cree_le: string;
  modifie_le: string;
}

export type SurveyStatut = 'brouillon' | 'publie' | 'ferme';

export interface Survey {
  id: string;
  titre: string;
  description: string;
  texte_intro: string;
  texte_fin: string;
  image_couverture_url: string | null;
  image_source: ImageSource | null;
  statut: SurveyStatut;
  open_at: string | null;
  close_at: string | null;
  notif_envoyee: boolean;
  cree_par: string;
  cree_le: string;
  modifie_le: string;
  publie_le: string | null;
  ferme_le: string | null;
}

export type SurveyItemType = 'question' | 'texte' | 'image' | 'section_break';

export interface SurveyItem {
  id: string;
  survey_id: string;
  ordre: number;
  type: SurveyItemType;
  question_id: string | null;
  required: boolean;
  content: string | null;
  image_source: ImageSource | null;
  cree_le: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  item_id: string;
  submission_token: string;
  answer: unknown;
  created_at: string;
}
