import { createClient } from '@/lib/supabase/server';

export type Profile = {
  id: string;
  email: string;
  prenom: string | null;
  nom: string | null;
  role: 'salarie' | 'admin';
  actif: boolean;
  created_at: string;
};

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('id, email, prenom, nom, role, actif, created_at')
    .eq('id', user.id)
    .single();

  return data as Profile | null;
}
