import { NextResponse, type NextRequest } from 'next/server';

import { createAndDispatchNotification } from '@/lib/notifications/create';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();

  // Update statut + récup pour la notif
  const { data: actu, error } = await admin
    .from('actualites')
    .update({ statut: 'publie', publie_le: new Date().toISOString() })
    .eq('id', params.id)
    .select('id, titre')
    .single();

  if (error || !actu) {
    return NextResponse.json({ error: error?.message ?? 'Mise à jour échouée' }, { status: 500 });
  }

  // Auto-notif si activé dans les settings
  const { data: settings } = await admin
    .from('notification_settings')
    .select('auto_on_actu_publish')
    .eq('id', 1)
    .single();

  if (settings?.auto_on_actu_publish) {
    try {
      await createAndDispatchNotification({
        titre: 'Nouvelle actualité',
        message: actu.titre.slice(0, 200),
        source: 'auto_actu',
        source_id: actu.id,
        deeplink_path: `/(auth)/actualites/${actu.id}`,
        audience: 'all',
        created_by: caller.id,
      });
    } catch (err) {
      // On loggue mais on n'échoue pas la publication pour autant.
      console.error('[publish actu] auto-notification failed:', err);
    }
  }

  return NextResponse.json({ ok: true });
}
