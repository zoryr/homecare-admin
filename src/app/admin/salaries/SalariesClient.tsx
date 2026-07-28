'use client';

import { KeyRound, UserCheck, UserX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import CredentialsModal from '@/components/admin/salaries/CredentialsModal';
import NewSalarieModal from '@/components/admin/salaries/NewSalarieModal';
import ResetPasswordModal from '@/components/admin/salaries/ResetPasswordModal';
import { useToast } from '@/components/Toast';

export type Salarie = {
  id: string;
  identifiant: string;
  email: string;
  prenom: string | null;
  role: 'salarie' | 'admin';
  actif: boolean;
  created_at: string;
  last_sign_in_at: string | null;
};

type StatusFilter = 'tous' | 'actifs' | 'desactives';

function relativeDate(iso: string | null): string {
  if (!iso) return 'Jamais';
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const day = 24 * 60 * 60 * 1000;
  if (diffMs < 60 * 1000) return "À l'instant";
  if (diffMs < 60 * 60 * 1000) return `Il y a ${Math.floor(diffMs / (60 * 1000))} min`;
  if (diffMs < day) return `Il y a ${Math.floor(diffMs / (60 * 60 * 1000))} h`;
  if (diffMs < 7 * day) return `Il y a ${Math.floor(diffMs / day)} j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SalariesClient({ salaries }: { salaries: Salarie[] }) {
  const router = useRouter();
  const { notify } = useToast();
  const [, startTransition] = useTransition();

  const [status, setStatus] = useState<StatusFilter>('tous');
  const [search, setSearch] = useState('');

  const [newOpen, setNewOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<Salarie | null>(null);
  const [creds, setCreds] = useState<{ title: string; identifiant: string; password: string } | null>(null);

  function refresh() {
    startTransition(() => router.refresh());
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return salaries.filter((s) => {
      if (status === 'actifs' && !s.actif) return false;
      if (status === 'desactives' && s.actif) return false;
      if (!q) return true;
      return (
        s.identifiant.toLowerCase().includes(q) || (s.prenom ?? '').toLowerCase().includes(q)
      );
    });
  }, [salaries, status, search]);

  async function toggleActif(s: Salarie) {
    const res = await fetch(`/api/admin/salaries/${s.id}/toggle-actif`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ actif: !s.actif }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Échec du changement de statut');
      return;
    }
    notify('success', s.actif ? 'Salarié désactivé.' : 'Salarié réactivé.');
    refresh();
  }

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-600">Équipe</p>
          <h1 className="mt-1 font-display text-4xl font-medium text-ink-900">Salariés</h1>
          <p className="mt-2 text-sm text-ink-500">
            {salaries.length} compte{salaries.length > 1 ? 's' : ''} · matricule + mot de passe.
          </p>
        </div>
        <button onClick={() => setNewOpen(true)} className="btn-primary">
          + Nouveau salarié
        </button>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex overflow-hidden rounded-lg border border-ink-200">
          {(['tous', 'actifs', 'desactives'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setStatus(f)}
              className={`px-3 py-1.5 text-sm transition ${
                status === f ? 'bg-brand-50 font-medium text-brand-700' : 'bg-white text-ink-600 hover:bg-ink-50'
              }`}
            >
              {f === 'tous' ? 'Tous' : f === 'actifs' ? 'Actifs' : 'Désactivés'}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par matricule ou prénom…"
          className="min-w-[16rem] flex-1 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft">
        <table className="min-w-full divide-y divide-ink-200 text-sm">
          <thead className="bg-ink-50/60">
            <tr>
              <Th>Matricule</Th>
              <Th>Prénom</Th>
              <Th>Rôle</Th>
              <Th>Statut</Th>
              <Th>Dernière connexion</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {filtered.map((s) => (
              <tr key={s.id} className="transition hover:bg-ink-50/60">
                <td className="whitespace-nowrap px-5 py-3 font-medium text-ink-900">{s.identifiant}</td>
                <td className="px-5 py-3 text-ink-700">{s.prenom ?? '—'}</td>
                <td className="px-5 py-3">
                  <span
                    className={
                      s.role === 'admin'
                        ? 'inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700'
                        : 'inline-flex rounded-full bg-ink-100 px-2.5 py-0.5 text-xs text-ink-600'
                    }
                  >
                    {s.role === 'admin' ? 'Admin' : 'Salarié'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={
                      s.actif
                        ? 'inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700'
                        : 'inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2.5 py-0.5 text-xs text-ink-600'
                    }
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${s.actif ? 'bg-brand-500' : 'bg-ink-400'}`}
                      aria-hidden
                    />
                    {s.actif ? 'Actif' : 'Désactivé'}
                  </span>
                </td>
                <td className="px-5 py-3 text-ink-500">{relativeDate(s.last_sign_in_at)}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setResetTarget(s)}
                      title="Réinitialiser le mot de passe"
                      aria-label="Réinitialiser le mot de passe"
                      className="rounded-md p-1.5 text-ink-500 transition hover:bg-brand-50 hover:text-brand-700"
                    >
                      <KeyRound size={17} />
                    </button>
                    <button
                      onClick={() => toggleActif(s)}
                      title={s.actif ? 'Désactiver' : 'Réactiver'}
                      aria-label={s.actif ? 'Désactiver' : 'Réactiver'}
                      className={`rounded-md p-1.5 transition ${
                        s.actif
                          ? 'text-ink-500 hover:bg-rose-50 hover:text-rose-700'
                          : 'text-ink-500 hover:bg-brand-50 hover:text-brand-700'
                      }`}
                    >
                      {s.actif ? <UserX size={17} /> : <UserCheck size={17} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-ink-500">
                  Aucun salarié ne correspond.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {newOpen && (
        <NewSalarieModal
          onClose={() => setNewOpen(false)}
          onError={(msg) => notify('error', msg)}
          onCreated={({ identifiant, password }) => {
            setNewOpen(false);
            setCreds({ title: 'Compte créé', identifiant, password });
            refresh();
          }}
        />
      )}

      {resetTarget && (
        <ResetPasswordModal
          salarieId={resetTarget.id}
          matricule={resetTarget.identifiant}
          prenom={resetTarget.prenom}
          onClose={() => setResetTarget(null)}
          onError={(msg) => notify('error', msg)}
          onDone={(newPassword) => {
            const id = resetTarget.identifiant;
            setResetTarget(null);
            setCreds({ title: 'Mot de passe réinitialisé', identifiant: id, password: newPassword });
          }}
        />
      )}

      {creds && (
        <CredentialsModal
          title={creds.title}
          identifiant={creds.identifiant}
          password={creds.password}
          onClose={() => setCreds(null)}
        />
      )}
    </div>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th className={`px-5 py-3 text-${align} text-xs font-medium uppercase tracking-wider text-ink-500`}>
      {children}
    </th>
  );
}
