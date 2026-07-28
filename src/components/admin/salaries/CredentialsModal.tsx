'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

type Props = {
  title: string;
  identifiant: string;
  password: string;
  onClose: () => void;
};

/**
 * Modale de confirmation affichant les identifiants EN GRAND, une seule fois.
 * Réutilisée après création d'un compte et après réinitialisation d'un mot de passe.
 */
export default function CredentialsModal({ title, identifiant, password, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = `Matricule: ${identifiant}\nMot de passe: ${password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-soft">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <Check size={18} strokeWidth={2.4} />
          </span>
          <h2 className="font-display text-2xl font-medium text-ink-900">{title}</h2>
        </div>

        <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Matricule</p>
          <p className="mt-0.5 select-all font-display text-2xl font-bold text-brand-700">{identifiant}</p>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
            Mot de passe
          </p>
          <p className="mt-0.5 select-all font-display text-2xl font-bold text-brand-700">{password}</p>

          <button
            type="button"
            onClick={copy}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-brand-300 bg-white px-3 py-1.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copié !' : 'Copier les identifiants'}
          </button>
        </div>

        <p className="mt-4 text-sm text-ink-700">
          📞 Communiquez ces informations au salarié <strong>à l&apos;oral</strong> (téléphone ou en
          face-à-face).
        </p>
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          ⚠ Une fois cette fenêtre fermée, le mot de passe ne sera plus jamais affiché. En cas
          d&apos;oubli, utilisez «&nbsp;Réinitialiser le mot de passe&nbsp;».
        </p>

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className="btn-primary">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
