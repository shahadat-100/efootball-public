import React from 'react';
import { Player } from '@/features/players/types';
import { CardFrame } from '../shared/CardFrame';
import { Avatar } from '@/shared/components';
import { Cake, Sparkles } from 'lucide-react';

interface BirthdayCardProps {
  player: Player;
  aspect?: '4:5' | '1:1' | '16:9' | '9:16';
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function BirthdayCard({ player, aspect = '4:5', cardRef }: BirthdayCardProps) {
  const nameParts = player.name.trim().toUpperCase().split(' ');
  const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0];
  const lastName  = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  return (
    <CardFrame aspect={aspect} cardRef={cardRef}>
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #1a0030, #0a0a0a 50%, #0f0020)' }} />
        {/* Purple accent */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-80 rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, #a855f7, #4c1d95, transparent)' }} />
        <div className="absolute bottom-0 -right-20 w-72 h-72 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        {/* Sparkle dots */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
        {/* Diagonal streaks */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #a855f7 0px, #a855f7 1px, transparent 1px, transparent 24px)',
          }} />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4">
          <div>
            <p className="text-[9px] font-black tracking-[0.3em] text-purple-400 uppercase">The Enigmatic Elites</p>
            <p className="text-[11px] font-black tracking-[0.1em] text-slate-300 uppercase mt-0.5 flex items-center gap-1">
              <Cake className="w-3 h-3 text-purple-400" /> Birthday Celebration
            </p>
          </div>
          {player.jerseyNumber && (
            <div className="bg-purple-700 text-white font-black text-2xl w-12 h-12 rounded-xl flex items-center justify-center border-2 border-purple-400 shadow-lg shadow-purple-900/50">
              {player.jerseyNumber}
            </div>
          )}
        </div>

        {/* Giant background last name */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-4">
          {lastName && (
            <div className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none"
              style={{ top: '50%', transform: 'translateY(-50%)' }}>
              <span className="font-black uppercase leading-none text-white"
                style={{ fontSize: 110, letterSpacing: '-0.04em', opacity: 0.06, lineHeight: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '100%' }}>
                {lastName}
              </span>
            </div>
          )}

          {/* Avatar — square */}
          <div className="relative mb-3">
            <div className="overflow-hidden border-[3px] shadow-2xl shadow-purple-900/50"
              style={{ width: 170, height: 170, borderRadius: 16, borderColor: '#a855f7', boxShadow: '0 0 60px #a855f730' }}>
              <Avatar name={player.name} src={player.profileImageUrl} size={170} />
            </div>
            {/* "Birthday" overlay */}
            <div className="absolute bottom-0 inset-x-0 flex justify-center">
              <span className="bg-purple-600 text-white font-black text-[10px] uppercase tracking-widest px-4 py-1 flex items-center gap-1 shadow-lg">
                <Sparkles className="w-3 h-3" /> HAPPY BIRTHDAY!
              </span>
            </div>
          </div>

          {firstName && (
            <p className="text-[12px] font-black tracking-[0.25em] text-purple-400 uppercase mt-1">{firstName}</p>
          )}
          <h1 className="font-black uppercase text-white leading-none mt-0.5"
            style={{ fontSize: 44, letterSpacing: '-0.02em' }}>
            {lastName || firstName}
          </h1>
        </div>

        {/* Quote footer */}
        <div className="bg-black/60 border-t border-purple-900/50 px-6 py-3 text-center">
          <p className="text-[10px] font-semibold text-purple-200/80 italic leading-relaxed">
            "Wishing our legend a fantastic birthday! Thank you for your dedication. 🎂"
          </p>
        </div>

        {/* Bottom accent line */}
        <div className="h-[3px] w-full"
          style={{ background: 'linear-gradient(90deg, transparent, #a855f7, transparent)' }} />
      </div>
    </CardFrame>
  );
}
