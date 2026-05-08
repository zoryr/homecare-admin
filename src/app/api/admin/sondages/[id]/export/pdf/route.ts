import { type DocumentProps, renderToBuffer } from '@react-pdf/renderer';
import { type NextRequest, NextResponse } from 'next/server';
import React, { type ReactElement } from 'react';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';
import { slugify } from '@/lib/sondages/constants';
import { SurveyResultsPDF } from '@/lib/sondages/pdf/SurveyResultsPDF';
import {
  aggregateItemResults,
  type ItemResult,
  type Participant,
  type SurveyResultsPayload,
} from '@/lib/sondages/results';
import type { Survey, SurveyItem, SurveyQuestion } from '@/lib/sondages/types';

// PDF rendering peut être lent : on autorise un peu plus de temps.
export const maxDuration = 60;
// react-pdf a besoin de Node APIs.
export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const admin = createAdminClient();

  // Charge tout (même logique que /results, factorisable plus tard)
  const { data: survey, error: sErr } = await admin
    .from('surveys')
    .select('*')
    .eq('id', params.id)
    .single();
  if (sErr || !survey) {
    return NextResponse.json({ error: 'Sondage introuvable' }, { status: 404 });
  }

  const { data: items } = await admin
    .from('survey_items')
    .select('*')
    .eq('survey_id', params.id)
    .order('ordre', { ascending: true });
  const itemsList = (items ?? []) as SurveyItem[];
  const questionItems = itemsList.filter((i) => i.type === 'question' && i.question_id);

  const qIds = questionItems.map((i) => i.question_id as string);
  let questionMap = new Map<string, SurveyQuestion>();
  if (qIds.length > 0) {
    const { data: questions } = await admin
      .from('survey_questions')
      .select('*')
      .in('id', qIds);
    questionMap = new Map(((questions ?? []) as SurveyQuestion[]).map((q) => [q.id, q]));
  }

  let respQuery = admin.from('survey_responses').select('*').eq('survey_id', params.id);
  if (from) respQuery = respQuery.gte('created_at', from);
  if (to) respQuery = respQuery.lte('created_at', to);
  const { data: responses } = await respQuery;
  const rawResponses = (responses ?? []) as Array<{
    item_id: string;
    submission_token: string;
    answer: unknown;
    created_at: string;
  }>;

  let partQuery = admin
    .from('survey_participations')
    .select('user_id, created_at')
    .eq('survey_id', params.id);
  if (from) partQuery = partQuery.gte('created_at', from);
  if (to) partQuery = partQuery.lte('created_at', to);
  const { data: parts } = await partQuery;
  const partsList = (parts ?? []) as Array<{ user_id: string; created_at: string }>;

  const participants: Participant[] = partsList.map((p) => ({
    user_id: p.user_id,
    prenom: null,
    nom: null,
    submitted_at: p.created_at,
  }));

  const { count: totalActive } = await admin
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('actif', true)
    .eq('role', 'salarie');

  const itemResults: ItemResult[] = [];
  for (const it of questionItems) {
    const q = questionMap.get(it.question_id as string);
    if (!q) continue;
    itemResults.push(aggregateItemResults({ ...it, ordre: it.ordre }, q, rawResponses));
  }

  const payload: SurveyResultsPayload = {
    survey: survey as Survey,
    items: itemResults,
    total_participants: partsList.length,
    total_active_users: totalActive ?? 0,
    participants,
  };

  const element = React.createElement(SurveyResultsPDF, {
    payload,
    generatedAt: new Date().toISOString(),
  }) as unknown as ReactElement<DocumentProps>;
  const pdfBuffer = await renderToBuffer(element);

  const slug = slugify(survey.titre || 'sondage') || 'sondage';
  const date = new Date().toISOString().slice(0, 10);
  const filename = `sondage-${slug}-${date}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdfBuffer.length),
    },
  });
}
