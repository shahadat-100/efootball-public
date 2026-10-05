import React from 'react';
import { RankedPlayer } from '../../utils/galleryStats';

interface PodiumCardProps {
  topPlayers: RankedPlayer[];
  title: string;
  subtitle: string;
  aspect?: '4:5' | '1:1' | '16:9' | '9:16';
  cardRef?: React.RefObject<HTMLDivElement>;
}

const MEDAL = ['🥇', '🥈', '🥉'];
const RANK_CONFIG = [
  {
    rank: 1,
    label: '1ST PLACE',
    color: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.55)',
    bg: 'linear-gradient(180deg, rgba(212,175,55,0.25) 0%, rgba(15,12,5,0.95) 100%)',
    border: 'rgba(255, 215, 0, 0.6)',
    pedestalHeight: 180,
    cutoutHeight: 270,
  },
  {
    rank: 2,
    label: '2ND PLACE',
    color: '#E2E8F0',
    glow: 'rgba(226, 232, 240, 0.45)',
    bg: 'linear-gradient(180deg, rgba(148,163,184,0.2) 0%, rgba(15,18,25,0.95) 100%)',
    border: 'rgba(226, 232, 240, 0.45)',
    pedestalHeight: 150,
    cutoutHeight: 240,
  },
  {
    rank: 3,
    label: '3RD PLACE',
    color: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.45)',
    bg: 'linear-gradient(180deg, rgba(217,119,6,0.2) 0%, rgba(20,14,8,0.95) 100%)',
    border: 'rgba(245, 158, 11, 0.45)',
    pedestalHeight: 130,
    cutoutHeight: 220,
  },
];

export function PodiumCard({ topPlayers, title, subtitle, cardRef }: PodiumCardProps) {
  const isMonthly = title.toLowerCase().includes('monthly') || subtitle.toLowerCase().includes('month');
  const accentColor = isMonthly ? '#FFD700' : '#38BDF8';
  const accentGlow = isMonthly ? 'rgba(212,175,55,0.45)' : 'rgba(56,189,248,0.45)';

  // Rearrange top 3 for classic sports podium order: [2nd, 1st, 3rd]
  const p1 = topPlayers[0];
  const p2 = topPlayers[1];
  const p3 = topPlayers[2];

  const orderedSlots = [
    { player: p2, config: RANK_CONFIG[1], originalIdx: 1 },
    { player: p1, config: RANK_CONFIG[0], originalIdx: 0 },
    { player: p3, config: RANK_CONFIG[2], originalIdx: 2 },
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
        background: '#07080E',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
      }}
    >
      {/* ── Background: Dark Stadium Lighting ─────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: isMonthly
          ? 'radial-gradient(circle at 50% 25%, rgba(212,175,55,0.20) 0%, rgba(184,134,11,0.06) 45%, #07080E 80%)'
          : 'radial-gradient(circle at 50% 25%, rgba(14,165,233,0.22) 0%, rgba(37,99,235,0.06) 45%, #06080E 80%)',
        zIndex: 1,
      }} />

      {/* Stadium Light Beam */}
      <div style={{
        position: 'absolute',
        top: -60, left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 350,
        background: `radial-gradient(ellipse at 50% 20%, ${accentGlow} 0%, transparent 65%)`,
        filter: 'blur(30px)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      {/* Giant Watermark Typography: "TOP 3" */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 280, fontWeight: 900,
        fontFamily: "'Action Comics Black', 'Impact', sans-serif",
        color: 'rgba(255,255,255,0.04)',
        letterSpacing: -10, lineHeight: 1,
        userSelect: 'none', pointerEvents: 'none',
        zIndex: 2,
      }}>
        TOP 3
      </div>

      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '18px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 30,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/images/club-logo.jpg"
            alt="Club Logo"
            crossOrigin="anonymous"
            style={{
              width: 38, height: 38,
              borderRadius: 8,
              objectFit: 'cover',
              border: `1.5px solid ${accentColor}`,
              boxShadow: `0 0 12px ${accentGlow}`,
            }}
          />
          <div>
            <div style={{ fontSize: 12, color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>
              THE ENIGMATIC ELITE
            </div>
            <div style={{ fontSize: 8.5, color: accentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic' }}>
              In Mystery We Reign
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 24, fontWeight: 900,
            fontFamily: "'Action Comics Black', 'Impact', sans-serif",
            color: '#fff', textTransform: 'uppercase',
            letterSpacing: 2, lineHeight: 1,
            textShadow: `0 0 20px ${accentGlow}`,
          }}>
            {title}
          </div>
          <div style={{
            fontSize: 10, fontWeight: 800,
            color: accentColor, textTransform: 'uppercase',
            letterSpacing: 2, marginTop: 4,
          }}>
            {subtitle}
          </div>
        </div>
      </div>

      {/* ── Podium Stage: 3 Standing Cutouts on Pedestals ─────────── */}
      {!p1 ? (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.4)', fontSize: 14, zIndex: 20,
        }}>
          No stats recorded for this period yet.
        </div>
      ) : (
        <div style={{
          position: 'absolute',
          bottom: 38, left: 30, right: 30,
          height: 420,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 20,
          zIndex: 10,
        }}>
          {orderedSlots.map(({ player: r, config, originalIdx }) => {
            if (!r) return null;
            const cutoutImage = r.player.coverImageUrl || r.player.profileImageUrl;

            return (
              <div
                key={r.player.id || originalIdx}
                style={{
                  flex: originalIdx === 0 ? 1.15 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: originalIdx === 0 ? 15 : 10,
                }}
              >
                {/* ── Standing Player Cutout ────────────────────────── */}
                <div style={{
                  height: config.cutoutHeight,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  marginBottom: -10,
                  zIndex: 5,
                  position: 'relative',
                }}>
                  <img
                    src={cutoutImage}
                    alt={r.player.name}
                    crossOrigin="anonymous"
                    style={{
                      maxHeight: config.cutoutHeight,
                      maxWidth: '90%',
                      objectFit: 'contain',
                      objectPosition: 'bottom center',
                      filter: `drop-shadow(0 0 2px #fff) drop-shadow(0 0 12px ${config.glow}) drop-shadow(0 15px 25px rgba(0,0,0,0.9))`,
                    }}
                  />

                  {/* Medal Icon floating next to head */}
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    right: originalIdx === 0 ? 15 : 5,
                    fontSize: originalIdx === 0 ? 28 : 22,
                    filter: `drop-shadow(0 2px 8px ${config.glow})`,
                  }}>
                    {MEDAL[originalIdx]}
                  </div>
                </div>

                {/* ── Podium Pedestal Block ──────────────────────────── */}
                <div style={{
                  width: '100%',
                  height: config.pedestalHeight,
                  background: config.bg,
                  border: `1.5px solid ${config.border}`,
                  borderRadius: 16,
                  boxShadow: `0 10px 30px rgba(0,0,0,0.8), inset 0 0 20px ${config.glow}`,
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 10px',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Subtle top pedestal accent highlight */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                    background: `linear-gradient(90deg, transparent, ${config.color}, transparent)`,
                  }} />

                  {/* Player Name */}
                  <div style={{
                    fontSize: originalIdx === 0 ? 16 : 13,
                    fontWeight: 900,
                    fontFamily: "'Action Comics Black', 'Impact', sans-serif",
                    color: '#fff',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    lineHeight: 1.1,
                    letterSpacing: 1,
                  }}>
                    {r.player.name}
                  </div>

                  {/* Points Badge */}
                  <div style={{
                    background: 'rgba(0,0,0,0.6)',
                    border: `1px solid ${config.border}`,
                    borderRadius: 12,
                    padding: '4px 12px',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 4,
                  }}>
                    <span style={{
                      fontSize: originalIdx === 0 ? 24 : 20,
                      fontWeight: 900,
                      fontFamily: "'Action Comics Black', 'Impact', sans-serif",
                      color: config.color,
                      lineHeight: 1,
                    }}>
                      +{r.points}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.6)' }}>
                      PTS
                    </span>
                  </div>

                  {/* Mini Stats (Goals, Apps, MOTM) */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#fff',
                    }}>
                      {r.goals} <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)' }}>GOALS</span>
                    </div>
                    <div style={{
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#fff',
                    }}>
                      {r.appearances} <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)' }}>APPS</span>
                    </div>
                    <div style={{
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#fff',
                    }}>
                      {r.motm} <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)' }}>MOTM</span>
                    </div>
                  </div>

                  {/* Rank Label Banner at Bottom of Pedestal */}
                  <div style={{
                    fontSize: 10,
                    fontWeight: 900,
                    fontFamily: "'Neon Sans', 'Impact', sans-serif",
                    color: config.color,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                  }}>
                    {config.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Solid Bottom Information Bar ──────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 38,
        background: '#040508',
        borderTop: `1px solid ${accentGlow}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        zIndex: 30,
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
          OFFICIAL LEADERBOARD RESULTS • WWW.THEENIGMATICELITE.COM
        </div>

        <div style={{
          fontSize: 9,
          fontWeight: 900,
          color: '#fff',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}>
          PODIUM SPECIAL
        </div>
      </div>
    </div>
  );
}
