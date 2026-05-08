import { NextResponse, type NextRequest } from 'next/server';

import { createAndDispatchNotification } from '@/lib/notifications/create';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

type Body = {
  /** Override du setting global. Si absent, on lit notification_settings.auto_on_reglement_publish */
  notifier?: boolean;
};

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as Body;

  const admin = createAdminClient();

  const { data: existing, error: fetchErr } = await admin
    .from('documents')
    .select('id, titre, statut, notif_envoyee')
    .eq('id', params.id)
    .single();
  if (fetchErr || !existing) {
    return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });
  }
  if (existing.statut === 'publie') {
    return NextResponse.json({ error: 'Document déjà publié.' }, { status: 409 });
  }

  const { error: updateErr } = await admin
    .from('documents')
    .update({ statut: 'publie', publie_le: new Date().toISOString() })
    .eq('id', params.id);
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Décide d'envoyer la notif (override > setting)
  let shouldNotify = false;
  if (typeof body.notifier === 'boolean') {
    shouldNotify = body.notifier;
  } else {
    const { data: settings } = await admin
      .from('notification_settings')
      .select('auto_on_reglement_publish')
      .eq('id', 1)
      .single();
    shouldNotify = !!settings?.auto_on_reglement_publish;
  }

  if (shouldNotify && !existing.notif_envoyee) {
    try {
      await createAndDispatchNotification({
        titre: 'Nouveau document',
        message: existing.titre.slice(0, 200),
        source: 'auto_reglement',
        source_id: existing.id,
        deeplink_path: `/documents/${existing.id}`,
        audience: 'all',
        created_by: caller.id,
      });
      await admin.from('documents').update({ notif_envoyee: true }).eq('id', params.id);
    } catch (err) {
      console.error('[publish document] auto-notification failed:', err);
    }
  }

  return NextResponse.json({ ok: true });
}
