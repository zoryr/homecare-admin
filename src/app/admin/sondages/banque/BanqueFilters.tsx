'use client';

import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { QUESTION_TAGS, QUESTION_TYPES } from '@/lib/sondages/constants';
import type { QuestionType } from '@/lib/sondages/types';

type Props = {
  initialQuery: string;
  initialTags: string[];
  initialType: QuestionType | null;
};

export default function BanqueFilters({ initialQuery, initialTags, initialType }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [type, setType] = useState<QuestionType | ''>(initialType ?? '');

  function pushFilters(next: { q?: string; tags?: string[]; type?: QuestionType | '' }) {
    const params = new URLSearchParams();
    const finalQ = next.q ?? q;
    const finalTags = next.tags ?? tags;
    const finalType = next.type ?? type;
    if (finalQ.trim()) params.set('q', finalQ.trim());
    finalTags.forEach((t) => params.append('tag', t));
    if (finalType) params.set('type', finalType);
    router.push(`/admin/sondages/banque${params.toString() ? `?${params.toString()}` : ''}`);
  }

  function toggleTag(t: string) {
    const next = tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t];
    setTags(next);
    pushFilters({ tags: next });
  }

  function changeType(v: QuestionType | '') {
    setType(v);
    pushFilters({ type: v });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    pushFilters({});
  }

  function reset() {
    setQ('');
    setTags([]);
    setType('');
    router.push('/admin/sondages/banque');
  }

  const hasActive = q.trim() || tags.length > 0 || type;

  return (
    <div className="space-y-3">
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

        <select
          value={type}
          onChange={(e) => changeType(e.target.value as QuestionType | '')}
          className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">Tous les types</option>
          {QUESTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

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

      <div className="flex flex-wrap gap-1">
        {QUESTION_TAGS.map((t) => {
          const active = tags.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggleTag(t)}
              className={
                active
                  ? 'rounded-full bg-brand-500 px-3 py-0.5 text-xs font-medium text-white shadow-sm'
                  : 'rounded-full border border-ink-200 bg-white px-3 py-0.5 text-xs text-ink-600 hover:border-brand-300 hover:bg-brand-50'
              }
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
