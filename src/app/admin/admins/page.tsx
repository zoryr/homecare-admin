import TeamTable, { type Member } from '@/components/admin/TeamTable';
import { createClient } from '@/lib/supabase/server';

export default async function AdminsPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, prenom, nom, role, actif, created_at')
    .eq('role', 'admin')
    .order('created_at', { ascending: false });

  if (error) {
    return <p className="text-rose-700">Erreur de chargement : {error.message}</p>;
  }

  return <TeamTable role="admin" members={(data ?? []) as Member[]} />;
}
