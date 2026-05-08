'use client';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import { useToast } from '@/components/Toast';
import { CATEGORIE_COULEURS } from '@/lib/documents/constants';
import type { DocumentCategorie, DocumentCategorieCouleur } from '@/lib/documents/types';

type Props = {
  categories: DocumentCategorie[];
  onClose: () => void;
  onChange: (next: DocumentCategorie[]) => void;
};

export default function CategoriesModal({ categories, onClose, onChange }: Props) {
  const { notify } = useToast();
  const [list, setList] = useState(categories);
  const [newName, setNewName] = useState('');
  const [newCouleur, setNewCouleur] = useState<DocumentCategorieCouleur>('blue');
  const [creating, setCreating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function publishChange(next: DocumentCategorie[]) {
    setList(next);
    onChange(next);
  }

  async function persistRename(id: string, nom: string) {
    if (!nom.trim()) return;
    const res = await fetch(`/api/admin/documents/categories/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nom }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Mise à jour échouée');
    }
  }

  async function persistCouleur(id: string, couleur: DocumentCategorieCouleur) {
    const res = await fetch(`/api/admin/documents/categories/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ couleur }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Mise à jour échouée');
    }
  }

  async function persistOrder(ids: string[]) {
    const res = await fetch('/api/admin/documents/categories/reorder', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Réorganisation échouée');
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = list.findIndex((c) => c.id === active.id);
    const newIndex = list.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(list, oldIndex, newIndex).map((c, i) => ({ ...c, ordre: i }));
    publishChange(next);
    await persistOrder(next.map((c) => c.id));
  }

  function rename(id: string, nom: string) {
    publishChange(list.map((c) => (c.id === id ? { ...c, nom } : c)));
  }

  async function setCouleur(id: string, couleur: DocumentCategorieCouleur) {
    publishChange(list.map((c) => (c.id === id ? { ...c, couleur } : c)));
    await persistCouleur(id, couleur);
  }

  async function remove(id: string) {
    const cat = list.find((c) => c.id === id);
    if (!cat) return;
    if (
      !window.confirm(
        `Supprimer la catégorie « ${cat.nom} » ? Les documents associés ne seront pas supprimés mais perdront leur catégorie.`,
      )
    )
      return;
    const previous = list;
    publishChange(list.filter((c) => c.id !== id));
    const res = await fetch(`/api/admin/documents/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Suppression échouée');
      publishChange(previous);
    } else {
      notify('success', 'Catégorie supprimée.');
    }
  }

  async function createCat() {
    if (!newName.trim()) {
      notify('error', 'Donne un nom à la catégorie.');
      return;
    }
    setCreating(true);
    const res = await fetch('/api/admin/documents/categories', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nom: newName, couleur: newCouleur }),
    });
    setCreating(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Création échouée');
      return;
    }
    const created = (await res.json()) as DocumentCategorie;
    publishChange([...list, created]);
    setNewName('');
    setNewCouleur('blue');
    notify('success', 'Catégorie créée.');
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-4 border-b border-ink-100 px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-medium text-ink-900">
              Gérer les catégories
            </h2>
            <p className="mt-0.5 text-xs text-ink-500">
              Faites glisser pour réordonner. Les changements sont sauvegardés automatiquement.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-500 hover:bg-ink-100"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-auto px-6 py-4">
          {list.length === 0 ? (
            <p className="rounded-lg border border-dashed border-ink-300 bg-ink-50 p-6 text-center text-sm text-ink-500">
              Aucune catégorie pour le moment. Crée la première ci-dessous.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={list.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {list.map((c) => (
                    <SortableRow
                      key={c.id}
                      cat={c}
                      onRename={(nom) => rename(c.id, nom)}
                      onRenameBlur={(nom) => persistRename(c.id, nom)}
                      onCouleur={(couleur) => setCouleur(c.id, couleur)}
                      onRemove={() => remove(c.id)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <footer className="border-t border-ink-100 bg-ink-50/40 px-6 py-4">
          <p className="mb-2 text-xs font-medium text-ink-700">Ajouter une catégorie</p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom (ex. Hygiène)"
              className="flex-1 min-w-[180px] rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              onKeyDown={(e) => {
                if (e.key === 'Enter') void createCat();
              }}
            />
            <CouleurSelect value={newCouleur} onChange={setNewCouleur} />
            <button
              type="button"
              onClick={() => void createCat()}
              disabled={creating}
              className="btn-primary inline-flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              {creating ? 'Création…' : 'Ajouter'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SortableRow({
  cat,
  onRename,
  onRenameBlur,
  onCouleur,
  onRemove,
}: {
  cat: DocumentCategorie;
  onRename: (v: string) => void;
  onRenameBlur: (v: string) => void;
  onCouleur: (c: DocumentCategorieCouleur) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cat.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const couleurMeta = CATEGORIE_COULEURS.find((x) => x.value === cat.couleur)!;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-ink-200 bg-white p-3"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-ink-400 hover:text-ink-700 active:cursor-grabbing"
        aria-label="Réordonner"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span
        className="h-5 w-5 shrink-0 rounded-full"
        style={{ backgroundColor: couleurMeta.bg, border: `2px solid ${couleurMeta.text}` }}
      />
      <input
        type="text"
        value={cat.nom}
        onChange={(e) => onRename(e.target.value)}
        onBlur={(e) => onRenameBlur(e.target.value)}
        className="flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-medium text-ink-900 hover:border-ink-200 focus:border-brand-500 focus:bg-white focus:outline-none"
      />
      <CouleurSelect value={cat.couleur} onChange={onCouleur} />
      <button
        type="button"
        onClick={onRemove}
        className="rounded-md p-1.5 text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"
        aria-label="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

function CouleurSelect({
  value,
  onChange,
}: {
  value: DocumentCategorieCouleur;
  onChange: (c: DocumentCategorieCouleur) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DocumentCategorieCouleur)}
      className="rounded-md border border-ink-200 bg-white px-2 py-1 text-xs font-medium focus:border-brand-500 focus:outline-none"
      style={{ backgroundColor: CATEGORIE_COULEURS.find((c) => c.value === value)?.bg }}
    >
      {CATEGORIE_COULEURS.map((c) => (
        <option key={c.value} value={c.value} style={{ backgroundColor: c.bg }}>
          {c.label}
        </option>
      ))}
    </select>
  );
}
