import { useState } from 'react';
import { Player } from '../types';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { useFootballStore } from '@/store/footballStore';

interface PlayerCardProps {
  player: Player;
  onView: () => void;
}

const RANK_CONFIG: Record<number, { glow: string; badge: string; accent: string }> = {
  1: { glow: 'rgba(251,191,36,0.45)',  badge: '#F59E0B', accent: '#FDE68A' },
  2: { glow: 'rgba(148,163,184,0.35)', badge: '#94A3B8', accent: '#E2E8F0' },
  3: { glow: 'rgba(180,83,9,0.35)',    badge: '#D97706', accent: '#FCD34D' },
};

/* ── small helper: form result capsule ── */
function FormPill({ result }: { result: string }) {
  const isWin  = result === 'win';
  const isDraw = result === 'draw';
  const bg    = isWin ? 'rgba(52,211,153,0.18)'  : isDraw ? 'rgba(251,191,36,0.18)'  : 'rgba(239,68,68,0.18)';
  const border= isWin ? 'rgba(52,211,153,0.55)'  : isDraw ? 'rgba(251,191,36,0.55)'  : 'rgba(239,68,68,0.55)';
  const color = isWin ? '#34D399'                 : isDraw ? '#FBBF24'                : '#F87171';
  const label = isWin ? 'W'                       : isDraw ? 'D'                      : 'L';

  return (
    <div style={{
      width: 26, height: 26, borderRadius: 6,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: bg,
      border: `1.5px solid ${border}`,
      color,
      fontFamily: "'Oswald', sans-serif",
      fontSize: 13, fontWeight: 700,
      letterSpacing: '0.02em',
      lineHeight: 1,
    }}>
      {label}
    </div>
  );
}

/* ── stat capsule ── */
function StatCapsule({ val, lbl, color }: { val: string | number; lbl: string; color: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '10px 6px', flex: 1,
      background: 'rgba(0,0,0,0.3)',
      gap: 3,
    }}>
      <span style={{
        fontFamily: "'Oswald', sans-serif",
        fontWeight: 700,
        fontSize: 22,
        lineHeight: 1,
        color,
        letterSpacing: '-0.01em',
      }}>
        {val}
      </span>
      <span style={{
        fontFamily: "'Oswald', sans-serif",
        fontWeight: 500,
        fontSize: 9,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.12em',
        color: 'rgba(255,255,255,0.4)',
      }}>
        {lbl}
      </span>
    </div>
  );
}

export function PlayerCard({ player, onView }: PlayerCardProps) {
  const [hovered, setHovered] = useState(false);
  const stats = usePlayerStats(player.id);
  const { players, playerSeasonStats, matchEntries } = useFootballStore();

  // ── Rank ──
  const calcPts = (s: any) =>
    s.wins * 10 + s.draws * 5 - s.losses * 3 + s.goals - s.goalsConceded + s.motmCount * 4 + s.hattricks;

  const ranked = [...players]
    .map(p => ({
      id: p.id,
      pts: playerSeasonStats.filter(s => s.playerId === p.id).reduce((a, s) => a + calcPts(s), 0),
    }))
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

  const winRate = stats.totalMatches > 0 ? Math.round((stats.totalWins / stats.totalMatches) * 100) : 0;

  const accent      = rankCfg ? rankCfg.badge  : '#6366F1';
  const accentLight = rankCfg ? rankCfg.accent : '#A5B4FC';
  const glow        = rankCfg ? rankCfg.glow   : 'rgba(99,102,241,0.28)';
  const rankEmoji   = rank ? (rank <= 3 ? ['🥇','🥈','🥉'][rank - 1] : null) : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onView}
      style={{
        position: 'relative',
        borderRadius: 18,
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'transform 0.32s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease',
        transform: hovered ? 'translateY(-7px) scale(1.025)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? `0 28px 52px ${glow}, 0 0 0 1.5px ${accent}77, 0 10px 24px rgba(0,0,0,0.65)`
          : '0 4px 22px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{
        borderRadius: 18,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(155deg,#16162a 0%,#0d0d1c 45%,#080810 100%)',
        border: `1px solid ${accent}30`,
      }}>

        {/* ════════════ IMAGE AREA ════════════ */}
        <div style={{ position: 'relative', minHeight: 240, overflow: 'hidden' }}>

          {/* bg dots — z:0 */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0, opacity: 0.04,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='14' cy='14' r='1' fill='%23fff'/%3E%3C/svg%3E")`,
            backgroundSize: '28px 28px',
          }} />

          {/* glow orb — z:0 */}
          <div style={{
            position: 'absolute', top: -20, left: -20, zIndex: 0,
            width: 180, height: 180, borderRadius: '50%',
            background: `radial-gradient(circle, ${accent}30 0%, transparent 68%)`,
            filter: 'blur(36px)',
            pointerEvents: 'none',
          }} />

          {/* Player image — z:1 */}
          {player.profileImageUrl ? (
            <img
              src={player.profileImageUrl}
              alt={player.name}
              style={{
                position: 'absolute', inset: 0, zIndex: 1,
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'top center',
                filter: hovered ? 'brightness(1.06) contrast(1.02)' : 'brightness(0.93)',
                transition: 'filter 0.35s ease',
              }}
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              paddingBottom: 40,
              background: `linear-gradient(160deg, ${accent}15 0%, transparent 100%)`,
            }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
                fontSize: 52, color: accent,
                background: `linear-gradient(135deg, ${accent}30, ${accent}08)`,
                border: `3px solid ${accent}50`,
                boxShadow: `0 0 48px ${glow}`,
              }}>
                {player.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Bottom dark gradient — z:2 */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
            height: '70%',
            background: 'linear-gradient(to top, #080810 0%, #080810e8 18%, #080810aa 42%, transparent 100%)',
            pointerEvents: 'none',
          }} />

          {/* Accent line at bottom — z:2 */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
            height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${accent} 35%, ${accentLight} 65%, transparent 100%)`,
            pointerEvents: 'none',
          }} />

          {/* Jersey pill — top-left — z:3 */}
          {player.jerseyNumber && (
            <div style={{
              position: 'absolute', top: 11, left: 11, zIndex: 3,
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700, fontSize: 12,
              padding: '4px 11px', borderRadius: 7,
              background: `${accent}22`,
              border: `1.5px solid ${accent}55`,
              color: accent,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              letterSpacing: '0.05em',
            }}>
              #{player.jerseyNumber}
            </div>
          )}

          {/* Rank badge — top-right — z:3 */}
          {rank && (
            <div style={{
              position: 'absolute', top: 9, right: 9, zIndex: 3,
              width: 38, height: 38, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: rankCfg ? 20 : 13,
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
              background: rankCfg
                ? `linear-gradient(140deg, ${accent}, ${accentLight})`
                : 'rgba(255,255,255,0.1)',
              color: rankCfg ? '#000' : '#fff',
              border: '2px solid rgba(255,255,255,0.18)',
              boxShadow: rankCfg ? `0 3px 16px ${glow}` : 'none',
            }}>
              {rankEmoji ?? `#${rank}`}
            </div>
          )}

          {/* Player name + form dots — z:3 */}
          <div style={{
            position: 'absolute', bottom: 11, left: 0, right: 0, zIndex: 3,
            padding: '0 14px',
          }}>
            {/* Name */}
            <h3 style={{
              margin: 0, lineHeight: 1,
              fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
              fontWeight: 400, /* Bebas Neue uses normal weight */
              fontSize: 26,
              color: '#fff',
              letterSpacing: '0.03em',
              textShadow: '0 2px 14px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.9)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {player.name}
            </h3>

            {/* Form pills row */}
            {form.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 7 }}>
                {form.map((r, i) => <FormPill key={i} result={r} />)}
                <span style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 500, fontSize: 9,
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  color: 'rgba(255,255,255,0.28)', marginLeft: 3,
                }}>
                  Form
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ════════════ STATS STRIP ════════════ */}
        <div style={{
          display: 'flex',
          borderTop: `1px solid ${accent}20`,
          gap: 1,
          background: `linear-gradient(90deg, ${accent}18 0%, transparent 100%)`,
        }}>
          <StatCapsule val={stats.totalMatches} lbl="Matches"  color="#818CF8" />
          <StatCapsule val={stats.totalGoals}   lbl="Goals"   color="#34D399" />
          <StatCapsule val={stats.totalMOTM}    lbl="MOTM"    color="#FBBF24" />
          <StatCapsule val={`${winRate}%`}      lbl="Win Rate" color="#38BDF8" />
        </div>

        {/* ════════════ BOTTOM ROW ════════════ */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 13px',
          background: 'rgba(0,0,0,0.38)',
          borderTop: `1px solid rgba(255,255,255,0.04)`,
        }}>
          {/* Points capsule */}
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 4,
            padding: '5px 13px', borderRadius: 999, flexShrink: 0,
            background: `${accent}1a`,
            border: `1.5px solid ${accent}40`,
          }}>
            <span style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700, fontSize: 14,
              color: accent,
              letterSpacing: '0.02em',
            }}>
              +{totalPoints}
            </span>
            <span style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 500, fontSize: 9,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.3)',
            }}>
              pts
            </span>
          </div>

          {/* Role tags */}
          <div style={{ flex: 1, display: 'flex', gap: 5, overflow: 'hidden', maxHeight: 22 }}>
            {(player.playerRoles ?? []).slice(0, 2).map(t => (
              <span key={t} style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 500, fontSize: 9,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: '3px 9px', borderRadius: 999,
                background: 'rgba(99,102,241,0.18)',
                color: '#A5B4FC',
                border: '1px solid rgba(99,102,241,0.28)',
                whiteSpace: 'nowrap',
              }}>
                {t}
              </span>
            ))}
          </div>

          {/* CTA button */}
          <button
            onClick={e => { e.stopPropagation(); onView(); }}
            style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Oswald', sans-serif",
              fontSize: 15, fontWeight: 700,
              background: hovered ? accent : `${accent}22`,
              color: hovered ? '#000' : accent,
              border: `1.5px solid ${accent}55`,
              cursor: 'pointer',
              transition: 'all 0.22s ease',
              transform: hovered ? 'scale(1.14)' : 'scale(1)',
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
