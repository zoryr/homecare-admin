import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

type Body = { ids?: string[] };

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body || !Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json({ error: 'ids[] requis' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Vérifie sondage non fermé
  const { data: survey, error: surveyErr } = await admin
    .from('surveys')
    .select('id, statut')
    .eq('id', params.id)
    .single();
  if (surveyErr || !survey) {
    return NextResponse.json({ error: 'Sondage introuvable' }, { status: 404 });
  }
  if (survey.statut === 'ferme') {
    return NextResponse.json({ error: 'Sondage fermé, items non modifiables.' }, { status: 409 });
  }

  // Récupère tous les items du sondage pour valider que les ids passés appartiennent bien à ce sondage
  const { data: items, error: itemsErr } = await admin
    .from('survey_items')
    .select('id')
    .eq('survey_id', params.id);
  if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 });

  const validIds = new Set((items ?? []).map((i: { id: string }) => i.id));
  if (body.ids.length !== validIds.size || body.ids.some((id) => !validIds.has(id))) {
    return NextResponse.json(
      { error: 'La liste des ids ne correspond pas aux items du sondage.' },
      { status: 400 },
    );
  }

  // Update en série (les sondages sont petits, ~50 items max). On utilise un offset pour
  // éviter une potentielle violation d'index unique pendant l'opération si on en ajoute un.
  // Actuellement il n'y a pas d'index unique sur (survey_id, ordre), donc updates directs.
  for (let i = 0; i < body.ids.length; i += 1) {
    const { error } = await admin
      .from('survey_items')
      .update({ ordre: i })
      .eq('id', body.ids[i])
      .eq('survey_id', params.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
