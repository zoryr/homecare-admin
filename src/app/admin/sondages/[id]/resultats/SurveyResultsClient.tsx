'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  FileText,
  RefreshCw,
  Search,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import ChoiceBarChart from '@/components/admin/sondages/charts/ChoiceBarChart';
import RatingBarChart from '@/components/admin/sondages/charts/RatingBarChart';
import TextResponsesList from '@/components/admin/sondages/charts/TextResponsesList';
import YesNoPieChart from '@/components/admin/sondages/charts/YesNoPieChart';
import { useToast } from '@/components/Toast';
import { QUESTION_TYPES } from '@/lib/sondages/constants';
import type {
  ItemResult,
  SurveyResultsPayload,
} from '@/lib/sondages/results';
import type { Survey, SurveyStatut } from '@/lib/sondages/types';

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

type Props = {
  surveyId: string;
  initialSurvey: Survey;
};

export default function SurveyResultsClient({ surveyId, initialSurvey }: Props) {
  const { notify } = useToast();
  const [survey, setSurvey] = useState<Survey>(initialSurvey);
  const [payload, setPayload] = useState<SurveyResultsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', new Date(from).toISOString());
      if (to) params.set('to', new Date(to).toISOString());
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/sondages/${surveyId}/results?${params.toString()}`);
      if (!res.ok) {
        const { error: err } = await res.json().catch(() => ({ error: `Erreur ${res.status}` }));
        throw new Error(err ?? `Erreur ${res.status}`);
      }
      const data = (await res.json()) as SurveyResultsPayload;
      setPayload(data);
      setSurvey(data.survey);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  // Initial + à chaque changement de filtre
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, search]);

  function applySearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSearch(searchInput);
  }

  function resetFilters() {
    setFrom('');
    setTo('');
    setSearch('');
    setSearchInput('');
  }

  async function downloadExport(kind: 'pdf' | 'csv') {
    const setBusy = kind === 'pdf' ? setExportingPdf : setExportingCsv;
    setBusy(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', new Date(from).toISOString());
      if (to) params.set('to', new Date(to).toISOString());

      const res = await fetch(
        `/api/admin/sondages/${surveyId}/export/${kind}?${params.toString()}`,
        { method: 'POST' },
      );
      if (!res.ok) {
        const { error: err } = await res.json().catch(() => ({ error: `Erreur ${res.status}` }));
        throw new Error(err ?? `Erreur ${res.status}`);
      }
      const blob = await res.blob();
      const disposition = res.headers.get('content-disposition') ?? '';
      const match = /filename="([^"]+)"/i.exec(disposition);
      const fallback = `sondage-${surveyId}.${kind}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = match?.[1] ?? fallback;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notify('success', `Export ${kind.toUpperCase()} téléchargé.`);
    } catch (e) {
      notify('error', e instanceof Error ? e.message : 'Export échoué');
    } finally {
      setBusy(false);
    }
  }

  const items = payload?.items ?? [];
  const totalParticipants = payload?.total_participants ?? 0;
  const totalActive = payload?.total_active_users ?? 0;
  const tauxReponse = totalActive > 0 ? Math.round((totalParticipants / totalActive) * 100) : 0;

  const hasFilters = !!(from || to || search.trim());

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/admin/sondages/${surveyId}`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au sondage
        </Link>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUT_BADGE[survey.statut]}`}>
          {STATUT_LABEL[survey.statut]}
        </span>
      </div>

      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-600">Résultats</p>
        <h1 className="mt-1 font-display text-3xl font-medium text-ink-900 sm:text-4xl">
          {survey.titre}
        </h1>
        {survey.description ? (
          <p className="mt-2 max-w-2xl text-sm text-ink-500">{survey.description}</p>
        ) : null}
      </header>

      {/* KPI bar */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard
          label="Réponses reçues"
          value={`${totalParticipants} / ${totalActive}`}
          sub={`${tauxReponse}% de taux de réponse`}
          tone="brand"
          donut={tauxReponse}
        />
        <KpiCard
          label="Ouverture"
          value={fmtDate(survey.publie_le ?? survey.open_at)}
          sub={
            survey.publie_le
              ? format(new Date(survey.publie_le), "d MMM yyyy 'à' HH:mm", { locale: fr })
              : '—'
          }
        />
        <KpiCard
          label={survey.statut === 'ferme' ? 'Fermé le' : 'Fermeture prévue'}
          value={fmtDate(survey.ferme_le ?? survey.close_at)}
          sub={
            survey.close_at
              ? format(new Date(survey.close_at), "d MMM yyyy 'à' HH:mm", { locale: fr })
              : 'Pas de date prévue'
          }
        />
      </div>

      {/* Filters bar */}
      <div className="sticky top-[60px] z-10 mb-6 rounded-xl border border-ink-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-600">Du</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-600">Au</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <form onSubmit={applySearch} className="flex flex-1 min-w-[220px] items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-ink-600">
                Rechercher dans les réponses libres
              </label>
              <div className="relative mt-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Mot-clé…"
                  className="w-full rounded-lg border border-ink-200 bg-white py-1.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
            <button type="submit" className="btn-secondary !py-1.5">
              Chercher
            </button>
          </form>
          {hasFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-600 hover:border-rose-300 hover:text-rose-700"
            >
              <X className="h-3 w-3" />
              Réinitialiser
            </button>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-brand-300 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Rafraîchir
            </button>
            <button
              type="button"
              onClick={() => void downloadExport('pdf')}
              disabled={exportingPdf || loading}
              className="inline-flex items-center gap-2 rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-100 disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />
              {exportingPdf ? 'Génération…' : 'Export PDF'}
            </button>
            <button
              type="button"
              onClick={() => void downloadExport('csv')}
              disabled={exportingCsv || loading}
              className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-brand-300 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {exportingCsv ? 'Génération…' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      {loading && !payload ? (
        <p className="rounded-2xl border border-dashed border-ink-300 bg-white p-12 text-center text-ink-500">
          Chargement des résultats…
        </p>
      ) : error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {error}
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink-300 bg-white p-12 text-center text-ink-500">
          Aucune question dans ce sondage.
        </p>
      ) : totalParticipants === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink-300 bg-white p-12 text-center text-ink-500">
          Aucune réponse pour le moment. Les résultats apparaîtront ici dès la première participation.
        </p>
      ) : (
        <div className="space-y-5">
          {items.map((item, idx) => (
            <ItemResultCard key={item.item_id} item={item} index={idx + 1} search={search} />
          ))}
        </div>
      )}

      {/* Section "Qui a répondu" */}
      {payload && totalParticipants > 0 ? (
        <section className="mt-8 rounded-2xl border border-ink-200 bg-white">
          <button
            type="button"
            onClick={() => setParticipantsOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50">
                <Users className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <h2 className="font-display text-lg font-medium text-ink-900">Participants</h2>
                <p className="text-xs text-ink-500">
                  {totalParticipants} personne{totalParticipants > 1 ? 's' : ''} ont répondu (sur{' '}
                  {totalActive} salarié{totalActive > 1 ? 's' : ''} actif{totalActive > 1 ? 's' : ''})
                </p>
              </div>
            </div>
            {participantsOpen ? (
              <ChevronUp className="h-5 w-5 text-ink-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-ink-400" />
            )}
          </button>

          {participantsOpen ? (
            <div className="border-t border-ink-100 p-5">
              <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                On affiche qui a participé, mais pas leurs réponses individuelles. L’anonymat des réponses
                est préservé.
              </p>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {payload.participants.map((p) => (
                  <li
                    key={p.user_id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 bg-ink-50/40 px-3 py-2"
                  >
                    <span className="font-medium text-ink-800">
                      {[p.prenom, p.nom].filter(Boolean).join(' ') || 'Utilisateur'}
                    </span>
                    <span className="text-xs text-ink-500">
                      {format(new Date(p.submitted_at), 'd MMM HH:mm', { locale: fr })}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled
                className="mt-4 inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-dashed border-ink-300 bg-white px-3 py-2 text-sm text-ink-500"
                title="Bientôt disponible"
              >
                <Eye className="h-4 w-4" />
                Relancer les non-participants (V2)
              </button>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function ItemResultCard({
  item,
  index,
  search,
}: {
  item: ItemResult;
  index: number;
  search: string;
}) {
  const meta = QUESTION_TYPES.find((t) => t.value === item.type);
  return (
    <article className="rounded-2xl border border-ink-200 bg-white p-5">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-500">
            Question {index} {item.required ? '· obligatoire' : ''}
          </p>
          <h3 className="mt-0.5 font-display text-lg font-medium text-ink-900">{item.titre}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
            {meta?.label ?? item.type}
          </span>
          <span className="text-xs text-ink-500">
            {item.total_responses} réponse{item.total_responses > 1 ? 's' : ''}
          </span>
        </div>
      </header>

      {item.total_responses === 0 && item.type !== 'texte_libre' ? (
        <p className="rounded-lg bg-ink-50 p-3 text-sm italic text-ink-500">
          Aucune réponse pour cette question.
        </p>
      ) : item.type === 'choix_unique' ? (
        <ChoiceBarChart results={item.results} />
      ) : item.type === 'choix_multiple' ? (
        <ChoiceBarChart results={item.results} multi />
      ) : item.type === 'etoiles_5' ? (
        <RatingBarChart results={item.results} type="etoiles_5" />
      ) : item.type === 'smileys_5' ? (
        <RatingBarChart results={item.results} type="smileys_5" />
      ) : item.type === 'oui_non' ? (
        <YesNoPieChart results={item.results} />
      ) : item.type === 'texte_libre' ? (
        <TextResponsesList results={item.results} search={search} />
      ) : null}
    </article>
  );
}

function KpiCard({
  label,
  value,
  sub,
  tone,
  donut,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'brand';
  donut?: number;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        tone === 'brand'
          ? 'border-brand-200 bg-gradient-to-br from-brand-50 to-white'
          : 'border-ink-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-500">{label}</p>
          <p className="mt-1 font-display text-2xl font-medium text-ink-900">{value}</p>
          {sub ? <p className="mt-1 text-xs text-ink-500">{sub}</p> : null}
        </div>
        {donut !== undefined ? <Donut percent={donut} /> : null}
      </div>
    </div>
  );
}

function Donut({ percent }: { percent: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const dash = useMemo(() => (Math.max(0, Math.min(100, percent)) / 100) * c, [percent, c]);
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" className="shrink-0">
      <circle cx={28} cy={28} r={r} fill="none" stroke="#D1EDF1" strokeWidth={6} />
      <circle
        cx={28}
        cy={28}
        r={r}
        fill="none"
        stroke="#3DB5C5"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 28 28)"
      />
      <text
        x={28}
        y={32}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="#226E78"
      >
        {percent}%
      </text>
    </svg>
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return format(new Date(iso), 'd MMM yyyy', { locale: fr });
}
