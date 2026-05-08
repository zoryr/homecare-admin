'use client';

import { CircleDot, Star } from 'lucide-react';

import { SMILEY_FACES } from '@/lib/sondages/constants';
import type { QuestionOptions, QuestionType } from '@/lib/sondages/types';

type Props = {
  type: QuestionType;
  titre: string;
  description: string;
  options: QuestionOptions;
};

export default function QuestionPreview({ type, titre, description, options }: Props) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-600">
        Aperçu salarié
      </p>
      <h3 className="mt-2 font-display text-lg font-medium text-ink-900">
        {titre || 'Titre de la question'}
      </h3>
      {description ? <p className="mt-1 text-sm text-ink-500">{description}</p> : null}

      <div className="mt-4">
        {type === 'choix_unique' && <PreviewSingle options={options} />}
        {type === 'choix_multiple' && <PreviewMulti options={options} />}
        {type === 'etoiles_5' && <PreviewStars options={options} />}
        {type === 'smileys_5' && <PreviewSmileys options={options} />}
        {type === 'oui_non' && <PreviewYesNo options={options} />}
        {type === 'texte_libre' && <PreviewText options={options} />}
      </div>
    </div>
  );
}

function PreviewSingle({ options }: { options: QuestionOptions }) {
  const choices = options.choices ?? [];
  return (
    <div className="space-y-2">
      {choices.length === 0 ? (
        <p className="text-xs italic text-ink-400">Aucun choix défini</p>
      ) : (
        choices.map((c) => (
          <div
            key={c.value}
            className="flex items-center gap-3 rounded-lg border border-ink-200 bg-ink-50/50 px-3 py-2 text-sm"
          >
            <CircleDot className="h-4 w-4 text-ink-400" />
            <span className="text-ink-800">{c.label}</span>
          </div>
        ))
      )}
    </div>
  );
}

function PreviewMulti({ options }: { options: QuestionOptions }) {
  const choices = options.choices ?? [];
  return (
    <div className="space-y-2">
      {choices.length === 0 ? (
        <p className="text-xs italic text-ink-400">Aucun choix défini</p>
      ) : (
        choices.map((c) => (
          <div
            key={c.value}
            className="flex items-center gap-3 rounded-lg border border-ink-200 bg-ink-50/50 px-3 py-2 text-sm"
          >
            <span className="h-4 w-4 rounded border border-ink-300 bg-white" />
            <span className="text-ink-800">{c.label}</span>
          </div>
        ))
      )}
    </div>
  );
}

function PreviewStars({ options }: { options: QuestionOptions }) {
  const min = options.labels_extremes?.min ?? 'Pas du tout';
  const max = options.labels_extremes?.max ?? 'Totalement';
  return (
    <div>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className="h-7 w-7 text-amber-400" />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-ink-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function PreviewSmileys({ options }: { options: QuestionOptions }) {
  const min = options.labels_extremes?.min ?? 'Pas du tout';
  const max = options.labels_extremes?.max ?? 'Totalement';
  return (
    <div>
      <div className="flex justify-center gap-3 text-3xl">
        {SMILEY_FACES.map((f, i) => (
          <span key={i}>{f}</span>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-ink-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function PreviewYesNo({ options }: { options: QuestionOptions }) {
  const yes = options.oui_label || 'Oui';
  const no = options.non_label || 'Non';
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-lg border-2 border-brand-300 bg-brand-50 px-4 py-3 text-center text-sm font-medium text-brand-800">
        {yes}
      </div>
      <div className="rounded-lg border border-ink-200 bg-white px-4 py-3 text-center text-sm font-medium text-ink-700">
        {no}
      </div>
    </div>
  );
}

function PreviewText({ options }: { options: QuestionOptions }) {
  const max = options.max_length ?? 500;
  if (options.multiline) {
    return (
      <div className="rounded-lg border border-ink-200 bg-ink-50/50 px-3 py-2">
        <p className="text-sm italic text-ink-400">
          {options.placeholder ?? 'Écris ta réponse…'}
        </p>
        <p className="mt-2 text-right text-xs text-ink-400">0 / {max}</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-ink-200 bg-ink-50/50 px-3 py-2 text-sm italic text-ink-400">
      {options.placeholder ?? 'Écris ta réponse…'}
    </div>
  );
}

