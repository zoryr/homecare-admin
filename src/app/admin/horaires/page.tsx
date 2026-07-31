import HorairesClient from './HorairesClient';
import { getCurrentProfile } from '@/lib/supabase/get-profile';
import { createAdminClient } from '@/lib/supabase/admin';
import type { HoraireConfig, HoraireException } from '@/lib/horaires/types';

export const dynamic = 'force-dynamic';

export default async function HorairesPage() {
  const me = await getCurrentProfile();
  if (!me || me.role !== 'admin' || !me.actif) {
    return <p className="text-rose-700">Accès réservé aux administrateurs.</p>;
  }

  const admin = createAdminClient();
  const [{ data: config }, { data: exceptions }] = await Promise.all([
    admin.from('horaires_config').select('*').order('jour_semaine', { ascending: true }),
    admin.from('horaires_exceptions').select('*').order('date_debut', { ascending: true }),
  ]);

  return (
    <HorairesClient
      initialConfig={(config ?? []) as HoraireConfig[]}
      initialExceptions={(exceptions ?? []) as HoraireException[]}
    />
  );
}
