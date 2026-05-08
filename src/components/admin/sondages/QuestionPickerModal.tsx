'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { QUESTION_TAGS, QUESTION_TYPES } from '@/lib/sondages/constants';
import type { QuestionType, SurveyQuestion } from '@/lib/sondages/types';

type Props = {
  alreadyUsedIds: string[];
  onClose: () => void;
  onPick: (question: SurveyQuestion) => void | Promise<void>;
};

export default function QuestionPickerModal({ alreadyUsedIds, onClose, onPick }: Props) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState<QuestionType | ''>('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [pickingId, setPickingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from('survey_questions')
        .select('*')
        .order('modifie_le', { ascending: false });
      if (cancelled) return;
      if (err) {
        setError(err.message);
        setQuestions([]);
      } else {
        setQuestions((data ?? []) as SurveyQuestion[]);
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const used = useMemo(() => new Set(alreadyUsedIds), [alreadyUsedIds]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return questions.filter((qu) => {
      if (needle && !qu.titre.toLowerCase().includes(needle)) return false;
      if (typeFilter && qu.type !== typeFilter) return false;
      if (tagFilter.length > 0 && !tagFilter.every((t) => qu.tags.includes(t))) return false;
      return true;
    });
  }, [questions, q, typeFilter, tagFilter]);

  function toggleTag(t: string) {
    setTagFilter((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function handlePick(question: SurveyQuestion) {
    if (used.has(question.id)) return;
    setPickingId(question.id);
    try {
      await onPick(question);
    } finally {
      setPickingId(null);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-4 border-b border-ink-100 px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-medium text-ink-900">
              Piocher dans la banque
            </h2>
            <p className="mt-0.5 text-xs text-ink-500">
              Sélectionne une question existante. Les questions déjà utilisées sont grisées.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-3 border-b border-ink-100 px-6 py-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher par titre…"
                className="w-full rounded-full border border-ink-200 bg-white py-1.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as QuestionType | '')}
              className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Tous les types</option>
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-1">
            {QUESTION_TAGS.map((t) => {
              const active = tagFilter.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={
                    active
                      ? 'rounded-full bg-brand-500 px-3 py-0.5 text-xs font-medium text-white'
                      : 'rounded-full border border-ink-200 bg-white px-3 py-0.5 text-xs text-ink-600 hover:border-brand-300 hover:bg-brand-50'
                  }
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <p className="py-12 text-center text-sm text-ink-500">Chargement…</p>
          ) : error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-ink-500">
              Aucune question ne correspond à ces critères.
            </p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((qu) => {
                const isUsed = used.has(qu.id);
                const meta = QUESTION_TYPES.find((t) => t.value === qu.type);
                const isPicking = pickingId === qu.id;
                return (
                  <li key={qu.id}>
                    <button
                      type="button"
                      onClick={() => handlePick(qu)}
                      disabled={isUsed || pickingId !== null}
                      className={`flex w-full flex-col gap-1.5 rounded-xl border p-4 text-left transition ${
                        isUsed
                          ? 'cursor-not-allowed border-ink-200 bg-ink-50 opacity-60'
                          : 'border-ink-200 bg-white hover:border-brand-400 hover:bg-brand-50/30'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                          {meta?.label ?? qu.type}
                        </span>
                        {isUsed && (
                          <span className="rounded-full bg-ink-200 px-2 py-0.5 text-xs text-ink-700">
                            Déjà ajoutée
                          </span>
                        )}
                        {isPicking && (
                          <span className="text-xs text-brand-600">Ajout…</span>
                        )}
                      </div>
                      <p className="font-display text-base font-medium text-ink-900">
                        {qu.titre}
                      </p>
                      {qu.description ? (
                        <p className="line-clamp-2 text-xs text-ink-500">{qu.description}</p>
                      ) : null}
                      {qu.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {qu.tags.slice(0, 6).map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] text-ink-600"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
