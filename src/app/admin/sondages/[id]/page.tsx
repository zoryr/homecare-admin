import { notFound } from 'next/navigation';

import SurveyBuilder from '@/components/admin/sondages/SurveyBuilder';
import { createClient } from '@/lib/supabase/server';
import type { Survey, SurveyItem, SurveyQuestion } from '@/lib/sondages/types';

export default async function SurveyConstructorPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: survey }, { data: items }] = await Promise.all([
    supabase.from('surveys').select('*').eq('id', params.id).single(),
    supabase
      .from('survey_items')
      .select('*')
      .eq('survey_id', params.id)
      .order('ordre', { ascending: true }),
  ]);

  if (!survey) notFound();

  // Récupère les questions liées
  const questionIds = (items ?? [])
    .map((it: SurveyItem) => it.question_id)
    .filter((q): q is string => !!q);

  let questions: SurveyQuestion[] = [];
  if (questionIds.length > 0) {
    const { data: qs } = await supabase
      .from('survey_questions')
      .select('*')
      .in('id', questionIds);
    questions = (qs ?? []) as SurveyQuestion[];
  }

  return (
    <SurveyBuilder
      initialSurvey={survey as Survey}
      initialItems={(items ?? []) as SurveyItem[]}
      initialQuestions={questions}
    />
  );
}
