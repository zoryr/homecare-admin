import { NextResponse, type NextRequest } from 'next/server';

import { getCurrentProfile } from '@/lib/supabase/get-profile';
import { createClient } from '@/lib/supabase/server';
import type { ActuStatut } from '@/lib/actus/types';

type Body = {
  titre?: string;
  description?: string;
  corps?: string;
  image_couverture_url?: string | null;
  tags?: string[];
  statut?: ActuStatut;
  featured_jusqua?: string | null;
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

  const statut: ActuStatut = body.statut === 'publie' ? 'publie' : 'brouillon';
  const supabase = createClient();

  const { data, error } = await supabase
    .from('actualites')
    .insert({
      titre: body.titre.trim(),
      description: body.description ?? '',
      corps: body.corps ?? '',
      image_couverture_url: body.image_couverture_url ?? null,
      tags: body.tags ?? [],
      statut,
      publie_le: statut === 'publie' ? new Date().toISOString() : null,
      featured_jusqua: body.featured_jusqua ?? null,
      cree_par: caller.id,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
