import { useMemo } from 'react';
import { MatchEntry } from '@/features/match-entries/types';
import { Gauge, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PlayerImpactGaugeProps {
  entries: MatchEntry[];
}

export function PlayerImpactGauge({ entries }: PlayerImpactGaugeProps) {
  const score = useMemo(() => {
    if (!entries || entries.length === 0) return 0;
    
    let wins = 0;
    let goals = 0;
    let specials = 0; // motm, cleansheet, hattricks

    entries.forEach(e => {
      if (e.result === 'win') wins++;
      goals += (e.goals || 0);
      if (e.motm) specials += 2;
      if (e.cleanSheet) specials += 1;
      if (e.hattricks && e.hattricks > 0) specials += 3;
    });

    const matches = entries.length;

    // 1. Win Rate (Max 40 points)
    const winRatePts = (wins / matches) * 40;

    // 2. Goal Scoring (Max 40 points) - Benchmark: 1.2 goals per game = 40 points
    const goalsPerGame = goals / matches;
    const goalPts = Math.min((goalsPerGame / 1.2) * 40, 40);

    // 3. Specials (Max 20 points) - Benchmark: 0.5 specials per game = 20 points
    const specialsPerGame = specials / matches;
    const specialPts = Math.min((specialsPerGame / 0.5) * 20, 20);

    const total = Math.round(winRatePts + goalPts + specialPts);
    return Math.min(Math.max(total, 0), 100);
  }, [entries]);

  // Determine color based on score
  let color = '#ef4444'; // Red
  let label = 'Needs Improvement';
  if (score >= 85) { color = '#10b981'; label = 'Elite Tier 🌟'; }
  else if (score >= 70) { color = '#3b82f6'; label = 'Match Winner 🔥'; }
  else if (score >= 50) { color = '#f59e0b'; label = 'Solid Performer'; }

  const data = [
    { name: 'Score', value: score, color: color },
    { name: 'Remaining', value: 100 - score, color: 'rgba(255,255,255,0.05)' }
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
      {/* Decorative background glow based on score */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 group-hover:opacity-40 group-hover:scale-110"
        style={{ backgroundColor: color }}
      />
      
      <div className="mb-2 flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-background/50 border border-border flex items-center justify-center">
          <Gauge className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <h3 className="font-heading font-black text-xl text-foreground tracking-tight">Overall Impact</h3>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Calculated Performance Metric</p>
        </div>
      </div>

      <div className="relative h-[220px] w-full flex items-center justify-center -mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="75%" // Shift down since it's a half circle
              startAngle={180}
              endAngle={0}
              innerRadius="75%"
              outerRadius="100%"
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              cornerRadius={8}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Score Display inside the gauge */}
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="font-heading font-black text-5xl tracking-tighter" style={{ color }}>
            {score}
          </span>
          <div className="flex items-center gap-1 mt-1 bg-background/80 px-3 py-1 rounded-full border border-border shadow-sm">
            {score >= 70 && <Zap className="w-3 h-3" style={{ color }} />}
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
              {label}
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-2 relative z-10">
        <p className="text-xs text-muted-foreground font-medium">
          Based on Win Rate, Goals, and Special Match Events
        </p>
      </div>
    </div>
  );
}
