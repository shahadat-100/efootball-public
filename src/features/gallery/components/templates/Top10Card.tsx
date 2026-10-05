import React from 'react';
import { RankedPlayer } from '../../utils/galleryStats';

interface Top10CardProps {
  topPlayers: RankedPlayer[];
  title: string;
  subtitle: string;
  aspect?: '4:5' | '1:1' | '16:9' | '9:16';
  cardRef?: React.RefObject<HTMLDivElement>;
}

const RANK_COLOR: Record<number, string> = {
  0: '#FFD700',
  1: '#E2E8F0',
  2: '#F59E0B',
};

export function Top10Card({ topPlayers, title, subtitle, cardRef }: Top10CardProps) {
  const isMonthly = title.toLowerCase().includes('monthly') || subtitle.toLowerCase().includes('month');
  const accentColor = isMonthly ? '#FFD700' : '#38BDF8';
  const accentGlow = isMonthly ? 'rgba(212,175,55,0.45)' : 'rgba(56,189,248,0.45)';

  const topLeader = topPlayers[0];
  const firstCol = topPlayers.slice(0, 5);
  const secondCol = topPlayers.slice(5, 10);

  const leaderCutout = topLeader?.player.coverImageUrl || topLeader?.player.profileImageUrl;

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
      {/* ── Background: Dark Atmospheric Lighting ─────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: isMonthly
          ? 'radial-gradient(circle at 20% 40%, rgba(212,175,55,0.22) 0%, rgba(184,134,11,0.06) 50%, #07080E 80%)'
          : 'radial-gradient(circle at 20% 40%, rgba(14,165,233,0.25) 0%, rgba(37,99,235,0.06) 50%, #06080E 80%)',
        zIndex: 1,
      }} />

      {/* Giant Watermark Typography: "TOP 10" */}
      <div style={{
        position: 'absolute', right: -30, bottom: -30,
        fontSize: 320, fontWeight: 900,
        fontFamily: "'Action Comics Black', 'Impact', sans-serif",
        color: 'rgba(255,255,255,0.03)',
        lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
        zIndex: 2,
      }}>
        10
      </div>

      {/* ── Left Section: Featured #1 Player Cutout & Title Banner ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 380, height: '100%',
        zIndex: 10,
        overflow: 'hidden',
      }}>
        {/* Top Club Branding */}
        <div style={{
          position: 'absolute', top: 22, left: 24,
          display: 'flex', alignItems: 'center', gap: 10,
          zIndex: 25,
        }}>
          <img
            src="/images/club-logo.jpg"
            alt="Club Logo"
            crossOrigin="anonymous"
            style={{
              width: 36, height: 36,
              borderRadius: 8,
              objectFit: 'cover',
              border: `1.5px solid ${accentColor}`,
              boxShadow: `0 0 12px ${accentGlow}`,
            }}
          />
          <div>
            <div style={{ fontSize: 11, color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, lineHeight: 1 }}>
              THE ENIGMATIC ELITE
            </div>
            <div style={{ fontSize: 8.5, color: accentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic' }}>
              In Mystery We Reign
            </div>
          </div>
        </div>

        {/* Title Block */}
        <div style={{
          position: 'absolute', top: 72, left: 24, right: 24,
          zIndex: 25,
        }}>
          <div style={{
            fontSize: 28, fontWeight: 900, lineHeight: 1,
            fontFamily: "'Action Comics Black', 'Impact', sans-serif",
            color: '#fff', textTransform: 'uppercase',
            letterSpacing: 2,
            textShadow: `0 0 20px ${accentGlow}`,
          }}>
            {title}
          </div>
          <div style={{
            fontSize: 11, fontWeight: 800,
            color: accentColor, textTransform: 'uppercase',
            letterSpacing: 2.5, marginTop: 4,
          }}>
            {subtitle}
          </div>
        </div>

        {/* Standing #1 Player Cutout */}
        {leaderCutout && (
          <div style={{
            position: 'absolute',
            bottom: 0, left: 10, width: 350, height: 380,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            zIndex: 15,
            pointerEvents: 'none',
          }}>
            <img
              src={leaderCutout}
              alt={topLeader?.player.name}
              crossOrigin="anonymous"
              style={{
                maxHeight: 370,
                maxWidth: '96%',
                objectFit: 'contain',
                objectPosition: 'bottom center',
                filter: `drop-shadow(0 0 2px #fff) drop-shadow(0 0 14px ${accentGlow}) drop-shadow(0 15px 30px rgba(0,0,0,0.95))`,
              }}
            />

            {/* #1 Leader Badge */}
            <div style={{
              position: 'absolute',
              bottom: 46, left: 14,
              background: 'rgba(7, 12, 22, 0.88)',
              backdropFilter: 'blur(8px)',
              border: `1.5px solid ${accentColor}`,
              borderRadius: 12,
              padding: '4px 10px',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: `0 4px 15px rgba(0,0,0,0.7), 0 0 12px ${accentGlow}`,
            }}>
              <span style={{ fontSize: 14 }}>👑</span>
              <span style={{
                fontSize: 11, fontWeight: 900,
                fontFamily: "'Action Comics Black', 'Impact', sans-serif",
                color: '#fff', textTransform: 'uppercase',
              }}>
                {topLeader?.player.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Vertical Accent Divider */}
      <div style={{
        position: 'absolute', top: 20, bottom: 45, left: 380, width: 1.5,
        background: `linear-gradient(180deg, transparent, ${accentColor}, transparent)`,
        zIndex: 20,
      }} />

      {/* ── Right Section: 2 Columns of Top 10 Ranked Players ──────── */}
      <div style={{
        position: 'absolute', top: 20, left: 400, right: 24, bottom: 42,
        display: 'flex', gap: 14,
        zIndex: 20,
      }}>
        {[firstCol, secondCol].map((col, cIdx) => (
          <div key={cIdx} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
            {col.map((r, rowIdx) => {
              const absIdx = cIdx * 5 + rowIdx;
              const rankColor = RANK_COLOR[absIdx] || 'rgba(255,255,255,0.7)';
              const isTop3 = absIdx < 3;
              const rowCutout = r.player.coverImageUrl || r.player.profileImageUrl;

              return (
                <div
                  key={r.player.id || absIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: isTop3
                      ? `linear-gradient(90deg, ${isMonthly ? 'rgba(212,175,55,0.18)' : 'rgba(14,165,233,0.18)'}, rgba(255,255,255,0.03))`
                      : 'rgba(255,255,255,0.03)',
                    border: isTop3 ? `1px solid ${rankColor}60` : '1px solid rgba(255,255,255,0.08)',
                    borderLeft: `4px solid ${rankColor}`,
                    borderRadius: 12,
                    padding: '6px 12px',
                    boxShadow: isTop3 ? `0 4px 15px rgba(0,0,0,0.5), inset 0 0 10px ${rankColor}20` : '0 2px 10px rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  {/* Rank number */}
                  <div style={{
                    fontSize: isTop3 ? 20 : 16,
                    fontWeight: 900,
                    fontFamily: "'Action Comics Black', 'Impact', sans-serif",
                    color: rankColor,
                    minWidth: 20,
                    textAlign: 'center',
                    lineHeight: 1,
                  }}>
                    {absIdx + 1}
                  </div>

                  {/* Cutout / Avatar Thumb */}
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: 10,
                    background: '#111522',
                    border: `1px solid ${isTop3 ? rankColor : 'rgba(255,255,255,0.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    <img
                      src={rowCutout}
                      alt={r.player.name}
                      crossOrigin="anonymous"
                      style={{
                        width: '100%', height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'top center',
                      }}
                    />
                  </div>

                  {/* Player Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: isTop3 ? 13 : 11.5,
                      fontWeight: 900,
                      fontFamily: "'Action Comics Black', 'Impact', sans-serif",
                      color: '#fff',
                      textTransform: 'uppercase',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      letterSpacing: 0.5,
                    }}>
                      {r.player.name}
                    </div>
                    <div style={{
                      fontSize: 8.5,
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.5)',
                      letterSpacing: 1,
                      marginTop: 2,
                    }}>
                      {r.goals}G · {r.appearances}A · {r.wins}W
                    </div>
                  </div>

                  {/* Points Badge */}
                  <div style={{
                    textAlign: 'right',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      fontSize: isTop3 ? 18 : 15,
                      fontWeight: 900,
                      fontFamily: "'Action Comics Black', 'Impact', sans-serif",
                      color: rankColor,
                      lineHeight: 1,
                    }}>
                      +{r.points}
                    </div>
                    <div style={{ fontSize: 7, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                      PTS
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

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
          OFFICIAL SQUAD POWER RANKINGS • WWW.THEENIGMATICELITE.COM
        </div>

        <div style={{
          fontSize: 9,
          fontWeight: 900,
          color: '#fff',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}>
          TOP 10 SQUAD
        </div>
      </div>
    </div>
  );
}
