'use client';

import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMemo, useState } from 'react';

import type { TextResult } from '@/lib/sondages/results';

type Props = {
  results: TextResult;
  search?: string;
  pageSize?: number;
};

export default function TextResponsesList({ results, search, pageSize = 10 }: Props) {
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  const list = useMemo(() => results.responses, [results.responses]);
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));

  if (results.total === 0) {
    return (
      <p className="rounded-lg bg-ink-50 p-3 text-sm italic text-ink-500">
        Aucune réponse à afficher pour cette question.
      </p>
    );
  }

  if (list.length === 0 && search) {
    return (
      <p className="rounded-lg bg-ink-50 p-3 text-sm italic text-ink-500">
        Aucune réponse ne contient « {search} ».
      </p>
    );
  }

  const displayed = showAll ? list : list.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {displayed.map((r, idx) => {
          const globalIdx = showAll ? idx : (page - 1) * pageSize + idx;
          return (
            <div
              key={`${r.submission_token}-${globalIdx}`}
              className="rounded-lg border-l-2 border-brand-500 bg-ink-50 p-3"
            >
              <p className="mb-1 text-xs text-ink-500">
                Anonyme #{globalIdx + 1} ·{' '}
                <span title={format(new Date(r.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}>
                  {formatDistanceToNow(new Date(r.created_at), { locale: fr, addSuffix: true })}
                </span>
              </p>
              <p className="whitespace-pre-wrap text-sm text-ink-700">{highlight(r.text, search)}</p>
            </div>
          );
        })}
      </div>

      {!showAll && totalPages > 1 ? (
        <div className="flex items-center justify-between gap-2 pt-1 text-xs">
          <span className="text-ink-500">
            Page {page} / {totalPages} · {list.length} réponse{list.length > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border border-ink-200 bg-white px-2 py-1 hover:border-brand-300 disabled:opacity-40"
            >
              ← Précédent
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-md border border-ink-200 bg-white px-2 py-1 hover:border-brand-300 disabled:opacity-40"
            >
              Suivant →
            </button>
            {list.length > pageSize ? (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="ml-2 rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-brand-700 hover:bg-brand-100"
              >
                Voir tout
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {showAll && list.length > pageSize ? (
        <button
          type="button"
          onClick={() => {
            setShowAll(false);
            setPage(1);
          }}
          className="rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-700 hover:border-brand-300"
        >
          Réduire
        </button>
      ) : null}
    </div>
  );
}

/** Surligne `term` (case-insensitive) dans `text`. Retourne un fragment React. */
function highlight(text: string, term?: string) {
  if (!term?.trim()) return text;
  const t = term.trim();
  const lower = text.toLowerCase();
  const lowerTerm = t.toLowerCase();
  const parts: Array<{ s: string; hit: boolean }> = [];
  let i = 0;
  while (i < text.length) {
    const idx = lower.indexOf(lowerTerm, i);
    if (idx < 0) {
      parts.push({ s: text.slice(i), hit: false });
      break;
    }
    if (idx > i) parts.push({ s: text.slice(i, idx), hit: false });
    parts.push({ s: text.slice(idx, idx + t.length), hit: true });
    i = idx + t.length;
  }
  return (
    <>
      {parts.map((p, idx) =>
        p.hit ? (
          <mark key={idx} className="rounded bg-amber-100 px-0.5">
            {p.s}
          </mark>
        ) : (
          <span key={idx}>{p.s}</span>
        ),
      )}
    </>
  );
}
