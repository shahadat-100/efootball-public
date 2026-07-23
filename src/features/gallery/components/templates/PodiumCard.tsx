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

const PODIUM = [
  { label: '1ST', color: '#f59e0b', glow: '#78350f', size: 96, height: 'h-32' },
  { label: '2ND', color: '#94a3b8', glow: '#334155', size: 76, height: 'h-24' },
  { label: '3RD', color: '#b45309', glow: '#431407', size: 70, height: 'h-16' },
];

export function PodiumCard({ topPlayers, title, subtitle, aspect = '4:5', cardRef }: PodiumCardProps) {
  // Order: 2nd, 1st, 3rd  for podium layout
  const ordered = [topPlayers[1], topPlayers[0], topPlayers[2]];
  const podiumOrder = [PODIUM[1], PODIUM[0], PODIUM[2]];

  return (
    <CardFrame aspect={aspect} cardRef={cardRef}>
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#111] via-[#0d0d0d] to-black" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-72 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #f59e0b, #78350f, transparent)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-amber-900/30">
          <div>
            <p className="text-[9px] font-black tracking-[0.3em] text-amber-400 uppercase">The Enigmatic Elites</p>
            <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-1.5 mt-0.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              {title}
            </h2>
          </div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider bg-slate-900/80 border border-slate-800 px-2 py-1 rounded-lg">
            {subtitle}
          </span>
        </div>

        {/* Podium section */}
        <div className="flex-1 flex items-end justify-center gap-3 px-4 pb-0 pt-4">
          {ordered.map((player, i) => {
            const cfg = podiumOrder[i];
            if (!player) {
              return (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-20 rounded-t-xl bg-slate-900/50 border border-slate-800 flex items-center justify-center text-slate-600 text-xs font-bold"
                    style={{ height: i === 1 ? 128 : i === 0 ? 96 : 64 }}>—</div>
                </div>
              );
            }
            return (
              <div key={player.player.id || i} className="flex flex-col items-center">
                {/* Avatar */}
                <div className="relative mb-2">
                  <div
                    className="overflow-hidden border-[2.5px] shadow-xl"
                    style={{
                      width: cfg.size, height: cfg.size,
                      borderRadius: '50%',
                      borderColor: cfg.color,
                      boxShadow: `0 0 24px ${cfg.color}50`,
                    }}
                  >
                    <Avatar name={player.player.name} src={player.player.profileImageUrl} size={cfg.size} />
                  </div>
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black text-black border border-white/20 whitespace-nowrap"
                    style={{ background: cfg.color }}
                  >
                    {cfg.label}
                  </div>
                </div>

                {/* Name */}
                <p className="font-extrabold text-[11px] text-white truncate max-w-[90px] text-center mt-3">
                  {player.player.name.split(' ').slice(-1)[0].toUpperCase()}
                </p>
                <p className="text-[10px] font-black mt-0.5" style={{ color: cfg.color }}>
                  {player.points} PTS
                </p>
                {player.goals > 0 && (
                  <p className="text-[9px] text-slate-500 font-bold">{player.goals} goals</p>
                )}

                {/* Podium block */}
                <div
                  className="w-24 rounded-t-xl border border-t-0 flex items-center justify-center mt-2"
                  style={{
                    height: i === 1 ? 128 : i === 0 ? 96 : 64,
                    background: `linear-gradient(180deg, ${cfg.color}30, ${cfg.color}08)`,
                    borderColor: `${cfg.color}40`,
                  }}
                >
                  <span className="text-3xl font-black" style={{ color: cfg.color, opacity: 0.6 }}>
                    {i === 1 ? '1' : i === 0 ? '2' : '3'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {topPlayers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
            No leaderboard data for this period.
          </div>
        )}

        {/* Footer strip */}
        <div className="h-[3px] w-full"
          style={{ background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }} />
      </div>
    </CardFrame>
  );
}
