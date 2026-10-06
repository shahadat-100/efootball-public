import React from 'react';
import { RankedPlayer } from '../../utils/galleryStats';
import { useCutoutImage } from '../../utils/useCutoutImage';

interface Top10CardProps {
  topPlayers: RankedPlayer[];
  title: string;
  subtitle: string;
  aspect?: '4:5' | '1:1' | '16:9' | '9:16';
  cardRef?: React.RefObject<HTMLDivElement>;
}

/* ─── Sub-component: calls useCutoutImage hook per player ─────── */
function PlayerCutoutImg({
  src,
  alt,
  height,
  accentGlow,
}: {
  src?: string;
  alt: string;
  height: number;
  accentGlow: string;
}) {
  const processed = useCutoutImage(src);
  return (
    <img
      src={processed}
      alt={alt}
      crossOrigin="anonymous"
      style={{
        height,
        maxWidth: '100%',
        objectFit: 'contain',
        objectPosition: 'bottom center',
        display: 'block',
        filter: [
          'drop-shadow(0 0 1px rgba(255,255,255,0.7))',
          `drop-shadow(0 0 22px ${accentGlow})`,
          'drop-shadow(0 18px 38px rgba(0,0,0,0.95))',
        ].join(' '),
      }}
    />
  );
}

/* ─── Sub-component: avatar thumb in list rows ────────────────── */
function AvatarThumb({
  src,
  alt,
  rankColor,
  isTop3,
}: {
  src?: string;
  alt: string;
  rankColor: string;
  isTop3: boolean;
}) {
  const processed = useCutoutImage(src);
  return (
    <div style={{
      width: 34, height: 34,
      borderRadius: 7,
      overflow: 'hidden',
      flexShrink: 0,
      border: `1.5px solid ${isTop3 ? rankColor + '88' : 'rgba(255,255,255,0.18)'}`,
      background: 'transparent',
    }}>
      <img
        src={processed}
        alt={alt}
        crossOrigin="anonymous"
        style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top center' }}
      />
    </div>
  );
}

const MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };
const RANK_COLOR: Record<number, string> = {
  0: '#FFD700',
  1: '#C0C0C0',
  2: '#F59E0B',
};

export function Top10Card({ topPlayers, title, subtitle, cardRef }: Top10CardProps) {
  const isMonthly = title.toLowerCase().includes('monthly') || subtitle.toLowerCase().includes('month');
  const accent = isMonthly ? '#FFD700' : '#38BDF8';
  const accentGlow = isMonthly ? 'rgba(212,175,55,0.50)' : 'rgba(56,189,248,0.50)';

  const topLeader = topPlayers[0];
  const leaderCutout = topLeader?.player.coverImageUrl;

  const colA = topPlayers.slice(0, 5);
  const colB = topPlayers.slice(5, 10);

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
          ? 'linear-gradient(145deg, #1c0900 0%, #8b4000 42%, #180600 100%)'
          : 'linear-gradient(145deg, #01254e 0%, #0c45a0 42%, #011840 100%)',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── BG glow ──────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: isMonthly
          ? 'radial-gradient(ellipse at 20% 65%, rgba(210,120,0,0.30) 0%, transparent 55%)'
          : 'radial-gradient(ellipse at 20% 65%, rgba(56,189,248,0.28) 0%, transparent 55%)',
        zIndex: 1,
      }} />

      {/* ── BG diagonal stripe ────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(55deg, rgba(255,255,255,0.022) 0px, rgba(255,255,255,0.022) 1px, transparent 1px, transparent 24px)',
        zIndex: 1,
      }} />

      {/* ── Bottom shadow ─────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 180,
        background: 'linear-gradient(0deg, rgba(0,0,0,0.65) 0%, transparent 100%)',
        zIndex: 2,
      }} />

      {/* ── Watermark "10" ───────────────────────────────────────── */}
      <div style={{
        position: 'absolute', right: -20, bottom: -30,
        fontSize: 340, fontWeight: 900,
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        color: 'rgba(255,255,255,0.04)',
        lineHeight: 1, userSelect: 'none', pointerEvents: 'none', zIndex: 2,
      }}>
        10
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* LEFT PANEL: #1 hero cutout + branding                     */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 340, height: '100%',
        zIndex: 10, overflow: 'hidden',
      }}>
        {/* Club branding */}
        <div style={{
          position: 'absolute', top: 16, left: 20,
          display: 'flex', alignItems: 'center', gap: 10, zIndex: 25,
        }}>
          <img
            src="/images/club-logo.jpg"
            alt="Club Logo"
            crossOrigin="anonymous"
            style={{
              width: 38, height: 38, borderRadius: 8, objectFit: 'cover',
              border: '2px solid rgba(255,255,255,0.5)',
              boxShadow: '0 0 16px rgba(255,255,255,0.22)',
            }}
          />
          <div>
            <div style={{ fontSize: 11, color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, lineHeight: 1 }}>THE ENIGMATIC ELITE</div>
            <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic', marginTop: 2 }}>In Mystery We Reign</div>
          </div>
        </div>

        {/* Title */}
        <div style={{ position: 'absolute', top: 66, left: 20, right: 16, zIndex: 25 }}>
          <div style={{
            fontSize: 32, fontWeight: 900, lineHeight: 0.95,
            fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
            color: '#fff', textTransform: 'uppercase', letterSpacing: 3,
            textShadow: '0 0 25px rgba(255,255,255,0.32)',
          }}>
            {title}
          </div>
          <div style={{
            fontSize: 10, fontWeight: 800,
            fontFamily: "'Oswald', sans-serif",
            color: accent, textTransform: 'uppercase',
            letterSpacing: 3, marginTop: 5,
          }}>
            {subtitle}
          </div>
        </div>

        {/* #1 Leader large cutout — uses PlayerCutoutImg */}
        {leaderCutout && (
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: 440,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            zIndex: 15, pointerEvents: 'none',
          }}>
            <PlayerCutoutImg
              src={leaderCutout}
              alt={topLeader?.player.name || ''}
              height={430}
              accentGlow={accentGlow}
            />

            {/* Crown badge */}
            <div style={{
              position: 'absolute', bottom: 14, left: 10,
              background: 'rgba(0,5,20,0.88)',
              backdropFilter: 'blur(12px)',
              border: `1.5px solid ${accent}`,
              borderRadius: 10,
              padding: '5px 12px',
              display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: `0 4px 18px rgba(0,0,0,0.8), 0 0 14px ${accentGlow}`,
              zIndex: 20,
            }}>
              <span style={{ fontSize: 16 }}>👑</span>
              <div style={{
                fontSize: 11, fontWeight: 900,
                fontFamily: "'Oswald', sans-serif",
                color: '#fff', textTransform: 'uppercase',
                letterSpacing: 1.2, lineHeight: 1.15,
              }}>
                {(() => {
                  const parts = (topLeader?.player.name || '').trim().split(' ');
                  return (
                    <>
                      <div>{parts[0]}</div>
                      {parts.slice(1).join(' ') && <div>{parts.slice(1).join(' ')}</div>}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vertical divider */}
      <div style={{
        position: 'absolute', top: 20, bottom: 20, left: 340, width: 1.5,
        background: `linear-gradient(180deg, transparent, ${accent}, transparent)`,
        zIndex: 20,
      }} />

      {/* ══════════════════════════════════════════════════════════ */}
      {/* RIGHT PANEL: 2-column Top-10 list                         */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', top: 18, left: 356, right: 18, bottom: 18,
        display: 'flex', gap: 10, zIndex: 20,
      }}>
        {[colA, colB].map((col, cIdx) => (
          <div key={cIdx} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'center' }}>
            {col.map((r, rowIdx) => {
              const absIdx = cIdx * 5 + rowIdx;
              const rankColor = RANK_COLOR[absIdx] || 'rgba(255,255,255,0.65)';
              const isTop3 = absIdx < 3;
              const nameParts = r.player.name.trim().split(' ');

              return (
                <div
                  key={r.player.id || absIdx}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    background: isTop3
                      ? `linear-gradient(90deg, ${isMonthly ? 'rgba(212,175,55,0.20)' : 'rgba(14,165,233,0.20)'} 0%, rgba(255,255,255,0.04) 100%)`
                      : 'rgba(255,255,255,0.04)',
                    border: isTop3 ? `1px solid ${rankColor}55` : '1px solid rgba(255,255,255,0.10)',
                    borderLeft: `3.5px solid ${rankColor}`,
                    borderRadius: 10,
                    padding: '6px 10px',
                    boxShadow: isTop3
                      ? `0 4px 14px rgba(0,0,0,0.5), inset 0 0 10px ${rankColor}18`
                      : '0 2px 8px rgba(0,0,0,0.4)',
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    fontSize: isTop3 ? 17 : 13, fontWeight: 900,
                    fontFamily: "'Oswald', sans-serif", color: rankColor,
                    minWidth: 18, textAlign: 'center', lineHeight: 1, fontStyle: 'italic',
                    textShadow: isTop3 ? `0 0 10px ${rankColor}` : 'none',
                  }}>
                    {absIdx + 1}
                  </div>

                  {/* Medal */}
                  {isTop3 && (
                    <span style={{ fontSize: 13, lineHeight: 1, flexShrink: 0 }}>
                      {MEDAL[absIdx]}
                    </span>
                  )}

                  {/* Avatar — AvatarThumb processes image per row */}
                  <AvatarThumb
                    src={r.player.coverImageUrl}
                    alt={r.player.name}
                    rankColor={rankColor}
                    isTop3={isTop3}
                  />

                  {/* Name + stats */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: isTop3 ? 12 : 10.5, fontWeight: 800,
                      fontFamily: "'Oswald', sans-serif", color: '#fff',
                      textTransform: 'uppercase',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      letterSpacing: 0.8, lineHeight: 1,
                    }}>
                      {nameParts[0]}
                    </div>
                    {nameParts.length > 1 && (
                      <div style={{
                        fontSize: isTop3 ? 10.5 : 9.5, fontWeight: 700,
                        fontFamily: "'Oswald', sans-serif", color: 'rgba(255,255,255,0.7)',
                        textTransform: 'uppercase',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        letterSpacing: 0.5, lineHeight: 1, marginTop: 1,
                      }}>
                        {nameParts.slice(1).join(' ')}
                      </div>
                    )}
                    <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.42)', letterSpacing: 0.5, marginTop: 2 }}>
                      {r.goals}G · {r.appearances}APP · {r.motm}M
                    </div>
                  </div>

                  {/* Points */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontSize: isTop3 ? 18 : 14, fontWeight: 900,
                      fontFamily: "'Oswald', sans-serif", color: rankColor,
                      lineHeight: 1, fontStyle: 'italic',
                      textShadow: isTop3 ? `0 0 10px ${rankColor}80` : 'none',
                    }}>
                      +{r.points}
                    </div>
                    <div style={{ fontSize: 7, fontWeight: 800, color: 'rgba(255,255,255,0.36)', textTransform: 'uppercase', letterSpacing: 0.5 }}>PTS</div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── Bottom accent line ────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: isMonthly
          ? 'linear-gradient(90deg, transparent, #FFD700, transparent)'
          : 'linear-gradient(90deg, transparent, #38BDF8, transparent)',
        zIndex: 30,
      }} />
    </div>
  );
}
