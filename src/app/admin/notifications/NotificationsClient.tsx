'use client';

import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import NotificationComposer, { type ActiveProfile } from './NotificationComposer';
import { useToast } from '@/components/Toast';
import { SOURCE_LABELS, type Notification, type NotificationSettings } from '@/lib/notifications/types';

export type NotifWithStats = Notification & {
  stats: { total: number; sent: number; failed: number; read: number };
};

type Props = {
  settings: NotificationSettings;
  notifs: NotifWithStats[];
  totalActive: number;
  activeProfiles: ActiveProfile[];
};

export default function NotificationsClient({ settings, notifs, totalActive, activeProfiles }: Props) {
  const router = useRouter();
  const { notify } = useToast();
  const [, startTransition] = useTransition();
  const [composerOpen, setComposerOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);

  // état local des settings (optimistic)
  const [s, setS] = useState<NotificationSettings>(settings);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  async function patchSettings(partial: Partial<NotificationSettings>, key: string) {
    setSavingKey(key);
    const previous = s;
    setS((cur) => ({ ...cur, ...partial }));

    const res = await fetch('/api/admin/notification-settings', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(partial),
    });
    setSavingKey(null);

    if (!res.ok) {
      setS(previous); // rollback
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Impossible d\'enregistrer ce réglage');
    }
  }

  async function cancelNotif(id: string) {
    if (!window.confirm('Annuler cette notification ?')) return;
    const res = await fetch(`/api/admin/notifications/${id}/cancel`, { method: 'POST' });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Annulation échouée');
      return;
    }
    notify('success', 'Notification annulée.');
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-600">
          Communication interne
        </p>
        <h1 className="mt-1 font-display text-4xl font-medium text-ink-900">Notifications</h1>
        <p className="mt-2 text-sm text-ink-500">
          {totalActive} salarié{totalActive > 1 ? 's actifs' : ' actif'} pourront recevoir tes messages.
        </p>
      </header>

      {/* Section 1 */}
      <section className="rounded-2xl border border-ink-200 bg-white p-6">
        <h2 className="font-display text-2xl font-medium text-ink-900">
          Quand votre équipe est-elle prévenue&nbsp;?
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Choisis ce qui déclenche un envoi automatique.
        </p>

        <div className="mt-5 space-y-3">
          <Toggle
            label="Quand je publie une actualité"
            checked={s.auto_on_actu_publish}
            saving={savingKey === 'auto_actu'}
            onChange={(v) => patchSettings({ auto_on_actu_publish: v }, 'auto_actu')}
          />
          <Toggle
            label="Quand j'ajoute une note de service"
            checked={s.auto_on_reglement_publish}
            saving={savingKey === 'auto_reglement'}
            onChange={(v) => patchSettings({ auto_on_reglement_publish: v }, 'auto_reglement')}
          />
          <Toggle
            label="Quand je crée un sondage"
            checked={s.auto_on_sondage_create}
            saving={savingKey === 'auto_sondage'}
            onChange={(v) => patchSettings({ auto_on_sondage_create: v }, 'auto_sondage')}
          />
        </div>

        <div className="mt-6 rounded-xl border border-ink-200 bg-ink-50/40 p-4">
          <Toggle
            label="Ne pas envoyer la nuit"
            checked={s.quiet_hours_enabled}
            saving={savingKey === 'quiet'}
            onChange={(v) => patchSettings({ quiet_hours_enabled: v }, 'quiet')}
          />
          {s.quiet_hours_enabled && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-700">
              <span>de</span>
              <HourSelect
                value={s.quiet_hours_start}
                onChange={(v) => patchSettings({ quiet_hours_start: v }, 'quiet_start')}
              />
              <span>à</span>
              <HourSelect
                value={s.quiet_hours_end}
                onChange={(v) => patchSettings({ quiet_hours_end: v }, 'quiet_end')}
              />
              <span className="ml-auto text-xs text-ink-500">
                Si une notification doit partir dans cette tranche, elle est repoussée à {pad(s.quiet_hours_end)}h.
              </span>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button onClick={() => setTestOpen(true)} className="btn-secondary">
            Envoyer une notification de test à mon téléphone
          </button>
        </div>
      </section>

      {/* Section 2 */}
      <section className="rounded-2xl border border-ink-200 bg-white p-6">
        <h2 className="font-display text-2xl font-medium text-ink-900">
          Envoyer un message à toute l&apos;équipe
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Pour une info ponctuelle, hors actualité ou règlement.
        </p>
        <button onClick={() => setComposerOpen(true)} className="btn-primary mt-5">
          + Nouveau message
        </button>
      </section>

      {/* Section 3 */}
      <section>
        <h2 className="font-display text-2xl font-medium text-ink-900">Historique</h2>
        <p className="mt-1 text-sm text-ink-500">50 derniers envois.</p>

        <div className="mt-5 overflow-hidden rounded-2xl border border-ink-200 bg-white">
          <table className="min-w-full divide-y divide-ink-200 text-sm">
            <thead className="bg-ink-50/60">
              <tr>
                <Th>Date</Th>
                <Th>Source</Th>
                <Th>Titre</Th>
                <Th>Vu par</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {notifs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-ink-500">
                    Aucune notification envoyée pour le moment.
                  </td>
                </tr>
              )}
              {notifs.map((n) => {
                const isScheduled = !n.sent_at && !n.cancelled_at && n.scheduled_at && new Date(n.scheduled_at).getTime() > Date.now();
                const dateLabel = n.sent_at
                  ? formatDistanceToNow(new Date(n.sent_at), { locale: fr, addSuffix: true })
                  : n.cancelled_at
                  ? `Annulée ${formatDistanceToNow(new Date(n.cancelled_at), { locale: fr, addSuffix: true })}`
                  : isScheduled && n.scheduled_at
                  ? `Programmée pour ${format(new Date(n.scheduled_at), 'd MMM HH:mm', { locale: fr })}`
                  : 'En cours…';
                const seenLabel = n.stats.total > 0 ? `${n.stats.read} sur ${n.stats.total}` : '—';

                return (
                  <tr key={n.id} className="transition hover:bg-ink-50/60">
                    <td className="whitespace-nowrap px-5 py-3 text-ink-700">{dateLabel}</td>
                    <td className="px-5 py-3">
                      <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                        {SOURCE_LABELS[n.source]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink-900">{n.titre}</p>
                      <p className="line-clamp-1 text-xs text-ink-500">{n.message}</p>
                    </td>
                    <td className="px-5 py-3 text-ink-700">{seenLabel}</td>
                    <td className="px-5 py-3 text-right">
                      {isScheduled && (
                        <button
                          onClick={() => cancelNotif(n.id)}
                          className="rounded-md border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                        >
                          Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {composerOpen && (
        <NotificationComposer
          activeProfiles={activeProfiles}
          onClose={() => setComposerOpen(false)}
          onSuccess={(message) => {
            setComposerOpen(false);
            notify('success', message);
            startTransition(() => router.refresh());
          }}
          onError={(msg) => notify('error', msg)}
        />
      )}

      {testOpen && (
        <TestModal
          onClose={() => setTestOpen(false)}
          onSent={() => {
            setTestOpen(false);
            notify('success', "Test envoyé. Vérifie ton téléphone.");
          }}
          onError={(msg) => notify('error', msg)}
        />
      )}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  saving,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  saving?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg px-1 py-1.5">
      <span className="text-sm text-ink-800">{label}</span>
      <span className="flex items-center gap-2">
        {saving && <span className="text-xs text-ink-400">…</span>}
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition ${checked ? 'bg-brand-500' : 'bg-ink-300'}`}
        >
          <span
            className={`inline-block h-5 w-5 translate-x-0.5 translate-y-0.5 transform rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : ''}`}
          />
        </button>
      </span>
    </label>
  );
}

function HourSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="rounded-md border border-ink-200 bg-white px-2 py-1 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
    >
      {Array.from({ length: 24 }, (_, h) => (
        <option key={h} value={h}>
          {pad(h)}h
        </option>
      ))}
    </select>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th className={`px-5 py-3 text-${align} text-xs font-medium uppercase tracking-wider text-ink-500`}>
      {children}
    </th>
  );
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function TestModal({
  onClose,
  onSent,
  onError,
}: {
  onClose: () => void;
  onSent: () => void;
  onError: (msg: string) => void;
}) {
  const [titre, setTitre] = useState('Test Home & Care');
  const [message, setMessage] = useState('Ceci est un test. Si tu vois ce message, c\'est que ça marche.');
  const [submitting, setSubmitting] = useState(false);

  async function handleSend() {
    setSubmitting(true);
    const res = await fetch('/api/admin/notifications/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ titre, message }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      onError(error ?? 'Échec du test');
      return;
    }
    onSent();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-soft">
        <h2 className="font-display text-2xl font-medium text-ink-900">Notification de test</h2>
        <p className="mt-2 text-sm text-ink-500">
          Envoyée seulement à ton téléphone (utile pour vérifier que tout fonctionne).
        </p>
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700">Titre</label>
            <input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              maxLength={50}
              className="mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={200}
              className="mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} disabled={submitting} className="btn-secondary">
            Annuler
          </button>
          <button onClick={handleSend} disabled={submitting} className="btn-primary">
            {submitting ? 'Envoi…' : 'Envoyer'}
          </button>
        </div>
      </div>
    </div>
  );
}
