import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

import CreateSondageButton from './CreateSondageButton';
import SondageFilters from './SondageFilters';
import SondagesTabs from '@/components/admin/sondages/SondagesTabs';
import { createClient } from '@/lib/supabase/server';
import type { Survey, SurveyStatut } from '@/lib/sondages/types';

type SP = { q?: string; statut?: string };

const STATUT_BADGE: Record<SurveyStatut, string> = {
  brouillon: 'bg-slate-100 text-slate-700',
  publie: 'bg-emerald-100 text-emerald-800',
  ferme: 'bg-amber-100 text-amber-800',
};

const STATUT_LABEL: Record<SurveyStatut, string> = {
  brouillon: 'Brouillon',
  publie: 'Publié',
  ferme: 'Fermé',
};

export default async function SondagesListPage({ searchParams }: { searchParams: SP }) {
  const supabase = createClient();

  const q = (searchParams.q ?? '').trim();
  const statutFilter: SurveyStatut | null =
    searchParams.statut === 'brouillon' ||
    searchParams.statut === 'publie' ||
    searchParams.statut === 'ferme'
      ? searchParams.statut
      : null;

  let query = supabase
    .from('surveys')
    .select('*')
    .order('modifie_le', { ascending: false });

  if (q) query = query.ilike('titre', `%${q}%`);
  if (statutFilter) query = query.eq('statut', statutFilter);

  const { data, error } = await query;
  if (error) {
    return (
      <div>
        <SondagesTabs />
        <p className="mt-6 text-rose-700">Erreur de chargement : {error.message}</p>
      </div>
    );
  }

  const surveys = (data ?? []) as Survey[];

  // Compteur d'items par sondage
  const ids = surveys.map((s) => s.id);
  const itemCount = new Map<string, number>();
  if (ids.length > 0) {
    const { data: items } = await supabase
      .from('survey_items')
      .select('survey_id')
      .in('survey_id', ids);
    for (const it of items ?? []) {
      const k = (it as { survey_id: string }).survey_id;
      itemCount.set(k, (itemCount.get(k) ?? 0) + 1);
    }
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-600">
            Sondages
          </p>
          <h1 className="mt-1 font-display text-4xl font-medium text-ink-900">Mes sondages</h1>
          <p className="mt-2 text-sm text-ink-500">
            Crée, publie et suis l’engagement de tes sondages internes.
          </p>
        </div>
        <CreateSondageButton />
      </header>

      <div className="sticky top-[60px] z-10 mb-6 space-y-3 rounded-xl border border-ink-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <SondagesTabs />
        <SondageFilters initialQuery={q} initialStatut={statutFilter} />
      </div>

      {surveys.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink-300 bg-white p-12 text-center text-ink-500">
          {q || statutFilter
            ? 'Aucun sondage ne correspond à ces critères.'
            : 'Aucun sondage pour le moment. Crée le premier.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {surveys.map((s) => (
            <SurveyCard key={s.id} survey={s} itemCount={itemCount.get(s.id) ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}

function SurveyCard({ survey, itemCount }: { survey: Survey; itemCount: number }) {
  const dateLabel = formatDistanceToNow(new Date(survey.modifie_le), {
    locale: fr,
    addSuffix: true,
  });

  return (
    <Link
      href={`/admin/sondages/${survey.id}`}
      className="flex flex-col gap-3 rounded-2xl border border-ink-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-soft"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_BADGE[survey.statut]}`}
        >
          {STATUT_LABEL[survey.statut]}
        </span>
        <span className="text-xs text-ink-500">
          {itemCount} élément{itemCount > 1 ? 's' : ''}
        </span>
      </div>

      <h2 className="line-clamp-2 font-display text-lg font-medium text-ink-900">
        {survey.titre || 'Sans titre'}
      </h2>

      {survey.description ? (
        <p className="line-clamp-2 text-sm text-ink-500">{survey.description}</p>
      ) : null}

      <div className="mt-auto flex items-center justify-between text-xs text-ink-400">
        <span>Modifié {dateLabel}</span>
        {survey.close_at ? (
          <span>
            Ferme {formatDistanceToNow(new Date(survey.close_at), { locale: fr, addSuffix: true })}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
