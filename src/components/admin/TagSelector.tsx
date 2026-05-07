'use client';

import { ACTU_TAGS, TAG_COLOR_CLASSES, TAG_COLOR_CLASSES_SELECTED } from '@/lib/actus/tags';

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  max?: number;
};

export default function TagSelector({ value, onChange, max = 2 }: Props) {
  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
      return;
    }
    if (value.length >= max) return;
    onChange([...value, id]);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {ACTU_TAGS.map((tag) => {
          const selected = value.includes(tag.id);
          const disabled = !selected && value.length >= max;
          const cls = selected ? TAG_COLOR_CLASSES_SELECTED[tag.color] : TAG_COLOR_CLASSES[tag.color];
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              disabled={disabled}
              className={`rounded-full border border-transparent px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${cls}`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {value.length}/{max} sélectionné{value.length > 1 ? 's' : ''}
      </p>
    </div>
  );
}
