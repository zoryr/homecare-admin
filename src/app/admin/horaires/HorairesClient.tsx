'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { useToast } from '@/components/Toast';
import {
  JOURS_LABELS,
  JOURS_ORDRE,
  PAUSE_DEJEUNER,
  type HoraireConfig,
  type HoraireException,
  type HoraireRecurrence,
} from '@/lib/horaires/types';

const JOURS_FERIES_LABELS = [
  "Jour de l'An (1er janvier)",
  'Lundi de Pâques',
  'Fête du Travail (1er mai)',
  'Victoire 1945 (8 mai)',
  'Ascension',
  'Lundi de Pentecôte',
  'Fête nationale (14 juillet)',
  'Assomption (15 août)',
  'Toussaint (1er novembre)',
  'Armistice (11 novembre)',
  'Noël (25 décembre)',
];

function hhmm(t: string | null): string {
  return t ? t.slice(0, 5) : '';
}

export default function HorairesClient({
  initialConfig,
  initialExceptions,
}: {
  initialConfig: HoraireConfig[];
  initialExceptions: HoraireException[];
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [, startTransition] = useTransition();
  const [exceptions, setExceptions] = useState(initialExceptions);

  const byJour = new Map(initialConfig.map((c) => [c.jour_semaine, c]));

  function refresh() {
    startTransition(() => router.refresh());
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-600">Agence</p>
        <h1 className="mt-1 font-display text-4xl font-medium text-ink-900">Horaires</h1>
        <p className="mt-2 text-sm text-ink-500">
          Ces horaires pilotent le widget «&nbsp;L&apos;agence est ouverte / fermée&nbsp;» de
          l&apos;accueil de l&apos;app. Les jours fériés français sont fermés automatiquement.
        </p>
      </header>

      <section className="mb-10 rounded-2xl border border-ink-200 bg-white p-6">
        <h2 className="mb-4 font-display text-xl font-medium text-ink-900">Horaires hebdomadaires</h2>
        <div className="space-y-3">
          {JOURS_ORDRE.map((j) => (
            <DayRow key={j} jour={j} config={byJour.get(j) ?? null} onSaved={refresh} onError={(m) => notify('error', m)} onSuccess={(m) => notify('success', m)} />
          ))}
        </div>
      </section>

      <ExceptionsSection
        exceptions={exceptions}
        setExceptions={setExceptions}
        notifyErr={(m) => notify('error', m)}
        notifyOk={(m) => notify('success', m)}
      />

      <section className="rounded-2xl border border-ink-200 bg-white p-6">
        <h2 className="mb-2 font-display text-xl font-medium text-ink-900">Jours fériés</h2>
        <p className="mb-4 text-sm text-ink-500">
          Fermés automatiquement chaque année (non modifiable).
        </p>
        <ul className="grid grid-cols-1 gap-1.5 text-sm text-ink-700 sm:grid-cols-2">
          {JOURS_FERIES_LABELS.map((l) => (
            <li key={l} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-ink-300" aria-hidden />
              {l}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function DayRow({
  jour,
  config,
  onSaved,
  onError,
  onSuccess,
}: {
  jour: number;
  config: HoraireConfig | null;
  onSaved: () => void;
  onError: (m: string) => void;
  onSuccess: (m: string) => void;
}) {
  const [ouvert, setOuvert] = useState(config?.ouvert ?? false);
  const [matinDebut, setMatinDebut] = useState(hhmm(config?.matin_debut ?? null));
  const [apresFin, setApresFin] = useState(hhmm(config?.apres_midi_fin ?? null));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch('/api/admin/horaires/config', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jour_semaine: jour,
        ouvert,
        // La pause déjeuner n'est pas saisissable : elle est identique tous les jours.
        matin_debut: matinDebut || null,
        matin_fin: PAUSE_DEJEUNER.debut,
        apres_midi_debut: PAUSE_DEJEUNER.fin,
        apres_midi_fin: apresFin || null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      onError(error ?? 'Échec');
      return;
    }
    onSuccess(`${JOURS_LABELS[jour]} enregistré.`);
    onSaved();
  }

  return (
    <div className="rounded-xl border border-ink-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-24 font-medium text-ink-900">{JOURS_LABELS[jour]}</span>
          <label className="flex items-center gap-2 text-sm text-ink-600">
            <input
              type="checkbox"
              checked={ouvert}
              onChange={(e) => setOuvert(e.target.checked)}
              className="h-4 w-4 rounded border-ink-300 accent-brand-500"
            />
            {ouvert ? 'Ouvert' : 'Fermé'}
          </label>
        </div>
        <button type="button" onClick={save} disabled={saving} className="btn-secondary text-sm">
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      {ouvert ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-600">
          <span>Ouverture</span>
          <TimeInput value={matinDebut} onChange={setMatinDebut} />
          <span>→</span>
          <TimeInput value={apresFin} onChange={setApresFin} />
          <span className="text-xs text-ink-500">
            Pause déjeuner de {PAUSE_DEJEUNER.debut} à {PAUSE_DEJEUNER.fin}, fermée tous les jours.
          </span>
        </div>
      ) : null}
    </div>
  );
}

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
    />
  );
}

function ExceptionsSection({
  exceptions,
  setExceptions,
  notifyErr,
  notifyOk,
}: {
  exceptions: HoraireException[];
  setExceptions: (next: HoraireException[]) => void;
  notifyErr: (m: string) => void;
  notifyOk: (m: string) => void;
}) {
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [raison, setRaison] = useState('');
  const [standardOuvert, setStandardOuvert] = useState(false);
  const [touteLaJournee, setTouteLaJournee] = useState(true);
  const [heureDebut, setHeureDebut] = useState('');
  const [heureFin, setHeureFin] = useState('');
  const [recurrence, setRecurrence] = useState<HoraireRecurrence>('aucune');
  const [recurrenceFin, setRecurrenceFin] = useState('');
  const [saving, setSaving] = useState(false);

  const repete = recurrence === 'hebdomadaire';

  async function add() {
    if (!debut || (!repete && !fin)) {
      notifyErr('Renseignez les dates.');
      return;
    }
    if (!touteLaJournee && (!heureDebut || !heureFin)) {
      notifyErr('Renseignez les heures, ou cochez « toute la journée ».');
      return;
    }
    if (repete && !recurrenceFin) {
      notifyErr("Indiquez jusqu'à quand la fermeture se répète.");
      return;
    }
    setSaving(true);
    const res = await fetch('/api/admin/horaires/exceptions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        date_debut: debut,
        // Une fermeture qui se répète porte sur une seule journée, rejouée
        // chaque semaine jusqu'à la date de fin de répétition.
        date_fin: repete ? debut : fin,
        raison: raison.trim() || null,
        standard_ouvert: standardOuvert,
        heure_debut: touteLaJournee ? null : heureDebut,
        heure_fin: touteLaJournee ? null : heureFin,
        recurrence,
        recurrence_fin: repete ? recurrenceFin : null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notifyErr(error ?? 'Échec');
      return;
    }
    const { exception } = (await res.json()) as { exception: HoraireException };
    setExceptions(
      [...exceptions, exception].sort((a, b) => a.date_debut.localeCompare(b.date_debut)),
    );
    setDebut('');
    setFin('');
    setRaison('');
    setStandardOuvert(false);
    setTouteLaJournee(true);
    setHeureDebut('');
    setHeureFin('');
    setRecurrence('aucune');
    setRecurrenceFin('');
    notifyOk('Fermeture ajoutée.');
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/horaires/exceptions/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      notifyErr('Suppression échouée.');
      return;
    }
    setExceptions(exceptions.filter((e) => e.id !== id));
    notifyOk('Fermeture supprimée.');
  }

  return (
    <section className="mb-10 rounded-2xl border border-ink-200 bg-white p-6">
      <h2 className="mb-4 font-display text-xl font-medium text-ink-900">Fermetures exceptionnelles</h2>

      {exceptions.length === 0 ? (
        <p className="mb-4 text-sm text-ink-500">Aucune fermeture exceptionnelle programmée.</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {exceptions.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-ink-200 p-3 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-ink-900">
                  {e.date_debut === e.date_fin ? e.date_debut : `${e.date_debut} → ${e.date_fin}`}
                </span>
                {e.raison ? <span className="text-ink-500"> · {e.raison}</span> : null}
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  {e.heure_debut && e.heure_fin
                    ? `🕒 ${hhmm(e.heure_debut)} → ${hhmm(e.heure_fin)}`
                    : '🕒 Journée entière'}
                </span>
                {e.recurrence === 'hebdomadaire' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                    🔁 Chaque semaine jusqu&apos;au {e.recurrence_fin}
                  </span>
                ) : null}
                {e.standard_ouvert ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
                    ☎️ Standard ouvert
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => remove(e.id)}
                className="rounded-md p-1.5 text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"
                aria-label="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-end gap-2 border-t border-ink-100 pt-4">
        <label className="text-sm text-ink-600">
          Du
          <input
            type="date"
            value={debut}
            onChange={(e) => setDebut(e.target.value)}
            className="ml-2 rounded-lg border border-ink-200 bg-white px-2 py-1 text-sm"
          />
        </label>
        <label className="text-sm text-ink-600">
          Au
          <input
            type="date"
            value={repete ? debut : fin}
            disabled={repete}
            onChange={(e) => setFin(e.target.value)}
            className="ml-2 rounded-lg border border-ink-200 bg-white px-2 py-1 text-sm disabled:bg-ink-50 disabled:text-ink-400"
          />
        </label>
        <input
          type="text"
          value={raison}
          onChange={(e) => setRaison(e.target.value)}
          placeholder="Raison (optionnel)"
          className="min-w-[12rem] flex-1 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm"
        />
        <button type="button" onClick={add} disabled={saving} className="btn-primary text-sm">
          {saving ? 'Ajout…' : '+ Ajouter'}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-700">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={touteLaJournee}
            onChange={(e) => setTouteLaJournee(e.target.checked)}
            className="h-4 w-4 rounded border-ink-300 accent-brand-500"
          />
          Toute la journée
        </label>
        {touteLaJournee ? null : (
          <span className="inline-flex items-center gap-2">
            Fermé de
            <TimeInput value={heureDebut} onChange={setHeureDebut} />
            à
            <TimeInput value={heureFin} onChange={setHeureFin} />
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-700">
        <label className="inline-flex items-center gap-2">
          Répétition
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as HoraireRecurrence)}
            className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-sm"
          >
            <option value="aucune">Aucune</option>
            <option value="hebdomadaire">Chaque semaine</option>
          </select>
        </label>
        {repete ? (
          <label className="inline-flex flex-wrap items-center gap-2">
            jusqu&apos;au
            <input
              type="date"
              value={recurrenceFin}
              onChange={(e) => setRecurrenceFin(e.target.value)}
              className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-sm"
            />
            <span className="text-xs text-ink-500">
              La fermeture se répète le même jour de semaine que la date de début.
            </span>
          </label>
        ) : null}
      </div>

      <label className="mt-3 flex items-start gap-2 text-sm text-ink-700">
        <input
          type="checkbox"
          checked={standardOuvert}
          onChange={(e) => setStandardOuvert(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-ink-300 accent-brand-500"
        />
        <span>
          <span className="font-medium text-ink-800">
            Le standard téléphonique reste ouvert pendant cette fermeture
          </span>
          <span className="block text-xs text-ink-500">
            Cochez si les appels sont traités normalement malgré la fermeture physique.
          </span>
        </span>
      </label>
    </section>
  );
}
