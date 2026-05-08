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
import { GripVertical, Plus, Trash2 } from 'lucide-react';

import { slugify } from '@/lib/sondages/constants';
import type { ChoiceOption } from '@/lib/sondages/types';

type Props = {
  choices: ChoiceOption[];
  onChange: (next: ChoiceOption[]) => void;
};

export default function ChoicesEditor({ choices, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = choices.findIndex((c) => c.value === active.id);
    const newIndex = choices.findIndex((c) => c.value === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(choices, oldIndex, newIndex));
  }

  function update(index: number, partial: Partial<ChoiceOption>) {
    const next = choices.slice();
    next[index] = { ...next[index], ...partial };
    onChange(next);
  }

  function remove(index: number) {
    onChange(choices.filter((_, i) => i !== index));
  }

  function add() {
    if (choices.length >= 20) return;
    // Trouve un value unique de la forme choix_N
    let i = choices.length + 1;
    let candidate = `choix_${i}`;
    while (choices.some((c) => c.value === candidate)) {
      i += 1;
      candidate = `choix_${i}`;
    }
    onChange([...choices, { label: '', value: candidate }]);
  }

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={choices.map((c) => c.value)} strategy={verticalListSortingStrategy}>
          {choices.map((choice, index) => (
            <SortableRow
              key={choice.value}
              choice={choice}
              onLabelChange={(label) => {
                // auto-generate value from label if value is empty or auto-default
                const next: Partial<ChoiceOption> = { label };
                if (!choice.value || /^choix_\d+$/.test(choice.value)) {
                  const slug = slugify(label);
                  if (slug && !choices.some((c, i) => i !== index && c.value === slug)) {
                    next.value = slug;
                  }
                }
                update(index, next);
              }}
              onValueChange={(value) => update(index, { value })}
              onRemove={() => remove(index)}
              canRemove={choices.length > 2}
            />
          ))}
        </SortableContext>
      </DndContext>

      {choices.length < 20 && (
        <button
          type="button"
          onClick={add}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink-300 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700"
        >
          <Plus className="h-4 w-4" />
          Ajouter un choix
        </button>
      )}

      <p className="text-xs text-ink-500">
        {choices.length}/20 choix · Min 2 requis. Faites glisser pour réordonner.
      </p>
    </div>
  );
}

function SortableRow({
  choice,
  onLabelChange,
  onValueChange,
  onRemove,
  canRemove,
}: {
  choice: ChoiceOption;
  onLabelChange: (v: string) => void;
  onValueChange: (v: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: choice.value,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white p-2"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-ink-400 hover:text-ink-600 active:cursor-grabbing"
        aria-label="Réordonner"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <input
        type="text"
        value={choice.label}
        onChange={(e) => onLabelChange(e.target.value)}
        placeholder="Texte affiché au salarié"
        className="flex-1 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
      <input
        type="text"
        value={choice.value}
        onChange={(e) => onValueChange(slugify(e.target.value))}
        placeholder="valeur_technique"
        className="w-32 rounded-md border border-ink-200 bg-ink-50 px-3 py-1.5 font-mono text-xs text-ink-600 focus:border-brand-500 focus:outline-none focus:bg-white"
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className="rounded-md p-1.5 text-ink-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
