'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
  initialQuery: string;
  filter: string | null;
};

export default function SearchBar({ initialQuery, filter }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (filter) params.set('filter', filter);
    if (q.trim()) params.set('q', q.trim());
    router.push(`/admin/actualites${params.toString() ? `?${params.toString()}` : ''}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2 sm:max-w-xs">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher par titre…"
        className="flex-1 rounded-full border border-ink-200 bg-white px-4 py-1.5 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
      <button type="submit" className="btn-secondary !py-1.5">
        Chercher
      </button>
    </form>
  );
}
