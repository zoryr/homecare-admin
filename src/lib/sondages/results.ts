import type { ChoiceOption, QuestionType, Survey, SurveyItem, SurveyQuestion } from './types';

export type ChoiceResult = {
  value: string;
  label: string;
  count: number;
  pct: number;
};

export type RatingResult = {
  /** Distribution: clé = 1..5, valeur = count */
  counts: Record<1 | 2 | 3 | 4 | 5, number>;
  total: number;
  average: number;
};

export type YesNoResult = {
  yes: number;
  no: number;
  total: number;
  pctYes: number;
};

export type TextResponse = {
  submission_token: string;
  text: string;
  created_at: string;
};

export type TextResult = {
  total: number;
  responses: TextResponse[];
};

export type ItemResultData =
  | { type: 'choix_unique'; results: ChoiceResult[] }
  | { type: 'choix_multiple'; results: ChoiceResult[] }
  | { type: 'etoiles_5'; results: RatingResult }
  | { type: 'smileys_5'; results: RatingResult }
  | { type: 'oui_non'; results: YesNoResult }
  | { type: 'texte_libre'; results: TextResult };

export type ItemResult = {
  item_id: string;
  question_id: string;
  type: QuestionType;
  titre: string;
  required: boolean;
  ordre: number;
  total_responses: number;
} & ItemResultData;

export type Participant = {
  user_id: string;
  prenom: string | null;
  nom: string | null;
  submitted_at: string;
};

export type SurveyResultsPayload = {
  survey: Survey;
  items: ItemResult[];
  total_participants: number;
  total_active_users: number;
  participants: Participant[];
};

type RawResponse = {
  item_id: string;
  submission_token: string;
  answer: unknown;
  created_at: string;
};

/**
 * Agrège les réponses brutes en stats par item.
 * @param question - SurveyQuestion liée à l'item (pour récupérer options + labels)
 */
export function aggregateItemResults(
  item: SurveyItem & { ordre: number },
  question: SurveyQuestion,
  rawResponses: RawResponse[],
  search?: string,
): ItemResult {
  const responses = rawResponses.filter((r) => r.item_id === item.id);
  const totalResponses = new Set(responses.map((r) => r.submission_token)).size;

  const base = {
    item_id: item.id,
    question_id: question.id,
    type: question.type,
    titre: question.titre,
    required: item.required,
    ordre: item.ordre,
    total_responses: totalResponses,
  };

  switch (question.type) {
    case 'choix_unique':
      return {
        ...base,
        type: 'choix_unique',
        results: aggregateChoices(question.options.choices ?? [], responses, false),
      };
    case 'choix_multiple':
      return {
        ...base,
        type: 'choix_multiple',
        results: aggregateChoices(question.options.choices ?? [], responses, true),
      };
    case 'etoiles_5':
      return {
        ...base,
        type: 'etoiles_5',
        results: aggregateRatings(responses),
      };
    case 'smileys_5':
      return {
        ...base,
        type: 'smileys_5',
        results: aggregateRatings(responses),
      };
    case 'oui_non':
      return {
        ...base,
        type: 'oui_non',
        results: aggregateYesNo(responses),
      };
    case 'texte_libre':
      return {
        ...base,
        type: 'texte_libre',
        results: aggregateTexts(responses, search),
      };
  }
}

function aggregateChoices(
  choices: ChoiceOption[],
  responses: RawResponse[],
  multi: boolean,
): ChoiceResult[] {
  const counts = new Map<string, number>();
  for (const c of choices) counts.set(c.value, 0);

  // Total = nombre de submissions distinctes
  const submissions = new Set(responses.map((r) => r.submission_token));
  const total = submissions.size;

  for (const r of responses) {
    if (multi) {
      const a = r.answer as { values?: string[] } | null;
      if (a && Array.isArray(a.values)) {
        for (const v of a.values) {
          if (counts.has(v)) counts.set(v, (counts.get(v) ?? 0) + 1);
        }
      }
    } else {
      const a = r.answer as { value?: string } | null;
      if (a && typeof a.value === 'string' && counts.has(a.value)) {
        counts.set(a.value, (counts.get(a.value) ?? 0) + 1);
      }
    }
  }

  return choices.map((c) => {
    const n = counts.get(c.value) ?? 0;
    return {
      value: c.value,
      label: c.label,
      count: n,
      pct: total > 0 ? Math.round((n / total) * 1000) / 10 : 0,
    };
  });
}

function aggregateRatings(responses: RawResponse[]): RatingResult {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } satisfies Record<1 | 2 | 3 | 4 | 5, number>;
  let sum = 0;
  let total = 0;
  for (const r of responses) {
    const a = r.answer as { rating?: number } | null;
    if (a && typeof a.rating === 'number' && a.rating >= 1 && a.rating <= 5) {
      const k = Math.round(a.rating) as 1 | 2 | 3 | 4 | 5;
      counts[k] += 1;
      sum += a.rating;
      total += 1;
    }
  }
  const average = total > 0 ? Math.round((sum / total) * 100) / 100 : 0;
  return { counts, total, average };
}

function aggregateYesNo(responses: RawResponse[]): YesNoResult {
  let yes = 0;
  let no = 0;
  for (const r of responses) {
    const a = r.answer as { value?: boolean } | null;
    if (a && typeof a.value === 'boolean') {
      if (a.value) yes += 1;
      else no += 1;
    }
  }
  const total = yes + no;
  return {
    yes,
    no,
    total,
    pctYes: total > 0 ? Math.round((yes / total) * 1000) / 10 : 0,
  };
}

function aggregateTexts(responses: RawResponse[], search?: string): TextResult {
  const all: TextResponse[] = [];
  for (const r of responses) {
    const a = r.answer as { text?: string } | null;
    if (a && typeof a.text === 'string' && a.text.trim().length > 0) {
      all.push({
        submission_token: r.submission_token,
        text: a.text,
        created_at: r.created_at,
      });
    }
  }
  let filtered = all;
  if (search?.trim()) {
    const needle = search.trim().toLowerCase();
    filtered = all.filter((x) => x.text.toLowerCase().includes(needle));
  }
  // Tri du plus récent au plus ancien
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return { total: all.length, responses: filtered };
}
