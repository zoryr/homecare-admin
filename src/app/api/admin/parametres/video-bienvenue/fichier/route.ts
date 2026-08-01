import { NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

const CLE = 'video_bienvenue';
type Valeur = { url: string | null; actif: boolean; duree_skip_ms: number };

function extractPath(publicUrl: string): string | null {
  const marker = '/app-assets/';
  const idx = publicUrl.indexOf(marker);
  return idx < 0 ? null : publicUrl.slice(idx + marker.length);
}

// Supprime le fichier vidéo du bucket + met url=null, actif=false.
export async function DELETE() {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data } = await admin.from('app_parametres').select('valeur').eq('cle', CLE).maybeSingle();
  const current = (data?.valeur as Valeur) ?? { url: null, actif: false, duree_skip_ms: 5000 };

  if (current.url) {
    const path = extractPath(current.url);
    if (path) await admin.storage.from('app-assets').remove([path]).catch(() => {});
  }

  const { error } = await admin.from('app_parametres').upsert({
    cle: CLE,
    valeur: { ...current, url: null, actif: false },
    updated_at: new Date().toISOString(),
    updated_par: caller.id,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
