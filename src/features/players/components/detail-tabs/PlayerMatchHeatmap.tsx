import { useMemo } from 'react';
import { MatchEntry } from '@/features/match-entries/types';
import { CalendarDays } from 'lucide-react';

interface PlayerMatchHeatmapProps {
  entries: MatchEntry[];
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function PlayerMatchHeatmap({ entries }: PlayerMatchHeatmapProps) {
  const dayStats = useMemo(() => {
    // Initialize stats for 7 days
    const stats = Array(7).fill(0).map((_, i) => ({
      dayIndex: i,
      name: DAYS_OF_WEEK[i],
      shortName: DAY_SHORT[i],
      matches: 0,
      wins: 0,
      goals: 0,
    }));

    entries.forEach(e => {
      if (!e.date) return;
      // The date is YYYY-MM-DD
      const date = new Date(e.date);
      if (isNaN(date.getTime())) return;
      
      const dayIndex = date.getDay();
      stats[dayIndex].matches += 1;
      stats[dayIndex].goals += (e.goals || 0);
      if (e.result === 'win') {
        stats[dayIndex].wins += 1;
      }
    });

    return stats;
  }, [entries]);

  // Find max values for scaling the bars
  const maxMatches = Math.max(1, ...dayStats.map(d => d.matches));

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <CalendarDays className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading font-black text-xl text-foreground tracking-tight">Performance by Day</h3>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">When is the player most active?</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {dayStats.map((stat) => {
          const matchPct = (stat.matches / maxMatches) * 100;
          const winRate = stat.matches > 0 ? Math.round((stat.wins / stat.matches) * 100) : 0;
          
          return (
            <div key={stat.dayIndex} className="flex items-center gap-4 group">
              <div className="w-10 text-right shrink-0">
                <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                  {stat.shortName}
                </span>
              </div>
              
              <div className="flex-1 h-8 bg-muted/40 rounded-lg overflow-hidden relative flex items-center">
                {stat.matches > 0 && (
                  <div 
                    className="h-full bg-primary/20 absolute left-0 top-0 rounded-lg transition-all duration-500"
                    style={{ width: `${matchPct}%` }}
                  >
                    <div 
                      className="h-full bg-primary absolute left-0 top-0 rounded-lg"
                      style={{ width: `${winRate}%` }}
                    />
                  </div>
                )}
                <div className="relative z-10 flex justify-between w-full px-3 text-[10px] font-bold">
                  <span className={stat.matches > 0 ? "text-foreground" : "text-muted-foreground"}>
                    {stat.matches} Matches
                  </span>
                  {stat.matches > 0 && (
                    <span className="text-foreground">
                      {stat.goals} Goals • {winRate}% WR
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary/20" /> Total Matches
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary" /> Wins
        </div>
      </div>
    </div>
  );
}
