import { notFound } from 'next/navigation';

import DocumentEditor from '@/components/admin/documents/DocumentEditor';
import { createClient } from '@/lib/supabase/server';
import type { DocumentCategorie, DocumentRow } from '@/lib/documents/types';

export default async function DocumentEditorPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: cats } = await supabase
    .from('document_categories')
    .select('*')
    .order('ordre', { ascending: true });
  const categories = (cats ?? []) as DocumentCategorie[];

  if (params.id === 'new') {
    return <DocumentEditor initial={null} categories={categories} />;
  }

  const { data: doc, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', params.id)
    .single();
  if (error || !doc) notFound();

  return <DocumentEditor initial={doc as DocumentRow} categories={categories} />;
}
