'use client';

import type { Editor } from '@tiptap/react';
import { ArrowRight, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

type Result = {
  id: string;
  titre: string;
  statut: 'brouillon' | 'programme' | 'publie';
  publie_le: string | null;
  image_couverture_url: string | null;
};

const STATUT_LABEL: Record<Result['statut'], string> = {
  brouillon: 'Brouillon',
  programme: 'Programmé',
  publie: 'Publié',
};

export default function InternalLinkModal({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const isActive = editor.isActive('internalLink');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await fetch(`/api/admin/actualites/search?q=${encodeURIComponent(q)}`);
      const json = (await res.json().catch(() => ({ results: [] }))) as { results?: Result[] };
      if (!cancelled) {
        setResults(json.results ?? []);
        setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  function select(id: string) {
    editor.chain().focus().setInternalLink({ actualiteId: id }).run();
    onClose();
  }

  function remove() {
    editor.chain().focus().unsetInternalLink().run();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink-900/40 px-4 pt-24 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-medium text-ink-900">Lien vers une actualité</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-md p-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
          >
            ✕
          </button>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher une actualité…"
            className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="mt-3 max-h-72 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-center text-sm text-ink-400">Recherche…</p>
          ) : results.length === 0 ? (
            <p className="p-4 text-center text-sm text-ink-400">Aucune actualité trouvée.</p>
          ) : (
            <ul className="space-y-1">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => select(r.id)}
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-brand-50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink-900">{r.titre}</span>
                      <span className="text-xs text-ink-400">
                        {STATUT_LABEL[r.statut]}
                        {r.publie_le
                          ? ` · ${new Date(r.publie_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`
                          : ''}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-brand-500" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {isActive && (
          <button
            type="button"
            onClick={remove}
            className="mt-4 w-full rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
          >
            Supprimer le lien interne
          </button>
        )}
      </div>
    </div>
  );
}
