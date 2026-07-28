import SalariesClient, { type Salarie } from './SalariesClient';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

export const dynamic = 'force-dynamic';

export default async function SalariesPage() {
  const me = await getCurrentProfile();
  if (!me || me.role !== 'admin' || !me.actif) {
    return <p className="text-rose-700">Accès réservé aux administrateurs.</p>;
  }

  // Service role : la vue admin_users lit auth.users (dernière connexion) et
  // n'est pas accessible aux clients anon/authenticated.
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('admin_users')
    .select('id, identifiant, email, prenom, role, actif, created_at, last_sign_in_at')
    .eq('role', 'salarie')
    .order('created_at', { ascending: false });

  if (error) {
    return <p className="text-rose-700">Erreur de chargement : {error.message}</p>;
  }

  return <SalariesClient salaries={(data ?? []) as Salarie[]} />;
}
