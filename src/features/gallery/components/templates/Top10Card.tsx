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

const RANK_COLOR: Record<number, string> = {
  0: '#FFD700',
  1: '#C0C0C0',
  2: '#CD7F32',
};

export function Top10Card({ topPlayers, title, subtitle, cardRef }: Top10CardProps) {
  const firstCol = topPlayers.slice(0, 5);
  const secondCol = topPlayers.slice(5, 10);

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
      {/* ── Atmospheric background ──────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: [
          'radial-gradient(ellipse 60% 60% at 0% 100%, rgba(204,26,26,0.18) 0%, transparent 60%)',
          'radial-gradient(ellipse 50% 50% at 100% 0%, rgba(184,134,11,0.1) 0%, transparent 55%)',
          'radial-gradient(ellipse 100% 40% at 50% 50%, rgba(20,5,5,0.95) 0%, transparent 100%)',
        ].join(', '),
        zIndex: 1,
      }} />

      {/* ── Giant ghost rank "10" ────────────────────────────────────── */}
      <div style={{
        position: 'absolute', right: -40, bottom: -40,
        fontSize: 400, fontWeight: 900,
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        color: 'rgba(255,255,255,0.025)',
        lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
        zIndex: 2,
      }}>
        10
      </div>

      {/* ── Vertical red accent stripe ───────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 340, width: 2, height: '100%',
        background: 'linear-gradient(180deg, transparent, rgba(204,26,26,0.5) 30%, rgba(204,26,26,0.5) 70%, transparent)',
        zIndex: 10,
      }} />

      {/* ── Left panel: Club branding + Title ──────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 340, height: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '0 28px',
        zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <img
            src="/images/club-logo.jpg"
            alt="Club Logo"
            style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', border: '1.5px solid rgba(200,20,20,0.5)' }}
          />
          <div>
            <div style={{ fontSize: 10, color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, lineHeight: 1 }}>
              THE ENIGMATIC ELITE
            </div>
            <div style={{ fontSize: 8, color: '#FF6B6B', fontFamily: "'Elegant Bloom', Georgia, serif", letterSpacing: 1.5 }}>
              In Mystery We Reign
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 13, color: '#FFD700',
          fontFamily: "'Elegant Bloom', Georgia, serif",
          letterSpacing: 1.5, lineHeight: 1, marginBottom: 6,
          textShadow: '0 0 12px rgba(255,215,0,0.5)',
        }}>
          {subtitle}
        </div>

        {/* Main title */}
        <div style={{
          fontSize: 34, fontWeight: 900, lineHeight: 1.1,
          fontFamily: "'Supersonic Rocketship', 'Impact', sans-serif",
          color: '#fff', textTransform: 'uppercase',
          letterSpacing: 2, marginBottom: 16,
        }}>
          {title}
        </div>

        {/* Red divider */}
        <div style={{ width: 60, height: 3, background: '#CC1A1A', borderRadius: 2, marginBottom: 16 }} />

        {/* League tagline */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: "'Maximum Voltage Italic', 'Impact', sans-serif", letterSpacing: 2, lineHeight: 1.6 }}>
          Squad Rankings<br />Performance Index
        </div>
      </div>

      {/* ── Right panel: Two columns of players ─────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 356, right: 0, height: '100%',
        display: 'flex', gap: 10,
        padding: '24px 20px',
        zIndex: 20,
      }}>
        {[firstCol, secondCol].map((col, cIdx) => (
          <div key={cIdx} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
            {col.map((r, rowIdx) => {
              const absIdx = cIdx * 5 + rowIdx;
              const rankColor = RANK_COLOR[absIdx] || 'rgba(255,255,255,0.6)';
              const isTop3 = absIdx < 3;
              return (
                <div key={r.player.id || absIdx} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: isTop3
                    ? `linear-gradient(90deg, rgba(204,26,26,0.18), rgba(204,26,26,0.06), transparent)`
                    : 'rgba(255,255,255,0.03)',
                  borderLeft: `3px solid ${rankColor}`,
                  borderRadius: '0 8px 8px 0',
                  padding: '8px 10px 8px 12px',
                  transition: 'all 0.2s',
                }}>
                  {/* Rank number */}
                  <div style={{
                    fontSize: isTop3 ? 20 : 15,
                    fontWeight: 900,
                    fontFamily: "'Impact', 'Arial Black', sans-serif",
                    color: rankColor,
                    minWidth: isTop3 ? 24 : 18,
                    lineHeight: 1,
                    textAlign: 'center',
                  }}>
                    {absIdx + 1}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: isTop3 ? 38 : 32, height: isTop3 ? 38 : 32,
                    borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                    border: `1.5px solid ${isTop3 ? rankColor : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: isTop3 ? `0 0 8px ${rankColor}60` : 'none',
                  }}>
                    <Avatar name={r.player.name} src={r.player.profileImageUrl} size={isTop3 ? 38 : 32} />
                  </div>

                  {/* Name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: isTop3 ? 12 : 10, fontWeight: 900,
                      fontFamily: "'Maximum Voltage', 'Impact', sans-serif",
                      color: '#fff', textTransform: 'uppercase',
                      lineHeight: 1.1, letterSpacing: 0.5,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {r.player.name}
                    </div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginTop: 2 }}>
                      {r.goals}G · {r.appearances}A · {r.motm}M
                    </div>
                  </div>

                  {/* Points */}
                  <div style={{
                    fontSize: isTop3 ? 18 : 14, fontWeight: 900,
                    fontFamily: "'Impact', 'Arial Black', sans-serif",
                    color: rankColor, lineHeight: 1, flexShrink: 0,
                  }}>
                    {r.points}
                    <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', display: 'block', textAlign: 'right' }}>PTS</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
