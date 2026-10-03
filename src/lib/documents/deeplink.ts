/**
 * Chemin de l'écran mobile qui affiche un document.
 *
 * Doit rester aligné avec `documentRoute` dans homecare-app
 * (src/lib/documents/queries.ts) : une notification qui pointe vers
 * /documents/{id} alors que le document est une vidéo ouvrait un écran
 * "format non supporté".
 */
export function documentDeeplink(doc: {
  id: string;
  est_article?: boolean | null;
  flipbook_url?: string | null;
  est_video_verticale?: boolean | null;
}): string {
  if (doc.est_article) return `/article-doc/${doc.id}`;
  if (doc.flipbook_url) return `/flipbook/${doc.id}`;
  if (doc.est_video_verticale) return `/video/${doc.id}`;
  return `/documents/${doc.id}`;
}
