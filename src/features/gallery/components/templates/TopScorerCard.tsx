import React from 'react';
import { RankedPlayer } from '../../utils/galleryStats';
import { useCutoutImage } from '../../utils/useCutoutImage';

interface TopScorerCardProps {
  data: RankedPlayer | null;
  periodLabel: string;
  type: 'weekly' | 'monthly' | 'season';
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function TopScorerCard({ data, periodLabel, type, cardRef }: TopScorerCardProps) {
  const isMonthly = type === 'monthly';
  const rawImage = data?.player.coverImageUrl || data?.player.profileImageUrl;
  const cutoutImage = useCutoutImage(rawImage);

  const accentColor = '#FFD700'; // Gold theme for Top Scorer / Golden Boot
  const accentGlow = 'rgba(212, 175, 55, 0.45)';

  return (
    <div
      ref={cardRef}
      style={{
        width: 600,
        height: 750,
        position: 'relative',
        overflow: 'hidden',
        background: '#040711',
        fontFamily: "'Inter', system-ui, sans-serif",
        boxShadow: '0 30px 80px rgba(0,0,0,0.95)',
      }}
    >
      {/* ── Background: Golden Stadium Spotlight Atmosphere ───────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 32%, rgba(212,175,55,0.25) 0%, rgba(184,134,11,0.06) 50%, #040711 85%)',
        zIndex: 1,
      }} />

      {/* Gold Stadium Spotlight Beam */}
      <div style={{
        position: 'absolute',
        top: -40, left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 460,
        background: `radial-gradient(ellipse at 50% 25%, ${accentGlow} 0%, transparent 65%)`,
        filter: 'blur(35px)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 25,
      }}>
        {/* Club Logo + Official Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/images/club-logo.jpg"
            alt="Club Logo"
            crossOrigin="anonymous"
            style={{
              width: 44, height: 44,
              borderRadius: 10,
              objectFit: 'cover',
              border: '1.5px solid rgba(212,175,55,0.6)',
              boxShadow: `0 0 15px ${accentGlow}`,
            }}
          />
          <div>
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, fontFamily: "'Oswald', sans-serif" }}>
              THE ENIGMATIC ELITE
            </div>
            <div style={{ fontSize: 9.5, color: accentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2.5, fontStyle: 'italic' }}>
              In Mystery We Reign
            </div>
          </div>
        </div>

        {/* Clean Jersey Badge */}
        {data?.player.jerseyNumber && (
          <div style={{
            background: 'rgba(6, 14, 28, 0.85)',
            backdropFilter: 'blur(10px)',
            border: `1.5px solid ${accentColor}`,
            boxShadow: `0 4px 16px rgba(0,0,0,0.6), 0 0 12px ${accentGlow}`,
            borderRadius: 12,
            padding: '5px 14px',
            display: 'flex',
            alignItems: 'baseline',
            gap: 2,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: accentColor }}>#</span>
            <span style={{
              fontSize: 22,
              fontWeight: 800,
              fontFamily: "'Oswald', sans-serif",
              color: '#fff',
              lineHeight: 1,
            }}>
              {data.player.jerseyNumber}
            </span>
          </div>
        )}
      </div>

      {/* ── Giant Layered Background Typography (Behind Player) ───── */}
      <div style={{
        position: 'absolute',
        top: 72, left: 0, right: 0,
        textAlign: 'center',
        zIndex: 4,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        <div style={{
          fontSize: 160,
          fontWeight: 900,
          fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
          color: '#ffffff',
          letterSpacing: 8,
          lineHeight: 0.85,
          textTransform: 'uppercase',
          textShadow: `0 0 40px ${accentGlow}, 0 8px 30px rgba(0,0,0,0.9)`,
        }}>
          SCORER
        </div>

        <div style={{
          fontSize: 18,
          fontWeight: 700,
          fontFamily: "'Oswald', sans-serif",
          color: accentColor,
          letterSpacing: 8,
          textTransform: 'uppercase',
          marginTop: 6,
          textShadow: `0 0 16px ${accentGlow}`,
        }}>
          GOLDEN BOOT AWARD
        </div>

        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.7)',
          letterSpacing: 3,
          marginTop: 4,
          textTransform: 'uppercase',
          fontFamily: "'Oswald', sans-serif",
        }}>
          {isMonthly ? 'Top Scorer of the Month' : 'Top Scorer of the Week'} · {periodLabel}
        </div>
      </div>

      {data ? (
        <>
          {/* ── Center Stage: Player Cutout Image ───────────────────── */}
          <div style={{
            position: 'absolute',
            bottom: 38,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            height: 560,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}>
            <img
              src={cutoutImage}
              alt={data.player.name}
              crossOrigin="anonymous"
              style={{
                maxHeight: 550,
                maxWidth: '96%',
                objectFit: 'contain',
                objectPosition: 'bottom center',
                filter: 'drop-shadow(0 0 2px #fff) drop-shadow(0 0 14px rgba(212,175,55,0.65)) drop-shadow(0 20px 40px rgba(0,0,0,0.95))',
              }}
            />
          </div>

          {/* ── Floating Sports Stat Pills: LEFT SIDE ───────────────── */}
          <div style={{
            position: 'absolute',
            left: 24,
            bottom: 110,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            zIndex: 20,
          }}>
            {/* Massive Goal Badge */}
            <div style={{
              background: 'rgba(15, 12, 5, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '2px solid #FFD700',
              boxShadow: '0 8px 30px rgba(212,175,55,0.35), inset 0 0 15px rgba(212,175,55,0.2)',
              padding: '8px 16px',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'baseline',
              gap: 8,
              transform: 'skewX(-6deg)',
            }}>
              <span style={{ fontSize: 20 }}>⚽</span>
              <span style={{
                fontSize: 32,
                fontWeight: 900,
                fontFamily: "'Oswald', sans-serif",
                color: '#FFD700',
                lineHeight: 1,
                fontStyle: 'italic',
              }}>
                {data.goals}
              </span>
              <span style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: 2,
                fontFamily: "'Oswald', sans-serif",
              }}>
                GOALS
              </span>
            </div>

            {/* Total Points Pill */}
            <div style={{
              background: 'rgba(6, 12, 24, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
              padding: '6px 14px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'baseline',
              gap: 6,
              transform: 'skewX(-6deg)',
            }}>
              <span style={{
                fontSize: 20,
                fontWeight: 800,
                fontFamily: "'Oswald', sans-serif",
                color: '#fff',
                lineHeight: 1,
                fontStyle: 'italic',
              }}>
                +{data.points}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: accentColor,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                fontFamily: "'Oswald', sans-serif",
              }}>
                PTS
              </span>
            </div>
          </div>

          {/* ── Floating Sports Stat Pills: RIGHT SIDE ──────────────── */}
          <div style={{
            position: 'absolute',
            right: 24,
            bottom: 110,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 12,
            zIndex: 20,
          }}>
            {/* MOTM */}
            <div style={{
              background: 'rgba(6, 12, 24, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(212,175,55,0.5)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
              padding: '6px 14px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'baseline',
              gap: 6,
              transform: 'skewX(6deg)',
            }}>
              <span style={{
                fontSize: 20,
                fontWeight: 800,
                fontFamily: "'Oswald', sans-serif",
                color: '#fff',
                lineHeight: 1,
                fontStyle: 'italic',
              }}>
                {data.motm}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: accentColor,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                fontFamily: "'Oswald', sans-serif",
              }}>
                MOTM
              </span>
            </div>

            {/* Appearances */}
            <div style={{
              background: 'rgba(6, 12, 24, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
              padding: '6px 14px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'baseline',
              gap: 6,
              transform: 'skewX(6deg)',
            }}>
              <span style={{
                fontSize: 20,
                fontWeight: 800,
                fontFamily: "'Oswald', sans-serif",
                color: '#fff',
                lineHeight: 1,
                fontStyle: 'italic',
              }}>
                {data.appearances}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                fontFamily: "'Oswald', sans-serif",
              }}>
                MATCHES
              </span>
            </div>
          </div>

          {/* ── Handwritten Signature Script (Caveat) ───────────────── */}
          <div style={{
            position: 'absolute',
            bottom: 58,
            left: '50%',
            transform: 'translateX(-50%) rotate(-4deg)',
            fontSize: 50,
            fontFamily: "'Caveat', cursive",
            color: '#FFE57F',
            textShadow: `0 2px 10px rgba(0,0,0,0.95), 0 0 25px ${accentGlow}`,
            whiteSpace: 'nowrap',
            zIndex: 22,
            pointerEvents: 'none',
            userSelect: 'none',
            letterSpacing: 1,
          }}>
            {data.player.name}
          </div>
        </>
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.4)', fontSize: 14, zIndex: 20,
        }}>
          No stats recorded for this period yet.
        </div>
      )}

      {/* ── Solid Bottom Information Bar ──────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 38,
        background: '#020408',
        borderTop: '1px solid rgba(212,175,55,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 30,
      }}>
        <div style={{
          fontSize: 9.5,
          fontWeight: 800,
          color: accentColor,
          letterSpacing: 2,
          textTransform: 'uppercase',
          fontFamily: "'Oswald', sans-serif",
        }}>
          THE ENIGMATIC ELITE FC
        </div>

        <div style={{
          fontSize: 8.5,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          WWW.THEENIGMATICELITE.COM
        </div>

        <div style={{
          fontSize: 9.5,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          fontFamily: "'Oswald', sans-serif",
        }}>
          TOP SCORER
        </div>
      </div>
    </div>
  );
}
