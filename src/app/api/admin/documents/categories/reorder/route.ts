import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

type Body = { ids?: string[] };

export async function POST(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body || !Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json({ error: 'ids[] requis' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Validation : tous les ids doivent appartenir à document_categories
  const { data: existing, error: existErr } = await admin
    .from('document_categories')
    .select('id');
  if (existErr) return NextResponse.json({ error: existErr.message }, { status: 500 });
  const validIds = new Set((existing ?? []).map((c: { id: string }) => c.id));
  if (body.ids.some((id) => !validIds.has(id))) {
    return NextResponse.json({ error: 'Ids inconnus' }, { status: 400 });
  }

  for (let i = 0; i < body.ids.length; i += 1) {
    const { error } = await admin
      .from('document_categories')
      .update({ ordre: i })
      .eq('id', body.ids[i]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
