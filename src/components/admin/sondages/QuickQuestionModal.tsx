'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import ChoicesEditor from './ChoicesEditor';
import { useToast } from '@/components/Toast';
import { QUESTION_TYPES } from '@/lib/sondages/constants';
import type {
  ChoiceOption,
  QuestionOptions,
  QuestionType,
  SurveyQuestion,
} from '@/lib/sondages/types';

type Props = {
  onClose: () => void;
  onCreated: (question: SurveyQuestion) => void | Promise<void>;
};

export default function QuickQuestionModal({ onClose, onCreated }: Props) {
  const { notify } = useToast();
  const [type, setType] = useState<QuestionType>('choix_unique');
  const [titre, setTitre] = useState('');
  const [options, setOptions] = useState<QuestionOptions>(defaultOptions('choix_unique'));
  const [submitting, setSubmitting] = useState(false);

  function changeType(t: QuestionType) {
    setType(t);
    setOptions(defaultOptions(t));
  }

  async function handleCreate() {
    if (!titre.trim()) {
      notify('error', 'Le titre est obligatoire.');
      return;
    }
    if (type === 'choix_unique' || type === 'choix_multiple') {
      const choices = options.choices ?? [];
      if (choices.length < 2 || choices.some((c) => !c.label.trim())) {
        notify('error', 'Au moins 2 choix avec un texte affiché.');
        return;
      }
    }

    setSubmitting(true);
    const res = await fetch('/api/admin/sondages/questions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type, titre, description: null, options, tags: [] }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Création échouée');
      return;
    }
    const data = (await res.json()) as SurveyQuestion;
    notify('success', 'Question créée et ajoutée.');
    await onCreated(data);
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
              Nouvelle question rapide
            </h2>
            <p className="mt-0.5 text-xs text-ink-500">
              Enregistrée dans la banque et ajoutée au sondage en un clic.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-auto px-6 py-4">
          <div>
            <label className="block text-sm font-medium text-ink-700">Type de question</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {QUESTION_TYPES.map((t) => {
                const active = type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => changeType(t.value)}
                    className={
                      active
                        ? 'rounded-full bg-brand-600 px-3 py-1 text-xs font-medium text-white'
                        : 'rounded-full border border-ink-200 bg-white px-3 py-1 text-xs text-ink-700 hover:border-brand-300 hover:bg-brand-50'
                    }
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700">
              Titre <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex. : Comment évaluez-vous votre charge de travail ?"
              className="mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {(type === 'choix_unique' || type === 'choix_multiple') && (
            <div>
              <label className="block text-sm font-medium text-ink-700">Choix</label>
              <div className="mt-1.5">
                <ChoicesEditor
                  choices={options.choices ?? []}
                  onChange={(choices) => setOptions((p) => ({ ...p, choices }))}
                />
              </div>
            </div>
          )}

          {(type === 'etoiles_5' || type === 'smileys_5') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-ink-700">Label minimum</label>
                <input
                  type="text"
                  value={options.labels_extremes?.min ?? ''}
                  onChange={(e) =>
                    setOptions((p) => ({
                      ...p,
                      labels_extremes: {
                        min: e.target.value,
                        max: p.labels_extremes?.max ?? 'Totalement',
                      },
                    }))
                  }
                  className="mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700">Label maximum</label>
                <input
                  type="text"
                  value={options.labels_extremes?.max ?? ''}
                  onChange={(e) =>
                    setOptions((p) => ({
                      ...p,
                      labels_extremes: {
                        min: p.labels_extremes?.min ?? 'Pas du tout',
                        max: e.target.value,
                      },
                    }))
                  }
                  className="mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          )}

          {type === 'oui_non' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-ink-700">Label Oui</label>
                <input
                  type="text"
                  value={options.oui_label ?? ''}
                  onChange={(e) => setOptions((p) => ({ ...p, oui_label: e.target.value }))}
                  className="mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700">Label Non</label>
                <input
                  type="text"
                  value={options.non_label ?? ''}
                  onChange={(e) => setOptions((p) => ({ ...p, non_label: e.target.value }))}
                  className="mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          )}

          {type === 'texte_libre' && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={options.multiline ?? false}
                  onChange={(e) => setOptions((p) => ({ ...p, multiline: e.target.checked }))}
                  className="h-4 w-4 rounded border-ink-300 accent-brand-500"
                />
                Réponse multi-lignes
              </label>
              <div>
                <label className="block text-sm font-medium text-ink-700">
                  Longueur maximale
                </label>
                <input
                  type="number"
                  min={10}
                  max={5000}
                  value={options.max_length ?? 500}
                  onChange={(e) =>
                    setOptions((p) => ({ ...p, max_length: parseInt(e.target.value, 10) || 500 }))
                  }
                  className="mt-1.5 block w-32 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-ink-100 bg-ink-50/40 px-6 py-3">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
            Annuler
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? 'Création…' : 'Créer & ajouter'}
          </button>
        </footer>
      </div>
    </div>
  );
}

function defaultOptions(type: QuestionType): QuestionOptions {
  if (type === 'choix_unique' || type === 'choix_multiple') {
    return {
      choices: [
        { label: '', value: 'choix_1' },
        { label: '', value: 'choix_2' },
      ] satisfies ChoiceOption[],
    };
  }
  if (type === 'etoiles_5' || type === 'smileys_5') {
    return { labels_extremes: { min: 'Pas du tout', max: 'Totalement' } };
  }
  if (type === 'oui_non') {
    return { oui_label: 'Oui', non_label: 'Non' };
  }
  if (type === 'texte_libre') {
    return { multiline: false, max_length: 500, placeholder: '' };
  }
  return {};
}
