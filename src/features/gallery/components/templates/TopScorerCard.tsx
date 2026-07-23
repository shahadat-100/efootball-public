import React from 'react';
import { RankedPlayer } from '../../utils/galleryStats';
import { CardFrame } from '../shared/CardFrame';
import { Avatar } from '@/shared/components';
import { Trophy } from 'lucide-react';

interface TopScorerCardProps {
  data: RankedPlayer | null;
  periodLabel: string;
  type: 'weekly' | 'monthly' | 'season';
  aspect?: '4:5' | '1:1' | '9:16' | '16:9';
  cardRef?: React.RefObject<HTMLDivElement>;
}

const TYPE_CONFIG = {
  weekly:  { title: 'TOP SCORER OF THE WEEK',  accent: '#ef4444', glow: '#7f1d1d' },
  monthly: { title: 'TOP SCORER OF THE MONTH', accent: '#f59e0b', glow: '#78350f' },
  season:  { title: 'GOLDEN BOOT LEADER',       accent: '#f59e0b', glow: '#78350f' },
};

export function TopScorerCard({ data, periodLabel, type, aspect = '4:5', cardRef }: TopScorerCardProps) {
  const cfg      = TYPE_CONFIG[type];
  const nameParts = data ? data.player.name.trim().toUpperCase().split(' ') : [];
  const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0] || '';
  const lastName  = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  return (
    <CardFrame aspect={aspect} cardRef={cardRef}>
      {/* Dark gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#111] via-[#0a0a0a] to-black" />
        {/* Accent top glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-56 rounded-full blur-3xl opacity-25"
          style={{ background: `radial-gradient(circle, ${cfg.accent}, ${cfg.glow}, transparent)` }} />
        {/* Halftone dots */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }} />
        {/* Diagonal lines */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, ${cfg.accent} 0px, ${cfg.accent} 1px, transparent 1px, transparent 20px)`,
          }} />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Top header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0">
          <div>
            <p className="text-[9px] font-black tracking-[0.3em] uppercase" style={{ color: cfg.accent }}>
              THE ENIGMATIC ELITES
            </p>
            <p className="text-[11px] font-black tracking-[0.1em] text-slate-300 uppercase mt-0.5">
              {TYPE_CONFIG[type].title}
            </p>
          </div>
          <div className="flex items-center gap-1.5 border px-2.5 py-1 rounded-lg"
            style={{ borderColor: `${cfg.accent}40`, background: `${cfg.accent}15` }}>
            <Trophy className="w-3.5 h-3.5" style={{ color: cfg.accent }} />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">{periodLabel}</span>
          </div>
        </div>

        {data ? (
          <>
            {/* "MVP" / big label */}
            <div className="px-5 mt-3">
              <h2
                className="font-black uppercase leading-none"
                style={{ fontSize: 72, color: cfg.accent, opacity: 0.9, letterSpacing: '-0.04em', textShadow: `0 0 60px ${cfg.accent}60` }}
              >
                MVP
              </h2>
              <p className="text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase -mt-2">Man of the Period</p>
            </div>

            {/* Player photo + stats side by side */}
            <div className="flex flex-1 items-end px-4 gap-4 pb-4 mt-2">
              {/* Avatar large */}
              <div className="relative shrink-0">
                <div
                  className="overflow-hidden bg-slate-800 border-[3px] shadow-2xl"
                  style={{ width: 160, height: 200, borderRadius: 12, borderColor: cfg.accent, boxShadow: `0 0 40px ${cfg.accent}40` }}
                >
                  <Avatar name={data.player.name} src={data.player.profileImageUrl} size={200} />
                </div>
                {/* 1st badge */}
                <div
                  className="absolute -top-3 -right-3 w-9 h-9 rounded-full flex items-center justify-center font-black text-[11px] text-black border-2 border-white shadow-lg"
                  style={{ background: cfg.accent }}
                >
                  #1
                </div>
              </div>

              {/* Name + stat pills */}
              <div className="flex-1 min-w-0">
                {firstName && (
                  <p className="text-[11px] font-black tracking-[0.2em] uppercase" style={{ color: cfg.accent }}>{firstName}</p>
                )}
                <h3
                  className="font-black uppercase text-white leading-none"
                  style={{ fontSize: 34, letterSpacing: '-0.03em' }}
                >
                  {lastName || firstName}
                </h3>
                {data.player.jerseyNumber && (
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">#{data.player.jerseyNumber}</p>
                )}

                {/* Stat pills */}
                <div className="flex flex-col gap-2 mt-4">
                  {[
                    { label: 'Goals', value: data.goals },
                    { label: 'MOTM', value: data.motm },
                    { label: 'Points', value: data.points },
                  ].map(s => (
                    <div key={s.label}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                      style={{ background: `${cfg.accent}18`, border: `1px solid ${cfg.accent}30` }}>
                      <span className="text-xl font-black text-white w-10 shrink-0">{s.value}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm px-6 text-center">
            No stats recorded for this period yet.
          </div>
        )}

        {/* Bottom strip */}
        <div
          className="h-[4px] w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)` }}
        />
      </div>
    </CardFrame>
  );
}
