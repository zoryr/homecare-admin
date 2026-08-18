import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

type Body = { id?: string };

export async function POST(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body?.id) {
    return NextResponse.json({ error: 'id requis' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: source, error: fetchError } = await admin
    .from('actualites')
    .select('titre, description, corps, image_couverture_url, image_source, tags')
    .eq('id', body.id)
    .single();

  if (fetchError || !source) {
    return NextResponse.json({ error: 'Actualité introuvable' }, { status: 404 });
  }

  const { data: copy, error: insertError } = await admin
    .from('actualites')
    .insert({
      titre: `Copie de ${source.titre}`,
      description: source.description ?? '',
      corps: source.corps ?? '',
      image_couverture_url: source.image_couverture_url ?? null,
      image_source: source.image_source ?? null,
      tags: source.tags ?? [],
      statut: 'brouillon',
      publie_le: null,
      publier_le: null,
      featured_jusqua: null,
      cree_par: caller.id,
    })
    .select('id')
    .single();

  if (insertError || !copy) {
    return NextResponse.json({ error: insertError?.message ?? 'Duplication échouée' }, { status: 500 });
  }

  return NextResponse.json({ id: copy.id });
}
