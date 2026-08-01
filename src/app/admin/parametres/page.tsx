import ParametresClient from './ParametresClient';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

export const dynamic = 'force-dynamic';

export type VideoBienvenue = { url: string | null; actif: boolean; duree_skip_ms: number };

export default async function ParametresPage() {
  const me = await getCurrentProfile();
  if (!me || me.role !== 'admin' || !me.actif) {
    return <p className="text-rose-700">Accès réservé aux administrateurs.</p>;
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from('app_parametres')
    .select('valeur')
    .eq('cle', 'video_bienvenue')
    .maybeSingle();

  const valeur =
    (data?.valeur as VideoBienvenue) ?? { url: null, actif: false, duree_skip_ms: 5000 };

  return <ParametresClient initial={valeur} />;
}
