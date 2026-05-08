import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

import BanqueFilters from './BanqueFilters';
import { createClient } from '@/lib/supabase/server';
import { QUESTION_TYPES } from '@/lib/sondages/constants';
import type { QuestionType, SurveyQuestion } from '@/lib/sondages/types';

type SP = { q?: string; tag?: string | string[]; type?: string };

export default async function BanquePage({ searchParams }: { searchParams: SP }) {
  const supabase = createClient();

  const q = (searchParams.q ?? '').trim();
  const tagsRaw = searchParams.tag;
  const tags = Array.isArray(tagsRaw) ? tagsRaw : tagsRaw ? [tagsRaw] : [];
  const typeFilter = QUESTION_TYPES.find((t) => t.value === searchParams.type)?.value ?? null;

  let query = supabase
    .from('survey_questions')
    .select('*')
    .order('modifie_le', { ascending: false });

  if (q) query = query.ilike('titre', `%${q}%`);
  if (tags.length > 0) query = query.contains('tags', tags);
  if (typeFilter) query = query.eq('type', typeFilter);

  const { data, error } = await query;
  if (error) {
    return <p className="text-rose-700">Erreur de chargement : {error.message}</p>;
  }
  const questions = (data ?? []) as SurveyQuestion[];

  // Compteur d'utilisations par question (1 query globale)
  const ids = questions.map((q) => q.id);
  const usageMap = new Map<string, number>();
  if (ids.length > 0) {
    const { data: items } = await supabase
      .from('survey_items')
      .select('question_id')
      .in('question_id', ids);
    for (const it of items ?? []) {
      const k = (it as { question_id: string }).question_id;
      usageMap.set(k, (usageMap.get(k) ?? 0) + 1);
    }
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-600">
            Sondages
          </p>
          <h1 className="mt-1 font-display text-4xl font-medium text-ink-900">
            Banque de questions
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Réutilisez vos questions pour gagner du temps.
          </p>
        </div>
        <Link href="/admin/sondages/banque/new" className="btn-primary">
          + Nouvelle question
        </Link>
      </header>

      <div className="sticky top-[60px] z-10 mb-6 rounded-xl border border-ink-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <BanqueFilters initialQuery={q} initialTags={tags} initialType={typeFilter} />
      </div>

      {questions.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink-300 bg-white p-12 text-center text-ink-500">
          {q || tags.length > 0 || typeFilter
            ? 'Aucune question ne correspond à ces critères.'
            : "Aucune question pour le moment. Crée la première."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {questions.map((qq) => (
            <QuestionCard key={qq.id} question={qq} usageCount={usageMap.get(qq.id) ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionCard({
  question,
  usageCount,
}: {
  question: SurveyQuestion;
  usageCount: number;
}) {
  const meta = QUESTION_TYPES.find((t) => t.value === question.type)!;
  const dateLabel = formatDistanceToNow(new Date(question.modifie_le), {
    locale: fr,
    addSuffix: true,
  });

  const TYPE_BG: Record<QuestionType, string> = {
    choix_unique: 'bg-blue-100 text-blue-800',
    choix_multiple: 'bg-purple-100 text-purple-800',
    etoiles_5: 'bg-amber-100 text-amber-800',
    smileys_5: 'bg-pink-100 text-pink-800',
    oui_non: 'bg-emerald-100 text-emerald-800',
    texte_libre: 'bg-slate-100 text-slate-700',
  };

  return (
    <Link
      href={`/admin/sondages/banque/${question.id}`}
      className="flex flex-col gap-3 rounded-2xl border border-ink-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-soft"
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BG[question.type]}`}>
          {meta.label}
        </span>
        {usageCount > 0 ? (
          <span className="text-xs text-ink-500">
            {usageCount} sondage{usageCount > 1 ? 's' : ''}
          </span>
        ) : null}
      </div>

      <h2 className="line-clamp-2 font-display text-base font-medium text-ink-900">
        {question.titre}
      </h2>

      {question.description ? (
        <p className="line-clamp-2 text-sm text-ink-500">{question.description}</p>
      ) : null}

      {question.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {question.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700"
            >
              {t}
            </span>
          ))}
          {question.tags.length > 4 ? (
            <span className="text-xs text-ink-400">+{question.tags.length - 4}</span>
          ) : null}
        </div>
      ) : null}

      <p className="mt-auto text-xs text-ink-400">Modifié {dateLabel}</p>
    </Link>
  );
}
