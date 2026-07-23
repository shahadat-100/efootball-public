import React from 'react';
import { Player } from '@/features/players/types';
import { CardFrame } from '../shared/CardFrame';
import { Avatar } from '@/shared/components';
import { Cake, Sparkles, Trophy } from 'lucide-react';

interface BirthdayCardProps {
  player: Player;
  aspect?: '4:5' | '1:1' | '16:9' | '9:16';
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function BirthdayCard({ player, aspect = '4:5', cardRef }: BirthdayCardProps) {
  return (
    <CardFrame aspect={aspect} bgImage="/images/gallery-bg/bg-player-of-month.png" cardRef={cardRef}>
      {/* Top Header */}
      <div className="text-center pt-2 pb-4 bg-amber-950/70 border-b border-amber-500/30 -mx-6 -mt-6 p-4 backdrop-blur-md">
        <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block mb-0.5">CLUB CELEBRATIONS</span>
        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-2">
          <Cake className="w-5 h-5 text-amber-400" /> HAPPY BIRTHDAY!
        </h3>
      </div>

      {/* Main Birthday Spotlight */}
      <div className="my-auto flex flex-col items-center text-center py-6">
        <div className="relative mb-4">
          <div className="rounded-full p-2 bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-200 shadow-2xl">
            <div className="rounded-full overflow-hidden bg-slate-950 p-1" style={{ width: 130, height: 130 }}>
              <Avatar name={player.name} src={player.profileImageUrl} size={130} />
            </div>
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-widest px-4 py-1 rounded-full border border-white shadow-xl flex items-center gap-1.5 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5" /> CELEBRATING TODAY
          </div>
        </div>

        <h2 className="text-3xl font-black text-white tracking-tight leading-tight uppercase mt-3">
          {player.name}
        </h2>
        {player.jerseyNumber && (
          <p className="text-sm font-black text-amber-400 mt-1">JERSEY #{player.jerseyNumber}</p>
        )}

        <div className="mt-6 bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 max-w-xs backdrop-blur-md">
          <p className="text-xs font-semibold text-amber-200/90 leading-relaxed italic">
            "Wishing our legend {player.name} a fantastic birthday! Thank you for your dedication to The Enigmatic Elites! 🎂🎉"
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-amber-950/70 border-t border-amber-500/30 -mx-6 -mb-6 p-4 text-center text-[10px] font-black text-amber-300 tracking-wider">
        THE ENIGMATIC ELITES · OFFICIAL BIRTHDAY WISHES
      </div>
    </CardFrame>
  );
}
