import React from 'react';
import { Player } from '@/features/players/types';
import { Avatar } from '@/shared/components';

interface BirthdayCardProps {
  player: Player;
  aspect?: '4:5' | '1:1' | '16:9' | '9:16';
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function BirthdayCard({ player, cardRef }: BirthdayCardProps) {
  const nameParts = player.name.trim().split(' ');
  const lastName  = nameParts.pop() || '';
  const firstName = nameParts.join(' ');

  return (
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
      {/* ── Rich golden ambient background ─────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 120% 80% at 60% 30%, rgba(200,140,0,0.22) 0%, transparent 65%), radial-gradient(ellipse 80% 60% at 20% 80%, rgba(180,80,0,0.18) 0%, transparent 60%)',
        zIndex: 1,
      }} />

      {/* ── Sparkle confetti dots ───────────────────────────────────── */}
      {[
        { top: '12%', left: '8%',  size: 6,  color: '#FFD700', opacity: 0.7 },
        { top: '8%',  left: '78%', size: 8,  color: '#FF6B6B', opacity: 0.6 },
        { top: '18%', left: '88%', size: 5,  color: '#FFD700', opacity: 0.5 },
        { top: '25%', left: '5%',  size: 4,  color: '#FFA500', opacity: 0.6 },
        { top: '35%', left: '92%', size: 7,  color: '#FF6B6B', opacity: 0.5 },
        { top: '72%', left: '6%',  size: 5,  color: '#FFD700', opacity: 0.4 },
        { top: '80%', left: '88%', size: 6,  color: '#FFA500', opacity: 0.5 },
        { top: '60%', left: '90%', size: 4,  color: '#FFD700', opacity: 0.4 },
      ].map((dot, i) => (
        <div key={i} style={{
          position: 'absolute', top: dot.top, left: dot.left,
          width: dot.size, height: dot.size,
          borderRadius: '50%', background: dot.color,
          opacity: dot.opacity, zIndex: 2,
        }} />
      ))}

      {/* ── Diagonal sparkle lines ──────────────────────────────────── */}
      <div style={{
        position: 'absolute', left: -30, top: '20%',
        width: 200, height: 3,
        background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent)',
        transform: 'rotate(-20deg)', zIndex: 2,
      }} />
      <div style={{
        position: 'absolute', right: -30, top: '55%',
        width: 180, height: 2,
        background: 'linear-gradient(270deg, transparent, rgba(255,165,0,0.25), transparent)',
        transform: 'rotate(15deg)', zIndex: 2,
      }} />

      {/* ── Giant watermark: "HBD" ─────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: 40, left: 0, right: 0,
        textAlign: 'center',
        fontSize: 240,
        fontWeight: 900,
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        color: 'rgba(255,215,0,0.05)',
        letterSpacing: -12,
        lineHeight: 1,
        userSelect: 'none',
        pointerEvents: 'none',
        zIndex: 3,
      }}>
        HBD
      </div>

      {/* ── Top header ─────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '20px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/images/club-logo.jpg"
            alt="Club Logo"
            style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1.5px solid rgba(255,200,0,0.4)' }}
          />
          <div style={{ fontSize: 11, color: 'rgba(255,215,0,0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic' }}>
            In Mystery We Reign
          </div>
        </div>

        {/* Birthday cake emoji badge */}
        <div style={{
          background: 'linear-gradient(135deg, #b8860b, #FFD700)',
          color: '#0C0C10',
          fontSize: 20,
          width: 46, height: 46, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(255,215,0,0.4)',
        }}>
          🎂
        </div>
      </div>

      {/* ── Cursive subtitle ────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 74, left: 0, right: 0,
        textAlign: 'center',
        fontSize: 22,
        fontStyle: 'italic',
        fontFamily: 'Georgia, serif',
        fontWeight: 700,
        color: '#FFD700',
        letterSpacing: 1.5,
        zIndex: 20,
        textShadow: '0 2px 20px rgba(255,200,0,0.7), 0 0 40px rgba(200,140,0,0.5)',
      }}>
        Happy Birthday!
      </div>

      {/* ── Player avatar ───────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-45%, -52%)',
        zIndex: 15,
      }}>
        <div style={{
          width: 240, height: 240,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #FFD700 0%, #b8860b 50%, rgba(200,140,0,0.3) 100%)',
          padding: 4,
          boxShadow: '0 0 60px rgba(255,215,0,0.45), 0 20px 60px rgba(0,0,0,0.7)',
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

        {/* "Celebrating Today" badge below avatar */}
        <div style={{
          marginTop: 12,
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center', gap: 6,
            background: 'linear-gradient(135deg, #b8860b, #FFD700)',
            color: '#0C0C10',
            fontSize: 10, fontWeight: 900,
            textTransform: 'uppercase', letterSpacing: 2,
            padding: '5px 16px',
            borderRadius: 20,
            boxShadow: '0 4px 20px rgba(255,215,0,0.5)',
          }}>
            ✦ Celebrating Today ✦
          </div>
        </div>
      </div>

      {/* ── Bottom left quote ───────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 22, left: 28,
        maxWidth: 200, zIndex: 20,
      }}>
        <div style={{ color: '#FFD700', fontSize: 12, fontWeight: 900, marginBottom: 4 }}>✦</div>
        <p style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: 8, fontStyle: 'italic', lineHeight: 1.5, margin: 0,
        }}>
          "Wishing you a brilliant day as special as the moments you create on the pitch."
        </p>
      </div>

      {/* ── Bottom right player name ────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 22, right: 28,
        textAlign: 'right', zIndex: 20,
      }}>
        {firstName && (
          <div style={{
            fontSize: 28, fontWeight: 900,
            fontFamily: "'Impact', 'Arial Black', sans-serif",
            color: '#fff', textTransform: 'uppercase',
            letterSpacing: -1, lineHeight: 1,
          }}>
            {firstName}
          </div>
        )}
        <div style={{
          fontSize: 30, fontWeight: 700,
          fontFamily: 'Georgia, serif', fontStyle: 'italic',
          color: '#FFD700', lineHeight: 1, marginTop: 2,
          textShadow: '0 2px 16px rgba(255,215,0,0.6)',
        }}>
          {lastName}
        </div>
        {player.jerseyNumber && (
          <div style={{
            fontSize: 9, color: 'rgba(255,215,0,0.5)',
            fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: 2, marginTop: 6,
          }}>
            JERSEY #{player.jerseyNumber}
          </div>
        )}
      </div>

    </div>
  );
}
