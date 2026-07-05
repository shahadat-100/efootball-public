import { useEffect, useState } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Avatar } from '@/shared/components';
import { Award, ChevronLeft, ChevronRight } from 'lucide-react';

export function HallOfFameCarousel() {
  const { hallOfFame, players } = useFootballStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (hallOfFame.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % hallOfFame.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [hallOfFame.length]);

  if (hallOfFame.length === 0) return null;

  const currentLegend = hallOfFame[currentIndex];
  const player = players.find(p => p.id === currentLegend.playerId);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 h-full flex flex-col gap-5 shadow-sm relative overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
            <Award className="w-4 h-4 text-foreground" />
          </div>
          <span className="text-sm font-bold text-foreground uppercase tracking-widest">Club Legends</span>
        </div>

        {/* Dot indicators */}
        {hallOfFame.length > 1 && (
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentIndex(i => (i - 1 + hallOfFame.length) % hallOfFame.length)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1">
              {hallOfFame.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentIndex(idx)}
                  className="rounded-full transition-all duration-300"
                  style={{ width: idx === currentIndex ? '16px' : '5px', height: '5px', background: idx === currentIndex ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground) / 0.3)' }}
                />
              ))}
            </div>
            <button onClick={() => setCurrentIndex(i => (i + 1) % hallOfFame.length)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Player info */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-shrink-0">
          <div className="ring-2 ring-border rounded-full overflow-hidden">
            <Avatar name={player?.name ?? 'Legend'} src={player?.profileImageUrl} size={64} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-muted border border-border rounded-full flex items-center justify-center">
            <Award className="w-3.5 h-3.5 text-foreground" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-base font-black text-foreground truncate">{player?.name ?? 'Unknown'}</h4>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[10px] font-bold text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full uppercase tracking-wider">
              {currentLegend.category}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {currentLegend.seasonText}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {currentLegend.subTitle}
          </p>
        </div>
      </div>
    </div>
  );
}
