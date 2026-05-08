import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';
import type { QuestionOptions, QuestionType } from '@/lib/sondages/types';

const ALLOWED_TYPES: QuestionType[] = [
  'choix_unique',
  'choix_multiple',
  'etoiles_5',
  'smileys_5',
  'oui_non',
  'texte_libre',
];

type Body = {
  type?: QuestionType;
  titre?: string;
  description?: string | null;
  options?: QuestionOptions;
  tags?: string[];
};

function validate(body: Body): string | null {
  if (!body.type || !ALLOWED_TYPES.includes(body.type)) return 'Type invalide';
  if (!body.titre?.trim()) return 'Titre requis';

  if (body.type === 'choix_unique' || body.type === 'choix_multiple') {
    const choices = body.options?.choices ?? [];
    if (choices.length < 2) return 'Au moins 2 choix requis';
    const values = choices.map((c) => c.value);
    if (new Set(values).size !== values.length) return 'Les valeurs des choix doivent être uniques';
    if (choices.some((c) => !c.label.trim() || !c.value.trim())) {
      return 'Chaque choix doit avoir un label et une valeur non vides';
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: 'Body invalide' }, { status: 400 });

  const err = validate(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('survey_questions')
    .insert({
      type: body.type,
      titre: body.titre!.trim(),
      description: body.description?.toString().trim() || null,
      options: body.options ?? {},
      tags: body.tags ?? [],
      cree_par: caller.id,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
