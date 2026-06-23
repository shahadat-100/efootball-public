import { useMemo } from 'react';
import { Player, PlayerSeasonStat } from '@/features/players/types';
import { Avatar } from '@/shared/components';
import { cn } from '@/shared/lib/cn';
import { Trophy } from 'lucide-react';

interface OverviewPointsLeaderboardProps {
  players: Player[];
  playerSeasonStats: PlayerSeasonStat[];
  onViewAll?: () => void;
}

interface RankedPlayer {
  player: Player;
  points: number;
  wins: number;
  matches: number;
}

export function OverviewPointsLeaderboard({
  players,
  playerSeasonStats,
  onViewAll,
}: OverviewPointsLeaderboardProps) {
  const ranked = useMemo<RankedPlayer[]>(() => {
    return players
      .map((p) => {
        const stats = playerSeasonStats.filter((s) => s.playerId === p.id);
        const wins   = stats.reduce((t, s) => t + s.wins,   0);
        const draws  = stats.reduce((t, s) => t + s.draws,  0);
        const losses = stats.reduce((t, s) => t + s.losses, 0);
        const gf     = stats.reduce((t, s) => t + s.goals,  0);
        const gc     = stats.reduce((t, s) => t + (s.goalsConceded || 0), 0);
        const motm   = stats.reduce((t, s) => t + (s.motmCount  || 0), 0);
        const ht     = stats.reduce((t, s) => t + (s.hattricks  || 0), 0);
        const matches = wins + draws + losses;
        const points  = wins * 3 + draws - losses + gf - gc + motm * 2 + ht;
        return { player: p, points, wins, matches };
      })
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);
  }, [players, playerSeasonStats]);

  const medalCls = (i: number) =>
    i === 0 ? 'medal-gold' :
    i === 1 ? 'medal-silver' :
    i === 2 ? 'medal-bronze' :
    'bg-muted/60 text-muted-foreground/70 text-[10px]';

  const rowAccent = (i: number) =>
    i === 0 ? 'border-amber-500/30 bg-amber-500/5' :
    i === 1 ? 'border-slate-400/30 bg-slate-400/5' :
    i === 2 ? 'border-orange-700/30 bg-orange-700/5' :
    'border-border/60 bg-card';

  const isEmpty = ranked.length === 0 || ranked.every((r) => r.points === 0 && r.matches === 0);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h2 className="font-bold text-base text-foreground tracking-tight">Points Leaderboard</h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">All Time</span>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            View All →
          </button>
        )}
      </div>

      {/* Rank list */}
      {isEmpty ? (
        <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
          <span className="text-3xl">📊</span>
          <p className="text-sm font-medium">No data yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {ranked.map((r, i) => (
            <div
              key={r.player.id}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors hover:brightness-105',
                rowAccent(i)
              )}
            >
              {/* Rank badge */}
              <div
                className={cn(
                  'w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-black shrink-0 shadow-sm',
                  medalCls(i)
                )}
              >
                {i + 1}
              </div>

              {/* Avatar + Name */}
              <Avatar
                name={r.player.name}
                size={30}
                src={(r.player as any).profileImageUrl}
              />
              <span
                className={cn(
                  'flex-1 font-semibold text-[13px] text-foreground truncate',
                  i < 3 && 'font-bold'
                )}
              >
                {r.player.name}
              </span>

              {/* Stats pill */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-muted-foreground font-medium">
                  {r.matches}G · {r.wins}W
                </span>
                <span
                  className={cn(
                    'font-black text-[13px] px-2.5 py-0.5 rounded-lg border shadow-sm min-w-[44px] text-center',
                    r.points > 0
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : r.points < 0
                      ? 'bg-red-500/10 text-red-500 border-red-500/20'
                      : 'bg-muted text-muted-foreground border-border'
                  )}
                >
                  {r.points > 0 ? `+${r.points}` : r.points}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
