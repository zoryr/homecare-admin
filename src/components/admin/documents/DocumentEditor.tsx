'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Film,
  Image as ImageIcon,
  Newspaper,
  Pin,
  Send,
  Trash2,
  Undo2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

import FileUpload, { type UploadedFile } from './FileUpload';
import ImagePicker from '@/components/admin/ImagePicker';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { useToast } from '@/components/Toast';
import { isImage, isPdf } from '@/lib/documents/constants';
import { createClient } from '@/lib/supabase/client';
import type {
  DocumentRow,
  DocumentRubrique,
  DocumentSousRubrique,
  DocumentStatut,
} from '@/lib/documents/types';
import type { ImageSource } from '@/lib/images/types';

type Props = {
  initial: DocumentRow | null;
};

/** Type de contenu pour Avantages / Conseils. */
type ContentType = 'pdf' | 'image' | 'video' | 'flipbook' | 'article';

const CONTENT_TYPES: Array<{ value: ContentType; label: string; icon: React.ReactNode }> = [
  { value: 'pdf', label: '📄 PDF', icon: <FileText className="h-4 w-4" /> },
  { value: 'image', label: '🖼️ Image', icon: <ImageIcon className="h-4 w-4" /> },
  { value: 'video', label: '🎬 Vidéo verticale', icon: <Film className="h-4 w-4" /> },
  { value: 'flipbook', label: '📕 Flipbook Heyzine', icon: <BookOpen className="h-4 w-4" /> },
  { value: 'article', label: '📝 Article rédigé', icon: <Newspaper className="h-4 w-4" /> },
];

/** Retire le fragment #page/N (Heyzine) pour ouvrir le flipbook à la page 1. */
function normalizeFlipbookUrl(u: string): string {
  return u
    .split('#')[0]
    .replace(/([?&])(page|p)=[^&]*/gi, '$1')
    .replace(/[?&]$/, '')
    .trim();
}

const STATUT_BADGE: Record<DocumentStatut, string> = {
  brouillon: 'bg-slate-100 text-slate-700',
  publie: 'bg-emerald-100 text-emerald-800',
};
const STATUT_LABEL: Record<DocumentStatut, string> = {
  brouillon: 'Brouillon',
  publie: 'Publié',
};

function initialContentType(initial: DocumentRow | null): ContentType {
  if (!initial) return 'pdf';
  if (initial.est_article) return 'article';
  if (initial.flipbook_url) return 'flipbook';
  if (initial.est_video_verticale) return 'video';
  if (initial.mime_type && isImage(initial.mime_type)) return 'image';
  return 'pdf';
}

export default function DocumentEditor({ initial }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notify } = useToast();
  const [, startTransition] = useTransition();
  const isNew = initial === null;

  const rubriqueFromQuery = searchParams.get('rubrique');
  const rubrique: DocumentRubrique =
    initial?.rubrique ??
    (rubriqueFromQuery === 'avantages' || rubriqueFromQuery === 'conseils'
      ? rubriqueFromQuery
      : 'infos_pro');

  const sousFromQuery = searchParams.get('sous');
  const [sousRubrique, setSousRubrique] = useState<DocumentSousRubrique>(
    initial?.sous_rubrique === 'informations_personnel' || sousFromQuery === 'informations_personnel'
      ? 'informations_personnel'
      : 'notes_service',
  );

  // Type de contenu : pour Avantages / Conseils (tous types), et pour les
  // Notes de service / Infos personnel (fichier + article rédigé, mais pas flipbook).
  const isInfosProArticleZone =
    rubrique === 'infos_pro' &&
    (sousRubrique === 'notes_service' || sousRubrique === 'informations_personnel');
  const showContentType = rubrique === 'avantages' || rubrique === 'conseils' || isInfosProArticleZone;
  // Le flipbook n'est proposé que pour Avantages / Conseils (Infos pro : Livret /
  // Règlement passent par leur formulaire dédié).
  const allowFlipbook = rubrique === 'avantages' || rubrique === 'conseils';
  const availableTypes = CONTENT_TYPES.filter((ct) => ct.value !== 'flipbook' || allowFlipbook);
  const [contentType, setContentType] = useState<ContentType>(initialContentType(initial));
  const isFlipbookMode = allowFlipbook && contentType === 'flipbook';
  const isArticleMode = showContentType && contentType === 'article';

  const [statut, setStatut] = useState<DocumentStatut>(initial?.statut ?? 'brouillon');
  const [titre, setTitre] = useState(initial?.titre ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [flipbookUrl, setFlipbookUrl] = useState(initial?.flipbook_url ?? '');
  const [contenuHtml, setContenuHtml] = useState(initial?.contenu_html ?? '');

  const [file, setFile] = useState<UploadedFile | null>(
    initial && initial.fichier_url
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

  const folderSlug = rubrique;

  async function handleUploadInlineImage(f: File): Promise<string> {
    const supabase = createClient();
    const ext = f.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const folder = isNew ? 'articles/draft' : `articles/${initial!.id}`;
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from('actus-images')
      .upload(path, f, { contentType: f.type, upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('actus-images').getPublicUrl(path);
    return data.publicUrl;
  }

  function articleIsEmpty(): boolean {
    return contenuHtml.replace(/<[^>]+>/g, '').trim().length === 0;
  }

  function ensureRequired(): boolean {
    if (!titre.trim()) {
      notify('error', 'Le titre est obligatoire.');
      return false;
    }
    if (isArticleMode) {
      if (articleIsEmpty()) {
        notify('error', "Rédigez le contenu de l'article.");
        return false;
      }
    } else if (isFlipbookMode) {
      if (!flipbookUrl.trim()) {
        notify('error', "Renseignez l'URL du flipbook Heyzine.");
        return false;
      }
    } else if (!file) {
      notify('error', 'Téléversez un fichier (PDF, image ou vidéo).');
      return false;
    }
    return true;
  }

  function buildPayload() {
    const base = {
      titre,
      description,
      image_couverture_url: coverUrl,
      image_source: coverSource,
      featured_jusqua: featuredJusqua,
      rubrique,
      sous_rubrique: rubrique === 'infos_pro' ? sousRubrique : null,
      est_article: isArticleMode,
    };
    if (isArticleMode) {
      return {
        ...base,
        contenu_html: contenuHtml,
        contenu_json: null,
        flipbook_url: null,
      };
    }
    if (isFlipbookMode) {
      return { ...base, flipbook_url: normalizeFlipbookUrl(flipbookUrl) || null, contenu_html: null };
    }
    return {
      ...base,
      fichier_url: file!.url,
      fichier_nom: file!.nom,
      fichier_taille: file!.taille,
      mime_type: file!.mime_type,
      flipbook_url: null,
      contenu_html: null,
    };
  }

  async function handleSave() {
    if (!ensureRequired()) return;
    setSubmitting(true);

    const url = isNew ? '/api/admin/documents' : `/api/admin/documents/${initial!.id}`;
    const method = isNew ? 'POST' : 'PATCH';

    const res = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(buildPayload()),
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

  async function handleSaveSilent() {
    await fetch(`/api/admin/documents/${initial!.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(buildPayload()),
    });
  }

  async function handlePublish() {
    if (!ensureRequired()) return;
    if (statut === 'publie') return;

    if (!isNew) {
      await handleSaveSilent();
    }
    setBusyAction('publish');
    const targetId = isNew ? null : initial!.id;
    if (!targetId) {
      setBusyAction(null);
      notify('error', 'Enregistrez d’abord le document avant de publier.');
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
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUT_BADGE[statut]}`}>
          {STATUT_LABEL[statut]}
        </span>
      </div>

      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-600">Documents</p>
        <h1 className="mt-1 font-display text-3xl font-medium text-ink-900 sm:text-4xl">
          {isNew ? 'Nouveau document' : 'Modifier le document'}
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          {isArticleMode
            ? 'Article rédigé (éditeur de texte enrichi).'
            : isFlipbookMode
              ? 'Flipbook Heyzine (lien).'
              : 'PDF, image ou vidéo verticale.'}
        </p>
      </header>

      <div className="space-y-6">
        {showContentType ? (
          <Section title="Type de contenu">
            <div className="flex flex-wrap gap-2">
              {availableTypes.map((ct) => (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => setContentType(ct.value)}
                  className={
                    contentType === ct.value
                      ? 'inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white'
                      : 'inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 hover:border-brand-300'
                  }
                >
                  {ct.icon}
                  {ct.label}
                </button>
              ))}
            </div>
          </Section>
        ) : null}

        {isArticleMode ? (
          <Section title="Contenu de l'article" required>
            <RichTextEditor
              value={contenuHtml}
              onChange={setContenuHtml}
              onUploadImage={handleUploadInlineImage}
              placeholder="Rédigez votre article… (titres, listes, images, encadrés)"
            />
          </Section>
        ) : isFlipbookMode ? (
          <Section title="Flipbook Heyzine" required>
            <Field label="URL du flipbook" required>
              <input
                type="url"
                value={flipbookUrl}
                onChange={(e) => setFlipbookUrl(e.target.value)}
                placeholder="https://heyzine.com/flip-book/xxxxx"
                className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </Field>
            <details className="text-sm text-ink-600">
              <summary className="cursor-pointer text-brand-700 hover:underline">
                Comment obtenir une URL Heyzine ?
              </summary>
              <div className="mt-2 space-y-1 rounded-lg border border-ink-100 bg-ink-50 p-3 text-xs text-ink-600">
                <p>1. Rendez-vous sur heyzine.com et importez votre PDF.</p>
                <p>2. Une fois le flipbook créé, cliquez sur « Partager ».</p>
                <p>
                  3. Copiez le lien public (de la forme{' '}
                  <span className="font-mono">https://heyzine.com/flip-book/…</span>) et collez-le
                  ci-dessus.
                </p>
              </div>
            </details>
          </Section>
        ) : (
          <Section title="Fichier" required>
            <FileUpload value={file} onChange={setFile} slugTitre={titre} folderSlug={folderSlug} />
          </Section>
        )}

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
          {rubrique === 'infos_pro' ? (
            <Field label="Sous-rubrique" help="Où ranger ce document dans « Infos professionnelles ».">
              <select
                value={sousRubrique}
                onChange={(e) => setSousRubrique(e.target.value as DocumentSousRubrique)}
                className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="notes_service">Notes de service</option>
                <option value="informations_personnel">Informations pour le personnel</option>
              </select>
            </Field>
          ) : null}
        </Section>

        <Section
          title="Image de couverture (optionnel)"
          help="Sinon un placeholder selon le type sera affiché dans la liste."
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
            {coverUrl && (isFlipbookMode || (file && isPdf(file.mime_type))) ? (
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
                      jusqu’au {format(new Date(featuredJusqua), 'd MMM yyyy', { locale: fr })}
                    </span>
                  </span>
                ) : (
                  <span className="block text-xs text-ink-500">Default +7 jours quand activé.</span>
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
                Publié le {format(new Date(initial.publie_le), "d MMMM yyyy 'à' HH:mm", { locale: fr })}.
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
    </div>
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
