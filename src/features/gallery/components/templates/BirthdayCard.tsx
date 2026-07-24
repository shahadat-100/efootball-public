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
        background: '#0B0B0F',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        boxShadow: '0 35px 90px rgba(0,0,0,0.85)',
        border: '1.5px solid rgba(212,175,55,0.25)', // Subtle gold border
      }}
    >
      {/* ── Luxury gold & dark carbon radial background ─────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 130% 90% at 75% 25%, rgba(184,134,11,0.24) 0%, transparent 65%), radial-gradient(ellipse 90% 70% at 20% 80%, rgba(139,101,8,0.18) 0%, transparent 60%)',
        zIndex: 1,
      }} />

      {/* ── Subtle grid overlay for tech/sport look ─────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(212,175,55,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.03) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        zIndex: 2,
        opacity: 0.6,
      }} />

      {/* ── Floating premium gold sparkles/dots ─────────────────────────── */}
      {[
        { top: '15%', left: '10%', size: 6, color: '#FFD700', opacity: 0.8 },
        { top: '10%', left: '80%', size: 8, color: '#D4AF37', opacity: 0.7 },
        { top: '22%', left: '90%', size: 5, color: '#FFD700', opacity: 0.6 },
        { top: '30%', left: '7%',  size: 4, color: '#AA7C11', opacity: 0.7 },
        { top: '42%', left: '93%', size: 7, color: '#FFD700', opacity: 0.6 },
        { top: '75%', left: '8%',  size: 5, color: '#D4AF37', opacity: 0.5 },
        { top: '85%', left: '90%', size: 6, color: '#FFD700', opacity: 0.7 },
        { top: '65%', left: '92%', size: 4, color: '#AA7C11', opacity: 0.5 },
      ].map((dot, i) => (
        <div key={i} style={{
          position: 'absolute', top: dot.top, left: dot.left,
          width: dot.size, height: dot.size,
          borderRadius: '50%', background: dot.color,
          opacity: dot.opacity, zIndex: 3,
          boxShadow: `0 0 10px ${dot.color}`,
        }} />
      ))}

      {/* ── Giant Outline Watermark: "LEGEND" ───────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: 50, left: 0, right: 0,
        textAlign: 'center',
        fontSize: 160,
        fontWeight: 900,
        fontFamily: "'Golden Varsity Outline', 'Impact', sans-serif",
        color: 'rgba(212,175,55,0.06)',
        letterSpacing: 4,
        lineHeight: 1,
        userSelect: 'none',
        pointerEvents: 'none',
        zIndex: 3,
      }}>
        LEGEND
      </div>

      {/* ── Top Header Bar ─────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '24px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 20,
      }}>
        {/* Logo and Club Name/Slogan */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/images/club-logo.jpg"
            alt="Club Logo"
            style={{
              width: 44, height: 44,
              borderRadius: 8,
              objectFit: 'cover',
              border: '1.5px solid rgba(212,175,55,0.45)',
            }}
          />
          <div>
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              THE ENIGMATIC ELITE
            </div>
            <div style={{ fontSize: 10, color: '#D4AF37', fontFamily: "'Elegant Bloom', Georgia, serif", textTransform: 'uppercase', letterSpacing: 1.5 }}>
              In Mystery We Reign
            </div>
          </div>
        </div>

        {/* Birthday Badge */}
        <div style={{
          background: 'linear-gradient(135deg, #AA7C11, #FFD700)',
          color: '#0B0B0F',
          fontSize: 22,
          width: 48, height: 48,
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 25px rgba(212,175,55,0.5)',
        }}>
          🎂
        </div>
      </div>

      {/* ── Premium Birthday Script Subtitle ────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 80, left: 0, right: 0,
        textAlign: 'center',
        fontSize: 32,
        fontFamily: "'Elegant Bloom', Georgia, serif",
        color: '#FFD700',
        letterSpacing: 2,
        zIndex: 20,
        textShadow: '0 3px 25px rgba(212,175,55,0.7), 0 0 50px rgba(184,134,11,0.5)',
      }}>
        Happy Birthday!
      </div>

      {/* ── Player avatar with luxury double ring & glow ────────────────── */}
      <div style={{
        position: 'absolute',
        top: '51%', left: '50%',
        transform: 'translate(-45%, -52%)',
        zIndex: 15,
      }}>
        {/* Double border golden ring */}
        <div style={{
          width: 250, height: 250,
          borderRadius: '50%',
          border: '4px double #FFD700',
          padding: 6,
          background: 'radial-gradient(circle, rgba(11,11,15,0.9) 0%, rgba(20,20,30,0.4) 100%)',
          boxShadow: '0 0 70px rgba(212,175,55,0.4), 0 25px 70px rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyItems: 'center',
        }}>
          <div style={{
            width: '100%', height: '100%',
            borderRadius: '50%',
            background: '#15151A',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Avatar name={player.name} src={player.profileImageUrl} size={230} />
          </div>
        </div>

        {/* Celebrating Badge */}
        <div style={{
          marginTop: 16,
          textAlign: 'center',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center', gap: 6,
            background: 'linear-gradient(135deg, #8B6508, #FFD700)',
            color: '#0B0B0F',
            fontSize: 10, fontWeight: 900,
            textTransform: 'uppercase', letterSpacing: 2.5,
            padding: '6px 20px',
            borderRadius: 25,
            boxShadow: '0 5px 25px rgba(212,175,55,0.55)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}>
            ✦ Celebrating Today ✦
          </span>
        </div>
      </div>

      {/* ── Bottom Left Wish text ───────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 26, left: 30,
        maxWidth: 220, zIndex: 20,
      }}>
        <div style={{ color: '#FFD700', fontSize: 14, fontWeight: 900, marginBottom: 6 }}>✦</div>
        <p style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: 9, fontStyle: 'italic', lineHeight: 1.6, margin: 0,
        }}>
          "Wishing you a fantastic birthday! Thank you for your incredible dedication and magic on the pitch."
        </p>
      </div>

      {/* ── Bottom Right Name & Jersey area ─────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 26, right: 30,
        textAlign: 'right', zIndex: 20,
      }}>
        {firstName && (
          <div style={{
            fontSize: 34, fontWeight: 900,
            fontFamily: "'Maximum Voltage', 'Impact', sans-serif",
            color: '#fff', textTransform: 'uppercase',
            letterSpacing: 0.5, lineHeight: 0.95,
          }}>
            {firstName}
          </div>
        )}
        <div style={{
          fontSize: 36, fontWeight: 700,
          fontFamily: "'Elegant Bloom', Georgia, serif",
          color: '#FFD700', lineHeight: 1, marginTop: 4,
          textShadow: '0 2px 18px rgba(212,175,55,0.6)',
        }}>
          {lastName}
        </div>
        {player.jerseyNumber && (
          <div style={{
            fontSize: 10, color: 'rgba(212,175,55,0.65)',
            fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: 2, marginTop: 8,
          }}>
            Jersey #{player.jerseyNumber}
          </div>
        )}
      </div>

    </div>
  );
}
