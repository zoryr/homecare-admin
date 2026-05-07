import { getCurrentProfile } from '@/lib/supabase/get-profile';

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const prenom = profile?.prenom ?? profile?.email ?? '';

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Bienvenue {prenom}</h1>
      <p className="mt-2 text-slate-600">
        Bientôt : actualités, sondages, salariés.
      </p>
    </div>
  );
}
