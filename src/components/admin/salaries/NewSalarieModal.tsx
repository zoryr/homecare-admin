'use client';

import { useState } from 'react';

const IDENTIFIANT_RE = /^[a-zA-Z0-9._-]+$/;

type Props = {
  onClose: () => void;
  onCreated: (creds: { identifiant: string; password: string }) => void;
  onError: (message: string) => void;
};

export default function NewSalarieModal({ onClose, onCreated, onError }: Props) {
  const [identifiant, setIdentifiant] = useState('');
  const [prenom, setPrenom] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function validate(): string | null {
    const id = identifiant.trim();
    if (id.length < 3 || id.length > 30 || !IDENTIFIANT_RE.test(id)) {
      return 'Matricule invalide (3 à 30 caractères : lettres, chiffres, . _ - uniquement).';
    }
    if (password.length < 6) return 'Le mot de passe doit faire au moins 6 caractères.';
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const err = validate();
    if (err) {
      onError(err);
      return;
    }
    setSubmitting(true);

    const res = await fetch('/api/admin/salaries/create', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ identifiant: identifiant.trim(), password, prenom: prenom.trim() || null }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      onError(error ?? 'Échec de la création');
      return;
    }

    const data = (await res.json()) as { identifiant: string; password: string };
    onCreated({ identifiant: data.identifiant, password: data.password });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-soft">
        <div className="flex items-start justify-between">
          <h2 className="font-display text-2xl font-medium text-ink-900">Nouveau salarié</h2>
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="salarie-matricule" className="block text-sm font-medium text-ink-700">
              Matricule <span className="text-rose-600">*</span>
            </label>
            <input
              id="salarie-matricule"
              type="text"
              autoCapitalize="none"
              autoComplete="off"
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              placeholder="IN2021070001"
              className="salarie-input"
            />
            <p className="mt-1 text-xs text-ink-500">
              Généré par votre logiciel RH. C&apos;est ce que le salarié tapera pour se connecter.
            </p>
          </div>

          <div>
            <label htmlFor="salarie-prenom" className="block text-sm font-medium text-ink-700">
              Prénom <span className="text-ink-400">(optionnel)</span>
            </label>
            <input
              id="salarie-prenom"
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="salarie-input"
            />
            <p className="mt-1 text-xs text-ink-500">Pour votre gestion interne uniquement.</p>
          </div>

          <div>
            <label htmlFor="salarie-password" className="block text-sm font-medium text-ink-700">
              Mot de passe <span className="text-rose-600">*</span>
            </label>
            <input
              id="salarie-password"
              type="text"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="salarie-input"
            />
            <p className="mt-1 text-xs text-ink-500">
              Vous communiquerez ce mot de passe au salarié à l&apos;oral (min 6 caractères).
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} disabled={submitting} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Création…' : 'Créer'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .salarie-input {
          margin-top: 6px;
          width: 100%;
          border: 1px solid #e8e6df;
          background: white;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          border-radius: 0.5rem;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .salarie-input:focus {
          outline: none;
          border-color: #29a4b8;
          box-shadow: 0 0 0 3px rgba(41, 164, 184, 0.2);
        }
      `}</style>
    </div>
  );
}
