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
        background: 'linear-gradient(150deg, #011b3d 0%, #083c84 40%, #01122a 100%)',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── Stadium Spotlights Effect ───────────────────────────── */}
      <div style={{
        position: 'absolute', top: -50, left: 100, width: 320, height: 400,
        background: 'radial-gradient(ellipse at top, rgba(56,189,248,0.28) 0%, transparent 70%)',
        transform: 'rotate(-25deg)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', top: -50, right: 100, width: 320, height: 400,
        background: 'radial-gradient(ellipse at top, rgba(56,189,248,0.28) 0%, transparent 70%)',
        transform: 'rotate(25deg)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* ── BG Centre Radial Glow Behind Champion ───────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 60%, rgba(14,165,233,0.38) 0%, transparent 64%)',
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
            color: '#38BDF8',
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
      {/* ── PLAYER DETAILS (MVP Skewed Pill Style) ─────────────────── */}
      {/* ════════════════════════════════════════════════════════════ */}
      {p1 && (
        <>
          {/* ── 1. RUNNER UP DETAILS (Left — MVP skewed pill style) ── */}
          {p2 && (
            <div style={{
              position: 'absolute',
              left: 20,
              bottom: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              zIndex: 25,
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.14)',
                padding: '3px 10px', borderRadius: 4, width: 'fit-content',
                transform: 'skewX(-10deg)',
              }}>
                <span style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: 10, fontWeight: 900,
                  color: '#E2E8F0', letterSpacing: 2, textTransform: 'uppercase',
                }}>
                  #2 {p2.player.name}
                </span>
              </div>
              <div style={{
                background: 'linear-gradient(90deg, #1E40AF 0%, #0F172A 100%)',
                border: '1.5px solid #38BDF8',
                boxShadow: '0 6px 20px rgba(0,0,0,0.7), 0 0 12px rgba(56,189,248,0.4)',
                padding: '5px 14px',
                borderRadius: 8,
                display: 'flex', alignItems: 'baseline', gap: 8,
                transform: 'skewX(-12deg)',
                width: 'fit-content',
              }}>
                <span style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: 26, fontWeight: 900,
                  color: '#fff', lineHeight: 1, fontStyle: 'italic',
                }}>
                  +{p2.points}
                </span>
                <span style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: 13, fontWeight: 700,
                  color: '#93C5FD', fontStyle: 'italic',
                }}>
                  Pts
                </span>
              </div>
              <div style={{
                background: 'linear-gradient(90deg, #0F3460 0%, #091428 100%)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
                padding: '4px 14px',
                borderRadius: 8,
                display: 'flex', alignItems: 'baseline', gap: 8,
                transform: 'skewX(-12deg)',
                width: 'fit-content',
              }}>
                <span style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 800,
                  color: '#fff', letterSpacing: 1,
                }}>
                  {p2.goals}G · {p2.appearances}APP · {p2.motm}M
                </span>
              </div>
            </div>
          )}

          {/* ── 2. CHAMPION DETAILS (Center — MVP skewed pill style) ── */}
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            zIndex: 30,
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.14)',
              padding: '3px 12px', borderRadius: 4,
              transform: 'skewX(-10deg)',
            }}>
              <span style={{ fontSize: 13 }}>👑</span>
              <span style={{
                fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 900,
                color: '#FFD700', letterSpacing: 2, textTransform: 'uppercase',
              }}>
                #1 {p1.player.name}
              </span>
            </div>
            <div style={{
              background: 'linear-gradient(90deg, #1E40AF 0%, #0F172A 100%)',
              border: '1.5px solid #FFD700',
              boxShadow: '0 6px 20px rgba(0,0,0,0.7), 0 0 16px rgba(255,215,0,0.45)',
              padding: '5px 18px',
              borderRadius: 8,
              display: 'flex', alignItems: 'baseline', gap: 8,
              transform: 'skewX(-12deg)',
              width: 'fit-content',
            }}>
              <span style={{
                fontFamily: "'Oswald', sans-serif", fontSize: 30, fontWeight: 900,
                color: '#fff', lineHeight: 1, fontStyle: 'italic',
              }}>
                +{p1.points}
              </span>
              <span style={{
                fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 700,
                color: '#FEF08A', fontStyle: 'italic',
              }}>
                Pts
              </span>
            </div>
            <div style={{
              background: 'linear-gradient(90deg, #0F3460 0%, #091428 100%)',
              border: '1.5px solid rgba(255,255,255,0.2)',
              boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
              padding: '4px 14px',
              borderRadius: 8,
              display: 'flex', alignItems: 'baseline', gap: 8,
              transform: 'skewX(-12deg)',
              width: 'fit-content',
            }}>
              <span style={{
                fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 800,
                color: '#fff', letterSpacing: 1,
              }}>
                {p1.goals}G · {p1.appearances}APP · {p1.motm}M
              </span>
            </div>
          </div>

          {/* ── 3. 3RD PLACE DETAILS (Right — MVP skewed pill style) ── */}
          {p3 && (
            <div style={{
              position: 'absolute',
              right: 20,
              bottom: 28,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 6,
              zIndex: 25,
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.14)',
                padding: '3px 10px', borderRadius: 4, width: 'fit-content',
                transform: 'skewX(-10deg)',
              }}>
                <span style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: 10, fontWeight: 900,
                  color: '#F59E0B', letterSpacing: 2, textTransform: 'uppercase',
                }}>
                  #3 {p3.player.name}
                </span>
              </div>
              <div style={{
                background: 'linear-gradient(90deg, #1E40AF 0%, #0F172A 100%)',
                border: '1.5px solid #38BDF8',
                boxShadow: '0 6px 20px rgba(0,0,0,0.7), 0 0 12px rgba(56,189,248,0.4)',
                padding: '5px 14px',
                borderRadius: 8,
                display: 'flex', alignItems: 'baseline', gap: 8,
                transform: 'skewX(-12deg)',
                width: 'fit-content',
              }}>
                <span style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: 26, fontWeight: 900,
                  color: '#fff', lineHeight: 1, fontStyle: 'italic',
                }}>
                  +{p3.points}
                </span>
                <span style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: 13, fontWeight: 700,
                  color: '#93C5FD', fontStyle: 'italic',
                }}>
                  Pts
                </span>
              </div>
              <div style={{
                background: 'linear-gradient(90deg, #0F3460 0%, #091428 100%)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
                padding: '4px 14px',
                borderRadius: 8,
                display: 'flex', alignItems: 'baseline', gap: 8,
                transform: 'skewX(-12deg)',
                width: 'fit-content',
              }}>
                <span style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 800,
                  color: '#fff', letterSpacing: 1,
                }}>
                  {p3.goals}G · {p3.appearances}APP · {p3.motm}M
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Bottom Accent Line ────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2.5,
        background: 'linear-gradient(90deg, transparent, #38BDF8 50%, transparent)',
        zIndex: 40,
      }} />
    </div>
  );
}
