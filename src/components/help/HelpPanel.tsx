'use client';

import { Loader2, Mail, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import HelpSection from './HelpSection';
import { loadHelpPage } from '@/lib/help/pages';
import type { HelpPage } from '@/lib/help/types';

const SUPPORT_EMAIL = 'support@homeandcare.fr';

type Props = {
  pageId: string | null;
  open: boolean;
  onClose: () => void;
};

export default function HelpPanel({ pageId, open, onClose }: Props) {
  const [page, setPage] = useState<HelpPage | null>(null);
  const [loading, setLoading] = useState(false);

  // Charge la page d'aide à la demande (lazy import du module concerné)
  useEffect(() => {
    if (!pageId || !open) return;
    let cancelled = false;
    setLoading(true);
    loadHelpPage(pageId)
      .then((p) => {
        if (!cancelled) setPage(p);
      })
      .catch(() => {
        if (!cancelled) setPage(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pageId, open]);

  // Esc → close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Empêche le scroll du body quand le panneau est ouvert
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-ink-900/40 transition-opacity duration-200 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Panneau */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-panel-title"
        className={`fixed right-0 top-0 z-50 flex h-screen w-full max-w-[480px] flex-col border-l border-ink-200 bg-white shadow-2xl transition-transform duration-250 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header sticky */}
        <header className="flex items-center justify-between gap-4 border-b border-ink-100 bg-white px-6 py-4">
          <div className="min-w-0">
            <h2
              id="help-panel-title"
              className="font-display text-lg font-semibold text-ink-900"
            >
              Aide
            </h2>
            <p className="truncate text-xs text-ink-500">
              {page?.title ?? 'Page courante'}
              {page?.subtitle ? ` — ${page.subtitle}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
            aria-label="Fermer l'aide"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Contenu scrollable */}
        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
          {loading && !page ? (
            <div className="flex items-center gap-3 rounded-lg bg-ink-50 p-4 text-sm text-ink-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement de l&apos;aide…
            </div>
          ) : page ? (
            page.sections.map((s) => (
              <HelpSection key={s.title} icon={s.icon} title={s.title}>
                {s.content}
              </HelpSection>
            ))
          ) : (
            <p className="rounded-lg bg-ink-50 p-4 text-sm text-ink-500">
              Aucune aide n&apos;est disponible pour cette page.
            </p>
          )}
        </div>

        {/* Footer sticky */}
        <footer className="border-t border-ink-100 bg-ink-50/40 px-6 py-4">
          <p className="mb-2 text-xs text-ink-600">
            Vous ne trouvez pas votre réponse ?
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Aide — ${page?.title ?? 'Home & Care'}`)}`}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
          >
            <Mail className="h-4 w-4" />
            Envoyer un email
          </a>
        </footer>
      </aside>
    </>
  );
}
