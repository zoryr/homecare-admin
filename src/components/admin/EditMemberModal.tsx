'use client';

import { useState } from 'react';

import type { Member, Role } from './TeamTable';

type Props = {
  member: Member;
  isSelf: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function EditMemberModal({ member, isSelf, onClose, onSuccess, onError }: Props) {
  const [prenom, setPrenom] = useState(member.prenom ?? '');
  const [nom, setNom] = useState(member.nom ?? '');
  const [role, setRole] = useState<Role>(member.role);
  const [actif, setActif] = useState(member.actif);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const res = await fetch(`/api/admin/profiles/${member.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        prenom: prenom.trim() || null,
        nom: nom.trim() || null,
        role,
        actif,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      onError(error ?? 'Échec de la modification');
      return;
    }
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Modifier la fiche</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={member.email}
              readOnly
              className="mt-1 block w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
            />
          </div>

          <div>
            <label htmlFor="edit-prenom" className="block text-sm font-medium text-slate-700">Prénom</label>
            <input
              id="edit-prenom"
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

          <div>
            <label htmlFor="edit-nom" className="block text-sm font-medium text-slate-700">Nom</label>
            <input
              id="edit-nom"
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-slate-700">Rôle</legend>
            <div className="mt-2 flex gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  checked={role === 'salarie'}
                  onChange={() => setRole('salarie')}
                  disabled={isSelf}
                  className="h-4 w-4 border-slate-300"
                />
                Salarié
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  className="h-4 w-4 border-slate-300"
                />
                Admin
              </label>
            </div>
            {isSelf && (
              <p className="mt-1 text-xs text-slate-500">
                Tu ne peux pas te retirer le rôle admin.
              </p>
            )}
          </fieldset>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={actif}
              onChange={(e) => setActif(e.target.checked)}
              disabled={isSelf}
              className="h-4 w-4 rounded border-slate-300"
            />
            Compte actif
            {isSelf && <span className="ml-1 text-xs text-slate-500">(impossible sur ton propre compte)</span>}
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
