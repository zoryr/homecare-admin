'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { useToast } from '@/components/Toast';
import { JOURS_LABELS, JOURS_ORDRE, type HoraireConfig, type HoraireException } from '@/lib/horaires/types';

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
  const [matinFin, setMatinFin] = useState(hhmm(config?.matin_fin ?? null));
  const [apresDebut, setApresDebut] = useState(hhmm(config?.apres_midi_debut ?? null));
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
        matin_debut: matinDebut || null,
        matin_fin: matinFin || null,
        apres_midi_debut: apresDebut || null,
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
          <span>Matin</span>
          <TimeInput value={matinDebut} onChange={setMatinDebut} />
          <span>→</span>
          <TimeInput value={matinFin} onChange={setMatinFin} />
          <span className="mx-2 text-ink-300">|</span>
          <span>Après-midi</span>
          <TimeInput value={apresDebut} onChange={setApresDebut} />
          <span>→</span>
          <TimeInput value={apresFin} onChange={setApresFin} />
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
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!debut || !fin) {
      notifyErr('Renseignez les deux dates.');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/admin/horaires/exceptions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ date_debut: debut, date_fin: fin, raison: raison.trim() || null }),
    });
    setSaving(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notifyErr(error ?? 'Échec');
      return;
    }
    const { id } = (await res.json()) as { id: string };
    setExceptions(
      [...exceptions, { id, date_debut: debut, date_fin: fin, raison: raison.trim() || null, cree_par: '', cree_le: new Date().toISOString() }].sort(
        (a, b) => a.date_debut.localeCompare(b.date_debut),
      ),
    );
    setDebut('');
    setFin('');
    setRaison('');
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
              <div>
                <span className="font-medium text-ink-900">
                  {e.date_debut === e.date_fin ? e.date_debut : `${e.date_debut} → ${e.date_fin}`}
                </span>
                {e.raison ? <span className="text-ink-500"> · {e.raison}</span> : null}
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
            value={fin}
            onChange={(e) => setFin(e.target.value)}
            className="ml-2 rounded-lg border border-ink-200 bg-white px-2 py-1 text-sm"
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
    </section>
  );
}
