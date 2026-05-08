'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/admin/dashboard', label: 'Tableau de bord' },
  { href: '/admin/actualites', label: 'Actualités' },
  { href: '/admin/notifications', label: 'Notifications' },
  { href: '/admin/sondages', label: 'Sondages' },
  { href: '/admin/documents', label: 'Documents' },
  { href: '/admin/apropos', label: 'À propos' },
  { href: '/admin/salaries', label: 'Salariés' },
  { href: '/admin/admins', label: 'Admins' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 text-sm">
      {ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? 'rounded-md bg-brand-50 px-3 py-1.5 font-medium text-brand-700'
                : 'rounded-md px-3 py-1.5 text-ink-600 transition hover:bg-ink-100 hover:text-ink-900'
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
