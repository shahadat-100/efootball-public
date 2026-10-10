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
  const totalApps        = periodData ? periodData.appearances : seasonStats.reduce((a, s) => a + (s.appearances || 0), 0);
  const totalGoals       = periodData ? periodData.goals       : seasonStats.reduce((a, s) => a + (s.goals || 0), 0);
  const totalMotm        = periodData ? periodData.motm        : seasonStats.reduce((a, s) => a + (s.motmCount || 0), 0);
  const totalWins        = periodData ? periodData.wins        : seasonStats.reduce((a, s) => a + (s.wins || 0), 0);
  const totalPoints      = periodData ? periodData.points      : calcTotalRawPoints(seasonStats);
  const totalCleansheets = seasonStats.reduce((a, s) => a + (s.cleansheets || 0), 0);
  const totalHattricks   = seasonStats.reduce((a, s) => a + (s.hattricks || 0), 0);
  const winRate          = totalApps > 0 ? Math.round((totalWins / totalApps) * 100) : 0;
  const primaryRole      = (player.playerRoles ?? [])[0] || 'FORWARD';

  const isMonthly = subtitle.toLowerCase().includes('month');
  const isMVP = Boolean(title && title.toUpperCase().includes('MVP')) || subtitle.toLowerCase().includes('week') || subtitle.toLowerCase().includes('month');

  // Cover image with full transparency preserved
  const coverImage = useCutoutImage(player.coverImageUrl);

  // Split name for two-tone athletic typography
  const nameParts = player.name.trim().split(' ');
  const firstName = nameParts[0] || player.name;
  const lastName  = nameParts.slice(1).join(' ');

  // ═══════════════════════════════════════════════════════════════════════════
  // DESIGN A: MVP OF THE WEEK / MONTH (Reference 5 — Dark/Red Grungy MVP Poster)
  // ═══════════════════════════════════════════════════════════════════════════
  if (isMVP) {
    const accent = isMonthly ? '#FFD700' : '#EF4444';
    const accentGlow = isMonthly ? 'rgba(212,175,55,0.45)' : 'rgba(239,68,68,0.45)';
    const headerLabel = isMonthly ? 'PLAYER OF THE MONTH' : 'PLAYER OF THE WEEK';

    return (
      <div
        ref={cardRef}
        style={{
          width: 600,
          height: 750,
          position: 'relative',
          overflow: 'hidden',
          background: '#0B0B0E',
          fontFamily: "'Inter', system-ui, sans-serif",
          boxShadow: '0 30px 80px rgba(0,0,0,0.95)',
        }}
      >
        {/* Dark charcoal grunge background with radial spotlight */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: isMonthly
            ? 'radial-gradient(ellipse at 75% 30%, rgba(212,175,55,0.2) 0%, rgba(15,15,20,0.96) 75%)'
            : 'radial-gradient(ellipse at 75% 30%, rgba(225,29,72,0.25) 0%, rgba(15,15,20,0.96) 75%)',
        }} />

        {/* Dynamic diagonal slash graphic across the background (like Ref 5) */}
        <div style={{
          position: 'absolute', width: '160%', height: 70,
          background: `linear-gradient(90deg, transparent, ${isMonthly ? 'rgba(212,175,55,0.18)' : 'rgba(239,68,68,0.2)'}, transparent)`,
          transform: 'rotate(-26deg)', top: '48%', left: '-30%',
          zIndex: 2, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: '140%', height: 3,
          background: isMonthly ? 'rgba(212,175,55,0.35)' : 'rgba(239,68,68,0.35)',
          transform: 'rotate(-26deg)', top: '46%', left: '-20%',
          zIndex: 2, pointerEvents: 'none',
        }} />

        {/* Top Header: Club Crest + League Info */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 25,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/images/club-logo.jpg"
              alt="Club Logo"
              crossOrigin="anonymous"
              style={{
                width: 38, height: 38, borderRadius: 8,
                objectFit: 'cover',
                border: `1.5px solid ${accent}`,
                boxShadow: `0 0 12px ${accentGlow}`,
              }}
            />
            <div>
              <div style={{
                fontFamily: "'Oswald', sans-serif", fontSize: 13, fontWeight: 900,
                color: '#fff', letterSpacing: 2, textTransform: 'uppercase', lineHeight: 1.2,
              }}>
                THE ENIGMATIC ELITE
              </div>
              <div style={{
                fontFamily: "'Oswald', sans-serif", fontSize: 9, fontWeight: 700,
                color: accent, letterSpacing: 2, textTransform: 'uppercase', fontStyle: 'italic',
              }}>
                OFFICIAL MVP AWARDS
              </div>
            </div>
          </div>

          {/* Jersey Badge */}
          {player.jerseyNumber && (
            <div style={{
              background: 'rgba(6, 10, 18, 0.85)',
              border: `1.5px solid ${accent}`,
              boxShadow: `0 4px 14px rgba(0,0,0,0.6), 0 0 10px ${accentGlow}`,
              borderRadius: 10,
              padding: '4px 14px',
              display: 'flex', alignItems: 'baseline', gap: 2,
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>#</span>
              <span style={{
                fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 800,
                color: '#fff', lineHeight: 1,
              }}>
                {player.jerseyNumber}
              </span>
            </div>
          )}
        </div>

        {/* Behind Player Title: Script "Player of the Week" + Huge Distressed "MVP" */}
        <div style={{
          position: 'absolute', top: 68, left: 24, right: 24,
          zIndex: 4, pointerEvents: 'none', userSelect: 'none',
        }}>
          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 34,
            fontWeight: 700,
            color: accent,
            transform: 'rotate(-3deg)',
            marginLeft: 8,
            marginBottom: -16,
            textShadow: '0 2px 12px rgba(0,0,0,0.9)',
          }}>
            {headerLabel}
          </div>
          <div style={{
            fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
            fontSize: 185,
            fontWeight: 400,
            color: '#ffffff',
            letterSpacing: 6,
            lineHeight: 0.85,
            textTransform: 'uppercase',
            textShadow: `0 0 35px ${accentGlow}, 0 6px 25px rgba(0,0,0,0.95)`,
          }}>
            MVP
          </div>
          <div style={{
            fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 700,
            color: 'rgba(255,255,255,0.7)', letterSpacing: 3, textTransform: 'uppercase',
            marginLeft: 8, marginTop: 4,
          }}>
            {subtitle}
          </div>
        </div>

        {/* Left Side: Skewed Stat Badges & Details (Ref 5 style) */}
        <div style={{
          position: 'absolute', left: 24, bottom: 110,
          display: 'flex', flexDirection: 'column', gap: 10,
          zIndex: 20,
        }}>
          {/* Position & Squad Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.14)',
            padding: '3px 10px', borderRadius: 4, width: 'fit-content',
            transform: 'skewX(-10deg)',
          }}>
            <span style={{
              fontFamily: "'Oswald', sans-serif", fontSize: 10, fontWeight: 900,
              color: accent, letterSpacing: 2, textTransform: 'uppercase',
            }}>
              {primaryRole}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>•</span>
            <span style={{
              fontFamily: "'Oswald', sans-serif", fontSize: 9.5, fontWeight: 700,
              color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5, textTransform: 'uppercase',
            }}>
              {totalApps} APPS ({winRate}% W)
            </span>
          </div>

          {/* Goals Pill */}
          <div style={{
            background: isMonthly
              ? 'linear-gradient(90deg, #D97706 0%, #78350F 100%)'
              : 'linear-gradient(90deg, #DC2626 0%, #7F1D1D 100%)',
            border: `1.5px solid ${accent}`,
            boxShadow: `0 6px 20px rgba(0,0,0,0.7), 0 0 12px ${accentGlow}`,
            padding: '6px 18px 6px 14px',
            borderRadius: 8,
            display: 'flex', alignItems: 'baseline', gap: 8,
            transform: 'skewX(-12deg)',
            width: 'fit-content',
          }}>
            <span style={{
              fontFamily: "'Oswald', sans-serif", fontSize: 32, fontWeight: 900,
              color: '#fff', lineHeight: 1, fontStyle: 'italic',
            }}>
              {totalGoals}
            </span>
            <span style={{
              fontFamily: "'Caveat', cursive", fontSize: 18, fontWeight: 700,
              color: isMonthly ? '#FEF08A' : '#FECACA', fontStyle: 'italic',
            }}>
              Goals {totalHattricks > 0 ? `(${totalHattricks} HT)` : ''}
            </span>
          </div>

          {/* MOTM Pill */}
          <div style={{
            background: isMonthly
              ? 'linear-gradient(90deg, #B45309 0%, #451A03 100%)'
              : 'linear-gradient(90deg, #B91C1C 0%, #450A0A 100%)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
            padding: '6px 18px 6px 14px',
            borderRadius: 8,
            display: 'flex', alignItems: 'baseline', gap: 8,
            transform: 'skewX(-12deg)',
            width: 'fit-content',
          }}>
            <span style={{
              fontFamily: "'Oswald', sans-serif", fontSize: 30, fontWeight: 900,
              color: '#fff', lineHeight: 1, fontStyle: 'italic',
            }}>
              {totalMotm}
            </span>
            <span style={{
              fontFamily: "'Caveat', cursive", fontSize: 18, fontWeight: 700,
              color: isMonthly ? '#FEF08A' : '#FECACA', fontStyle: 'italic',
            }}>
              MOTM
            </span>
          </div>

          {/* Total Points Pill */}
          <div style={{
            background: isMonthly
              ? 'linear-gradient(90deg, #92400E 0%, #2D1500 100%)'
              : 'linear-gradient(90deg, #991B1B 0%, #2B0707 100%)',
            border: '1.5px solid rgba(255,255,255,0.2)',
            boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
            padding: '6px 18px 6px 14px',
            borderRadius: 8,
            display: 'flex', alignItems: 'baseline', gap: 8,
            transform: 'skewX(-12deg)',
            width: 'fit-content',
          }}>
            <span style={{
              fontFamily: "'Oswald', sans-serif", fontSize: 28, fontWeight: 900,
              color: '#fff', lineHeight: 1, fontStyle: 'italic',
            }}>
              +{totalPoints}
            </span>
            <span style={{
              fontFamily: "'Caveat', cursive", fontSize: 18, fontWeight: 700,
              color: isMonthly ? '#FEF08A' : '#FECACA', fontStyle: 'italic',
            }}>
              Pts
            </span>
          </div>
        </div>

        {/* Bottom Left Quote & Badge (Ref 5) */}
        <div style={{
          position: 'absolute', left: 24, bottom: 50, width: 200,
          zIndex: 20, pointerEvents: 'none',
        }}>
          <div style={{ color: accent, fontSize: 20, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
            ✱
          </div>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 9.5, color: 'rgba(255,255,255,0.75)',
            fontStyle: 'italic', lineHeight: 1.35,
          }}>
            &ldquo;Consistency turned discipline into greatness.&rdquo;
          </div>
          <div style={{
            fontFamily: "'Oswald', sans-serif", fontSize: 8.5, color: accent,
            letterSpacing: 1.5, marginTop: 4, textTransform: 'uppercase',
          }}>
            @TheEnigmaticElite
          </div>
        </div>

        {/* Hero Stage: Player Cutout — MUCH BIGGER, RIGHT SHIFTED */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: -45,
          width: 620,
          height: 820,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          zIndex: 10,
          pointerEvents: 'none',
        }}>
          <img
            src={coverImage}
            alt={player.name}
            crossOrigin="anonymous"
            style={{
              maxHeight: 820,
              maxWidth: 'none',
              transform: 'scale(1.18)',
              transformOrigin: 'bottom right',
              objectFit: 'contain',
              objectPosition: 'bottom right',
              filter: `drop-shadow(0 0 2px #ffffff) drop-shadow(0 0 20px ${accentGlow}) drop-shadow(0 15px 40px rgba(0,0,0,0.95))`,
            }}
          />
        </div>

        {/* Bottom Right Player Name (Clean Sans + Fiery Red Script like Ref 5) */}
        <div style={{
          position: 'absolute', bottom: 48, right: 28,
          zIndex: 22, textAlign: 'right', pointerEvents: 'none',
        }}>
          <div style={{
            fontFamily: "'Oswald', sans-serif", fontSize: 24, fontWeight: 900,
            color: '#ffffff', textTransform: 'uppercase', letterSpacing: 2,
            lineHeight: 1, textShadow: '0 3px 12px rgba(0,0,0,0.95)',
          }}>
            {firstName}
          </div>
          <div style={{
            fontFamily: "'Caveat', cursive", fontSize: 44, fontWeight: 700,
            color: accent, lineHeight: 0.9, marginTop: 2,
            transform: 'rotate(-4deg)',
            textShadow: `0 2px 10px rgba(0,0,0,0.95), 0 0 20px ${accentGlow}`,
          }}>
            {lastName || firstName}
          </div>
        </div>

        {/* Solid Bottom Bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 38, background: '#020408',
          borderTop: `1px solid ${accentGlow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 24px', zIndex: 30,
        }}>
          <span style={{
            fontFamily: "'Oswald', sans-serif", fontSize: 10, fontWeight: 800,
            color: accent, letterSpacing: 2.5, textTransform: 'uppercase',
          }}>
            THE ENIGMATIC ELITE
          </span>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DESIGN B: SQUAD PROFILE SHOWCASE (Reference 4 — Diagonal Blue Banner, Player Right)
  // ═══════════════════════════════════════════════════════════════════════════
  const role = (player.playerRoles ?? [])[0]?.toUpperCase() || 'OFFICIAL SQUAD';

  return (
    <div
      ref={cardRef}
      style={{
        width: 600,
        height: 750,
        position: 'relative',
        overflow: 'hidden',
        background: '#F8FAFC',
        fontFamily: "'Inter', system-ui, sans-serif",
        boxShadow: '0 30px 80px rgba(0,0,0,0.95)',
      }}
    >
      {/* Light subtle repeating watermark texture */}
      <div style={{
        position: 'absolute', top: -40, left: -40, right: -40, height: '65%',
        zIndex: 1, opacity: 0.05, pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', gap: 8,
        transform: 'rotate(-8deg)',
      }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 62,
            whiteSpace: 'nowrap', color: '#0F172A', letterSpacing: 4,
          }}>
            THE ENIGMATIC ELITE • OFFICIAL SQUAD • THE ENIGMATIC ELITE
          </div>
        ))}
      </div>

      {/* Royal Blue Diagonal Banner (Ref 4) */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        clipPath: 'polygon(0 42%, 100% 64%, 100% 100%, 0 100%)',
        background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 60%, #0F172A 100%)',
      }} />

      {/* Top Left: Badge & Crest */}
      <div style={{
        position: 'absolute', top: 24, left: 28,
        zIndex: 25, display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 10, fontWeight: 900,
          letterSpacing: 2.5, textTransform: 'uppercase', color: '#1E3A8A',
          lineHeight: 1.2,
        }}>
          OFFICIAL SQUAD<br />PROFILE
        </div>
        <img
          src="/images/club-logo.jpg"
          alt=""
          crossOrigin="anonymous"
          style={{
            width: 44, height: 44, borderRadius: 10,
            objectFit: 'cover', border: '2px solid #1E40AF',
            boxShadow: '0 4px 14px rgba(30,64,175,0.3)',
          }}
        />
      </div>

      {/* Inside Blue Banner (Left side): Giant Tilted Name & Role (Ref 4) */}
      <div style={{
        position: 'absolute', bottom: 85, left: 28, width: 280,
        zIndex: 15, transform: 'rotate(-5deg)',
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
          fontSize: 64,
          fontWeight: 400,
          color: '#ffffff',
          lineHeight: 0.88,
          textTransform: 'uppercase',
          letterSpacing: 3,
          textShadow: '0 4px 16px rgba(0,0,0,0.5)',
        }}>
          {firstName}<br />{lastName || 'ELITE'}
        </div>
        <div style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 12, fontWeight: 800,
          color: '#93C5FD', letterSpacing: 2, textTransform: 'uppercase',
          marginTop: 8,
        }}>
          {role} · #{player.jerseyNumber || '10'}
        </div>

        {/* Stats grid inside banner */}
        <div style={{
          marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: 6, width: 'fit-content',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)',
            padding: '4px 10px', borderRadius: 6,
            fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 800,
            color: '#fff', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ color: '#93C5FD' }}>⚽</span> {totalGoals} GOALS
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)',
            padding: '4px 10px', borderRadius: 6,
            fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 800,
            color: '#fff', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ color: '#93C5FD' }}>🏟️</span> {totalApps} MATCHES
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)',
            padding: '4px 10px', borderRadius: 6,
            fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 800,
            color: '#fff', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ color: '#FCD34D' }}>⭐</span> {totalMotm} MOTM
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)',
            padding: '4px 10px', borderRadius: 6,
            fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 800,
            color: '#93C5FD', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ color: '#86EFAC' }}>📈</span> {winRate}% WINS
          </div>
          {totalCleansheets > 0 && (
            <div style={{
              gridColumn: 'span 2',
              background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)',
              padding: '3px 10px', borderRadius: 6,
              fontFamily: "'Oswald', sans-serif", fontSize: 10, fontWeight: 800,
              color: '#E0E7FF', letterSpacing: 1,
            }}>
              🧤 {totalCleansheets} CLEAN SHEETS
            </div>
          )}
        </div>
      </div>

      {/* Hero Stage: Player Cutout — MUCH BIGGER, RIGHT ALIGNED */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: -55,
        width: 650,
        height: 850,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <img
          src={coverImage}
          alt={player.name}
          crossOrigin="anonymous"
          style={{
            maxHeight: 850,
            maxWidth: 'none',
            transform: 'scale(1.20)',
            transformOrigin: 'bottom right',
            objectFit: 'contain',
            objectPosition: 'bottom right',
            // mix-blend-mode: multiply makes black pixels transparent on light backgrounds.
            // This handles legacy images that were uploaded with a black background (old JPEG pipeline).
            mixBlendMode: 'multiply',
            filter: 'drop-shadow(0 14px 30px rgba(0,0,0,0.25))',
          }}
        />
      </div>

      {/* Solid Bottom Bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 38, background: '#0F172A',
        borderTop: '1px solid #1E40AF',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', zIndex: 30,
      }}>
        <span style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 9.5, fontWeight: 800,
          color: '#60A5FA', letterSpacing: 2, textTransform: 'uppercase',
        }}>
          THE ENIGMATIC ELITE
        </span>
        <span style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 9.5, fontWeight: 800,
          color: '#fff', letterSpacing: 1.5, textTransform: 'uppercase',
        }}>
          OFFICIAL SQUAD
        </span>
      </div>
    </div>
  );
}
