'use client';

import {
  CheckSquare,
  CircleDot,
  type LucideIcon,
  Smile,
  Star,
  TextCursor,
  ToggleLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import ChoicesEditor from './ChoicesEditor';
import QuestionPreview from './QuestionPreview';
import TagInput from './TagInput';
import { useToast } from '@/components/Toast';
import { QUESTION_TYPES } from '@/lib/sondages/constants';
import type { ChoiceOption, QuestionOptions, QuestionType, SurveyQuestion } from '@/lib/sondages/types';

const ICONS: Record<string, LucideIcon> = {
  CircleDot,
  CheckSquare,
  Star,
  Smile,
  ToggleLeft,
  TextCursor,
};

type Props = { initial: SurveyQuestion | null };

export default function QuestionEditor({ initial }: Props) {
  const router = useRouter();
  const { notify } = useToast();
  const [, startTransition] = useTransition();
  const isNew = initial === null;

  const [type, setType] = useState<QuestionType>(initial?.type ?? 'choix_unique');
  const [titre, setTitre] = useState(initial?.titre ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [options, setOptions] = useState<QuestionOptions>(initial?.options ?? defaultOptions(initial?.type ?? 'choix_unique'));
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function changeType(next: QuestionType) {
    if (!isNew) return;
    setType(next);
    setOptions(defaultOptions(next));
  }

  function patchOptions(p: Partial<QuestionOptions>) {
    setOptions((prev) => ({ ...prev, ...p }));
  }

  async function handleSave() {
    if (!titre.trim()) {
      notify('error', 'Le titre est obligatoire.');
      return;
    }
    if ((type === 'choix_unique' || type === 'choix_multiple')) {
      const choices = options.choices ?? [];
      if (choices.length < 2) {
        notify('error', 'Au moins 2 choix sont requis.');
        return;
      }
      if (choices.some((c) => !c.label.trim())) {
        notify('error', 'Chaque choix doit avoir un texte affiché.');
        return;
      }
    }

    setSubmitting(true);
    const url = isNew
      ? '/api/admin/sondages/questions'
      : `/api/admin/sondages/questions/${initial.id}`;
    const method = isNew ? 'POST' : 'PATCH';
    const res = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        type: isNew ? type : undefined,
        titre,
        description: description || null,
        options,
        tags,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? "Échec de l'enregistrement");
      return;
    }
    notify('success', isNew ? 'Question créée.' : 'Question enregistrée.');
    if (isNew) {
      const data = (await res.json()) as { id: string };
      router.push(`/admin/sondages/banque/${data.id}`);
    } else {
      startTransition(() => router.refresh());
    }
  }

  async function handleDelete() {
    if (isNew) return;
    if (!window.confirm('Supprimer cette question définitivement ?')) return;

    setDeleting(true);
    const res = await fetch(`/api/admin/sondages/questions/${initial.id}`, { method: 'DELETE' });
    setDeleting(false);

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Suppression échouée');
      return;
    }
    notify('success', 'Question supprimée.');
    router.push('/admin/sondages/banque');
  }

  const meta = QUESTION_TYPES.find((t) => t.value === type)!;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-8">
        <header>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-600">
            Banque de questions
          </p>
          <h1 className="mt-1 font-display text-3xl font-medium text-ink-900 sm:text-4xl">
            {isNew ? 'Nouvelle question' : 'Modifier la question'}
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Une question est réutilisable dans plusieurs sondages.
          </p>
        </header>

        <Section title="Type de question">
          {!isNew && (
            <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Le type ne peut pas être modifié pour préserver les réponses existantes.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {QUESTION_TYPES.map((t) => {
              const Icon = ICONS[t.icon] ?? CircleDot;
              const selected = type === t.value;
              const lockedOut = !isNew && !selected;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => changeType(t.value)}
                  disabled={lockedOut}
                  className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition ${
                    selected
                      ? 'border-2 border-brand-500 bg-brand-50'
                      : 'border border-ink-200 bg-white hover:border-brand-300 hover:bg-brand-50/30'
                  } ${lockedOut ? 'cursor-not-allowed opacity-40' : ''}`}
                >
                  <Icon className={`h-7 w-7 ${selected ? 'text-brand-600' : 'text-ink-500'}`} />
                  <p className="font-display text-base font-medium text-ink-900">{t.label}</p>
                  <p className="text-xs text-ink-500">{t.description}</p>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Informations">
          <Field label="Titre de la question" required>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex. : Comment évaluez-vous votre charge de travail ?"
              className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </Field>
          <Field label="Description (optionnel)" help="Précise le contexte si nécessaire.">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </Field>
          <Field label="Tags">
            <TagInput value={tags} onChange={setTags} />
          </Field>
        </Section>

        <Section
          title={`Options — ${meta.label}`}
          help={
            type === 'choix_unique' || type === 'choix_multiple'
              ? 'Au moins 2 choix, max 20. Faites glisser pour réordonner.'
              : undefined
          }
        >
          {(type === 'choix_unique' || type === 'choix_multiple') && (
            <ChoicesEditor
              choices={options.choices ?? []}
              onChange={(choices) => patchOptions({ choices })}
            />
          )}

          {(type === 'etoiles_5' || type === 'smileys_5') && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Label minimum">
                <input
                  type="text"
                  value={options.labels_extremes?.min ?? ''}
                  onChange={(e) =>
                    patchOptions({
                      labels_extremes: {
                        min: e.target.value,
                        max: options.labels_extremes?.max ?? 'Totalement',
                      },
                    })
                  }
                  placeholder="Pas du tout"
                  className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </Field>
              <Field label="Label maximum">
                <input
                  type="text"
                  value={options.labels_extremes?.max ?? ''}
                  onChange={(e) =>
                    patchOptions({
                      labels_extremes: {
                        min: options.labels_extremes?.min ?? 'Pas du tout',
                        max: e.target.value,
                      },
                    })
                  }
                  placeholder="Totalement"
                  className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </Field>
            </div>
          )}

          {type === 'oui_non' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Label Oui">
                <input
                  type="text"
                  value={options.oui_label ?? ''}
                  onChange={(e) => patchOptions({ oui_label: e.target.value })}
                  placeholder="Oui"
                  className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </Field>
              <Field label="Label Non">
                <input
                  type="text"
                  value={options.non_label ?? ''}
                  onChange={(e) => patchOptions({ non_label: e.target.value })}
                  placeholder="Non"
                  className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </Field>
            </div>
          )}

          {type === 'texte_libre' && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={options.multiline ?? false}
                  onChange={(e) => patchOptions({ multiline: e.target.checked })}
                  className="h-4 w-4 rounded border-ink-300 accent-brand-500"
                />
                Réponse multi-lignes (paragraphe)
              </label>
              <Field label="Longueur maximale (caractères)">
                <input
                  type="number"
                  min={10}
                  max={5000}
                  value={options.max_length ?? 500}
                  onChange={(e) => patchOptions({ max_length: parseInt(e.target.value, 10) || 500 })}
                  className="block w-full max-w-[200px] rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </Field>
              <Field label="Texte d'aide affiché dans le champ">
                <input
                  type="text"
                  value={options.placeholder ?? ''}
                  onChange={(e) => patchOptions({ placeholder: e.target.value })}
                  placeholder="Ex. : Décrivez votre expérience…"
                  className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </Field>
            </div>
          )}
        </Section>

        <div className="flex flex-wrap items-center gap-3 border-t border-ink-200 pt-6">
          <button
            type="button"
            onClick={() => router.push('/admin/sondages/banque')}
            disabled={submitting || deleting}
            className="btn-secondary"
          >
            Annuler
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting || deleting}
              className="ml-auto rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
            >
              {deleting ? 'Suppression…' : 'Supprimer'}
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting || deleting}
            className={`btn-primary ${isNew ? 'ml-auto' : ''}`}
          >
            {submitting ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <QuestionPreview type={type} titre={titre} description={description} options={options} />
      </aside>
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

function Section({
  title,
  help,
  children,
}: {
  title: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-6">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{title}</h2>
      {help ? <p className="mt-1 text-xs text-ink-500">{help}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  help,
  required,
  children,
}: {
  label: string;
  help?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-700">
        {label} {required ? <span className="text-rose-600">*</span> : null}
      </label>
      {help ? <p className="mt-0.5 text-xs text-ink-500">{help}</p> : null}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
