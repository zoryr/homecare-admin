export type TagColor = 'blue' | 'amber' | 'green' | 'purple' | 'red';

export type ActuTag = {
  id: string;
  label: string;
  color: TagColor;
};

export const ACTU_TAGS: ActuTag[] = [
  { id: 'vie-equipe', label: "Vie d'équipe", color: 'blue' },
  { id: 'info-pratique', label: 'Info pratique', color: 'amber' },
  { id: 'evenement', label: 'Événement', color: 'green' },
  { id: 'temoignage', label: 'Témoignage', color: 'purple' },
  { id: 'annonce', label: 'Annonce', color: 'red' },
];

export function getTagById(id: string): ActuTag | undefined {
  return ACTU_TAGS.find((t) => t.id === id);
}

export const TAG_COLOR_CLASSES: Record<TagColor, string> = {
  blue: 'bg-blue-100 text-blue-800',
  amber: 'bg-amber-100 text-amber-800',
  green: 'bg-emerald-100 text-emerald-800',
  purple: 'bg-purple-100 text-purple-800',
  red: 'bg-rose-100 text-rose-800',
};

export const TAG_COLOR_CLASSES_SELECTED: Record<TagColor, string> = {
  blue: 'bg-blue-600 text-white border-blue-700',
  amber: 'bg-amber-600 text-white border-amber-700',
  green: 'bg-emerald-600 text-white border-emerald-700',
  purple: 'bg-purple-600 text-white border-purple-700',
  red: 'bg-rose-600 text-white border-rose-700',
};
