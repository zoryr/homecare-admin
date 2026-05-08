import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';
import type { DocumentCategorieCouleur } from '@/lib/documents/types';

const COULEURS: DocumentCategorieCouleur[] = [
  'gray',
  'blue',
  'green',
  'amber',
  'red',
  'purple',
  'rose',
];

type Body = {
  nom?: string;
  couleur?: DocumentCategorieCouleur;
};

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: 'Body invalide' }, { status: 400 });

  type Update = { nom?: string; couleur?: DocumentCategorieCouleur };
  const update: Update = {};
  if (typeof body.nom === 'string' && body.nom.trim()) update.nom = body.nom.trim();
  if (body.couleur && COULEURS.includes(body.couleur)) update.couleur = body.couleur;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Aucun champ à modifier' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from('document_categories').update(update).eq('id', params.id);
  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Une catégorie avec ce nom existe déjà.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ON DELETE SET NULL via FK : les documents liés conservent leur ligne
  // mais leur categorie_id passe à null automatiquement.
  const admin = createAdminClient();
  const { error } = await admin.from('document_categories').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
