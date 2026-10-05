import React from 'react';
import { Player } from '@/features/players/types';

interface BirthdayCardProps {
  player: Player;
  aspect?: '4:5' | '1:1' | '16:9' | '9:16';
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function BirthdayCard({ player, cardRef }: BirthdayCardProps) {
  const cutoutImage = player.coverImageUrl || player.profileImageUrl;
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
        borderRadius: 0,
        background: '#08080C',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        boxShadow: '0 35px 90px rgba(0,0,0,0.9)',
      }}
    >
      {/* ── Background: Luxury Gold Atmosphere & Radial Glow ──────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 36%, rgba(212,175,55,0.25) 0%, rgba(184,134,11,0.08) 45%, #08080C 80%)',
        zIndex: 1,
      }} />

      {/* Gold Top Spotlight */}
      <div style={{
        position: 'absolute',
        top: -60, left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 420,
        background: `radial-gradient(ellipse at 50% 20%, ${accentGlow} 0%, transparent 65%)`,
        filter: 'blur(30px)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      {/* Sparkles / Confetti Dots */}
      {[
        { top: '15%', left: '8%',  size: 6, color: '#FFD700', opacity: 0.8 },
        { top: '12%', left: '84%', size: 8, color: '#D4AF37', opacity: 0.7 },
        { top: '24%', left: '92%', size: 5, color: '#FFD700', opacity: 0.6 },
        { top: '35%', left: '6%',  size: 5, color: '#AA7C11', opacity: 0.7 },
        { top: '48%', left: '94%', size: 7, color: '#FFD700', opacity: 0.6 },
        { top: '65%', left: '8%',  size: 6, color: '#D4AF37', opacity: 0.5 },
        { top: '78%', left: '92%', size: 5, color: '#FFD700', opacity: 0.7 },
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

        {/* Birthday Emoji Badge */}
        <div style={{
          background: 'linear-gradient(135deg, #AA7C11, #FFD700)',
          color: '#08080C',
          fontSize: 22,
          width: 46, height: 46,
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 20px ${accentGlow}`,
        }}>
          🎂
        </div>
      </div>

      {/* ── Giant Layered Background Typography ───────────────────── */}
      <div style={{
        position: 'absolute',
        top: 75, left: 0, right: 0,
        textAlign: 'center',
        zIndex: 3,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        <div style={{
          fontSize: 110,
          fontWeight: 900,
          fontFamily: "'Maximum Voltage', 'Action Comics Black', 'Impact', sans-serif",
          color: 'rgba(255, 255, 255, 0.88)',
          letterSpacing: 6,
          lineHeight: 0.85,
          textTransform: 'uppercase',
          textShadow: `0 0 40px ${accentGlow}, 0 10px 40px rgba(0,0,0,0.8)`,
          WebkitTextStroke: '2px rgba(255,255,255,0.4)',
        }}>
          LEGEND
        </div>

        <div style={{
          fontSize: 22,
          fontWeight: 900,
          fontFamily: "'Neon Sans', 'Impact', sans-serif",
          color: accentColor,
          letterSpacing: 6,
          textTransform: 'uppercase',
          marginTop: 6,
          textShadow: `0 0 15px ${accentGlow}`,
        }}>
          HAPPY BIRTHDAY!
        </div>

        <div style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.7)',
          letterSpacing: 2,
          marginTop: 4,
          textTransform: 'uppercase',
        }}>
          ✦ CELEBRATING OUR CHAMPION TODAY ✦
        </div>
      </div>

      {/* ── Center Stage: Player Cutout Image ─────────────────────── */}
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
          alt={player.name}
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

      {/* ── Floating Badges: LEFT SIDE ────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: 20,
        bottom: 110,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 15,
      }}>
        <div style={{
          background: 'rgba(15, 12, 5, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid #FFD700',
          boxShadow: '0 8px 24px rgba(212,175,55,0.3)',
          padding: '8px 16px',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transform: 'skewX(-6deg)',
        }}>
          <span style={{ fontSize: 18 }}>👑</span>
          <span style={{
            fontSize: 12,
            fontWeight: 900,
            color: '#FFD700',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
          }}>
            CLUB LEGEND
          </span>
        </div>

        {player.jerseyNumber && (
          <div style={{
            background: 'rgba(7, 10, 18, 0.85)',
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
              fontSize: 20,
              fontWeight: 900,
              fontFamily: "'Action Comics Black', 'Impact', sans-serif",
              color: '#fff',
              lineHeight: 1,
            }}>
              #{player.jerseyNumber}
            </span>
            <span style={{
              fontSize: 10,
              fontWeight: 800,
              color: accentColor,
              textTransform: 'uppercase',
              letterSpacing: 1.5,
            }}>
              JERSEY
            </span>
          </div>
        )}
      </div>

      {/* ── Floating Badges: RIGHT SIDE ───────────────────────────── */}
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
        <div style={{
          background: 'rgba(15, 12, 5, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid #FFD700',
          boxShadow: '0 8px 24px rgba(212,175,55,0.3)',
          padding: '8px 16px',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transform: 'skewX(6deg)',
        }}>
          <span style={{ fontSize: 18 }}>⭐</span>
          <span style={{
            fontSize: 12,
            fontWeight: 900,
            color: '#FFD700',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
          }}>
            ELITE WARRIOR
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
        {player.name}
      </div>

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
          BIRTHDAY SPECIAL
        </div>
      </div>
    </div>
  );
}
