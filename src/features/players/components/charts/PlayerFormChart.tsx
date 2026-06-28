import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { MatchEntry } from '@/features/match-entries/types';

interface PlayerFormChartProps {
  entries: MatchEntry[];
}

export function PlayerFormChart({ entries }: PlayerFormChartProps) {
  const data = useMemo(() => {
    // Get last 20 matches, oldest to newest
    const recent = [...entries]
      .filter(e => e.date)
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
      .slice(-20);

    return recent.map((e, index) => {
      const gf = e.goals || 0;
      const ga = e.goalsConceded || 0;
      const diff = gf - ga;
      let result = 'Draw';
      if (diff > 0) result = 'Win';
      if (diff < 0) result = 'Loss';

      return {
        name: `Match ${index + 1}`,
        date: e.date,
        gf,
        ga,
        diff,
        result
      };
    });
  }, [entries]);

  if (data.length === 0) return null;

  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" hide />
          <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-popover border border-border p-3 rounded-xl shadow-lg">
                    <p className="font-bold text-[12px] mb-1">{data.date}</p>
                    <p className="text-[14px] font-black" style={{ color: data.diff > 0 ? '#10b981' : data.diff < 0 ? '#ef4444' : '#f59e0b' }}>
                      {data.result}: {data.gf} - {data.ga}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">Difference: {data.diff > 0 ? `+${data.diff}` : data.diff}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine y={0} stroke="#333" strokeDasharray="3 3" />
          <Bar dataKey="diff" radius={[4, 4, 4, 4]} maxBarSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.diff > 0 ? '#10b981' : entry.diff < 0 ? '#ef4444' : '#f59e0b'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
