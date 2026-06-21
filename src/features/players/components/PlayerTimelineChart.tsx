import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { PlayerSeasonStat } from '@/features/players/types';

interface PlayerTimelineChartProps {
  seasonStats: PlayerSeasonStat[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-foreground/70 text-xs font-semibold">{entry.name}:</span>
          <span className="text-foreground font-black text-xs">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function PlayerTimelineChart({ seasonStats }: PlayerTimelineChartProps) {
  const data = useMemo(() => {
    return [...seasonStats]
      .sort((a, b) => a.seasonId - b.seasonId)
      .map(s => ({
        season: s.seasonName || `Season ${s.seasonId}`,
        Goals: s.goals,
        Wins: s.wins,
        Matches: s.appearances,
        MOTM: s.motmCount,
        'Clean Sheets': s.cleansheets,
      }));
  }, [seasonStats]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No season data available
      </div>
    );
  }

  if (data.length === 1) {
    // Only one season — show a summary bar instead of a line chart
    const d = data[0];
    return (
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Goals', value: d.Goals, color: '#10b981' },
          { label: 'Wins', value: d.Wins, color: '#3b82f6' },
          { label: 'MOTM', value: d.MOTM, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center rounded-xl p-3" style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color }}>{label}</p>
            <p className="text-2xl font-black text-foreground">{value}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Goals + Wins Area Chart */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Goals & Wins per Season</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="goalsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="winsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="season" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Goals" stroke="#10b981" strokeWidth={2} fill="url(#goalsGrad)" dot={{ fill: '#10b981', r: 3 }} />
            <Area type="monotone" dataKey="Wins" stroke="#3b82f6" strokeWidth={2} fill="url(#winsGrad)" dot={{ fill: '#3b82f6', r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* MOTM + Clean Sheets line */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">MOTM & Clean Sheets per Season</p>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="season" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="MOTM" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
            <Line type="monotone" dataKey="Clean Sheets" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
