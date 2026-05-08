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

export async function POST(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body?.titre?.trim()) {
    return NextResponse.json({ error: 'Titre requis' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('surveys')
    .insert({
      titre: body.titre.trim(),
      description: body.description ?? '',
      image_couverture_url: body.image_couverture_url ?? null,
      image_source: body.image_source ?? null,
      statut: 'brouillon',
      open_at: body.open_at ?? null,
      close_at: body.close_at ?? null,
      cree_par: caller.id,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
