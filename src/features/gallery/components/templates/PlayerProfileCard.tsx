import React from 'react';
import { Player, PlayerSeasonStat } from '@/features/players/types';
import { Avatar } from '@/shared/components';
import { CardFrame } from '../shared/CardFrame';

interface PlayerProfileCardProps {
  player: Player;
  seasonStats?: PlayerSeasonStat[];
  cardRef?: React.RefObject<HTMLDivElement>;
  aspect?: '4:5' | '1:1' | '9:16' | '16:9';
}

export function PlayerProfileCard({ player, seasonStats = [], cardRef, aspect = '4:5' }: PlayerProfileCardProps) {
  const totalApps   = seasonStats.reduce((a, s) => a + (s.appearances || 0), 0);
  const totalGoals  = seasonStats.reduce((a, s) => a + (s.goals || 0), 0);
  const totalMotm   = seasonStats.reduce((a, s) => a + (s.motmCount || 0), 0);
  const totalWins   = seasonStats.reduce((a, s) => a + (s.wins || 0), 0);
  const primaryRole = player.playerRoles?.[0] || 'PLAYER';
  const nameParts   = player.name.trim().toUpperCase().split(' ');
  const firstName   = nameParts.slice(0, -1).join(' ') || nameParts[0];
  const lastName    = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  return (
    <CardFrame aspect={aspect} cardRef={cardRef}>
      {/* ── Dark grunge gradient overlay ────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        {/* Base dark background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#0d0d0d] to-black" />
        {/* Red/crimson accent splatter top-right */}
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #ef4444, #7f1d1d, transparent)' }} />
        {/* Subtle left glow */}
        <div className="absolute bottom-0 -left-10 w-56 h-56 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #ef4444, transparent)' }} />
        {/* Diagonal halftone dots — decorative */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }} />
      </div>

      {/* ── Layout ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col h-full">

        {/* Top bar: Club label + jersey */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0">
          <div>
            <p className="text-[9px] font-black tracking-[0.3em] text-red-400 uppercase">The Enigmatic Elites</p>
            <p className="text-[11px] font-black tracking-[0.15em] text-slate-300 uppercase">Player Profile</p>
          </div>
          {player.jerseyNumber && (
            <div className="bg-red-600 text-white font-black text-2xl w-12 h-12 rounded-xl flex items-center justify-center border-2 border-red-400 shadow-lg shadow-red-900/50">
              {player.jerseyNumber}
            </div>
          )}
        </div>

        {/* Giant background name (watermark style) */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-4">
          {/* Oversized last name — behind avatar */}
          {lastName && (
            <div
              className="absolute inset-x-0 flex items-center justify-center select-none pointer-events-none"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
              <span
                className="font-black uppercase leading-none text-white"
                style={{
                  fontSize: 120,
                  letterSpacing: '-0.04em',
                  opacity: 0.07,
                  lineHeight: 0.85,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  maxWidth: '100%',
                }}
              >
                {lastName}
              </span>
            </div>
          )}

          {/* Player Avatar — large, centred, square crop */}
          <div className="relative mt-2 mb-3">
            <div
              className="overflow-hidden bg-slate-800 border-[3px] border-red-600 shadow-2xl shadow-red-900/40"
              style={{ width: 180, height: 180, borderRadius: 16 }}
            >
              <Avatar name={player.name} src={player.profileImageUrl} size={180} />
            </div>

            {/* Role tag — overlaid bottom of photo */}
            <div className="absolute bottom-0 inset-x-0 flex justify-center">
              <span className="bg-red-600 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 shadow-md">
                {primaryRole}
              </span>
            </div>
          </div>

          {/* First name */}
          {firstName && (
            <p className="text-[13px] font-black tracking-[0.25em] text-red-400 uppercase mt-1">{firstName}</p>
          )}
          {/* Last name (readable) */}
          {lastName && (
            <h1
              className="font-black uppercase text-white leading-none mt-0.5"
              style={{ fontSize: 42, letterSpacing: '-0.02em' }}
            >
              {lastName}
            </h1>
          )}
          {!lastName && (
            <h1 className="font-black uppercase text-white leading-none mt-0.5" style={{ fontSize: 38 }}>
              {firstName}
            </h1>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 border-t border-red-900/60 bg-black/70 backdrop-blur-sm">
          {[
            { label: 'Matches', value: totalApps },
            { label: 'Goals', value: totalGoals },
            { label: 'MOTM', value: totalMotm },
            { label: 'Wins', value: totalWins },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center py-3 ${i < 3 ? 'border-r border-red-900/40' : ''}`}
            >
              <span className="text-2xl font-black text-red-400 leading-none">{stat.value}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </CardFrame>
  );
}
