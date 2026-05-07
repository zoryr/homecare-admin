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

const LABELS: Record<Role, { eyebrow: string; title: string; inviteCta: string; emptyMsg: string }> = {
  salarie: {
    eyebrow: 'Équipe',
    title: 'Salariés',
    inviteCta: 'Inviter un salarié',
    emptyMsg: 'Aucun salarié pour le moment.',
  },
  admin: {
    eyebrow: 'Équipe',
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
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-600">
            {labels.eyebrow}
          </p>
          <h1 className="mt-1 font-display text-4xl font-medium text-ink-900">{labels.title}</h1>
          <p className="mt-2 text-sm text-ink-500">
            {members.length} {role === 'admin' ? 'administrateur' : 'salarié'}
            {members.length > 1 ? 's' : ''} · gestion des invitations et accès.
          </p>
        </div>
        <button onClick={() => setInviteOpen(true)} className="btn-primary">
          {labels.inviteCta}
        </button>
      </header>

      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft">
        <table className="min-w-full divide-y divide-ink-200 text-sm">
          <thead className="bg-ink-50/60">
            <tr>
              <Th>Email</Th>
              <Th>Prénom</Th>
              <Th>Nom</Th>
              <Th>Statut</Th>
              <Th>Inscrit le</Th>
              <Th align="right">Action</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {members.map((m) => (
              <tr key={m.id} className="transition hover:bg-ink-50/60">
                <td className="whitespace-nowrap px-5 py-3 font-medium text-ink-900">{m.email}</td>
                <td className="px-5 py-3 text-ink-700">{m.prenom ?? '—'}</td>
                <td className="px-5 py-3 text-ink-700">{m.nom ?? '—'}</td>
                <td className="px-5 py-3">
                  <span
                    className={
                      m.actif
                        ? 'inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700'
                        : 'inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2.5 py-0.5 text-xs text-ink-600'
                    }
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${m.actif ? 'bg-brand-500' : 'bg-ink-400'}`}
                      aria-hidden
                    />
                    {m.actif ? 'Actif' : 'Désactivé'}
                  </span>
                </td>
                <td className="px-5 py-3 text-ink-500">
                  {new Date(m.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => setEditing(m)}
                    className="rounded-md border border-ink-200 bg-white px-3 py-1 text-xs font-medium text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
                  >
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-ink-500">
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

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-5 py-3 text-${align} text-xs font-medium uppercase tracking-wider text-ink-500`}
    >
      {children}
    </th>
  );
}
