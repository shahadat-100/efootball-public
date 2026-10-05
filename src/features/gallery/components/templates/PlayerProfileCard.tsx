import React from 'react';
import { Player, PlayerSeasonStat } from '@/features/players/types';
import { RankedPlayer } from '@/features/gallery/utils/galleryStats';
import { calcTotalRawPoints } from '@/utils/playerStats';
import { useCutoutImage } from '../../utils/useCutoutImage';

interface PlayerProfileCardProps {
  player: Player;
  seasonStats?: PlayerSeasonStat[];
  periodData?: RankedPlayer;
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
  const totalApps   = periodData ? periodData.appearances : seasonStats.reduce((a, s) => a + (s.appearances || 0), 0);
  const totalGoals  = periodData ? periodData.goals       : seasonStats.reduce((a, s) => a + (s.goals || 0), 0);
  const totalMotm   = periodData ? periodData.motm        : seasonStats.reduce((a, s) => a + (s.motmCount || 0), 0);
  const totalWins   = periodData ? periodData.wins        : seasonStats.reduce((a, s) => a + (s.wins || 0), 0);
  const totalPoints = periodData ? periodData.points      : calcTotalRawPoints(seasonStats);
  const winRate     = totalApps > 0 ? Math.round((totalWins / totalApps) * 100) : 0;

  const isMonthly = subtitle.toLowerCase().includes('month');
  const isMVP = Boolean(title && title.toUpperCase().includes('MVP')) || subtitle.toLowerCase().includes('week') || subtitle.toLowerCase().includes('month');

  // Automatic transparency processing for black-background cutouts
  const rawImage = player.coverImageUrl || player.profileImageUrl;
  const cutoutImage = useCutoutImage(rawImage);

  // Colors
  const accentColor = isMonthly ? '#FFD700' : '#38BDF8';
  const accentGlow  = isMonthly ? 'rgba(212,175,55,0.45)' : 'rgba(56,189,248,0.45)';

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
      {/* ── Background: Deep Dramatic Stadium Lighting ────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: isMonthly
          ? 'radial-gradient(circle at 50% 32%, rgba(212,175,55,0.22) 0%, rgba(184,134,11,0.06) 50%, #040711 85%)'
          : 'radial-gradient(circle at 50% 32%, rgba(14,165,233,0.28) 0%, rgba(37,99,235,0.08) 50%, #040711 85%)',
        zIndex: 1,
      }} />

      {/* Stadium Spotlight Cone behind player */}
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
        {/* Club Crest & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/images/club-logo.jpg"
            alt="Club Logo"
            crossOrigin="anonymous"
            style={{
              width: 44, height: 44,
              borderRadius: 10,
              objectFit: 'cover',
              border: `1.5px solid ${accentColor}`,
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

        {/* Clean Jersey Number Badge */}
        {player.jerseyNumber && (
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
        )}
      </div>

      {/* ── Giant Athletic Typography: "MVP" or "TEE" (Clean Bebas Neue) ── */}
      <div style={{
        position: 'absolute',
        top: 72, left: 0, right: 0,
        textAlign: 'center',
        zIndex: 4,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        <div style={{
          fontSize: isMVP ? 190 : 175,
          fontWeight: 900,
          fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
          color: '#ffffff',
          letterSpacing: 8,
          lineHeight: 0.85,
          textTransform: 'uppercase',
          textShadow: `0 0 40px ${accentGlow}, 0 8px 30px rgba(0,0,0,0.9)`,
        }}>
          {isMVP ? 'MVP' : 'TEE'}
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
          {isMVP ? 'OF THE GAME!' : 'PLAYER PROFILE'}
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
          {subtitle}
        </div>
      </div>

      {/* ── Hero Stage: Large Player Cutout (Zero Black Box) ──────── */}
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
          alt={player.name}
          crossOrigin="anonymous"
          style={{
            maxHeight: 550,
            maxWidth: '96%',
            objectFit: 'contain',
            objectPosition: 'bottom center',
            filter: isMonthly
              ? 'drop-shadow(0 0 2px #fff) drop-shadow(0 0 14px rgba(212,175,55,0.6)) drop-shadow(0 20px 40px rgba(0,0,0,0.95))'
              : 'drop-shadow(0 0 2px #fff) drop-shadow(0 0 14px rgba(56,189,248,0.7)) drop-shadow(0 20px 40px rgba(0,0,0,0.95))',
          }}
        />
      </div>

      {/* ── Floating Sports Stat Pills: LEFT SIDE ─────────────────── */}
      <div style={{
        position: 'absolute',
        left: 24,
        bottom: 110,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        zIndex: 20,
      }}>
        {/* Points Badge */}
        <div style={{
          background: 'rgba(6, 12, 24, 0.8)',
          backdropFilter: 'blur(12px)',
          border: `1.5px solid ${accentColor}`,
          boxShadow: `0 8px 24px rgba(0,0,0,0.7), 0 0 14px ${accentGlow}`,
          padding: '6px 14px',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
          transform: 'skewX(-6deg)',
        }}>
          <span style={{
            fontSize: 22,
            fontWeight: 800,
            fontFamily: "'Oswald', sans-serif",
            color: '#fff',
            lineHeight: 1,
            fontStyle: 'italic',
          }}>
            +{totalPoints}
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

        {/* Goals Badge */}
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
            {totalGoals}
          </span>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            fontFamily: "'Oswald', sans-serif",
          }}>
            GOAL{totalGoals === 1 ? '' : 'S'}
          </span>
        </div>

        {/* Wins Badge */}
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
            {totalWins}
          </span>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            fontFamily: "'Oswald', sans-serif",
          }}>
            WINS
          </span>
        </div>
      </div>

      {/* ── Floating Sports Stat Pills: RIGHT SIDE ────────────────── */}
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
        {/* Dominates Field Tag */}
        <div style={{
          background: isMonthly ? 'rgba(212,175,55,0.18)' : 'rgba(14,165,233,0.18)',
          border: `1.5px solid ${accentColor}`,
          boxShadow: `0 0 15px ${accentGlow}`,
          backdropFilter: 'blur(10px)',
          padding: '5px 12px',
          borderRadius: 10,
          fontSize: 9.5,
          fontWeight: 800,
          color: accentColor,
          letterSpacing: 2,
          textTransform: 'uppercase',
          fontFamily: "'Oswald', sans-serif",
          transform: 'skewX(6deg)',
        }}>
          DOMINATES THE PITCH
        </div>

        {/* MOTM Badge */}
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
            {totalMotm}
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

        {/* Win Rate Badge */}
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
            {winRate}%
          </span>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            fontFamily: "'Oswald', sans-serif",
          }}>
            WIN ACCURACY
          </span>
        </div>
      </div>

      {/* ── Signature Script Overlay (Caveat Natural Handwriting) ──── */}
      <div style={{
        position: 'absolute',
        bottom: 58,
        left: '50%',
        transform: 'translateX(-50%) rotate(-4deg)',
        fontSize: 50,
        fontFamily: "'Caveat', cursive",
        color: '#FFFFFF',
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
        borderTop: `1px solid ${accentGlow}`,
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
          OFFICIAL AWARDS
        </div>
      </div>
    </div>
  );
}
