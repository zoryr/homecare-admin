'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

// Si l'utilisateur arrive avec une session déjà active, on l'envoie au dashboard.
// Le middleware vérifiera ensuite role=admin + actif et le rebalancera vers
// /login?error=not_admin si besoin.
function useRedirectIfSession() {
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/admin/dashboard');
    });
  }, [router]);
}

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'error'; message: string };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  useRedirectIfSession();
  const router = useRouter();
  const params = useSearchParams();
  const externalError = params.get('error');

  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!matricule.trim() || !password) return;
    setStatus({ kind: 'sending' });

    const supabase = createClient();
    const email = `${matricule.toLowerCase().trim()}@infocare.local`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const message = /invalid login credentials/i.test(error.message)
        ? 'Matricule ou mot de passe incorrect.'
        : 'Connexion impossible. Réessayez.';
      setStatus({ kind: 'error', message });
      return;
    }

    // Le middleware vérifie role=admin + actif ; un non-admin sera renvoyé ici
    // avec ?error=not_admin.
    router.push('/admin/dashboard');
    router.refresh();
  }

  return (
    <main className="brand-surface flex min-h-screen flex-col items-center justify-center px-6">
      <Link href="/" className="mb-10 flex items-center gap-3 transition hover:opacity-80" aria-label="Accueil">
        <Image src="/logo.png" alt="Home & Care" width={220} height={132} priority className="h-14 w-auto" />
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-ink-200 bg-white p-7 shadow-soft">
        <h1 className="font-display text-2xl font-medium text-ink-900">Connexion</h1>
        <p className="mt-1 text-sm text-ink-500">Espace administration · matricule + mot de passe.</p>

        {externalError === 'auth_failed' && (
          <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            La connexion a échoué. Réessayez.
          </p>
        )}
        {externalError === 'not_admin' && (
          <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Ce compte n&apos;a pas accès à l&apos;espace administration.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="matricule" className="block text-sm font-medium text-ink-700">
              Matricule
            </label>
            <input
              id="matricule"
              type="text"
              required
              autoCapitalize="none"
              autoComplete="username"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              disabled={status.kind === 'sending'}
              className="mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:bg-ink-50"
              placeholder="IN2021070001"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink-700">
              Mot de passe
            </label>
            <div className="relative mt-1.5">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={status.kind === 'sending'}
                className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 pr-16 text-sm text-ink-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:bg-ink-50"
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-medium text-ink-500 transition hover:text-ink-800"
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={status.kind === 'sending' || !matricule.trim() || !password}
            className="btn-primary w-full"
          >
            {status.kind === 'sending' ? 'Connexion…' : 'Se connecter'}
          </button>

          {status.kind === 'error' && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {status.message}
            </p>
          )}
        </form>
      </div>

      <p className="mt-10 text-xs uppercase tracking-[0.2em] text-ink-400">
        Pays de Grasse · agence06@homeandcare.fr
      </p>
    </main>
  );
}
