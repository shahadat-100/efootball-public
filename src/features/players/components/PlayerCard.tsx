import { useState } from 'react';
import { Player } from '../types';
import { MapPin, CalendarDays, GraduationCap, Shield, Target, Star } from 'lucide-react';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { useFootballStore } from '@/store/footballStore';
import { cn } from '@/shared/lib/cn';

interface PlayerCardProps {
  player: Player;
  onView: () => void;
}

const RANK_COLORS = [
  { ring: '#f59e0b', shadow: 'rgba(245,158,11,0.35)', label: 'bg-amber-500' },   // #1
  { ring: '#94a3b8', shadow: 'rgba(148,163,184,0.30)', label: 'bg-slate-400' },  // #2
  { ring: '#b45309', shadow: 'rgba(180,83,9,0.30)',    label: 'bg-amber-700' },  // #3
];

const FORM_STYLE: Record<string, string> = {
  win:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
  draw: 'bg-amber-500/20  text-amber-400  border-amber-500/20',
  loss: 'bg-red-500/20    text-red-400    border-red-500/20',
};

export function PlayerCard({ player, onView }: PlayerCardProps) {
  const [hover, setHover] = useState(false);
  const stats = usePlayerStats(player.id);
  const { matchEntries, players, playerSeasonStats } = useFootballStore();

  const formattedBirthDate = player.dateOfBirth
    ? new Date(player.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  // ── Rank ──
  const calcPts = (s: any) =>
    s.wins * 10 + s.draws * 5 - s.losses * 3 + s.goals - s.goalsConceded + s.motmCount * 4 + s.hattricks;

  const playerRanks = players
    .map(p => ({ id: p.id, points: playerSeasonStats.filter(s => s.playerId === p.id).reduce((a, s) => a + calcPts(s), 0) }))
    .sort((a, b) => b.points - a.points);

  const rankIndex = playerRanks.findIndex(r => r.id === player.id);
  const rank = rankIndex !== -1 ? rankIndex + 1 : undefined;
  const rankStyle = rank && rank <= 3 ? RANK_COLORS[rank - 1] : null;

  // ── Form (last 5) ──
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

  // ── Win rate % for the radial progress ──
  const winRate = stats.totalMatches > 0 ? Math.round((stats.totalWins / stats.totalMatches) * 100) : 0;

  // Radial SVG vars
  const R = 28;
  const C = 2 * Math.PI * R;
  const dash = (winRate / 100) * C;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        'group relative bg-card border rounded-3xl overflow-hidden transition-all duration-400 flex flex-col shadow-md cursor-pointer',
        hover ? 'border-primary/50 shadow-glow-red -translate-y-1.5' : 'border-border'
      )}
    >
      {/* ── Ambient glow orb ── */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
        style={{ background: rankStyle?.ring ? `${rankStyle.ring}30` : 'var(--primary-transparent, rgba(99,102,241,0.15))' }}
      />

      {/* ══════════════════════════════
          HERO HEADER
      ══════════════════════════════ */}
      <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 px-5 pt-5 pb-4 flex gap-4 items-start overflow-hidden">
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 24px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 24px)' }}
        />

        {/* Avatar + radial Win-rate ring */}
        <div className="relative shrink-0 z-10">
          {/* Radial Win-rate ring */}
          <svg width="88" height="88" className="absolute inset-0 -rotate-90" style={{ top: -4, left: -4 }}>
            <circle cx="44" cy="44" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
            <circle
              cx="44" cy="44" r={R} fill="none"
              stroke={rankStyle ? rankStyle.ring : '#6366f1'}
              strokeWidth="4"
              strokeDasharray={`${dash} ${C}`}
              strokeLinecap="round"
              className="transition-all duration-700"
              style={{ opacity: hover ? 1 : 0.6 }}
            />
          </svg>
          {/* Player photo */}
          <div
            className="w-16 h-16 rounded-2xl overflow-hidden border-2 shadow-2xl transition-transform duration-300 group-hover:scale-105 relative z-10"
            style={{ borderColor: rankStyle ? rankStyle.ring : 'rgba(255,255,255,0.2)' }}
          >
            {player.profileImageUrl ? (
              <img src={player.profileImageUrl} alt={player.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                <span className="text-white font-black text-2xl">{player.name.charAt(0)}</span>
              </div>
            )}
          </div>

          {/* Rank badge */}
          {rank && rank <= 3 && (
            <div className={cn('absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-lg z-20', rankStyle?.label)}>
              {rank === 1 ? '👑' : `#${rank}`}
            </div>
          )}
          {rank && rank > 3 && (
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black bg-white/10 text-white/70 border border-white/10 z-20">
              #{rank}
            </div>
          )}
        </div>

        {/* Name + jersey + form */}
        <div className="relative z-10 flex-1 min-w-0 pt-0.5">
          <p className="font-heading font-black text-[17px] text-white tracking-wide truncate leading-tight">
            {player.name}
          </p>
          <p className="text-white/40 text-[11px] font-bold mt-0.5">
            #{player.jerseyNumber || '—'}
          </p>

          {/* Form dots */}
          {form.length > 0 && (
            <div className="flex items-center gap-1 mt-2.5">
              {form.map((r, i) => (
                <div
                  key={i}
                  className={cn('w-[22px] h-[22px] rounded-md flex items-center justify-center text-[9px] font-black border', FORM_STYLE[r] || '')}
                >
                  {r.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Win-rate label */}
        <div className="relative z-10 shrink-0 text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-0.5">Win%</p>
          <p className="font-heading font-black text-xl" style={{ color: rankStyle ? rankStyle.ring : '#6366f1' }}>
            {winRate}%
          </p>
        </div>
      </div>

      {/* ══════════════════════════════
          STATS ROW
      ══════════════════════════════ */}
      <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
        {[
          { label: 'MP',    value: stats.totalMatches,    color: '#6366f1', icon: Shield },
          { label: 'Goals', value: stats.totalGoals,      color: '#10b981', icon: Target },
          { label: 'CS',    value: stats.totalCleanSheets,color: '#3b82f6', icon: Shield },
          { label: 'MOTM',  value: stats.totalMOTM,       color: '#f59e0b', icon: Star },
        ].map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center py-3 hover:bg-muted/40 transition-colors"
          >
            <Icon className="w-3 h-3 mb-1 opacity-60" style={{ color }} />
            <p className="font-heading font-black text-base leading-none" style={{ color }}>{value}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════
          BODY
      ══════════════════════════════ */}
      <div className="p-4 flex-1 flex flex-col gap-3">

        {/* Roles + tags */}
        {((player.playerRoles ?? []).length > 0 || (player.customTags ?? []).length > 0 || (player.customStringTags ?? []).length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {(player.playerRoles ?? []).slice(0, 2).map(t => (
              <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{t}</span>
            ))}
            {(player.customTags ?? []).slice(0, 2).map(t => (
              <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">{t}</span>
            ))}
            {(player.customStringTags ?? []).slice(0, 1).map(t => (
              <span key={`str-${t}`} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{t}</span>
            ))}
          </div>
        )}

        {/* Info pills */}
        <div className="space-y-1.5">
          {formattedBirthDate && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <CalendarDays className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="font-medium text-foreground truncate">{formattedBirthDate}</span>
            </div>
          )}
          {player.education && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-medium text-foreground truncate">{player.education}</span>
            </div>
          )}
          {player.location && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-medium text-foreground truncate">{player.location}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-auto pt-3 border-t border-border/50">
          <button
            onClick={onView}
            className="w-full rounded-xl py-2.5 text-[12px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
            style={{
              background: hover
                ? 'linear-gradient(90deg, var(--primary), #a855f7)'
                : 'rgba(99,102,241,0.1)',
              color: hover ? '#fff' : 'var(--primary)',
              border: '1.5px solid rgba(99,102,241,0.3)',
              boxShadow: hover ? '0 4px 20px rgba(99,102,241,0.4)' : 'none',
            }}
          >
            View Profile
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
