import EquipeClient from './EquipeClient';
import type { Member, Role } from '@/components/admin/TeamTable';
import { getCurrentProfile } from '@/lib/supabase/get-profile';
import { createClient } from '@/lib/supabase/server';

type SP = { role?: string };

export default async function EquipePage({ searchParams }: { searchParams: SP }) {
  const me = await getCurrentProfile();
  const role: Role = searchParams.role === 'admin' ? 'admin' : 'salarie';

  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, prenom, nom, role, actif, created_at')
    .eq('role', role)
    .order('created_at', { ascending: false });

  if (error) {
    return <p className="text-rose-700">Erreur de chargement : {error.message}</p>;
  }

  return (
    <EquipeClient
      role={role}
      members={(data ?? []) as Member[]}
      currentUserId={me?.id ?? ''}
    />
  );
}
