import type { DocumentCategorieCouleur } from './types';

export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const ACCEPTED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];

export const CATEGORIE_COULEURS: Array<{
  value: DocumentCategorieCouleur;
  label: string;
  bg: string;
  text: string;
}> = [
  { value: 'gray', label: 'Gris', bg: '#F3F4F6', text: '#374151' },
  { value: 'blue', label: 'Bleu', bg: '#DBEAFE', text: '#1E40AF' },
  { value: 'green', label: 'Vert', bg: '#D1FAE5', text: '#065F46' },
  { value: 'amber', label: 'Orange', bg: '#FEF3C7', text: '#92400E' },
  { value: 'red', label: 'Rouge', bg: '#FEE2E2', text: '#991B1B' },
  { value: 'purple', label: 'Violet', bg: '#EDE9FE', text: '#5B21B6' },
  { value: 'rose', label: 'Rose', bg: '#FCE7F3', text: '#9F1239' },
];

export function couleurStyle(c: DocumentCategorieCouleur): { bg: string; text: string } {
  return CATEGORIE_COULEURS.find((x) => x.value === c) ?? CATEGORIE_COULEURS[0];
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function isPdf(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

export function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function isAcceptedMime(mimeType: string): boolean {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(mimeType);
}
