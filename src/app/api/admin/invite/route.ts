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

  // Redirect après confirmation du magic link d'invitation :
  // - admin : la page login admin (auto-redirect vers dashboard si session OK)
  // - salarié : deep link app mobile (ouvre l'app si installée)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const redirectTo = role === 'admin' ? `${siteUrl}/login` : 'homecare://login';

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

  // Envoie le mail d'invitation Supabase + crée le user (non confirmé)
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { prenom, nom, invited_by: caller.id },
    redirectTo,
  });

  if (inviteError || !invited.user) {
    return NextResponse.json(
      { error: inviteError?.message ?? "Échec de l'envoi de l'invitation" },
      { status: 500 },
    );
  }

  // Garantit qu'une entrée auth.identities provider='email' existe.
  // Sans ça, le signInWithOtp suivant renvoie "Database error finding user"
  // car Supabase Auth lookup à la fois auth.users et auth.identities, et
  // inviteUserByEmail ne crée pas toujours l'identity selon les versions.
  // Best-effort : on n'échoue pas l'invitation si ce call rate.
  const { error: identityError } = await admin.rpc('ensure_email_identity', {
    p_user_id: invited.user.id,
    p_email: email,
  });
  if (identityError) {
    console.warn('[invite] ensure_email_identity failed:', identityError.message);
  }

  // Le trigger handle_new_user a créé la ligne profiles avec role='salarie' par défaut.
  // On enrichit prenom/nom + on promeut en admin si demandé.
  const { error: updateError } = await admin
    .from('profiles')
    .update({ prenom, nom, role })
    .eq('id', invited.user.id);

  if (updateError) {
    return NextResponse.json(
      { error: `Email envoyé mais profil non enrichi : ${updateError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
