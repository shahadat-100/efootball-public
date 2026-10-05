import React from 'react';
import { Player } from '@/features/players/types';
import { useCutoutImage } from '../../utils/useCutoutImage';

interface BirthdayCardProps {
  player: Player;
  aspect?: '4:5' | '1:1' | '16:9' | '9:16';
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function BirthdayCard({ player, cardRef }: BirthdayCardProps) {
  // Only use coverImageUrl and strip black background
  const coverImage = useCutoutImage(player.coverImageUrl);
  const accentColor = '#FFD700';
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
        boxShadow: '0 35px 90px rgba(0,0,0,0.95)',
      }}
    >
      {/* ── Background: Luxury Gold Atmosphere & Radial Glow ──────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 32%, rgba(212,175,55,0.25) 0%, rgba(184,134,11,0.06) 50%, #040711 85%)',
        zIndex: 1,
      }} />

      {/* Gold Top Spotlight */}
      <div style={{
        position: 'absolute',
        top: -40, left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 460,
        background: `radial-gradient(ellipse at 50% 25%, ${accentGlow} 0%, transparent 65%)`,
        filter: 'blur(35px)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      {/* Confetti Sparkles */}
      {[
        { top: '15%', left: '8%',  size: 6, color: '#FFD700', opacity: 0.8 },
        { top: '12%', left: '84%', size: 8, color: '#D4AF37', opacity: 0.7 },
        { top: '24%', left: '92%', size: 5, color: '#FFD700', opacity: 0.6 },
        { top: '35%', left: '6%',  size: 5, color: '#AA7C11', opacity: 0.7 },
        { top: '48%', left: '94%', size: 7, color: '#FFD700', opacity: 0.6 },
        { top: '65%', left: '8%',  size: 6, color: '#D4AF37', opacity: 0.5 },
      ].map((dot, i) => (
        <div key={i} style={{
          position: 'absolute', top: dot.top, left: dot.left,
          width: dot.size, height: dot.size,
          borderRadius: '50%', background: dot.color,
          opacity: dot.opacity, zIndex: 3,
          boxShadow: `0 0 12px ${dot.color}`,
        }} />
      ))}

      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 25,
      }}>
        {/* Logo and Club Name */}
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

        {/* Clean Jersey Badge or Birthday Badge */}
        {player.jerseyNumber ? (
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
              {player.jerseyNumber}
            </span>
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(135deg, #AA7C11, #FFD700)',
            color: '#08080C',
            fontSize: 20,
            width: 42, height: 42,
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 20px ${accentGlow}`,
          }}>
            🎂
          </div>
        )}
      </div>

      {/* ── Giant Layered Background Typography (Clean Bebas Neue) ── */}
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
          LEGEND
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
          HAPPY BIRTHDAY!
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
          ✦ CELEBRATING OUR CHAMPION TODAY ✦
        </div>
      </div>

      {/* ── Center Stage: Player Cutout Image ─────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: 38,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        height: 700,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <img
          src={coverImage}
          alt={player.name}
          crossOrigin="anonymous"
          style={{
            maxHeight: 690,
            maxWidth: '100%',
            objectFit: 'contain',
            objectPosition: 'bottom center',
            filter: 'drop-shadow(0 0 2px #fff) drop-shadow(0 0 14px rgba(212,175,55,0.65)) drop-shadow(0 20px 40px rgba(0,0,0,0.95))',
          }}
        />
      </div>

      {/* ── Floating Badges: LEFT SIDE ────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: 24,
        bottom: 110,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        zIndex: 20,
      }}>
        <div style={{
          background: 'rgba(15, 12, 5, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1.5px solid #FFD700',
          boxShadow: '0 8px 24px rgba(212,175,55,0.3)',
          padding: '8px 16px',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transform: 'skewX(-6deg)',
        }}>
          <span style={{ fontSize: 18 }}>👑</span>
          <span style={{
            fontSize: 12,
            fontWeight: 800,
            color: '#FFD700',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            fontFamily: "'Oswald', sans-serif",
          }}>
            CLUB LEGEND
          </span>
        </div>
      </div>

      {/* ── Floating Badges: RIGHT SIDE ───────────────────────────── */}
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
        <div style={{
          background: 'rgba(15, 12, 5, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1.5px solid #FFD700',
          boxShadow: '0 8px 24px rgba(212,175,55,0.3)',
          padding: '8px 16px',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transform: 'skewX(6deg)',
        }}>
          <span style={{ fontSize: 18 }}>⭐</span>
          <span style={{
            fontSize: 12,
            fontWeight: 800,
            color: '#FFD700',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            fontFamily: "'Oswald', sans-serif",
          }}>
            ELITE WARRIOR
          </span>
        </div>
      </div>

      {/* ── Signature Script Overlay (Caveat) ─────────────────────── */}
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
        {player.name}
      </div>

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
          BIRTHDAY SPECIAL
        </div>
      </div>
    </div>
  );
}
