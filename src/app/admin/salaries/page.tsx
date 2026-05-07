import TeamTable, { type Member } from '@/components/admin/TeamTable';
import { getCurrentProfile } from '@/lib/supabase/get-profile';
import { createClient } from '@/lib/supabase/server';

export default async function SalariesPage() {
  const me = await getCurrentProfile();
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, prenom, nom, role, actif, created_at')
    .eq('role', 'salarie')
    .order('created_at', { ascending: false });

  if (error) {
    return <p className="text-rose-700">Erreur de chargement : {error.message}</p>;
  }

  return <TeamTable role="salarie" members={(data ?? []) as Member[]} currentUserId={me?.id ?? ''} />;
}
