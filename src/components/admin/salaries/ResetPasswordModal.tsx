'use client';

import { useState } from 'react';

type Props = {
  salarieId: string;
  matricule: string;
  prenom: string | null;
  onClose: () => void;
  onDone: (newPassword: string) => void;
  onError: (message: string) => void;
};

export default function ResetPasswordModal({
  salarieId,
  matricule,
  prenom,
  onClose,
  onDone,
  onError,
}: Props) {
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword.length < 6) {
      onError('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }
    setSubmitting(true);

    const res = await fetch(`/api/admin/salaries/${salarieId}/reset-password`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      onError(error ?? 'Échec de la réinitialisation');
      return;
    }

    const data = (await res.json()) as { newPassword: string };
    onDone(data.newPassword);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-soft">
        <div className="flex items-start justify-between">
          <h2 className="font-display text-2xl font-medium text-ink-900">
            Réinitialiser le mot de passe
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Fermer"
            className="rounded-md p-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
          >
            ✕
          </button>
        </div>

        <p className="mt-2 text-sm text-ink-500">
          Salarié : <strong className="text-ink-800">{matricule}</strong>
          {prenom ? ` · ${prenom}` : ''}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="reset-password" className="block text-sm font-medium text-ink-700">
              Nouveau mot de passe <span className="text-rose-600">*</span>
            </label>
            <input
              id="reset-password"
              type="text"
              autoComplete="off"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="reset-input"
            />
            <p className="mt-1 text-xs text-ink-500">Min 6 caractères.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} disabled={submitting} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Réinitialisation…' : 'Réinitialiser'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .reset-input {
          margin-top: 6px;
          width: 100%;
          border: 1px solid #e8e6df;
          background: white;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          border-radius: 0.5rem;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .reset-input:focus {
          outline: none;
          border-color: #29a4b8;
          box-shadow: 0 0 0 3px rgba(41, 164, 184, 0.2);
        }
      `}</style>
    </div>
  );
}
