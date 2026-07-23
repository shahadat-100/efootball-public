import React from 'react';
import { Player } from '@/features/players/types';
import { CardFrame } from '../shared/CardFrame';
import { Avatar } from '@/shared/components';
import { Award } from 'lucide-react';

interface MilestoneCardProps {
  player: Player;
  milestoneTitle: string;
  milestoneValue: string;
  aspect?: '4:5' | '1:1' | '16:9' | '9:16';
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function MilestoneCard({ player, milestoneTitle, milestoneValue, aspect = '4:5', cardRef }: MilestoneCardProps) {
  return (
    <CardFrame aspect={aspect} bgImage="/images/gallery-bg/bg-top-scorer-week.png" cardRef={cardRef}>
      {/* Top Header */}
      <div className="text-center pt-2 pb-4 bg-slate-950/80 border-b border-slate-700 -mx-6 -mt-6 p-4 backdrop-blur-md">
        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-0.5">CLUB MILESTONE</span>
        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-2">
          <Award className="w-5 h-5 text-cyan-400" /> HISTORIC ACHIEVEMENT
        </h3>
      </div>

      {/* Main Milestone Body */}
      <div className="my-auto flex flex-col items-center text-center py-6">
        <div className="relative mb-4">
          <div className="rounded-full p-2 bg-gradient-to-tr from-cyan-500 via-blue-400 to-indigo-500 shadow-2xl">
            <div className="rounded-full overflow-hidden bg-slate-950 p-1" style={{ width: 120, height: 120 }}>
              <Avatar name={player.name} src={player.profileImageUrl} size={120} />
            </div>
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-cyan-400 text-slate-950 font-black text-[11px] uppercase tracking-widest px-4 py-1 rounded-full border border-white shadow-xl whitespace-nowrap">
            ★ MILESTONE UNLOCKED
          </div>
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight leading-tight uppercase mt-3">
          {player.name}
        </h2>
        {player.jerseyNumber && (
          <p className="text-xs font-bold text-cyan-300 mt-0.5">#{player.jerseyNumber}</p>
        )}

        {/* Milestone Badge Box */}
        <div className="mt-5 bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-4 w-full max-w-xs shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{milestoneTitle}</p>
          <p className="text-4xl font-black text-cyan-300 my-1">{milestoneValue}</p>
          <p className="text-[11px] font-bold text-slate-300">FEAT ACHIEVED IN CLUB MATCHES</p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-950/80 border-t border-slate-700 -mx-6 -mb-6 p-4 text-center text-[10px] font-black text-slate-400 tracking-wider">
        THE ENIGMATIC ELITES · MILESTONE RECOGNITION
      </div>
    </CardFrame>
  );
}
