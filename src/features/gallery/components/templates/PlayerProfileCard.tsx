import React from 'react';
import { Player, PlayerSeasonStat } from '@/features/players/types';
import { Avatar } from '@/shared/components';

interface PlayerProfileCardProps {
  player: Player;
  seasonStats?: PlayerSeasonStat[];
  title?: string;
  subtitle?: string;
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function PlayerProfileCard({
  player,
  seasonStats = [],
  subtitle = 'Player of the Week',
  cardRef,
}: PlayerProfileCardProps) {
  const totalApps   = seasonStats.reduce((a, s) => a + (s.appearances || 0), 0);
  const totalGoals  = seasonStats.reduce((a, s) => a + (s.goals || 0), 0);
  const totalMotm   = seasonStats.reduce((a, s) => a + (s.motmCount || 0), 0);
  const totalWins   = seasonStats.reduce((a, s) => a + (s.wins || 0), 0);
  const totalDraws  = seasonStats.reduce((a, s) => a + (s.draws || 0), 0);
  const totalLosses = seasonStats.reduce((a, s) => a + (s.losses || 0), 0);

  const nameParts = player.name.trim().split(' ');
  const lastName  = nameParts.pop() || '';
  const firstName = nameParts.join(' ');

  return (
    /* 600 × 750 — matches CardFrame 4:5 export size */
    <div
      ref={cardRef}
      style={{
        width: 600,
        height: 750,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 28,
        background: '#0C0C10',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
      }}
    >
      {/* ── Dark grunge texture overlay ───────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 120% 70% at 70% 40%, #2a0808 0%, transparent 65%), radial-gradient(ellipse 80% 60% at 30% 80%, #1a0404 0%, transparent 60%)',
        zIndex: 1,
      }} />

      {/* ── Red diagonal brush strokes ────────────────────────────── */}
      <div style={{
        position: 'absolute', left: -40, top: '45%',
        width: 280, height: 120,
        background: 'linear-gradient(105deg, rgba(180,10,10,0.28) 0%, transparent 100%)',
        transform: 'rotate(-12deg)',
        zIndex: 2,
      }} />
      <div style={{
        position: 'absolute', right: -20, top: '30%',
        width: 180, height: 80,
        background: 'linear-gradient(255deg, rgba(160,10,10,0.18) 0%, transparent 100%)',
        transform: 'rotate(8deg)',
        zIndex: 2,
      }} />

      {/* ── Giant watermark text (TEE for profile, POTW for weekly) ── */}
      <div style={{
        position: 'absolute',
        bottom: 60, left: 0, right: 0,
        textAlign: 'center',
        fontSize: 260,
        fontWeight: 900,
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        color: 'rgba(255,255,255,0.07)',
        letterSpacing: -8,
        lineHeight: 1,
        userSelect: 'none',
        pointerEvents: 'none',
        zIndex: 3,
      }}>
        {subtitle.includes('Week') ? 'POTW' : subtitle.includes('Month') ? 'POTM' : 'TEE'}
      </div>

      {/* ── Top header bar ────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '20px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 20,
      }}>
        {/* Club logo + club name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/images/club-logo.jpg"
            alt="Club Logo"
            style={{
              width: 40, height: 40,
              borderRadius: 8,
              objectFit: 'cover',
              border: '1.5px solid rgba(200,20,20,0.4)',
            }}
          />
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic' }}>In Mystery We Reign</div>
        </div>

        {/* Jersey number */}
        {player.jerseyNumber && (
          <div style={{
            background: '#CC1A1A',
            color: '#fff',
            fontSize: 22, fontWeight: 900,
            fontFamily: "'Impact', 'Arial Black', sans-serif",
            width: 46, height: 46,
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {player.jerseyNumber}
          </div>
        )}
      </div>

      {/* ── Cursive subtitle ("Player of the Week · Week 4, July") ── */}
      <div style={{
        position: 'absolute', top: 74, left: 0, right: 0,
        textAlign: 'center',
        fontSize: 20,
        fontStyle: 'italic',
        fontFamily: 'Georgia, serif',
        fontWeight: 700,
        color: '#FF6B6B',
        letterSpacing: 1.5,
        zIndex: 20,
        textShadow: '0 2px 20px rgba(255,60,60,0.7), 0 0 40px rgba(200,20,20,0.5)',
      }}>
        {subtitle}
      </div>

      {/* ── Player avatar — large, centred, above MVP text ────────── */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-45%, -52%)',
        zIndex: 15,
      }}>
        {/* Outer glow ring */}
        <div style={{
          width: 240, height: 240,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #CC1A1A 0%, #8b0000 60%, transparent 100%)',
          padding: 4,
          boxShadow: '0 0 60px rgba(200,20,20,0.5), 0 20px 60px rgba(0,0,0,0.7)',
        }}>
          <div style={{
            width: '100%', height: '100%',
            borderRadius: '50%',
            background: '#1a1520',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Avatar name={player.name} src={player.profileImageUrl} size={232} />
          </div>
        </div>
      </div>

      {/* ── Left stats pills (skewed / parallelogram) ─────────────── */}
      <div style={{
        position: 'absolute',
        left: 28, bottom: 110,
        display: 'flex', flexDirection: 'column', gap: 8,
        zIndex: 20,
      }}>
        {[
          { val: totalApps,  lbl: 'Apps'  },
          { val: totalGoals, lbl: 'Goals' },
          { val: totalMotm,  lbl: 'MOTM'  },
        ].map(({ val, lbl }) => (
          <div key={lbl} style={{
            display: 'flex', alignItems: 'center', gap: 0,
            transform: 'skewX(-12deg)',
            overflow: 'hidden',
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(200,20,20,0.4)',
            width: 130,
          }}>
            {/* Red number block */}
            <div style={{
              background: 'linear-gradient(135deg, #CC1A1A, #8b0000)',
              color: '#fff',
              fontSize: 20, fontWeight: 900,
              fontFamily: "'Impact', 'Arial Black', sans-serif",
              minWidth: 52, textAlign: 'center',
              padding: '6px 0',
              transform: 'skewX(12deg)',
            }}>
              {val}
            </div>
            {/* Dark label block */}
            <div style={{
              background: 'rgba(28,8,8,0.95)',
              borderTop: '1px solid rgba(200,20,20,0.3)',
              borderBottom: '1px solid rgba(200,20,20,0.3)',
              borderRight: '1px solid rgba(200,20,20,0.3)',
              color: '#aaa',
              fontSize: 9, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 2,
              padding: '6px 10px',
              transform: 'skewX(12deg)',
              flex: 1,
            }}>
              {lbl}
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom left: quote ────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 22, left: 28,
        maxWidth: 200,
        zIndex: 20,
      }}>
        <div style={{ color: '#CC1A1A', fontSize: 12, fontWeight: 900, marginBottom: 4 }}>✖</div>
        <p style={{
          color: 'rgba(255,255,255,0.45)',
          fontSize: 8,
          fontStyle: 'italic',
          lineHeight: 1.5,
          margin: 0,
        }}>
          "Mystery is our game. Elite is our name."
        </p>
      </div>

      {/* ── Bottom right: player name ──────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 22, right: 28,
        textAlign: 'right',
        zIndex: 20,
      }}>
        {firstName && (
          <div style={{
            fontSize: 28, fontWeight: 900,
            fontFamily: "'Impact', 'Arial Black', sans-serif",
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: -1,
            lineHeight: 1,
          }}>
            {firstName}
          </div>
        )}
        <div style={{
          fontSize: 30, fontWeight: 700,
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          color: '#CC1A1A',
          lineHeight: 1,
          marginTop: 2,
          textShadow: '0 2px 16px rgba(200,20,20,0.6)',
        }}>
          {lastName}
        </div>
        <div style={{
          fontSize: 9, color: 'rgba(255,255,255,0.35)',
          fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: 2, marginTop: 6,
        }}>
          {totalWins}W · {totalDraws}D · {totalLosses}L
        </div>
      </div>

    </div>
  );
}
