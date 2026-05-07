import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  // Petits compteurs pour rendre le dashboard utile
  const [{ count: salaries }, { count: admins }, { count: actusPubliees }, { count: actusBrouillon }] =
    await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'salarie'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
      supabase.from('actualites').select('*', { count: 'exact', head: true }).eq('statut', 'publie'),
      supabase.from('actualites').select('*', { count: 'exact', head: true }).eq('statut', 'brouillon'),
    ]);

  const prenom = profile?.prenom ?? profile?.email?.split('@')[0] ?? '';

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-600">
          Tableau de bord
        </p>
        <h1 className="mt-2 font-display text-4xl font-medium leading-tight text-ink-900 sm:text-5xl">
          Bienvenue {prenom}
          <span className="text-brand-500">.</span>
        </h1>
        <p className="mt-3 max-w-xl text-base text-ink-500">
          Pilote l&apos;équipe et la communication interne Home &amp; Care depuis cet espace.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Salariés" value={salaries ?? 0} href="/admin/salaries" />
        <Stat label="Admins" value={admins ?? 0} href="/admin/admins" />
        <Stat label="Actus publiées" value={actusPubliees ?? 0} href="/admin/actualites?filter=publiees" accent />
        <Stat label="Brouillons" value={actusBrouillon ?? 0} href="/admin/actualites?filter=brouillons" />
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ActionCard
          eyebrow="Communication"
          title="Publier une actualité"
          description="Rédige un article avec photos, callouts et fichiers. Visible dans l'app dès la publication."
          cta="Nouvelle actualité"
          href="/admin/actualites/new"
        />
        <ActionCard
          eyebrow="Équipe"
          title="Inviter un salarié"
          description="Envoie un email de bienvenue. Le salarié reçoit un lien pour ouvrir l'app mobile."
          cta="Voir les salariés"
          href="/admin/salaries"
        />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-ink-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-soft"
    >
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-500">{label}</p>
      <p
        className={`mt-3 font-display text-4xl font-medium ${accent ? 'text-brand-600' : 'text-ink-900'}`}
      >
        {value}
      </p>
      <p className="mt-2 text-xs text-ink-400 transition group-hover:text-brand-600">Voir →</p>
    </Link>
  );
}

function ActionCard({
  eyebrow,
  title,
  description,
  cta,
  href,
}: {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-2xl border border-ink-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-soft"
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-600">{eyebrow}</p>
        <h3 className="mt-2 font-display text-2xl font-medium text-ink-900">{title}</h3>
        <p className="mt-2 text-sm text-ink-500">{description}</p>
      </div>
      <p className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
        {cta} <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
      </p>
    </Link>
  );
}
