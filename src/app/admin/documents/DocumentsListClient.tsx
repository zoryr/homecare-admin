'use client';

import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FileText,
  FolderCog,
  Image as ImageIcon,
  Pin,
  Plus,
  Search,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import CategoriesModal from '@/components/admin/documents/CategoriesModal';
import {
  couleurStyle,
  formatFileSize,
  isPdf,
} from '@/lib/documents/constants';
import type {
  DocumentCategorie,
  DocumentStatut,
  DocumentWithCategorie,
} from '@/lib/documents/types';

const STATUT_BADGE: Record<DocumentStatut, string> = {
  brouillon: 'bg-slate-100 text-slate-700',
  publie: 'bg-emerald-100 text-emerald-800',
};
const STATUT_LABEL: Record<DocumentStatut, string> = {
  brouillon: 'Brouillon',
  publie: 'Publié',
};

type Props = {
  initialDocuments: DocumentWithCategorie[];
  initialCategories: DocumentCategorie[];
};

export default function DocumentsListClient({ initialDocuments, initialCategories }: Props) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [categories, setCategories] = useState(initialCategories);

  const [q, setQ] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [statutFilter, setStatutFilter] = useState<DocumentStatut | 'all'>('all');
  const [catModalOpen, setCatModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return documents.filter((d) => {
      if (statutFilter !== 'all' && d.statut !== statutFilter) return false;
      if (catFilter === 'none' && d.categorie_id !== null) return false;
      if (catFilter !== 'all' && catFilter !== 'none' && d.categorie_id !== catFilter) return false;
      if (needle && !d.titre.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [documents, q, catFilter, statutFilter]);

  const hasActive = q.trim() || catFilter !== 'all' || statutFilter !== 'all';

  function reset() {
    setQ('');
    setCatFilter('all');
    setStatutFilter('all');
  }

  function onCategoriesChanged(next: DocumentCategorie[]) {
    setCategories(next);
    // Met à jour les categories embarquées dans les docs
    const m = new Map(next.map((c) => [c.id, c]));
    setDocuments((prev) =>
      prev.map((d) => ({
        ...d,
        categorie: d.categorie_id ? (m.get(d.categorie_id) ?? null) : null,
      })),
    );
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-600">
            Documents
          </p>
          <h1 className="mt-1 font-display text-4xl font-medium text-ink-900">Documents</h1>
          <p className="mt-2 text-sm text-ink-500">
            Règlement, notes de service, procédures…
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCatModalOpen(true)}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <FolderCog className="h-4 w-4" />
            Gérer les catégories
          </button>
          <Link href="/admin/documents/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouveau document
          </Link>
        </div>
      </header>

      <div className="sticky top-[60px] z-10 mb-6 rounded-xl border border-ink-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher par titre…"
              className="w-full rounded-full border border-ink-200 bg-white py-1.5 pl-9 pr-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">Toutes les catégories</option>
            <option value="none">Sans catégorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            {(['all', 'brouillon', 'publie'] as const).map((s) => {
              const active = statutFilter === s;
              const label = s === 'all' ? 'Tous' : s === 'brouillon' ? 'Brouillons' : 'Publiés';
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatutFilter(s)}
                  className={
                    active
                      ? 'rounded-full bg-ink-900 px-3 py-1 text-xs font-medium text-white'
                      : 'rounded-full border border-ink-200 bg-white px-3 py-1 text-xs text-ink-600 hover:border-ink-300'
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>

          {hasActive ? (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-600 hover:border-rose-300 hover:text-rose-700"
            >
              <X className="h-3 w-3" />
              Réinitialiser
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-white p-12 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-ink-400" />
          {hasActive ? (
            <p className="text-ink-500">Aucun document ne correspond à ces critères.</p>
          ) : (
            <>
              <p className="text-ink-500">Aucun document pour le moment.</p>
              <Link
                href="/admin/documents/new"
                className="btn-primary mt-4 inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Créer mon premier document
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <DocumentCard key={d.id} doc={d} />
          ))}
        </div>
      )}

      {catModalOpen ? (
        <CategoriesModal
          categories={categories}
          onClose={() => setCatModalOpen(false)}
          onChange={onCategoriesChanged}
        />
      ) : null}
    </div>
  );
}

function DocumentCard({ doc }: { doc: DocumentWithCategorie }) {
  const cat = doc.categorie;
  const catStyle = cat ? couleurStyle(cat.couleur) : null;
  const dateLabel = doc.publie_le
    ? `Publié ${formatDistanceToNow(new Date(doc.publie_le), { locale: fr, addSuffix: true })}`
    : `Modifié ${formatDistanceToNow(new Date(doc.modifie_le), { locale: fr, addSuffix: true })}`;

  const featured =
    doc.featured_jusqua && new Date(doc.featured_jusqua) >= new Date(new Date().toDateString());

  return (
    <Link
      href={`/admin/documents/${doc.id}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white transition hover:border-brand-300 hover:shadow-soft"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {doc.image_couverture_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doc.image_couverture_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center ${
              isPdf(doc.mime_type)
                ? 'bg-gradient-to-br from-rose-50 to-rose-100'
                : 'bg-gradient-to-br from-blue-50 to-blue-100'
            }`}
          >
            {isPdf(doc.mime_type) ? (
              <FileText className="h-16 w-16 text-rose-300" strokeWidth={1.4} />
            ) : (
              <ImageIcon className="h-16 w-16 text-blue-300" strokeWidth={1.4} />
            )}
          </div>
        )}
        {featured ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm">
            <Pin className="h-3 w-3" />
            Épinglé
          </span>
        ) : null}
        <span
          className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_BADGE[doc.statut]}`}
        >
          {STATUT_LABEL[doc.statut]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {cat && catStyle ? (
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
            >
              {cat.nom}
            </span>
          ) : (
            <span className="rounded-full bg-ink-50 px-2 py-0.5 text-xs text-ink-500">
              Sans catégorie
            </span>
          )}
        </div>

        <h2 className="line-clamp-2 font-display text-lg font-medium text-ink-900">
          {doc.titre}
        </h2>

        {doc.description ? (
          <p className="line-clamp-2 text-sm text-ink-500">{doc.description}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-ink-400">
          <span className="truncate" title={doc.fichier_nom}>
            {doc.fichier_nom}
          </span>
          <span>·</span>
          <span>{formatFileSize(doc.fichier_taille)}</span>
        </div>
        <p className="text-[11px] text-ink-400">
          {dateLabel}
          {doc.publie_le ? ` (${format(new Date(doc.publie_le), 'd MMM yyyy', { locale: fr })})` : ''}
        </p>
      </div>
    </Link>
  );
}
