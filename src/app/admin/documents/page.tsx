import DocumentsListClient from './DocumentsListClient';
import { createClient } from '@/lib/supabase/server';
import type { DocumentRow } from '@/lib/documents/types';

export default async function DocumentsListPage() {
  const supabase = createClient();

  const { data: docs, error: docsErr } = await supabase
    .from('documents')
    .select('*')
    .order('publie_le', { ascending: false, nullsFirst: false })
    .order('modifie_le', { ascending: false });

  if (docsErr) {
    return <p className="text-rose-700">Erreur de chargement : {docsErr.message}</p>;
  }

  return <DocumentsListClient initialDocuments={(docs ?? []) as DocumentRow[]} />;
}
