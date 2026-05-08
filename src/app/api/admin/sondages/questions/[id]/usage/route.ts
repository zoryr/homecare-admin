import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('survey_items')
    .select('survey_id, surveys:survey_id(id, titre, statut)')
    .eq('question_id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type Row = {
    survey_id: string;
    surveys: { id: string; titre: string; statut: string } | null;
  };

  const seen = new Set<string>();
  const surveys = ((data ?? []) as unknown as Row[])
    .filter((r) => r.surveys && !seen.has(r.surveys.id) && (seen.add(r.surveys.id), true))
    .map((r) => r.surveys!);

  return NextResponse.json({ surveys });
}
