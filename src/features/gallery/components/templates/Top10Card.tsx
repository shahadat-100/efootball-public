import React from 'react';
import { RankedPlayer } from '../../utils/galleryStats';
import { Avatar } from '@/shared/components';

interface Top10CardProps {
  topPlayers: RankedPlayer[];
  title: string;
  subtitle: string;
  aspect?: '4:5' | '1:1' | '16:9' | '9:16';
  cardRef?: React.RefObject<HTMLDivElement>;
}

const RANK_STYLE = (idx: number) => {
  if (idx === 0) return { color: '#FFD700', bg: 'linear-gradient(135deg,#b8860b,#FFD700)', text: '#0C0C10' };
  if (idx === 1) return { color: '#C0C0C0', bg: 'linear-gradient(135deg,#888,#C0C0C0)', text: '#0C0C10' };
  if (idx === 2) return { color: '#CC6600', bg: 'linear-gradient(135deg,#7a3d00,#CC6600)', text: '#fff' };
  return { color: 'rgba(255,255,255,0.25)', bg: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.5)' };
};

export function Top10Card({ topPlayers, title, subtitle, cardRef }: Top10CardProps) {
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

      {/* Diagonal brush stroke */}
      <div style={{
        position: 'absolute', left: -60, top: '20%',
        width: 360, height: 120,
        background: 'linear-gradient(105deg, rgba(180,10,10,0.18) 0%, transparent 100%)',
        transform: 'rotate(-10deg)', zIndex: 2,
      }} />

      {/* Giant watermark */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 280, fontWeight: 900,
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        color: 'rgba(255,255,255,0.04)',
        letterSpacing: -14, lineHeight: 1,
        userSelect: 'none', pointerEvents: 'none',
        zIndex: 3,
      }}>
        TOP10
      </div>

      {/* Left header panel */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: 190,
        padding: '24px 20px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        zIndex: 20,
        borderRight: '1px solid rgba(200,20,20,0.2)',
        background: 'rgba(12,12,16,0.6)',
      }}>
        <div>
          <img
            src="/images/club-logo.jpg"
            alt="Club Logo"
            style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1.5px solid rgba(200,20,20,0.4)', marginBottom: 10 }}
          />
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic' }}>
            In Mystery We Reign
          </div>
        </div>

        <div>
          <div style={{
            fontSize: 12, fontStyle: 'italic', fontFamily: 'Georgia, serif',
            color: '#FF6B6B', letterSpacing: 1, marginBottom: 6,
            textShadow: '0 2px 12px rgba(255,60,60,0.6)',
          }}>
            {subtitle}
          </div>
          <div style={{
            fontSize: 18, fontWeight: 900,
            fontFamily: "'Impact', 'Arial Black', sans-serif",
            color: '#fff', textTransform: 'uppercase',
            letterSpacing: -0.5, lineHeight: 1.15,
          }}>
            {title}
          </div>
        </div>

        <div style={{ width: 36, height: 3, background: '#CC1A1A', borderRadius: 2 }} />
      </div>

      {/* Right: 10 player grid (2 rows × 5 columns) */}
      <div style={{
        position: 'absolute', top: 0, left: 190, right: 0, bottom: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        zIndex: 10,
        padding: '14px 14px 14px 12px',
        gap: 8,
      } as React.CSSProperties}>
        {topPlayers.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1', gridRow: '1 / -1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.3)', fontSize: 13,
          }}>
            No stats recorded for this period yet.
          </div>
        ) : (
          topPlayers.slice(0, 10).map((r, idx) => {
            const rs = RANK_STYLE(idx);
            return (
              <div key={r.player.id || idx} style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${idx < 3 ? 'rgba(200,20,20,0.25)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 10,
                padding: '8px 6px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 4, position: 'relative',
                textAlign: 'center',
              }}>
                {/* Rank */}
                <div style={{
                  position: 'absolute', top: 5, left: 6,
                  background: rs.bg,
                  color: rs.text,
                  fontSize: 9, fontWeight: 900,
                  padding: '1px 6px', borderRadius: 3,
                }}>
                  #{idx + 1}
                </div>

                {/* Avatar */}
                <div style={{
                  width: 46, height: 46,
                  borderRadius: '50%',
                  background: rs.bg,
                  padding: 2.5,
                  boxShadow: idx < 3 ? `0 0 12px ${rs.color}40` : 'none',
                  marginTop: 4,
                }}>
                  <div style={{
                    width: '100%', height: '100%',
                    borderRadius: '50%', background: '#1a1520',
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Avatar name={r.player.name} src={r.player.profileImageUrl} size={41} />
                  </div>
                </div>

                {/* Name */}
                <div style={{
                  fontSize: 10, fontWeight: 800, color: '#fff',
                  textTransform: 'uppercase', lineHeight: 1.1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  width: '100%', padding: '0 4px',
                }}>
                  {r.player.name}
                </div>

                {/* Points */}
                <div style={{ fontSize: 12, fontWeight: 900, color: rs.color, lineHeight: 1 }}>
                  {r.points} <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>PTS</span>
                </div>

                {/* Goals + MOTM */}
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', lineHeight: 1 }}>
                  ⚽{r.goals} · ★{r.motm}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
