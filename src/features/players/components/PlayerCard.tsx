import { useState } from 'react';
import { Player } from '../types';
import { Avatar, Badge, Button } from '@/shared/components';
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

  // Calculate rank
  const calcSeasonPoints = (s: any) =>
    (s.wins * 3) + s.draws - s.losses + s.goals - s.goalsConceded + (s.motmCount * 2) + s.hattricks;

  const playerRanks = players.map(p => {
    const pStats = playerSeasonStats.filter(s => s.playerId === p.id);
    const totalPoints = pStats.reduce((acc, s) => acc + calcSeasonPoints(s), 0);
    return { id: p.id, points: totalPoints };
  }).sort((a, b) => b.points - a.points);

  const rankIndex = playerRanks.findIndex(r => r.id === player.id);
  const rank = rankIndex !== -1 ? rankIndex + 1 : undefined;

  // Form dots (last 5)
  const form = matchEntries
    .filter(e => e.playerId === player.id && e.result)
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 5)
    .map(e => e.result!)
    .reverse();

  return (
    <div 
      onMouseEnter={() => setHover(true)} 
      onMouseLeave={() => setHover(false)}
      className={cn(
        "bg-card border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col items-stretch shadow-sm",
        hover ? "border-primary/40 shadow-glow-red -translate-y-1" : "border-border"
      )}
    >
      {/* Gradient header area */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-5 flex items-center gap-4">
        {/* Decorative pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50" />
        
        <div className="relative z-10">
          <Avatar 
            name={player.name} 
            size={72} 
            src={player.profileImageUrl} 
            className={cn(
              "ring-3 ring-offset-2 ring-offset-gray-900 shadow-xl transition-transform duration-300",
              hover ? "scale-105 ring-primary" : "ring-white/20"
            )}
          />
          {/* Rank badge */}
          {rank && (
            <div className={cn(
              "absolute -top-1 -left-1 w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shadow-lg z-20",
              rank === 1 ? "medal-gold" :
              rank === 2 ? "medal-silver" :
              rank === 3 ? "medal-bronze" :
              "bg-white/10 text-white/80 border border-white/10"
            )}>
              #{rank}
            </div>
          )}
        </div>
        
        <div className="relative z-10 flex-1 min-w-0">
          <p className="font-heading font-bold text-[18px] text-white tracking-wide truncate">{player.name}</p>
          <p className="text-white/50 text-[12px] font-bold">👕 {player.jerseyNumber || '—'}</p>
          
          {/* Form streak */}
          {form.length > 0 && (
            <div className="flex gap-1 mt-2">
              {form.map((r, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black shadow-sm",
                    r === 'win' ? 'bg-emerald-500/30 text-emerald-300' :
                    r === 'draw' ? 'bg-amber-500/30 text-amber-300' :
                    'bg-red-500/30 text-red-300'
                  )}
                >
                  {r.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: 'MP',   value: stats.totalMatches, color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
            { label: 'Goals',value: stats.totalGoals,   color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
            { label: 'MOTM', value: stats.totalMOTM,    color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
          ].map(({ label, value, color, bg }) => (
            <div
              key={label}
              className="rounded-xl p-2.5 text-center transition-transform hover:scale-[1.03]"
              style={{ background: bg, border: `1.5px solid ${color}20` }}
            >
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{label}</p>
              <p className="text-[20px] font-heading font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {(player.playerRoles ?? []).slice(0, 3).map(t => (
            <Badge key={t} bg="#1a1a1a" c="#e5e5e5">{t}</Badge>
          ))}
          {(player.customTags ?? []).slice(0, 2).map(t => (
            <Badge key={t} bg="#4b5563" c="#e5e7eb">{t}</Badge>
          ))}
          {(player.customStringTags ?? []).slice(0, 2).map(t => (
            <Badge key={`str-${t}`} bg="#1e3a5f" c="#93c5fd">{t}</Badge>
          ))}
        </div>

        {stats.seasonBreakdown.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {stats.seasonBreakdown.map(sb => (
               <span key={sb.year} className="text-[10px] border border-border bg-muted/50 px-1.5 py-0.5 rounded-md text-muted-foreground font-medium">
                 {sb.year}: {sb.goals}g
               </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 justify-between mt-auto pt-3 border-t border-border/50">
          <Button size="sm" onClick={onView} className="flex-1">View Profile →</Button>
        </div>
      </div>
    </div>
  );
}
