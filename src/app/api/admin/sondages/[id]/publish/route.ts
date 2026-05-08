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

  // Récupère l'état actuel
  const { data: existing, error: fetchErr } = await admin
    .from('surveys')
    .select('id, titre, statut, notif_envoyee, close_at')
    .eq('id', params.id)
    .single();

  if (fetchErr || !existing) {
    return NextResponse.json({ error: 'Sondage introuvable' }, { status: 404 });
  }

  if (existing.statut === 'publie') {
    return NextResponse.json({ error: 'Sondage déjà publié.' }, { status: 409 });
  }

  // Vérifie qu'au moins une question existe
  const { count: qCount, error: countErr } = await admin
    .from('survey_items')
    .select('id', { count: 'exact', head: false })
    .eq('survey_id', params.id)
    .eq('type', 'question');
  if (countErr) return NextResponse.json({ error: countErr.message }, { status: 500 });
  if ((qCount ?? 0) < 1) {
    return NextResponse.json(
      { error: 'Le sondage doit contenir au moins une question.' },
      { status: 400 },
    );
  }

  // Si close_at était dans le passé, on l'efface (sécurité)
  const update: {
    statut: 'publie';
    publie_le: string;
    ferme_le: null;
    close_at?: null;
  } = {
    statut: 'publie',
    publie_le: new Date().toISOString(),
    ferme_le: null,
  };
  if (existing.close_at && new Date(existing.close_at) <= new Date()) {
    update.close_at = null;
  }

  const { error: updateErr } = await admin.from('surveys').update(update).eq('id', params.id);
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Auto-notif (seule la première publication déclenche la notif)
  if (!existing.notif_envoyee) {
    const { data: settings } = await admin
      .from('notification_settings')
      .select('auto_on_sondage_create')
      .eq('id', 1)
      .single();

    if (settings?.auto_on_sondage_create) {
      try {
        await createAndDispatchNotification({
          titre: 'Nouveau sondage',
          message: existing.titre.slice(0, 200),
          source: 'auto_sondage',
          source_id: existing.id,
          deeplink_path: `/sondages/${existing.id}`,
          audience: 'all',
          created_by: caller.id,
        });
        await admin.from('surveys').update({ notif_envoyee: true }).eq('id', params.id);
      } catch (err) {
        console.error('[publish sondage] auto-notification failed:', err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
