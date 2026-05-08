import { redirect } from 'next/navigation';

export default function SalariesRedirect() {
  redirect('/admin/equipe?role=salarie');
}
