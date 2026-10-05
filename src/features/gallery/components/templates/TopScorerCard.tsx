import React from 'react';
import { RankedPlayer } from '../../utils/galleryStats';

interface TopScorerCardProps {
  data: RankedPlayer | null;
  periodLabel: string;
  type: 'weekly' | 'monthly' | 'season';
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function TopScorerCard({ data, periodLabel, type, cardRef }: TopScorerCardProps) {
  const isMonthly = type === 'monthly';
  const cutoutImage = data?.player.coverImageUrl || data?.player.profileImageUrl;

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
        borderRadius: 0,
        background: '#07080D',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
      }}
    >
      {/* ── Background: Golden Stadium Spotlight Atmosphere ───────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 36%, rgba(212,175,55,0.25) 0%, rgba(184,134,11,0.10) 45%, #07080D 80%)',
        zIndex: 1,
      }} />

      {/* Gold Stadium Spotlight Beam */}
      <div style={{
        position: 'absolute',
        top: -60, left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 420,
        background: `radial-gradient(ellipse at 50% 20%, ${accentGlow} 0%, transparent 65%)`,
        filter: 'blur(30px)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      {/* Dot Grid Texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1.2px, transparent 1.2px)',
        backgroundSize: '20px 20px',
        opacity: 0.7,
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      {/* Angular Light Slashes */}
      <div style={{
        position: 'absolute',
        top: 140, right: -80, width: 400, height: 140,
        background: 'linear-gradient(285deg, rgba(212,175,55,0.2) 0%, transparent 70%)',
        transform: 'rotate(14deg)',
        filter: 'blur(20px)',
        opacity: 0.6,
        zIndex: 2,
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
              width: 42, height: 42,
              borderRadius: 10,
              objectFit: 'cover',
              border: '1.5px solid rgba(212,175,55,0.6)',
              boxShadow: `0 0 15px ${accentGlow}`,
            }}
          />
          <div>
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>
              THE ENIGMATIC ELITE
            </div>
            <div style={{ fontSize: 9, color: accentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2.5, fontStyle: 'italic' }}>
              In Mystery We Reign
            </div>
          </div>
        </div>

        {/* Golden Boot / Jersey Badge */}
        {data?.player.jerseyNumber && (
          <div style={{
            background: 'linear-gradient(135deg, #AA7C11, #FFD700)',
            color: '#07080D',
            fontSize: 22, fontWeight: 900,
            fontFamily: "'Action Comics Black', 'Impact', sans-serif",
            width: 46, height: 46,
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 20px ${accentGlow}`,
          }}>
            #{data.player.jerseyNumber}
          </div>
        )}
      </div>

      {/* ── Giant Layered Background Typography (Behind Player) ───── */}
      <div style={{
        position: 'absolute',
        top: 75, left: 0, right: 0,
        textAlign: 'center',
        zIndex: 3,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        <div style={{
          fontSize: 105,
          fontWeight: 900,
          fontFamily: "'Maximum Voltage', 'Action Comics Black', 'Impact', sans-serif",
          color: 'rgba(255, 255, 255, 0.88)',
          letterSpacing: 6,
          lineHeight: 0.85,
          textTransform: 'uppercase',
          textShadow: `0 0 40px ${accentGlow}, 0 10px 40px rgba(0,0,0,0.8)`,
          WebkitTextStroke: '2px rgba(255,255,255,0.4)',
        }}>
          SCORER
        </div>

        <div style={{
          fontSize: 18,
          fontWeight: 900,
          fontFamily: "'Neon Sans', 'Impact', sans-serif",
          color: accentColor,
          letterSpacing: 8,
          textTransform: 'uppercase',
          marginTop: 6,
          textShadow: `0 0 15px ${accentGlow}`,
        }}>
          GOLDEN BOOT AWARD
        </div>

        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.7)',
          letterSpacing: 2,
          marginTop: 4,
          textTransform: 'uppercase',
        }}>
          {isMonthly ? 'Top Scorer of the Month' : 'Top Scorer of the Week'} · {periodLabel}
        </div>
      </div>

      {data ? (
        <>
          {/* ── Center Stage: Player Cutout Image ───────────────────── */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            height: 520,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 8,
            pointerEvents: 'none',
          }}>
            <img
              src={cutoutImage}
              alt={data.player.name}
              crossOrigin="anonymous"
              style={{
                maxHeight: 510,
                maxWidth: '92%',
                objectFit: 'contain',
                objectPosition: 'bottom center',
                filter: 'drop-shadow(0 0 2px #fff) drop-shadow(0 0 16px rgba(212,175,55,0.7)) drop-shadow(0 20px 40px rgba(0,0,0,0.95))',
              }}
            />
          </div>

          {/* ── Floating Sports Stat Pills: LEFT COLUMN (Goals Primary) ── */}
          <div style={{
            position: 'absolute',
            left: 20,
            bottom: 110,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            zIndex: 15,
          }}>
            {/* Massive Goal Badge */}
            <div style={{
              background: 'rgba(15, 12, 5, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '2px solid #FFD700',
              boxShadow: '0 8px 30px rgba(212,175,55,0.35), inset 0 0 15px rgba(212,175,55,0.2)',
              padding: '8px 16px',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'baseline',
              gap: 8,
              transform: 'skewX(-6deg)',
            }}>
              <span style={{ fontSize: 20 }}>⚽</span>
              <span style={{
                fontSize: 32,
                fontWeight: 900,
                fontFamily: "'Action Comics Black', 'Impact', sans-serif",
                color: '#FFD700',
                lineHeight: 1,
              }}>
                {data.goals}
              </span>
              <span style={{
                fontSize: 12,
                fontWeight: 900,
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: 2,
              }}>
                GOALS
              </span>
            </div>

            {/* Total Points Pill */}
            <div style={{
              background: 'rgba(7, 12, 22, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
              padding: '6px 14px',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'baseline',
              gap: 6,
              transform: 'skewX(-6deg)',
            }}>
              <span style={{
                fontSize: 22,
                fontWeight: 900,
                fontFamily: "'Action Comics Black', 'Impact', sans-serif",
                color: '#fff',
                lineHeight: 1,
              }}>
                +{data.points}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                color: accentColor,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
              }}>
                PTS
              </span>
            </div>
          </div>

          {/* ── Floating Sports Stat Pills: RIGHT COLUMN ───────────── */}
          <div style={{
            position: 'absolute',
            right: 20,
            bottom: 110,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 10,
            zIndex: 15,
          }}>
            {/* MOTM Pill */}
            <div style={{
              background: 'rgba(7, 12, 22, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(212,175,55,0.5)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
              padding: '6px 14px',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'baseline',
              gap: 6,
              transform: 'skewX(6deg)',
            }}>
              <span style={{
                fontSize: 22,
                fontWeight: 900,
                fontFamily: "'Action Comics Black', 'Impact', sans-serif",
                color: '#fff',
                lineHeight: 1,
              }}>
                {data.motm}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                color: accentColor,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
              }}>
                MOTM
              </span>
            </div>

            {/* Appearances Pill */}
            <div style={{
              background: 'rgba(7, 12, 22, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
              padding: '6px 14px',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'baseline',
              gap: 6,
              transform: 'skewX(6deg)',
            }}>
              <span style={{
                fontSize: 22,
                fontWeight: 900,
                fontFamily: "'Action Comics Black', 'Impact', sans-serif",
                color: '#fff',
                lineHeight: 1,
              }}>
                {data.appearances}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
              }}>
                MATCHES
              </span>
            </div>

            {/* Wins Pill */}
            <div style={{
              background: 'rgba(7, 12, 22, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
              padding: '6px 14px',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'baseline',
              gap: 6,
              transform: 'skewX(6deg)',
            }}>
              <span style={{
                fontSize: 22,
                fontWeight: 900,
                fontFamily: "'Action Comics Black', 'Impact', sans-serif",
                color: '#fff',
                lineHeight: 1,
              }}>
                {data.wins}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
              }}>
                WINS
              </span>
            </div>
          </div>

          {/* ── Handwritten Signature Script Overlay Across Jersey ──── */}
          <div style={{
            position: 'absolute',
            bottom: 56,
            left: '50%',
            transform: 'translateX(-50%) rotate(-4deg)',
            fontSize: 48,
            fontFamily: "'The Wildeast', 'Elegant Bloom', cursive",
            color: '#FFE57F',
            textShadow: `0 2px 10px rgba(0,0,0,0.9), 0 0 25px ${accentGlow}`,
            whiteSpace: 'nowrap',
            zIndex: 16,
            pointerEvents: 'none',
            userSelect: 'none',
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
        background: '#040508',
        borderTop: '1px solid rgba(212,175,55,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 20,
      }}>
        <div style={{
          fontSize: 9,
          fontWeight: 900,
          color: accentColor,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          THE ENIGMATIC ELITE FC
        </div>

        <div style={{
          fontSize: 8.5,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          WWW.THEENIGMATICELITE.COM
        </div>

        <div style={{
          fontSize: 9,
          fontWeight: 900,
          color: '#fff',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}>
          TOP SCORER
        </div>
      </div>
    </div>
  );
}
