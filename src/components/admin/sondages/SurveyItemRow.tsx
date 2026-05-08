'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Image as ImageIcon,
  ListChecks,
  SeparatorHorizontal,
  Trash2,
  Type as TypeIcon,
} from 'lucide-react';
import { useState } from 'react';

import ImagePicker from '@/components/admin/ImagePicker';
import { QUESTION_TYPES } from '@/lib/sondages/constants';
import type { ImageSource } from '@/lib/images/types';
import type { SurveyItem, SurveyQuestion } from '@/lib/sondages/types';

type Props = {
  item: SurveyItem;
  question?: SurveyQuestion;
  readOnly: boolean;
  onPatch: (patch: Partial<SurveyItem>) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

export default function SurveyItemRow({
  item,
  question,
  readOnly,
  onPatch,
  onRemove,
  onMoveUp,
  onMoveDown,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="rounded-2xl border border-ink-200 bg-white shadow-sm"
    >
      <div className="flex items-stretch gap-2 p-3">
        {/* Drag handle + nav arrows */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <button
            type="button"
            disabled={readOnly}
            {...attributes}
            {...listeners}
            className="cursor-grab text-ink-400 hover:text-ink-600 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Réordonner"
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={readOnly || !onMoveUp}
            className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
            aria-label="Monter"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={readOnly || !onMoveDown}
            className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
            aria-label="Descendre"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-2">
          <ItemHeader item={item} />

          {item.type === 'question' && (
            <QuestionItemBody
              item={item}
              question={question}
              readOnly={readOnly}
              onPatch={onPatch}
            />
          )}

          {item.type === 'texte' && (
            <TextItemBody
              value={item.content ?? ''}
              readOnly={readOnly}
              onPatch={(content) => onPatch({ content })}
            />
          )}

          {item.type === 'image' && (
            <ImageItemBody
              url={item.content}
              source={item.image_source}
              readOnly={readOnly}
              onPatch={(url, source) => onPatch({ content: url, image_source: source })}
            />
          )}

          {item.type === 'section_break' && (
            <SectionItemBody
              value={item.content ?? ''}
              readOnly={readOnly}
              onPatch={(content) => onPatch({ content })}
            />
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          disabled={readOnly}
          className="self-start rounded-md p-2 text-ink-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

function ItemHeader({ item }: { item: SurveyItem }) {
  const config = {
    question: { Icon: ListChecks, label: 'Question', cls: 'text-brand-700 bg-brand-50' },
    texte: { Icon: TypeIcon, label: 'Texte', cls: 'text-slate-700 bg-slate-100' },
    image: { Icon: ImageIcon, label: 'Image', cls: 'text-purple-700 bg-purple-50' },
    section_break: {
      Icon: SeparatorHorizontal,
      label: 'Section',
      cls: 'text-amber-700 bg-amber-50',
    },
  } as const;
  const cfg = config[item.type];
  const Icon = cfg.Icon;
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${cfg.cls}`}
      >
        <Icon className="h-3 w-3" />
        {cfg.label}
      </span>
      <span className="text-xs text-ink-400">#{item.ordre + 1}</span>
    </div>
  );
}

function QuestionItemBody({
  item,
  question,
  readOnly,
  onPatch,
}: {
  item: SurveyItem;
  question?: SurveyQuestion;
  readOnly: boolean;
  onPatch: (patch: Partial<SurveyItem>) => void;
}) {
  if (!question) {
    return (
      <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
        Question introuvable (id : {item.question_id ?? 'n/a'}).
      </p>
    );
  }
  const meta = QUESTION_TYPES.find((t) => t.value === question.type);

  return (
    <div className="space-y-1.5">
      <h3 className="font-display text-base font-medium text-ink-900">{question.titre}</h3>
      {question.description ? (
        <p className="text-xs text-ink-500">{question.description}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <span className="text-xs text-ink-500">{meta?.label ?? question.type}</span>
        <label className="inline-flex items-center gap-1.5 text-xs text-ink-700">
          <input
            type="checkbox"
            checked={item.required}
            onChange={(e) => onPatch({ required: e.target.checked })}
            disabled={readOnly}
            className="h-3.5 w-3.5 rounded border-ink-300 accent-brand-500"
          />
          Obligatoire
        </label>
      </div>
    </div>
  );
}

function TextItemBody({
  value,
  readOnly,
  onPatch,
}: {
  value: string;
  readOnly: boolean;
  onPatch: (content: string) => void;
}) {
  const [local, setLocal] = useState(value);
  return (
    <textarea
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        if (local !== value) onPatch(local);
      }}
      disabled={readOnly}
      rows={3}
      placeholder="Texte intercalaire (consigne, transition, remerciement…)"
      className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
    />
  );
}

function ImageItemBody({
  url,
  source,
  readOnly,
  onPatch,
}: {
  url: string | null;
  source: ImageSource | null;
  readOnly: boolean;
  onPatch: (url: string | null, source: ImageSource | null) => void;
}) {
  if (readOnly) {
    return url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="aspect-video w-full rounded-md object-cover" />
    ) : (
      <p className="text-xs text-ink-400">Aucune image.</p>
    );
  }
  return (
    <ImagePicker
      value={{ url, source }}
      onChange={({ url: u, source: s }) => onPatch(u, s)}
      defaultImageUrl="/default-actu-cover.png"
    />
  );
}

function SectionItemBody({
  value,
  readOnly,
  onPatch,
}: {
  value: string;
  readOnly: boolean;
  onPatch: (content: string) => void;
}) {
  const [local, setLocal] = useState(value);
  return (
    <input
      type="text"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        if (local !== value) onPatch(local);
      }}
      disabled={readOnly}
      placeholder="Titre de la section (optionnel)"
      className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
    />
  );
}
