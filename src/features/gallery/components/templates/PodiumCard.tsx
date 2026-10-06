import React from 'react';
import { RankedPlayer } from '../../utils/galleryStats';
import { useCutoutImage } from '../../utils/useCutoutImage';

interface PodiumCardProps {
  topPlayers: RankedPlayer[];
  title: string;
  subtitle: string;
  aspect?: '4:5' | '1:1' | '16:9' | '9:16';
  cardRef?: React.RefObject<HTMLDivElement>;
}

/* ─── Sub-component: properly calls useCutoutImage per player ─── */
function PlayerCutoutImg({
  src,
  alt,
  imgHeight,
  glow,
}: {
  src?: string;
  alt: string;
  imgHeight: number;
  glow: string;
}) {
  const processed = useCutoutImage(src);
  return (
    <img
      src={processed}
      alt={alt}
      crossOrigin="anonymous"
      style={{
        height: imgHeight,
        maxWidth: '100%',
        objectFit: 'contain',
        objectPosition: 'bottom center',
        display: 'block',
        filter: [
          'drop-shadow(0 0 1px rgba(255,255,255,0.7))',
          `drop-shadow(0 0 22px ${glow})`,
          'drop-shadow(0 18px 38px rgba(0,0,0,0.90))',
        ].join(' '),
      }}
    />
  );
}

const MEDAL = ['🥇', '🥈', '🥉'];

export function PodiumCard({ topPlayers, title, subtitle, cardRef }: PodiumCardProps) {
  const isMonthly = title.toLowerCase().includes('monthly') || subtitle.toLowerCase().includes('month');

  const p1 = topPlayers[0];
  const p2 = topPlayers[1];
  const p3 = topPlayers[2];

  /* Team-poster order: [2nd | 1st | 3rd]  — classic podium left-center-right */
  const slots = [
    { player: p2, rank: 2, label: 'RUNNER UP',  medal: '🥈', color: '#C8C8D0', imgHeight: 450, flex: 1   },
    { player: p1, rank: 1, label: 'CHAMPION',   medal: '🥇', color: '#FFD700', imgHeight: 500, flex: 1.2 },
    { player: p3, rank: 3, label: '3RD PLACE',  medal: '🥉', color: '#D97706', imgHeight: 420, flex: 1   },
  ];

  const glow = isMonthly ? 'rgba(220,140,0,0.55)' : 'rgba(56,189,248,0.55)';

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
          ? 'linear-gradient(150deg, #1c0900 0%, #8b4000 38%, #1a0700 100%)'
          : 'linear-gradient(150deg, #01254e 0%, #0c45a0 40%, #011840 100%)',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── BG centre radial glow ─────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: isMonthly
          ? 'radial-gradient(ellipse at 50% 65%, rgba(210,120,0,0.42) 0%, transparent 62%)'
          : 'radial-gradient(ellipse at 50% 65%, rgba(56,189,248,0.35) 0%, transparent 62%)',
        zIndex: 1,
      }} />

      {/* ── BG diagonal stripe texture ────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(55deg, rgba(255,255,255,0.022) 0px, rgba(255,255,255,0.022) 1px, transparent 1px, transparent 24px)',
        zIndex: 1,
      }} />

      {/* ── Watermark "TOP 3" ─────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 240, fontWeight: 900,
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        color: 'rgba(255,255,255,0.04)',
        letterSpacing: -8, lineHeight: 1,
        userSelect: 'none', pointerEvents: 'none', zIndex: 2,
      }}>
        TOP 3
      </div>

      {/* ── Bottom ground shadow ──────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 220,
        background: 'linear-gradient(0deg, rgba(0,0,0,0.78) 0%, transparent 100%)',
        zIndex: 2,
      }} />

      {/* ── Header ───────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '15px 26px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 30,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.60) 0%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <img
            src="/images/club-logo.jpg"
            alt="Club Logo"
            crossOrigin="anonymous"
            style={{
              width: 42, height: 42, borderRadius: 9, objectFit: 'cover',
              border: '2px solid rgba(255,255,255,0.55)',
              boxShadow: '0 0 18px rgba(255,255,255,0.22)',
            }}
          />
          <div>
            <div style={{ fontSize: 12, color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, lineHeight: 1 }}>THE ENIGMATIC ELITE</div>
            <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.62)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic', marginTop: 2 }}>In Mystery We Reign</div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Bebas Neue', 'Oswald', sans-serif", color: '#fff', textTransform: 'uppercase', letterSpacing: 4, lineHeight: 1, textShadow: '0 0 28px rgba(255,255,255,0.38)' }}>
            {title}
          </div>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.72)', textTransform: 'uppercase', letterSpacing: 3, marginTop: 4 }}>
            {subtitle}
          </div>
        </div>
      </div>

      {/* ── TEAM POSTER: 3 large players side by side ────────────── */}
      {!p1 ? (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, zIndex: 20 }}>
          No stats recorded for this period yet.
        </div>
      ) : (
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 10,
        }}>
          {slots.map(({ player: r, rank, label, color, imgHeight, flex }) => {
            if (!r) return <div key={rank} style={{ flex }} />;
            const nameParts = r.player.name.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');

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
                {/* ── Medal ──────────────────────────────────────── */}
                <div style={{
                  position: 'absolute', top: 56,
                  fontSize: rank === 1 ? 28 : 20,
                  filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.7))',
                  zIndex: 20,
                }}>
                  {MEDAL[rank - 1]}
                </div>

                {/* ── Player image (cutout processed) ──────────── */}
                <PlayerCutoutImg
                  src={r.player.coverImageUrl}
                  alt={r.player.name}
                  imgHeight={imgHeight}
                  glow={glow}
                />

                {/* ── Bottom info overlay ───────────────────────── */}
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  padding: rank === 1 ? '50px 10px 12px' : '42px 8px 10px',
                  background: 'linear-gradient(0deg, rgba(0,0,15,0.95) 0%, rgba(0,0,15,0.55) 65%, transparent 100%)',
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
                    fontSize: 8.5, fontWeight: 900, color, letterSpacing: 2.5,
                    textTransform: 'uppercase', marginTop: 4,
                    textShadow: `0 0 10px ${color}80`,
                  }}>
                    {label}
                  </div>

                  {/* Points */}
                  <div style={{
                    fontSize: rank === 1 ? 28 : 22, fontWeight: 900,
                    fontFamily: "'Oswald', sans-serif", color,
                    fontStyle: 'italic', lineHeight: 1, marginTop: 3,
                    textShadow: `0 0 18px ${color}88`,
                  }}>
                    +{r.points}
                    <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginLeft: 4, fontStyle: 'normal', letterSpacing: 1 }}>PTS</span>
                  </div>

                  {/* Mini stats */}
                  <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.52)', fontFamily: "'Oswald', sans-serif", letterSpacing: 1, marginTop: 2 }}>
                    {r.goals}G · {r.appearances}APP · {r.motm}M
                  </div>
                </div>

                {/* Ghost rank number */}
                <div style={{
                  position: 'absolute', top: 58, right: rank === 1 ? 14 : 8,
                  fontSize: rank === 1 ? 60 : 48, fontWeight: 900,
                  fontFamily: "'Oswald', 'Impact', sans-serif",
                  color: 'rgba(255,255,255,0.05)', lineHeight: 1,
                  userSelect: 'none', zIndex: 3,
                }}>
                  {rank}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Bottom accent line ────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: isMonthly
          ? 'linear-gradient(90deg, transparent, #FFD700, transparent)'
          : 'linear-gradient(90deg, transparent, #38BDF8, transparent)',
        zIndex: 30,
      }} />

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 7, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 35,
      }}>
        <div style={{ fontSize: 7.5, fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: 2.5, textTransform: 'uppercase' }}>
          THE ENIGMATIC ELITE FC · OFFICIAL LEADERBOARD
        </div>
      </div>
    </div>
  );
}
