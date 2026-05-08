import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';
import type { ImageSource } from '@/lib/images/types';

type Body = {
  required?: boolean;
  content?: string | null;
  image_source?: ImageSource | null;
};

async function checkAccess(surveyId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('surveys')
    .select('id, statut')
    .eq('id', surveyId)
    .single();
  if (error || !data) return { error: 'Sondage introuvable', status: 404 as const };
  if (data.statut === 'ferme') {
    return { error: 'Sondage fermé, items non modifiables.', status: 409 as const };
  }
  return { ok: true as const };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } },
) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const access = await checkAccess(params.id);
  if ('error' in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: 'Body invalide' }, { status: 400 });

  const admin = createAdminClient();

  type Update = {
    required?: boolean;
    content?: string | null;
    image_source?: ImageSource | null;
  };
  const update: Update = {};
  if (typeof body.required === 'boolean') update.required = body.required;
  if (body.content !== undefined) update.content = body.content;
  if (body.image_source !== undefined) update.image_source = body.image_source;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Aucun champ à modifier' }, { status: 400 });
  }

  const { error } = await admin
    .from('survey_items')
    .update(update)
    .eq('id', params.itemId)
    .eq('survey_id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; itemId: string } },
) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const access = await checkAccess(params.id);
  if ('error' in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('survey_items')
    .delete()
    .eq('id', params.itemId)
    .eq('survey_id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
