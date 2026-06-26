import { useState, useEffect } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Avatar } from '@/shared/components';
import { Award, Sparkles } from 'lucide-react';

export function HallOfFame() {
  const {
    hallOfFame,
    players,
    fetchHallOfFame,
  } = useFootballStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchHallOfFame();
      setIsLoading(false);
    };
    load();
  }, [fetchHallOfFame]);

  const getPlayer = (id: string) => players.find(p => p.id === id);

  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-8 gap-4 border-b border-border/40 pb-6 animate-pulse">
          <div className="space-y-2">
            <div className="h-7 w-40 bg-muted rounded-md" />
            <div className="h-4 w-72 bg-muted rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse h-[240px]" style={{ background: '#1c1600' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-8 gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            <h2 className="font-heading font-bold text-[28px] tracking-wide">Hall of Fame</h2>
          </div>
          <p className="text-muted-foreground text-[13px] font-medium">
            Recognizing the exceptional records and outstanding achievements of the Enigmatic Elites
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
        {hallOfFame.map(entry => {
          const player = getPlayer(entry.playerId);
          return (
            <div
              key={entry.id}
              className="group"
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                position: 'relative',
                background: 'linear-gradient(145deg, #1c1400 0%, #221900 50%, #1a1200 100%)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(251,191,36,0.12)',
                border: '1px solid rgba(251,191,36,0.15)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(251,191,36,0.3), 0 0 40px rgba(251,191,36,0.08)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(251,191,36,0.35)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(251,191,36,0.12)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(251,191,36,0.15)';
              }}
            >
              {/* Decorative top-right corner glow */}
              <div style={{ position: 'absolute', top: 0, right: 0, width: '180px', height: '180px', background: 'radial-gradient(circle at top right, rgba(251,191,36,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
              {/* Decorative bottom-left glow */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '120px', height: '120px', background: 'radial-gradient(circle at bottom left, rgba(217,119,6,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

              <div style={{ position: 'relative', zIndex: 1, padding: '24px' }}>
                {/* ─── Top row: Avatar + Name + Category badge ─── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                  {/* Avatar with gold ring */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      padding: '3px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #fbbf24, #d97706, #92400e)',
                      boxShadow: '0 0 20px rgba(251,191,36,0.35)',
                    }}>
                      <div style={{ borderRadius: '50%', overflow: 'hidden', background: '#1c1400' }}>
                        <Avatar name={player?.name ?? 'Legend'} size={68} src={player?.profileImageUrl} />
                      </div>
                    </div>
                    {/* Award pin */}
                    <div style={{
                      position: 'absolute', bottom: '-2px', right: '-2px',
                      width: '24px', height: '24px',
                      background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                      borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 10px rgba(251,191,36,0.6)',
                      border: '2px solid #1c1400',
                    }}>
                      <Award size={12} style={{ color: '#78350f' }} />
                    </div>
                  </div>

                  {/* Name + jersey */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontWeight: 800, fontSize: '20px',
                      color: '#fef3c7', letterSpacing: '0.02em',
                      lineHeight: 1.1, marginBottom: '4px',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {player?.name ?? 'Unknown Legend'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#d97706', fontWeight: 600, letterSpacing: '0.06em' }}>
                      👕 #{player?.jerseyNumber ?? '—'}
                    </p>
                  </div>

                  {/* Category badge */}
                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: 'linear-gradient(135deg, #b45309, #92400e)',
                      color: '#fef3c7', fontSize: '10px', fontWeight: 800,
                      letterSpacing: '0.1em', padding: '5px 12px',
                      borderRadius: '999px', textTransform: 'uppercase',
                      boxShadow: '0 2px 12px rgba(180,83,9,0.5)',
                      border: '1px solid rgba(251,191,36,0.2)',
                    }}>
                      <Award size={10} />
                      {entry.category}
                    </span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: 'rgba(251,191,36,0.08)',
                      color: '#fbbf24', fontSize: '10px', fontWeight: 700,
                      letterSpacing: '0.08em', padding: '4px 10px',
                      borderRadius: '999px',
                      border: '1px solid rgba(251,191,36,0.15)',
                    }}>
                      🏆 {entry.seasonText}
                    </span>
                  </div>
                </div>

                {/* ─── Divider ─── */}
                <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(251,191,36,0.3), transparent)', marginBottom: '16px' }} />

                {/* ─── Subtitle ─── */}
                <p style={{
                  fontSize: '12px', fontWeight: 800,
                  color: '#fbbf24', textTransform: 'uppercase',
                  letterSpacing: '0.1em', marginBottom: '10px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{ display: 'inline-block', width: '4px', height: '14px', background: 'linear-gradient(to bottom, #fbbf24, #d97706)', borderRadius: '2px', flexShrink: 0 }} />
                  {entry.subTitle}
                </p>

                {/* ─── Description ─── */}
                <p style={{
                  fontSize: '13px', color: '#a78219',
                  lineHeight: 1.7, margin: 0,
                  background: 'rgba(251,191,36,0.05)',
                  border: '1px solid rgba(251,191,36,0.08)',
                  borderRadius: '10px', padding: '10px 14px',
                }}>
                  {entry.descriptions}
                </p>
              </div>
            </div>
          );
        })}

        {hallOfFame.length === 0 && (
          <div className="col-span-full py-20 text-center rounded-2xl flex flex-col items-center justify-center" style={{ background: 'rgba(28,20,0,0.5)', border: '2px dashed rgba(251,191,36,0.2)' }}>
            <Award className="w-14 h-14 mb-4" style={{ color: 'rgba(251,191,36,0.3)' }} />
            <p style={{ color: 'rgba(251,191,36,0.4)', fontSize: '14px', fontWeight: 600 }}>No one inducted yet — greatness awaits! 🏆</p>
          </div>
        )}
      </div>
    </div>
  );
}
