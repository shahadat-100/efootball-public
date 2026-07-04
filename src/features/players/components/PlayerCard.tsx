import { useState } from 'react';
import { Player } from '../types';
import { Badge } from '@/shared/components';
import { MapPin, CalendarDays, GraduationCap } from 'lucide-react';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { useFootballStore } from '@/store/footballStore';
import { cn } from '@/shared/lib/cn';

interface PlayerCardProps {
  player: Player;
  onView: () => void;
}

export function PlayerCard({ player, onView }: PlayerCardProps) {
  const [hover, setHover] = useState(false);
  const stats = usePlayerStats(player.id);
  const { matchEntries, players, playerSeasonStats } = useFootballStore();

  const formattedBirthDate = player.dateOfBirth
    ? new Date(player.dateOfBirth).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : null;

  // ── Rank ──
  const calcPts = (s: any) =>
    s.wins * 10 + s.draws * 5 - s.losses * 3 + s.goals - s.goalsConceded + s.motmCount * 4 + s.hattricks;

  const playerRanks = players
    .map(p => ({ id: p.id, points: playerSeasonStats.filter(s => s.playerId === p.id).reduce((a, s) => a + calcPts(s), 0) }))
    .sort((a, b) => b.points - a.points);

  const rankIndex = playerRanks.findIndex(r => r.id === player.id);
  const rank = rankIndex !== -1 ? rankIndex + 1 : undefined;

  const rankLabel =
    rank === 1 ? { text: '🥇 #1', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' } :
    rank === 2 ? { text: '🥈 #2', cls: 'bg-slate-400/20 text-slate-300 border-slate-400/30' } :
    rank === 3 ? { text: '🥉 #3', cls: 'bg-amber-700/20 text-amber-600 border-amber-700/30' } :
    rank    ? { text: `#${rank}`, cls: 'bg-muted text-muted-foreground border-border' } :
    null;

  // ── Last 5 form ──
  const form = matchEntries
    .filter(e => e.playerId === player.id && e.result)
    .sort((a, b) => {
      const ta = new Date(a.time ? `${a.date}T${a.time}` : `${a.date}T00:00:00`).getTime() || 0;
      const tb = new Date(b.time ? `${b.date}T${b.time}` : `${b.date}T00:00:00`).getTime() || 0;
      return tb !== ta ? tb - ta : String(b.id).localeCompare(String(a.id));
    })
    .slice(0, 5)
    .map(e => e.result!)
    .reverse();

  const winRate = stats.totalMatches > 0
    ? Math.round((stats.totalWins / stats.totalMatches) * 100)
    : 0;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onView}
      className={cn(
        'relative bg-card border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col cursor-pointer group',
        hover ? 'border-primary/40 shadow-xl -translate-y-1' : 'border-border shadow-sm'
      )}
    >
      {/* ── HEADER ── */}
      <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-5 pb-4">
        {/* Subtle dot texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />
        {/* Glow on hover */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent transition-opacity duration-300',
          hover ? 'opacity-100' : 'opacity-0'
        )} />

        <div className="relative z-10 flex items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className={cn(
              'w-[68px] h-[68px] rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-lg',
              hover ? 'border-primary/60 scale-105' : 'border-white/10'
            )}>
              {player.profileImageUrl ? (
                <img src={player.profileImageUrl} alt={player.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center">
                  <span className="text-white font-black text-2xl">{player.name.charAt(0)}</span>
                </div>
              )}
            </div>
            {/* Jersey badge */}
            {player.jerseyNumber && (
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-md">
                {player.jerseyNumber}
              </div>
            )}
          </div>

          {/* Name + rank + form */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-heading font-black text-[17px] text-white leading-tight truncate">
                {player.name}
              </h3>
              {rankLabel && (
                <span className={cn('shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full border', rankLabel.cls)}>
                  {rankLabel.text}
                </span>
              )}
            </div>

            {/* Form dots */}
            {form.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                {form.map((r, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-[20px] h-[20px] rounded flex items-center justify-center text-[8px] font-black',
                      r === 'win'  ? 'bg-emerald-500/30 text-emerald-400' :
                      r === 'draw' ? 'bg-amber-500/30  text-amber-400' :
                                     'bg-red-500/30    text-red-400'
                    )}
                  >
                    {r[0].toUpperCase()}
                  </div>
                ))}
                <span className="text-[10px] text-white/30 font-medium ml-1">Last 5</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div className="grid grid-cols-4 border-b border-border">
        {[
          { label: 'MP',    value: stats.totalMatches,     color: '#818cf8' },
          { label: 'Goals', value: stats.totalGoals,       color: '#34d399' },
          { label: 'MOTM',  value: stats.totalMOTM,        color: '#fbbf24' },
          { label: 'Win%',  value: `${winRate}%`,          color: '#38bdf8' },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center py-3 hover:bg-muted/30 transition-colors">
            <span className="font-heading font-black text-lg leading-none" style={{ color: s.color }}>
              {s.value}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── BODY ── */}
      <div className="p-4 flex-1 flex flex-col gap-3">

        {/* Roles / Tags */}
        {((player.playerRoles?.length ?? 0) > 0 || (player.customTags?.length ?? 0) > 0 || (player.customStringTags?.length ?? 0) > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {(player.playerRoles ?? []).slice(0, 2).map(t => (
              <Badge key={t} bg="#1e1b4b" c="#a5b4fc">{t}</Badge>
            ))}
            {(player.customTags ?? []).slice(0, 2).map(t => (
              <Badge key={t} bg="#1a1a1a" c="#9ca3af">{t}</Badge>
            ))}
            {(player.customStringTags ?? []).slice(0, 1).map(t => (
              <Badge key={`str-${t}`} bg="#0c1a2e" c="#60a5fa">{t}</Badge>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="space-y-1.5 text-[11px]">
          {formattedBirthDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-foreground font-medium truncate">{formattedBirthDate}</span>
            </div>
          )}
          {player.education && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-foreground font-medium truncate">{player.education}</span>
            </div>
          )}
          {player.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-foreground font-medium truncate">{player.location}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={e => { e.stopPropagation(); onView(); }}
          className={cn(
            'mt-auto w-full py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest border transition-all duration-300',
            hover
              ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
              : 'bg-transparent text-primary border-primary/30 hover:bg-primary/10'
          )}
        >
          View Profile →
        </button>
      </div>
    </div>
  );
}
