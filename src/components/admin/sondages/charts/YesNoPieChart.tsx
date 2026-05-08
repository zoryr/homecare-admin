'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import type { YesNoResult } from '@/lib/sondages/results';

type Props = {
  results: YesNoResult;
  ouiLabel?: string;
  nonLabel?: string;
};

export default function YesNoPieChart({ results, ouiLabel = 'Oui', nonLabel = 'Non' }: Props) {
  const data = [
    { name: ouiLabel, value: results.yes, color: '#10B981' },
    { name: nonLabel, value: results.no, color: '#EF4444' },
  ];

  return (
    <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[200px_1fr]">
      <div className="relative" style={{ width: '100%', height: 180 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #D1EDF1', fontSize: 12 }}
              formatter={(value) => {
                const v = typeof value === 'number' ? value : Number(value) || 0;
                return [`${v} réponse${v > 1 ? 's' : ''}`, ''];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-emerald-600">
              {results.pctYes.toFixed(0)}%
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-ink-500">{ouiLabel}</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Legend color="#10B981" label={ouiLabel} count={results.yes} total={results.total} />
        <Legend color="#EF4444" label={nonLabel} count={results.no} total={results.total} />
      </div>
    </div>
  );
}

function Legend({
  color,
  label,
  count,
  total,
}: {
  color: string;
  label: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="flex-1 text-sm font-medium text-ink-700">{label}</span>
      <span className="text-sm text-ink-500">
        {count} ({pct.toFixed(0)}%)
      </span>
    </div>
  );
}
