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

const RANK_BADGE_STYLE = (idx: number) => {
  if (idx === 0) return { bg: 'linear-gradient(135deg, #b8860b, #FFD700)', text: '#0C0C10', glow: 'shadow-yellow-500/20' };
  if (idx === 1) return { bg: 'linear-gradient(135deg, #888, #C0C0C0)', text: '#0C0C10', glow: 'shadow-slate-400/20' };
  if (idx === 2) return { bg: 'linear-gradient(135deg, #7a3d00, #CC6600)', text: '#fff', glow: 'shadow-amber-700/20' };
  return { bg: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.5)', glow: '' };
};

export function Top10Card({ topPlayers, title, subtitle, aspect = '16:9', cardRef }: Top10CardProps) {
  return (
    <CardFrame aspect={aspect} cardRef={cardRef} className="bg-[#0C0C10] border border-red-950/60 shadow-2xl relative overflow-hidden font-sans select-none flex flex-col justify-between">
      {/* Background spotlights */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-900/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Carbon fiber grid overlay for power wall look */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 z-0" 
        style={{
          backgroundImage: 'linear-gradient(45deg, rgba(204,26,26,0.03) 25%, transparent 25%, transparent 75%, rgba(204,26,26,0.03) 75%), linear-gradient(45deg, rgba(204,26,26,0.03) 25%, transparent 25%, transparent 75%, rgba(204,26,26,0.03) 75%)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 8px 8px'
        }}
      />

      {/* Header Overlay */}
      <div className="flex items-center justify-between border-b border-red-900/30 pb-3 -mx-6 -mt-6 p-5 bg-slate-950/70 backdrop-blur-md relative z-20">
        <div>
          <span className="text-[12px] font-bold text-[#FFD700] uppercase tracking-widest block mb-0.5" style={{ fontFamily: "'Golden Varsity Script', Georgia, serif", textShadow: '0 2px 10px rgba(255,215,0,0.4)' }}>{subtitle}</span>
          <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2" style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}>
            <Trophy className="w-5 h-5 text-red-500" /> {title}
          </h3>
        </div>
        <div className="flex items-center gap-2.5">
          <img
            src="/images/club-logo.jpg"
            alt="Club Logo"
            className="w-9 h-9 rounded-md object-cover border border-red-800/40"
          />
          <div className="text-left">
            <span className="text-[10px] font-black text-white uppercase tracking-wider block leading-none">THE ENIGMATIC ELITE</span>
            <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest italic mt-0.5 block">In Mystery We Reign</span>
          </div>
        </div>
      </div>

      {/* Grid of 10 Players */}
      <div className="my-auto grid grid-cols-5 gap-3 py-4 relative z-10">
        {topPlayers.slice(0, 10).map((r, idx) => {
          const style = RANK_BADGE_STYLE(idx);
          return (
            <div key={r.player.id || idx} className="bg-[#121318] border border-red-900/20 rounded-2xl p-2.5 flex flex-col items-center text-center relative shadow-lg">
              {/* Rank Pill */}
              <span 
                className="absolute top-2 left-2 text-[9px] font-black px-1.5 py-0.2 rounded-md"
                style={{ background: style.bg, color: style.text }}
              >
                #{idx + 1}
              </span>

              <div className={`rounded-full p-0.5 my-1 ${style.glow}`} style={{ background: style.bg }}>
                <div className="rounded-full overflow-hidden bg-[#1a1520] p-0.5" style={{ width: 44, height: 44 }}>
                  <Avatar name={r.player.name} src={r.player.profileImageUrl} size={44} />
                </div>
              </div>

              <p className="font-extrabold text-[11px] text-white truncate w-full mt-1 uppercase">{r.player.name}</p>
              
              <p className="text-xs font-black text-red-500 mt-0.5" style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}>
                {r.points} <span className="text-[8px] font-bold text-slate-400">PTS</span>
              </p>
              
              <p className="text-[9px] font-medium text-slate-400 mt-0.5 bg-[#1C0808]/50 px-2 py-0.5 rounded border border-[#3a1212]/30">
                ⚽{r.goals} · ★{r.motm}
              </p>
            </div>
          );
        })}

        {topPlayers.length === 0 && (
          <div className="col-span-5 text-center text-slate-500 py-10 text-xs">
            No stats recorded for this period yet.
          </div>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-red-900/20 pt-2 -mx-6 -mb-6 p-4 bg-slate-950/80 flex justify-between text-[9px] font-extrabold text-slate-500 tracking-wider relative z-20">
        <span>OFFICIAL CLUB GALLERY</span>
        <span>THE ENIGMATIC ELITES</span>
      </div>
    </CardFrame>
  );
}
