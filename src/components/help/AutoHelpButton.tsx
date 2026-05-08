'use client';

import { usePathname } from 'next/navigation';

import HelpButton from './HelpButton';

/**
 * Détecte la page admin courante via le pathname et affiche le HelpButton avec
 * le pageId approprié. Placé une seule fois dans le layout admin pour éviter
 * d'avoir à modifier chaque page.
 */
export default function AutoHelpButton() {
  const pathname = usePathname() ?? '';
  const pageId = resolvePageId(pathname);
  if (!pageId) return null;
  return <HelpButton pageId={pageId} />;
}

function resolvePageId(pathname: string): string | null {
  // Ordre IMPORTANT : les routes les plus spécifiques d'abord.

  if (pathname === '/admin/dashboard') return 'dashboard';

  if (pathname === '/admin/actualites') return 'actualites_liste';
  if (/^\/admin\/actualites\/[^/]+$/.test(pathname)) return 'actualites_edition';

  if (pathname === '/admin/notifications') return 'notifications';

  // Sondages — résultats avant builder, banque avant builder
  if (/^\/admin\/sondages\/[^/]+\/resultats\/?$/.test(pathname)) return 'sondages_resultats';
  if (pathname === '/admin/sondages/banque') return 'sondages_banque';
  if (/^\/admin\/sondages\/banque\/[^/]+$/.test(pathname)) return 'sondages_question';
  if (pathname === '/admin/sondages') return 'sondages_liste';
  if (/^\/admin\/sondages\/[^/]+$/.test(pathname)) return 'sondages_builder';

  if (pathname === '/admin/documents') return 'documents_liste';
  if (/^\/admin\/documents\/[^/]+$/.test(pathname)) return 'documents_edition';

  if (pathname === '/admin/apropos') return 'apropos';

  // Équipe (et anciennes URLs admins/salaries qui redirigent)
  if (
    pathname === '/admin/equipe' ||
    pathname === '/admin/salaries' ||
    pathname === '/admin/admins'
  ) {
    return 'salaries';
  }

  return null;
}
