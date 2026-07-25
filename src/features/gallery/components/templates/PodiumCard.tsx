import React from 'react';
import { RankedPlayer } from '../../utils/galleryStats';
import { Avatar } from '@/shared/components';

interface PodiumCardProps {
  topPlayers: RankedPlayer[];
  title: string;
  subtitle: string;
  aspect?: '4:5' | '1:1' | '16:9' | '9:16';
  cardRef?: React.RefObject<HTMLDivElement>;
}

const MEDAL = ['🥇', '🥈', '🥉'];
const RANK_RING = [
  { ring: 'linear-gradient(145deg, #FFD700, #b8860b)', glow: 'rgba(255,215,0,0.5)', pts: '#FFD700' },
  { ring: 'linear-gradient(145deg, #C0C0C0, #777)', glow: 'rgba(192,192,192,0.4)', pts: '#C0C0C0' },
  { ring: 'linear-gradient(145deg, #CD7F32, #7a3d00)', glow: 'rgba(205,127,50,0.4)', pts: '#CD7F32' },
];

export function PodiumCard({ topPlayers, title, subtitle, cardRef }: PodiumCardProps) {
  const isMonthly = title.toLowerCase().includes('monthly') || subtitle.toLowerCase().includes('month');

  const bgGradient = isMonthly
    ? 'radial-gradient(ellipse 80% 100% at 50% 110%, rgba(212,175,55,0.15) 0%, transparent 60%), radial-gradient(ellipse 120% 60% at 50% -10%, rgba(25,20,10,0.9) 0%, transparent 70%)'
    : 'radial-gradient(ellipse 80% 100% at 50% 110%, rgba(204,26,26,0.22) 0%, transparent 60%), radial-gradient(ellipse 120% 60% at 50% -10%, rgba(30,10,10,0.9) 0%, transparent 70%)';

  const floorGradient = isMonthly
    ? 'linear-gradient(to top, rgba(212,175,55,0.12) 0%, transparent 100%)'
    : 'linear-gradient(to top, rgba(204,26,26,0.18) 0%, transparent 100%)';

  const accentLineGradient = isMonthly
    ? 'linear-gradient(90deg, #D4AF37, rgba(212,175,55,0.2), transparent)'
    : 'linear-gradient(90deg, #CC1A1A, rgba(204,26,26,0.2), transparent)';

  const statBg = isMonthly ? 'rgba(212,175,55,0.15)' : 'rgba(204,26,26,0.2)';
  const statBorder = isMonthly ? '1px solid rgba(212,175,55,0.25)' : '1px solid rgba(204,26,26,0.3)';

  return (
    <div
      ref={cardRef}
      style={{
        width: 960,
        height: 540,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 24,
        background: '#08080C',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
      }}
    >
      {/* ── Deep dark atmospheric background ───────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: bgGradient,
        zIndex: 1,
      }} />

      {/* ── Stage floor light sweep ─────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 180,
        background: floorGradient,
        zIndex: 2,
      }} />

      {/* ── Giant watermark "TOP 3" ─────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 340, fontWeight: 900,
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        color: 'rgba(255,255,255,0.03)',
        letterSpacing: -16, lineHeight: 1,
        userSelect: 'none', pointerEvents: 'none',
        zIndex: 3,
      }}>
        TOP3
      </div>

      {/* ── Top-left: Club branding ─────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 22, left: 28,
        display: 'flex', alignItems: 'center', gap: 10,
        zIndex: 30,
      }}>
        <img
          src="/images/club-logo.jpg"
          alt="Club Logo"
          style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1.5px solid rgba(200,20,20,0.5)' }}
        />
        <div>
          <div style={{ fontSize: 11, color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, lineHeight: 1 }}>
            THE ENIGMATIC ELITE
          </div>
          <div style={{ fontSize: 9, color: '#FF6B6B', textTransform: 'uppercase', letterSpacing: 2, fontFamily: "'Elegant Bloom', Georgia, serif" }}>
            In Mystery We Reign
          </div>
        </div>
      </div>

      {/* ── Top-right: Title block ──────────────────────────────────── */}
      <div style={{ position: 'absolute', top: 18, right: 28, textAlign: 'right', zIndex: 30 }}>
        <div style={{
          fontSize: 28, fontWeight: 900, lineHeight: 1,
          fontFamily: "'Action Comics Black', 'Impact', sans-serif",
          color: '#fff', textTransform: 'uppercase',
          letterSpacing: 1,
        }}>
          {title}
        </div>
      </div>

      {/* ── Red horizontal accent line ──────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 80, left: 28, right: 28, height: 1.5,
        background: accentLineGradient,
        zIndex: 30,
      }} />

      {/* ── Three player columns ────────────────────────────────────── */}
      {topPlayers.length === 0 ? (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.3)', fontSize: 14,
        }}>
          No stats recorded for this period yet.
        </div>
      ) : (
        <div style={{
          position: 'absolute', top: 88, left: 20, right: 20, bottom: 20,
          display: 'flex', gap: 12, alignItems: 'flex-end',
          zIndex: 20,
        }}>
          {topPlayers.slice(0, 3).map((r, idx) => {
            const rr = RANK_RING[idx] || RANK_RING[2];
            // Center (1st place) column is taller
            const colHeight = '92%';

            return (
              <div key={r.player.id || idx} style={{
                flex: 1,
                height: colHeight,
                position: 'relative',
                background: idx === 0
                  ? (isMonthly ? 'linear-gradient(180deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.04) 100%)' : 'linear-gradient(180deg, rgba(204,26,26,0.15) 0%, rgba(204,26,26,0.05) 100%)')
                  : 'rgba(255,255,255,0.03)',
                border: idx === 0
                  ? (isMonthly ? '1px solid rgba(212,175,55,0.35)' : '1px solid rgba(204,26,26,0.4)')
                  : '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '16px 10px',
                backdropFilter: 'blur(4px)',
              }}>
                {/* Medal */}
                <div style={{ fontSize: 22, position: 'absolute', top: 10, left: 12 }}>{MEDAL[idx]}</div>

                {/* Avatar Ring */}
                <div style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  background: rr.ring,
                  padding: 3,
                  boxShadow: `0 0 25px ${rr.glow}, 0 0 50px ${rr.glow}`,
                  position: 'relative',
                }}>
                  <div style={{
                    width: '100%', height: '100%',
                    borderRadius: '50%', background: '#131318',
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Avatar name={r.player.name} src={r.player.profileImageUrl} size={84} />
                  </div>

                  {/* Jersey absolute badge */}
                  {r.player.jerseyNumber && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      background: isMonthly ? '#D4AF37' : '#CC1A1A',
                      color: isMonthly ? '#131318' : '#fff',
                      fontSize: 11,
                      fontWeight: 900,
                      fontFamily: "'Impact', sans-serif",
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px solid #131318',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    }}>
                      {r.player.jerseyNumber}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div style={{
                  fontSize: idx === 0 ? 15 : 12, fontWeight: 900,
                  fontFamily: "'Maximum Voltage', 'Impact', sans-serif",
                  color: '#fff', textTransform: 'uppercase',
                  textAlign: 'center', lineHeight: 1.1,
                }}>
                  {r.player.name}
                </div>

                {/* Points */}
                <div style={{
                  fontSize: idx === 0 ? 26 : 20, fontWeight: 900,
                  fontFamily: "'Impact', 'Arial Black', sans-serif",
                  color: rr.pts, lineHeight: 1,
                }}>
                  {r.points}
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginLeft: 3 }}>PTS</span>
                </div>

                {/* Mini stats */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {[
                    { v: r.goals, l: 'G' },
                    { v: r.appearances, l: 'A' },
                    { v: r.motm, l: 'M' },
                  ].map(({ v, l }) => (
                    <div key={l} style={{
                      background: statBg,
                      border: statBorder,
                      borderRadius: 5,
                      padding: '2px 6px',
                      fontSize: 10, fontWeight: 900,
                      color: '#fff', lineHeight: 1.3,
                      textAlign: 'center',
                    }}>
                      {v}
                      <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', display: 'block', letterSpacing: 1, fontFamily: "'Golden Varsity Regular', sans-serif" }}>{l}</span>
                    </div>
                  ))}
                </div>

                {/* W-D-L Record */}
                <div style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.45)',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  marginTop: 2,
                }}>
                  <span>{r.wins}W</span>
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>•</span>
                  <span>{r.draws}D</span>
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>•</span>
                  <span>{r.losses}L</span>
                  {r.appearances > 0 && (
                    <>
                      <span style={{ color: 'rgba(255,255,255,0.15)' }}>•</span>
                      <span style={{ color: isMonthly ? '#FFD700' : '#FF6B6B', fontWeight: 800 }}>
                        {Math.round((r.wins / r.appearances) * 100)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Bottom: Card footer info ─────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 12, left: 0, right: 0,
        textAlign: 'center',
        fontSize: 8,
        fontWeight: 700,
        color: 'rgba(255,255,255,0.2)',
        textTransform: 'uppercase',
        letterSpacing: 3,
        zIndex: 30,
      }}>
        OFFICIAL LEADERBOARD RESULTS • THE ENIGMATIC ELITE
      </div>

      {/* ── Bottom-right: Date / Period tag ─────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 10, right: 28,
        fontSize: 10, color: '#FFD700',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: 2,
        zIndex: 30,
        background: 'rgba(255,215,0,0.08)',
        border: '1px solid rgba(255,215,0,0.18)',
        padding: '3px 10px',
        borderRadius: 6,
        textShadow: '0 0 8px rgba(255,215,0,0.3)',
      }}>
        {subtitle}
      </div>
    </div>
  );
}
