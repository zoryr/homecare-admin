import type { ImageSource } from './types';

/**
 * URL absolue de l'image par défaut (logo H&C sur fond blanc).
 * Le fichier physique se trouve dans homecare-admin/public/default-actu-cover.png
 * et est servi par Next.js. On stocke en absolu pour que l'app mobile puisse
 * fetch la même URL.
 */
export function getDefaultCoverUrl(originFallback?: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? originFallback ?? 'https://homecare-admin-gray.vercel.app';
  return `${base.replace(/\/$/, '')}/default-actu-cover.png`;
}

export const DEFAULT_IMAGE_SOURCE: ImageSource = { provider: 'default' };

/** True si l'URL pointe sur l'image par défaut (peu importe le host). */
export function isDefaultCoverUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.endsWith('/default-actu-cover.png');
}
