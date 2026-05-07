'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

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
  const router = useRouter();
  const params = useSearchParams();
  const externalError = params.get('error');

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'code') {
      codeInputRef.current?.focus();
    }
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
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
      <Link href="/" className="mb-8 flex flex-col items-center">
        <Image src="/logo.png" alt="Home & Care" width={120} height={120} priority className="h-auto w-[120px]" />
      </Link>

      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Connexion</h1>

        {externalError === 'auth_failed' && step === 'email' && (
          <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            La connexion a échoué. Réessaie.
          </p>
        )}
        {externalError === 'not_admin' && step === 'email' && (
          <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Ce compte n&apos;a pas accès à l&apos;espace administration.
          </p>
        )}

        {step === 'email' ? (
          <>
            <p className="mt-1 text-sm text-slate-600">
              Saisis ton email. Un code à 6 chiffres te sera envoyé.
            </p>
            <form onSubmit={requestCode} className="mt-5 space-y-4">
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
                  disabled={status.kind === 'sending'}
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-50"
                  placeholder="prenom.nom@homeandcare.fr"
                />
              </div>

              <button
                type="submit"
                disabled={status.kind === 'sending' || !email}
                className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {status.kind === 'sending' ? 'Envoi…' : 'Recevoir le code'}
              </button>

              {status.kind === 'error' && (
                <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{status.message}</p>
              )}
            </form>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-slate-600">
              Code envoyé à <span className="font-medium text-slate-900">{email}</span>.
            </p>
            <form onSubmit={verifyCode} className="mt-5 space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-slate-700">
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
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-lg tracking-[0.4em] text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-50"
                  placeholder="••••••"
                />
              </div>

              <button
                type="submit"
                disabled={status.kind === 'sending' || code.length !== 6}
                className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {status.kind === 'sending' ? 'Vérification…' : 'Valider'}
              </button>

              {status.kind === 'error' && (
                <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{status.message}</p>
              )}

              <div className="flex justify-between pt-1 text-sm">
                <button
                  type="button"
                  onClick={() => requestCode()}
                  disabled={status.kind === 'sending'}
                  className="text-slate-700 underline-offset-2 hover:text-slate-900 hover:underline disabled:opacity-50"
                >
                  Renvoyer un code
                </button>
                <button
                  type="button"
                  onClick={backToEmail}
                  disabled={status.kind === 'sending'}
                  className="text-slate-700 underline-offset-2 hover:text-slate-900 hover:underline disabled:opacity-50"
                >
                  Modifier l&apos;email
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
