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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  ArrowLeft,
  BarChart3,
  Image as ImageIcon,
  ListChecks,
  Lock,
  Minus,
  Send,
  SeparatorHorizontal,
  Sparkles,
  Trash2,
  Type as TypeIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import QuestionPickerModal from './QuestionPickerModal';
import QuickQuestionModal from './QuickQuestionModal';
import SurveyItemRow from './SurveyItemRow';
import ImagePicker from '@/components/admin/ImagePicker';
import { useToast } from '@/components/Toast';
import type { ImageSource } from '@/lib/images/types';
import type { Survey, SurveyItem, SurveyItemType, SurveyQuestion, SurveyStatut } from '@/lib/sondages/types';

type Props = {
  initialSurvey: Survey;
  initialItems: SurveyItem[];
  initialQuestions: SurveyQuestion[];
};

const STATUT_BADGE: Record<SurveyStatut, string> = {
  brouillon: 'bg-slate-100 text-slate-700',
  publie: 'bg-emerald-100 text-emerald-800',
  ferme: 'bg-amber-100 text-amber-800',
};

const STATUT_LABEL: Record<SurveyStatut, string> = {
  brouillon: 'Brouillon',
  publie: 'Publié',
  ferme: 'Fermé',
};

export default function SurveyBuilder({ initialSurvey, initialItems, initialQuestions }: Props) {
  const router = useRouter();
  const { notify } = useToast();
  const [, startTransition] = useTransition();

  const [survey, setSurvey] = useState<Survey>(initialSurvey);
  const [items, setItems] = useState<SurveyItem[]>(initialItems);
  const [questionMap, setQuestionMap] = useState<Record<string, SurveyQuestion>>(() => {
    const m: Record<string, SurveyQuestion> = {};
    for (const q of initialQuestions) m[q.id] = q;
    return m;
  });

  const [pickerOpen, setPickerOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [savingInfos, setSavingInfos] = useState(false);
  const [busyAction, setBusyAction] = useState<null | 'publish' | 'close' | 'reopen' | 'delete'>(null);

  const isReadOnly = survey.statut === 'ferme';
  const isPublished = survey.statut === 'publie';

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const questionCount = useMemo(() => items.filter((i) => i.type === 'question').length, [items]);

  // -------- INFOS

  function patchSurvey(p: Partial<Survey>) {
    setSurvey((s) => ({ ...s, ...p }));
  }

  async function saveInfos() {
    if (!survey.titre.trim()) {
      notify('error', 'Le titre est obligatoire.');
      return;
    }
    setSavingInfos(true);
    const res = await fetch(`/api/admin/sondages/${survey.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        titre: survey.titre,
        description: survey.description,
        texte_intro: survey.texte_intro,
        texte_fin: survey.texte_fin,
        image_couverture_url: survey.image_couverture_url,
        image_source: survey.image_source,
        open_at: survey.open_at,
        close_at: survey.close_at,
      }),
    });
    setSavingInfos(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Échec de la sauvegarde');
      return;
    }
    notify('success', 'Sondage enregistré.');
    startTransition(() => router.refresh());
  }

  // -------- ITEMS

  async function addItem(payload: {
    type: SurveyItemType;
    question_id?: string | null;
    content?: string | null;
    image_source?: ImageSource | null;
  }) {
    const res = await fetch(`/api/admin/sondages/${survey.id}/items`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Ajout échoué');
      return;
    }
    const created = (await res.json()) as SurveyItem;
    setItems((prev) => [...prev, created]);
  }

  async function pickFromBank(question: SurveyQuestion) {
    setQuestionMap((m) => ({ ...m, [question.id]: question }));
    await addItem({ type: 'question', question_id: question.id });
    setPickerOpen(false);
  }

  async function quickCreated(question: SurveyQuestion) {
    setQuestionMap((m) => ({ ...m, [question.id]: question }));
    await addItem({ type: 'question', question_id: question.id });
    setQuickOpen(false);
  }

  async function addText() {
    await addItem({ type: 'texte', content: '' });
  }

  async function addImage() {
    await addItem({ type: 'image', content: null, image_source: null });
  }

  async function addSection() {
    await addItem({ type: 'section_break', content: '' });
  }

  async function patchItem(id: string, patch: Partial<SurveyItem>) {
    // Optimistic
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

    const res = await fetch(`/api/admin/sondages/${survey.id}/items/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Mise à jour échouée');
    }
  }

  async function removeItem(id: string) {
    if (!window.confirm('Supprimer cet élément ?')) return;
    const previous = items;
    setItems((prev) => prev.filter((i) => i.id !== id));
    const res = await fetch(`/api/admin/sondages/${survey.id}/items/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Suppression échouée');
      setItems(previous);
    }
  }

  async function moveItem(id: string, direction: 'up' | 'down') {
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= items.length) return;
    const next = arrayMove(items, idx, target);
    setItems(next);
    void persistOrder(next.map((i) => i.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    await persistOrder(next.map((i) => i.id));
  }

  async function persistOrder(ids: string[]) {
    const res = await fetch(`/api/admin/sondages/${survey.id}/items/reorder`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Réorganisation échouée');
    }
  }

  // -------- ACTIONS DE PUBLICATION

  async function doAction(action: 'publish' | 'close' | 'reopen') {
    if (action === 'publish' && questionCount < 1) {
      notify('error', 'Le sondage doit contenir au moins une question.');
      return;
    }
    setBusyAction(action);
    const res = await fetch(`/api/admin/sondages/${survey.id}/${action}`, { method: 'POST' });
    setBusyAction(null);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Action échouée');
      return;
    }
    const labels = {
      publish: 'Sondage publié.',
      close: 'Sondage fermé.',
      reopen: 'Sondage ré-ouvert.',
    } as const;
    notify('success', labels[action]);
    startTransition(() => router.refresh());
    // Sync local
    if (action === 'publish') patchSurvey({ statut: 'publie', publie_le: new Date().toISOString() });
    if (action === 'close') patchSurvey({ statut: 'ferme', ferme_le: new Date().toISOString() });
    if (action === 'reopen') patchSurvey({ statut: 'publie', ferme_le: null });
  }

  async function deleteSurvey() {
    if (!window.confirm('Supprimer ce sondage en brouillon définitivement ?')) return;
    setBusyAction('delete');
    const res = await fetch(`/api/admin/sondages/${survey.id}`, { method: 'DELETE' });
    setBusyAction(null);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      notify('error', error ?? 'Suppression échouée');
      return;
    }
    notify('success', 'Sondage supprimé.');
    router.push('/admin/sondages');
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/sondages"
          className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux sondages
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {survey.statut !== 'brouillon' ? (
            <Link
              href={`/admin/sondages/${survey.id}/resultats`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Voir les résultats
            </Link>
          ) : null}
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${STATUT_BADGE[survey.statut]}`}
          >
            {STATUT_LABEL[survey.statut]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* COLONNE GAUCHE : INFOS + PUBLICATION */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Section title="Informations">
            <Field label="Titre" required>
              <input
                type="text"
                value={survey.titre}
                onChange={(e) => patchSurvey({ titre: e.target.value })}
                disabled={isReadOnly}
                placeholder="Ex. : Évaluation du climat de l'équipe"
                className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
              />
            </Field>
            <Field label="Description" help="Phrase courte affichée dans la liste mobile.">
              <textarea
                value={survey.description}
                onChange={(e) => patchSurvey({ description: e.target.value })}
                disabled={isReadOnly}
                rows={2}
                placeholder="Ex. : 5 minutes pour nous donner votre ressenti."
                className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
              />
            </Field>
            <Field
              label="Texte d'introduction (optionnel)"
              help="Affiché en haut du sondage avant les questions. Idéal pour expliquer le but et rappeler l'anonymat."
            >
              <textarea
                value={survey.texte_intro}
                onChange={(e) => patchSurvey({ texte_intro: e.target.value })}
                disabled={isReadOnly}
                rows={4}
                placeholder="Ex. : Bonjour ! Ce sondage de 8 questions vise à recueillir votre ressenti sur la charge de travail. Vos réponses sont 100% anonymes."
                className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
              />
            </Field>
            <Field
              label="Texte de remerciement (optionnel)"
              help="Affiché après l'envoi des réponses. Si vide, un message générique est utilisé."
            >
              <textarea
                value={survey.texte_fin}
                onChange={(e) => patchSurvey({ texte_fin: e.target.value })}
                disabled={isReadOnly}
                rows={3}
                placeholder="Ex. : Merci pour votre participation ! Les résultats seront partagés en réunion d'équipe début juin."
                className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
              />
            </Field>
            <Field label="Image de couverture (optionnel)">
              <ImagePicker
                value={{ url: survey.image_couverture_url, source: survey.image_source }}
                onChange={({ url, source }) =>
                  patchSurvey({ image_couverture_url: url, image_source: source })
                }
                defaultImageUrl="/default-actu-cover.png"
              />
            </Field>
          </Section>

          <Section title="Publication">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Ouverture" help="Optionnel : date de mise en ligne.">
                <input
                  type="datetime-local"
                  value={toLocalInput(survey.open_at)}
                  onChange={(e) => patchSurvey({ open_at: fromLocalInput(e.target.value) })}
                  disabled={isReadOnly}
                  className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
                />
              </Field>
              <Field label="Fermeture" help="Optionnel : ferme automatiquement.">
                <input
                  type="datetime-local"
                  value={toLocalInput(survey.close_at)}
                  onChange={(e) => patchSurvey({ close_at: fromLocalInput(e.target.value) })}
                  disabled={isReadOnly}
                  className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
                />
              </Field>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={saveInfos}
                disabled={savingInfos || isReadOnly}
                className="btn-secondary"
              >
                {savingInfos ? 'Enregistrement…' : 'Enregistrer les infos'}
              </button>

              {survey.statut === 'brouillon' && (
                <button
                  type="button"
                  onClick={() => doAction('publish')}
                  disabled={busyAction !== null}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {busyAction === 'publish' ? 'Publication…' : 'Publier'}
                </button>
              )}

              {survey.statut === 'publie' && (
                <button
                  type="button"
                  onClick={() => doAction('close')}
                  disabled={busyAction !== null}
                  className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" />
                  {busyAction === 'close' ? 'Fermeture…' : 'Fermer'}
                </button>
              )}

              {survey.statut === 'ferme' && (
                <button
                  type="button"
                  onClick={() => doAction('reopen')}
                  disabled={busyAction !== null}
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {busyAction === 'reopen' ? 'Ré-ouverture…' : 'Ré-ouvrir'}
                </button>
              )}

              {survey.statut === 'brouillon' && (
                <button
                  type="button"
                  onClick={deleteSurvey}
                  disabled={busyAction !== null}
                  className="ml-auto inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </button>
              )}
            </div>

            {isPublished && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                Sondage en ligne. Tu peux encore ajouter / réordonner des items, mais éviter de supprimer ceux qui ont déjà reçu des réponses.
              </p>
            )}

            {isReadOnly && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Sondage fermé : modifications désactivées. Ré-ouvre-le pour reprendre l’édition.
              </p>
            )}
          </Section>
        </div>

        {/* COLONNE DROITE : ITEMS */}
        <div className="space-y-4">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-medium text-ink-900">Contenu du sondage</h2>
              <p className="mt-1 text-xs text-ink-500">
                {items.length} élément{items.length > 1 ? 's' : ''} ·{' '}
                {questionCount} question{questionCount > 1 ? 's' : ''}
              </p>
            </div>
          </header>

          {!isReadOnly && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-brand-300 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
              >
                <ListChecks className="h-4 w-4" />
                + Question (banque)
              </button>
              <button
                type="button"
                onClick={() => setQuickOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50/40"
              >
                <Sparkles className="h-4 w-4" />
                + Nouvelle question
              </button>
              <button
                type="button"
                onClick={addText}
                className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50/40"
              >
                <TypeIcon className="h-4 w-4" />
                + Texte
              </button>
              <button
                type="button"
                onClick={addImage}
                className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50/40"
              >
                <ImageIcon className="h-4 w-4" />
                + Image
              </button>
              <button
                type="button"
                onClick={addSection}
                className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50/40"
              >
                <SeparatorHorizontal className="h-4 w-4" />
                + Section
              </button>
            </div>
          )}

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-300 bg-white p-12 text-center text-ink-500">
              <Minus className="mx-auto mb-2 h-6 w-6 text-ink-400" />
              Le sondage est vide. Ajoute une première question pour commencer.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-3">
                  {items.map((item, index) => (
                    <SurveyItemRow
                      key={item.id}
                      item={item}
                      question={item.question_id ? questionMap[item.question_id] : undefined}
                      readOnly={isReadOnly}
                      onPatch={(patch) => patchItem(item.id, patch)}
                      onRemove={() => removeItem(item.id)}
                      onMoveUp={index > 0 ? () => moveItem(item.id, 'up') : undefined}
                      onMoveDown={
                        index < items.length - 1 ? () => moveItem(item.id, 'down') : undefined
                      }
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {pickerOpen && (
        <QuestionPickerModal
          alreadyUsedIds={items.filter((i) => i.question_id).map((i) => i.question_id as string)}
          onClose={() => setPickerOpen(false)}
          onPick={pickFromBank}
        />
      )}

      {quickOpen && (
        <QuickQuestionModal onClose={() => setQuickOpen(false)} onCreated={quickCreated} />
      )}
    </div>
  );
}

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  // YYYY-MM-DDThh:mm
  const tz = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{title}</h2>
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

