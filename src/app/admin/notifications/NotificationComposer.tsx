'use client';

import { useMemo, useState } from 'react';

export type ActiveProfile = {
  id: string;
  email: string;
  prenom: string | null;
  nom: string | null;
};

type When = 'now' | 'later';
type Audience = 'all' | 'selection';

type Props = {
  activeProfiles: ActiveProfile[];
  onClose: () => void;
  onSuccess: (toastMessage: string) => void;
  onError: (msg: string) => void;
};

function defaultLaterDate(): { date: string; time: string } {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return {
    date: d.toISOString().slice(0, 10),
    time: '09:00',
  };
}

export default function NotificationComposer({ activeProfiles, onClose, onSuccess, onError }: Props) {
  const [titre, setTitre] = useState('');
  const [message, setMessage] = useState('');
  const [when, setWhen] = useState<When>('now');
  const initialLater = defaultLaterDate();
  const [date, setDate] = useState(initialLater.date);
  const [time, setTime] = useState(initialLater.time);
  const [audience, setAudience] = useState<Audience>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const scheduledAt = useMemo<Date | null>(() => {
    if (when === 'now') return null;
    const dt = new Date(`${date}T${time}:00`);
    return Number.isFinite(dt.getTime()) ? dt : null;
  }, [when, date, time]);

  const recipientCount = audience === 'all' ? activeProfiles.length : selected.size;
  const isFutureValid = !scheduledAt || scheduledAt.getTime() > Date.now() + 30_000;

  function toggleProfile(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  async function handleSubmit() {
    if (!titre.trim() || !message.trim()) {
      onError('Titre et message obligatoires.');
      return;
    }
    if (when === 'later' && !isFutureValid) {
      onError('La date programmée doit être dans le futur.');
      return;
    }
    if (audience === 'selection' && selected.size === 0) {
      onError('Sélectionne au moins une personne.');
      return;
    }

    setSubmitting(true);
    const res = await fetch('/api/admin/notifications', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        titre: titre.trim(),
        message: message.trim(),
        source: 'manuelle',
        audience,
        audience_user_ids: audience === 'selection' ? Array.from(selected) : [],
        scheduled_at: scheduledAt ? scheduledAt.toISOString() : null,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      onError(error ?? "Échec de l'envoi");
      return;
    }

    onSuccess(
      when === 'now'
        ? `Message envoyé à ${recipientCount} ${recipientCount > 1 ? 'personnes' : 'personne'}.`
        : `Message programmé pour ${date} à ${time}.`,
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/40 px-4 backdrop-blur-sm">
      <div className="grid max-h-[90vh] w-full max-w-3xl grid-cols-1 gap-6 overflow-y-auto rounded-2xl bg-white p-6 shadow-soft md:p-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Form */}
        <div>
          <h2 className="font-display text-2xl font-medium text-ink-900">Nouveau message</h2>
          <p className="mt-1 text-sm text-ink-500">
            Une notification s&apos;affichera sur le téléphone des personnes choisies.
          </p>

          <div className="mt-5 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-ink-700">
                  Titre court (visible sur l&apos;écran verrouillé)
                </label>
                <span className="text-xs text-ink-400">{titre.length} / 50</span>
              </div>
              <input
                value={titre}
                onChange={(e) => setTitre(e.target.value.slice(0, 50))}
                maxLength={50}
                placeholder="Ex. : Réunion d'équipe vendredi"
                className="mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-ink-700">Message</label>
                <span className="text-xs text-ink-400">{message.length} / 200</span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                maxLength={200}
                rows={3}
                placeholder="Détails du message…"
                className="mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-ink-700">Quand l&apos;envoyer&nbsp;?</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <RadioCard
                  checked={when === 'now'}
                  onChange={() => setWhen('now')}
                  label="Tout de suite"
                />
                <RadioCard
                  checked={when === 'later'}
                  onChange={() => setWhen('later')}
                  label="Plus tard"
                />
              </div>
              {when === 'later' && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              )}
            </fieldset>

            <fieldset>
              <legend className="block text-sm font-medium text-ink-700">À qui&nbsp;?</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <RadioCard
                  checked={audience === 'all'}
                  onChange={() => setAudience('all')}
                  label="Toute l'équipe"
                />
                <RadioCard
                  checked={audience === 'selection'}
                  onChange={() => setAudience('selection')}
                  label="Choisir des personnes…"
                />
              </div>
              {audience === 'selection' && (
                <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-ink-200 bg-ink-50/40 p-2">
                  {activeProfiles.length === 0 ? (
                    <p className="px-2 py-2 text-xs text-ink-500">Aucun profil actif.</p>
                  ) : (
                    activeProfiles.map((p) => {
                      const checked = selected.has(p.id);
                      const display = `${p.prenom ?? ''} ${p.nom ?? ''}`.trim() || p.email;
                      return (
                        <label
                          key={p.id}
                          className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm transition ${
                            checked ? 'bg-brand-50 text-brand-800' : 'hover:bg-white text-ink-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleProfile(p.id)}
                            className="h-4 w-4 accent-brand-500"
                          />
                          <span className="font-medium">{display}</span>
                          <span className="ml-auto text-xs text-ink-400">{p.email}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              )}
            </fieldset>
          </div>

          <div className="mt-7 flex flex-wrap justify-end gap-2">
            <button onClick={onClose} disabled={submitting} className="btn-secondary">
              Annuler
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
              {submitting
                ? 'Envoi…'
                : when === 'now'
                ? `Envoyer maintenant (${recipientCount})`
                : 'Programmer'}
            </button>
          </div>
        </div>

        {/* Preview */}
        <aside className="lg:sticky lg:top-0">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-brand-600">
            Aperçu sur le téléphone
          </p>
          <div className="rounded-2xl bg-ink-900 p-2">
            <div className="rounded-xl bg-white p-3">
              <div className="flex items-start gap-2">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-brand-500 text-xs font-bold text-white">
                  H&amp;C
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-ink-900">Home &amp; Care</span>
                    <span className="text-xs text-ink-400">maintenant</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">
                    {titre || 'Titre du message'}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-ink-600">
                    {message || 'Le contenu apparaîtra ici.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-500">
            {when === 'now' ? (
              <>Envoyé à <strong>{recipientCount}</strong> personne{recipientCount > 1 ? 's' : ''}.</>
            ) : isFutureValid ? (
              <>Programmé pour <strong>{date}</strong> à <strong>{time}</strong>.</>
            ) : (
              <span className="text-rose-700">Date programmée invalide.</span>
            )}
          </p>
        </aside>
      </div>
    </div>
  );
}

function RadioCard({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
        checked
          ? 'border-brand-300 bg-brand-50 text-brand-800'
          : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
      }`}
    >
      <input type="radio" checked={checked} onChange={onChange} className="h-4 w-4 accent-brand-500" />
      {label}
    </label>
  );
}
