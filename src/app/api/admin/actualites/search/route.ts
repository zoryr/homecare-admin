import { NextResponse, type NextRequest } from 'next/server';

import { getCurrentProfile } from '@/lib/supabase/get-profile';
import { createClient } from '@/lib/supabase/server';

// GET ?q=… : 10 actus dont le titre matche, publiées d'abord puis plus récentes.
export async function GET(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const q = (request.nextUrl.searchParams.get('q') ?? '').trim();

  const supabase = createClient();
  let query = supabase
    .from('actualites')
    .select('id, titre, statut, publie_le, image_couverture_url')
    .order('publie_le', { ascending: false, nullsFirst: false })
    .order('cree_le', { ascending: false })
    .limit(10);

  if (q) query = query.ilike('titre', `%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ results: data ?? [] });
}
