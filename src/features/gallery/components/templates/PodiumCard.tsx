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

export function PodiumCard({ topPlayers, title, subtitle, cardRef }: PodiumCardProps) {
  const isMonthly = title.toLowerCase().includes('monthly') || subtitle.toLowerCase().includes('month');

  const p1 = topPlayers[0];
  const p2 = topPlayers[1];
  const p3 = topPlayers[2];

  // Podium order: [2nd LEFT | 1st CENTER | 3rd RIGHT]
  const slots = [
    { player: p2, rank: 2, label: 'RUNNER UP',  medal: '🥈', color: '#C0C0C0', imgHeight: 400, flex: 1   },
    { player: p1, rank: 1, label: 'CHAMPION',   medal: '🥇', color: '#FFD700', imgHeight: 490, flex: 1.3 },
    { player: p3, rank: 3, label: '3RD PLACE',  medal: '🥉', color: '#F59E0B', imgHeight: 370, flex: 1   },
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
        background: isMonthly
          ? 'linear-gradient(145deg, #1a0a00 0%, #7c3a00 35%, #1a0800 100%)'
          : 'linear-gradient(145deg, #012a5e 0%, #0d47a1 40%, #01194a 100%)',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── BG: Centre glow ────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: isMonthly
          ? 'radial-gradient(ellipse at 50% 70%, rgba(220,120,0,0.40) 0%, transparent 65%)'
          : 'radial-gradient(ellipse at 50% 70%, rgba(56,189,248,0.38) 0%, transparent 65%)',
        zIndex: 1,
      }} />

      {/* ── BG: Diagonal stripe texture ───────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(55deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 22px)',
        zIndex: 1,
      }} />

      {/* ── BG: Bottom dark gradient (anchor players to ground) ────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 200,
        background: 'linear-gradient(0deg, rgba(0,0,0,0.75) 0%, transparent 100%)',
        zIndex: 2,
      }} />

      {/* ── Watermark: "TOP 3" ───────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 260, fontWeight: 900,
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        color: 'rgba(255,255,255,0.04)',
        letterSpacing: -8, lineHeight: 1,
        userSelect: 'none', pointerEvents: 'none',
        zIndex: 2,
      }}>
        TOP 3
      </div>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '16px 26px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 30,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 100%)',
      }}>
        {/* Club branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <img
            src="/images/club-logo.jpg"
            alt="Club Logo"
            crossOrigin="anonymous"
            style={{
              width: 42, height: 42,
              borderRadius: 9, objectFit: 'cover',
              border: '2px solid rgba(255,255,255,0.55)',
              boxShadow: '0 0 18px rgba(255,255,255,0.25)',
            }}
          />
          <div>
            <div style={{ fontSize: 12, color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, lineHeight: 1 }}>
              THE ENIGMATIC ELITE
            </div>
            <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.65)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic', marginTop: 3 }}>
              In Mystery We Reign
            </div>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 30, fontWeight: 900,
            fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
            color: '#fff', textTransform: 'uppercase',
            letterSpacing: 4, lineHeight: 1,
            textShadow: '0 0 30px rgba(255,255,255,0.4)',
          }}>
            {title}
          </div>
          <div style={{
            fontSize: 10, fontWeight: 800,
            fontFamily: "'Oswald', sans-serif",
            color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase',
            letterSpacing: 3, marginTop: 4,
          }}>
            {subtitle}
          </div>
        </div>
      </div>

      {/* ── NO DATA fallback ───────────────────────────────────────── */}
      {!p1 ? (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.4)', fontSize: 14, zIndex: 20,
        }}>
          No stats recorded for this period yet.
        </div>
      ) : (
        /* ── Three-Player Panorama ───────────────────────────────── */
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 10,
        }}>
          {slots.map(({ player: r, rank, label, medal, color, imgHeight, flex }) => {
            if (!r) return <div key={rank} style={{ flex }} />;
            const parts = r.player.name.trim().split(' ');
            const firstName = parts[0];
            const lastName = parts.slice(1).join(' ');

            return (
              <div
                key={rank}
                style={{
                  flex,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  zIndex: rank === 1 ? 15 : 10,
                }}
              >
                {/* ── Medal badge ──────────────────────────────── */}
                <div style={{
                  position: 'absolute',
                  top: 62,
                  fontSize: rank === 1 ? 30 : 22,
                  filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.7))',
                  zIndex: 20,
                }}>
                  {medal}
                </div>

                {/* ── Player cutout image ───────────────────────── */}
                <div style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  overflow: 'visible',
                }}>
                  <img
                    src={r.player.coverImageUrl}
                    alt={r.player.name}
                    crossOrigin="anonymous"
                    style={{
                      height: imgHeight,
                      maxWidth: rank === 1 ? '100%' : '92%',
                      objectFit: 'contain',
                      objectPosition: 'bottom center',
                      filter: [
                        'drop-shadow(0 0 1px rgba(255,255,255,0.6))',
                        `drop-shadow(0 0 20px ${rank === 1 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.10)'})`,
                        'drop-shadow(0 20px 40px rgba(0,0,0,0.85))',
                      ].join(' '),
                    }}
                  />
                </div>

                {/* ── Bottom name/stats panel ───────────────────── */}
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  padding: rank === 1 ? '44px 8px 10px' : '36px 6px 8px',
                  background: 'linear-gradient(0deg, rgba(0,5,20,0.92) 0%, rgba(0,5,20,0.55) 60%, transparent 100%)',
                  textAlign: 'center',
                  zIndex: 18,
                }}>
                  {/* Name */}
                  <div style={{
                    fontSize: rank === 1 ? 16 : 13,
                    fontWeight: 900,
                    fontFamily: "'Oswald', sans-serif",
                    color: '#fff',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    lineHeight: 1.15,
                    textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                  }}>
                    <div>{firstName}</div>
                    {lastName && <div>{lastName}</div>}
                  </div>

                  {/* Rank label */}
                  <div style={{
                    fontSize: 8.5,
                    fontWeight: 900,
                    color: color,
                    letterSpacing: 2.5,
                    textTransform: 'uppercase',
                    marginTop: 4,
                    textShadow: `0 0 12px ${color}`,
                  }}>
                    {label}
                  </div>

                  {/* Points */}
                  <div style={{
                    fontSize: rank === 1 ? 28 : 22,
                    fontWeight: 900,
                    fontFamily: "'Oswald', sans-serif",
                    color,
                    fontStyle: 'italic',
                    lineHeight: 1,
                    marginTop: 3,
                    textShadow: `0 0 20px ${color}88`,
                  }}>
                    +{r.points}
                    <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.55)', marginLeft: 4, fontStyle: 'normal', letterSpacing: 1 }}>PTS</span>
                  </div>

                  {/* Mini stats */}
                  <div style={{
                    fontSize: 8.5,
                    color: 'rgba(255,255,255,0.55)',
                    fontFamily: "'Oswald', sans-serif",
                    letterSpacing: 1,
                    marginTop: 2,
                  }}>
                    {r.goals}G · {r.appearances}APP · {r.motm}M
                  </div>
                </div>

                {/* Rank number - top corner */}
                <div style={{
                  position: 'absolute',
                  top: 65,
                  right: rank === 1 ? 12 : 6,
                  fontSize: rank === 1 ? 64 : 50,
                  fontWeight: 900,
                  fontFamily: "'Oswald', 'Impact', sans-serif",
                  color: 'rgba(255,255,255,0.06)',
                  lineHeight: 1,
                  userSelect: 'none',
                  zIndex: 3,
                }}>
                  {rank}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Bottom thin accent line ──────────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0, height: 3,
        background: isMonthly
          ? 'linear-gradient(90deg, transparent, #FFD700, transparent)'
          : 'linear-gradient(90deg, transparent, #38BDF8, transparent)',
        zIndex: 30,
      }} />

      {/* ── Footer branding ──────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: 8, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 35,
      }}>
        <div style={{
          fontSize: 8,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.30)',
          letterSpacing: 2.5,
          textTransform: 'uppercase',
        }}>
          THE ENIGMATIC ELITE FC · OFFICIAL LEADERBOARD
        </div>
      </div>
    </div>
  );
}
