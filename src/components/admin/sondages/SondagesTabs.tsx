'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/admin/sondages', label: 'Mes sondages', match: (p: string) => p === '/admin/sondages' || (p.startsWith('/admin/sondages/') && !p.startsWith('/admin/sondages/banque')) },
  { href: '/admin/sondages/banque', label: 'Banque de questions', match: (p: string) => p.startsWith('/admin/sondages/banque') },
];

export default function SondagesTabs() {
  const pathname = usePathname() ?? '';

  return (
    <nav className="-mx-2 flex flex-wrap items-center gap-1 px-2">
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              active
                ? 'rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm'
                : 'rounded-full px-4 py-1.5 text-sm font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-900'
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
