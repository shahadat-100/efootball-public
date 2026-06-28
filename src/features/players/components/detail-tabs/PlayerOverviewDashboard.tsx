import { MatchEntry } from '@/features/match-entries/types';
import { PlayerFormChart } from '../charts/PlayerFormChart';
import { PlayerNightingaleChart } from '../charts/PlayerNightingaleChart';
import { PlayerGaugeChart } from '../charts/PlayerGaugeChart';
import { Activity, Target, Shield, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

interface PlayerOverviewDashboardProps {
  entries: MatchEntry[];
  stats: {
    totalMatches: number;
    totalWins: number;
    totalGoals: number;
    totalCleanSheets: number;
    totalMOTM: number;
  };
}

export function PlayerOverviewDashboard({ entries, stats }: PlayerOverviewDashboardProps) {
  const goalTrendData = useMemo(() => {
    return [...entries]
      .filter(e => e.date)
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
      .slice(-15) // Last 15 matches for trend
      .map((e, i) => ({
        name: `M${i + 1}`,
        goals: e.goals || 0
      }));
  }, [entries]);

  if (!entries || entries.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
        <p className="text-muted-foreground font-bold">No match data available for dashboard visualization.</p>
      </div>
    );
  }

  const winRate = stats.totalMatches > 0 ? ((stats.totalWins / stats.totalMatches) * 100).toFixed(1) : '0';
  const goalsPerMatch = stats.totalMatches > 0 ? (stats.totalGoals / stats.totalMatches).toFixed(2) : '0';
  const csRate = stats.totalMatches > 0 ? ((stats.totalCleanSheets / stats.totalMatches) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Win Rate', value: `${winRate}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Goals / Match', value: goalsPerMatch, icon: Activity, color: 'text-sky-500', bg: 'bg-sky-500/10' },
          { label: 'Clean Sheet %', value: `${csRate}%`, icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Total MOTM', value: stats.totalMOTM, icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' }
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-3xl font-heading font-black">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Form Area & Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="mb-6">
            <h3 className="font-heading font-bold text-[16px] tracking-tight">Recent Goal Scoring Trend</h3>
            <p className="text-[12px] text-muted-foreground">Goals scored over the last 15 matches</p>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={goalTrendData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGoals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="goals" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorGoals)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="mb-2">
            <h3 className="font-heading font-bold text-[16px] tracking-tight">Performance Gauge</h3>
            <p className="text-[12px] text-muted-foreground">Core KPIs efficiency</p>
          </div>
          <div className="flex-1 flex items-center justify-center -mt-6">
            <PlayerGaugeChart stats={stats} />
          </div>
        </div>
      </div>

      {/* Bottom Row: Nightingale & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="mb-2">
            <h3 className="font-heading font-bold text-[16px] tracking-tight">Match Outcomes</h3>
            <p className="text-[12px] text-muted-foreground">Nightingale Rose distribution</p>
          </div>
          <div className="flex-1 min-h-[250px]">
            <PlayerNightingaleChart entries={entries} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="mb-6">
            <h3 className="font-heading font-bold text-[16px] tracking-tight">Form History (Goal Difference)</h3>
            <p className="text-[12px] text-muted-foreground">Goals scored vs conceded in recent matches</p>
          </div>
          <div className="h-[250px]">
            <PlayerFormChart entries={entries} />
          </div>
        </div>
      </div>
    </div>
  );
}
