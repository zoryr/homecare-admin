import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';
import type { ImageSource } from '@/lib/images/types';

type Body = {
  titre?: string;
  description?: string;
  image_couverture_url?: string | null;
  image_source?: ImageSource | null;
  open_at?: string | null;
  close_at?: string | null;
};

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('surveys')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Sondage introuvable' }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: 'Body invalide' }, { status: 400 });

  const admin = createAdminClient();

  type Update = {
    titre?: string;
    description?: string;
    image_couverture_url?: string | null;
    image_source?: ImageSource | null;
    open_at?: string | null;
    close_at?: string | null;
  };
  const update: Update = {};
  if (typeof body.titre === 'string') update.titre = body.titre.trim();
  if (typeof body.description === 'string') update.description = body.description;
  if (body.image_couverture_url !== undefined) update.image_couverture_url = body.image_couverture_url;
  if (body.image_source !== undefined) update.image_source = body.image_source;
  if (body.open_at !== undefined) update.open_at = body.open_at;
  if (body.close_at !== undefined) update.close_at = body.close_at;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Aucun champ à modifier' }, { status: 400 });
  }

  const { error } = await admin.from('surveys').update(update).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();

  // Vérifie qu'on supprime bien un brouillon (on garde les sondages publiés/fermés pour l'historique)
  const { data: existing, error: fetchErr } = await admin
    .from('surveys')
    .select('statut')
    .eq('id', params.id)
    .single();

  if (fetchErr || !existing) {
    return NextResponse.json({ error: 'Sondage introuvable' }, { status: 404 });
  }
  if (existing.statut !== 'brouillon') {
    return NextResponse.json(
      { error: 'Seuls les sondages en brouillon peuvent être supprimés.' },
      { status: 409 },
    );
  }

  const { error } = await admin.from('surveys').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
