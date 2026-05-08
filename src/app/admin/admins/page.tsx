import { redirect } from 'next/navigation';

export default function AdminsRedirect() {
  redirect('/admin/equipe?role=admin');
}
