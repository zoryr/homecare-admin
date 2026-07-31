import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';
import type { DocumentSousRubrique } from '@/lib/documents/types';

// Upsert du flipbook unique (Livret d'accueil / Règlement intérieur) pour une
// sous-rubrique donnée. Un flipbook est une ligne documents SANS fichier, avec
// flipbook_url. Un seul par sous-rubrique.
type Body = {
  sous_rubrique?: DocumentSousRubrique;
  titre?: string;
  flipbook_url?: string | null;
  statut?: 'brouillon' | 'publie';
};

const FLIPBOOK_SOUS: DocumentSousRubrique[] = ['livret_accueil', 'reglement_interieur'];

export async function POST(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  const sous = body?.sous_rubrique;
  if (!sous || !FLIPBOOK_SOUS.includes(sous)) {
    return NextResponse.json({ error: 'sous_rubrique flipbook invalide' }, { status: 400 });
  }
  const titre = body?.titre?.trim() || (sous === 'livret_accueil' ? "Livret d'accueil" : 'Règlement intérieur');
  const flipbookUrl = body?.flipbook_url?.trim() || null;
  const statut = body?.statut === 'publie' ? 'publie' : 'brouillon';

  const admin = createAdminClient();

  // Cherche le flipbook existant pour cette sous-rubrique.
  const { data: existing } = await admin
    .from('documents')
    .select('id, statut, publie_le')
    .eq('rubrique', 'infos_pro')
    .eq('sous_rubrique', sous)
    .limit(1)
    .maybeSingle();

  const publieLe =
    statut === 'publie'
      ? (existing?.publie_le ?? new Date().toISOString())
      : null;

  if (existing) {
    const { error } = await admin
      .from('documents')
      .update({ titre, flipbook_url: flipbookUrl, statut, publie_le: publieLe })
      .eq('id', existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: existing.id });
  }

  const { data, error } = await admin
    .from('documents')
    .insert({
      titre,
      description: '',
      rubrique: 'infos_pro',
      sous_rubrique: sous,
      flipbook_url: flipbookUrl,
      statut,
      publie_le: publieLe,
      cree_par: caller.id,
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
