import { NextResponse, type NextRequest } from 'next/server';

import { PAUSE_DEJEUNER } from '@/lib/horaires/types';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

type Body = {
  jour_semaine?: number;
  ouvert?: boolean;
  matin_debut?: string | null;
  apres_midi_fin?: string | null;
};

// POST : met à jour la config d'un jour de la semaine (upsert sur jour_semaine).
export async function POST(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (typeof body?.jour_semaine !== 'number' || body.jour_semaine < 0 || body.jour_semaine > 6) {
    return NextResponse.json({ error: 'jour_semaine invalide' }, { status: 400 });
  }

  const ouvert = body.ouvert ?? false;
  const admin = createAdminClient();
  const { error } = await admin
    .from('horaires_config')
    .update({
      ouvert,
      matin_debut: ouvert ? (body.matin_debut ?? null) : null,
      // Pause déjeuner imposée : l'agence ferme de 13h à 14h tous les jours,
      // quel que soit l'horaire saisi.
      matin_fin: ouvert ? PAUSE_DEJEUNER.debut : null,
      apres_midi_debut: ouvert ? PAUSE_DEJEUNER.fin : null,
      apres_midi_fin: ouvert ? (body.apres_midi_fin ?? null) : null,
      updated_at: new Date().toISOString(),
    })
    .eq('jour_semaine', body.jour_semaine);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
