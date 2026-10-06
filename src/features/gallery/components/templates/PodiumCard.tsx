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

const MEDAL = ['🥇', '🥈', '🥉'];

export function PodiumCard({ topPlayers, title, subtitle, cardRef }: PodiumCardProps) {
  const isMonthly = title.toLowerCase().includes('monthly') || subtitle.toLowerCase().includes('month');

  const p1 = topPlayers[0];
  const p2 = topPlayers[1];
  const p3 = topPlayers[2];

  /* 
   * Same Z-Index squad layering as Top 10 Card:
   * Center player (#1 / Champion) has highest zIndex (15) and largest height.
   * Flanked on left (#2) and right (#3) with lower zIndex (10) behind #1's shoulders.
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
      leftPercent: 26,
      zIndex: 10,
      imgHeight: 395,
    },
    {
      player: p1,
      rank: 1,
      label: 'CHAMPION',
      medal: '🥇',
      color: '#FFD700',
      border: '#FFD700',
      glow: 'rgba(255,215,0,0.65)',
      leftPercent: 50, // DEAD CENTER
      zIndex: 15,     // HIGHEST Z-INDEX
      imgHeight: 440, // LARGEST
    },
    {
      player: p3,
      rank: 3,
      label: '3RD PLACE',
      medal: '🥉',
      color: '#F59E0B',
      border: '#F59E0B',
      glow: 'rgba(245,158,11,0.50)',
      leftPercent: 74,
      zIndex: 10,
      imgHeight: 380,
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

      {/* ── Bottom Ground Shadow ──────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 210,
        background: 'linear-gradient(0deg, rgba(0,0,12,0.96) 0%, rgba(0,0,12,0.68) 50%, transparent 100%)',
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
      {/* ── TOP 3 PODIUM SQUAD (Layered with Z-Index like Top 10) ─── */}
      {/* ════════════════════════════════════════════════════════════ */}
      {!p1 ? (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, zIndex: 20 }}>
          No stats recorded for this period yet.
        </div>
      ) : (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {slots.map(({ player: r, rank, label, medal, color, glow, leftPercent, zIndex, imgHeight }) => {
            if (!r) return null;
            const nameParts = r.player.name.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');

            return (
              <div
                key={rank}
                style={{
                  position: 'absolute',
                  bottom: 78, // Sits right above the bottom info panels
                  left: `${leftPercent}%`,
                  transform: 'translateX(-50%)',
                  zIndex,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                {/* Floating Medal */}
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

                {/* Floating Tag for Champion (#1) */}
                {rank === 1 && (
                  <div style={{
                    position: 'absolute',
                    bottom: 30,
                    background: 'rgba(0, 5, 20, 0.90)',
                    backdropFilter: 'blur(12px)',
                    border: `1.5px solid #FFD700`,
                    borderRadius: 20,
                    padding: '3px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 18px rgba(0,0,0,0.9), 0 0 16px rgba(255,215,0,0.6)',
                    zIndex: zIndex + 5,
                    whiteSpace: 'nowrap',
                  }}>
                    <span style={{ fontSize: 14 }}>👑</span>
                    <span style={{
                      fontSize: 11.5,
                      fontWeight: 900,
                      fontFamily: "'Oswald', sans-serif",
                      color: '#FFD700',
                      letterSpacing: 1.5,
                      textTransform: 'uppercase',
                    }}>
                      CHAMPION
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ── BOTTOM DOCK: 3 Player Info Panels (Layered Z-Index) ──── */}
      {/* ════════════════════════════════════════════════════════════ */}
      {p1 && (
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 80,
          zIndex: 25,
          display: 'flex',
          alignItems: 'stretch',
          padding: '0 16px 6px',
          gap: 12,
        }}>
          {slots.map(({ player: r, rank, label, medal, color, glow, zIndex }) => {
            if (!r) return <div key={rank} style={{ flex: 1 }} />;
            const isChamp = rank === 1;
            const nameParts = r.player.name.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');

            return (
              <div
                key={rank}
                style={{
                  flex: isChamp ? 1.25 : 1,
                  position: 'relative',
                  background: isChamp
                    ? 'rgba(0, 6, 22, 0.94)'
                    : 'rgba(0, 4, 16, 0.88)',
                  backdropFilter: 'blur(12px)',
                  border: `1.5px solid ${isChamp ? color : color + '55'}`,
                  borderTop: `3px solid ${color}`,
                  borderRadius: 10,
                  padding: '7px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: isChamp
                    ? `0 6px 20px rgba(0,0,0,0.8), 0 0 16px ${glow}`
                    : `0 4px 14px rgba(0,0,0,0.6)`,
                  zIndex: isChamp ? 30 : 22,
                }}
              >
                {/* Left: Medal + Rank + Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ fontSize: isChamp ? 22 : 18, lineHeight: 1 }}>{medal}</div>
                  <div>
                    <div style={{
                      fontSize: 8.5,
                      fontWeight: 900,
                      color,
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      fontFamily: "'Oswald', sans-serif",
                    }}>
                      {label}
                    </div>
                    <div style={{
                      fontSize: isChamp ? 13 : 11.5,
                      fontWeight: 900,
                      fontFamily: "'Oswald', sans-serif",
                      color: '#fff',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      lineHeight: 1.1,
                      marginTop: 2,
                      maxWidth: 150,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {firstName} {lastName}
                    </div>
                    <div style={{
                      fontSize: 8,
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.48)',
                      fontFamily: "'Oswald', sans-serif",
                      letterSpacing: 0.8,
                      marginTop: 2,
                    }}>
                      {r.goals}G · {r.appearances}APP · {r.motm}M
                    </div>
                  </div>
                </div>

                {/* Right: Points */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: isChamp ? 24 : 19,
                    fontWeight: 900,
                    fontFamily: "'Oswald', sans-serif",
                    color,
                    fontStyle: 'italic',
                    lineHeight: 1,
                    textShadow: `0 0 14px ${color}88`,
                  }}>
                    +{r.points}
                  </div>
                  <div style={{
                    fontSize: 7.5,
                    fontWeight: 800,
                    color: 'rgba(255,255,255,0.42)',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginTop: 2,
                  }}>
                    PTS
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
