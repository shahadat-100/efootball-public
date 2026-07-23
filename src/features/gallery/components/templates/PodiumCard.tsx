import React from 'react';
import { RankedPlayer } from '../../utils/galleryStats';
import { CardFrame } from '../shared/CardFrame';
import { Avatar } from '@/shared/components';
import { Trophy } from 'lucide-react';

interface PodiumCardProps {
  topPlayers: RankedPlayer[];
  title: string;
  subtitle: string;
  aspect?: '4:5' | '1:1' | '16:9' | '9:16';
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function PodiumCard({ topPlayers, title, subtitle, aspect = '4:5', cardRef }: PodiumCardProps) {
  const first = topPlayers[0];
  const second = topPlayers[1];
  const third = topPlayers[2];

  return (
    <CardFrame aspect={aspect} bgImage="/images/gallery-bg/bg-golden-boot.jpg" cardRef={cardRef}>
      {/* Header Overlay */}
      <div className="text-center pt-2 pb-4 bg-black/60 backdrop-blur-md border-b border-amber-500/30 -mx-6 -mt-6 p-4">
        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-0.5">{subtitle}</span>
        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" /> {title}
        </h3>
      </div>

      {/* Podium Grid Layout */}
      <div className="my-auto flex items-end justify-center gap-3 pt-6 pb-2">
        {/* 2nd Place (Silver) */}
        {second ? (
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="rounded-full p-1 bg-gradient-to-tr from-slate-400 to-slate-200 shadow-xl">
                <div className="rounded-full overflow-hidden bg-slate-950 p-0.5" style={{ width: 70, height: 70 }}>
                  <Avatar name={second.player.name} src={second.player.profileImageUrl} size={70} />
                </div>
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full border border-white shadow">
                2ND
              </span>
            </div>
            <p className="font-extrabold text-xs text-white truncate max-w-[90px] text-center">{second.player.name}</p>
            <p className="text-[10px] font-black text-amber-300">{second.points} PTS</p>
            <div className="w-20 h-24 bg-gradient-to-b from-slate-700/80 to-slate-900/90 border border-slate-500/40 rounded-t-2xl mt-2 flex items-center justify-center">
              <span className="text-2xl font-black text-slate-300">2</span>
            </div>
          </div>
        ) : null}

        {/* 1st Place (Gold) */}
        {first ? (
          <div className="flex flex-col items-center -mt-6">
            <div className="relative mb-2">
              <div className="rounded-full p-1.5 bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-200 shadow-2xl">
                <div className="rounded-full overflow-hidden bg-slate-950 p-0.5" style={{ width: 90, height: 90 }}>
                  <Avatar name={first.player.name} src={first.player.profileImageUrl} size={90} />
                </div>
              </div>
              <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-[11px] px-3 py-0.5 rounded-full border border-white shadow-lg">
                👑 1ST
              </span>
            </div>
            <p className="font-black text-sm text-amber-300 truncate max-w-[110px] text-center">{first.player.name}</p>
            <p className="text-xs font-black text-white">{first.points} PTS</p>
            <div className="w-24 h-32 bg-gradient-to-b from-amber-600/90 via-amber-700/80 to-slate-950 border border-amber-400/50 rounded-t-2xl mt-2 flex items-center justify-center">
              <span className="text-4xl font-black text-amber-300">1</span>
            </div>
          </div>
        ) : null}

        {/* 3rd Place (Bronze) */}
        {third ? (
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="rounded-full p-1 bg-gradient-to-tr from-amber-700 to-amber-900 shadow-xl">
                <div className="rounded-full overflow-hidden bg-slate-950 p-0.5" style={{ width: 70, height: 70 }}>
                  <Avatar name={third.player.name} src={third.player.profileImageUrl} size={70} />
                </div>
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-700 text-white font-black text-[10px] px-2 py-0.5 rounded-full border border-white shadow">
                3RD
              </span>
            </div>
            <p className="font-extrabold text-xs text-white truncate max-w-[90px] text-center">{third.player.name}</p>
            <p className="text-[10px] font-black text-amber-300">{third.points} PTS</p>
            <div className="w-20 h-16 bg-gradient-to-b from-amber-900/80 to-slate-950 border border-amber-700/40 rounded-t-2xl mt-2 flex items-center justify-center">
              <span className="text-xl font-black text-amber-600">3</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer info banner */}
      <div className="bg-black/70 backdrop-blur-md border border-amber-500/20 rounded-xl p-3 -mx-2 -mb-2 flex justify-between items-center text-[10px] font-bold text-slate-300">
        <span>ENIGMATIC ELITES RANKING</span>
        <span className="text-amber-400">OFFICIAL LEADERBOARD</span>
      </div>
    </CardFrame>
  );
}
