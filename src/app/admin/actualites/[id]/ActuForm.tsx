'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import CoverImageUpload from '@/components/admin/CoverImageUpload';
import RichTextEditor from '@/components/admin/RichTextEditor';
import TagSelector from '@/components/admin/TagSelector';
import { useToast } from '@/components/Toast';
import { createClient } from '@/lib/supabase/client';
import type { ActuStatut, Actualite } from '@/lib/actus/types';

type Props = { initial: Actualite | null };

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function plus7DaysISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export default function ActuForm({ initial }: Props) {
  const router = useRouter();
  const { notify } = useToast();
  const isNew = initial === null;

  const [titre, setTitre] = useState(initial?.titre ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [corps, setCorps] = useState(initial?.corps ?? '');
  const [imageCouvertureUrl, setImageCouvertureUrl] = useState<string | null>(
    initial?.image_couverture_url ?? null,
  );
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [statut, setStatut] = useState<ActuStatut>(initial?.statut ?? 'brouillon');
  const [featuredEnabled, setFeaturedEnabled] = useState<boolean>(initial?.featured_jusqua !== null && initial?.featured_jusqua !== undefined);
  const [featuredJusqua, setFeaturedJusqua] = useState<string>(
    initial?.featured_jusqua ?? plus7DaysISO(),
  );
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleUploadInlineImage(file: File): Promise<string> {
    const supabase = createClient();
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const folder = isNew ? 'inline/draft' : `inline/${initial.id}`;
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from('actus-images')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('actus-images').getPublicUrl(path);
    return data.publicUrl;
  }

  function validate(): string | null {
    if (!titre.trim()) return 'Le titre est obligatoire.';
    if (!description.trim()) return 'La description est obligatoire.';
    if (statut === 'publie' && !corps.replace(/<[^>]+>/g, '').trim()) {
      return 'Le contenu ne peut pas être vide pour publier.';
    }
    return null;
  }

  async function handleSave() {
    const err = validate();
    if (err) {
      notify('error', err);
      return;
    }

    setSubmitting(true);

    const payload = {
      titre: titre.trim(),
      description: description.trim(),
      corps,
      image_couverture_url: imageCouvertureUrl,
      tags,
      // Au 1er save d'une nouvelle actu, on force brouillon (le passage à "publié"
      // se fait après, depuis l'écran d'édition).
      statut: isNew ? ('brouillon' as ActuStatut) : statut,
      featured_jusqua: featuredEnabled ? featuredJusqua : null,
    };

    const url = isNew ? '/api/admin/actualites' : `/api/admin/actualites/${initial.id}`;
    const method = isNew ? 'POST' : 'PATCH';

    const res = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Échec de l\'enregistrement');
      return;
    }

    if (isNew) {
      const { id } = (await res.json()) as { id: string };
      notify('success', 'Brouillon créé.');
      router.push(`/admin/actualites/${id}`);
      router.refresh();
      return;
    }

    notify('success', 'Modifications enregistrées.');
    router.refresh();
  }

  async function handleDelete() {
    if (isNew) return;
    if (!window.confirm('Supprimer définitivement cette actualité ?')) return;

    setDeleting(true);
    const res = await fetch(`/api/admin/actualites/${initial.id}`, { method: 'DELETE' });
    setDeleting(false);

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Échec de la suppression');
      return;
    }
    notify('success', 'Actualité supprimée.');
    router.push('/admin/actualites');
  }

  const canEditContent = !isNew;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">
          {isNew ? 'Nouvelle actualité' : 'Éditer'}
        </h1>
        {!isNew && (
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statut === 'publie' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
            {statut === 'publie' ? 'Publié' : 'Brouillon'}
          </span>
        )}
      </div>

      {/* Section 1 : infos de base */}
      <Section title="Informations de base">
        <Field label="Titre" required>
          <input
            type="text"
            required
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </Field>
        <Field
          label="Description"
          required
          help="Affichée dans la liste des actualités (2-3 lignes)."
        >
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </Field>
        <Field label="Tags (max 2)">
          <TagSelector value={tags} onChange={setTags} max={2} />
        </Field>
      </Section>

      {/* Section 2 : couverture */}
      <Section title="Image de couverture">
        <CoverImageUpload value={imageCouvertureUrl} onChange={setImageCouvertureUrl} />
      </Section>

      {/* Section 3 : contenu */}
      <Section
        title="Contenu"
        help={isNew ? 'Enregistre d\'abord en brouillon pour pouvoir uploader des images dans le contenu.' : undefined}
      >
        {canEditContent ? (
          <RichTextEditor
            value={corps}
            onChange={setCorps}
            onUploadImage={handleUploadInlineImage}
          />
        ) : (
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Saisis un titre + description, clique « Enregistrer » : tu pourras alors rédiger le contenu.
          </div>
        )}
      </Section>

      {/* Section 4 : publication */}
      <Section title="Publication">
        {!isNew && (
          <Field label="Statut">
            <div className="flex gap-3">
              <Radio
                checked={statut === 'brouillon'}
                onChange={() => setStatut('brouillon')}
                label="Brouillon"
              />
              <Radio
                checked={statut === 'publie'}
                onChange={() => setStatut('publie')}
                label="Publié"
              />
            </div>
            {statut === 'publie' && initial?.publie_le && (
              <p className="mt-2 text-xs text-slate-500">
                Publiée le {new Date(initial.publie_le).toLocaleString('fr-FR')}
              </p>
            )}
          </Field>
        )}

        <Field label="Mise en avant">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={featuredEnabled}
              onChange={(e) => setFeaturedEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Épingler en haut de la liste
          </label>
          {featuredEnabled && (
            <div className="mt-2">
              <label className="block text-xs text-slate-600">Jusqu&apos;au</label>
              <input
                type="date"
                value={featuredJusqua}
                min={todayISO()}
                onChange={(e) => setFeaturedJusqua(e.target.value)}
                className="mt-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          )}
        </Field>
      </Section>

      {/* Section 5 : boutons */}
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={() => router.push('/admin/actualites')}
          disabled={submitting || deleting}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          Annuler
        </button>

        {!isNew && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting || deleting}
            className="rounded-md border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50 ml-auto"
          >
            {deleting ? 'Suppression…' : 'Supprimer'}
          </button>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={submitting || deleting}
          className={`rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 ${isNew ? 'ml-auto' : ''}`}
        >
          {submitting ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, help, children }: { title: string; help?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      {help && <p className="mt-1 text-xs text-slate-500">{help}</p>}
      <div className="mt-4 space-y-4">{children}</div>
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
      <label className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      {help && <p className="mt-0.5 text-xs text-slate-500">{help}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Radio({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 border-slate-300 text-slate-900 focus:ring-slate-500"
      />
      {label}
    </label>
  );
}
