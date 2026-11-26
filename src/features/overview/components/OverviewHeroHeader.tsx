import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Player, PlayerSeasonStat } from '@/features/players/types';
import { PlayerMonthlyStat, PlayerWeeklyStat } from '@/store/footballStore';
import { HeaderCardStack } from './HeaderCardStack';

interface OverviewHeroHeaderProps {
  setTab: (tab: string) => void;
  players?: Player[];
  playerSeasonStats?: PlayerSeasonStat[];
  playerWeeklyStats?: PlayerWeeklyStat[];
  playerMonthlyStats?: PlayerMonthlyStat[];
}

export const OverviewHeroHeader: React.FC<OverviewHeroHeaderProps> = ({
  setTab,
  players = [],
  playerSeasonStats = [],
  playerWeeklyStats = [],
  playerMonthlyStats = [],
}) => {
  const [animKey, setAnimKey] = useState(0);

  const triggerKickoff = () => {
    setAnimKey((prev) => prev + 1);
  };

  return (
    <div
      className="relative overflow-hidden -mt-4 sm:-mt-6 lg:-mt-10 bg-[#070709] border-b border-white/10"
      style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
      }}
    >
      {/* ═══ Background Artwork (STRETCHES ACROSS ENTIRE HEIGHT INCLUDING RIBBONS!) ═══ */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img
          src="/images/headerBack.svg"
          alt=""
          aria-hidden
          className="w-full h-full object-cover object-center opacity-85"
        />
        {/* Subtle gradient veil for clean contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/85" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_35%,_rgba(188,1,0,0.22),_transparent_65%)]" />
        {/* Subtle atmospheric ambient glow */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      {/* ═══ Hero Main Content (Left: Title & Command | Right: 3D Interactive Card Stack) ═══ */}
      <div className="relative z-10 w-full px-4 sm:px-8 lg:px-14 xl:px-20 pt-10 sm:pt-14 pb-10 sm:pb-14 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* ══ Left 7/12: Monumental Athletic Title, Motto & Button (Original Left-Aligned) ══ */}
          <div className="lg:col-span-7 flex flex-col items-start text-left max-w-full">
            {/* Athletic Stadium Title (Zero Overflow) */}
            <h1
              key={animKey}
              onClick={triggerKickoff}
              onMouseEnter={triggerKickoff}
              className="football-stadium-title text-5xl sm:text-7xl md:text-8xl xl:text-[8.5rem] tracking-wide mb-2 cursor-pointer select-none transition-transform active:scale-[0.99] max-w-full break-normal"
              title="Click or hover to trigger kickoff surge"
            >
              <span className="block stadium-floodlight-text kickoff-strike-1">
                THE ENIGMATIC
              </span>
              <span className="block stadium-accent-text kickoff-strike-2 -mt-2 sm:-mt-4 lg:-mt-5">
                ELITE.
              </span>
            </h1>

            {/* Subtitle / Motto */}
            <p className="font-mono text-base sm:text-2xl text-white/85 italic tracking-wide mb-8 flex items-center gap-2">
              <span className="text-[#bc0100] font-bold not-italic">"</span>
              In Mystery We Reign
              <span className="text-[#bc0100] font-bold not-italic">"</span>
            </p>

            {/* Action Button: Leaderboard */}
            <div>
              <button
                type="button"
                onClick={() => setTab('leaderboard')}
                className="group relative inline-flex items-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 bg-white text-black font-black uppercase tracking-wider text-xs sm:text-sm rounded-xl overflow-hidden hover:bg-[#bc0100] hover:text-white transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.6)] active:scale-95"
              >
                <span>LEADERBOARD</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* ══ Right 5/12: 3D Interactive Card Stack (Tinder Style / Pull-Out Deck) ══ */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <HeaderCardStack
              players={players}
              playerSeasonStats={playerSeasonStats}
              playerWeeklyStats={playerWeeklyStats}
              playerMonthlyStats={playerMonthlyStats}
              onPlayerClick={() => setTab('players')}
            />
          </div>

        </div>
      </div>
    </div>
  );
};
