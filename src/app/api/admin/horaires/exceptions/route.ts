import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

type Body = {
  date_debut?: string;
  date_fin?: string;
  raison?: string | null;
  standard_ouvert?: boolean;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// POST : crée une fermeture exceptionnelle.
export async function POST(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  const debut = body?.date_debut ?? '';
  const fin = body?.date_fin ?? '';
  if (!DATE_RE.test(debut) || !DATE_RE.test(fin)) {
    return NextResponse.json({ error: 'Dates invalides (format YYYY-MM-DD)' }, { status: 400 });
  }
  if (fin < debut) {
    return NextResponse.json({ error: 'La date de fin doit être après la date de début.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('horaires_exceptions')
    .insert({
      date_debut: debut,
      date_fin: fin,
      raison: body?.raison?.trim() || null,
      standard_ouvert: body?.standard_ouvert === true,
      cree_par: caller.id,
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
