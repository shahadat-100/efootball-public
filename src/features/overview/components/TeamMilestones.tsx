import { useMemo } from 'react';
import { PlayerSeasonStat } from '@/features/players/types';
import { Target, Trophy, Activity, ArrowRight } from 'lucide-react';

interface TeamMilestonesProps {
  playerSeasonStats: PlayerSeasonStat[];
}

const MILESTONE_STEPS = [10, 50, 100, 250, 500, 1000, 2000, 5000];

function getNextMilestone(current: number) {
  const next = MILESTONE_STEPS.find(s => s > current);
  return next || (Math.ceil(current / 1000) * 1000 + 1000);
}

export function TeamMilestones({ playerSeasonStats }: TeamMilestonesProps) {
  const stats = useMemo(() => {
    let goals = 0;
    let wins = 0;
    let matches = 0;
    
    // playerSeasonStats represents total stats accrued by each player in each season.
    // However, if multiple players play in one match, wins/matches might be double counted.
    // For milestones, this is fine as "Player Wins" or "Player Appearances" or we can label them appropriately.
    playerSeasonStats.forEach(s => {
      goals += (s.goals || 0);
      wins += (s.wins || 0);
      matches += (s.appearances || 0);
    });
    
    return { goals, wins, matches };
  }, [playerSeasonStats]);

  const milestones = [
    { 
      label: 'All-Time Goals', 
      current: stats.goals, 
      target: getNextMilestone(stats.goals), 
      icon: Target,
      color: '#10b981', // emerald
      bg: 'rgba(16,185,129,0.1)'
    },
    { 
      label: 'All-Time Wins', 
      current: stats.wins, 
      target: getNextMilestone(stats.wins), 
      icon: Trophy,
      color: '#3b82f6', // blue
      bg: 'rgba(59,130,246,0.1)'
    },
    { 
      label: 'Player Appearances', 
      current: stats.matches, 
      target: getNextMilestone(stats.matches), 
      icon: Activity,
      color: '#8b5cf6', // purple
      bg: 'rgba(139,92,246,0.1)'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-heading font-black text-xl text-foreground tracking-tight">Team Milestones</h3>
          <p className="text-xs font-bold text-muted-foreground mt-1">Tracking the club's journey to greatness</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {milestones.map((m, idx) => {
          const Icon = m.icon;
          // Calculate percentage based on previous milestone to show actual progress to NEXT step
          const prevStepIndex = MILESTONE_STEPS.indexOf(m.target) - 1;
          const prevStep = prevStepIndex >= 0 ? MILESTONE_STEPS[prevStepIndex] : 0;
          
          const progress = Math.max(0, Math.min(100, ((m.current - prevStep) / (m.target - prevStep)) * 100));

          return (
            <div key={idx} className="relative">
              <div className="flex justify-between items-end mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: m.bg, color: m.color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{m.label}</p>
                    <p className="font-heading font-black text-2xl leading-none text-foreground mt-1">
                      {m.current.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-[11px] font-bold" style={{ color: m.color }}>
                    Target <ArrowRight className="w-3 h-3" /> {m.target.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full rounded-full transition-all duration-1000 relative"
                  style={{ width: `${progress}%`, backgroundColor: m.color }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <p className="text-[10px] font-bold text-muted-foreground mt-2 text-right">
                {m.target - m.current} remaining
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
