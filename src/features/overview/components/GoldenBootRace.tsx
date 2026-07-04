import { useEffect, useState, useMemo } from 'react';
import { Player, PlayerSeasonStat, SeasonDb } from '@/features/players/types';
import { Avatar } from '@/shared/components';
import { Crown, Flame, Target, ChevronUp } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface GoldenBootRaceProps {
  players: Player[];
  playerSeasonStats: PlayerSeasonStat[];
  seasons: SeasonDb[];
}

export function GoldenBootRace({ players, playerSeasonStats, seasons }: GoldenBootRaceProps) {
  const [animate, setAnimate] = useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);

  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 80);
    return () => clearTimeout(t);
  }, [selectedSeasonId]);

  const scorers = useMemo(() => {
    return players
      .map(p => {
        const stats = playerSeasonStats.filter(s =>
          s.playerId === p.id &&
          (selectedSeasonId === null || s.seasonId === selectedSeasonId)
        );
        const goals = stats.reduce((acc, s) => acc + (s.goals || 0), 0);
        return { player: p, goals };
      })
      .filter(s => s.goals > 0)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 5);
  }, [players, playerSeasonStats, selectedSeasonId]);

  if (scorers.length === 0) return null;

  const leader = scorers[0];
  const chasers = scorers.slice(1);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
      {/* Gold glow behind leader */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-foreground tracking-tight">Golden Boot Race</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Who will score next?</p>
          </div>
        </div>
        <select
          value={selectedSeasonId ?? ''}
          onChange={e => setSelectedSeasonId(e.target.value === '' ? null : Number(e.target.value))}
          className="text-xs bg-muted border border-border rounded-lg px-3 py-1.5 text-foreground font-medium focus:outline-none cursor-pointer"
        >
          <option value="">All Time</option>
          {seasons.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* ─── LEADER (the King) ─── */}
      <div className="relative z-10 flex items-center gap-4 p-4 rounded-2xl mb-5 border"
        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))', borderColor: 'rgba(245,158,11,0.3)' }}>
        {/* Crown badge */}
        <div className="absolute -top-3 left-6 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
          <Crown className="w-3 h-3" /> Leader
        </div>
        <div className="relative">
          <Avatar
            src={leader.player.profileImageUrl}
            name={leader.player.name}
            size={64}
            className="ring-4 ring-amber-400/50 shadow-xl"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-xs font-black text-white shadow">
            1
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-black text-xl text-foreground truncate">{leader.player.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-black text-amber-500 leading-none">{leader.goals}</span>
            <span className="text-sm font-bold text-amber-500/70 uppercase tracking-widest">Goals</span>
          </div>
        </div>
        <div className="shrink-0 text-amber-400 opacity-40 text-5xl select-none">🥇</div>
      </div>

      {/* ─── CHASERS ─── */}
      <div className="relative z-10 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-4">
          <Flame className="w-3 h-3 text-orange-400" /> Chasers
        </p>
        {chasers.map((s, i) => {
          const rank = i + 2;
          const gap = leader.goals - s.goals;
          const progress = animate ? (s.goals / leader.goals) * 100 : 0;
          const isClose = gap <= 3;

          return (
            <div key={s.player.id} className={cn(
              "rounded-xl p-3 border transition-all duration-300",
              isClose ? "border-orange-500/30 bg-orange-500/5" : "border-border bg-background/40"
            )}>
              <div className="flex items-center gap-3 mb-2">
                {/* Rank */}
                <div className={cn(
                  "w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shrink-0",
                  rank === 2 ? "bg-slate-400/20 text-slate-300" :
                  rank === 3 ? "bg-amber-700/20 text-amber-700" :
                  "bg-muted text-muted-foreground"
                )}>
                  {rank}
                </div>
                <Avatar src={s.player.profileImageUrl} name={s.player.name} size={36} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-foreground truncate">{s.player.name}</p>
                  {isClose && (
                    <div className="flex items-center gap-1 text-[10px] font-black text-orange-400 uppercase tracking-widest">
                      <ChevronUp className="w-3 h-3" />
                      Only {gap} goal{gap !== 1 ? 's' : ''} behind!
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="font-black text-lg text-foreground">{s.goals}</span>
                  <p className="text-[10px] text-muted-foreground font-medium">-{gap}</p>
                </div>
              </div>

              {/* Progress bar to catch the leader */}
              <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: isClose
                      ? 'linear-gradient(90deg, #f97316, #ef4444)'
                      : rank === 2
                        ? 'linear-gradient(90deg, #94a3b8, #cbd5e1)'
                        : 'linear-gradient(90deg, var(--primary), var(--primary))',
                  }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[9px] font-bold text-muted-foreground">
                <span>{s.goals} goals</span>
                <span>Target: {leader.goals}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
