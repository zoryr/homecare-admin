'use client';

import { Trash2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';

import type { VideoBienvenue } from './page';
import { useToast } from '@/components/Toast';
import { createClient } from '@/lib/supabase/client';

const MAX_SIZE = 100 * 1024 * 1024; // 100 MB
const ACCEPTED = ['video/mp4', 'video/quicktime'];

export default function ParametresClient({ initial }: { initial: VideoBienvenue }) {
  const router = useRouter();
  const { notify } = useToast();
  const [, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const [url, setUrl] = useState<string | null>(initial.url);
  const [actif, setActif] = useState(initial.actif);
  const [dureeSkipSec, setDureeSkipSec] = useState(Math.round((initial.duree_skip_ms ?? 5000) / 1000));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleFile(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      notify('error', 'Format non supporté (MP4 ou MOV uniquement).');
      return;
    }
    if (file.size > MAX_SIZE) {
      notify('error', 'Fichier trop volumineux (max 100 MB).');
      return;
    }
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp4';
    const path = `videos/bienvenue-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('app-assets')
      .upload(path, file, { contentType: file.type, upsert: false });
    setUploading(false);
    if (error) {
      notify('error', error.message);
      return;
    }
    const { data } = supabase.storage.from('app-assets').getPublicUrl(path);
    setUrl(data.publicUrl);
    notify('success', 'Vidéo uploadée. Cliquez « Enregistrer » pour appliquer.');
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void handleFile(f);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function save() {
    setSaving(true);
    const res = await fetch('/api/admin/parametres/video-bienvenue', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url, actif, duree_skip_ms: Math.round(dureeSkipSec * 1000) }),
    });
    setSaving(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Échec');
      return;
    }
    notify('success', 'Paramètres enregistrés.');
    startTransition(() => router.refresh());
  }

  async function removeVideo() {
    if (!window.confirm('Supprimer la vidéo de bienvenue ?')) return;
    const res = await fetch('/api/admin/parametres/video-bienvenue/fichier', { method: 'DELETE' });
    if (!res.ok) {
      notify('error', 'Suppression échouée.');
      return;
    }
    setUrl(null);
    setActif(false);
    notify('success', 'Vidéo supprimée.');
    startTransition(() => router.refresh());
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-600">Réglages</p>
        <h1 className="mt-1 font-display text-4xl font-medium text-ink-900">Paramètres</h1>
      </header>

      <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
        <h2 className="font-display text-xl font-medium text-ink-900">Vidéo de bienvenue</h2>
        <p className="mt-1 text-sm text-ink-500">
          Affichée à chaque salarié lors de sa 1re connexion à l&apos;app.
        </p>

        {/* Toggle actif */}
        <label className="mt-5 flex items-center gap-3 text-sm text-ink-800">
          <input
            type="checkbox"
            checked={actif}
            onChange={(e) => setActif(e.target.checked)}
            className="h-4 w-4 rounded border-ink-300 accent-brand-500"
          />
          Activer la vidéo de bienvenue
        </label>

        {/* Vidéo */}
        <div className="mt-5">
          {url ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video src={url} controls className="max-h-80 w-full rounded-xl bg-black" />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:border-brand-300 disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Upload…' : 'Remplacer'}
                </button>
                <button
                  type="button"
                  onClick={removeVideo}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-300 bg-ink-50/40 p-8 text-center transition hover:border-brand-300 disabled:opacity-50"
            >
              <Upload className="h-7 w-7 text-ink-400" />
              <span className="text-sm font-medium text-ink-700">
                {uploading ? 'Téléversement…' : 'Uploader une vidéo'}
              </span>
              <span className="text-xs text-ink-400">MP4 ou MOV — max 100 MB</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".mp4,.mov,video/mp4,video/quicktime"
            className="hidden"
            onChange={onPick}
          />
        </div>

        {/* Délai skip */}
        <div className="mt-5">
          <label className="block text-sm font-medium text-ink-700">
            Délai avant de pouvoir passer la vidéo (secondes)
          </label>
          <input
            type="number"
            min={0}
            max={30}
            value={dureeSkipSec}
            onChange={(e) => setDureeSkipSec(Math.max(0, Math.min(30, Number(e.target.value) || 0)))}
            className="mt-1.5 w-28 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="mt-6 border-t border-ink-100 pt-5">
          <button type="button" onClick={save} disabled={saving || uploading} className="btn-primary">
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </div>
      </section>
    </div>
  );
}
