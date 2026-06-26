import { useState, useEffect } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Avatar } from '@/shared/components';
import { Award, Sparkles } from 'lucide-react';

export function HallOfFame() {
  const { 
    hallOfFame, 
    players, 
    fetchHallOfFame
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
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: '#1a1200', height: '320px' }}>
              <div className="h-[180px] bg-muted/20" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-48 bg-muted/30 rounded" />
                <div className="h-3 w-full bg-muted/20 rounded" />
                <div className="h-3 w-3/4 bg-muted/20 rounded" />
              </div>
            </div>
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
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'default',
                background: '#120e00',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(251,191,36,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              {/* Top image/avatar area */}
              <div style={{ height: '160px', overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, #1c1500 0%, #2a1d00 50%, #1a1200 100%)' }}>
                {/* Ambient glow orbs */}
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-10px', left: '30px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,119,6,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                
                {/* Subtle trophy pattern */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='28' font-size='20'%3E🏆%3C/text%3E%3C/svg%3E\")", backgroundRepeat: 'repeat' }} />

                {/* Dark gradient overlay bottom */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(18,14,0,0.9) 100%)' }} />

                {/* Season badge top-left */}
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  background: 'rgba(30,20,0,0.85)', backdropFilter: 'blur(8px)',
                  color: '#fbbf24', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '4px 10px', borderRadius: '6px',
                  border: '1px solid rgba(251,191,36,0.25)',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}>
                  🏆 {entry.seasonText}
                </div>

                {/* Category ribbon top-right */}
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: 'linear-gradient(135deg, #b45309, #92400e)',
                    color: '#fef3c7', fontSize: '10px', fontWeight: 700,
                    letterSpacing: '0.08em', padding: '3px 10px',
                    borderRadius: '999px', textTransform: 'uppercase',
                    boxShadow: '0 2px 10px rgba(180,83,9,0.5)',
                  }}>
                    <Award size={10} /> {entry.category}
                  </span>
                </div>

                {/* Player avatar + ribbon at bottom */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 16px 0', display: 'flex', alignItems: 'flex-end', gap: '14px' }}>
                  {/* Avatar with gold ring */}
                  <div style={{ position: 'relative', flexShrink: 0, marginBottom: '-20px' }}>
                    <div style={{ padding: '3px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', boxShadow: '0 4px 20px rgba(251,191,36,0.4)' }}>
                      <Avatar name={player?.name ?? 'Legend'} size={56} src={player?.profileImageUrl} />
                    </div>
                    <div style={{
                      position: 'absolute', bottom: '-4px', right: '-4px',
                      width: '22px', height: '22px',
                      background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                      borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(251,191,36,0.5)',
                    }}>
                      <Award size={12} style={{ color: '#78350f' }} />
                    </div>
                  </div>

                  {/* Name + jersey on ribbon */}
                  <div style={{ flex: 1, marginBottom: '-2px' }}>
                    <div style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #b45309 60%, #92400e)',
                      padding: '7px 24px 7px 12px',
                      clipPath: 'polygon(0 0, 100% 0, 93% 100%, 0 100%)',
                      minWidth: '160px',
                    }}>
                      <span style={{
                        fontFamily: "'Oswald', sans-serif", fontWeight: 800,
                        fontSize: '18px', color: '#fef3c7', textTransform: 'uppercase',
                        letterSpacing: '0.04em', lineHeight: 1, display: 'block',
                      }}>
                        {player?.name ?? 'Unknown Legend'}
                      </span>
                    </div>
                    <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.08)', padding: '3px 12px', backdropFilter: 'blur(4px)' }}>
                      <span style={{
                        fontFamily: "'Oswald', sans-serif", fontWeight: 700,
                        fontSize: '12px', color: '#d4a800', textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>
                        👕 {player?.jerseyNumber ?? '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description strip */}
              <div style={{ background: '#1a1200', padding: '28px 16px 16px' }}>
                <p style={{
                  fontFamily: "'Oswald', sans-serif", fontWeight: 700,
                  fontSize: '13px', color: '#fbbf24', textTransform: 'uppercase',
                  letterSpacing: '0.06em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <span style={{ display: 'inline-block', width: '3px', height: '14px', background: 'linear-gradient(to bottom, #fbbf24, #d97706)', borderRadius: '2px', flexShrink: 0 }} />
                  {entry.subTitle}
                </p>
                <p style={{
                  fontSize: '12.5px', color: '#d4a800', lineHeight: 1.65,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  margin: 0, opacity: 0.8,
                }}>
                  {entry.descriptions}
                </p>
              </div>
            </div>
          );
        })}

        {hallOfFame.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-amber-500/20 rounded-2xl flex flex-col items-center justify-center" style={{ background: 'rgba(18,14,0,0.5)' }}>
            <Award className="w-12 h-12 text-amber-400/40 mb-3 animate-float" />
            <p className="text-amber-500/50 text-[14px] font-medium">No one inducted yet — greatness awaits! 🏆</p>
          </div>
        )}
      </div>
    </div>
  );
}
