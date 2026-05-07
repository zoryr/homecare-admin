import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="brand-surface flex min-h-screen flex-col items-center justify-center px-6">
      <Image
        src="/logo.png"
        alt="Home & Care"
        width={320}
        height={192}
        priority
        className="mb-10 h-auto w-[200px]"
      />
      <h1 className="font-display text-4xl font-medium tracking-tight text-ink-900 sm:text-5xl">
        Espace administration
      </h1>
      <p className="mt-3 max-w-md text-center text-base text-ink-500">
        Pilotage des actualités, du règlement et des invitations pour l&apos;équipe Home &amp; Care.
      </p>
      <Link href="/login" className="btn-primary mt-10">
        Se connecter
      </Link>

      <p className="mt-12 text-xs uppercase tracking-[0.2em] text-ink-400">
        Pays de Grasse · agence06@homeandcare.fr
      </p>
    </main>
  );
}
