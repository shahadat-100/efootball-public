import React from 'react';
import { Player, PlayerSeasonStat } from '@/features/players/types';
import { RankedPlayer } from '@/features/gallery/utils/galleryStats';
import { calcTotalRawPoints } from '@/utils/playerStats';

interface PlayerProfileCardProps {
  player: Player;
  seasonStats?: PlayerSeasonStat[];
  periodData?: RankedPlayer;  // When set, shows period-specific stats instead of career totals
  title?: string;
  subtitle?: string;
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function PlayerProfileCard({
  player,
  seasonStats = [],
  periodData,
  title,
  subtitle = 'Player of the Week',
  cardRef,
}: PlayerProfileCardProps) {
  // Use period-specific data if provided, otherwise fall back to career totals
  const totalApps   = periodData ? periodData.appearances : seasonStats.reduce((a, s) => a + (s.appearances || 0), 0);
  const totalGoals  = periodData ? periodData.goals       : seasonStats.reduce((a, s) => a + (s.goals || 0), 0);
  const totalMotm   = periodData ? periodData.motm        : seasonStats.reduce((a, s) => a + (s.motmCount || 0), 0);
  const totalWins   = periodData ? periodData.wins        : seasonStats.reduce((a, s) => a + (s.wins || 0), 0);
  const totalPoints = periodData ? periodData.points      : calcTotalRawPoints(seasonStats);
  const winRate     = totalApps > 0 ? Math.round((totalWins / totalApps) * 100) : 0;

  const isMonthly = subtitle.toLowerCase().includes('month');
  const isMVP = Boolean(title && title.toUpperCase().includes('MVP')) || subtitle.toLowerCase().includes('week') || subtitle.toLowerCase().includes('month');

  // Primary cutout image: prefer coverImageUrl, fallback to profileImageUrl
  const cutoutImage = player.coverImageUrl || player.profileImageUrl;

  // Visual Theme Colors
  const accentColor = isMonthly ? '#FFD700' : '#38BDF8'; // Gold for monthly, vibrant Cyan/Sky for weekly/profile
  const accentGlow  = isMonthly ? 'rgba(212,175,55,0.45)' : 'rgba(56,189,248,0.45)';

  return (
    /* 600 × 750 — 4:5 pro sports poster export size */
    <div
      ref={cardRef}
      style={{
        width: 600,
        height: 750,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 0,
        background: '#07090E',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
      }}
    >
      {/* ── Background: Dramatic Stadium Lighting & Vignette ──────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: isMonthly
          ? 'radial-gradient(circle at 50% 38%, rgba(212,175,55,0.22) 0%, rgba(184,134,11,0.08) 45%, #07090E 80%)'
          : 'radial-gradient(circle at 50% 38%, rgba(14,165,233,0.25) 0%, rgba(37,99,235,0.10) 45%, #06080E 80%)',
        zIndex: 1,
      }} />

      {/* Subtle Stadium Floodlight Spotlights */}
      <div style={{
        position: 'absolute',
        top: -60, left: '50%', transform: 'translateX(-50%)',
        width: 480, height: 400,
        background: `radial-gradient(ellipse at 50% 20%, ${accentGlow} 0%, transparent 65%)`,
        filter: 'blur(30px)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      {/* Subtle halftone/dot grid texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(rgba(255,255,255,0.06) 1.2px, transparent 1.2px)`,
        backgroundSize: '20px 20px',
        opacity: 0.7,
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      {/* Dynamic diagonal sports angle beams (Ref 1 & 4 inspired) */}
      <div style={{
        position: 'absolute',
        top: 140, left: -100, width: 420, height: 160,
        background: `linear-gradient(115deg, ${accentGlow} 0%, transparent 70%)`,
        transform: 'rotate(-16deg)',
        filter: 'blur(20px)',
        opacity: 0.5,
        zIndex: 2,
      }} />
      <div style={{
        position: 'absolute',
        top: 220, right: -120, width: 380, height: 140,
        background: `linear-gradient(295deg, ${isMonthly ? 'rgba(245,158,11,0.2)' : 'rgba(37,99,235,0.3)'} 0%, transparent 70%)`,
        transform: 'rotate(12deg)',
        filter: 'blur(25px)',
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
              border: `1.5px solid ${isMonthly ? 'rgba(212,175,55,0.6)' : 'rgba(56,189,248,0.5)'}`,
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

        {/* Jersey Number Badge */}
        {player.jerseyNumber && (
          <div style={{
            background: isMonthly
              ? 'linear-gradient(135deg, #AA7C11, #FFD700)'
              : 'linear-gradient(135deg, #0284C7, #38BDF8)',
            color: '#07090E',
            fontSize: 22, fontWeight: 900,
            fontFamily: "'Action Comics Black', 'Impact', sans-serif",
            width: 46, height: 46,
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 20px ${accentGlow}`,
          }}>
            #{player.jerseyNumber}
          </div>
        )}
      </div>

      {/* ── Giant Layered Background Typography (Behind Player Cutout) ── */}
      <div style={{
        position: 'absolute',
        top: 80, left: 0, right: 0,
        textAlign: 'center',
        zIndex: 3,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        {/* Giant Main Title ("MVP" or "TEE") */}
        <div style={{
          fontSize: isMVP ? 180 : 160,
          fontWeight: 900,
          fontFamily: "'Maximum Voltage', 'Action Comics Black', 'Impact', sans-serif",
          color: 'rgba(255, 255, 255, 0.88)',
          letterSpacing: 4,
          lineHeight: 0.85,
          textTransform: 'uppercase',
          textShadow: `0 0 40px ${accentGlow}, 0 10px 40px rgba(0,0,0,0.8)`,
          WebkitTextStroke: '2px rgba(255,255,255,0.4)',
        }}>
          {isMVP ? 'MVP' : 'TEE'}
        </div>

        {/* Sub-label banner right under MVP */}
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
          {isMVP ? 'OF THE GAME!' : 'PLAYER PROFILE'}
        </div>

        {/* Period / Context Subtitle */}
        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.7)',
          letterSpacing: 2,
          marginTop: 4,
          textTransform: 'uppercase',
        }}>
          {subtitle}
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
            filter: isMonthly
              ? 'drop-shadow(0 0 2px #fff) drop-shadow(0 0 14px rgba(212,175,55,0.6)) drop-shadow(0 20px 40px rgba(0,0,0,0.95))'
              : 'drop-shadow(0 0 2px #fff) drop-shadow(0 0 14px rgba(56,189,248,0.7)) drop-shadow(0 20px 40px rgba(0,0,0,0.95))',
          }}
        />
      </div>

      {/* ── Floating Sports Stat Pills: LEFT COLUMN (Ref 2 & 5 Style) ── */}
      <div style={{
        position: 'absolute',
        left: 20,
        bottom: 110,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 15,
      }}>
        {/* Points Pill */}
        <div style={{
          background: 'rgba(7, 12, 22, 0.85)',
          backdropFilter: 'blur(10px)',
          border: `1.5px solid ${isMonthly ? 'rgba(212,175,55,0.5)' : 'rgba(56,189,248,0.5)'}`,
          boxShadow: `0 8px 24px rgba(0,0,0,0.6), inset 0 0 15px ${isMonthly ? 'rgba(212,175,55,0.15)' : 'rgba(56,189,248,0.15)'}`,
          padding: '6px 14px',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
          transform: 'skewX(-6deg)',
        }}>
          <span style={{
            fontSize: 24,
            fontWeight: 900,
            fontFamily: "'Action Comics Black', 'Impact', sans-serif",
            color: '#fff',
            lineHeight: 1,
          }}>
            +{totalPoints}
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

        {/* Goals Pill */}
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
            {totalGoals}
          </span>
          <span style={{
            fontSize: 10,
            fontWeight: 800,
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
          }}>
            GOAL{totalGoals === 1 ? '' : 'S'}
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
          transform: 'skewX(-6deg)',
        }}>
          <span style={{
            fontSize: 22,
            fontWeight: 900,
            fontFamily: "'Action Comics Black', 'Impact', sans-serif",
            color: '#fff',
            lineHeight: 1,
          }}>
            {totalWins}
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

      {/* ── Floating Sports Stat Pills: RIGHT COLUMN (Ref 2 & 5 Style) ── */}
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
          border: `1.5px solid ${isMonthly ? 'rgba(212,175,55,0.5)' : 'rgba(56,189,248,0.5)'}`,
          boxShadow: `0 8px 24px rgba(0,0,0,0.6), inset 0 0 15px ${isMonthly ? 'rgba(212,175,55,0.15)' : 'rgba(56,189,248,0.15)'}`,
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
            {totalMotm}
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

        {/* Win Rate Pill */}
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
            {winRate}%
          </span>
          <span style={{
            fontSize: 10,
            fontWeight: 800,
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
          }}>
            WIN RATE
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
            {totalApps}
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
      </div>

      {/* ── Handwritten Signature Script Overlay Across Jersey (Ref 2 & 5) ── */}
      <div style={{
        position: 'absolute',
        bottom: 56,
        left: '50%',
        transform: 'translateX(-50%) rotate(-4deg)',
        fontSize: 48,
        fontFamily: "'The Wildeast', 'Elegant Bloom', cursive",
        color: isMonthly ? '#FFE57F' : '#E0F2FE',
        textShadow: `0 2px 10px rgba(0,0,0,0.9), 0 0 25px ${accentGlow}`,
        whiteSpace: 'nowrap',
        zIndex: 16,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        {player.name}
      </div>

      {/* ── Solid Bottom Information Bar (Ref 1 Style) ────────────── */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 38,
        background: '#04060A',
        borderTop: `1px solid ${isMonthly ? 'rgba(212,175,55,0.35)' : 'rgba(56,189,248,0.35)'}`,
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
          OFFICIAL AWARDS
        </div>
      </div>
    </div>
  );
}
