import React from 'react';
import { Player, PlayerSeasonStat } from '@/features/players/types';
import { Avatar } from '@/shared/components';
import { CardFrame } from '../shared/CardFrame';
import { Award, Crown, Shield, Star, Zap } from 'lucide-react';

interface PlayerProfileCardProps {
  player: Player;
  seasonStats?: PlayerSeasonStat[];
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function PlayerProfileCard({ player, seasonStats = [], cardRef }: PlayerProfileCardProps) {
  // Aggregate stats across seasons
  const totalApps = seasonStats.reduce((acc, s) => acc + (s.appearances || 0), 0);
  const totalGoals = seasonStats.reduce((acc, s) => acc + (s.goals || 0), 0);
  const totalCleanSheets = seasonStats.reduce((acc, s) => acc + (s.cleansheets || 0), 0);
  const totalMotm = seasonStats.reduce((acc, s) => acc + (s.motmCount || 0), 0);
  const totalWins = seasonStats.reduce((acc, s) => acc + (s.wins || 0), 0);

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
      <div className="relative z-10 my-auto flex flex-col items-center text-center py-4">
        {/* Large Avatar with glowing gradient ring */}
        <div className="relative mb-4">
          <div className="rounded-full p-1.5 bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 shadow-2xl">
            <div className="rounded-full overflow-hidden bg-slate-950 p-1" style={{ width: 120, height: 120 }}>
              <Avatar name={player.name} src={player.profileImageUrl} size={120} />
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

        {/* Tags / Subtitle */}
        {player.customTags && player.customTags.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 flex-wrap mt-2">
            {player.customTags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[10px] font-extrabold bg-slate-900 border border-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats Grid Footer */}
      <div className="relative z-10 grid grid-cols-4 gap-2 bg-slate-900/90 border border-amber-500/20 rounded-2xl p-3 backdrop-blur-md">
        <div className="text-center">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">MATCHES</p>
          <p className="text-base font-black text-amber-300">{totalApps}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">GOALS</p>
          <p className="text-base font-black text-amber-300">{totalGoals}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">MOTM</p>
          <p className="text-base font-black text-amber-300">{totalMotm}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">WINS</p>
          <p className="text-base font-black text-amber-300">{totalWins}</p>
        </div>
      </div>
    </CardFrame>
  );
}
