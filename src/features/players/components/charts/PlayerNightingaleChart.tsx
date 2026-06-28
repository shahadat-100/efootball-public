import { useMemo } from 'react';
import { RadialBarChart, RadialBar, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { MatchEntry } from '@/features/match-entries/types';

interface PlayerNightingaleChartProps {
  entries: MatchEntry[];
}

export function PlayerNightingaleChart({ entries }: PlayerNightingaleChartProps) {
  const data = useMemo(() => {
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let cleanSheets = 0;
    let motms = 0;
    let hattricks = 0;

    entries.forEach(e => {
      const res = e.result?.toLowerCase();
      if (res === 'win') wins++;
      if (res === 'draw') draws++;
      if (res === 'loss') losses++;
      if (e.cleanSheet) cleanSheets++;
      if (e.motm) motms++;
      if ((e.hattricks || 0) > 0) hattricks++;
    });

    return [
      { name: 'Wins', value: wins, fill: '#10b981' }, // emerald-500
      { name: 'Clean Sheets', value: cleanSheets, fill: '#0ea5e9' }, // sky-500
      { name: 'MOTM', value: motms, fill: '#f59e0b' }, // amber-500
      { name: 'Draws', value: draws, fill: '#facc15' }, // yellow-400
      { name: 'Losses', value: losses, fill: '#ef4444' }, // red-500
      { name: 'Hat-tricks', value: hattricks, fill: '#a855f7' }, // purple-500
    ].sort((a, b) => b.value - a.value); // Sort descending for Nightingale effect
  }, [entries]);

  if (data.length === 0 || data.every(d => d.value === 0)) return null;

  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="10%" 
          outerRadius="80%" 
          barSize={20} 
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            label={{ position: 'insideStart', fill: '#fff', fontSize: 10, fontWeight: 'bold' }}
            background={{ fill: 'rgba(255,255,255,0.05)' }}
            dataKey="value"
            cornerRadius={10}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontWeight: 'bold' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0 }} />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
