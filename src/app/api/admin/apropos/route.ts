import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';
import type { AproposKey } from '@/lib/apropos/types';

type Body = {
  cle?: AproposKey;
  image_url?: string | null;
  corps?: string;
  email_contact?: string | null;
  telephone?: string | null;
  adresse?: string | null;
  site_web?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
};

export async function PATCH(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body || (body.cle !== 'public' && body.cle !== 'interne')) {
    return NextResponse.json({ error: "cle requis ('public' ou 'interne')" }, { status: 400 });
  }

  type Update = {
    image_url?: string | null;
    corps?: string;
    email_contact?: string | null;
    telephone?: string | null;
    adresse?: string | null;
    site_web?: string | null;
    facebook_url?: string | null;
    instagram_url?: string | null;
    linkedin_url?: string | null;
    modifie_par: string;
  };
  const update: Update = { modifie_par: caller.id };

  if (body.image_url !== undefined) update.image_url = body.image_url;
  if (typeof body.corps === 'string') update.corps = body.corps;
  if (body.email_contact !== undefined)
    update.email_contact = body.email_contact?.toString().trim() || null;
  if (body.telephone !== undefined) update.telephone = body.telephone?.toString().trim() || null;
  if (body.adresse !== undefined) update.adresse = body.adresse?.toString().trim() || null;
  if (body.site_web !== undefined) update.site_web = body.site_web?.toString().trim() || null;
  if (body.facebook_url !== undefined)
    update.facebook_url = body.facebook_url?.toString().trim() || null;
  if (body.instagram_url !== undefined)
    update.instagram_url = body.instagram_url?.toString().trim() || null;
  if (body.linkedin_url !== undefined)
    update.linkedin_url = body.linkedin_url?.toString().trim() || null;

  const admin = createAdminClient();
  const { error } = await admin.from('apropos').update(update).eq('cle', body.cle);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
