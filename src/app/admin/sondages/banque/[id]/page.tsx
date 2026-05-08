import { notFound } from 'next/navigation';

import QuestionEditor from '@/components/admin/sondages/QuestionEditor';
import { createClient } from '@/lib/supabase/server';
import type { SurveyQuestion } from '@/lib/sondages/types';

export default async function QuestionPage({ params }: { params: { id: string } }) {
  if (params.id === 'new') {
    return <QuestionEditor initial={null} />;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('survey_questions')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) notFound();

  return <QuestionEditor initial={data as SurveyQuestion} />;
}
