import React from 'react';
import { RankedPlayer } from '../../utils/galleryStats';
import { useCutoutImage } from '../../utils/useCutoutImage';

interface PodiumCardProps {
  topPlayers: RankedPlayer[];
  title: string;
  subtitle: string;
  aspect?: '4:5' | '1:1' | '16:9' | '9:16';
  cardRef?: React.RefObject<HTMLDivElement>;
}

/* ─── Sub-component: Player Cutout Image using hook ─────────────── */
function PlayerCutoutImg({
  src,
  alt,
  imgHeight,
  glow,
}: {
  src?: string;
  alt: string;
  imgHeight: number;
  glow: string;
}) {
  const processed = useCutoutImage(src);
  return (
    <img
      src={processed}
      alt={alt}
      crossOrigin="anonymous"
      style={{
        height: imgHeight,
        maxWidth: 'none',
        objectFit: 'contain',
        objectPosition: 'bottom center',
        display: 'block',
        filter: [
          'drop-shadow(0 0 1px rgba(255,255,255,0.70))',
          `drop-shadow(0 0 24px ${glow})`,
          'drop-shadow(0 18px 36px rgba(0,0,0,0.95))',
        ].join(' '),
      }}
    />
  );
}

export function PodiumCard({ topPlayers, title, subtitle, cardRef }: PodiumCardProps) {
  const isMonthly = title.toLowerCase().includes('monthly') || subtitle.toLowerCase().includes('month');

  const p1 = topPlayers[0];
  const p2 = topPlayers[1];
  const p3 = topPlayers[2];

  /* 
   * Z-Index Squad Layering:
   * Center (#1 / Champion): highest zIndex (15), largest size (450px) at left: 50%
   * Flanked on left (#2) at left: 27% (zIndex 10, 405px)
   * Flanked on right (#3) at left: 73% (zIndex 10, 395px)
   */
  const slots = [
    {
      player: p2,
      rank: 2,
      label: 'RUNNER UP',
      medal: '🥈',
      color: '#E2E8F0',
      border: '#CBD5E1',
      glow: 'rgba(226,232,240,0.50)',
      leftPercent: 27,
      zIndex: 10,
      imgHeight: 405,
    },
    {
      player: p1,
      rank: 1,
      label: 'CHAMPION',
      medal: '🥇',
      color: '#FFD700',
      border: '#FFD700',
      glow: 'rgba(255,215,0,0.65)',
      leftPercent: 50, // CENTER
      zIndex: 15,     // HIGHEST
      imgHeight: 450, // LARGEST (~83% card height)
    },
    {
      player: p3,
      rank: 3,
      label: '3RD PLACE',
      medal: '🥉',
      color: '#F59E0B',
      border: '#F59E0B',
      glow: 'rgba(245,158,11,0.50)',
      leftPercent: 73,
      zIndex: 10,
      imgHeight: 395,
    },
  ];

  return (
    <div
      ref={cardRef}
      style={{
        width: 960,
        height: 540,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 0,
        background: isMonthly
          ? 'linear-gradient(150deg, #1c0900 0%, #7c3500 38%, #140400 100%)'
          : 'linear-gradient(150deg, #011b3d 0%, #083c84 40%, #01122a 100%)',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── Stadium Spotlights Effect ───────────────────────────── */}
      <div style={{
        position: 'absolute', top: -50, left: 100, width: 320, height: 400,
        background: isMonthly
          ? 'radial-gradient(ellipse at top, rgba(255,200,60,0.32) 0%, transparent 70%)'
          : 'radial-gradient(ellipse at top, rgba(56,189,248,0.28) 0%, transparent 70%)',
        transform: 'rotate(-25deg)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', top: -50, right: 100, width: 320, height: 400,
        background: isMonthly
          ? 'radial-gradient(ellipse at top, rgba(255,200,60,0.32) 0%, transparent 70%)'
          : 'radial-gradient(ellipse at top, rgba(56,189,248,0.28) 0%, transparent 70%)',
        transform: 'rotate(25deg)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* ── BG Centre Radial Glow Behind Champion ───────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: isMonthly
          ? 'radial-gradient(ellipse at 50% 60%, rgba(220,130,0,0.45) 0%, transparent 64%)'
          : 'radial-gradient(ellipse at 50% 60%, rgba(14,165,233,0.38) 0%, transparent 64%)',
        zIndex: 1,
      }} />

      {/* ── Diagonal Stripe Texture ─────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(55deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 24px)',
        zIndex: 1,
      }} />

      {/* ── Watermark "TOP 3" ─────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 240, fontWeight: 900,
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        color: 'rgba(255,255,255,0.035)',
        letterSpacing: -8, lineHeight: 1,
        userSelect: 'none', pointerEvents: 'none', zIndex: 2,
        paddingBottom: 60,
      }}>
        TOP 3
      </div>

      {/* ── Bottom Ground Shadow (Smooth atmospheric fade) ────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 230,
        background: 'linear-gradient(0deg, rgba(0,0,12,0.96) 0%, rgba(0,0,12,0.60) 55%, transparent 100%)',
        zIndex: 18,
        pointerEvents: 'none',
      }} />

      {/* ── Header ───────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '14px 26px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 35,
        background: 'linear-gradient(180deg, rgba(0,0,15,0.85) 0%, rgba(0,0,15,0.3) 70%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <img
            src="/images/club-logo.jpg"
            alt="Club Logo"
            crossOrigin="anonymous"
            style={{
              width: 40, height: 40, borderRadius: 9, objectFit: 'cover',
              border: '2px solid rgba(255,255,255,0.6)',
              boxShadow: '0 0 16px rgba(255,255,255,0.22)',
            }}
          />
          <div>
            <div style={{ fontSize: 12, color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, lineHeight: 1 }}>
              THE ENIGMATIC ELITE
            </div>
            <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.65)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic', marginTop: 2 }}>
              In Mystery We Reign
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 28, fontWeight: 900,
            fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
            color: '#fff', textTransform: 'uppercase', letterSpacing: 3.5, lineHeight: 1,
            textShadow: '0 0 25px rgba(255,255,255,0.35)',
          }}>
            {title}
          </div>
          <div style={{
            fontSize: 10, fontWeight: 800,
            color: isMonthly ? '#FFD700' : '#38BDF8',
            textTransform: 'uppercase', letterSpacing: 2.8, marginTop: 4,
            fontFamily: "'Oswald', sans-serif",
          }}>
            {subtitle}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ── TOP 3 PODIUM SQUAD (3 Players Layered with Z-Index) ───── */}
      {/* ════════════════════════════════════════════════════════════ */}
      {!p1 ? (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, zIndex: 20 }}>
          No stats recorded for this period yet.
        </div>
      ) : (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {slots.map(({ player: r, rank, medal, glow, leftPercent, zIndex, imgHeight }) => {
            if (!r) return null;

            return (
              <div
                key={rank}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: `${leftPercent}%`,
                  transform: 'translateX(-50%)',
                  zIndex,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                {/* Floating Medal above player */}
                <div style={{
                  marginBottom: -16,
                  zIndex: zIndex + 2,
                  fontSize: rank === 1 ? 32 : 24,
                  filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.85))',
                  lineHeight: 1,
                }}>
                  {medal}
                </div>

                {/* Player Cutout Image */}
                <PlayerCutoutImg
                  src={r.player.coverImageUrl}
                  alt={r.player.name}
                  imgHeight={imgHeight}
                  glow={glow}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ── PLAYER DETAILS ON THE SIDES (No Clunky Bottom Boxes) ─── */}
      {/* ════════════════════════════════════════════════════════════ */}
      {p1 && (
        <>
          {/* ── 1. RUNNER UP DETAILS (Left Side of Player 2) ──────── */}
          {p2 && (
            <div style={{
              position: 'absolute',
              left: 24,
              bottom: 65,
              width: 175,
              background: 'rgba(4, 9, 22, 0.90)',
              backdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(226,232,240,0.45)',
              borderLeft: '4px solid #CBD5E1',
              borderRadius: 12,
              padding: '10px 14px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.85), 0 0 16px rgba(226,232,240,0.20)',
              zIndex: 25,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>🥈</span>
                <span style={{
                  fontSize: 9.5,
                  fontWeight: 900,
                  color: '#CBD5E1',
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  fontFamily: "'Oswald', sans-serif",
                }}>
                  RUNNER UP
                </span>
              </div>
              <div style={{
                fontSize: 14,
                fontWeight: 900,
                fontFamily: "'Oswald', sans-serif",
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: 1,
                lineHeight: 1.15,
                marginTop: 4,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {p2.player.name}
              </div>
              <div style={{
                fontSize: 23,
                fontWeight: 900,
                fontFamily: "'Oswald', sans-serif",
                color: '#E2E8F0',
                fontStyle: 'italic',
                lineHeight: 1,
                marginTop: 4,
                textShadow: '0 0 12px rgba(226,232,240,0.6)',
              }}>
                +{p2.points} <span style={{ fontSize: 8.5, fontStyle: 'normal', color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>PTS</span>
              </div>
              <div style={{
                fontSize: 8.5,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: "'Oswald', sans-serif",
                letterSpacing: 0.8,
                marginTop: 3,
              }}>
                {p2.goals}G · {p2.appearances}APP · {p2.motm}M
              </div>
            </div>
          )}

          {/* ── 2. CHAMPION DETAILS (Center, Integrated Under Champion) ─ */}
          <div style={{
            position: 'absolute',
            bottom: 18,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(4, 8, 24, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid #FFD700',
            borderTop: '3.5px solid #FFD700',
            borderRadius: 14,
            padding: '8px 22px',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.92), 0 0 22px rgba(255,215,0,0.55)',
            zIndex: 30,
            minWidth: 215,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span style={{ fontSize: 15 }}>🥇</span>
              <span style={{
                fontSize: 10,
                fontWeight: 900,
                color: '#FFD700',
                letterSpacing: 2.5,
                textTransform: 'uppercase',
                fontFamily: "'Oswald', sans-serif",
              }}>
                CHAMPION
              </span>
              <span style={{ fontSize: 13 }}>👑</span>
            </div>
            <div style={{
              fontSize: 16,
              fontWeight: 900,
              fontFamily: "'Oswald', sans-serif",
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              lineHeight: 1.15,
              marginTop: 4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {p1.player.name}
            </div>
            <div style={{
              fontSize: 26,
              fontWeight: 900,
              fontFamily: "'Oswald', sans-serif",
              color: '#FFD700',
              fontStyle: 'italic',
              lineHeight: 1,
              marginTop: 3,
              textShadow: '0 0 16px rgba(255,215,0,0.7)',
            }}>
              +{p1.points} <span style={{ fontSize: 9.5, fontStyle: 'normal', color: 'rgba(255,255,255,0.55)', letterSpacing: 1 }}>PTS</span>
            </div>
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.52)',
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: 1,
              marginTop: 3,
            }}>
              {p1.goals}G · {p1.appearances}APP · {p1.motm}M
            </div>
          </div>

          {/* ── 3. 3RD PLACE DETAILS (Right Side of Player 3) ─────── */}
          {p3 && (
            <div style={{
              position: 'absolute',
              right: 24,
              bottom: 65,
              width: 175,
              background: 'rgba(4, 9, 22, 0.90)',
              backdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(245,158,11,0.45)',
              borderRight: '4px solid #F59E0B',
              borderRadius: 12,
              padding: '10px 14px',
              textAlign: 'right',
              boxShadow: '0 8px 24px rgba(0,0,0,0.85), 0 0 16px rgba(245,158,11,0.20)',
              zIndex: 25,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                <span style={{
                  fontSize: 9.5,
                  fontWeight: 900,
                  color: '#F59E0B',
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  fontFamily: "'Oswald', sans-serif",
                }}>
                  3RD PLACE
                </span>
                <span style={{ fontSize: 16 }}>🥉</span>
              </div>
              <div style={{
                fontSize: 14,
                fontWeight: 900,
                fontFamily: "'Oswald', sans-serif",
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: 1,
                lineHeight: 1.15,
                marginTop: 4,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {p3.player.name}
              </div>
              <div style={{
                fontSize: 23,
                fontWeight: 900,
                fontFamily: "'Oswald', sans-serif",
                color: '#F59E0B',
                fontStyle: 'italic',
                lineHeight: 1,
                marginTop: 4,
                textShadow: '0 0 12px rgba(245,158,11,0.6)',
              }}>
                +{p3.points} <span style={{ fontSize: 8.5, fontStyle: 'normal', color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>PTS</span>
              </div>
              <div style={{
                fontSize: 8.5,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: "'Oswald', sans-serif",
                letterSpacing: 0.8,
                marginTop: 3,
              }}>
                {p3.goals}G · {p3.appearances}APP · {p3.motm}M
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Bottom Accent Line ────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2.5,
        background: isMonthly
          ? 'linear-gradient(90deg, transparent, #FFD700 50%, transparent)'
          : 'linear-gradient(90deg, transparent, #38BDF8 50%, transparent)',
        zIndex: 40,
      }} />
    </div>
  );
}
