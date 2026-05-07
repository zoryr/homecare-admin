import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

type Role = 'salarie' | 'admin';
type Body = {
  email?: string;
  prenom?: string;
  nom?: string;
  role?: Role;
};

export async function POST(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body?.email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 });
  }

  const role: Role = body.role === 'admin' ? 'admin' : 'salarie';
  const email = body.email.trim().toLowerCase();
  const prenom = body.prenom?.trim() || null;
  const nom = body.nom?.trim() || null;

  const admin = createAdminClient();

  const { error: insertError } = await admin
    .from('invitations')
    .insert({ email, prenom, nom, invited_by: caller.id });

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'Cet email a déjà été invité.' }, { status: 409 });
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { prenom, nom, invited_by: caller.id },
  });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message ?? 'Création du compte échouée' },
      { status: 500 },
    );
  }

  // Le trigger handle_new_user a créé la ligne profiles avec role='salarie'.
  // On enrichit avec prenom/nom + on promeut en admin si demandé.
  const { error: updateError } = await admin
    .from('profiles')
    .update({ prenom, nom, role })
    .eq('id', created.user.id);

  if (updateError) {
    return NextResponse.json(
      { error: `Compte créé mais profil non enrichi : ${updateError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
