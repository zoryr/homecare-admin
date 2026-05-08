import { notFound } from 'next/navigation';

import SurveyResultsClient from './SurveyResultsClient';
import { createClient } from '@/lib/supabase/server';
import type { Survey } from '@/lib/sondages/types';

export default async function SurveyResultsPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: survey, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !survey) notFound();

  return <SurveyResultsClient surveyId={params.id} initialSurvey={survey as Survey} />;
}
