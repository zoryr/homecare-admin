import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';
import type { ImageSource } from '@/lib/images/types';
import type { SurveyItemType } from '@/lib/sondages/types';

const ITEM_TYPES: SurveyItemType[] = ['question', 'texte', 'image', 'section_break'];

type Body = {
  type?: SurveyItemType;
  question_id?: string | null;
  required?: boolean;
  content?: string | null;
  image_source?: ImageSource | null;
  ordre?: number | null;
};

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body || !body.type || !ITEM_TYPES.includes(body.type)) {
    return NextResponse.json({ error: "Type d'item invalide" }, { status: 400 });
  }

  if (body.type === 'question' && !body.question_id) {
    return NextResponse.json(
      { error: 'question_id requis pour un item de type question' },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Vérifie que le sondage existe et n'est pas fermé (on autorise brouillon + publie)
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

  // Calcul du prochain ordre
  let ordre = body.ordre;
  if (typeof ordre !== 'number') {
    const { data: maxRow } = await admin
      .from('survey_items')
      .select('ordre')
      .eq('survey_id', params.id)
      .order('ordre', { ascending: false })
      .limit(1)
      .maybeSingle();
    ordre = (maxRow?.ordre ?? -1) + 1;
  }

  // Pour les items 'image', content = URL de l'image ; image_source = attribution
  // Pour les items 'texte', content = texte (markdown / plaintext)
  // Pour les items 'section_break', content = titre de section (optionnel)
  // Pour les items 'question', tout est dans question_id
  const { data, error } = await admin
    .from('survey_items')
    .insert({
      survey_id: params.id,
      ordre,
      type: body.type,
      question_id: body.type === 'question' ? body.question_id : null,
      required: body.type === 'question' ? body.required ?? false : false,
      content: body.type === 'question' ? null : body.content ?? null,
      image_source: body.type === 'image' ? body.image_source ?? null : null,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
