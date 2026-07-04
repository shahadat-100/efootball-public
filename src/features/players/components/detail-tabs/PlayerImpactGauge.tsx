import { useMemo } from 'react';
import { MatchEntry } from '@/features/match-entries/types';
import { Trophy, Target, Star, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PlayerImpactGaugeProps {
  entries: MatchEntry[];
}

export function PlayerImpactGauge({ entries }: PlayerImpactGaugeProps) {
  const computed = useMemo(() => {
    if (!entries || entries.length === 0) return null;

    let wins = 0;
    let goals = 0;
    let motm = 0;
    let cleanSheets = 0;
    let hattricks = 0;

    entries.forEach(e => {
      if (e.result === 'win') wins++;
      goals += (e.goals || 0);
      if (e.motm) motm++;
      if (e.cleanSheet) cleanSheets++;
      if (e.hattricks && e.hattricks > 0) hattricks += e.hattricks;
    });

    const matches = entries.length;
    const winRate = Math.round((wins / matches) * 100);
    const goalsPerGame = goals / matches;
    const specialsPerGame = (motm * 2 + cleanSheets + hattricks * 3) / matches;

    // Scoring: Win Rate (40pts), Goals (40pts), Specials (20pts)
    const winPts = Math.round((wins / matches) * 40);
    const goalPts = Math.round(Math.min((goalsPerGame / 1.2) * 40, 40));
    const specialPts = Math.round(Math.min((specialsPerGame / 0.5) * 20, 20));
    const total = Math.min(winPts + goalPts + specialPts, 100);

    return { total, winPts, goalPts, specialPts, winRate, goalsPerGame, matches, goals, wins, motm, cleanSheets, hattricks };
  }, [entries]);

  if (!computed) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground text-sm">Not enough match data yet</p>
      </div>
    );
  }

  const { total, winPts, goalPts, specialPts, winRate, goalsPerGame, matches, goals, wins, motm, cleanSheets, hattricks } = computed;

  let color = '#ef4444';
  let label = 'Needs Work';
  let emoji = '📉';
  if (total >= 85)  { color = '#10b981'; label = 'Elite Tier';     emoji = '🌟'; }
  else if (total >= 70) { color = '#3b82f6'; label = 'Match Winner'; emoji = '🔥'; }
  else if (total >= 50) { color = '#f59e0b'; label = 'Solid Player'; emoji = '💪'; }

  const gaugeData = [
    { value: total,       fill: color },
    { value: 100 - total, fill: 'rgba(255,255,255,0.04)' },
  ];

  const breakdownItems = [
    {
      label: 'Win Rate',
      desc: `${wins}W / ${matches}M = ${winRate}%`,
      pts: winPts,
      max: 40,
      color: '#3b82f6',
      icon: Trophy,
    },
    {
      label: 'Goal Impact',
      desc: `${goals} goals · ${goalsPerGame.toFixed(2)}/match`,
      pts: goalPts,
      max: 40,
      color: '#10b981',
      icon: Target,
    },
    {
      label: 'Specials',
      desc: `${motm} MOTM · ${cleanSheets} CS · ${hattricks} HT`,
      pts: specialPts,
      max: 20,
      color: '#a855f7',
      icon: Star,
    },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
      {/* Background glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-32 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-700 group-hover:opacity-30"
        style={{ backgroundColor: color }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-background/50 border border-border flex items-center justify-center" style={{ color }}>
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-xl text-foreground tracking-tight">Overall Impact</h3>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Performance Breakdown</p>
          </div>
        </div>

        {/* Gauge + score side by side */}
        <div className="flex items-center gap-6 mb-6">
          {/* Half-circle gauge */}
          <div className="relative w-[140px] h-[80px] shrink-0">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={52}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={6}
                >
                  {gaugeData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
              <span className="font-heading font-black text-4xl leading-none" style={{ color }}>{total}</span>
              <span className="text-xs text-muted-foreground font-bold block">/100</span>
            </div>
          </div>

          {/* Label + quick stats */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-black mb-3" style={{ backgroundColor: `${color}20`, color }}>
              <span>{emoji}</span> {label}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/40 rounded-lg px-3 py-1.5 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Matches</p>
                <p className="text-sm font-black text-foreground">{matches}</p>
              </div>
              <div className="bg-muted/40 rounded-lg px-3 py-1.5 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Goals</p>
                <p className="text-sm font-black text-foreground">{goals}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Score Breakdown</p>
          {breakdownItems.map(({ label, desc, pts, max, color: c, icon: Icon }) => (
            <div key={label}>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" style={{ color: c }} />
                  <span className="text-[12px] font-bold text-foreground">{label}</span>
                  <span className="text-[10px] text-muted-foreground">{desc}</span>
                </div>
                <span className="text-[11px] font-black" style={{ color: c }}>{pts}/{max}</span>
              </div>
              <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(pts / max) * 100}%`, backgroundColor: c }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
