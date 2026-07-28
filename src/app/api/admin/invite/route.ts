import { NextResponse } from 'next/server';

// Phase 2.2 — Les invitations par email sont désactivées. Deux systèmes d'auth
// en parallèle : les salariés se créent via /admin/salaries (matricule + mot de
// passe), les admins via le dashboard Supabase (OTP email inchangé).
export async function POST() {
  return NextResponse.json(
    {
      error:
        'Cette API est désactivée. Les salariés se créent via /admin/salaries. Les admins se créent via le dashboard Supabase.',
    },
    { status: 410 },
  );
}
