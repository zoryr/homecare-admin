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
    .from('documents')
    .select('id, statut')
    .eq('id', params.id)
    .single();
  if (fetchErr || !existing) {
    return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });
  }
  if (existing.statut !== 'publie') {
    return NextResponse.json(
      { error: 'Seul un document publié peut être repassé en brouillon.' },
      { status: 409 },
    );
  }

  const { error } = await admin
    .from('documents')
    .update({ statut: 'brouillon', publie_le: null, notif_envoyee: false })
    .eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
