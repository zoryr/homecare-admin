import { type NextRequest, NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';
import { slugify } from '@/lib/sondages/constants';
import type { SurveyItem, SurveyQuestion } from '@/lib/sondages/types';

/** Échappement CSV strict (RFC 4180) : double les " et entoure de " si nécessaire. */
function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = typeof value === 'string' ? value : JSON.stringify(value);
  if (/[",\n\r;]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const admin = createAdminClient();

  // 1) Sondage (pour le nom du fichier)
  const { data: survey, error: sErr } = await admin
    .from('surveys')
    .select('id, titre')
    .eq('id', params.id)
    .single();
  if (sErr || !survey) {
    return NextResponse.json({ error: 'Sondage introuvable' }, { status: 404 });
  }

  // 2) Items + questions liées (titres pour la colonne "question_titre")
  const { data: items } = await admin
    .from('survey_items')
    .select('*')
    .eq('survey_id', params.id);
  const itemsList = (items ?? []) as SurveyItem[];
  const qIds = itemsList
    .map((i) => i.question_id)
    .filter((x): x is string => !!x);

  let questionMap = new Map<string, SurveyQuestion>();
  if (qIds.length > 0) {
    const { data: questions } = await admin
      .from('survey_questions')
      .select('id, titre, type')
      .in('id', qIds);
    questionMap = new Map(
      ((questions ?? []) as SurveyQuestion[]).map((q) => [q.id, q]),
    );
  }
  const itemMap = new Map(itemsList.map((i) => [i.id, i]));

  // 3) Réponses
  let rQuery = admin
    .from('survey_responses')
    .select('submission_token, item_id, answer, created_at')
    .eq('survey_id', params.id)
    .order('created_at', { ascending: true });
  if (from) rQuery = rQuery.gte('created_at', from);
  if (to) rQuery = rQuery.lte('created_at', to);
  const { data: responses, error: rErr } = await rQuery;
  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

  type Row = {
    submission_token: string;
    item_id: string;
    answer: unknown;
    created_at: string;
  };
  const rows = (responses ?? []) as Row[];

  // 4) Construction CSV
  const header = [
    'submission_token',
    'item_id',
    'question_titre',
    'question_type',
    'answer_json',
    'created_at',
  ];
  const lines: string[] = [header.join(',')];

  for (const r of rows) {
    const item = itemMap.get(r.item_id);
    const q = item?.question_id ? questionMap.get(item.question_id) : undefined;
    lines.push(
      [
        csvCell(r.submission_token),
        csvCell(r.item_id),
        csvCell(q?.titre ?? ''),
        csvCell(q?.type ?? ''),
        csvCell(r.answer),
        csvCell(r.created_at),
      ].join(','),
    );
  }

  // BOM utf-8 pour Excel
  const csv = '﻿' + lines.join('\r\n');
  const slug = slugify(survey.titre || 'sondage') || 'sondage';
  const date = new Date().toISOString().slice(0, 10);
  const filename = `sondage-${slug}-${date}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
