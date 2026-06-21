import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MatchEntry } from '@/features/match-entries/types';

interface CompareFormChartProps {
  p1Name: string;
  p1Entries: MatchEntry[];
  p2Name: string;
  p2Entries: MatchEntry[];
}

function getFormPoints(entry: MatchEntry) {
  if (entry.result === 'win') return 3;
  if (entry.result === 'draw') return 1;
  return 0;
}

export function CompareFormChart({ p1Name, p1Entries, p2Name, p2Entries }: CompareFormChartProps) {
  const data = useMemo(() => {
    // Get last 10 matches for each player sorted by date ascending (oldest → newest on chart)
    const sort = (entries: MatchEntry[]) =>
      [...entries]
        .filter(e => e.date)
        .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
        .slice(-10);

    const p1Sorted = sort(p1Entries);
    const p2Sorted = sort(p2Entries);

    // Build a rolling cumulative points chart so we can see momentum
    const maxLen = Math.max(p1Sorted.length, p2Sorted.length, 1);

    return Array.from({ length: maxLen }, (_, i) => {
      const p1Match = p1Sorted[i];
      const p2Match = p2Sorted[i];
      return {
        match: `M${i + 1}`,
        [p1Name]: p1Match ? getFormPoints(p1Match) : null,
        [p2Name]: p2Match ? getFormPoints(p2Match) : null,
      };
    });
  }, [p1Name, p1Entries, p2Name, p2Entries]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-white/80 text-xs font-semibold">{entry.name}:</span>
            <span className="text-white font-black text-xs">
              {entry.value === 3 ? '🏆 Win' : entry.value === 1 ? '🤝 Draw' : '❌ Loss'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="p1Gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="p2Gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="match"
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: 700 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 3]}
          ticks={[0, 1, 3]}
          tickFormatter={(v) => v === 3 ? 'W' : v === 1 ? 'D' : 'L'}
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: 700 }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={p1Name}
          stroke="#3b82f6"
          strokeWidth={2.5}
          fill="url(#p1Gradient)"
          dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#60a5fa', strokeWidth: 2, stroke: '#fff' }}
          connectNulls={false}
        />
        <Area
          type="monotone"
          dataKey={p2Name}
          stroke="#ef4444"
          strokeWidth={2.5}
          fill="url(#p2Gradient)"
          dot={{ fill: '#ef4444', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#f87171', strokeWidth: 2, stroke: '#fff' }}
          connectNulls={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
