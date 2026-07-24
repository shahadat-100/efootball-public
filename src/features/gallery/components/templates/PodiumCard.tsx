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

const RANK_COLORS = [
  { border: '#FFD700', badge: 'linear-gradient(135deg,#b8860b,#FFD700)', badgeText: '#0C0C10', glow: 'rgba(255,215,0,0.35)' },
  { border: '#C0C0C0', badge: 'linear-gradient(135deg,#888,#C0C0C0)', badgeText: '#0C0C10', glow: 'rgba(192,192,192,0.2)' },
  { border: '#CC6600', badge: 'linear-gradient(135deg,#7a3d00,#CC6600)', badgeText: '#fff', glow: 'rgba(200,100,0,0.2)' },
];

export function PodiumCard({ topPlayers, title, subtitle, cardRef }: PodiumCardProps) {
  return (
    /* 960 × 540 — matches CardFrame 16:9 export size */
    <div
      ref={cardRef}
      style={{
        width: 960,
        height: 540,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 24,
        background: '#0C0C10',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
      }}
    >
      {/* Dark grunge texture */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 100% 80% at 70% 30%, #2a0808 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 10% 90%, #1a0404 0%, transparent 60%)',
        zIndex: 1,
      }} />

      {/* Diagonal brush strokes */}
      <div style={{
        position: 'absolute', left: -60, top: '30%',
        width: 360, height: 140,
        background: 'linear-gradient(105deg, rgba(180,10,10,0.2) 0%, transparent 100%)',
        transform: 'rotate(-10deg)', zIndex: 2,
      }} />
      <div style={{
        position: 'absolute', right: -40, bottom: '20%',
        width: 280, height: 100,
        background: 'linear-gradient(260deg, rgba(160,10,10,0.15) 0%, transparent 100%)',
        transform: 'rotate(8deg)', zIndex: 2,
      }} />

      {/* Giant watermark */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 320, fontWeight: 900,
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        color: 'rgba(255,255,255,0.04)',
        letterSpacing: -16, lineHeight: 1,
        userSelect: 'none', pointerEvents: 'none',
        zIndex: 3,
      }}>
        TOP3
      </div>

      {/* Left header panel */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: 220,
        padding: '28px 24px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        zIndex: 20,
        borderRight: '1px solid rgba(200,20,20,0.2)',
        background: 'rgba(12,12,16,0.6)',
      }}>
        {/* Top: logo + slogan */}
        <div>
          <img
            src="/images/club-logo.jpg"
            alt="Club Logo"
            style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', border: '1.5px solid rgba(200,20,20,0.4)', marginBottom: 12 }}
          />
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic' }}>
            In Mystery We Reign
          </div>
        </div>

        {/* Middle: title */}
        <div>
          <div style={{
            fontSize: 13, fontStyle: 'italic', fontFamily: 'Georgia, serif',
            color: '#FF6B6B', letterSpacing: 1, marginBottom: 6,
            textShadow: '0 2px 12px rgba(255,60,60,0.6)',
          }}>
            {subtitle}
          </div>
          <div style={{
            fontSize: 22, fontWeight: 900,
            fontFamily: "'Impact', 'Arial Black', sans-serif",
            color: '#fff', textTransform: 'uppercase',
            letterSpacing: -0.5, lineHeight: 1.1,
          }}>
            {title}
          </div>
        </div>

        {/* Bottom: accent line */}
        <div style={{ width: 40, height: 3, background: '#CC1A1A', borderRadius: 2 }} />
      </div>

      {/* Right: 3 player columns (flat, same height) */}
      <div style={{
        position: 'absolute', top: 0, left: 220, right: 0, bottom: 0,
        display: 'flex', alignItems: 'stretch',
        zIndex: 10,
      }}>
        {topPlayers.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            No stats recorded for this period yet.
          </div>
        ) : (
          topPlayers.slice(0, 3).map((r, idx) => {
            const rc = RANK_COLORS[idx] || RANK_COLORS[2];
            return (
              <div key={r.player.id || idx} style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '28px 16px',
                borderRight: idx < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                position: 'relative',
                gap: 10,
              }}>
                {/* Rank badge */}
                <div style={{
                  position: 'absolute', top: 20, left: 20,
                  background: rc.badge,
                  color: rc.badgeText,
                  fontSize: 11, fontWeight: 900,
                  padding: '3px 10px', borderRadius: 4,
                  letterSpacing: 1,
                }}>
                  #{idx + 1}
                </div>

                {/* Avatar */}
                <div style={{
                  width: 100, height: 100,
                  borderRadius: '50%',
                  background: rc.badge,
                  padding: 3,
                  boxShadow: `0 0 30px ${rc.glow}`,
                }}>
                  <div style={{
                    width: '100%', height: '100%',
                    borderRadius: '50%', background: '#1a1520',
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Avatar name={r.player.name} src={r.player.profileImageUrl} size={94} />
                  </div>
                </div>

                {/* Name */}
                <div style={{
                  fontSize: 15, fontWeight: 900, color: '#fff',
                  textTransform: 'uppercase', textAlign: 'center',
                  lineHeight: 1.2, maxWidth: 160,
                }}>
                  {r.player.name}
                </div>

                {/* Points */}
                <div style={{
                  fontSize: 22, fontWeight: 900,
                  fontFamily: "'Impact', 'Arial Black', sans-serif",
                  color: rc.glow.startsWith('rgba(255,215') ? '#FFD700' : rc.glow.startsWith('rgba(192') ? '#C0C0C0' : '#CC6600',
                  letterSpacing: -0.5,
                }}>
                  {r.points} <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>PTS</span>
                </div>

                {/* Stats row */}
                <div style={{
                  display: 'flex', gap: 8,
                }}>
                  {[
                    { val: r.goals, lbl: 'Goals' },
                    { val: r.appearances, lbl: 'Apps' },
                    { val: r.motm, lbl: 'MOTM' },
                  ].map(({ val, lbl }) => (
                    <div key={lbl} style={{
                      background: 'rgba(200,20,20,0.12)',
                      border: '1px solid rgba(200,20,20,0.25)',
                      borderRadius: 6,
                      padding: '4px 8px',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{val}</div>
                      <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
