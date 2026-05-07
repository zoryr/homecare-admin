import { NextResponse, type NextRequest } from 'next/server';

import { getCurrentProfile } from '@/lib/supabase/get-profile';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: notif, error } = await admin
    .from('notifications')
    .select('id, sent_at, cancelled_at')
    .eq('id', params.id)
    .single();

  if (error || !notif) {
    return NextResponse.json({ error: 'Notification introuvable' }, { status: 404 });
  }
  if (notif.sent_at) {
    return NextResponse.json({ error: 'Déjà envoyée — annulation impossible' }, { status: 409 });
  }
  if (notif.cancelled_at) {
    return NextResponse.json({ ok: true, alreadyCancelled: true });
  }

  const { error: updErr } = await admin
    .from('notifications')
    .update({ cancelled_at: new Date().toISOString() })
    .eq('id', params.id);

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
