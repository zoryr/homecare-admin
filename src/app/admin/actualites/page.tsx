import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';

import SearchBar from './SearchBar';
import { createClient } from '@/lib/supabase/server';
import { TAG_COLOR_CLASSES, getTagById } from '@/lib/actus/tags';
import type { Actualite } from '@/lib/actus/types';

type Filter = 'toutes' | 'publiees' | 'brouillons';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'toutes', label: 'Toutes' },
  { id: 'publiees', label: 'Publiées' },
  { id: 'brouillons', label: 'Brouillons' },
];

export default async function ActualitesListPage({
  searchParams,
}: {
  searchParams: { filter?: string; q?: string };
}) {
  const filter: Filter = (FILTERS.find((f) => f.id === searchParams.filter)?.id ?? 'toutes') as Filter;
  const q = (searchParams.q ?? '').trim();

  const supabase = createClient();
  let query = supabase
    .from('actualites')
    .select('*')
    .order('publie_le', { ascending: false, nullsFirst: false })
    .order('cree_le', { ascending: false });

  if (filter === 'publiees') query = query.eq('statut', 'publie');
  if (filter === 'brouillons') query = query.eq('statut', 'brouillon');
  if (q) query = query.ilike('titre', `%${q}%`);

  const { data, error } = await query;
  if (error) {
    return <p className="text-rose-700">Erreur de chargement : {error.message}</p>;
  }
  const actus = (data ?? []) as Actualite[];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Actualités</h1>
        <Link
          href="/admin/actualites/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + Nouvelle actualité
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-md bg-slate-100 p-1">
          {FILTERS.map((f) => {
            const params = new URLSearchParams();
            if (f.id !== 'toutes') params.set('filter', f.id);
            if (q) params.set('q', q);
            const href = `/admin/actualites${params.toString() ? `?${params.toString()}` : ''}`;
            const active = filter === f.id;
            return (
              <Link
                key={f.id}
                href={href}
                className={`rounded px-3 py-1 text-sm font-medium transition ${active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
        <SearchBar initialQuery={q} filter={filter === 'toutes' ? null : filter} />
      </div>

      {actus.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          {q || filter !== 'toutes'
            ? "Aucune actualité ne correspond à ces critères."
            : "Aucune actualité pour le moment. Crée la première."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {actus.map((a) => (
            <ActuCard key={a.id} actu={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function ActuCard({ actu }: { actu: Actualite }) {
  const isFeatured =
    actu.featured_jusqua !== null &&
    new Date(actu.featured_jusqua).getTime() >= new Date(new Date().toDateString()).getTime();
  const dateRef = actu.publie_le ?? actu.cree_le;
  const dateLabel = formatDistanceToNow(new Date(dateRef), { locale: fr, addSuffix: true });

  return (
    <Link
      href={`/admin/actualites/${actu.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="relative aspect-video w-full bg-slate-100">
        {actu.image_couverture_url ? (
          <Image
            src={actu.image_couverture_url}
            alt={actu.titre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">Pas d&apos;image</div>
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {actu.statut === 'brouillon' && (
            <span className="rounded-full bg-slate-900/70 px-2 py-0.5 text-xs font-medium text-white">
              Brouillon
            </span>
          )}
          {isFeatured && (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
              📌 Épinglée
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-slate-700">
          {actu.titre}
        </h2>
        <p className="line-clamp-2 text-sm text-slate-600">{actu.description}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap gap-1">
            {actu.tags.map((tagId) => {
              const tag = getTagById(tagId);
              if (!tag) return null;
              return (
                <span key={tagId} className={`rounded-full px-2 py-0.5 ${TAG_COLOR_CLASSES[tag.color]}`}>
                  {tag.label}
                </span>
              );
            })}
          </div>
          <span className="text-slate-500">{dateLabel}</span>
        </div>
      </div>
    </Link>
  );
}
