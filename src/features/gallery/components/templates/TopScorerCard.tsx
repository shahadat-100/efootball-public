import React from 'react';
import { RankedPlayer } from '../../utils/galleryStats';
import { Avatar } from '@/shared/components';

interface TopScorerCardProps {
  data: RankedPlayer | null;
  periodLabel: string;
  type: 'weekly' | 'monthly' | 'season';
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function TopScorerCard({ data, periodLabel, type, cardRef }: TopScorerCardProps) {
  const subtitle = type === 'weekly'
    ? `Top Scorer of the Week · ${periodLabel}`
    : `Top Scorer of the Month · ${periodLabel}`;



  const nameParts = (data?.player.name ?? '').trim().split(' ');
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
      {/* Dark grunge texture overlay with gold/red highlights */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 120% 70% at 75% 30%, rgba(212,175,55,0.18) 0%, transparent 65%), radial-gradient(ellipse 80% 60% at 20% 80%, rgba(200,20,20,0.15) 0%, transparent 60%)',
        zIndex: 1,
      }} />

      {/* Soccer-net-style grid overlay for sporty feel */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(200,20,20,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(200,20,20,0.02) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        zIndex: 2,
      }} />

      {/* Gold & Red slashes on the right */}
      <div style={{
        position: 'absolute', right: -30, bottom: '25%',
        width: 250, height: 80,
        background: 'linear-gradient(255deg, rgba(212,175,55,0.2) 0%, transparent 100%)',
        transform: 'rotate(-8deg)',
        zIndex: 2,
      }} />
      <div style={{
        position: 'absolute', right: -50, bottom: '20%',
        width: 300, height: 60,
        background: 'linear-gradient(255deg, rgba(200,20,20,0.2) 0%, transparent 100%)',
        transform: 'rotate(-8deg)',
        zIndex: 2,
      }} />

      {/* Giant watermark */}
      <div style={{
        position: 'absolute',
        bottom: 40, left: 0, right: 0,
        textAlign: 'center',
        fontSize: 110,
        fontFamily: "'Doctor Glitch', 'Impact', sans-serif",
        color: 'rgba(255,255,255,0.07)',
        letterSpacing: 4,
        lineHeight: 1,
        userSelect: 'none',
        pointerEvents: 'none',
        zIndex: 3,
      }}>
        SCORER
      </div>

      {/* Top header */}
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
            style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1.5px solid rgba(200,20,20,0.4)' }}
          />
          <div>
            <div style={{ fontSize: 12, color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              THE ENIGMATIC ELITE
            </div>
            <div style={{ fontSize: 9, color: '#FF6B6B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic' }}>
              In Mystery We Reign
            </div>
          </div>
        </div>

        {data?.player.jerseyNumber && (
          <div style={{
            background: '#CC1A1A', color: '#fff',
            fontSize: 22, fontWeight: 900,
            fontFamily: "'Neon Sans', 'Impact', sans-serif",
            width: 46, height: 46, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {data.player.jerseyNumber}
          </div>
        )}
      </div>

      {/* Cursive subtitle */}
      <div style={{
        position: 'absolute', top: 74, left: 0, right: 0,
        textAlign: 'center',
        fontSize: 26,
        fontFamily: "'Elegant Bloom', Georgia, serif",
        color: '#FFD700',
        letterSpacing: 2,
        zIndex: 20,
        textShadow: '0 2px 20px rgba(255,215,0,0.65), 0 0 40px rgba(184,134,11,0.5)',
      }}>
        {subtitle}
      </div>

      {data ? (
        <>
          {/* Player avatar */}
          <div style={{
            position: 'absolute',
            top: '48%', left: '50%',
            transform: 'translate(-45%, -52%)',
            zIndex: 15,
          }}>
            <div style={{
              width: 220, height: 220,
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
                <Avatar name={data.player.name} src={data.player.profileImageUrl} size={212} />
              </div>
            </div>
          </div>

          {/* Left stats — Goals highlighted large */}
          <div style={{
            position: 'absolute', left: 28, bottom: 110,
            display: 'flex', flexDirection: 'column', gap: 8,
            zIndex: 20,
          }}>
            {[
              { val: data.goals,       lbl: 'Goals'   },
              { val: data.appearances, lbl: 'Apps'    },
              { val: data.motm,        lbl: 'MOTM'    },
            ].map(({ val, lbl }, i) => (
              <div key={lbl} style={{
                display: 'flex', alignItems: 'center',
                transform: 'skewX(-12deg)',
                overflow: 'hidden',
                borderRadius: 4,
                boxShadow: '0 4px 20px rgba(200,20,20,0.4)',
                width: i === 0 ? 150 : 130,
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #CC1A1A, #8b0000)',
                  color: '#fff',
                  fontSize: i === 0 ? 26 : 20,
                  fontWeight: 900,
                  fontFamily: "'Neon Sans', 'Impact', sans-serif",
                  minWidth: i === 0 ? 60 : 52,
                  textAlign: 'center',
                  padding: i === 0 ? '8px 0' : '6px 0',
                  transform: 'skewX(12deg)',
                }}>
                  {val}
                </div>
                <div style={{
                  background: 'rgba(28,8,8,0.95)',
                  borderTop: '1px solid rgba(200,20,20,0.3)',
                  borderBottom: '1px solid rgba(200,20,20,0.3)',
                  borderRight: '1px solid rgba(200,20,20,0.3)',
                  color: i === 0 ? '#fff' : '#aaa',
                  fontSize: i === 0 ? 10 : 9,
                  fontWeight: 700,
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

          {/* Bottom left quote */}
          <div style={{ position: 'absolute', bottom: 22, left: 28, maxWidth: 200, zIndex: 20 }}>
            <div style={{ color: '#CC1A1A', fontSize: 12, fontWeight: 900, marginBottom: 4 }}>✖</div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 8, fontFamily: "'Helvetica Punk', sans-serif", lineHeight: 1.5, margin: 0 }}>
              "Mystery is our game. Elite is our name."
            </p>
          </div>

          {/* Bottom right player name */}
          <div style={{ position: 'absolute', bottom: 22, right: 28, textAlign: 'right', zIndex: 20 }}>
            {firstName && (
              <div style={{
                fontSize: 30,
                fontFamily: "'Doctor Glitch', 'Impact', sans-serif",
                color: '#fff', textTransform: 'uppercase',
                letterSpacing: 2, lineHeight: 1,
              }}>
                {firstName}
              </div>
            )}
            <div style={{
              fontSize: 32,
              fontFamily: "'The Wildeast', Georgia, serif",
              color: '#CC1A1A', lineHeight: 1, marginTop: 2,
              textShadow: '0 2px 16px rgba(200,20,20,0.6)',
            }}>
              {lastName}
            </div>
            <div style={{
              fontSize: 9, color: 'rgba(255,255,255,0.35)',
              fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: 2, marginTop: 6,
            }}>
              ★ TOP SCORER
            </div>
          </div>
        </>
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.3)', fontSize: 14, zIndex: 20,
        }}>
          No stats recorded for this period yet.
        </div>
      )}
    </div>
  );
}
