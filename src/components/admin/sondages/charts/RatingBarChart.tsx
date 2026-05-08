'use client';

import { Star } from 'lucide-react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { RatingResult } from '@/lib/sondages/results';

type Props = {
  results: RatingResult;
  type: 'etoiles_5' | 'smileys_5';
};

const SMILEYS = ['😢', '🙁', '😐', '🙂', '😍'];
const STARS = ['★', '★★', '★★★', '★★★★', '★★★★★'];

const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981'];

export default function RatingBarChart({ results, type }: Props) {
  const labels = type === 'smileys_5' ? SMILEYS : STARS;
  const data = ([1, 2, 3, 4, 5] as const).map((n) => ({
    n,
    label: labels[n - 1],
    count: results.counts[n],
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-3xl font-bold text-brand-700">
          {results.average.toFixed(2)}
        </span>
        <span className="text-sm text-ink-500">
          / 5 — moyenne sur {results.total} réponse{results.total > 1 ? 's' : ''}
        </span>
        {type === 'etoiles_5' && results.average > 0 ? (
          <div className="flex">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className="h-4 w-4"
                fill={n <= Math.round(results.average) ? '#F59E0B' : 'transparent'}
                color="#F59E0B"
                strokeWidth={1.5}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: type === 'smileys_5' ? 18 : 12, fill: '#374151' }}
            />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
            <Tooltip
              cursor={{ fill: 'rgba(61,181,197,0.08)' }}
              contentStyle={{ borderRadius: 8, border: '1px solid #D1EDF1', fontSize: 12 }}
              formatter={(value) => {
                const v = typeof value === 'number' ? value : Number(value) || 0;
                return [`${v} réponse${v > 1 ? 's' : ''}`, 'Décompte'];
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={48}>
              {data.map((d) => (
                <Cell key={d.n} fill={COLORS[d.n - 1]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
