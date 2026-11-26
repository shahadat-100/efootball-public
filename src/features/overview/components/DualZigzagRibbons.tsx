import React, { useMemo } from 'react';
import { Player } from '@/features/players/types';

interface DualZigzagRibbonsProps {
  overallTop10?: { player: Player; points: number; rank: number }[];
  monthlyTop10?: { player: Player; points: number; rank: number }[];
}

export const DualZigzagRibbons: React.FC<DualZigzagRibbonsProps> = ({
  overallTop10 = [],
  monthlyTop10 = [],
}) => {
  // Tape 1 (Red tape): Club identity, athletic motto & pride
  const tape1Items = useMemo(
    () => [
      'THE ENIGMATIC ELITE',
      'IN MYSTERY WE REIGN',
      'DOMINATE THE PITCH',
      'FORGED IN GLORY',
      'UNSTOPPABLE FORCE',
      'CHAMPIONS MENTALITY',
      'LEGENDS IN THE MAKING',
    ],
    []
  );

  // Tape 2 (Black tape): Live database rankings & player points
  const tape2Items = useMemo(() => {
    const list: string[] = [];

    if (overallTop10 && overallTop10.length > 0) {
      overallTop10.slice(0, 5).forEach((entry) => {
        const medal = entry.rank === 1 ? '👑' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : '⚽';
        list.push(`${medal} RANK #${entry.rank}: ${entry.player.name.toUpperCase()} (${entry.points} PTS)`);
      });
    }

    if (monthlyTop10 && monthlyTop10.length > 0) {
      monthlyTop10.slice(0, 3).forEach((entry) => {
        list.push(`🔥 POTM #${entry.rank}: ${entry.player.name.toUpperCase()} (${entry.points} PTS)`);
      });
    }

    if (list.length === 0) {
      list.push(
        'RANK #1: THE ENIGMATIC ELITE',
        'LEADERBOARD LOADING',
        'IN MYSTERY WE REIGN',
        'DOMINATE THE PITCH'
      );
    }

    return list;
  }, [overallTop10, monthlyTop10]);

  return (
    <div
      className="marquee-zigzag-stage select-none"
      aria-label="Club ticker tape"
    >
      {/* Tape 1: Crimson Red Tape with White Border Lines (Angled -1.9deg, scrolls left) */}
      <div className="marquee-zigzag-tape marquee-zigzag-tape--red py-1.5 sm:py-2.5 font-black uppercase text-sm sm:text-lg md:text-xl tracking-wider">
        <div className="animate-zigzag-left">
          {/* Run 1 */}
          <span className="marquee-zigzag-run">
            {tape1Items.map((item, idx) => (
              <span key={`t1-a-${idx}`} className="marquee-zigzag-item">
                <span>{item}</span>
                <img
                  src="/images/club-logo.jpg"
                  alt=""
                  aria-hidden
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full object-cover border-[1.5px] border-white/95 shadow-[0_2px_6px_rgba(0,0,0,0.5)] ml-3 sm:ml-4 inline-block shrink-0 select-none pointer-events-none"
                />
              </span>
            ))}
          </span>
          {/* Run 2 (Duplicate for seamless loop) */}
          <span className="marquee-zigzag-run" aria-hidden="true">
            {tape1Items.map((item, idx) => (
              <span key={`t1-b-${idx}`} className="marquee-zigzag-item">
                <span>{item}</span>
                <img
                  src="/images/club-logo.jpg"
                  alt=""
                  aria-hidden
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full object-cover border-[1.5px] border-white/95 shadow-[0_2px_6px_rgba(0,0,0,0.5)] ml-3 sm:ml-4 inline-block shrink-0 select-none pointer-events-none"
                />
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* Tape 2: Jet Black Tape with Crimson Red Border Lines (Angled +1.6deg, scrolls right) */}
      <div className="marquee-zigzag-tape marquee-zigzag-tape--black py-1.5 sm:py-2.5 font-black uppercase text-sm sm:text-lg md:text-xl tracking-wider">
        <div className="animate-zigzag-right">
          {/* Run 1 */}
          <span className="marquee-zigzag-run">
            {tape2Items.map((item, idx) => (
              <span key={`t2-a-${idx}`} className="marquee-zigzag-item">
                <span>{item}</span>
                <img
                  src="/images/club-logo.jpg"
                  alt=""
                  aria-hidden
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full object-cover border-[1.5px] border-amber-400/90 shadow-[0_2px_8px_rgba(0,0,0,0.9)] ml-3 sm:ml-4 inline-block shrink-0 select-none pointer-events-none"
                />
              </span>
            ))}
          </span>
          {/* Run 2 (Duplicate for seamless loop) */}
          <span className="marquee-zigzag-run" aria-hidden="true">
            {tape2Items.map((item, idx) => (
              <span key={`t2-b-${idx}`} className="marquee-zigzag-item">
                <span>{item}</span>
                <img
                  src="/images/club-logo.jpg"
                  alt=""
                  aria-hidden
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full object-cover border-[1.5px] border-amber-400/90 shadow-[0_2px_8px_rgba(0,0,0,0.9)] ml-3 sm:ml-4 inline-block shrink-0 select-none pointer-events-none"
                />
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
};
