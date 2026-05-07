import { NextResponse, type NextRequest } from 'next/server';

import { getCurrentProfile } from '@/lib/supabase/get-profile';
import { createAdminClient } from '@/lib/supabase/admin';

type Body = {
  auto_on_actu_publish?: boolean;
  auto_on_reglement_publish?: boolean;
  auto_on_sondage_create?: boolean;
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: number;
  quiet_hours_end?: number;
};

export async function PATCH(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: 'Body invalide' }, { status: 400 });

  type Update = Body & { updated_at: string; updated_by: string };
  const update: Update = {
    updated_at: new Date().toISOString(),
    updated_by: caller.id,
  };

  if (typeof body.auto_on_actu_publish === 'boolean') update.auto_on_actu_publish = body.auto_on_actu_publish;
  if (typeof body.auto_on_reglement_publish === 'boolean') update.auto_on_reglement_publish = body.auto_on_reglement_publish;
  if (typeof body.auto_on_sondage_create === 'boolean') update.auto_on_sondage_create = body.auto_on_sondage_create;
  if (typeof body.quiet_hours_enabled === 'boolean') update.quiet_hours_enabled = body.quiet_hours_enabled;
  if (typeof body.quiet_hours_start === 'number' && body.quiet_hours_start >= 0 && body.quiet_hours_start <= 23) {
    update.quiet_hours_start = body.quiet_hours_start;
  }
  if (typeof body.quiet_hours_end === 'number' && body.quiet_hours_end >= 0 && body.quiet_hours_end <= 23) {
    update.quiet_hours_end = body.quiet_hours_end;
  }

  const admin = createAdminClient();
  const { error } = await admin.from('notification_settings').update(update).eq('id', 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
