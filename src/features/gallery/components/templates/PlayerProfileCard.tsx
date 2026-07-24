import React from 'react';
import { Player, PlayerSeasonStat } from '@/features/players/types';
import { Avatar } from '@/shared/components';
import { CardFrame } from '../shared/CardFrame';

interface PlayerProfileCardProps {
  player: Player;
  seasonStats?: PlayerSeasonStat[];
  title?: string;
  subtitle?: string;
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function PlayerProfileCard({ player, seasonStats = [], title = 'PLAYER PROFILE', subtitle = 'Official Card', cardRef }: PlayerProfileCardProps) {
  // Aggregate stats across seasons
  const totalApps = seasonStats.reduce((acc, s) => acc + (s.appearances || 0), 0);
  const totalGoals = seasonStats.reduce((acc, s) => acc + (s.goals || 0), 0);
  const totalMotm = seasonStats.reduce((acc, s) => acc + (s.motmCount || 0), 0);
  
  const totalWins = seasonStats.reduce((acc, s) => acc + (s.wins || 0), 0);
  const totalDraws = seasonStats.reduce((acc, s) => acc + (s.draws || 0), 0);
  const totalLosses = seasonStats.reduce((acc, s) => acc + (s.losses || 0), 0);

  // Name splitting
  const nameParts = player.name.trim().split(' ');
  const lastName = nameParts.pop() || '';
  const firstName = nameParts.join(' ');

  return (
    <CardFrame aspect="4:5" cardRef={cardRef} className="bg-white text-gray-900 rounded-[20px] border border-gray-200 shadow-2xl relative overflow-hidden font-sans">
      
      {/* Giant Ghost Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] text-[130px] font-black text-[#CC1A1A] opacity-[0.07] tracking-tighter leading-none whitespace-nowrap pointer-events-none select-none z-0" style={{ fontFamily: "'Arial Black', sans-serif" }}>
        TEE
      </div>

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-[26px] h-[26px] bg-[#CC1A1A] rounded-md flex items-center justify-center text-[10px] font-black text-white" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            TEE
          </div>
          <div className="leading-tight">
            <div className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.12em]">{subtitle}</div>
            <div className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">{title}</div>
          </div>
        </div>

        {player.jerseyNumber && (
          <div className="w-9 h-9 bg-[#CC1A1A] text-white text-[18px] font-black rounded-[10px] flex items-center justify-center leading-none" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            {player.jerseyNumber}
          </div>
        )}
      </div>

      {/* Center Avatar Area */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[54%] z-10 flex flex-col items-center">
        <div className="w-[110px] h-[110px] rounded-full bg-[#CC1A1A] p-[3px] shadow-2xl">
          <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
            <Avatar name={player.name} src={player.profileImageUrl} size={110} />
          </div>
        </div>
      </div>

      {/* Left Stats Badges */}
      <div className="absolute left-3 bottom-[70px] flex flex-col gap-1.5 z-10">
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-none overflow-hidden w-[90px] shadow-sm">
          <div className="text-[14px] font-black text-white bg-[#CC1A1A] min-w-[32px] text-center py-1 leading-none" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            {totalApps}
          </div>
          <div className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.08em] px-1.5">
            Matches
          </div>
        </div>

        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-none overflow-hidden w-[90px] shadow-sm">
          <div className="text-[14px] font-black text-white bg-[#CC1A1A] min-w-[32px] text-center py-1 leading-none" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            {totalGoals}
          </div>
          <div className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.08em] px-1.5">
            Goals
          </div>
        </div>

        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-none overflow-hidden w-[90px] shadow-sm">
          <div className="text-[14px] font-black text-white bg-[#CC1A1A] min-w-[32px] text-center py-1 leading-none" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            {totalMotm}
          </div>
          <div className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.08em] px-1.5">
            MOTM
          </div>
        </div>
      </div>

      {/* Diagonal Accent Line */}
      <div className="absolute right-0 bottom-[60px] w-1 h-20 bg-[#CC1A1A] rounded-l-sm z-[5] opacity-60"></div>

      {/* Bottom Name Area */}
      <div className="absolute bottom-0 left-0 right-0 p-3 pt-5 bg-gradient-to-t from-white via-white/90 to-transparent border-t border-gray-100 z-10">
        <div className="text-[20px] font-black text-gray-900 uppercase tracking-tighter leading-[1.1]" style={{ fontFamily: "'Arial Black', sans-serif" }}>
          {firstName && <span>{firstName} </span>}
          <span className="text-[#CC1A1A]">{lastName}</span>
        </div>
        <div className="text-[9px] text-gray-500 uppercase tracking-[0.1em] mt-0.5 font-bold">
          {totalWins}W · {totalDraws}D · {totalLosses}L
        </div>
      </div>

    </CardFrame>
  );
}
