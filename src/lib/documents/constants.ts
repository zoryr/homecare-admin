export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4', // Phase 2.5 : vidéos verticales
  'video/quicktime', // .mov depuis iPhone
] as const;

export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number];

export const MAX_FILE_SIZE_STANDARD = 10 * 1024 * 1024; // 10 MB pour docs
export const MAX_FILE_SIZE_VIDEO = 50 * 1024 * 1024; // 50 MB pour vidéos
/** @deprecated conservé pour rétro-compatibilité — utilisez getMaxFileSize(). */
export const MAX_FILE_SIZE = MAX_FILE_SIZE_STANDARD;

export function getMaxFileSize(mimeType: string): number {
  return mimeType.startsWith('video/') ? MAX_FILE_SIZE_VIDEO : MAX_FILE_SIZE_STANDARD;
}

export const ACCEPTED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov'];

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

export function isVideo(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

export function isAcceptedMime(mimeType: string): boolean {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(mimeType);
}
