'use client';

import { useCallback, useRef, useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import type {
  ImageProvider,
  ImageSource,
  ImportResponse,
  SearchResponse,
  SearchResult,
} from '@/lib/images/types';

type PickerValue = { url: string | null; source: ImageSource | null };

type Props = {
  value: PickerValue;
  onChange: (next: PickerValue) => void;
  defaultImageUrl: string;
};

type SearchProvider = Extract<ImageProvider, 'unsplash' | 'pexels'>;
type Tab = SearchProvider | 'upload';

const SUGGESTIONS = ['équipe', 'sourire', 'soin', 'café', 'famille', 'fleurs', 'fête', 'main'];

const TAB_LABELS: Record<Tab, string> = {
  unsplash: 'Unsplash',
  pexels: 'Pexels',
  upload: 'Téléverser',
};

export default function ImagePicker({ value, onChange, defaultImageUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('unsplash');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showAttribution =
    value.source && (value.source.provider === 'unsplash' || value.source.provider === 'pexels');

  const search = useCallback(
    async (provider: SearchProvider, q: string, p: number) => {
      if (!q.trim()) return;
      setSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(
          `/api/admin/images/search/${provider}?q=${encodeURIComponent(q)}&page=${p}&per_page=21`,
        );
        if (!res.ok) {
          const { error } = await res.json().catch(() => ({ error: `Erreur ${res.status}` }));
          throw new Error(error ?? `Erreur ${res.status}`);
        }
        const json = (await res.json()) as SearchResponse;
        setResults((prev) => (p === 1 ? json.results : [...prev, ...json.results]));
        setTotalPages(json.total_pages);
        setPage(p);
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : 'Erreur de recherche');
        setResults([]);
        setTotalPages(0);
      } finally {
        setSearching(false);
      }
    },
    [],
  );

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (tab === 'upload') return;
    void search(tab, query, 1);
  }

  function handleSuggestion(s: string) {
    setQuery(s);
    if (tab === 'unsplash' || tab === 'pexels') {
      void search(tab, s, 1);
    }
  }

  function switchTab(next: Tab) {
    setTab(next);
    setQuery('');
    setResults([]);
    setPage(1);
    setTotalPages(0);
    setSearchError(null);
  }

  async function handlePick(result: SearchResult) {
    if (tab === 'upload' || importingId) return;
    setImportingId(result.id);
    try {
      const res = await fetch('/api/admin/images/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: tab,
          full_url: result.full_url,
          photographer_name: result.photographer_name,
          photographer_url: result.photographer_url,
          source_url: result.source_url,
          download_location: result.download_location,
        }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: `Erreur ${res.status}` }));
        throw new Error(error ?? `Erreur ${res.status}`);
      }
      const data = (await res.json()) as ImportResponse;
      onChange({ url: data.url, source: data.image_source });
      setOpen(false);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Échec de l'import");
    } finally {
      setImportingId(null);
    }
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `couvertures/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from('actus-images')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('actus-images').getPublicUrl(path);
      onChange({ url: data.publicUrl, source: { provider: 'upload' } });
      setOpen(false);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleResetToDefault() {
    onChange({ url: defaultImageUrl, source: { provider: 'default' } });
    setOpen(false);
  }

  return (
    <div className="space-y-3">
      {/* Aperçu */}
      <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
        {value.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value.url}
            alt="Couverture"
            className="aspect-video w-full object-cover"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center text-sm text-slate-400">
            Pas d&apos;image
          </div>
        )}
      </div>

      {showAttribution && value.source && (
        <p className="text-xs text-slate-500">
          Photo par{' '}
          <a
            href={value.source.photographer_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-700 underline"
          >
            {value.source.photographer_name}
          </a>{' '}
          sur {value.source.provider === 'unsplash' ? 'Unsplash' : 'Pexels'}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          {open ? 'Fermer' : 'Modifier'}
        </button>
        <button
          type="button"
          onClick={handleResetToDefault}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Réinitialiser au logo
        </button>
      </div>

      {/* Panneau */}
      {open && (
        <div className="rounded-md border border-slate-200 bg-white p-4">
          {/* Tabs */}
          <div className="mb-4 flex gap-4 border-b border-slate-200">
            {(Object.keys(TAB_LABELS) as Tab[]).map((id) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => switchTab(id)}
                  className={
                    active
                      ? 'border-b-2 border-brand-500 px-1 pb-2 text-sm font-medium text-brand-700'
                      : 'px-1 pb-2 text-sm text-slate-500 hover:text-slate-700'
                  }
                >
                  {TAB_LABELS[id]}
                </button>
              );
            })}
          </div>

          {tab === 'upload' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex aspect-video w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-slate-600 transition hover:border-brand-300 hover:bg-brand-50/40 disabled:opacity-50"
              >
                {uploading ? (
                  <span>Upload en cours…</span>
                ) : (
                  <>
                    <span className="font-medium">Cliquer pour téléverser une image</span>
                    <span className="mt-1 text-xs text-slate-500">JPG, PNG, WEBP</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Rechercher sur ${TAB_LABELS[tab]}…`}
                  className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="submit"
                  disabled={searching || !query.trim()}
                  className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  Rechercher
                </button>
              </form>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-500">Suggestions :</span>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestion(s)}
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {searchError && (
                <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {searchError}
                </p>
              )}

              <div className="mt-4">
                {searching && results.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">Recherche…</p>
                ) : !searching && results.length === 0 && query ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    Aucun résultat. Essaie un autre mot-clé.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {results.map((r) => {
                        const isImporting = importingId === r.id;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            disabled={!!importingId}
                            onClick={() => handlePick(r)}
                            className="group relative aspect-[4/3] overflow-hidden rounded-md border border-slate-200 bg-slate-100 transition hover:scale-[1.02] disabled:opacity-50"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={r.thumb_url}
                              alt={r.description ?? ''}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                              <p className="truncate text-[10px] font-medium text-white">
                                {r.photographer_name}
                              </p>
                            </div>
                            {isImporting && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-medium text-brand-700">
                                Import…
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {results.length > 0 && page < totalPages && (
                      <div className="mt-4 flex justify-center">
                        <button
                          type="button"
                          disabled={searching}
                          onClick={() => void search(tab, query, page + 1)}
                          className="rounded-md border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        >
                          {searching ? 'Chargement…' : 'Charger plus'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
