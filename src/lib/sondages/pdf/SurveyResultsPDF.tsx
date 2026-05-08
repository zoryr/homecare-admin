/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import React from 'react';

import type { SurveyResultsPayload } from '../results';

const PRIMARY = '#2A8A98';
const PRIMARY_LIGHT = '#D1EDF1';
const INK_900 = '#111827';
const INK_700 = '#374151';
const INK_500 = '#6B7280';
const INK_200 = '#D1D5DB';
const INK_50 = '#F5F7FA';

const styles = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: INK_700,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY,
    paddingBottom: 12,
    marginBottom: 18,
  },
  brand: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: PRIMARY,
    letterSpacing: 1,
  },
  brandTag: {
    fontSize: 8,
    color: INK_500,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  meta: { fontSize: 8, color: INK_500, textAlign: 'right' },

  surveyTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: INK_900,
    marginBottom: 6,
  },
  surveyDesc: {
    fontSize: 10,
    color: INK_500,
    marginBottom: 16,
    lineHeight: 1.5,
  },

  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  kpiCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: INK_200,
    borderRadius: 6,
    padding: 10,
    backgroundColor: INK_50,
  },
  kpiLabel: { fontSize: 8, color: INK_500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  kpiValue: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: INK_900 },

  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: PRIMARY,
    marginTop: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  questionBlock: {
    marginBottom: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: INK_200,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  qHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  qIndex: {
    fontSize: 8,
    color: INK_500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  qResponses: { fontSize: 8, color: INK_500 },
  qTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: INK_900,
    marginBottom: 8,
    lineHeight: 1.3,
  },

  table: { borderWidth: 1, borderColor: INK_200, borderRadius: 4, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: INK_200 },
  tableRowLast: { flexDirection: 'row' },
  tableHeader: { backgroundColor: PRIMARY_LIGHT },
  cellLabel: { flex: 3, padding: 6, fontSize: 9, color: INK_700 },
  cellCount: { flex: 1, padding: 6, fontSize: 9, color: INK_700, textAlign: 'right' },
  cellPct: { flex: 1, padding: 6, fontSize: 9, color: INK_700, textAlign: 'right' },
  cellHeader: { fontFamily: 'Helvetica-Bold', color: PRIMARY },

  textResponse: {
    backgroundColor: INK_50,
    borderLeftWidth: 2,
    borderLeftColor: PRIMARY,
    padding: 6,
    marginBottom: 6,
    fontSize: 9,
    color: INK_700,
  },
  textResponseMeta: {
    fontSize: 7,
    color: INK_500,
    marginBottom: 2,
  },
  textMore: { fontSize: 8, color: INK_500, marginTop: 4, fontStyle: 'italic' },

  emptyText: { fontSize: 9, color: INK_500, fontStyle: 'italic' },

  averageBox: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  averageBig: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: PRIMARY },
  averageSmall: { fontSize: 10, color: INK_500 },

  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: INK_500,
    borderTopWidth: 1,
    borderTopColor: INK_200,
    paddingTop: 8,
  },
});

const RATING_LABELS = ['Très mauvais', 'Mauvais', 'Moyen', 'Bon', 'Excellent'];
const SMILEYS_LABELS = ['😢 Très mauvais', '🙁 Mauvais', '😐 Moyen', '🙂 Bon', '😍 Excellent'];

const STATUT_LABEL: Record<string, string> = {
  brouillon: 'Brouillon',
  publie: 'Publié',
  ferme: 'Fermé',
};

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function ratio(a: number, b: number): string {
  return b > 0 ? `${Math.round((a / b) * 100)}%` : '0%';
}

type Props = {
  payload: SurveyResultsPayload;
  generatedAt: string;
};

export function SurveyResultsPDF({ payload, generatedAt }: Props) {
  const { survey, items, total_participants, total_active_users } = payload;

  return (
    <Document
      title={`Résultats - ${survey.titre}`}
      author="Home & Care"
      creator="Home & Care Admin"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View>
            <Text style={styles.brand}>HOME &amp; CARE</Text>
            <Text style={styles.brandTag}>Résultats de sondage</Text>
          </View>
          <View>
            <Text style={styles.meta}>Généré le {fmtDate(generatedAt)}</Text>
            <Text style={styles.meta}>
              {STATUT_LABEL[survey.statut] ?? survey.statut}
            </Text>
          </View>
        </View>

        <Text style={styles.surveyTitle}>{survey.titre}</Text>
        {survey.description ? (
          <Text style={styles.surveyDesc}>{survey.description}</Text>
        ) : null}

        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Réponses reçues</Text>
            <Text style={styles.kpiValue}>
              {total_participants} / {total_active_users}
            </Text>
            <Text style={styles.brandTag}>
              Taux : {ratio(total_participants, total_active_users)}
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Ouverture</Text>
            <Text style={styles.kpiValue}>{fmtDate(survey.publie_le ?? survey.open_at)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Fermeture</Text>
            <Text style={styles.kpiValue}>{fmtDate(survey.close_at ?? survey.ferme_le)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Détail par question ({items.length})</Text>

        {items.length === 0 ? (
          <Text style={styles.emptyText}>Aucune question dans ce sondage.</Text>
        ) : (
          items.map((item, idx) => <QuestionBlock key={item.item_id} item={item} index={idx + 1} />)
        )}

        <View style={styles.footer} fixed>
          <Text>{survey.titre}</Text>
          <Text
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
          />
          <Text>Home &amp; Care · Confidentiel</Text>
        </View>
      </Page>
    </Document>
  );
}

function QuestionBlock({
  item,
  index,
}: {
  item: SurveyResultsPayload['items'][number];
  index: number;
}) {
  return (
    <View style={styles.questionBlock} wrap={false}>
      <View style={styles.qHeader}>
        <Text style={styles.qIndex}>
          Question {index} · {item.type.replace('_', ' ')}
        </Text>
        <Text style={styles.qResponses}>{item.total_responses} réponse(s)</Text>
      </View>
      <Text style={styles.qTitle}>{item.titre}</Text>
      <ResultsRenderer item={item} />
    </View>
  );
}

function ResultsRenderer({ item }: { item: SurveyResultsPayload['items'][number] }) {
  if (item.type === 'choix_unique' || item.type === 'choix_multiple') {
    if (item.results.length === 0) {
      return <Text style={styles.emptyText}>Aucune option configurée.</Text>;
    }
    return (
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cellLabel, styles.cellHeader]}>Option</Text>
          <Text style={[styles.cellCount, styles.cellHeader]}>Réponses</Text>
          <Text style={[styles.cellPct, styles.cellHeader]}>%</Text>
        </View>
        {item.results.map((r, i) => {
          const isLast = i === item.results.length - 1;
          return (
            <View key={r.value} style={isLast ? styles.tableRowLast : styles.tableRow}>
              <Text style={styles.cellLabel}>{r.label || r.value}</Text>
              <Text style={styles.cellCount}>{r.count}</Text>
              <Text style={styles.cellPct}>{r.pct.toFixed(1)} %</Text>
            </View>
          );
        })}
      </View>
    );
  }

  if (item.type === 'etoiles_5' || item.type === 'smileys_5') {
    const labels = item.type === 'smileys_5' ? SMILEYS_LABELS : RATING_LABELS;
    const total = item.results.total;
    return (
      <View>
        <View style={styles.averageBox}>
          <Text style={styles.averageBig}>{item.results.average.toFixed(2)}</Text>
          <Text style={styles.averageSmall}>/ 5 (moyenne sur {total} réponse(s))</Text>
        </View>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.cellLabel, styles.cellHeader]}>Note</Text>
            <Text style={[styles.cellCount, styles.cellHeader]}>Réponses</Text>
            <Text style={[styles.cellPct, styles.cellHeader]}>%</Text>
          </View>
          {[1, 2, 3, 4, 5].map((n, i) => {
            const c = item.results.counts[n as 1 | 2 | 3 | 4 | 5];
            const pct = total > 0 ? (c / total) * 100 : 0;
            return (
              <View key={n} style={i === 4 ? styles.tableRowLast : styles.tableRow}>
                <Text style={styles.cellLabel}>{labels[n - 1]}</Text>
                <Text style={styles.cellCount}>{c}</Text>
                <Text style={styles.cellPct}>{pct.toFixed(1)} %</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  if (item.type === 'oui_non') {
    const { yes, no, total } = item.results;
    return (
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cellLabel, styles.cellHeader]}>Réponse</Text>
          <Text style={[styles.cellCount, styles.cellHeader]}>Réponses</Text>
          <Text style={[styles.cellPct, styles.cellHeader]}>%</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.cellLabel}>Oui</Text>
          <Text style={styles.cellCount}>{yes}</Text>
          <Text style={styles.cellPct}>{ratio(yes, total)}</Text>
        </View>
        <View style={styles.tableRowLast}>
          <Text style={styles.cellLabel}>Non</Text>
          <Text style={styles.cellCount}>{no}</Text>
          <Text style={styles.cellPct}>{ratio(no, total)}</Text>
        </View>
      </View>
    );
  }

  if (item.type === 'texte_libre') {
    const list = item.results.responses.slice(0, 5);
    if (list.length === 0) {
      return <Text style={styles.emptyText}>Aucune réponse.</Text>;
    }
    return (
      <View>
        {list.map((r, i) => (
          <View key={`${r.submission_token}-${i}`} style={styles.textResponse}>
            <Text style={styles.textResponseMeta}>
              Anonyme #{i + 1} · {fmtDate(r.created_at)}
            </Text>
            <Text>{r.text}</Text>
          </View>
        ))}
        {item.results.responses.length > 5 ? (
          <Text style={styles.textMore}>
            + {item.results.responses.length - 5} autre(s) réponse(s) — voir l’export CSV pour la liste
            complète.
          </Text>
        ) : null}
      </View>
    );
  }

  return null;
}
