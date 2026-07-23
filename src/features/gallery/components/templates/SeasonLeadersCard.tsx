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
  const rows = [
    { label: 'Top Scorer', sublabel: 'Most Goals', icon: Target,  accent: '#f59e0b', data: leaders.topScorer,
      stat: leaders.topScorer ? `${leaders.topScorer.goals} goals` : '—' },
    { label: 'Most MOTM', sublabel: 'Player of Match Awards', icon: Award,  accent: '#ef4444', data: leaders.topMotm,
      stat: leaders.topMotm  ? `${leaders.topMotm.motm} awards` : '—' },
    { label: 'Most Wins',  sublabel: 'Win Record Leader',    icon: Crown,  accent: '#22d3ee', data: leaders.topWinner,
      stat: leaders.topWinner ? `${leaders.topWinner.points} pts` : '—' },
  ];

  return (
    <CardFrame aspect={aspect} cardRef={cardRef}>
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#111] via-[#0d0d0d] to-black" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-72 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #f59e0b, #78350f, transparent)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-amber-900/30">
          <p className="text-[9px] font-black tracking-[0.3em] text-amber-400 uppercase">The Enigmatic Elites</p>
          <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-1.5 mt-0.5">
            <Trophy className="w-5 h-5 text-amber-400" /> Season Leaders
          </h2>
        </div>

        {/* Leader rows */}
        <div className="flex-1 flex flex-col gap-3 px-4 py-4 justify-center">
          {rows.map(row => {
            const Icon = row.icon;
            return (
              <div
                key={row.label}
                className="flex items-center gap-4 rounded-2xl p-3 border relative overflow-hidden"
                style={{ background: `${row.accent}0a`, borderColor: `${row.accent}25` }}
              >
                {/* Accent left bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: row.accent }} />

                {/* Avatar */}
                <div className="overflow-hidden border-2 shrink-0"
                  style={{ width: 56, height: 56, borderRadius: 10, borderColor: `${row.accent}60`, boxShadow: `0 0 16px ${row.accent}30` }}>
                  {row.data ? (
                    <Avatar name={row.data.player.name} src={row.data.player.profileImageUrl} size={56} />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-slate-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: row.accent }}>
                    {row.label}
                  </p>
                  <p className="font-black text-sm text-white truncate leading-tight">
                    {row.data ? row.data.player.name.toUpperCase() : 'TBD'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">{row.sublabel}</p>
                </div>

                {/* Stat value */}
                <div className="text-right shrink-0">
                  <p className="font-black text-xl leading-none" style={{ color: row.accent }}>{row.stat}</p>
                  <Icon className="w-3.5 h-3.5 ml-auto mt-1" style={{ color: row.accent, opacity: 0.5 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-2 border-t border-amber-900/20 flex justify-between items-center">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Club Season Honours</p>
          <p className="text-[9px] font-black text-amber-700 uppercase tracking-wider">Official Records</p>
        </div>

        <div className="h-[3px] w-full"
          style={{ background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }} />
      </div>
    </CardFrame>
  );
}
