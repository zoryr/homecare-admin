import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

type Body = {
  userId?: string;
  actif?: boolean;
};

export async function POST(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body?.userId || typeof body.actif !== 'boolean') {
    return NextResponse.json({ error: 'userId et actif requis' }, { status: 400 });
  }

  if (body.userId === caller.id && !body.actif) {
    return NextResponse.json(
      { error: 'Vous ne pouvez pas vous désactiver vous-même.' },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('profiles')
    .update({ actif: body.actif })
    .eq('id', body.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
