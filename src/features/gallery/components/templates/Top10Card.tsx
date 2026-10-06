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

/* ─── Sub-component: Player cutout image using canvas background stripper ─── */
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
        maxWidth: 'none',
        objectFit: 'contain',
        objectPosition: 'bottom center',
        display: 'block',
        filter: [
          'drop-shadow(0 0 1px rgba(255,255,255,0.65))',
          `drop-shadow(0 0 18px ${glow})`,
          'drop-shadow(0 14px 28px rgba(0,0,0,0.95))',
        ].join(' '),
      }}
    />
  );
}

const MEDAL_EMOJI: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

const RANK_ACCENTS: Record<number, { color: string; glow: string; border: string }> = {
  1: { color: '#FFD700', glow: 'rgba(255,215,0,0.6)', border: '#FFD700' },
  2: { color: '#E2E8F0', glow: 'rgba(226,232,240,0.5)', border: '#CBD5E1' },
  3: { color: '#F59E0B', glow: 'rgba(245,158,11,0.5)', border: '#F59E0B' },
  4: { color: '#38BDF8', glow: 'rgba(56,189,248,0.4)', border: '#0284C7' },
  5: { color: '#38BDF8', glow: 'rgba(56,189,248,0.4)', border: '#0284C7' },
  6: { color: '#818CF8', glow: 'rgba(129,140,248,0.4)', border: '#6366F1' },
  7: { color: '#818CF8', glow: 'rgba(129,140,248,0.4)', border: '#6366F1' },
  8: { color: '#94A3B8', glow: 'rgba(148,163,184,0.3)', border: '#64748B' },
  9: { color: '#94A3B8', glow: 'rgba(148,163,184,0.3)', border: '#64748B' },
  10: { color: '#64748B', glow: 'rgba(100,116,139,0.3)', border: '#475569' },
};

export function Top10Card({ topPlayers, title, subtitle, cardRef }: Top10CardProps) {
  const isMonthly = title.toLowerCase().includes('monthly') || subtitle.toLowerCase().includes('month');
  const accent = isMonthly ? '#FFD700' : '#38BDF8';

  /* 
   * Team Lineup Squad Formation (10 players side-by-side):
   * Center (#1) is in front with highest z-index & largest size (~74% card height).
   * Flanked on left & right with decreasing z-index towards wings.
   * Order from Left to Right across 960px width:
   * [#10, #8, #6, #4, #2, #1, #3, #5, #7, #9]
   */
  const slotDefinitions = [
    { rank: 10, leftPercent: 8,  zIndex: 4,  imgHeight: 330 },
    { rank: 8,  leftPercent: 17, zIndex: 6,  imgHeight: 345 },
    { rank: 6,  leftPercent: 26, zIndex: 8,  imgHeight: 360 },
    { rank: 4,  leftPercent: 36, zIndex: 10, imgHeight: 375 },
    { rank: 2,  leftPercent: 44, zIndex: 12, imgHeight: 390 },
    { rank: 1,  leftPercent: 52, zIndex: 15, imgHeight: 410 }, // CENTER CHAMPION: HIGHEST Z-INDEX
    { rank: 3,  leftPercent: 60, zIndex: 12, imgHeight: 390 },
    { rank: 5,  leftPercent: 68, zIndex: 10, imgHeight: 375 },
    { rank: 7,  leftPercent: 78, zIndex: 8,  imgHeight: 360 },
    { rank: 9,  leftPercent: 88, zIndex: 6,  imgHeight: 345 },
  ];

  const slots = slotDefinitions.map((s) => {
    const player = topPlayers[s.rank - 1];
    const styling = RANK_ACCENTS[s.rank] || RANK_ACCENTS[10];
    return {
      ...s,
      player,
      styling,
    };
  });

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
          ? 'linear-gradient(150deg, #1c0900 0%, #7c3500 38%, #140400 100%)'
          : 'linear-gradient(150deg, #011b3d 0%, #083c84 40%, #01122a 100%)',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── Stadium Floodlights Effect ───────────────────────────── */}
      <div style={{
        position: 'absolute', top: -40, left: 60, width: 280, height: 350,
        background: isMonthly
          ? 'radial-gradient(ellipse at top, rgba(255,200,60,0.32) 0%, transparent 70%)'
          : 'radial-gradient(ellipse at top, rgba(56,189,248,0.28) 0%, transparent 70%)',
        transform: 'rotate(-25deg)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', top: -40, right: 60, width: 280, height: 350,
        background: isMonthly
          ? 'radial-gradient(ellipse at top, rgba(255,200,60,0.32) 0%, transparent 70%)'
          : 'radial-gradient(ellipse at top, rgba(56,189,248,0.28) 0%, transparent 70%)',
        transform: 'rotate(25deg)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* ── BG Center Glow ───────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: isMonthly
          ? 'radial-gradient(ellipse at 50% 55%, rgba(220,130,0,0.38) 0%, transparent 65%)'
          : 'radial-gradient(ellipse at 50% 55%, rgba(14,165,233,0.30) 0%, transparent 65%)',
        zIndex: 1,
      }} />

      {/* ── Subtle Diagonal Grid Texture ─────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(55deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 24px)',
        zIndex: 1,
      }} />

      {/* ── Background Watermark "TOP 10" ─────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 210, fontWeight: 900,
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        color: 'rgba(255,255,255,0.035)',
        letterSpacing: -6, lineHeight: 1,
        userSelect: 'none', pointerEvents: 'none', zIndex: 2,
        paddingBottom: 70,
      }}>
        TOP 10
      </div>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '14px 26px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 35,
        background: 'linear-gradient(180deg, rgba(0,0,15,0.85) 0%, rgba(0,0,15,0.3) 70%, transparent 100%)',
      }}>
        {/* Left: Club identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <img
            src="/images/club-logo.jpg"
            alt="Club Logo"
            crossOrigin="anonymous"
            style={{
              width: 40, height: 40, borderRadius: 9, objectFit: 'cover',
              border: '2px solid rgba(255,255,255,0.6)',
              boxShadow: '0 0 16px rgba(255,255,255,0.22)',
            }}
          />
          <div>
            <div style={{ fontSize: 12, color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, lineHeight: 1 }}>
              THE ENIGMATIC ELITE
            </div>
            <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.65)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic', marginTop: 2 }}>
              In Mystery We Reign
            </div>
          </div>
        </div>

        {/* Right: Card Title */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 28, fontWeight: 900,
            fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
            color: '#fff', textTransform: 'uppercase', letterSpacing: 3.5, lineHeight: 1,
            textShadow: '0 0 25px rgba(255,255,255,0.35)',
          }}>
            {title}
          </div>
          <div style={{
            fontSize: 10, fontWeight: 800,
            color: accent, textTransform: 'uppercase', letterSpacing: 2.8, marginTop: 4,
            fontFamily: "'Oswald', sans-serif",
          }}>
            {subtitle}
          </div>
        </div>
      </div>

      {/* ── Ground Shadow & Pedestal Gradient ─────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 180,
        background: 'linear-gradient(0deg, rgba(0,0,12,0.96) 0%, rgba(0,0,12,0.7) 45%, transparent 100%)',
        zIndex: 20,
        pointerEvents: 'none',
      }} />

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ── TEAM SQUAD FORMATION: 10 Players Side-by-Side ────────── */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}>
        {slots.map((slot) => {
          if (!slot.player) return null;
          const { rank, leftPercent, zIndex, imgHeight, player: r, styling } = slot;
          const isTop3 = rank <= 3;
          const medal = MEDAL_EMOJI[rank];

          return (
            <div
              key={rank}
              style={{
                position: 'absolute',
                bottom: 58, // Sits right above the bottom dock
                left: `${leftPercent}%`,
                transform: 'translateX(-50%)',
                zIndex,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              {/* Floating Rank Crown / Medal Badge for Top 3 */}
              {isTop3 && (
                <div style={{
                  marginBottom: -16,
                  zIndex: zIndex + 2,
                  fontSize: rank === 1 ? 28 : 22,
                  filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.8))',
                  lineHeight: 1,
                }}>
                  {medal}
                </div>
              )}

              {/* Player Cutout Image (Hook called cleanly per player) */}
              <PlayerCutoutImg
                src={r.player.coverImageUrl}
                alt={r.player.name}
                imgHeight={imgHeight}
                glow={styling.glow}
              />

              {/* Floating Torso Tag for Center Player (#1) */}
              {rank === 1 && (
                <div style={{
                  position: 'absolute',
                  bottom: 70,
                  background: 'rgba(0, 5, 20, 0.88)',
                  backdropFilter: 'blur(10px)',
                  border: `1.5px solid ${styling.color}`,
                  borderRadius: 20,
                  padding: '3px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: `0 4px 18px rgba(0,0,0,0.9), 0 0 16px ${styling.glow}`,
                  zIndex: zIndex + 5,
                  whiteSpace: 'nowrap',
                }}>
                  <span style={{ fontSize: 13 }}>👑</span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 900,
                    fontFamily: "'Oswald', sans-serif",
                    color: '#FFD700',
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                  }}>
                    #{rank} {r.player.name}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ── BOTTOM LINEUP DOCK: 10 Player Slots with Stats ───────── */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        zIndex: 30,
        background: 'rgba(0, 4, 15, 0.94)',
        backdropFilter: 'blur(14px)',
        borderTop: `1px solid rgba(255,255,255,0.12)`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
      }}>
        {/* Ordered by rank 1 to 10 for clean scannable docked stats */}
        {Array.from({ length: 10 }).map((_, idx) => {
          const rank = idx + 1;
          const r = topPlayers[idx];
          const styling = RANK_ACCENTS[rank] || RANK_ACCENTS[10];
          const isTop3 = rank <= 3;
          const medal = MEDAL_EMOJI[rank];

          if (!r) {
            return (
              <div
                key={rank}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.25,
                }}
              >
                <div style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>#{rank}</div>
                <div style={{ fontSize: 9, color: '#fff' }}>-</div>
              </div>
            );
          }

          const nameParts = r.player.name.trim().split(' ');
          const shortName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];

          return (
            <div
              key={rank}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: '4px 2px',
                borderRight: idx < 9 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                background: rank === 1
                  ? 'rgba(255,215,0,0.08)'
                  : isTop3
                    ? 'rgba(255,255,255,0.04)'
                    : 'transparent',
              }}
            >
              {/* Highlight top border for Top 3 */}
              {isTop3 && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 4, right: 4, height: 2,
                  background: styling.color,
                  boxShadow: `0 0 8px ${styling.glow}`,
                }} />
              )}

              {/* Rank & Medal */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                fontSize: 10,
                fontWeight: 900,
                fontFamily: "'Oswald', sans-serif",
                color: styling.color,
                lineHeight: 1,
              }}>
                {medal && <span style={{ fontSize: 9 }}>{medal}</span>}
                <span>#{rank}</span>
              </div>

              {/* Player Name */}
              <div style={{
                fontSize: rank === 1 ? 10.5 : 9.5,
                fontWeight: 800,
                fontFamily: "'Oswald', sans-serif",
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                lineHeight: 1.1,
                marginTop: 2,
                maxWidth: 82,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'center',
              }}>
                {shortName}
              </div>

              {/* Points */}
              <div style={{
                fontSize: rank === 1 ? 12 : 10.5,
                fontWeight: 900,
                fontFamily: "'Oswald', sans-serif",
                color: styling.color,
                fontStyle: 'italic',
                lineHeight: 1,
                marginTop: 2,
              }}>
                +{r.points}
                <span style={{ fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginLeft: 2, fontStyle: 'normal' }}>PTS</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Accent Line ────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2.5,
        background: isMonthly
          ? 'linear-gradient(90deg, transparent, #FFD700 50%, transparent)'
          : 'linear-gradient(90deg, transparent, #38BDF8 50%, transparent)',
        zIndex: 40,
      }} />
    </div>
  );
}
