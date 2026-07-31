import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

type Body = { ids?: string[] };

// Réordonne un lot de documents (dans une sous-rubrique donnée) : l'ordre est
// l'index dans le tableau `ids`.
export async function POST(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body?.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json({ error: 'Liste "ids" requise' }, { status: 400 });
  }

  const admin = createAdminClient();
  const results = await Promise.all(
    body.ids.map((id, index) => admin.from('documents').update({ ordre: index }).eq('id', id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
