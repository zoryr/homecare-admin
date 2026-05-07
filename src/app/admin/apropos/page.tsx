import AproposEditor from './AproposEditor';
import { createClient } from '@/lib/supabase/server';
import type { Apropos } from '@/lib/apropos/types';

export default async function AproposAdminPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('apropos')
    .select('*')
    .in('cle', ['public', 'interne']);

  if (error) {
    return <p className="text-rose-700">Erreur de chargement : {error.message}</p>;
  }

  const rows = (data ?? []) as Apropos[];
  const publicRow = rows.find((r) => r.cle === 'public');
  const interneRow = rows.find((r) => r.cle === 'interne');

  if (!publicRow || !interneRow) {
    return (
      <p className="text-rose-700">
        Configuration À propos manquante : la migration <code>08_apropos.sql</code> n&apos;a pas été
        appliquée.
      </p>
    );
  }

  return <AproposEditor publicRow={publicRow} interneRow={interneRow} />;
}
