import { useState } from 'react';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { Player } from '../types';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { useFootballStore } from '@/store/footballStore';
import { useBackgroundRemoval } from '../hooks/useBackgroundRemoval';

interface PlayerCardProps {
  player: Player;
  onView: () => void;
  index?: number;
}

interface CommonVariantProps {
  player: Player;
  stats: ReturnType<typeof usePlayerStats>;
  totalPoints: number;
  rank: number | null;
  winRate: number;
  displayImage: string | null;
  isCutout: boolean;
  bgLoading: boolean;
  hovered: boolean;
  firstName: string;
  lastName: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// VARIANT 0: RED/CHARCOAL MVP (Reference 5 — Man of the Match, stat pills left, player right)
// ═════════════════════════════════════════════════════════════════════════════
function VariantRedMVP({
  player, stats, totalPoints, displayImage, isCutout, bgLoading, hovered, firstName, lastName,
}: CommonVariantProps) {
  const accent = '#EF4444';
  const glow = 'rgba(239, 68, 68, 0.45)';

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: '#0B0B0E', overflow: 'hidden',
    }}>
      {/* Dark grunge background + red scratches */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'radial-gradient(ellipse at 75% 30%, rgba(225,29,72,0.22) 0%, rgba(15,15,20,0.95) 75%)',
      }} />

      {/* Red diagonal slash graphic */}
      <div style={{
        position: 'absolute', width: '160%', height: 60,
        background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.18), transparent)',
        transform: 'rotate(-28deg)', top: '50%', left: '-30%',
        zIndex: 2, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: '140%', height: 2,
        background: 'rgba(239,68,68,0.3)',
        transform: 'rotate(-28deg)', top: '48%', left: '-20%',
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* Top Header: Club info */}
      <div style={{
        position: 'absolute', top: 12, left: 14, right: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <img
            src="/images/club-logo.jpg"
            alt=""
            style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(239,68,68,0.6)' }}
          />
          <span style={{
            fontFamily: "'Oswald', sans-serif", fontSize: 9, fontWeight: 800,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: '#fff',
          }}>
            THE ENIGMATIC ELITE
          </span>
        </div>
        {player.jerseyNumber && (
          <span style={{
            fontFamily: "'Oswald', sans-serif", fontSize: 13, fontWeight: 900,
            color: accent, letterSpacing: '0.05em',
          }}>
            #{player.jerseyNumber}
          </span>
        )}
      </div>

      {/* Title: Red script "Man of The Match" + Big distressed MVP */}
      <div style={{
        position: 'absolute', top: '10%', left: 14, right: 14,
        zIndex: 4, pointerEvents: 'none', userSelect: 'none',
      }}>
        <div style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 'clamp(20px, 5.5vw, 28px)',
          fontWeight: 700,
          color: '#EF4444',
          transform: 'rotate(-3deg)',
          marginLeft: 4,
          marginBottom: -8,
          textShadow: '0 2px 10px rgba(0,0,0,0.9)',
        }}>
          Man of The Match
        </div>
        <div style={{
          fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
          fontSize: 'clamp(60px, 17vw, 88px)',
          fontWeight: 400,
          color: '#ffffff',
          letterSpacing: '0.04em',
          lineHeight: 0.85,
          textTransform: 'uppercase',
          textShadow: '0 0 25px rgba(239,68,68,0.5), 0 4px 15px rgba(0,0,0,0.9)',
        }}>
          MVP
        </div>
      </div>

      {/* Left Stat Bars (Skewed Red Gradients like Ref 5) */}
      <div style={{
        position: 'absolute', left: 12, bottom: '22%',
        display: 'flex', flexDirection: 'column', gap: 7,
        zIndex: 18,
      }}>
        {[
          { val: stats.totalGoals, label: 'Pts', bg: 'linear-gradient(90deg, #DC2626 0%, #991B1B 100%)' },
          { val: stats.totalMOTM, label: 'Ast', bg: 'linear-gradient(90deg, #B91C1C 0%, #7F1D1D 100%)' },
          { val: stats.totalMatches, label: 'Reb', bg: 'linear-gradient(90deg, #991B1B 0%, #450A0A 100%)' },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: item.bg,
              border: '1.5px solid rgba(254,202,202,0.3)',
              borderRadius: 6,
              padding: '3px 12px 3px 10px',
              display: 'flex', alignItems: 'baseline', gap: 6,
              transform: 'skewX(-12deg)',
              boxShadow: '0 4px 14px rgba(185,28,28,0.45)',
            }}
          >
            <span style={{
              fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 800,
              color: '#fff', lineHeight: 1,
            }}>
              {item.val}
            </span>
            <span style={{
              fontFamily: "'Caveat', cursive", fontSize: 13, fontWeight: 700,
              color: '#FCA5A5', fontStyle: 'italic',
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Left Quote */}
      <div style={{
        position: 'absolute', left: 12, bottom: '7%', width: '42%',
        zIndex: 18, pointerEvents: 'none',
      }}>
        <div style={{ color: accent, fontSize: 14, fontWeight: 900, marginBottom: 2 }}>✱</div>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 7.5, color: 'rgba(255,255,255,0.7)',
          fontStyle: 'italic', lineHeight: 1.3,
        }}>
          &ldquo;Consistency turned discipline into greatness.&rdquo;
        </div>
      </div>

      {/* Player Cutout — RIGHT SHIFTED (like Ref 5) */}
      {displayImage ? (
        <motion.img
          src={displayImage}
          alt={player.name}
          animate={{ scale: hovered ? 1.04 : 1 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute',
            bottom: '4%', right: '-4%',
            zIndex: 10,
            width: '74%', height: '72%',
            objectFit: isCutout ? 'contain' : 'cover',
            objectPosition: 'bottom right',
            filter: isCutout
              ? 'drop-shadow(0 0 20px rgba(239,68,68,0.4)) drop-shadow(0 10px 25px rgba(0,0,0,0.9))'
              : 'none',
            opacity: bgLoading ? 0 : 1,
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', bottom: '10%', right: '8%',
          zIndex: 10, width: 85, height: 85, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: accent,
          background: 'rgba(239,68,68,0.15)', border: `2px solid ${accent}`,
        }}>
          {player.name.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Player Name at Bottom Right (White Sans + Red Script like Ref 5) */}
      <div style={{
        position: 'absolute', bottom: '6%', right: 14,
        zIndex: 22, textAlign: 'right', pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 900,
          color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em',
          lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,0.95)',
        }}>
          {firstName}
        </div>
        <div style={{
          fontFamily: "'Caveat', cursive", fontSize: 'clamp(22px, 6vw, 30px)', fontWeight: 700,
          color: '#EF4444', lineHeight: 0.9, marginTop: 1,
          transform: 'rotate(-4deg)', textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 15px rgba(239,68,68,0.6)',
        }}>
          {lastName || firstName}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// VARIANT 1: AARON LOEB / NEW SIGNING (Reference 4 — White/Blue diagonal split, player right)
// ═════════════════════════════════════════════════════════════════════════════
function VariantNewSigning({
  player, stats, winRate, displayImage, isCutout, bgLoading, hovered, firstName, lastName,
}: CommonVariantProps) {
  const accent = '#2563EB';

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: '#F1F5F9', overflow: 'hidden',
    }}>
      {/* Light subtle repeating watermark texture */}
      <div style={{
        position: 'absolute', top: -20, left: -20, right: -20, height: '60%',
        zIndex: 1, opacity: 0.06, pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', gap: 6,
        transform: 'rotate(-8deg)',
      }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 42,
            whiteSpace: 'nowrap', color: '#0F172A', letterSpacing: '0.1em',
          }}>
            WELCOME WELCOME WELCOME WELCOME
          </div>
        ))}
      </div>

      {/* Royal Blue Diagonal Banner (like Ref 4) */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        clipPath: 'polygon(0 42%, 100% 65%, 100% 100%, 0 100%)',
        background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 60%, #172554 100%)',
      }} />

      {/* Top Left: New Signing & Club Shield */}
      <div style={{
        position: 'absolute', top: 14, left: 14,
        zIndex: 20, display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 8.5, fontWeight: 900,
          letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1E3A8A',
          lineHeight: 1.2,
        }}>
          OFFICIAL SQUAD<br />CONFIRMED
        </div>
        <img
          src="/images/club-logo.jpg"
          alt=""
          style={{
            width: 28, height: 28, borderRadius: 6,
            objectFit: 'cover', border: '1.5px solid #1E40AF',
            boxShadow: '0 2px 8px rgba(30,64,175,0.3)',
          }}
        />
      </div>

      {/* Inside Blue Banner (Left side): Giant White Name (Ref 4) */}
      <div style={{
        position: 'absolute', bottom: '12%', left: 14, width: '56%',
        zIndex: 15, transform: 'rotate(-5deg)',
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
          fontSize: 'clamp(32px, 8.5vw, 46px)',
          fontWeight: 400,
          color: '#ffffff',
          lineHeight: 0.88,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          textShadow: '0 3px 12px rgba(0,0,0,0.4)',
        }}>
          {firstName}<br />{lastName || 'ELITE'}
        </div>
        <div style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 8.5, fontWeight: 700,
          color: '#93C5FD', letterSpacing: '0.15em', textTransform: 'uppercase',
          marginTop: 6,
        }}>
          {player.playerRoles?.[0] || 'FORWARD'} · #{player.jerseyNumber || '10'}
        </div>
        <div style={{
          marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)',
          padding: '2px 8px', borderRadius: 4,
          fontFamily: "'Oswald', sans-serif", fontSize: 8, fontWeight: 800,
          color: '#ffffff', letterSpacing: '0.08em',
        }}>
          <span>{stats.totalGoals} GOALS</span>
          <span>•</span>
          <span>{winRate}% WIN RATE</span>
        </div>
      </div>

      {/* Player Cutout — RIGHT ALIGNED (overlapping the blue diagonal) */}
      {displayImage ? (
        <motion.img
          src={displayImage}
          alt={player.name}
          animate={{ scale: hovered ? 1.04 : 1 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute',
            bottom: 0, right: 0,
            zIndex: 10,
            width: '68%', height: '76%',
            objectFit: isCutout ? 'contain' : 'cover',
            objectPosition: 'bottom center',
            filter: isCutout
              ? 'drop-shadow(-4px 0 16px rgba(0,0,0,0.35)) drop-shadow(0 10px 20px rgba(0,0,0,0.4))'
              : 'none',
            opacity: bgLoading ? 0 : 1,
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', bottom: '12%', right: '10%',
          zIndex: 10, width: 85, height: 85, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: accent,
          background: 'rgba(37,99,235,0.15)', border: `2px solid ${accent}`,
        }}>
          {player.name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// VARIANT 2: THE NEXT GAME / MATCHDAY (Reference 3 — Navy blue, player left, match details right)
// ═════════════════════════════════════════════════════════════════════════════
function VariantNextGame({
  player, stats, totalPoints, winRate, displayImage, isCutout, bgLoading, hovered,
}: CommonVariantProps) {
  const accent = '#00F0FF';

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #020917 0%, #071E48 55%, #030C1E 100%)',
      overflow: 'hidden',
    }}>
      {/* Neon accent bars top-left & bottom-right (Ref 3) */}
      <div style={{
        position: 'absolute', top: 12, left: 14, width: 44, height: 4,
        background: '#38BDF8', borderRadius: 2, zIndex: 10,
      }} />
      <div style={{
        position: 'absolute', bottom: 12, right: 14, width: 44, height: 4,
        background: '#38BDF8', borderRadius: 2, zIndex: 10,
      }} />

      {/* Top Header */}
      <div style={{
        position: 'absolute', top: 22, left: 0, right: 0,
        textAlign: 'center', zIndex: 12,
      }}>
        <span style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 8.5, fontWeight: 800,
          color: '#38BDF8', letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>
          SUPER FOOTBALL LEAGUE
        </span>
      </div>

      {/* Big Title: THE NEXT GAME (Ref 3) */}
      <div style={{
        position: 'absolute', top: '10%', left: 16,
        zIndex: 4, pointerEvents: 'none', userSelect: 'none',
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
          fontSize: 'clamp(44px, 12vw, 64px)',
          fontWeight: 400,
          color: '#ffffff',
          lineHeight: 0.85,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          textShadow: '0 0 25px rgba(56,189,248,0.5), 0 4px 15px rgba(0,0,0,0.9)',
        }}>
          THE NEXT<br />GAME
        </div>
      </div>

      {/* Right Side: Player & Match Info Blocks (Ref 3) */}
      <div style={{
        position: 'absolute', top: '38%', right: 14, width: '48%',
        zIndex: 18, textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div>
          <div style={{
            fontFamily: "'Oswald', sans-serif", fontSize: 9, fontWeight: 900,
            color: '#fff', letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            KEY SQUAD STAR
          </div>
          <div style={{
            fontFamily: "'Oswald', sans-serif", fontSize: 7.5, fontWeight: 600,
            color: '#38BDF8', letterSpacing: '0.08em',
          }}>
            THE ENIGMATIC ELITE
          </div>
        </div>

        <div style={{
          background: 'rgba(7,30,72,0.65)', backdropFilter: 'blur(8px)',
          borderRight: '2px solid #38BDF8', padding: '4px 8px', borderRadius: 4,
        }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, fontWeight: 800, color: '#fff' }}>
            {stats.totalGoals} GOALS
          </div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 7.5, color: '#93C5FD' }}>
            {stats.totalMatches} MATCHES • {winRate}% WR
          </div>
        </div>

        <div>
          <div style={{
            fontFamily: "'Oswald', sans-serif", fontSize: 10, fontWeight: 800,
            color: '#ffffff', textTransform: 'uppercase',
          }}>
            +{totalPoints} PTS
          </div>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 7, color: 'rgba(255,255,255,0.6)',
          }}>
            OFFICIAL FIXTURE SPOTLIGHT
          </div>
        </div>
      </div>

      {/* Player Cutout — LEFT SHIFTED (Ref 3) */}
      {displayImage ? (
        <motion.img
          src={displayImage}
          alt={player.name}
          animate={{ scale: hovered ? 1.04 : 1 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute',
            bottom: 0, left: '-2%',
            zIndex: 10,
            width: '68%', height: '72%',
            objectFit: isCutout ? 'contain' : 'cover',
            objectPosition: 'bottom left',
            filter: isCutout
              ? 'drop-shadow(0 0 20px rgba(56,189,248,0.45)) drop-shadow(0 10px 25px rgba(0,0,0,0.9))'
              : 'none',
            opacity: bgLoading ? 0 : 1,
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', bottom: '12%', left: '8%',
          zIndex: 10, width: 85, height: 85, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: accent,
          background: 'rgba(56,189,248,0.15)', border: `2px solid ${accent}`,
        }}>
          {player.name.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Player name at bottom */}
      <div style={{
        position: 'absolute', bottom: 12, left: 16,
        zIndex: 22, pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 12, fontWeight: 900,
          color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em',
          textShadow: '0 2px 8px rgba(0,0,0,0.95)',
        }}>
          {player.name}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// VARIANT 3: MVP OF THE GAME (Reference 2 — Distressed MVP, player center, frosted pills)
// ═════════════════════════════════════════════════════════════════════════════
function VariantMVPOftheGame({
  player, stats, winRate, displayImage, isCutout, bgLoading, hovered,
}: CommonVariantProps) {
  const accent = '#38BDF8';

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: '#040C1A', overflow: 'hidden',
    }}>
      {/* Stadium spotlight glow */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'radial-gradient(circle at 50% 30%, rgba(56,189,248,0.22) 0%, rgba(4,12,26,0.9) 70%)',
      }} />

      {/* Big Title: MVP OF THE GAME! (Ref 2) */}
      <div style={{
        position: 'absolute', top: '10%', left: 0, right: 0,
        textAlign: 'center', zIndex: 4, pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
          fontSize: 'clamp(62px, 17vw, 92px)',
          fontWeight: 400,
          color: '#ffffff',
          letterSpacing: '0.06em',
          lineHeight: 0.85,
          textTransform: 'uppercase',
          textShadow: '0 0 30px rgba(56,189,248,0.6), 0 4px 18px rgba(0,0,0,0.9)',
        }}>
          MVP
        </div>
        <div style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 800,
          color: '#38BDF8', letterSpacing: '0.22em', textTransform: 'uppercase',
          marginTop: 2, textShadow: '0 0 10px rgba(56,189,248,0.7)',
        }}>
          OF THE GAME!
        </div>
      </div>

      {/* Player Cutout — CENTERED (Ref 2) */}
      {displayImage ? (
        <motion.img
          src={displayImage}
          alt={player.name}
          animate={{ scale: hovered ? 1.04 : 1 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute',
            bottom: '4%', left: 0, right: 0,
            zIndex: 10,
            width: '100%', height: '74%',
            objectFit: isCutout ? 'contain' : 'cover',
            objectPosition: 'bottom center',
            filter: isCutout
              ? 'drop-shadow(0 -2px 14px rgba(255,255,255,0.4)) drop-shadow(0 10px 25px rgba(0,0,0,0.9))'
              : 'none',
            opacity: bgLoading ? 0 : 1,
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, width: 90, height: 90, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: accent,
          background: 'rgba(56,189,248,0.15)', border: `2px solid ${accent}`,
        }}>
          {player.name.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Floating Stat Pills — LEFT & RIGHT (Ref 2) */}
      <div style={{
        position: 'absolute', left: 12, bottom: '26%',
        display: 'flex', flexDirection: 'column', gap: 14,
        zIndex: 18,
      }}>
        <div style={{
          background: 'rgba(14,40,78,0.75)', backdropFilter: 'blur(8px)',
          borderLeft: '2px solid #38BDF8', padding: '4px 10px', borderRadius: 4,
          fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 800,
          color: '#fff', fontStyle: 'italic',
        }}>
          {stats.totalGoals} GOAL
        </div>
        <div style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 800,
          color: '#fff', fontStyle: 'italic', textShadow: '0 2px 6px rgba(0,0,0,0.9)',
          paddingLeft: 4,
        }}>
          {stats.totalMOTM} MOTM
        </div>
      </div>

      <div style={{
        position: 'absolute', right: 12, bottom: '26%',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14,
        zIndex: 18,
      }}>
        <div style={{
          background: 'rgba(14,40,78,0.75)', backdropFilter: 'blur(8px)',
          borderRight: '2px solid #38BDF8', padding: '4px 10px', borderRadius: 4,
          fontFamily: "'Oswald', sans-serif", fontSize: 9, fontWeight: 800,
          color: '#38BDF8', textTransform: 'uppercase',
        }}>
          DOMINATES THE FIELD
        </div>
        <div style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 800,
          color: '#fff', fontStyle: 'italic', textShadow: '0 2px 6px rgba(0,0,0,0.9)',
          paddingRight: 4,
        }}>
          {winRate}% PASS ACCURACY
        </div>
      </div>

      {/* Player Signature Name at Bottom Right (Caveat cursive like Ref 2) */}
      <div style={{
        position: 'absolute', bottom: '8%', right: 16,
        zIndex: 22, pointerEvents: 'none', transform: 'rotate(-4deg)',
      }}>
        <span style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 'clamp(22px, 6vw, 30px)',
          fontWeight: 700,
          color: '#ffffff',
          textShadow: '0 2px 10px rgba(0,0,0,0.95), 0 0 15px rgba(56,189,248,0.6)',
        }}>
          {player.name}
        </span>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// VARIANT 4: NEXT MATCH (Reference 1 — Stadium floodlights, vertical NEXT, player center)
// ═════════════════════════════════════════════════════
function VariantNextMatch({
  player, stats, displayImage, isCutout, bgLoading, hovered,
}: CommonVariantProps) {
  const accent = '#00F0FF';

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: '#040810', overflow: 'hidden',
    }}>
      {/* Stadium floodlight beams */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'radial-gradient(circle at 50% 25%, rgba(0,240,255,0.2) 0%, #040810 75%)',
      }} />

      {/* Title: Vertical NEXT + Big MATCH (Ref 1) */}
      <div style={{
        position: 'absolute', top: 12, left: 14, right: 14,
        display: 'flex', alignItems: 'flex-start', gap: 6,
        zIndex: 4, pointerEvents: 'none',
      }}>
        <div style={{
          writingMode: 'vertical-rl', transform: 'rotate(180deg)',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 26,
          color: '#00F0FF', letterSpacing: '0.08em', lineHeight: 1,
          marginTop: 2,
        }}>
          NEXT
        </div>
        <div style={{
          fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
          fontSize: 'clamp(52px, 14.5vw, 76px)',
          fontWeight: 400,
          color: '#ffffff',
          letterSpacing: '0.05em',
          lineHeight: 0.85,
          textShadow: '0 0 25px rgba(0,240,255,0.6), 0 4px 15px rgba(0,0,0,0.95)',
        }}>
          MATCH
        </div>
      </div>

      {/* Left Badge: Crest + Info (Ref 1) */}
      <div style={{
        position: 'absolute', top: '38%', left: 14,
        zIndex: 18, display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <img
          src="/images/club-logo.jpg"
          alt=""
          style={{
            width: 28, height: 28, borderRadius: 6,
            objectFit: 'cover', border: '1.5px solid #00F0FF',
            boxShadow: '0 0 10px rgba(0,240,255,0.4)',
          }}
        />
        <div style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 9, fontWeight: 900,
          color: '#ffffff', letterSpacing: '0.05em',
        }}>
          #{player.jerseyNumber || '10'} {player.playerRoles?.[0] || 'STAR'}
        </div>
        <div style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 7.5, fontWeight: 600,
          color: '#00F0FF',
        }}>
          {stats.totalGoals} GOALS SCORED
        </div>
      </div>

      {/* Player Cutout — CENTERED (Ref 1) */}
      {displayImage ? (
        <motion.img
          src={displayImage}
          alt={player.name}
          animate={{ scale: hovered ? 1.04 : 1 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute',
            bottom: '7%', left: 0, right: 0,
            zIndex: 10,
            width: '100%', height: '72%',
            objectFit: isCutout ? 'contain' : 'cover',
            objectPosition: 'bottom center',
            filter: isCutout
              ? 'drop-shadow(0 0 16px rgba(0,240,255,0.5)) drop-shadow(0 10px 25px rgba(0,0,0,0.95))'
              : 'none',
            opacity: bgLoading ? 0 : 1,
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, width: 90, height: 90, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: accent,
          background: 'rgba(0,240,255,0.15)', border: `2px solid ${accent}`,
        }}>
          {player.name.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Bottom Bar: Clean white banner (Ref 1) */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '7%', background: '#ffffff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 25,
      }}>
        <span style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 7.5, fontWeight: 900,
          color: '#040810', letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>
          THE ENIGMATIC ELITE FC · {player.name}
        </span>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PLAYER CARD WRAPPER
// ═════════════════════════════════════════════════════════════════════════════
export function PlayerCard({ player, onView, index = 0 }: PlayerCardProps) {
  const [hovered, setHovered] = useState(false);
  const stats = usePlayerStats(player.id);
  const { players, playerSeasonStats } = useFootballStore();

  // Rank calculation
  const calcPts = (s: any) =>
    s.wins * 10 + s.draws * 5 - s.losses * 3 + s.goals - s.goalsConceded + s.motmCount * 4 + s.hattricks;

  const ranked = [...players]
    .map(p => ({ id: p.id, pts: playerSeasonStats.filter(s => s.playerId === p.id).reduce((a, s) => a + calcPts(s), 0) }))
    .sort((a, b) => b.pts - a.pts);

  const rankIdx     = ranked.findIndex(r => r.id === player.id);
  const rank        = rankIdx !== -1 ? rankIdx + 1 : null;
  const totalPoints = rankIdx !== -1 ? ranked[rankIdx].pts : 0;
  const winRate     = stats.totalMatches > 0 ? Math.round((stats.totalWins / stats.totalMatches) * 100) : 0;

  // Split Name for two-tone headings
  const nameParts = player.name.trim().split(' ');
  const firstName = nameParts[0] || player.name;
  const lastName  = nameParts.slice(1).join(' ');

  // Auto bg removal hook
  const { src: displayImage, isCutout, loading: bgLoading } = useBackgroundRemoval(
    player.coverImageUrl,
    player.profileImageUrl,
  );

  // Cycle through the 5 distinct reference designs!
  const variantIndex = index % 5;

  // Glare color according to template
  const glareColors = ['#EF4444', '#2563EB', '#00F0FF', '#38BDF8', '#00F0FF'];
  const currentGlare = glareColors[variantIndex];

  const commonProps: CommonVariantProps = {
    player,
    stats,
    totalPoints,
    rank,
    winRate,
    displayImage,
    isCutout,
    bgLoading,
    hovered,
    firstName,
    lastName,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: (index % 12) * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <Tilt
        tiltMaxAngleX={8}
        tiltMaxAngleY={8}
        glareEnable={true}
        glareMaxOpacity={0.16}
        glareColor={currentGlare}
        glarePosition="all"
        glareBorderRadius="16px"
        scale={1.025}
        transitionSpeed={700}
        style={{ borderRadius: 16, cursor: 'pointer', display: 'block' }}
        onEnter={() => setHovered(true)}
        onLeave={() => setHovered(false)}
        onClick={onView}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3/4',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: hovered
            ? `0 20px 45px rgba(0,0,0,0.8), 0 0 0 1.5px ${currentGlare}55`
            : '0 6px 24px rgba(0,0,0,0.6)',
          transition: 'box-shadow 0.3s ease',
        }}>
          {variantIndex === 0 && <VariantRedMVP {...commonProps} />}
          {variantIndex === 1 && <VariantNewSigning {...commonProps} />}
          {variantIndex === 2 && <VariantNextGame {...commonProps} />}
          {variantIndex === 3 && <VariantMVPOftheGame {...commonProps} />}
          {variantIndex === 4 && <VariantNextMatch {...commonProps} />}
        </div>
      </Tilt>
    </motion.div>
  );
}
