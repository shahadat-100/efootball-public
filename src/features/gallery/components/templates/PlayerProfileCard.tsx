import React from 'react';
import { Player, PlayerSeasonStat } from '@/features/players/types';
import { Avatar } from '@/shared/components';
import { CardFrame } from '../shared/CardFrame';
import { Crown } from 'lucide-react';

interface PlayerProfileCardProps {
  player: Player;
  seasonStats?: PlayerSeasonStat[];
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function PlayerProfileCard({ player, seasonStats = [], cardRef }: PlayerProfileCardProps) {
  // Aggregate stats across seasons
  const totalApps = seasonStats.reduce((acc, s) => acc + (s.appearances || 0), 0);
  const totalGoals = seasonStats.reduce((acc, s) => acc + (s.goals || 0), 0);
  const totalMotm = seasonStats.reduce((acc, s) => acc + (s.motmCount || 0), 0);
  const totalWins = seasonStats.reduce((acc, s) => acc + (s.wins || 0), 0);

  const totalCleanSheets = seasonStats.reduce((acc, s) => acc + (s.cleansheets || 0), 0);
  const totalDraws = seasonStats.reduce((acc, s) => acc + (s.draws || 0), 0);
  const totalLosses = seasonStats.reduce((acc, s) => acc + (s.losses || 0), 0);
  const totalHattricks = seasonStats.reduce((acc, s) => acc + (s.hattricks || 0), 0);

  const primaryRole = player.playerRoles?.[0] || 'Player';

  return (
    <CardFrame aspect="4:5" cardRef={cardRef} className="bg-slate-950 text-white rounded-3xl p-6 flex flex-col justify-between border border-amber-500/30 shadow-2xl overflow-hidden">
      {/* Dynamic ambient backlights */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-amber-500/20 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none">Official Card</p>
            <p className="text-[13px] font-extrabold text-white tracking-tight leading-snug">PLAYER PROFILE</p>
          </div>
        </div>

        {player.jerseyNumber && (
          <div className="bg-amber-500/20 border border-amber-500/40 rounded-2xl px-3 py-1 text-center">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">JERSEY</span>
            <span className="text-lg font-black text-amber-300 leading-none">#{player.jerseyNumber}</span>
          </div>
        )}
      </div>

      {/* Main Content Body */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center py-3">
        {/* Avatar Frame (rounded rectangle style) */}
        <div className="relative mb-3">
          <div className="rounded-2xl p-1 bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 shadow-2xl">
            <div className="rounded-xl overflow-hidden bg-slate-950" style={{ width: 110, height: 110 }}>
              <Avatar name={player.name} src={player.profileImageUrl} size={110} className="rounded-xl" />
            </div>
          </div>

          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-widest px-3 py-0.5 rounded-full border border-amber-300 shadow-lg whitespace-nowrap">
            {primaryRole}
          </div>
        </div>

        {/* Player Name */}
        <h2 className="text-2xl font-black text-white tracking-tight leading-tight uppercase mt-2">
          {player.name}
        </h2>

        {/* Location & Email info */}
        {(player.location || player.email) && (
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
            {player.location ? `📍 ${player.location}` : player.email}
          </p>
        )}

        {/* Tags / Subtitle */}
        {player.customTags && player.customTags.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 flex-wrap mt-2">
            {player.customTags.slice(0, 4).map((tag, idx) => (
              <span key={idx} className="text-[10px] font-extrabold bg-slate-900 border border-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Stats Grid Footer (6 Metrics) */}
      <div className="relative z-10 grid grid-cols-3 gap-2 bg-slate-900/90 border border-amber-500/20 rounded-2xl p-3 backdrop-blur-md">
        <div className="text-center">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">MATCHES</p>
          <p className="text-sm font-black text-amber-300">{totalApps}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">GOALS</p>
          <p className="text-sm font-black text-amber-300">{totalGoals}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">MOTM</p>
          <p className="text-sm font-black text-amber-300">{totalMotm}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">RECORD (W-D-L)</p>
          <p className="text-sm font-black text-amber-300">{totalWins}-{totalDraws}-{totalLosses}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">CLEAN SHEETS</p>
          <p className="text-sm font-black text-amber-300">{totalCleanSheets}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">HAT-TRICKS</p>
          <p className="text-sm font-black text-amber-300">{totalHattricks}</p>
        </div>
      </div>
    </CardFrame>
  );
}
