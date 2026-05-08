import type { QuestionType } from './types';

export const QUESTION_TYPES: Array<{
  value: QuestionType;
  label: string;
  description: string;
  /** Nom du composant lucide-react */
  icon: 'CircleDot' | 'CheckSquare' | 'Star' | 'Smile' | 'ToggleLeft' | 'TextCursor';
}> = [
  {
    value: 'choix_unique',
    label: 'Choix unique',
    description: 'Une seule réponse possible parmi plusieurs',
    icon: 'CircleDot',
  },
  {
    value: 'choix_multiple',
    label: 'Choix multiples',
    description: 'Plusieurs réponses possibles',
    icon: 'CheckSquare',
  },
  {
    value: 'etoiles_5',
    label: 'Étoiles (1 à 5)',
    description: 'Note avec des étoiles',
    icon: 'Star',
  },
  {
    value: 'smileys_5',
    label: 'Smileys (1 à 5)',
    description: 'Note avec des smileys (😢 → 😍)',
    icon: 'Smile',
  },
  {
    value: 'oui_non',
    label: 'Oui / Non',
    description: 'Réponse binaire',
    icon: 'ToggleLeft',
  },
  {
    value: 'texte_libre',
    label: 'Texte libre',
    description: 'Réponse en texte libre',
    icon: 'TextCursor',
  },
];

export const QUESTION_TAGS = [
  'bien-etre',
  'planning',
  'formation',
  'equipe',
  'communication',
  'materiel',
  'remuneration',
  'reconnaissance',
  'evolution',
  'autre',
];

export const SMILEY_FACES = ['😢', '😟', '😐', '🙂', '😍'];

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}
