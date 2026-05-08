import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Cron job (Vercel Cron) : ferme automatiquement les sondages dont close_at est passé.
 * À configurer dans vercel.json avec une auth via header `Authorization: Bearer ${CRON_SECRET}`.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET non configurée' }, { status: 500 });
  }

  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  // Sélectionne les sondages publiés dont close_at est dans le passé
  const { data: expired, error: fetchErr } = await admin
    .from('surveys')
    .select('id')
    .eq('statut', 'publie')
    .not('close_at', 'is', null)
    .lte('close_at', now);

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  const ids = (expired ?? []).map((s: { id: string }) => s.id);
  if (ids.length === 0) {
    return NextResponse.json({ ok: true, closed: 0 });
  }

  const { error: updateErr } = await admin
    .from('surveys')
    .update({ statut: 'ferme', ferme_le: now })
    .in('id', ids);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, closed: ids.length, ids });
}
