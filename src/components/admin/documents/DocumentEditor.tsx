'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft,
  FolderCog,
  Image as ImageIcon,
  Pin,
  Send,
  Trash2,
  Undo2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import CategoriesModal from './CategoriesModal';
import FileUpload, { type UploadedFile } from './FileUpload';
import ImagePicker from '@/components/admin/ImagePicker';
import { useToast } from '@/components/Toast';
import {
  couleurStyle,
  isImage,
  isPdf,
} from '@/lib/documents/constants';
import type {
  DocumentCategorie,
  DocumentRow,
  DocumentStatut,
} from '@/lib/documents/types';
import type { ImageSource } from '@/lib/images/types';

type Props = {
  initial: DocumentRow | null;
  categories: DocumentCategorie[];
};

const STATUT_BADGE: Record<DocumentStatut, string> = {
  brouillon: 'bg-slate-100 text-slate-700',
  publie: 'bg-emerald-100 text-emerald-800',
};
const STATUT_LABEL: Record<DocumentStatut, string> = {
  brouillon: 'Brouillon',
  publie: 'Publié',
};

export default function DocumentEditor({ initial, categories: initialCats }: Props) {
  const router = useRouter();
  const { notify } = useToast();
  const [, startTransition] = useTransition();
  const isNew = initial === null;

  const [categories, setCategories] = useState(initialCats);
  const [statut, setStatut] = useState<DocumentStatut>(initial?.statut ?? 'brouillon');
  const [titre, setTitre] = useState(initial?.titre ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [categorieId, setCategorieId] = useState<string | null>(initial?.categorie_id ?? null);

  const [file, setFile] = useState<UploadedFile | null>(
    initial
      ? {
          url: initial.fichier_url,
          nom: initial.fichier_nom,
          taille: initial.fichier_taille,
          mime_type: initial.mime_type,
        }
      : null,
  );

  const [coverUrl, setCoverUrl] = useState<string | null>(initial?.image_couverture_url ?? null);
  const [coverSource, setCoverSource] = useState<ImageSource | null>(initial?.image_source ?? null);

  const [featuredJusqua, setFeaturedJusqua] = useState<string | null>(initial?.featured_jusqua ?? null);
  const [notifier, setNotifier] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [busyAction, setBusyAction] = useState<null | 'publish' | 'unpublish' | 'delete'>(null);
  const [catModalOpen, setCatModalOpen] = useState(false);

  const folderSlug = useMemo(() => {
    const cat = categories.find((c) => c.id === categorieId);
    if (!cat) return 'sans-cat';
    return slugify(cat.nom);
  }, [categories, categorieId]);

  function ensureRequired(): boolean {
    if (!titre.trim()) {
      notify('error', 'Le titre est obligatoire.');
      return false;
    }
    if (!file) {
      notify('error', 'Téléverse un fichier (PDF ou image).');
      return false;
    }
    return true;
  }

  async function handleSave() {
    if (!ensureRequired() || !file) return;
    setSubmitting(true);

    const url = isNew ? '/api/admin/documents' : `/api/admin/documents/${initial!.id}`;
    const method = isNew ? 'POST' : 'PATCH';

    const res = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        titre,
        description,
        categorie_id: categorieId,
        fichier_url: file.url,
        fichier_nom: file.nom,
        fichier_taille: file.taille,
        mime_type: file.mime_type,
        image_couverture_url: coverUrl,
        image_source: coverSource,
        featured_jusqua: featuredJusqua,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? "Échec de l'enregistrement");
      return;
    }
    notify('success', isNew ? 'Document créé.' : 'Document enregistré.');
    if (isNew) {
      const { id } = (await res.json()) as { id: string };
      router.push(`/admin/documents/${id}`);
    } else {
      startTransition(() => router.refresh());
    }
  }

  async function handlePublish() {
    if (!ensureRequired()) return;
    if (statut === 'publie') return;

    // S'il y a des modifs non sauvegardées (en édition), enregistre d'abord
    if (!isNew) {
      await handleSaveSilent();
    }
    setBusyAction('publish');
    const targetId = isNew ? null : initial!.id;
    if (!targetId) {
      // En création il faut d'abord sauvegarder pour avoir un id
      setBusyAction(null);
      notify('error', 'Enregistre d’abord le document avant de publier.');
      return;
    }

    const res = await fetch(`/api/admin/documents/${targetId}/publish`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ notifier }),
    });
    setBusyAction(null);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Publication échouée');
      return;
    }
    notify('success', 'Document publié.');
    setStatut('publie');
    startTransition(() => router.refresh());
  }

  async function handleSaveSilent() {
    if (!file) return;
    await fetch(`/api/admin/documents/${initial!.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        titre,
        description,
        categorie_id: categorieId,
        fichier_url: file.url,
        fichier_nom: file.nom,
        fichier_taille: file.taille,
        mime_type: file.mime_type,
        image_couverture_url: coverUrl,
        image_source: coverSource,
        featured_jusqua: featuredJusqua,
      }),
    });
  }

  async function handleUnpublish() {
    if (isNew) return;
    setBusyAction('unpublish');
    const res = await fetch(`/api/admin/documents/${initial!.id}/unpublish`, { method: 'POST' });
    setBusyAction(null);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Action échouée');
      return;
    }
    notify('success', 'Document repassé en brouillon.');
    setStatut('brouillon');
    startTransition(() => router.refresh());
  }

  async function handleDelete() {
    if (isNew) return;
    if (!window.confirm('Supprimer ce document définitivement ?')) return;
    setBusyAction('delete');
    const res = await fetch(`/api/admin/documents/${initial!.id}`, { method: 'DELETE' });
    setBusyAction(null);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Suppression échouée');
      return;
    }
    notify('success', 'Document supprimé.');
    router.push('/admin/documents');
  }

  function useFileAsCover() {
    if (!file || !isImage(file.mime_type)) return;
    setCoverUrl(file.url);
    setCoverSource({ provider: 'upload' });
    notify('success', 'Image utilisée comme couverture.');
  }

  function clearCover() {
    setCoverUrl(null);
    setCoverSource(null);
  }

  function onCategoriesChanged(next: DocumentCategorie[]) {
    setCategories(next);
    // Si la catégorie sélectionnée a été supprimée, on clear
    if (categorieId && !next.find((c) => c.id === categorieId)) {
      setCategorieId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/documents"
          className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux documents
        </Link>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${STATUT_BADGE[statut]}`}
        >
          {STATUT_LABEL[statut]}
        </span>
      </div>

      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-600">
          Documents
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium text-ink-900 sm:text-4xl">
          {isNew ? 'Nouveau document' : 'Modifier le document'}
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          PDF ou image. 10 MB max.
        </p>
      </header>

      <div className="space-y-6">
        <Section title="Fichier" required>
          <FileUpload
            value={file}
            onChange={setFile}
            slugTitre={titre}
            folderSlug={folderSlug}
          />
        </Section>

        <Section title="Informations">
          <Field label="Titre" required>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex. : Règlement intérieur 2026"
              className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </Field>
          <Field label="Description (optionnel)" help="Bref résumé visible dans la liste.">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </Field>
          <Field label="Catégorie">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categorieId ?? ''}
                onChange={(e) => setCategorieId(e.target.value || null)}
                className="flex-1 min-w-[200px] rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">Aucune catégorie</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
              {categorieId ? (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={(() => {
                    const cat = categories.find((c) => c.id === categorieId);
                    if (!cat) return undefined;
                    const s = couleurStyle(cat.couleur);
                    return { backgroundColor: s.bg, color: s.text };
                  })()}
                >
                  {categories.find((c) => c.id === categorieId)?.nom}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => setCatModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 hover:border-brand-300"
              >
                <FolderCog className="h-4 w-4" />
                Gérer
              </button>
            </div>
          </Field>
        </Section>

        <Section
          title="Image de couverture (optionnel)"
          help="Sinon un placeholder selon le type (PDF ou image) sera affiché dans la liste."
        >
          <div className="space-y-3">
            {file && isImage(file.mime_type) && coverUrl !== file.url ? (
              <button
                type="button"
                onClick={useFileAsCover}
                className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100"
              >
                <ImageIcon className="h-4 w-4" />
                Utiliser l’image du document comme couverture
              </button>
            ) : null}
            <ImagePicker
              value={{ url: coverUrl, source: coverSource }}
              onChange={({ url, source }) => {
                setCoverUrl(url);
                setCoverSource(source);
              }}
              defaultImageUrl="/default-actu-cover.png"
              bucket="actus-images"
              folder="documents-covers"
            />
            {coverUrl && file && isPdf(file.mime_type) ? (
              <button
                type="button"
                onClick={clearCover}
                className="text-xs text-ink-500 underline hover:text-rose-600"
              >
                Retirer la couverture
              </button>
            ) : null}
          </div>
        </Section>

        <Section title="Publication">
          <div className="space-y-4">
            <label className="flex items-start gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={!!featuredJusqua}
                onChange={(e) => {
                  if (e.target.checked) {
                    const d = new Date();
                    d.setDate(d.getDate() + 7);
                    setFeaturedJusqua(d.toISOString().slice(0, 10));
                  } else {
                    setFeaturedJusqua(null);
                  }
                }}
                className="mt-0.5 h-4 w-4 rounded border-ink-300 accent-brand-500"
              />
              <span className="flex-1">
                <span className="inline-flex items-center gap-1 font-medium text-ink-800">
                  <Pin className="h-3.5 w-3.5 text-amber-500" />
                  Épingler en haut de liste
                </span>
                {featuredJusqua ? (
                  <span className="mt-1 block">
                    <input
                      type="date"
                      value={featuredJusqua}
                      onChange={(e) => setFeaturedJusqua(e.target.value || null)}
                      className="rounded-md border border-ink-200 bg-white px-2 py-1 text-xs"
                    />
                    <span className="ml-2 text-xs text-ink-500">
                      jusqu’au{' '}
                      {format(new Date(featuredJusqua), 'd MMM yyyy', { locale: fr })}
                    </span>
                  </span>
                ) : (
                  <span className="block text-xs text-ink-500">
                    Default +7 jours quand activé.
                  </span>
                )}
              </span>
            </label>

            {statut === 'brouillon' && (
              <label className="flex items-start gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={notifier}
                  onChange={(e) => setNotifier(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-ink-300 accent-brand-500"
                />
                <span>
                  <span className="font-medium text-ink-800">Notifier l’équipe à la publication</span>
                  <span className="block text-xs text-ink-500">
                    Une notification push sera envoyée à tous les salariés actifs.
                  </span>
                </span>
              </label>
            )}

            {statut === 'publie' && initial?.publie_le ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                Publié le{' '}
                {format(new Date(initial.publie_le), "d MMMM yyyy 'à' HH:mm", { locale: fr })}.
              </p>
            ) : null}
          </div>
        </Section>

        <div className="flex flex-wrap items-center gap-3 border-t border-ink-200 pt-6">
          <button
            type="button"
            onClick={() => router.push('/admin/documents')}
            disabled={submitting || busyAction !== null}
            className="btn-secondary"
          >
            Annuler
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting || busyAction !== null}
              className="ml-auto inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {busyAction === 'delete' ? 'Suppression…' : 'Supprimer'}
            </button>
          )}
          {!isNew && statut === 'publie' && (
            <button
              type="button"
              onClick={handleUnpublish}
              disabled={busyAction !== null}
              className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
            >
              <Undo2 className="h-4 w-4" />
              {busyAction === 'unpublish' ? 'Bascule…' : 'Repasser en brouillon'}
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting || busyAction !== null}
            className={`btn-secondary ${isNew ? 'ml-auto' : ''}`}
          >
            {submitting ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          {!isNew && statut === 'brouillon' && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={busyAction !== null || submitting}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {busyAction === 'publish' ? 'Publication…' : 'Publier'}
            </button>
          )}
        </div>
      </div>

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

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'sans-cat'
  );
}

function Section({
  title,
  help,
  required,
  children,
}: {
  title: string;
  help?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
          {title} {required ? <span className="text-rose-600">*</span> : null}
        </h2>
      </div>
      {help ? <p className="mb-3 text-xs text-ink-500">{help}</p> : null}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  help,
  required,
  children,
}: {
  label: string;
  help?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-700">
        {label} {required ? <span className="text-rose-600">*</span> : null}
      </label>
      {help ? <p className="mt-0.5 text-xs text-ink-500">{help}</p> : null}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
