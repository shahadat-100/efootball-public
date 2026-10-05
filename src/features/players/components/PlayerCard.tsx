import { useState } from 'react';
import { Player } from '../types';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { useFootballStore } from '@/store/footballStore';
import { cn } from '@/shared/lib/cn';

interface PlayerCardProps {
  player: Player;
  onView: () => void;
}

const RANK_CONFIG: Record<number, { glow: string; badge: string; label: string; accent: string }> = {
  1: { glow: 'rgba(251,191,36,0.35)', badge: '#F59E0B', label: '#1', accent: '#FDE68A' },
  2: { glow: 'rgba(148,163,184,0.3)',  badge: '#94A3B8', label: '#2', accent: '#CBD5E1' },
  3: { glow: 'rgba(180,83,9,0.3)',     badge: '#B45309', label: '#3', accent: '#FCD34D' },
};

export function PlayerCard({ player, onView }: PlayerCardProps) {
  const [hovered, setHovered] = useState(false);
  const stats = usePlayerStats(player.id);
  const { players, playerSeasonStats, matchEntries } = useFootballStore();

  // ── Rank calculation ──
  const calcPts = (s: any) =>
    s.wins * 10 + s.draws * 5 - s.losses * 3 + s.goals - s.goalsConceded + s.motmCount * 4 + s.hattricks;

  const playerRanks = players
    .map(p => ({ id: p.id, pts: playerSeasonStats.filter(s => s.playerId === p.id).reduce((a, s) => a + calcPts(s), 0) }))
    .sort((a, b) => b.pts - a.pts);

  const rankIdx = playerRanks.findIndex(r => r.id === player.id);
  const rank = rankIdx !== -1 ? rankIdx + 1 : null;
  const totalPoints = rankIdx !== -1 ? playerRanks[rankIdx].pts : 0;
  const rankCfg = rank && rank <= 3 ? RANK_CONFIG[rank] : null;

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

  const accentColor = rankCfg ? rankCfg.badge : '#6366F1';
  const glowColor   = rankCfg ? rankCfg.glow  : 'rgba(99,102,241,0.25)';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onView}
      className="relative cursor-pointer select-none"
      style={{
        borderRadius: '20px',
        transition: 'transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease',
        transform: hovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? `0 24px 48px ${glowColor}, 0 0 0 1px ${accentColor}55, 0 8px 20px rgba(0,0,0,0.6)`
          : '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      {/* ── Card Shell ── */}
      <div
        className="relative overflow-hidden flex flex-col"
        style={{
          borderRadius: '20px',
          background: 'linear-gradient(160deg, #1a1a2e 0%, #0f0f1a 40%, #0a0a14 100%)',
          border: `1px solid ${accentColor}33`,
          minHeight: '340px',
        }}
      >
        {/* ── Background hex / noise texture ── */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='1.5' fill='%23fff'/%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px',
          }}
        />

        {/* ── Glow orb top-left ── */}
        <div
          className="absolute top-0 left-0 w-40 h-40 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${accentColor}30 0%, transparent 70%)`,
            filter: 'blur(30px)',
          }}
        />

        {/* ── Rank badge (top-right corner) ── */}
        {rank && (
          <div
            className="absolute top-3 right-3 z-20 flex items-center justify-center font-black text-[13px] rounded-full"
            style={{
              width: 36,
              height: 36,
              background: rankCfg
                ? `linear-gradient(135deg, ${rankCfg.badge}, ${rankCfg.accent})`
                : 'rgba(255,255,255,0.08)',
              color: rankCfg ? '#000' : '#fff',
              boxShadow: rankCfg ? `0 2px 12px ${rankCfg.glow}` : 'none',
              border: '2px solid rgba(255,255,255,0.15)',
            }}
          >
            {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : `#${rank}`}
          </div>
        )}

        {/* ── Player image area ── */}
        <div className="relative flex-1" style={{ minHeight: 200 }}>
          {/* Bottom gradient sweep */}
          <div
            className="absolute bottom-0 left-0 right-0 z-10"
            style={{
              height: '55%',
              background: `linear-gradient(to top, #0a0a14 0%, #0a0a1490 40%, transparent 100%)`,
            }}
          />
          {/* Accent sweep stripe */}
          <div
            className="absolute bottom-0 left-0 right-0 z-10"
            style={{
              height: '3px',
              background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            }}
          />

          {player.profileImageUrl ? (
            <img
              src={player.profileImageUrl}
              alt={player.name}
              className="absolute inset-0 w-full h-full object-cover object-top"
              style={{ filter: hovered ? 'brightness(1.05)' : 'brightness(0.92)' }}
            />
          ) : (
            /* Fallback avatar */
            <div
              className="absolute inset-0 flex items-end justify-center pb-6"
              style={{
                background: `linear-gradient(160deg, ${accentColor}15 0%, transparent 100%)`,
              }}
            >
              <div
                className="flex items-center justify-center font-black text-6xl"
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}10)`,
                  border: `3px solid ${accentColor}60`,
                  color: accentColor,
                  boxShadow: `0 0 30px ${glowColor}`,
                }}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Jersey number pill (top-left, inside image area) */}
          {player.jerseyNumber && (
            <div
              className="absolute top-3 left-3 z-20 font-black text-[12px] px-2.5 py-1 rounded-lg"
              style={{
                background: `${accentColor}25`,
                border: `1px solid ${accentColor}60`,
                color: accentColor,
                backdropFilter: 'blur(8px)',
              }}
            >
              #{player.jerseyNumber}
            </div>
          )}

          {/* Player name overlay at bottom of image */}
          <div className="absolute bottom-4 left-0 right-0 z-20 px-4">
            <h3
              className="font-black text-white text-[18px] leading-tight truncate"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,1)' }}
            >
              {player.name}
            </h3>
            {/* Form dots row */}
            {form.length > 0 && (
              <div className="flex items-center gap-1 mt-1.5">
                {form.map((r, i) => (
                  <div
                    key={i}
                    className="font-black text-[9px] flex items-center justify-center rounded-md"
                    style={{
                      width: 20, height: 20,
                      background:
                        r === 'win'  ? 'rgba(52,211,153,0.25)' :
                        r === 'draw' ? 'rgba(251,191,36,0.25)' :
                                       'rgba(239,68,68,0.25)',
                      color:
                        r === 'win'  ? '#34D399' :
                        r === 'draw' ? '#FBBF24' :
                                       '#F87171',
                      border: `1px solid ${r === 'win' ? '#34D39950' : r === 'draw' ? '#FBBF2450' : '#F8717150'}`,
                    }}
                  >
                    {r[0].toUpperCase()}
                  </div>
                ))}
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginLeft: 2 }}>Last 5</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats row ── */}
        <div
          className="grid grid-cols-4 gap-px"
          style={{
            background: `linear-gradient(90deg, ${accentColor}22, ${accentColor}11)`,
            borderTop: `1px solid ${accentColor}22`,
          }}
        >
          {[
            { val: stats.totalMatches, lbl: 'MP',    clr: '#818CF8' },
            { val: stats.totalGoals,   lbl: 'Goals',  clr: '#34D399' },
            { val: stats.totalMOTM,    lbl: 'MOTM',   clr: '#FBBF24' },
            { val: `${winRate}%`,      lbl: 'Win%',   clr: '#38BDF8' },
          ].map(s => (
            <div
              key={s.lbl}
              className="flex flex-col items-center justify-center py-3"
              style={{ background: 'rgba(0,0,0,0.3)' }}
            >
              <span className="font-black text-[17px] leading-none" style={{ color: s.clr }}>
                {s.val}
              </span>
              <span
                className="text-[8.5px] font-bold uppercase tracking-widest mt-1"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                {s.lbl}
              </span>
            </div>
          ))}
        </div>

        {/* ── Points + CTA row ── */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ background: 'rgba(0,0,0,0.35)' }}>
          {/* Points capsule */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: `${accentColor}20`,
              border: `1px solid ${accentColor}40`,
            }}
          >
            <span className="text-[10px] font-bold" style={{ color: accentColor }}>+{totalPoints}</span>
            <span className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>pts</span>
          </div>

          {/* Roles / tags */}
          <div className="flex-1 flex flex-wrap gap-1 overflow-hidden" style={{ maxHeight: 24 }}>
            {(player.playerRoles ?? []).slice(0, 2).map(t => (
              <span
                key={t}
                className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(99,102,241,0.2)',
                  color: '#A5B4FC',
                  border: '1px solid rgba(99,102,241,0.25)',
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Arrow CTA */}
          <button
            onClick={e => { e.stopPropagation(); onView(); }}
            className={cn(
              'shrink-0 flex items-center justify-center rounded-full font-black text-[11px] transition-all duration-300',
            )}
            style={{
              width: 32, height: 32,
              background: hovered ? accentColor : `${accentColor}25`,
              color: hovered ? '#000' : accentColor,
              border: `1px solid ${accentColor}60`,
              transform: hovered ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
