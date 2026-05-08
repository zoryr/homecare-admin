'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';

import { QUESTION_TAGS } from '@/lib/sondages/constants';

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
};

export default function TagInput({ value, onChange }: Props) {
  const [input, setInput] = useState('');

  function addTag(tag: string) {
    const t = tag.trim().toLowerCase();
    if (!t || value.includes(t)) return;
    onChange([...value, t]);
    setInput('');
  }

  function removeTag(t: string) {
    onChange(value.filter((x) => x !== t));
  }

  const suggestions = QUESTION_TAGS.filter((t) => !value.includes(t));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2 py-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded-full hover:bg-brand-100"
              aria-label={`Retirer ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag(input);
            }
            if (e.key === 'Backspace' && !input && value.length > 0) {
              removeTag(value[value.length - 1]);
            }
          }}
          placeholder={value.length === 0 ? 'Ajoute un tag…' : ''}
          className="min-w-[120px] flex-1 bg-transparent px-1 text-sm focus:outline-none"
        />
      </div>

      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="text-xs text-ink-500">Suggestions :</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="inline-flex items-center gap-0.5 rounded-full border border-ink-200 bg-white px-2 py-0.5 text-xs text-ink-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              <Plus className="h-2.5 w-2.5" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
