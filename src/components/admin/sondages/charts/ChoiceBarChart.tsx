'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { ChoiceResult } from '@/lib/sondages/results';

type Props = {
  results: ChoiceResult[];
  multi?: boolean;
};

export default function ChoiceBarChart({ results, multi }: Props) {
  if (results.length === 0) {
    return <p className="text-sm text-ink-500">Aucune option configurée.</p>;
  }
  const data = results.map((r) => ({
    label: r.label || r.value,
    count: r.count,
    pct: r.pct,
  }));
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div>
      <div style={{ width: '100%', height: data.length * 44 + 24 }}>
        <ResponsiveContainer>
          <BarChart layout="vertical" data={data} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
            <XAxis type="number" hide domain={[0, max]} />
            <YAxis
              type="category"
              dataKey="label"
              width={140}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#374151' }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(61,181,197,0.08)' }}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #D1EDF1',
                fontSize: 12,
              }}
              formatter={(value, _name, props) => {
                const v = typeof value === 'number' ? value : Number(value) || 0;
                const pct = (props?.payload as { pct?: number } | undefined)?.pct ?? 0;
                return [`${v} réponse${v > 1 ? 's' : ''} (${pct}%)`, 'Décompte'];
              }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
              {data.map((_, i) => (
                <Cell key={i} fill="#3DB5C5" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {multi ? (
        <p className="mt-2 text-xs italic text-ink-500">
          Plusieurs choix possibles, le total peut dépasser 100%.
        </p>
      ) : null}
    </div>
  );
}
