import { NextResponse } from 'next/server';

// Phase 2.2 — Les invitations par email sont supprimées. Les comptes salariés
// sont désormais créés depuis /admin/salaries (matricule + mot de passe), sans
// aucun email envoyé. Cet endpoint est conservé en 410 Gone pour signaler la
// dépréciation à d'éventuels appelants restants.
export async function POST() {
  return NextResponse.json(
    {
      error:
        "L'invitation par email n'existe plus. Créez le compte depuis « Salariés » (matricule + mot de passe).",
    },
    { status: 410 },
  );
}
