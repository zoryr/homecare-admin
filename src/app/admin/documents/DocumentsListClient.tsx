'use client';

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExternalLink, FileText, GripVertical, Image as ImageIcon, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import { useToast } from '@/components/Toast';
import { formatFileSize, isPdf } from '@/lib/documents/constants';
import type {
  DocumentSousRubrique,
  DocumentStatut,
  DocumentWithCategorie,
} from '@/lib/documents/types';

type Rubrique = 'infos_pro' | 'avantages' | 'conseils';

const STATUT_BADGE: Record<DocumentStatut, string> = {
  brouillon: 'bg-slate-100 text-slate-700',
  publie: 'bg-emerald-100 text-emerald-800',
};

export default function DocumentsListClient({
  initialDocuments,
}: {
  initialDocuments: DocumentWithCategorie[];
}) {
  const [tab, setTab] = useState<Rubrique>('infos_pro');
  const documents = initialDocuments;

  const livret = useMemo(
    () => documents.find((d) => d.sous_rubrique === 'livret_accueil') ?? null,
    [documents],
  );
  const reglement = useMemo(
    () => documents.find((d) => d.sous_rubrique === 'reglement_interieur') ?? null,
    [documents],
  );
  const notes = useMemo(
    () =>
      documents
        .filter((d) => d.sous_rubrique === 'notes_service')
        .sort((a, b) => a.ordre - b.ordre),
    [documents],
  );
  const infos = useMemo(
    () =>
      documents
        .filter((d) => d.sous_rubrique === 'informations_personnel')
        .sort((a, b) => a.ordre - b.ordre),
    [documents],
  );

  return (
    <div>
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-600">Documents</p>
        <h1 className="mt-1 font-display text-4xl font-medium text-ink-900">Documents</h1>
        <p className="mt-2 text-sm text-ink-500">
          Organisés par rubrique. Seule « Infos professionnelles » est active pour le moment.
        </p>
      </header>

      {/* Onglets rubriques */}
      <div className="mb-8 flex flex-wrap gap-2">
        <TabButton active={tab === 'infos_pro'} onClick={() => setTab('infos_pro')}>
          Infos professionnelles
        </TabButton>
        <TabButton disabled>Avantages Home &amp; Care</TabButton>
        <TabButton disabled>Conseils &amp; astuces</TabButton>
      </div>

      {tab === 'infos_pro' ? (
        <div className="space-y-10">
          <FlipbookSection
            sousRubrique="livret_accueil"
            heading="📕 Livret d'accueil"
            existing={livret}
          />
          <FlipbookSection
            sousRubrique="reglement_interieur"
            heading="📕 Règlement intérieur"
            existing={reglement}
          />
          <DocsSection
            sousRubrique="notes_service"
            heading="📝 Notes de service"
            docs={notes}
          />
          <DocsSection
            sousRubrique="informations_personnel"
            heading="📄 Informations pour le personnel"
            docs={infos}
          />
        </div>
      ) : null}
    </div>
  );
}

function TabButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-4 py-1.5 text-sm text-ink-400">
        {children}
        <span className="rounded-full bg-ink-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-ink-500">
          Bientôt
        </span>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white'
          : 'rounded-full border border-ink-200 bg-white px-4 py-1.5 text-sm text-ink-700 hover:border-brand-300'
      }
    >
      {children}
    </button>
  );
}

/* ------------------------- Flipbook (Livret / Règlement) ------------------------- */

function FlipbookSection({
  sousRubrique,
  heading,
  existing,
}: {
  sousRubrique: Extract<DocumentSousRubrique, 'livret_accueil' | 'reglement_interieur'>;
  heading: string;
  existing: DocumentWithCategorie | null;
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [, startTransition] = useTransition();

  const defaultTitre = sousRubrique === 'livret_accueil' ? "Livret d'accueil" : 'Règlement intérieur';
  const [titre, setTitre] = useState(existing?.titre ?? defaultTitre);
  const [url, setUrl] = useState(existing?.flipbook_url ?? '');
  const [statut, setStatut] = useState<DocumentStatut>(existing?.statut ?? 'brouillon');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch('/api/admin/documents/flipbook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sous_rubrique: sousRubrique, titre, flipbook_url: url.trim() || null, statut }),
    });
    setSaving(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Échec de l\'enregistrement');
      return;
    }
    notify('success', 'Flipbook enregistré.');
    startTransition(() => router.refresh());
  }

  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-6">
      <h2 className="font-display text-xl font-medium text-ink-900">{heading}</h2>
      <p className="mt-1 text-sm text-ink-500">
        Un seul flipbook Heyzine. Le rendu dans l&apos;app arrive en Phase 2.6.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-700">Titre</label>
          <input
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700">URL du flipbook Heyzine</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://heyzine.com/flip-book/xxxxx"
            className="mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={statut === 'publie'}
              onChange={(e) => setStatut(e.target.checked ? 'publie' : 'brouillon')}
              className="h-4 w-4 rounded border-ink-300 accent-brand-500"
            />
            Publié (visible dans l&apos;app)
          </label>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_BADGE[statut]}`}>
            {statut === 'publie' ? 'Publié' : 'Brouillon'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button type="button" onClick={save} disabled={saving} className="btn-primary">
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          {url.trim() ? (
            <a
              href={url.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Prévisualiser
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ------------------------- Docs (Notes / Infos personnel) ------------------------- */

function DocsSection({
  sousRubrique,
  heading,
  docs,
}: {
  sousRubrique: Extract<DocumentSousRubrique, 'notes_service' | 'informations_personnel'>;
  heading: string;
  docs: DocumentWithCategorie[];
}) {
  const { notify } = useToast();
  const [items, setItems] = useState(docs);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((d) => d.id === active.id);
    const newIndex = items.findIndex((d) => d.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    const res = await fetch('/api/admin/documents/reorder', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ids: next.map((d) => d.id) }),
    });
    if (!res.ok) {
      notify('error', 'Réordonnancement échoué.');
      setItems(docs);
    }
  }

  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-medium text-ink-900">{heading}</h2>
        <Link
          href={`/admin/documents/new?sous=${sousRubrique}`}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-300 bg-ink-50 p-6 text-center text-sm text-ink-500">
          Aucun document pour le moment.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((d) => d.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {items.map((d) => (
                <SortableDocRow key={d.id} doc={d} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}

function SortableDocRow({ doc }: { doc: DocumentWithCategorie }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: doc.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  const pdf = doc.mime_type ? isPdf(doc.mime_type) : false;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-3"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-ink-400 hover:text-ink-700"
        aria-label="Réordonner"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <span
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${pdf ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}
      >
        {pdf ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink-900">{doc.titre}</p>
        <p className="truncate text-xs text-ink-400">
          {doc.fichier_nom ?? '—'}
          {doc.fichier_taille ? ` · ${formatFileSize(doc.fichier_taille)}` : ''}
        </p>
      </div>

      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_BADGE[doc.statut]}`}>
        {doc.statut === 'publie' ? 'Publié' : 'Brouillon'}
      </span>

      <Link
        href={`/admin/documents/${doc.id}`}
        className="rounded-md border border-ink-200 bg-white px-3 py-1 text-xs font-medium text-ink-700 hover:border-brand-300 hover:text-brand-700"
      >
        Modifier
      </Link>
    </li>
  );
}
