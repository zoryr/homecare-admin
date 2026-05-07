'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import CoverImageUpload from '@/components/admin/CoverImageUpload';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { useToast } from '@/components/Toast';
import { createClient } from '@/lib/supabase/client';
import type { Apropos, AproposKey } from '@/lib/apropos/types';

type Props = {
  publicRow: Apropos;
  interneRow: Apropos;
};

const TABS: { id: AproposKey; label: string; help: string }[] = [
  {
    id: 'public',
    label: 'Public',
    help: "Visible par tout le monde, AVANT login (page d'accueil de l'app et site public).",
  },
  {
    id: 'interne',
    label: 'Interne',
    help: 'Visible uniquement par les salariés connectés (depuis l\'écran "À propos" dans l\'app).',
  },
];

export default function AproposEditor({ publicRow, interneRow }: Props) {
  const router = useRouter();
  const { notify } = useToast();
  const [, startTransition] = useTransition();

  const [tab, setTab] = useState<AproposKey>('public');
  const [pub, setPub] = useState<Apropos>(publicRow);
  const [intRow, setIntRow] = useState<Apropos>(interneRow);
  const [submitting, setSubmitting] = useState(false);

  const current = tab === 'public' ? pub : intRow;
  const setCurrent = tab === 'public' ? setPub : setIntRow;

  function update<K extends keyof Apropos>(key: K, value: Apropos[K]) {
    setCurrent({ ...current, [key]: value });
  }

  async function handleUploadInlineImage(file: File): Promise<string> {
    const supabase = createClient();
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `inline/${tab}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from('apropos-images')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('apropos-images').getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSave() {
    setSubmitting(true);
    const res = await fetch('/api/admin/apropos', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        cle: current.cle,
        image_url: current.image_url,
        corps: current.corps,
        email_contact: current.email_contact,
        telephone: current.telephone,
        adresse: current.adresse,
        site_web: current.site_web,
        facebook_url: current.facebook_url,
        instagram_url: current.instagram_url,
        linkedin_url: current.linkedin_url,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? "Échec de l'enregistrement");
      return;
    }
    notify('success', 'Modifications enregistrées.');
    startTransition(() => router.refresh());
  }

  const tabMeta = TABS.find((t) => t.id === tab)!;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-600">
          Communication
        </p>
        <h1 className="mt-1 font-display text-4xl font-medium text-ink-900">À propos</h1>
        <p className="mt-2 text-sm text-ink-500">
          2 versions du contenu &laquo; À propos &raquo; — l&apos;une publique, l&apos;autre réservée aux salariés.
        </p>
      </header>

      {/* Tabs */}
      <div className="inline-flex gap-1 rounded-full border border-ink-200 bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={
              tab === t.id
                ? 'rounded-full bg-brand-500 px-4 py-1.5 text-sm font-medium text-white shadow-sm'
                : 'rounded-full px-4 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900'
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        {tabMeta.help}
      </p>

      <Section title="Image de couverture">
        <CoverImageUpload
          value={current.image_url}
          onChange={(url) => update('image_url', url)}
          bucket="apropos-images"
          folder={`couvertures/${tab}`}
        />
      </Section>

      <Section title="Texte">
        <RichTextEditor
          value={current.corps}
          onChange={(html) => update('corps', html)}
          onUploadImage={handleUploadInlineImage}
        />
      </Section>

      <Section title="Coordonnées">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email">
            <input
              type="email"
              value={current.email_contact ?? ''}
              onChange={(e) => update('email_contact', e.target.value || null)}
              className="input"
              placeholder="agence06@homeandcare.fr"
            />
          </Field>
          <Field label="Téléphone">
            <input
              type="tel"
              value={current.telephone ?? ''}
              onChange={(e) => update('telephone', e.target.value || null)}
              className="input"
              placeholder="04 93 …"
            />
          </Field>
          <Field label="Adresse" wide>
            <input
              type="text"
              value={current.adresse ?? ''}
              onChange={(e) => update('adresse', e.target.value || null)}
              className="input"
              placeholder="Mouans-Sartoux, Pays de Grasse (06)"
            />
          </Field>
          <Field label="Site web" wide>
            <input
              type="url"
              value={current.site_web ?? ''}
              onChange={(e) => update('site_web', e.target.value || null)}
              className="input"
              placeholder="https://www.homeandcare.fr"
            />
          </Field>
          <Field label="Facebook">
            <input
              type="url"
              value={current.facebook_url ?? ''}
              onChange={(e) => update('facebook_url', e.target.value || null)}
              className="input"
              placeholder="https://facebook.com/…"
            />
          </Field>
          <Field label="Instagram">
            <input
              type="url"
              value={current.instagram_url ?? ''}
              onChange={(e) => update('instagram_url', e.target.value || null)}
              className="input"
              placeholder="https://instagram.com/…"
            />
          </Field>
          <Field label="LinkedIn" wide>
            <input
              type="url"
              value={current.linkedin_url ?? ''}
              onChange={(e) => update('linkedin_url', e.target.value || null)}
              className="input"
              placeholder="https://linkedin.com/company/…"
            />
          </Field>
        </div>
      </Section>

      <div className="flex justify-end gap-3 border-t border-ink-200 pt-6">
        <button
          type="button"
          onClick={() => startTransition(() => router.refresh())}
          disabled={submitting}
          className="btn-secondary"
        >
          Annuler les modifications
        </button>
        <button type="button" onClick={handleSave} disabled={submitting} className="btn-primary">
          {submitting ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid #e8e6df;
          background: white;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          border-radius: 0.5rem;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .input:focus {
          outline: none;
          border-color: #29a4b8;
          box-shadow: 0 0 0 3px rgba(41, 164, 184, 0.2);
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-6">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <label className="block text-sm font-medium text-ink-700">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
