import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';
import {
  aggregateItemResults,
  type ItemResult,
  type Participant,
  type SurveyResultsPayload,
} from '@/lib/sondages/results';
import type { Survey, SurveyItem, SurveyQuestion } from '@/lib/sondages/types';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const search = searchParams.get('search') ?? undefined;

  const admin = createAdminClient();

  // 1) Sondage
  const { data: survey, error: sErr } = await admin
    .from('surveys')
    .select('*')
    .eq('id', params.id)
    .single();
  if (sErr || !survey) {
    return NextResponse.json({ error: 'Sondage introuvable' }, { status: 404 });
  }

  // 2) Items
  const { data: items, error: iErr } = await admin
    .from('survey_items')
    .select('*')
    .eq('survey_id', params.id)
    .order('ordre', { ascending: true });
  if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 });

  const itemsList = (items ?? []) as SurveyItem[];
  const questionItems = itemsList.filter((i) => i.type === 'question' && i.question_id);

  // 3) Questions liées
  const qIds = questionItems.map((i) => i.question_id as string);
  let questionMap = new Map<string, SurveyQuestion>();
  if (qIds.length > 0) {
    const { data: questions, error: qErr } = await admin
      .from('survey_questions')
      .select('*')
      .in('id', qIds);
    if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });
    questionMap = new Map(((questions ?? []) as SurveyQuestion[]).map((q) => [q.id, q]));
  }

  // 4) Réponses (filtrées par période si demandé)
  let respQuery = admin.from('survey_responses').select('*').eq('survey_id', params.id);
  if (from) respQuery = respQuery.gte('created_at', from);
  if (to) respQuery = respQuery.lte('created_at', to);
  const { data: responses, error: rErr } = await respQuery;
  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

  const rawResponses = (responses ?? []) as Array<{
    item_id: string;
    submission_token: string;
    answer: unknown;
    created_at: string;
  }>;

  // 5) Participations (filtrées par période sur created_at)
  let partQuery = admin
    .from('survey_participations')
    .select('user_id, created_at')
    .eq('survey_id', params.id);
  if (from) partQuery = partQuery.gte('created_at', from);
  if (to) partQuery = partQuery.lte('created_at', to);
  const { data: parts, error: pErr } = await partQuery;
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  const partsList = (parts ?? []) as Array<{ user_id: string; created_at: string }>;

  // 6) Profils des participants
  const userIds = partsList.map((p) => p.user_id);
  let participants: Participant[] = [];
  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, prenom, nom')
      .in('id', userIds);
    const profileMap = new Map(
      ((profiles ?? []) as Array<{ id: string; prenom: string | null; nom: string | null }>).map(
        (p) => [p.id, p],
      ),
    );
    participants = partsList.map((p) => {
      const prof = profileMap.get(p.user_id);
      return {
        user_id: p.user_id,
        prenom: prof?.prenom ?? null,
        nom: prof?.nom ?? null,
        submitted_at: p.created_at,
      };
    });
    // Tri du plus récent au plus ancien
    participants.sort(
      (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
    );
  }

  // 7) Compteur d'utilisateurs actifs (pour ratio "X / Y répondants")
  const { count: totalActive } = await admin
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('actif', true)
    .eq('role', 'salarie');

  // 8) Agrégation par item
  const itemResults: ItemResult[] = [];
  for (const it of questionItems) {
    const q = questionMap.get(it.question_id as string);
    if (!q) continue;
    itemResults.push(aggregateItemResults({ ...it, ordre: it.ordre }, q, rawResponses, search));
  }

  const payload: SurveyResultsPayload = {
    survey: survey as Survey,
    items: itemResults,
    total_participants: partsList.length,
    total_active_users: totalActive ?? 0,
    participants,
  };

  return NextResponse.json(payload);
}
