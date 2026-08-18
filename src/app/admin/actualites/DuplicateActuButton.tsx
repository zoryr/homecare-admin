'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useToast } from '@/components/Toast';

export default function DuplicateActuButton({ id }: { id: string }) {
  const router = useRouter();
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    // La carte entière est un lien : on empêche la navigation vers le détail.
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/actualites/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !json.id) {
        notify('error', json.error ?? 'Duplication impossible');
        setBusy(false);
        return;
      }
      notify('success', 'Actualité dupliquée, prête à être modifiée');
      router.push(`/admin/actualites/${json.id}`);
    } catch {
      notify('error', 'Duplication impossible');
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      title="Dupliquer cette actualité"
      className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink-700 shadow-soft backdrop-blur transition hover:bg-white disabled:opacity-60"
    >
      {busy ? '…' : '⧉ Dupliquer'}
    </button>
  );
}
