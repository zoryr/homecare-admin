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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body) {
    return NextResponse.json({ error: 'Body invalide' }, { status: 400 });
  }

  const supabase = createClient();

  // Récupère l'état actuel pour gérer la transition publie_le
  const { data: existing, error: fetchError } = await supabase
    .from('actualites')
    .select('statut, publie_le')
    .eq('id', params.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Actualité introuvable' }, { status: 404 });
  }

  type Update = {
    titre?: string;
    description?: string;
    corps?: string;
    image_couverture_url?: string | null;
    tags?: string[];
    statut?: ActuStatut;
    publie_le?: string | null;
    featured_jusqua?: string | null;
  };
  const update: Update = {};

  if (typeof body.titre === 'string') update.titre = body.titre.trim();
  if (typeof body.description === 'string') update.description = body.description;
  if (typeof body.corps === 'string') update.corps = body.corps;
  if (body.image_couverture_url !== undefined) update.image_couverture_url = body.image_couverture_url;
  if (Array.isArray(body.tags)) update.tags = body.tags;
  if (body.featured_jusqua !== undefined) update.featured_jusqua = body.featured_jusqua;

  if (body.statut === 'brouillon' || body.statut === 'publie') {
    update.statut = body.statut;
    // Première publication : set publie_le = now()
    if (body.statut === 'publie' && existing.statut !== 'publie') {
      update.publie_le = new Date().toISOString();
    }
    // Repassage en brouillon : on garde publie_le pour historique (ou null si tu préfères reset)
  }

  const { error } = await supabase.from('actualites').update(update).eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // V2 : nettoyer les images du Storage (couverture + inline). Pour l'instant on
  // laisse les fichiers orphelins.
  const supabase = createClient();
  const { error } = await supabase.from('actualites').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
