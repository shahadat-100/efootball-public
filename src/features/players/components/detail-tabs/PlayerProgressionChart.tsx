import { useMemo } from 'react';
import { PlayerSeasonStat } from '@/features/players/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface PlayerProgressionChartProps {
  playerSeasonStats: PlayerSeasonStat[];
}

export function PlayerProgressionChart({ playerSeasonStats }: PlayerProgressionChartProps) {
  const data = useMemo(() => {
    // Sort by season (assuming id or name determines chronological order)
    // We will just sort them by id if available or keep them in the order they were provided.
    // Usually they are already ordered, but let's ensure we use them chronologically.
    const sorted = [...playerSeasonStats].reverse(); // Assuming older is at the end of the array, or just use as provided
    
    return sorted.map(s => {
      const winRate = s.appearances > 0 ? (s.wins / s.appearances) * 100 : 0;
      const goalsPerMatch = s.appearances > 0 ? s.goals / s.appearances : 0;
      
      return {
        name: s.seasonName,
        goals: s.goals,
        wins: s.wins,
        winRate: Math.round(winRate),
        goalsPerMatch: Number(goalsPerMatch.toFixed(2))
      };
    });
  }, [playerSeasonStats]);

  if (data.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="font-heading font-black text-xl text-foreground tracking-tight">Career Progression</h3>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Goals & Win Rate Trajectory</p>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }}
              dy={10}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#10b981', fontSize: 11, fontWeight: 700 }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#3b82f6', fontSize: 11, fontWeight: 700 }}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', padding: '12px' }}
              itemStyle={{ fontWeight: 800, fontSize: '13px' }}
              labelStyle={{ color: '#9ca3af', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '10px' }} />
            
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="goals" 
              name="Total Goals"
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#111827' }}
              activeDot={{ r: 7, strokeWidth: 0 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="winRate" 
              name="Win Rate %"
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#111827' }}
              activeDot={{ r: 7, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
