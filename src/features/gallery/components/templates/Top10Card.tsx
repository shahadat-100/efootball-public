import React from 'react';
import { RankedPlayer } from '../../utils/galleryStats';
import { CardFrame } from '../shared/CardFrame';
import { Avatar } from '@/shared/components';
import { Trophy } from 'lucide-react';

interface Top10CardProps {
  topPlayers: RankedPlayer[];
  title: string;
  subtitle: string;
  aspect?: '4:5' | '1:1' | '16:9' | '9:16';
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function Top10Card({ topPlayers, title, subtitle, aspect = '16:9', cardRef }: Top10CardProps) {
  return (
    <CardFrame aspect={aspect} bgImage="/images/gallery-bg/bg-enigmatic-elite.png" cardRef={cardRef}>
      {/* Header Overlay */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 -mx-6 -mt-6 p-5 bg-slate-950/80 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">{subtitle}</span>
          <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> {title}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">THE ENIGMATIC ELITE</span>
          <span className="text-xs font-black text-cyan-300">TOP 10 LEADERBOARD</span>
        </div>
      </div>

      {/* Grid of 10 Players */}
      <div className="my-auto grid grid-cols-5 gap-3 py-4">
        {topPlayers.slice(0, 10).map((r, idx) => (
          <div key={r.player.id || idx} className="bg-slate-900/80 border border-cyan-500/20 rounded-2xl p-2.5 flex flex-col items-center text-center relative backdrop-blur-sm">
            {/* Rank Pill */}
            <span className={`absolute top-2 left-2 text-[9px] font-black px-1.5 py-0.2 rounded-md ${
              idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
              #{idx + 1}
            </span>

            <div className="rounded-full p-0.5 bg-gradient-to-tr from-cyan-500 to-pink-500 my-1">
              <Avatar name={r.player.name} src={r.player.profileImageUrl} size={48} />
            </div>

            <p className="font-extrabold text-[11px] text-white truncate w-full mt-1">{r.player.name}</p>
            <p className="text-[10px] font-black text-cyan-300 mt-0.5">{r.points} PTS</p>
          </div>
        ))}

        {topPlayers.length === 0 && (
          <div className="col-span-5 text-center text-slate-400 py-10 text-xs">
            No stats recorded for this period yet.
          </div>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-cyan-500/20 pt-2 -mx-6 -mb-6 p-4 bg-slate-950/80 flex justify-between text-[10px] font-extrabold text-slate-400">
        <span>OFFICIAL CLUB GALLERY</span>
        <span>THE ENIGMATIC ELITES</span>
      </div>
    </CardFrame>
  );
}
