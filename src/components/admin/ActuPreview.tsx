'use client';

import { useMemo } from 'react';

import { getTagById } from '@/lib/actus/tags';

// CSS qui doit rester en synchro avec homecare-app/src/lib/actus/styles.ts
// (le rendu doit être identique à ce que voit le salarié dans l'app mobile)
const MOBILE_CSS = `
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; margin: 0; padding: 0; }
  html, body { height: auto; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 17px;
    line-height: 1.6;
    color: #1f2937;
    background: #ffffff;
    word-wrap: break-word;
  }
  .cover { width: 100%; aspect-ratio: 16 / 9; background: #e2e8f0; }
  .cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .meta { padding: 16px; }
  .meta h1 { font-size: 26px; font-weight: 700; color: #0f172a; line-height: 1.25; margin: 0 0 12px 0; }
  .tags { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .tag { padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .tag-blue { background: #dbeafe; color: #1e40af; }
  .tag-amber { background: #fef3c7; color: #92400e; }
  .tag-green { background: #d1fae5; color: #065f46; }
  .tag-purple { background: #ede9fe; color: #5b21b6; }
  .tag-red { background: #fee2e2; color: #991b1b; }
  .date { font-size: 13px; color: #64748b; }
  .desc { font-size: 16px; color: #334155; line-height: 22px; margin-top: 14px; font-style: italic; }
  .body { padding: 0 16px 24px 16px; }
  .body > * + * { margin-top: 0.75em; }
  .body p { margin: 0 0 12px 0; }
  .body h1 { font-size: 26px; font-weight: 700; color: #0f172a; line-height: 1.25; margin: 24px 0 12px 0; }
  .body h2 { font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.25; margin: 24px 0 12px 0; }
  .body h3 { font-size: 19px; font-weight: 600; color: #0f172a; line-height: 1.3; margin: 24px 0 12px 0; }
  .body ul, .body ol { margin: 0 0 12px 0; padding-left: 24px; }
  .body li { margin-bottom: 6px; }
  .body blockquote {
    border-left: 4px solid #cbd5e1;
    padding: 4px 0 4px 16px;
    margin: 12px 0;
    color: #475569;
    font-style: italic;
  }
  .body img { max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0; display: block; }
  .body a { color: #2563eb; text-decoration: underline; }
  .body hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
  .body .callout {
    border-left: 4px solid;
    padding: 12px 16px;
    margin: 16px 0;
    border-radius: 4px;
  }
  .body .callout > *:first-child { margin-top: 0; }
  .body .callout > *:last-child { margin-bottom: 0; }
  .body .callout-info { border-color: #3b82f6; background: #eff6ff; }
  .body .callout-conseil { border-color: #10b981; background: #ecfdf5; }
  .body .callout-attention { border-color: #f59e0b; background: #fffbeb; }
  .body .callout-important { border-color: #8b5cf6; background: #f5f3ff; }
  .empty { padding: 40px 16px; text-align: center; color: #94a3b8; font-style: italic; font-size: 14px; }
`;

type Props = {
  titre: string;
  description: string;
  corps: string;
  imageCouvertureUrl: string | null;
  tags: string[];
  publieLe: string | null;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function tagColorClass(color: string): string {
  // Map couleur sémantique → classe CSS dans le srcDoc
  return `tag-${color}`;
}

export default function ActuPreview(props: Props) {
  const { titre, description, corps, imageCouvertureUrl, tags, publieLe } = props;

  const html = useMemo(() => {
    const dateText = publieLe
      ? `Publié le ${new Date(publieLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
      : 'Aperçu — non publié';

    const tagsHtml = tags
      .map((id) => {
        const tag = getTagById(id);
        if (!tag) return '';
        return `<span class="tag ${tagColorClass(tag.color)}">${escapeHtml(tag.label)}</span>`;
      })
      .join('');

    const coverHtml = imageCouvertureUrl
      ? `<div class="cover"><img src="${imageCouvertureUrl}" alt=""></div>`
      : `<div class="cover"></div>`;

    const titreSafe = escapeHtml(titre || 'Titre de l\'actualité');
    const descSafe = description ? `<p class="desc">${escapeHtml(description)}</p>` : '';
    const corpsHtml = corps && corps.replace(/<[^>]+>/g, '').trim()
      ? `<div class="body">${corps}</div>`
      : `<div class="empty">Le contenu apparaîtra ici dès que tu commenceras à rédiger.</div>`;

    return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${MOBILE_CSS}</style>
<base target="_blank">
</head>
<body>
${coverHtml}
<div class="meta">
  <h1>${titreSafe}</h1>
  <div class="tags">
    ${tagsHtml}
    <span class="date">${dateText}</span>
  </div>
  ${descSafe}
</div>
${corpsHtml}
</body>
</html>`;
  }, [titre, description, corps, imageCouvertureUrl, tags, publieLe]);

  return (
    <div className="lg:sticky lg:top-24">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-600">
          Aperçu mobile
        </p>
        <span className="text-xs text-ink-400">tel que vu dans l&apos;app</span>
      </div>

      <div className="relative mx-auto w-full max-w-[360px]">
        {/* Coque "phone" */}
        <div className="overflow-hidden rounded-[2.5rem] border-[10px] border-ink-900 bg-ink-900 shadow-soft">
          {/* Notch fictif */}
          <div className="relative bg-ink-900 pt-3 pb-2">
            <div className="mx-auto h-1.5 w-20 rounded-full bg-ink-700" />
          </div>
          <iframe
            title="Aperçu mobile"
            srcDoc={html}
            sandbox="allow-same-origin"
            className="block h-[640px] w-full bg-white"
          />
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-ink-400">
        L&apos;aperçu se met à jour automatiquement.
      </p>
    </div>
  );
}
