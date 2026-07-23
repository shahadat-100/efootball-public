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

const RANK_COLORS = ['#f59e0b', '#94a3b8', '#b45309'];

export function Top10Card({ topPlayers, title, subtitle, aspect = '16:9', cardRef }: Top10CardProps) {
  return (
    <CardFrame aspect={aspect} cardRef={cardRef}>
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#111] via-[#0a0a0a] to-black" />
        <div className="absolute -top-10 -left-10 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #ef4444, transparent)' }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, #ef4444, transparent)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-red-900/30">
          <div>
            <p className="text-[8px] font-black tracking-[0.3em] text-red-400 uppercase">The Enigmatic Elites</p>
            <h2 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5 mt-0.5">
              <Trophy className="w-3.5 h-3.5 text-red-400" /> {title}
            </h2>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider border border-slate-800 bg-slate-900/80 px-2 py-1 rounded-lg">
            {subtitle}
          </span>
        </div>

        {/* Player grid */}
        <div className="flex-1 grid grid-cols-5 gap-2 p-4 content-center">
          {topPlayers.slice(0, 10).map((r, idx) => {
            const rankColor = idx < 3 ? RANK_COLORS[idx] : '#475569';
            return (
              <div
                key={r.player.id || idx}
                className="flex flex-col items-center text-center bg-slate-900/60 rounded-xl p-2 border relative"
                style={{ borderColor: `${rankColor}30` }}
              >
                {/* Rank badge */}
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-black px-1.5 rounded-md text-black"
                  style={{ background: rankColor }}
                >
                  #{idx + 1}
                </div>

                {/* Avatar — square, not circle */}
                <div
                  className="overflow-hidden border-2 mt-2"
                  style={{ width: 48, height: 48, borderRadius: 8, borderColor: `${rankColor}60` }}
                >
                  <Avatar name={r.player.name} src={r.player.profileImageUrl} size={48} />
                </div>

                <p className="font-black text-[10px] text-white truncate w-full mt-1.5 leading-tight">
                  {r.player.name.split(' ').slice(-1)[0].toUpperCase()}
                </p>
                <p className="text-[9px] font-black mt-0.5" style={{ color: rankColor }}>{r.points}</p>
                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-wide">pts</p>
                {r.goals > 0 && (
                  <p className="text-[8px] text-slate-500 mt-0.5">{r.goals}⚽</p>
                )}
              </div>
            );
          })}

          {topPlayers.length === 0 && (
            <div className="col-span-5 flex items-center justify-center text-slate-600 text-xs py-10">
              No leaderboard data for this period.
            </div>
          )}
        </div>

        {/* Footer strip */}
        <div className="h-[3px] w-full"
          style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)' }} />
      </div>
    </CardFrame>
  );
}
