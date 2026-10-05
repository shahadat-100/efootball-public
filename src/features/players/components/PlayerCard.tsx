import { useState } from 'react';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { Player } from '../types';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { useFootballStore } from '@/store/footballStore';
import { useBackgroundRemoval } from '../hooks/useBackgroundRemoval';

interface PlayerCardProps {
  player: Player;
  onView: () => void;
  index?: number;
}

const RANK_CONFIG: Record<number, { accent: string; glow: string; label: string }> = {
  1: { accent: '#FFD700', glow: 'rgba(212,175,55,0.55)', label: 'TOP PLAYER' },
  2: { accent: '#C0C0C0', glow: 'rgba(192,192,192,0.4)', label: 'ELITE' },
  3: { accent: '#CD7F32', glow: 'rgba(205,127,50,0.4)',  label: 'BRONZE' },
};

export function PlayerCard({ player, onView, index = 0 }: PlayerCardProps) {
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

  const winRate = stats.totalMatches > 0 ? Math.round((stats.totalWins / stats.totalMatches) * 100) : 0;

  const accent = rankCfg ? rankCfg.accent : '#6366F1';
  const glow   = rankCfg ? rankCfg.glow   : 'rgba(99,102,241,0.35)';

  // Role label (top title)
  const roleLabel = (player.playerRoles ?? [])[0]?.toUpperCase()
    || (rankCfg ? rankCfg.label : 'PLAYER');

  // ── Auto bg removal ──
  const { src: displayImage, isCutout, loading: bgLoading } = useBackgroundRemoval(
    player.coverImageUrl,
    player.profileImageUrl,
  );

  // skew pill helper
  const Pill = ({
    value, label, side, icon, big = false,
  }: { value: string | number; label: string; side: 'left' | 'right'; icon?: string; big?: boolean }) => (
    <div style={{
      background: 'rgba(6,10,20,0.88)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: `1.5px solid ${big ? accent : 'rgba(255,255,255,0.15)'}`,
      boxShadow: big ? `0 6px 20px ${glow}, inset 0 0 10px ${accent}22` : '0 4px 14px rgba(0,0,0,0.6)',
      padding: big ? '6px 14px' : '4px 11px',
      borderRadius: 10,
      display: 'flex',
      alignItems: 'baseline',
      gap: 5,
      transform: side === 'left' ? 'skewX(-6deg)' : 'skewX(6deg)',
    }}>
      {icon && <span style={{ fontSize: big ? 14 : 11 }}>{icon}</span>}
      <span style={{
        fontFamily: "'Oswald', sans-serif",
        fontWeight: 800, fontStyle: 'italic',
        fontSize: big ? 26 : 18,
        color: big ? accent : '#fff',
        lineHeight: 1,
      }}>
        {value}
      </span>
      <span style={{
        fontFamily: "'Oswald', sans-serif",
        fontWeight: 700, fontSize: big ? 10 : 8,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.12em',
        color: big ? '#fff' : accent,
      }}>
        {label}
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.93 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.055, ease: [0.22, 1, 0.36, 1] }}
    >
      <Tilt
        tiltMaxAngleX={9}
        tiltMaxAngleY={9}
        glareEnable={true}
        glareMaxOpacity={rankCfg ? 0.2 : 0.08}
        glareColor={accent}
        glarePosition="all"
        glareBorderRadius="16px"
        scale={1.025}
        transitionSpeed={700}
        style={{ borderRadius: 16, cursor: 'pointer', display: 'block' }}
        onEnter={() => setHovered(true)}
        onLeave={() => setHovered(false)}
        onClick={onView}
      >
        {/* ══ CARD ══ */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3/4',
          borderRadius: 16,
          overflow: 'hidden',
          background: '#040711',
          boxShadow: hovered
            ? `0 20px 50px ${glow}, 0 0 0 1.5px ${accent}55`
            : '0 6px 30px rgba(0,0,0,0.7)',
          transition: 'box-shadow 0.3s ease',
        }}>

          {/* ── BG: radial spotlight ── */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: `radial-gradient(circle at 50% 35%, ${accent}22 0%, ${accent}06 45%, #040711 85%)`,
          }} />

          {/* ── BG: gallery background image (faint) ── */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            backgroundImage: `url('/images/gallery-bg/bg-golden-boot.jpg')`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: 0.08,
          }} />

          {/* ── Club crest watermark ── */}
          <img
            src="/images/club-logo.jpg"
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              top: '28%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2,
              width: '65%', height: 'auto',
              objectFit: 'contain',
              opacity: hovered ? 0.08 : 0.05,
              transition: 'opacity 0.4s ease',
              filter: 'saturate(0) brightness(3)',
              borderRadius: 8,
            }}
          />

          {/* ── TOP HEADER ── */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            padding: '12px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            zIndex: 20,
          }}>
            {/* Club logo + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <img
                src="/images/club-logo.jpg"
                alt="Club"
                style={{
                  width: 32, height: 32, borderRadius: 7,
                  objectFit: 'cover',
                  border: `1.5px solid ${accent}99`,
                  boxShadow: `0 0 10px ${glow}`,
                }}
              />
              <div>
                <div style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 9, fontWeight: 900,
                  textTransform: 'uppercase', letterSpacing: '0.15em',
                  color: '#fff', lineHeight: 1.2,
                }}>The Enigmatic Elite</div>
                <div style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 7.5, fontWeight: 700, fontStyle: 'italic',
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  color: accent,
                }}>In Mystery We Reign</div>
              </div>
            </div>

            {/* Jersey badge */}
            {player.jerseyNumber && (
              <div style={{
                background: 'rgba(4,7,17,0.85)',
                backdropFilter: 'blur(8px)',
                border: `1.5px solid ${accent}`,
                boxShadow: `0 4px 14px rgba(0,0,0,0.6), 0 0 10px ${glow}`,
                borderRadius: 8,
                padding: '3px 10px',
                display: 'flex', alignItems: 'baseline', gap: 1,
              }}>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, fontWeight: 700, color: accent }}>#</span>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                  {player.jerseyNumber}
                </span>
              </div>
            )}
          </div>

          {/* ── BIG TITLE TEXT (Bebas Neue like reference) ── */}
          <div style={{
            position: 'absolute',
            top: '13%', left: 0, right: 0,
            textAlign: 'center',
            zIndex: 4, pointerEvents: 'none', userSelect: 'none',
          }}>
            <div style={{
              fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
              fontSize: 'clamp(52px, 14vw, 76px)',
              fontWeight: 400,
              color: '#ffffff',
              letterSpacing: '0.04em',
              lineHeight: 0.88,
              textTransform: 'uppercase',
              textShadow: `0 0 30px ${glow}, 0 6px 20px rgba(0,0,0,0.95)`,
            }}>
              {roleLabel}
            </div>
            {rankCfg && (
              <div style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 9, fontWeight: 700,
                color: accent,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginTop: 4,
                textShadow: `0 0 10px ${glow}`,
              }}>
                {rank === 1 ? 'GOLDEN BOOT' : rank === 2 ? 'SILVER' : 'BRONZE'} · RANK #{rank}
              </div>
            )}
          </div>

          {/* ── PLAYER IMAGE ── */}
          {bgLoading && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                border: `3px solid ${accent}30`, borderTopColor: accent,
                animation: 'spin 0.9s linear infinite',
              }} />
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 9, color: `${accent}88`, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Processing…
              </span>
            </div>
          )}

          {displayImage ? (
            <motion.img
              src={displayImage}
              alt={player.name}
              animate={{ scale: hovered ? 1.04 : 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                bottom: '8%', left: 0, right: 0,
                zIndex: 9,
                width: '100%', height: '72%',
                objectFit: isCutout ? 'contain' : 'cover',
                objectPosition: isCutout ? 'bottom center' : 'center 10%',
                filter: isCutout
                  ? `drop-shadow(0 -4px 24px ${accent}55) drop-shadow(0 12px 30px rgba(0,0,0,0.95))`
                  : hovered ? 'brightness(1.05)' : 'brightness(0.9)',
                opacity: bgLoading ? 0 : 1,
                transition: 'filter 0.4s ease',
              }}
            />
          ) : (
            <div style={{
              position: 'absolute',
              bottom: '8%', left: 0, right: 0,
              zIndex: 9,
              height: '72%',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              paddingBottom: 20,
            }}>
              <div style={{
                width: 90, height: 90, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
                fontSize: 44, color: accent,
                background: `linear-gradient(135deg, ${accent}30, ${accent}08)`,
                border: `3px solid ${accent}55`,
                boxShadow: `0 0 40px ${glow}`,
              }}>
                {player.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* ── STAT PILLS — LEFT ── */}
          <div style={{
            position: 'absolute', left: 12, bottom: '18%',
            display: 'flex', flexDirection: 'column', gap: 8,
            zIndex: 20,
          }}>
            <Pill value={stats.totalGoals} label="Goals" side="left" icon="⚽" big />
            <Pill value={`+${totalPoints}`} label="Pts" side="left" />
          </div>

          {/* ── STAT PILLS — RIGHT ── */}
          <div style={{
            position: 'absolute', right: 12, bottom: '18%',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
            zIndex: 20,
          }}>
            <Pill value={stats.totalMOTM}    label="MOTM"    side="right" />
            <Pill value={stats.totalMatches} label="Matches" side="right" />
          </div>

          {/* ── FORM DOTS row ── */}
          {form.length > 0 && (
            <div style={{
              position: 'absolute', bottom: '13%', left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex', alignItems: 'center', gap: 4,
              zIndex: 20,
            }}>
              {form.map((r, i) => {
                const isWin = r === 'win', isDraw = r === 'draw';
                return (
                  <div key={`${r}-${i}`} style={{
                    width: 22, height: 22, borderRadius: 5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 700,
                    background: isWin ? 'rgba(52,211,153,0.2)' : isDraw ? 'rgba(251,191,36,0.2)' : 'rgba(239,68,68,0.2)',
                    border: `1.5px solid ${isWin ? 'rgba(52,211,153,0.6)' : isDraw ? 'rgba(251,191,36,0.6)' : 'rgba(239,68,68,0.6)'}`,
                    color: isWin ? '#34D399' : isDraw ? '#FBBF24' : '#F87171',
                  }}>
                    {isWin ? 'W' : isDraw ? 'D' : 'L'}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── PLAYER NAME (Caveat script like reference) ── */}
          <div style={{
            position: 'absolute',
            bottom: '7.5%', left: '50%',
            transform: 'translateX(-50%) rotate(-2deg)',
            zIndex: 22, pointerEvents: 'none', userSelect: 'none',
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 'clamp(20px, 5vw, 28px)',
              fontWeight: 700,
              color: '#FFE57F',
              textShadow: `0 2px 8px rgba(0,0,0,0.95), 0 0 20px ${glow}`,
              letterSpacing: 0.5,
            }}>
              {player.name}
            </span>
          </div>

          {/* ── BOTTOM BAR ── */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '7%',
            background: '#020408',
            borderTop: `1px solid ${accent}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 12px',
            zIndex: 30,
          }}>
            <span style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 7, fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.15em',
              color: accent,
            }}>
              THE ENIGMATIC ELITE FC
            </span>
            <span style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 7, fontWeight: 700,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.1em',
            }}>
              {winRate}% WIN RATE
            </span>
          </div>

        </div>
      </Tilt>
    </motion.div>
  );
}
