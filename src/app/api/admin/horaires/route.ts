import { NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';

// GET : config hebdo + fermetures exceptionnelles.
export async function GET() {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();
  const [{ data: config }, { data: exceptions }] = await Promise.all([
    admin.from('horaires_config').select('*').order('jour_semaine', { ascending: true }),
    admin.from('horaires_exceptions').select('*').order('date_debut', { ascending: true }),
  ]);

  return NextResponse.json({ config: config ?? [], exceptions: exceptions ?? [] });
}
