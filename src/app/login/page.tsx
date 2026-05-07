'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'error'; message: string };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const params = useSearchParams();
  const externalError = params.get('error');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: 'sending' });

    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${siteUrl}/auth/callback` },
    });

    if (error) {
      setStatus({ kind: 'error', message: error.message });
      return;
    }
    setStatus({ kind: 'sent' });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
      <Link href="/" className="mb-8 flex flex-col items-center">
        <Image src="/logo.png" alt="Home & Care" width={120} height={120} priority className="h-auto w-[120px]" />
      </Link>

      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Connexion</h1>
        <p className="mt-1 text-sm text-slate-600">Reçois un lien magique par email pour te connecter.</p>

        {externalError === 'auth_failed' && (
          <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            La connexion a échoué. Réessaie.
          </p>
        )}
        {externalError === 'not_admin' && (
          <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Ce compte n&apos;a pas accès à l&apos;espace administration.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status.kind === 'sending' || status.kind === 'sent'}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-50"
              placeholder="prenom.nom@homeandcare.fr"
            />
          </div>

          <button
            type="submit"
            disabled={status.kind === 'sending' || status.kind === 'sent'}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {status.kind === 'sending' ? 'Envoi…' : 'Recevoir le lien de connexion'}
          </button>

          {status.kind === 'sent' && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Lien envoyé. Vérifie ta boîte mail.
            </p>
          )}
          {status.kind === 'error' && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{status.message}</p>
          )}
        </form>
      </div>
    </main>
  );
}
