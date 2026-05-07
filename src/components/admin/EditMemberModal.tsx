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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-soft">
        <h2 className="font-display text-2xl font-medium text-ink-900">Modifier la fiche</h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700">Email</label>
            <input
              type="email"
              value={member.email}
              readOnly
              className="mt-1.5 block w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5 text-sm text-ink-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-prenom" className="block text-sm font-medium text-ink-700">
                Prénom
              </label>
              <input
                id="edit-prenom"
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="edit-nom" className="block text-sm font-medium text-ink-700">
                Nom
              </label>
              <input
                id="edit-nom"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-ink-700">Rôle</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <RoleOption
                checked={role === 'salarie'}
                onChange={() => setRole('salarie')}
                label="Salarié"
                disabled={isSelf}
              />
              <RoleOption
                checked={role === 'admin'}
                onChange={() => setRole('admin')}
                label="Admin"
              />
            </div>
            {isSelf && (
              <p className="mt-1 text-xs text-ink-500">Tu ne peux pas te retirer le rôle admin.</p>
            )}
          </fieldset>

          <label
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition ${
              actif
                ? 'border-brand-200 bg-brand-50 text-brand-800'
                : 'border-ink-200 bg-white text-ink-700'
            } ${isSelf ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <input
              type="checkbox"
              checked={actif}
              onChange={(e) => setActif(e.target.checked)}
              disabled={isSelf}
              className="h-4 w-4 rounded border-ink-300 accent-brand-500"
            />
            Compte actif
            {isSelf && <span className="ml-auto text-xs text-ink-500">verrouillé</span>}
          </label>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} disabled={submitting} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .input {
          margin-top: 6px;
          width: 100%;
          border: 1px solid #e8e6df;
          background: white;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          border-radius: 0.5rem;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .input:focus {
          outline: none;
          border-color: #29a4b8;
          box-shadow: 0 0 0 3px rgba(41, 164, 184, 0.2);
        }
      `}</style>
    </div>
  );
}

function RoleOption({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
        checked
          ? 'border-brand-300 bg-brand-50 text-brand-800'
          : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 accent-brand-500"
      />
      {label}
    </label>
  );
}
