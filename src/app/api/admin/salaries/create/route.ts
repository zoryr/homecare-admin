import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

// Matricules type "IN2021070001" : majuscules autorisées.
const IDENTIFIANT_RE = /^[a-zA-Z0-9._-]+$/;

type Body = { identifiant?: string; password?: string; prenom?: string | null };

export async function POST(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  const identifiant = body?.identifiant?.trim() ?? '';
  const password = body?.password ?? '';
  const prenom = body?.prenom?.toString().trim() || null;

  if (identifiant.length < 3 || identifiant.length > 30 || !IDENTIFIANT_RE.test(identifiant)) {
    return NextResponse.json(
      { error: 'Matricule invalide (3 à 30 caractères : lettres, chiffres, . _ - uniquement).' },
      { status: 400 },
    );
  }
  if (password.length < 6 || password.length > 100) {
    return NextResponse.json({ error: 'Mot de passe invalide (6 à 100 caractères).' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Pré-vérif unicité (message clair). Le garde-fou définitif est l'unicité de
  // l'email fictif au niveau de createUser (voir plus bas).
  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .eq('identifiant', identifiant)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: 'Ce matricule est déjà utilisé.' }, { status: 409 });
  }

  const email = `${identifiant.toLowerCase()}@infocare.local`;

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { prenom, matricule: identifiant },
  });

  if (createErr || !created?.user) {
    const msg = createErr?.message ?? 'Échec de la création du compte';
    const conflict = /already|exist|duplicate|registered/i.test(msg);
    return NextResponse.json(
      { error: conflict ? 'Ce matricule est déjà utilisé.' : msg },
      { status: conflict ? 409 : 500 },
    );
  }

  // Le trigger handle_new_user a créé la ligne profiles avec identifiant + prenom
  // (depuis les métadonnées). Filet de sécurité : on garantit ces champs + role.
  const { error: updErr } = await admin
    .from('profiles')
    .update({ identifiant, prenom, role: 'salarie' })
    .eq('id', created.user.id);
  if (updErr) {
    return NextResponse.json(
      { error: `Compte créé mais profil incomplet : ${updErr.message}` },
      { status: 500 },
    );
  }

  // Garantit l'identity provider='email' (cohérence GoTrue avec le reste du système).
  await admin.rpc('ensure_email_identity', { p_user_id: created.user.id, p_email: email });

  return NextResponse.json({
    success: true,
    user_id: created.user.id,
    identifiant,
    password,
  });
}
