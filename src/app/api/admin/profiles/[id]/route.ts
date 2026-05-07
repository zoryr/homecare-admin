import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

type Role = 'salarie' | 'admin';

type Body = {
  prenom?: string | null;
  nom?: string | null;
  role?: Role;
  actif?: boolean;
};

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body) {
    return NextResponse.json({ error: 'Body invalide' }, { status: 400 });
  }

  // Garde-fous : un admin ne peut pas se rétrograder ni se désactiver lui-même
  if (params.id === caller.id) {
    if (body.role === 'salarie') {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous retirer le rôle admin.' },
        { status: 400 },
      );
    }
    if (body.actif === false) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous désactiver vous-même.' },
        { status: 400 },
      );
    }
  }

  type Update = {
    prenom?: string | null;
    nom?: string | null;
    role?: Role;
    actif?: boolean;
  };
  const update: Update = {};

  if (body.prenom !== undefined) update.prenom = body.prenom?.toString().trim() || null;
  if (body.nom !== undefined) update.nom = body.nom?.toString().trim() || null;
  if (body.role === 'admin' || body.role === 'salarie') update.role = body.role;
  if (typeof body.actif === 'boolean') update.actif = body.actif;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Aucun champ à modifier' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from('profiles').update(update).eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
