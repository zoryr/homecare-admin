import { NextResponse, type NextRequest } from 'next/server';

import { getCurrentProfile } from '@/lib/supabase/get-profile';
import { createAndDispatchNotification } from '@/lib/notifications/create';
import type { NotificationAudience, NotificationSource } from '@/lib/notifications/types';

type Body = {
  titre?: string;
  message?: string;
  source?: NotificationSource;
  source_id?: string | null;
  deeplink_path?: string | null;
  audience?: NotificationAudience;
  audience_user_ids?: string[];
  scheduled_at?: string | null;
};

export async function POST(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body?.titre?.trim() || !body?.message?.trim()) {
    return NextResponse.json({ error: 'Titre et message requis' }, { status: 400 });
  }

  const allowedSources: NotificationSource[] = ['auto_actu', 'auto_reglement', 'auto_sondage', 'manuelle'];
  const source: NotificationSource = body.source && allowedSources.includes(body.source) ? body.source : 'manuelle';
  const audience: NotificationAudience = body.audience === 'selection' ? 'selection' : 'all';

  try {
    const { id } = await createAndDispatchNotification({
      titre: body.titre.trim().slice(0, 50),
      message: body.message.trim().slice(0, 200),
      source,
      source_id: body.source_id ?? null,
      deeplink_path: body.deeplink_path ?? null,
      audience,
      audience_user_ids: audience === 'selection' ? body.audience_user_ids ?? [] : [],
      scheduled_at: body.scheduled_at ?? null,
      created_by: caller.id,
    });
    return NextResponse.json({ id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Création échouée' },
      { status: 500 },
    );
  }
}
