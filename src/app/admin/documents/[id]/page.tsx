import { notFound } from 'next/navigation';

import DocumentEditor from '@/components/admin/documents/DocumentEditor';
import { createClient } from '@/lib/supabase/server';
import type { DocumentRow } from '@/lib/documents/types';

export default async function DocumentEditorPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  if (params.id === 'new') {
    return <DocumentEditor initial={null} />;
  }

  const { data: doc, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', params.id)
    .single();
  if (error || !doc) notFound();

  return <DocumentEditor initial={doc as DocumentRow} />;
}
