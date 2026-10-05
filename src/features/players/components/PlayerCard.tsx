import { useState } from 'react';
import { Player } from '../types';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { useFootballStore } from '@/store/footballStore';

interface PlayerCardProps {
  player: Player;
  onView: () => void;
}

const RANK_CONFIG: Record<number, { glow: string; badge: string; accent: string }> = {
  1: { glow: 'rgba(251,191,36,0.4)',  badge: '#F59E0B', accent: '#FDE68A' },
  2: { glow: 'rgba(148,163,184,0.3)', badge: '#94A3B8', accent: '#CBD5E1' },
  3: { glow: 'rgba(180,83,9,0.3)',    badge: '#B45309', accent: '#FCD34D' },
};

export function PlayerCard({ player, onView }: PlayerCardProps) {
  const [hovered, setHovered] = useState(false);
  const stats = usePlayerStats(player.id);
  const { players, playerSeasonStats, matchEntries } = useFootballStore();

  // ── Rank ──
  const calcPts = (s: any) =>
    s.wins * 10 + s.draws * 5 - s.losses * 3 + s.goals - s.goalsConceded + s.motmCount * 4 + s.hattricks;

  const ranked = [...players]
    .map(p => ({ id: p.id, pts: playerSeasonStats.filter(s => s.playerId === p.id).reduce((a, s) => a + calcPts(s), 0) }))
    .sort((a, b) => b.pts - a.pts);

  const rankIdx     = ranked.findIndex(r => r.id === player.id);
  const rank        = rankIdx !== -1 ? rankIdx + 1 : null;
  const totalPoints = rankIdx !== -1 ? ranked[rankIdx].pts : 0;
  const rankCfg     = rank && rank <= 3 ? RANK_CONFIG[rank] : null;

  // ── Last 5 form ──
  const form = matchEntries
    .filter(e => e.playerId === player.id && e.result)
    .sort((a, b) => {
      const ta = new Date(a.time ? `${a.date}T${a.time}` : `${a.date}T00:00:00`).getTime() || 0;
      const tb = new Date(b.time ? `${b.date}T${b.time}` : `${b.date}T00:00:00`).getTime() || 0;
      return tb !== ta ? tb - ta : String(b.id).localeCompare(String(a.id));
    })
    .slice(0, 5).map(e => e.result!).reverse();

  const winRate     = stats.totalMatches > 0 ? Math.round((stats.totalWins / stats.totalMatches) * 100) : 0;
  const accent      = rankCfg ? rankCfg.badge : '#6366F1';
  const accentLight = rankCfg ? rankCfg.accent : '#A5B4FC';
  const glow        = rankCfg ? rankCfg.glow  : 'rgba(99,102,241,0.25)';

  const rankEmoji = rank ? (rank <= 3 ? ['🥇','🥈','🥉'][rank - 1] : `#${rank}`) : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onView}
      style={{
        position: 'relative',
        borderRadius: 20,
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease',
        transform: hovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? `0 24px 48px ${glow}, 0 0 0 1.5px ${accent}66, 0 8px 20px rgba(0,0,0,0.6)`
          : '0 4px 20px rgba(0,0,0,0.45)',
      }}
    >
      {/* ── Card shell ── */}
      <div
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(160deg,#1a1a2e 0%,#0f0f1a 40%,#0a0a14 100%)',
          border: `1px solid ${accent}33`,
        }}
      >

        {/* ════ IMAGE AREA ════ */}
        <div style={{ position: 'relative', minHeight: 230, overflow: 'hidden' }}>

          {/* 1. Background dots (z=0) */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Ccircle cx='15' cy='15' r='1.2' fill='%23fff'/%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px',
            opacity: 0.04,
          }} />

          {/* 2. Glow orb (z=0) */}
          <div style={{
            position: 'absolute', top: 0, left: 0, zIndex: 0,
            width: 160, height: 160, borderRadius: '50%',
            background: `radial-gradient(circle, ${accent}35 0%, transparent 70%)`,
            filter: 'blur(32px)',
            pointerEvents: 'none',
          }} />

          {/* 3. Player image (z=1) */}
          {player.profileImageUrl ? (
            <img
              src={player.profileImageUrl}
              alt={player.name}
              style={{
                position: 'absolute', inset: 0, zIndex: 1,
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'top center',
                filter: hovered ? 'brightness(1.05)' : 'brightness(0.95)',
                transition: 'filter 0.3s ease',
              }}
            />
          ) : (
            /* Fallback initial circle (z=1) */
            <div style={{
              position: 'absolute', inset: 0, zIndex: 1,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              paddingBottom: 32,
              background: `linear-gradient(160deg, ${accent}18 0%, transparent 100%)`,
            }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 44, fontWeight: 900, color: accent,
                background: `linear-gradient(135deg, ${accent}35, ${accent}10)`,
                border: `3px solid ${accent}55`,
                boxShadow: `0 0 40px ${glow}`,
              }}>
                {player.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* 4. Bottom gradient overlay (z=2) — renders OVER the image */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
            height: '68%',
            background: 'linear-gradient(to top, #0a0a14 0%, #0a0a14e0 20%, #0a0a1499 50%, transparent 100%)',
            pointerEvents: 'none',
          }} />

          {/* 5. Accent stripe at very bottom (z=2) */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
            height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${accent} 40%, ${accentLight} 60%, transparent 100%)`,
            pointerEvents: 'none',
          }} />

          {/* 6. Jersey number pill — top-left (z=3) */}
          {player.jerseyNumber && (
            <div style={{
              position: 'absolute', top: 12, left: 12, zIndex: 3,
              fontWeight: 900, fontSize: 11,
              padding: '3px 10px', borderRadius: 8,
              background: `${accent}25`,
              border: `1px solid ${accent}60`,
              color: accent,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}>
              #{player.jerseyNumber}
            </div>
          )}

          {/* 7. Rank badge — top-right (z=3) */}
          {rank && (
            <div style={{
              position: 'absolute', top: 10, right: 10, zIndex: 3,
              width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: rankCfg ? 18 : 12,
              fontWeight: 900,
              background: rankCfg
                ? `linear-gradient(135deg, ${accent}, ${accentLight})`
                : 'rgba(255,255,255,0.1)',
              color: rankCfg ? '#000' : '#fff',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: rankCfg ? `0 2px 14px ${glow}` : 'none',
            }}>
              {rankEmoji}
            </div>
          )}

          {/* 8. Player name + form — bottom overlay (z=3) */}
          <div style={{
            position: 'absolute', bottom: 12, left: 0, right: 0, zIndex: 3,
            padding: '0 14px',
          }}>
            <h3 style={{
              margin: 0, fontWeight: 900, fontSize: 18, color: '#fff',
              lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              textShadow: '0 2px 10px rgba(0,0,0,1), 0 1px 4px rgba(0,0,0,1)',
            }}>
              {player.name}
            </h3>
            {form.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                {form.map((r, i) => (
                  <div key={i} style={{
                    width: 20, height: 20, borderRadius: 5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, fontWeight: 900,
                    background:
                      r === 'win'  ? 'rgba(52,211,153,0.25)' :
                      r === 'draw' ? 'rgba(251,191,36,0.25)' :
                                     'rgba(239,68,68,0.25)',
                    color:
                      r === 'win'  ? '#34D399' :
                      r === 'draw' ? '#FBBF24' :
                                     '#F87171',
                    border: `1px solid ${r === 'win' ? '#34D39960' : r === 'draw' ? '#FBBF2460' : '#F8717160'}`,
                  }}>
                    {r[0].toUpperCase()}
                  </div>
                ))}
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginLeft: 2 }}>Last 5</span>
              </div>
            )}
          </div>
        </div>

        {/* ════ STATS STRIP ════ */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          borderTop: `1px solid ${accent}22`,
          background: `linear-gradient(90deg, ${accent}18 0%, ${accent}08 100%)`,
          gap: 1,
        }}>
          {[
            { val: stats.totalMatches, lbl: 'MP',    clr: '#818CF8' },
            { val: stats.totalGoals,   lbl: 'Goals', clr: '#34D399' },
            { val: stats.totalMOTM,    lbl: 'MOTM',  clr: '#FBBF24' },
            { val: `${winRate}%`,      lbl: 'Win%',  clr: '#38BDF8' },
          ].map(s => (
            <div key={s.lbl} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '10px 0',
              background: 'rgba(0,0,0,0.28)',
            }}>
              <span style={{ fontWeight: 900, fontSize: 17, lineHeight: 1, color: s.clr }}>{s.val}</span>
              <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{s.lbl}</span>
            </div>
          ))}
        </div>

        {/* ════ BOTTOM ROW ════ */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          background: 'rgba(0,0,0,0.35)',
        }}>
          {/* Points pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 999,
            background: `${accent}20`,
            border: `1px solid ${accent}40`,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: accent }}>+{totalPoints}</span>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)' }}>pts</span>
          </div>

          {/* Roles */}
          <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 4, overflow: 'hidden', maxHeight: 22 }}>
            {(player.playerRoles ?? []).slice(0, 2).map(t => (
              <span key={t} style={{
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                padding: '2px 8px', borderRadius: 999,
                background: 'rgba(99,102,241,0.2)',
                color: '#A5B4FC',
                border: '1px solid rgba(99,102,241,0.25)',
              }}>
                {t}
              </span>
            ))}
          </div>

          {/* CTA arrow button */}
          <button
            onClick={e => { e.stopPropagation(); onView(); }}
            style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 900,
              background: hovered ? accent : `${accent}25`,
              color: hovered ? '#000' : accent,
              border: `1px solid ${accent}60`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: hovered ? 'scale(1.12)' : 'scale(1)',
            }}
          >
            →
          </button>
        </div>

      </div>
    </div>
  );
}
