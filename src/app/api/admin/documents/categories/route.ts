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

export async function POST(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body?.nom?.trim()) {
    return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
  }
  const couleur =
    body.couleur && COULEURS.includes(body.couleur) ? body.couleur : 'gray';

  const admin = createAdminClient();

  // Calcule le prochain ordre
  const { data: maxRow } = await admin
    .from('document_categories')
    .select('ordre')
    .order('ordre', { ascending: false })
    .limit(1)
    .maybeSingle();
  const ordre = (maxRow?.ordre ?? -1) + 1;

  const { data, error } = await admin
    .from('document_categories')
    .insert({
      nom: body.nom.trim(),
      couleur,
      ordre,
      cree_par: caller.id,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Cette catégorie existe déjà.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
