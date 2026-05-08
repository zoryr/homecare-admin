'use client';

import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { SurveyStatut } from '@/lib/sondages/types';

type Props = {
  initialQuery: string;
  initialStatut: SurveyStatut | null;
};

const STATUTS: Array<{ value: SurveyStatut; label: string }> = [
  { value: 'brouillon', label: 'Brouillons' },
  { value: 'publie', label: 'Publiés' },
  { value: 'ferme', label: 'Fermés' },
];

export default function SondageFilters({ initialQuery, initialStatut }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [statut, setStatut] = useState<SurveyStatut | null>(initialStatut);

  function pushFilters(next: { q?: string; statut?: SurveyStatut | null }) {
    const params = new URLSearchParams();
    const finalQ = next.q ?? q;
    const finalStatut = next.statut ?? statut;
    if (finalQ.trim()) params.set('q', finalQ.trim());
    if (finalStatut) params.set('statut', finalStatut);
    router.push(`/admin/sondages${params.toString() ? `?${params.toString()}` : ''}`);
  }

  function selectStatut(v: SurveyStatut | null) {
    setStatut(v);
    pushFilters({ statut: v });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    pushFilters({});
  }

  function reset() {
    setQ('');
    setStatut(null);
    router.push('/admin/sondages');
  }

  const hasActive = q.trim() || statut;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2 sm:max-w-md">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher par titre…"
            className="w-full rounded-full border border-ink-200 bg-white py-1.5 pl-9 pr-3 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <button type="submit" className="btn-secondary !py-1.5">
          Chercher
        </button>
      </form>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => selectStatut(null)}
          className={
            !statut
              ? 'rounded-full bg-ink-900 px-3 py-1 text-xs font-medium text-white'
              : 'rounded-full border border-ink-200 bg-white px-3 py-1 text-xs text-ink-600 hover:border-ink-300'
          }
        >
          Tous
        </button>
        {STATUTS.map((s) => {
          const active = statut === s.value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => selectStatut(s.value)}
              className={
                active
                  ? 'rounded-full bg-ink-900 px-3 py-1 text-xs font-medium text-white'
                  : 'rounded-full border border-ink-200 bg-white px-3 py-1 text-xs text-ink-600 hover:border-ink-300'
              }
            >
              {s.label}
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
  );
}
