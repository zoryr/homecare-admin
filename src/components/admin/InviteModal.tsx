'use client';

import { useState } from 'react';

import type { Role } from './TeamTable';

const LABELS: Record<Role, { title: string; submitCta: string; warning: string }> = {
  salarie: {
    title: 'Inviter un salarié',
    submitCta: "Envoyer l'invitation",
    warning:
      "Un email de bienvenue va être envoyé. Le lien dans l'email ouvre l'app mobile — pense à demander au salarié d'avoir installé l'app au préalable.",
  },
  admin: {
    title: 'Inviter un administrateur',
    submitCta: "Envoyer l'invitation",
    warning:
      "Un email de bienvenue va être envoyé. Le lien dans l'email ouvre directement l'espace administration.",
  },
};

type Props = {
  role: Role;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function InviteModal({ role, onClose, onSuccess, onError }: Props) {
  const [email, setEmail] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const labels = LABELS[role];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const res = await fetch('/api/admin/invite', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, prenom, nom, role }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      onError(error ?? "Échec de l'invitation");
      return;
    }
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-soft">
        <h2 className="font-display text-2xl font-medium text-ink-900">{labels.title}</h2>
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {labels.warning}
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Field label="Email" htmlFor="invite-email">
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom" htmlFor="invite-prenom">
              <input
                id="invite-prenom"
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Nom" htmlFor="invite-nom">
              <input
                id="invite-nom"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Envoi…' : labels.submitCta}
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

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink-700">
        {label}
      </label>
      {children}
    </div>
  );
}
