import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

type Body = {
  date_debut?: string;
  date_fin?: string;
  raison?: string | null;
  standard_ouvert?: boolean;
  heure_debut?: string | null;
  heure_fin?: string | null;
  recurrence?: string | null;
  recurrence_fin?: string | null;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HEURE_RE = /^\d{2}:\d{2}$/;

// POST : crée une fermeture exceptionnelle. Les heures délimitent exactement la
// fermeture ; sans heures, c'est la journée entière. Une fermeture peut se
// répéter chaque semaine jusqu'à une date de fin.
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
    return NextResponse.json(
      { error: 'La date de fin doit être après la date de début.' },
      { status: 400 },
    );
  }

  const heureDebut = body?.heure_debut?.trim() || null;
  const heureFin = body?.heure_fin?.trim() || null;
  if ((heureDebut === null) !== (heureFin === null)) {
    return NextResponse.json(
      { error: "Renseignez l'heure de début et l'heure de fin, ou aucune des deux pour une journée entière." },
      { status: 400 },
    );
  }
  if (heureDebut && heureFin) {
    if (!HEURE_RE.test(heureDebut) || !HEURE_RE.test(heureFin)) {
      return NextResponse.json({ error: 'Heures invalides (format HH:MM)' }, { status: 400 });
    }
    if (heureFin <= heureDebut) {
      return NextResponse.json(
        { error: "L'heure de fin doit être après l'heure de début." },
        { status: 400 },
      );
    }
  }

  const recurrence = body?.recurrence === 'hebdomadaire' ? 'hebdomadaire' : 'aucune';
  let recurrenceFin: string | null = null;
  if (recurrence === 'hebdomadaire') {
    recurrenceFin = body?.recurrence_fin ?? '';
    if (!DATE_RE.test(recurrenceFin)) {
      return NextResponse.json(
        { error: 'Indiquez la date de fin de la répétition.' },
        { status: 400 },
      );
    }
    if (recurrenceFin < debut) {
      return NextResponse.json(
        { error: 'La fin de la répétition doit être après la date de début.' },
        { status: 400 },
      );
    }
    if (fin !== debut) {
      return NextResponse.json(
        { error: 'Une fermeture qui se répète doit porter sur une seule journée.' },
        { status: 400 },
      );
    }
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('horaires_exceptions')
    .insert({
      date_debut: debut,
      date_fin: fin,
      raison: body?.raison?.trim() || null,
      standard_ouvert: body?.standard_ouvert === true,
      heure_debut: heureDebut,
      heure_fin: heureFin,
      recurrence,
      recurrence_fin: recurrenceFin,
      cree_par: caller.id,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ exception: data });
}
