import React from 'react';
import { RankedPlayer } from '../../utils/galleryStats';
import { CardFrame } from '../shared/CardFrame';
import { Avatar } from '@/shared/components';
import { Trophy } from 'lucide-react';

interface TopScorerCardProps {
  data: RankedPlayer | null;
  periodLabel: string;
  type: 'weekly' | 'monthly' | 'season';
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function TopScorerCard({ data, periodLabel, type, cardRef }: TopScorerCardProps) {
  const typeTitles = {
    weekly: 'TOP SCORER OF THE WEEK',
    monthly: 'TOP SCORER OF THE MONTH',
    season: 'SEASON GOLDEN BOOT LEADER',
  };

  return (
    <CardFrame aspect="4:5" cardRef={cardRef} className="bg-slate-950 text-white rounded-3xl p-6 flex flex-col justify-between border border-amber-500/40 shadow-2xl overflow-hidden">
      {/* Background radial spotlights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Title Header */}
      <div className="relative z-10 text-center border-b border-amber-500/20 pb-4">
        <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full mb-2">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest">{periodLabel}</span>
        </div>
        <h3 className="text-lg font-black text-white uppercase tracking-tight">{typeTitles[type]}</h3>
      </div>

      {data ? (
        <>
          {/* Main Scorer Profile */}
          <div className="relative z-10 my-auto flex flex-col items-center text-center py-4">
            <div className="relative mb-3">
              <div className="rounded-full p-1.5 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 shadow-2xl">
                <div className="rounded-full overflow-hidden bg-slate-950 p-1" style={{ width: 110, height: 110 }}>
                  <Avatar name={data.player.name} src={data.player.profileImageUrl} size={110} />
                </div>
              </div>
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider px-3.5 py-0.5 rounded-full border border-amber-300 shadow-lg">
                ★ 1ST PLACE
              </div>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight leading-tight uppercase mt-2">
              {data.player.name}
            </h2>
            {data.player.jerseyNumber && (
              <p className="text-xs font-bold text-amber-400/90 mt-0.5">#{data.player.jerseyNumber}</p>
            )}
          </div>

          {/* Stat Callout Footer */}
          <div className="relative z-10 grid grid-cols-3 gap-2 bg-slate-900/90 border border-amber-500/20 rounded-2xl p-3 text-center">
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">GOALS</p>
              <p className="text-xl font-black text-amber-300">{data.goals}</p>
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">MOTM</p>
              <p className="text-xl font-black text-amber-300">{data.motm}</p>
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">POINTS</p>
              <p className="text-xl font-black text-amber-300">{data.points}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="relative z-10 my-auto text-center text-slate-400 py-12">
          No stats recorded for this period yet.
        </div>
      )}
    </CardFrame>
  );
}
