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
        className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      />
      <button
        type="submit"
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        Chercher
      </button>
    </form>
  );
}
