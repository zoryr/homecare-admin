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

function validerProgrammation(publierLe: string | null | undefined): { iso: string } | { error: string } {
  if (!publierLe) return { error: 'Date de programmation requise.' };
  const when = new Date(publierLe);
  if (Number.isNaN(when.getTime())) return { error: 'Date de programmation invalide.' };
  if (when.getTime() < Date.now() + 5 * 60 * 1000) {
    return { error: 'La programmation doit être au moins 5 minutes dans le futur.' };
  }
  return { iso: when.toISOString() };
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body) {
    return NextResponse.json({ error: 'Body invalide' }, { status: 400 });
  }

  const supabase = createClient();

  // Récupère l'état actuel pour gérer la transition publie_le
  const { data: existing, error: fetchError } = await supabase
    .from('actualites')
    .select('statut, publie_le, titre')
    .eq('id', params.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Actualité introuvable' }, { status: 404 });
  }

  type Update = {
    titre?: string;
    description?: string;
    corps?: string;
    image_couverture_url?: string | null;
    image_source?: ImageSource | null;
    tags?: string[];
    statut?: ActuStatut;
    publie_le?: string | null;
    publier_le?: string | null;
    featured_jusqua?: string | null;
  };
  const update: Update = {};

  if (typeof body.titre === 'string') update.titre = body.titre.trim();
  if (typeof body.description === 'string') update.description = body.description;
  if (typeof body.corps === 'string') update.corps = body.corps;
  if (body.image_couverture_url !== undefined) update.image_couverture_url = body.image_couverture_url;
  if (body.image_source !== undefined) update.image_source = body.image_source;
  if (Array.isArray(body.tags)) update.tags = body.tags;
  if (body.featured_jusqua !== undefined) update.featured_jusqua = body.featured_jusqua;

  if (body.statut === 'brouillon' || body.statut === 'publie' || body.statut === 'programme') {
    update.statut = body.statut;
    if (body.statut === 'publie') {
      // Première publication : set publie_le = now(). On annule toute programmation.
      if (existing.statut !== 'publie') update.publie_le = new Date().toISOString();
      update.publier_le = null;
    } else if (body.statut === 'programme') {
      const v = validerProgrammation(body.publier_le);
      if ('error' in v) return NextResponse.json({ error: v.error }, { status: 400 });
      update.publier_le = v.iso;
    } else {
      // Retour en brouillon : on annule la programmation.
      update.publier_le = null;
    }
  }

  const { error } = await supabase.from('actualites').update(update).eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notification push à la PREMIÈRE publication (le formulaire publie via ce
  // PATCH ; sans ça aucune notif n'était envoyée pour une actu — bug Élodie).
  const devientPublie = body.statut === 'publie' && existing.statut !== 'publie';
  if (devientPublie) {
    try {
      const admin = createAdminClient();
      const { data: settings } = await admin
        .from('notification_settings')
        .select('auto_on_actu_publish')
        .eq('id', 1)
        .single();
      if (settings?.auto_on_actu_publish) {
        const titre = update.titre ?? existing.titre ?? '';
        await createAndDispatchNotification({
          titre: 'Nouvelle actualité',
          message: titre.slice(0, 200),
          source: 'auto_actu',
          source_id: params.id,
          deeplink_path: `/actualites/${params.id}`,
          audience: 'all',
          created_by: caller.id,
        });
      }
    } catch (err) {
      // On loggue sans faire échouer la publication.
      console.error('[patch actu] auto-notification failed:', err);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // V2 : nettoyer les images du Storage (couverture + inline). Pour l'instant on
  // laisse les fichiers orphelins.
  const supabase = createClient();
  const { error } = await supabase.from('actualites').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
