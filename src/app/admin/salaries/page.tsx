import { createClient } from '@/lib/supabase/server';
import SalariesClient from './SalariesClient';

export type SalarieRow = {
  id: string;
  email: string;
  prenom: string | null;
  nom: string | null;
  role: 'salarie' | 'admin';
  actif: boolean;
  created_at: string;
};

export default async function SalariesPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, prenom, nom, role, actif, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return <p className="text-rose-700">Erreur de chargement : {error.message}</p>;
  }

  return <SalariesClient salaries={(data ?? []) as SalarieRow[]} />;
}
