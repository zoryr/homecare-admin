import DocumentsListClient from './DocumentsListClient';
import { createClient } from '@/lib/supabase/server';
import type {
  DocumentCategorie,
  DocumentRow,
  DocumentWithCategorie,
} from '@/lib/documents/types';

export default async function DocumentsListPage() {
  const supabase = createClient();

  const [{ data: docs, error: docsErr }, { data: cats }] = await Promise.all([
    supabase
      .from('documents')
      .select('*')
      .order('publie_le', { ascending: false, nullsFirst: false })
      .order('modifie_le', { ascending: false }),
    supabase
      .from('document_categories')
      .select('*')
      .order('ordre', { ascending: true }),
  ]);

  if (docsErr) {
    return <p className="text-rose-700">Erreur de chargement : {docsErr.message}</p>;
  }

  const categories = (cats ?? []) as DocumentCategorie[];
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const documents: DocumentWithCategorie[] = ((docs ?? []) as DocumentRow[]).map((d) => ({
    ...d,
    categorie: d.categorie_id ? (catMap.get(d.categorie_id) ?? null) : null,
  }));

  return <DocumentsListClient initialDocuments={documents} initialCategories={categories} />;
}
