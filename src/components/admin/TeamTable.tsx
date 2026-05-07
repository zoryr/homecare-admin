'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import EditMemberModal from './EditMemberModal';
import InviteModal from './InviteModal';
import { useToast } from '@/components/Toast';

export type Role = 'salarie' | 'admin';

export type Member = {
  id: string;
  email: string;
  prenom: string | null;
  nom: string | null;
  role: Role;
  actif: boolean;
  created_at: string;
};

const LABELS: Record<Role, { title: string; inviteCta: string; emptyMsg: string }> = {
  salarie: {
    title: 'Salariés',
    inviteCta: 'Inviter un salarié',
    emptyMsg: 'Aucun salarié pour le moment.',
  },
  admin: {
    title: 'Administrateurs',
    inviteCta: 'Inviter un admin',
    emptyMsg: 'Aucun administrateur pour le moment.',
  },
};

type Props = {
  role: Role;
  members: Member[];
  currentUserId: string;
};

export default function TeamTable({ role, members, currentUserId }: Props) {
  const router = useRouter();
  const { notify } = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [, startTransition] = useTransition();
  const labels = LABELS[role];

  function refresh() {
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{labels.title}</h1>
        <button
          onClick={() => setInviteOpen(true)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          {labels.inviteCta}
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Email</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Prénom</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Nom</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Actif</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Inscrit le</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-2 text-slate-900">{m.email}</td>
                <td className="px-4 py-2 text-slate-700">{m.prenom ?? '—'}</td>
                <td className="px-4 py-2 text-slate-700">{m.nom ?? '—'}</td>
                <td className="px-4 py-2">
                  <span
                    className={
                      m.actif
                        ? 'inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700'
                        : 'inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600'
                    }
                  >
                    {m.actif ? 'oui' : 'non'}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {new Date(m.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => setEditing(m)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  {labels.emptyMsg}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {inviteOpen && (
        <InviteModal
          role={role}
          onClose={() => setInviteOpen(false)}
          onSuccess={() => {
            setInviteOpen(false);
            notify('success', 'Invitation envoyée. Un email a été adressé au destinataire.');
            refresh();
          }}
          onError={(msg) => notify('error', msg)}
        />
      )}

      {editing && (
        <EditMemberModal
          member={editing}
          isSelf={editing.id === currentUserId}
          onClose={() => setEditing(null)}
          onSuccess={() => {
            setEditing(null);
            notify('success', 'Fiche mise à jour.');
            refresh();
          }}
          onError={(msg) => notify('error', msg)}
        />
      )}
    </div>
  );
}
