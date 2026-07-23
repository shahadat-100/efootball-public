import React from 'react';
import { SeasonLeaders } from '../../utils/galleryStats';
import { CardFrame } from '../shared/CardFrame';
import { Avatar } from '@/shared/components';
import { Trophy, Target, Award, Crown } from 'lucide-react';

interface SeasonLeadersCardProps {
  leaders: SeasonLeaders;
  aspect?: '4:5' | '1:1' | '16:9' | '9:16';
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function SeasonLeadersCard({ leaders, aspect = '4:5', cardRef }: SeasonLeadersCardProps) {
  return (
    <CardFrame aspect={aspect} cardRef={cardRef}>
      {/* Header Overlay */}
      <div className="text-center pt-2 pb-4 bg-black/70 backdrop-blur-md border-b border-amber-500/30 -mx-6 -mt-6 p-4">
        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-0.5">SEASON RECAP</span>
        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" /> CLUB SEASON LEADERS
        </h3>
      </div>

      {/* 3 Panels Body */}
      <div className="my-auto flex flex-col gap-3 py-4">
        {/* Top Scorer */}
        {leaders.topScorer && (
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-3 flex items-center gap-4 backdrop-blur-sm">
            <div className="relative">
              <Avatar name={leaders.topScorer.player.name} src={leaders.topScorer.player.profileImageUrl} size={50} />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1 text-slate-950">
                <Target className="w-3 h-3" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider block">TOP SCORER</span>
              <p className="font-extrabold text-sm text-white truncate">{leaders.topScorer.player.name}</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-amber-300">{leaders.topScorer.goals}</span>
              <span className="text-[9px] font-bold text-slate-400 block uppercase">GOALS</span>
            </div>
          </div>
        )}

        {/* Top MOTM */}
        {leaders.topMotm && (
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-3 flex items-center gap-4 backdrop-blur-sm">
            <div className="relative">
              <Avatar name={leaders.topMotm.player.name} src={leaders.topMotm.player.profileImageUrl} size={50} />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1 text-slate-950">
                <Award className="w-3 h-3" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider block">MOST MOTM AWARDS</span>
              <p className="font-extrabold text-sm text-white truncate">{leaders.topMotm.player.name}</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-amber-300">{leaders.topMotm.motm}</span>
              <span className="text-[9px] font-bold text-slate-400 block uppercase">AWARDS</span>
            </div>
          </div>
        )}

        {/* Highest Points */}
        {leaders.topWinner && (
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-3 flex items-center gap-4 backdrop-blur-sm">
            <div className="relative">
              <Avatar name={leaders.topWinner.player.name} src={leaders.topWinner.player.profileImageUrl} size={50} />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1 text-slate-950">
                <Crown className="w-3 h-3" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider block">MOST WINS</span>
              <p className="font-extrabold text-sm text-white truncate">{leaders.topWinner.player.name}</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-amber-300">{leaders.topWinner.points}</span>
              <span className="text-[9px] font-bold text-slate-400 block uppercase">PTS</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-black/70 backdrop-blur-md border-t border-amber-500/20 -mx-6 -mb-6 p-4 text-center text-[10px] font-black text-amber-300 tracking-wider">
        THE ENIGMATIC ELITES · SEASON HONORS
      </div>
    </CardFrame>
  );
}
