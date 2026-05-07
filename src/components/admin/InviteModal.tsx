'use client';

import { useState } from 'react';

import type { Role } from './TeamTable';

const LABELS: Record<Role, { title: string; submitCta: string; warning: string }> = {
  salarie: {
    title: 'Inviter un salarié',
    submitCta: "Envoyer l'invitation",
    warning:
      "Le salarié n'est pas notifié automatiquement. Pense à lui dire de télécharger l'app et de se connecter avec son email.",
  },
  admin: {
    title: 'Inviter un administrateur',
    submitCta: "Envoyer l'invitation",
    warning:
      "L'admin n'est pas notifié automatiquement. Pense à lui dire de se connecter sur l'espace admin avec son email.",
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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">{labels.title}</h2>
        <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">{labels.warning}</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="invite-email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label htmlFor="invite-prenom" className="block text-sm font-medium text-slate-700">
              Prénom
            </label>
            <input
              id="invite-prenom"
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label htmlFor="invite-nom" className="block text-sm font-medium text-slate-700">
              Nom
            </label>
            <input
              id="invite-nom"
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

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
              {submitting ? 'Envoi…' : labels.submitCta}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
