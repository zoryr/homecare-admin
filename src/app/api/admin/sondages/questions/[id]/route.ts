import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';
import type { QuestionOptions } from '@/lib/sondages/types';

type Body = {
  type?: string;
  titre?: string;
  description?: string | null;
  options?: QuestionOptions;
  tags?: string[];
};

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: 'Body invalide' }, { status: 400 });

  // Le type ne peut pas être modifié (compromettrait les réponses existantes)
  if (body.type !== undefined) {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from('survey_questions')
      .select('type')
      .eq('id', params.id)
      .single();
    if (existing && existing.type !== body.type) {
      return NextResponse.json(
        { error: 'Le type ne peut pas être modifié après création.' },
        { status: 400 },
      );
    }
  }

  const admin = createAdminClient();

  type Update = {
    titre?: string;
    description?: string | null;
    options?: QuestionOptions;
    tags?: string[];
  };
  const update: Update = {};
  if (typeof body.titre === 'string') update.titre = body.titre.trim();
  if (body.description !== undefined) update.description = body.description?.toString().trim() || null;
  if (body.options !== undefined) update.options = body.options;
  if (Array.isArray(body.tags)) update.tags = body.tags;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Aucun champ à modifier' }, { status: 400 });
  }

  const { error } = await admin.from('survey_questions').update(update).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();

  // Vérifie qu'aucun item n'utilise cette question
  const { count, error: countErr } = await admin
    .from('survey_items')
    .select('id', { count: 'exact', head: false })
    .eq('question_id', params.id)
    .limit(1);

  if (countErr) return NextResponse.json({ error: countErr.message }, { status: 500 });

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      {
        error: `Question utilisée dans ${count} sondage${count! > 1 ? 's' : ''}, impossible à supprimer.`,
      },
      { status: 409 },
    );
  }

  const { error } = await admin.from('survey_questions').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
