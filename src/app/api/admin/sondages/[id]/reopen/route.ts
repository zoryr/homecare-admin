import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data: existing, error: fetchErr } = await admin
    .from('surveys')
    .select('id, statut, close_at')
    .eq('id', params.id)
    .single();

  if (fetchErr || !existing) {
    return NextResponse.json({ error: 'Sondage introuvable' }, { status: 404 });
  }
  if (existing.statut !== 'ferme') {
    return NextResponse.json(
      { error: 'Seul un sondage fermé peut être ré-ouvert.' },
      { status: 409 },
    );
  }

  // Si close_at était dans le passé, on l'efface pour ne pas refermer immédiatement.
  const update: {
    statut: 'publie';
    ferme_le: null;
    close_at?: null;
  } = {
    statut: 'publie',
    ferme_le: null,
  };
  if (existing.close_at && new Date(existing.close_at) <= new Date()) {
    update.close_at = null;
  }

  const { error } = await admin.from('surveys').update(update).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
