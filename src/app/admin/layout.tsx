import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import AdminNav from './AdminNav';
import SignOutButton from './SignOutButton';
import { ToastProvider } from '@/components/Toast';
import { getCurrentProfile } from '@/lib/supabase/get-profile';
import '@/styles/tiptap.css';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'admin' || !profile.actif) {
    redirect('/login?error=not_admin');
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-ink-50">
        <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/85 backdrop-blur">
          <div className="flex w-full flex-wrap items-center gap-4 px-6 py-3">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 transition hover:opacity-80"
              aria-label="Accueil admin Home & Care"
            >
              <Image
                src="/logo.png"
                alt="Home & Care"
                width={140}
                height={84}
                priority
                className="h-9 w-auto"
              />
              <span className="hidden text-sm font-medium uppercase tracking-[0.18em] text-ink-500 sm:inline">
                Espace admin
              </span>
            </Link>

            <AdminNav />

            <div className="ml-auto flex items-center gap-3">
              <span className="hidden h-5 w-px bg-ink-200 sm:block" />
              <span className="hidden text-xs text-ink-500 md:inline">{profile.email}</span>
              <SignOutButton />
            </div>
          </div>
        </header>

        <main className="brand-surface w-full flex-1 px-6 py-10">
          {children}
        </main>

        <footer className="border-t border-ink-200 bg-white">
          <div className="flex items-center justify-between px-6 py-3 text-xs text-ink-500">
            <span>Home &amp; Care · Pays de Grasse</span>
            <span>agence06@homeandcare.fr</span>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
