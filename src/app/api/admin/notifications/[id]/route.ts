import { NextResponse, type NextRequest } from 'next/server';

import { getCurrentProfile } from '@/lib/supabase/get-profile';
import { createClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createClient();

  const [{ data: notif, error: notifErr }, { data: deliveries, error: delErr }] = await Promise.all([
    supabase.from('notifications').select('*').eq('id', params.id).single(),
    supabase
      .from('notification_deliveries')
      .select('id, user_id, status, sent_at, read_at, clicked_at, error_message')
      .eq('notification_id', params.id),
  ]);

  if (notifErr || !notif) {
    return NextResponse.json({ error: 'Notification introuvable' }, { status: 404 });
  }
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  const list = deliveries ?? [];
  const stats = {
    total: list.length,
    sent: list.filter((d) => d.status === 'sent' || d.status === 'read' || d.status === 'clicked').length,
    failed: list.filter((d) => d.status === 'failed').length,
    read: list.filter((d) => d.read_at !== null).length,
    clicked: list.filter((d) => d.clicked_at !== null).length,
  };

  return NextResponse.json({ notification: notif, deliveries: list, stats });
}
