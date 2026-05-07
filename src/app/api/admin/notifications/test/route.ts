import { NextResponse, type NextRequest } from 'next/server';

import { getCurrentProfile } from '@/lib/supabase/get-profile';
import { createAndDispatchNotification } from '@/lib/notifications/create';

type Body = { titre?: string; message?: string };

export async function POST(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  const titre = body?.titre?.trim() || 'Test Home & Care';
  const message = body?.message?.trim() || "Ceci est une notification de test.";

  try {
    const { id } = await createAndDispatchNotification({
      titre: titre.slice(0, 50),
      message: message.slice(0, 200),
      source: 'manuelle',
      audience: 'selection',
      audience_user_ids: [caller.id],
      created_by: caller.id,
    });
    return NextResponse.json({ id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Test échoué' },
      { status: 500 },
    );
  }
}
