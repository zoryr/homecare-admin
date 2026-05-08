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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: 'Body invalide' }, { status: 400 });

  type Update = {
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
  const update: Update = {};

  if (typeof body.titre === 'string') update.titre = body.titre.trim();
  if (typeof body.description === 'string') update.description = body.description;
  if (body.categorie_id !== undefined) update.categorie_id = body.categorie_id;
  if (body.image_couverture_url !== undefined) update.image_couverture_url = body.image_couverture_url;
  if (body.image_source !== undefined) update.image_source = body.image_source;
  if (body.featured_jusqua !== undefined) update.featured_jusqua = body.featured_jusqua;

  // Si on remplace le fichier
  if (body.fichier_url !== undefined) {
    if (!body.fichier_url || !body.fichier_nom || !body.mime_type) {
      return NextResponse.json({ error: 'Fichier incomplet' }, { status: 400 });
    }
    if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(body.mime_type)) {
      return NextResponse.json({ error: 'Type de fichier non supporté' }, { status: 400 });
    }
    const taille = Number(body.fichier_taille ?? 0);
    if (!Number.isFinite(taille) || taille <= 0 || taille > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Taille de fichier invalide (max 10 MB)' }, { status: 400 });
    }
    update.fichier_url = body.fichier_url;
    update.fichier_nom = body.fichier_nom;
    update.fichier_taille = taille;
    update.mime_type = body.mime_type;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Aucun champ à modifier' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from('documents').update(update).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();

  // Récupère le fichier pour pouvoir le supprimer du bucket
  const { data: doc } = await admin
    .from('documents')
    .select('fichier_url')
    .eq('id', params.id)
    .single();

  const { error } = await admin.from('documents').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Tente de supprimer le fichier du Storage (best-effort)
  if (doc?.fichier_url) {
    const path = extractStoragePath(doc.fichier_url);
    if (path) {
      await admin.storage.from('documents-fichiers').remove([path]).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true });
}

/**
 * Extrait le chemin relatif d'un fichier depuis une URL publique Supabase.
 * Ex: https://x.supabase.co/storage/v1/object/public/documents-fichiers/sans-cat/123-titre.pdf
 *  → "sans-cat/123-titre.pdf"
 */
function extractStoragePath(publicUrl: string): string | null {
  const marker = '/documents-fichiers/';
  const idx = publicUrl.indexOf(marker);
  if (idx < 0) return null;
  return publicUrl.slice(idx + marker.length);
}
