import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';
import { ACCEPTED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/documents/constants';
import type { ImageSource } from '@/lib/images/types';

type Body = {
  titre?: string;
  description?: string;
  categorie_id?: string | null;
  fichier_url?: string;
  fichier_nom?: string;
  fichier_taille?: number;
  mime_type?: string;
  image_couverture_url?: string | null;
  image_source?: ImageSource | null;
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
  if (!body.fichier_url || !body.fichier_nom || !body.mime_type) {
    return NextResponse.json({ error: 'Fichier requis' }, { status: 400 });
  }
  if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(body.mime_type)) {
    return NextResponse.json({ error: 'Type de fichier non supporté' }, { status: 400 });
  }
  const taille = Number(body.fichier_taille ?? 0);
  if (!Number.isFinite(taille) || taille <= 0 || taille > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Taille de fichier invalide (max 10 MB)' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('documents')
    .insert({
      titre: body.titre.trim(),
      description: body.description ?? '',
      categorie_id: body.categorie_id ?? null,
      fichier_url: body.fichier_url,
      fichier_nom: body.fichier_nom,
      fichier_taille: taille,
      mime_type: body.mime_type,
      image_couverture_url: body.image_couverture_url ?? null,
      image_source: body.image_source ?? null,
      featured_jusqua: body.featured_jusqua ?? null,
      statut: 'brouillon',
      cree_par: caller.id,
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
