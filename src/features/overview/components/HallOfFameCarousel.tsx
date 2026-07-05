import { useEffect, useState } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Avatar } from '@/shared/components';
import { Award, Crown } from 'lucide-react';

export function HallOfFameCarousel() {
  const { hallOfFame, players } = useFootballStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto scroll
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
    <div className="bg-gradient-to-br from-[#1f1700] to-[#120a00] border border-amber-500/20 rounded-2xl p-6 h-full flex flex-col justify-between shadow-lg relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Club Legends</h3>
        </div>
        <div className="flex gap-1">
          {hallOfFame.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-amber-900/50'}`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div className="relative">
          <div className="p-1 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <div className="bg-[#1c1400] rounded-full overflow-hidden">
              <Avatar name={player?.name || 'Legend'} src={player?.profileImageUrl} size={64} />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-600 to-amber-500 rounded-full p-1 border-2 border-[#1c1400]">
            <Award className="w-4 h-4 text-[#1c1400]" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-black text-amber-50 truncate">{player?.name}</h4>
          <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider truncate mb-1">
            {currentLegend.category}
          </p>
          <p className="text-xs text-amber-200/70 line-clamp-2 leading-snug">
            {currentLegend.subTitle}
          </p>
        </div>
      </div>
    </div>
  );
}
