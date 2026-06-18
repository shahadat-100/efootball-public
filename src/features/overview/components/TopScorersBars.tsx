import { useEffect, useState, useMemo } from 'react';
import { Avatar } from '@/shared/components';
import { Player, PlayerSeasonStat, SeasonDb } from '@/features/players/types';
import { MatchEntry } from '@/features/match-entries/types';
import { PlayerFormDots } from './PlayerFormDots';
import { cn } from '@/shared/lib/cn';

interface TopScorersBarsProps {
  players: Player[];
  playerSeasonStats: PlayerSeasonStat[];
  seasons: SeasonDb[];
  matchEntries: MatchEntry[];
}

export function TopScorersBars({ players, playerSeasonStats, seasons, matchEntries }: TopScorersBarsProps) {
  const [animate, setAnimate] = useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);

  // Re-animate bars whenever season changes
  useEffect(() => {
    setAnimate(false);
    const timer = setTimeout(() => setAnimate(true), 60);
    return () => clearTimeout(timer);
  }, [selectedSeasonId]);

  const scorers = useMemo(() => {
    return players
      .map(p => {
        const stats = playerSeasonStats.filter(s =>
          s.playerId === p.id &&
          (selectedSeasonId === null || s.seasonId === selectedSeasonId)
        );
        const goals = stats.reduce((acc, s) => acc + (s.goals || 0), 0);

        // Form dots always show last 5 results regardless of season filter
        const form = matchEntries
          .filter(e => e.playerId === p.id && e.result)
          .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
          .slice(0, 5)
          .map(e => e.result!)
          .reverse();

        return { player: p, goals, form };
      })
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 10)
      .filter(s => s.goals > 0);
  }, [players, playerSeasonStats, matchEntries, selectedSeasonId]);

  const maxGoals = Math.max(...scorers.map(s => s.goals), 1);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full relative overflow-hidden group">
      {/* Decorative background blur */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <p className="font-semibold text-base text-foreground tracking-tight">Top Scorers</p>
        <select
          value={selectedSeasonId ?? ''}
          onChange={e => setSelectedSeasonId(e.target.value === '' ? null : Number(e.target.value))}
          className="text-xs bg-muted border border-border rounded-lg px-3 py-2 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm"
        >
          <option value="">All Seasons</option>
          {seasons.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {scorers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center relative z-10">
          <p className="text-muted-foreground text-sm">No goal data yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 flex-1 justify-center relative z-10">
          {scorers.map(({ player, goals, form }, i) => {
            const widthPercent = (goals / maxGoals) * 100;
            const isTop3 = i < 3;
            
            return (
              <div key={player.id} className="flex items-center gap-4 group/row">
                <div className={cn(
                  "font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0 shadow-sm transition-transform group-hover/row:scale-110",
                  i === 0 ? "medal-gold" : 
                  i === 1 ? "medal-silver" : 
                  i === 2 ? "medal-bronze" : 
                  "bg-muted text-muted-foreground"
                )}>
                  {i + 1}
                </div>
                
                <div className="relative">
                  <Avatar name={player.name} size={36} src={(player as any).profileImageUrl} className={cn(isTop3 && "ring-2 ring-offset-1 ring-offset-background", i === 0 ? "ring-amber-400" : i === 1 ? "ring-slate-300" : i === 2 ? "ring-amber-700" : "ring-transparent")} />
                </div>

                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[13px] font-bold text-foreground truncate">{player.name}</span>
                      {form.length > 0 && <PlayerFormDots results={form} />}
                    </div>
                    <span className={cn(
                      "text-sm font-black transition-colors",
                      i === 0 ? "text-amber-500" : i === 1 ? "text-slate-500" : i === 2 ? "text-amber-700" : "text-foreground"
                    )}>{goals}</span>
                  </div>
                  <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 ease-out",
                        i === 0 ? "bg-gradient-to-r from-amber-400 to-amber-500" :
                        i === 1 ? "bg-gradient-to-r from-slate-300 to-slate-400" :
                        i === 2 ? "bg-gradient-to-r from-amber-600 to-amber-700" :
                        "bg-gradient-to-r from-primary/80 to-primary"
                      )}
                      style={{ width: animate ? `${widthPercent}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
