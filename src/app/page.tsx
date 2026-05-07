import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
      <Image
        src="/logo.png"
        alt="Home & Care"
        width={180}
        height={180}
        priority
        className="mb-8 h-auto w-[180px]"
      />
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        Admin Home &amp; Care
      </h1>
      <p className="mt-3 text-base text-slate-600">Espace administration</p>
      <Link
        href="/login"
        className="mt-8 inline-flex items-center rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Se connecter
      </Link>
    </main>
  );
}
