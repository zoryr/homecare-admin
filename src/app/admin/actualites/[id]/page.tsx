import { notFound } from 'next/navigation';

import ActuForm from './ActuForm';
import { createClient } from '@/lib/supabase/server';
import type { Actualite } from '@/lib/actus/types';

export default async function ActualiteFormPage({ params }: { params: { id: string } }) {
  if (params.id === 'new') {
    return <ActuForm initial={null} />;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('actualites')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    notFound();
  }

  return <ActuForm initial={data as Actualite} />;
}
