import { NextResponse, type NextRequest } from 'next/server';

import { createAndDispatchNotification } from '@/lib/notifications/create';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';
import { createClient } from '@/lib/supabase/server';
import type { ActuStatut } from '@/lib/actus/types';
import type { ImageSource } from '@/lib/images/types';

type Body = {
  titre?: string;
  description?: string;
  corps?: string;
  image_couverture_url?: string | null;
  image_source?: ImageSource | null;
  tags?: string[];
  statut?: ActuStatut;
  publier_le?: string | null;
  featured_jusqua?: string | null;
};

/** Valide une date de programmation : au moins 5 min dans le futur. Renvoie l'ISO ou une erreur. */
function validerProgrammation(publierLe: string | null | undefined): { iso: string } | { error: string } {
  if (!publierLe) return { error: 'Date de programmation requise.' };
  const when = new Date(publierLe);
  if (Number.isNaN(when.getTime())) return { error: 'Date de programmation invalide.' };
  if (when.getTime() < Date.now() + 5 * 60 * 1000) {
    return { error: 'La programmation doit être au moins 5 minutes dans le futur.' };
  }
  return { iso: when.toISOString() };
}

export async function POST(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body?.titre?.trim()) {
    return NextResponse.json({ error: 'Titre requis' }, { status: 400 });
  }

  const requested = body.statut;
  let statut: ActuStatut = 'brouillon';
  let publieLe: string | null = null;
  let publierLe: string | null = null;

  if (requested === 'publie') {
    statut = 'publie';
    publieLe = new Date().toISOString();
  } else if (requested === 'programme') {
    const v = validerProgrammation(body.publier_le);
    if ('error' in v) return NextResponse.json({ error: v.error }, { status: 400 });
    statut = 'programme';
    publierLe = v.iso;
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from('actualites')
    .insert({
      titre: body.titre.trim(),
      description: body.description ?? '',
      corps: body.corps ?? '',
      image_couverture_url: body.image_couverture_url ?? null,
      image_source: body.image_source ?? null,
      tags: body.tags ?? [],
      statut,
      publie_le: publieLe,
      publier_le: publierLe,
      featured_jusqua: body.featured_jusqua ?? null,
      cree_par: caller.id,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notification push si l'actu est créée directement en "publié".
  if (statut === 'publie') {
    try {
      const admin = createAdminClient();
      const { data: settings } = await admin
        .from('notification_settings')
        .select('auto_on_actu_publish')
        .eq('id', 1)
        .single();
      if (settings?.auto_on_actu_publish) {
        await createAndDispatchNotification({
          titre: 'Nouvelle actualité',
          message: body.titre.trim().slice(0, 200),
          source: 'auto_actu',
          source_id: data.id,
          deeplink_path: `/actualites/${data.id}`,
          audience: 'all',
          created_by: caller.id,
        });
      }
    } catch (err) {
      console.error('[create actu] auto-notification failed:', err);
    }
  }

  return NextResponse.json({ id: data.id });
}
