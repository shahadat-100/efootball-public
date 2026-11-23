import React from 'react';
import { Player } from '@/features/players/types';
import { useNavigate } from 'react-router-dom';

interface TiltedPlayerMarqueeProps {
  monthlyTop10: { player: Player; points: number; rank: number }[];
  overallTop10: { player: Player; points: number; rank: number }[];
}

const FALLBACK_PLAYER_IMAGE = '/images/player-fallback.png';

export const TiltedPlayerMarquee: React.FC<TiltedPlayerMarqueeProps> = ({
  monthlyTop10,
  overallTop10,
}) => {
  const navigate = useNavigate();

  // Triple duplicate for seamless infinite loop
  const row1Stream = [...monthlyTop10, ...monthlyTop10, ...monthlyTop10];
  const row2Stream = [...overallTop10, ...overallTop10, ...overallTop10];

  const renderCard = (
    entry: { player: Player; points: number; rank: number },
    idx: number,
    rowNum: number,
  ) => {
    const p = entry.player;
    const imageSrc = p.coverImageUrl || p.profileImageUrl || FALLBACK_PLAYER_IMAGE;
    const isMonthly = rowNum === 1;
    const isFirst = entry.rank === 1;

    return (
      <div
        key={`${p.id}-${idx}-${rowNum}`}
        onClick={() => navigate(`/players`)}
        className="w-[220px] sm:w-[260px] shrink-0 cursor-pointer select-none group"
      >
        {/* Card Artwork / Photo — Exact 1080x1350 (4:5) Aspect Ratio */}
        <div
          className={`w-full aspect-[4/5] overflow-hidden relative shadow-[0_14px_35px_rgba(0,0,0,0.6)] transition-all duration-300 border ${
            isMonthly
              ? 'border-red-600/30 group-hover:border-red-500/70 group-hover:shadow-[0_16px_40px_rgba(239,68,68,0.25)]'
              : 'border-amber-500/40 group-hover:border-amber-400 group-hover:shadow-[0_16px_40px_rgba(245,158,11,0.35)]'
          }`}
        >
          {/* Card Template Background: Row 1 = POTM (White/Red), Row 2 = MVP (Golden Flame) */}
          <img
            src={isMonthly ? '/assets/potm-bg.jpg?v=2' : '/assets/overall-bg.jpg'}
            alt={isMonthly ? 'Player of the Month Background' : 'All-Time MVP Background'}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          />

          {/* Player Cutout / Photo — Crystal clear, no heavy blur shadows */}
          {imageSrc ? (
            <div className="absolute inset-x-0 bottom-0 h-[83%] z-10 pointer-events-none overflow-hidden flex items-end justify-center">
              <img
                src={imageSrc}
                alt={p.name}
                className="w-[110%] max-w-none h-full object-contain object-bottom group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                decoding="async"
                width={260}
                height={325}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black/40 z-10">
              <span className="font-sans text-4xl font-light text-white/40">
                {p.name?.charAt(0) || '?'}
              </span>
            </div>
          )}

          {/* Minimal Dark Gradient ONLY at bottom edge for text readability — keeps image 100% sharp & vivid */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 pointer-events-none" />

          {/* All Player Details, Rank & Points Grouped Together on One Side (Plain Text, No Capsules) */}
          <div className="absolute bottom-0 inset-x-0 p-3 z-30 flex flex-col items-start gap-0.5">
            {/* Rank & Points in Plain Text */}
            <div className="flex items-center gap-1.5 text-[11px] font-sans font-semibold uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <span
                className={
                  isFirst
                    ? isMonthly
                      ? 'text-[#ffb700] font-bold'
                      : 'text-amber-300 font-bold'
                    : 'text-white'
                }
              >
                {isFirst ? (isMonthly ? '🏆 #1 POTM' : '👑 #1 MVP') : `RANK #${entry.rank}`}
              </span>
              <span className="text-white/50 font-normal">·</span>
              <span className={isMonthly ? 'text-red-300 font-medium' : 'text-amber-300 font-medium'}>
                {entry.points > 0 ? `+${entry.points}` : entry.points} PTS
              </span>
            </div>

            {/* Player Name */}
            <h4 className="font-sans text-sm sm:text-base font-bold text-white uppercase tracking-tight truncate leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,1)] max-w-full">
              {p.name}
            </h4>
          </div>
        </div>
      </div>
    );
  };

  if (monthlyTop10.length === 0 && overallTop10.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden py-10 sm:py-14 roster-marquee-fade">
      {/* Sleek angled dynamic showcase (slight tilt) */}
      <div className="transform -rotate-[2deg] sm:-rotate-[2.5deg] scale-[1.04] origin-center flex flex-col gap-8 sm:gap-10">
        {/* Row 1: Top 10 Monthly — Scroll Left */}
        {monthlyTop10.length > 0 && (
          <div>
            <div className="px-6 sm:px-12 pb-2.5">
              <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-white/50 font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                Monthly Top 10 · Points Ranking
              </span>
            </div>
            <div className="flex overflow-hidden">
              <div className="marquee-track-left flex gap-4 sm:gap-6">
                {row1Stream.map((entry, i) => renderCard(entry, i, 1))}
              </div>
            </div>
          </div>
        )}

        {/* Row 2: Top 10 Overall — Scroll Right */}
        {overallTop10.length > 0 && (
          <div>
            <div className="px-6 sm:px-12 pb-2.5">
              <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-white/50 font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                Overall Top 10 · All-Time Ranking
              </span>
            </div>
            <div className="flex overflow-hidden">
              <div className="marquee-track-right flex gap-4 sm:gap-6">
                {row2Stream.map((entry, i) => renderCard(entry, i, 2))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
