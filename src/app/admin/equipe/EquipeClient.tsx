'use client';

import Link from 'next/link';

import TeamTable, { type Member, type Role } from '@/components/admin/TeamTable';

type Props = {
  role: Role;
  members: Member[];
  currentUserId: string;
};

export default function EquipeClient({ role, members, currentUserId }: Props) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
          Filtre
        </span>
        <Link
          href="/admin/equipe?role=salarie"
          className={
            role === 'salarie'
              ? 'rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm'
              : 'rounded-full border border-ink-200 bg-white px-4 py-1.5 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50/40'
          }
        >
          Salariés
        </Link>
        <Link
          href="/admin/equipe?role=admin"
          className={
            role === 'admin'
              ? 'rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm'
              : 'rounded-full border border-ink-200 bg-white px-4 py-1.5 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50/40'
          }
        >
          Administrateurs
        </Link>
      </div>
      <TeamTable role={role} members={members} currentUserId={currentUserId} />
    </div>
  );
}
