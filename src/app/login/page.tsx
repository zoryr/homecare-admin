'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

// Si l'utilisateur arrive ici avec une session déjà active (par ex. après avoir
// cliqué le lien d'un email d'invitation Supabase), on l'envoie au dashboard.
// Le middleware vérifiera ensuite role=admin + actif et le rebalancera vers
// /login?error=not_admin si besoin.
function useRedirectIfSession() {
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/admin/dashboard');
      }
    });
  }, [router]);
}

type Step = 'email' | 'code';
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

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'code') codeInputRef.current?.focus();
  }, [step]);

  async function requestCode(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!email) return;
    setStatus({ kind: 'sending' });

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (error) {
      setStatus({ kind: 'error', message: error.message });
      return;
    }
    setStatus({ kind: 'idle' });
    setCode('');
    setStep('code');
  }

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.length !== 6) return;
    setStatus({ kind: 'sending' });

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });

    if (error) {
      setStatus({ kind: 'error', message: 'Code invalide ou expiré.' });
      return;
    }

    router.push('/admin/dashboard');
    router.refresh();
  }

  function backToEmail() {
    setStep('email');
    setCode('');
    setStatus({ kind: 'idle' });
  }

  return (
    <main className="brand-surface flex min-h-screen flex-col items-center justify-center px-6">
      <Link href="/" className="mb-10 flex items-center gap-3 transition hover:opacity-80" aria-label="Accueil">
        <Image src="/logo.png" alt="Home & Care" width={220} height={132} priority className="h-14 w-auto" />
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-ink-200 bg-white p-7 shadow-soft">
        <h1 className="font-display text-2xl font-medium text-ink-900">Connexion</h1>

        {externalError === 'auth_failed' && step === 'email' && (
          <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            La connexion a échoué. Réessaie.
          </p>
        )}
        {externalError === 'not_admin' && step === 'email' && (
          <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Ce compte n&apos;a pas accès à l&apos;espace administration.
          </p>
        )}

        {step === 'email' ? (
          <>
            <p className="mt-1 text-sm text-ink-500">
              Saisis ton email. Un code à 6 chiffres te sera envoyé.
            </p>
            <form onSubmit={requestCode} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-ink-700">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status.kind === 'sending'}
                  className="mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:bg-ink-50"
                  placeholder="prenom.nom@homeandcare.fr"
                />
              </div>

              <button
                type="submit"
                disabled={status.kind === 'sending' || !email}
                className="btn-primary w-full"
              >
                {status.kind === 'sending' ? 'Envoi…' : 'Recevoir le code'}
              </button>

              {status.kind === 'error' && (
                <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{status.message}</p>
              )}
            </form>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-ink-500">
              Code envoyé à <span className="font-medium text-ink-900">{email}</span>.
            </p>
            <form onSubmit={verifyCode} className="mt-6 space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-ink-700">
                  Code à 6 chiffres
                </label>
                <input
                  ref={codeInputRef}
                  id="code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  disabled={status.kind === 'sending'}
                  className="mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3 py-3 text-center font-display text-2xl tracking-[0.5em] text-ink-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:bg-ink-50"
                  placeholder="••••••"
                />
              </div>

              <button
                type="submit"
                disabled={status.kind === 'sending' || code.length !== 6}
                className="btn-primary w-full"
              >
                {status.kind === 'sending' ? 'Vérification…' : 'Valider'}
              </button>

              {status.kind === 'error' && (
                <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{status.message}</p>
              )}

              <div className="flex justify-between pt-1 text-sm">
                <button
                  type="button"
                  onClick={() => requestCode()}
                  disabled={status.kind === 'sending'}
                  className="text-brand-700 underline-offset-2 transition hover:underline disabled:opacity-50"
                >
                  Renvoyer un code
                </button>
                <button
                  type="button"
                  onClick={backToEmail}
                  disabled={status.kind === 'sending'}
                  className="text-ink-600 underline-offset-2 transition hover:underline disabled:opacity-50"
                >
                  Modifier l&apos;email
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <p className="mt-10 text-xs uppercase tracking-[0.2em] text-ink-400">
        Pays de Grasse · agence06@homeandcare.fr
      </p>
    </main>
  );
}
