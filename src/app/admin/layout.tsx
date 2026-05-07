import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import SignOutButton from './SignOutButton';
import { ToastProvider } from '@/components/Toast';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'admin' || !profile.actif) {
    redirect('/login?error=not_admin');
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Home & Care" width={36} height={36} className="h-9 w-9" />
              <span className="font-semibold text-slate-900">Admin Home &amp; Care</span>
            </Link>

            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin/dashboard" className="text-slate-700 hover:text-slate-900">
                Tableau de bord
              </Link>
              <Link href="/admin/salaries" className="text-slate-700 hover:text-slate-900">
                Salariés
              </Link>
              <Link href="/admin/admins" className="text-slate-700 hover:text-slate-900">
                Admins
              </Link>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">{profile.email}</span>
              <SignOutButton />
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      </div>
    </ToastProvider>
  );
}
