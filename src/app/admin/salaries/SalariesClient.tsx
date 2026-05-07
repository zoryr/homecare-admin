'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import InviteModal from './InviteModal';
import { useToast } from '@/components/Toast';
import type { SalarieRow } from './page';

export default function SalariesClient({ salaries }: { salaries: SalarieRow[] }) {
  const router = useRouter();
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  async function toggleActif(id: string, actif: boolean) {
    const res = await fetch('/api/admin/toggle-actif', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: id, actif }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Erreur');
      return;
    }
    notify('success', actif ? 'Salarié réactivé' : 'Salarié désactivé');
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Salariés</h1>
        <button
          onClick={() => setOpen(true)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Inviter un salarié
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Email</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Prénom</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Nom</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Rôle</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Actif</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Inscrit le</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {salaries.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2 text-slate-900">{s.email}</td>
                <td className="px-4 py-2 text-slate-700">{s.prenom ?? '—'}</td>
                <td className="px-4 py-2 text-slate-700">{s.nom ?? '—'}</td>
                <td className="px-4 py-2 text-slate-700">{s.role}</td>
                <td className="px-4 py-2">
                  <span
                    className={
                      s.actif
                        ? 'inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700'
                        : 'inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600'
                    }
                  >
                    {s.actif ? 'oui' : 'non'}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {new Date(s.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-2">
                  <button
                    disabled={pending}
                    onClick={() => toggleActif(s.id, !s.actif)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    {s.actif ? 'Désactiver' : 'Réactiver'}
                  </button>
                </td>
              </tr>
            ))}
            {salaries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  Aucun salarié pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <InviteModal
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            notify('success', 'Invitation envoyée.');
            startTransition(() => router.refresh());
          }}
          onError={(msg) => notify('error', msg)}
        />
      )}
    </div>
  );
}
