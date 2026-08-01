import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

const CLE = 'video_bienvenue';

type Valeur = { url: string | null; actif: boolean; duree_skip_ms: number };
const DEFAULT: Valeur = { url: null, actif: false, duree_skip_ms: 5000 };

async function requireAdmin() {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) return null;
  return caller;
}

export async function GET() {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = createAdminClient();
  const { data } = await admin.from('app_parametres').select('valeur').eq('cle', CLE).maybeSingle();
  return NextResponse.json({ valeur: (data?.valeur as Valeur) ?? DEFAULT });
}

type Body = { url?: string | null; actif?: boolean; duree_skip_ms?: number };

export async function PATCH(request: NextRequest) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: 'Body invalide' }, { status: 400 });

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from('app_parametres')
    .select('valeur')
    .eq('cle', CLE)
    .maybeSingle();
  const current = (existing?.valeur as Valeur) ?? DEFAULT;

  const next: Valeur = {
    url: body.url !== undefined ? body.url : current.url,
    actif: typeof body.actif === 'boolean' ? body.actif : current.actif,
    duree_skip_ms:
      typeof body.duree_skip_ms === 'number'
        ? Math.max(0, Math.min(30000, Math.round(body.duree_skip_ms)))
        : current.duree_skip_ms,
  };

  const { error } = await admin
    .from('app_parametres')
    .upsert({ cle: CLE, valeur: next, updated_at: new Date().toISOString(), updated_par: caller.id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ valeur: next });
}
