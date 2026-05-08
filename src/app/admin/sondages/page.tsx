import { redirect } from 'next/navigation';

export default function SondagesIndexPage() {
  // En 8.1, on n'a que la banque. La page liste des sondages arrive en 8.2.
  redirect('/admin/sondages/banque');
}
