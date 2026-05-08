'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useToast } from '@/components/Toast';

export default function CreateSondageButton() {
  const router = useRouter();
  const { notify } = useToast();
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    setCreating(true);
    const res = await fetch('/api/admin/sondages', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ titre: 'Nouveau sondage' }),
    });
    setCreating(false);

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Création échouée');
      return;
    }

    const { id } = (await res.json()) as { id: string };
    router.push(`/admin/sondages/${id}`);
  }

  return (
    <button
      type="button"
      onClick={handleCreate}
      disabled={creating}
      className="btn-primary inline-flex items-center gap-2"
    >
      <Plus className="h-4 w-4" />
      {creating ? 'Création…' : 'Nouveau sondage'}
    </button>
  );
}
