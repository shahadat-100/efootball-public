import { useEffect, useState } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Avatar } from '@/shared/components';
import { Award, ChevronLeft, ChevronRight, Crown } from 'lucide-react';

// ── Per-legend color palette (cycles by index, matches app dark aesthetic) ────
const HOF_PALETTE: { accent: string; bg: string }[] = [
  { accent: '#f59e0b', bg: 'linear-gradient(135deg, #1a1000, #0d0d0d)' },  // Gold
  { accent: '#c8102e', bg: 'linear-gradient(135deg, #1a0005, #0d0000)' },  // Crimson
  { accent: '#3b82f6', bg: 'linear-gradient(135deg, #020c1b, #000d0d)' },  // Royal Blue
  { accent: '#10b981', bg: 'linear-gradient(135deg, #001a0e, #0d0d0d)' },  // Emerald
  { accent: '#8b5cf6', bg: 'linear-gradient(135deg, #0d0018, #0d0d0d)' },  // Violet
  { accent: '#f43f5e', bg: 'linear-gradient(135deg, #1a0010, #0d0000)' },  // Rose
  { accent: '#06b6d4', bg: 'linear-gradient(135deg, #001519, #0d0d0d)' },  // Cyan
  { accent: '#14b8a6', bg: 'linear-gradient(135deg, #001614, #0d0d0d)' },  // Teal
];

export function HallOfFameCarousel() {
  const { hallOfFame, players } = useFootballStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (hallOfFame.length <= 1) return;
    const interval = setInterval(() => {
      navigate(1);
    }, 6000);
    return () => clearInterval(interval);
  }, [hallOfFame.length, currentIndex]);

  const navigate = (dir: number) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + dir + hallOfFame.length) % hallOfFame.length);
      setAnimating(false);
    }, 180);
  };

  // ── Empty State ──────────────────────────────────────────────────────────────
  if (hallOfFame.length === 0) {
    return (
      <div className="rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center gap-3 border border-white/8"
        style={{ background: 'linear-gradient(135deg, #1a1000, #0d0d0d)' }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center border border-white/10"
          style={{ background: '#f59e0b22' }}>
          <Crown className="w-6 h-6" style={{ color: '#f59e0b' }} />
        </div>
        <div>
          <p className="text-sm font-black text-white/70 uppercase tracking-widest">Hall of Fame</p>
          <p className="text-xs text-white/30 mt-1">Legends will be inducted here</p>
        </div>
      </div>
    );
  }

  const entry = hallOfFame[currentIndex];
  const player = players.find(p => p.id === entry.playerId);
  const { accent, bg } = HOF_PALETTE[currentIndex % HOF_PALETTE.length];

  return (
    <div
      className="relative rounded-2xl overflow-hidden h-full flex flex-col shadow-lg border border-white/6 transition-all duration-500"
      style={{ background: bg }}
    >
      {/* Top accent glow line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl transition-all duration-500"
        style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }} />

      {/* Background glow blob behind avatar */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-40 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-500"
        style={{ background: accent }}
      />

      {/* ── Header row ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-0">
        {/* "Club Legends" label */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-500"
            style={{ background: `${accent}22`, color: accent }}>
            <Crown className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-black text-white/70 uppercase tracking-widest">Club Legends</span>
        </div>

        {/* Nav arrows + dots */}
        {hallOfFame.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 transition-colors border border-white/10 hover:border-white/20"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex gap-1 items-center">
              {hallOfFame.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setAnimating(true); setTimeout(() => { setCurrentIndex(idx); setAnimating(false); }, 180); }}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: idx === currentIndex ? 16 : 5,
                    height: 5,
                    background: idx === currentIndex ? accent : 'rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => navigate(1)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 transition-colors border border-white/10 hover:border-white/20"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Main card body ────────────────────────────────────────────────────── */}
      <div
        className={`relative z-10 flex-1 flex flex-col items-center justify-center px-5 pb-4 pt-3 transition-all duration-300 ${
          animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* Avatar with glowing ring */}
        <div className="relative mb-3">
          <div
            className="rounded-full overflow-hidden border-4 shadow-2xl transition-all duration-500"
            style={{ borderColor: `${accent}90`, width: 88, height: 88 }}
          >
            <Avatar name={player?.name ?? 'Legend'} src={player?.profileImageUrl} size={88} />
          </div>

          {/* Award badge */}
          <div
            className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center border-2 border-black/40 shadow-lg transition-colors duration-500"
            style={{ background: accent }}
          >
            <Award className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Spotlight "LEGEND" pill */}
        <div
          className="text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 shadow-lg transition-colors duration-500"
          style={{ background: accent }}
        >
          ★ Legend
        </div>

        {/* Player name */}
        <h4 className="font-black text-lg text-white tracking-tight leading-tight text-center truncate w-full">
          {player?.name ?? 'Unknown'}
        </h4>

        {/* Inner glassy info box */}
        <div
          className="mt-3 w-full rounded-xl border p-3 flex flex-col gap-1.5 transition-all duration-500"
          style={{
            background: `linear-gradient(135deg, ${accent}12, ${accent}03)`,
            borderColor: `${accent}30`,
          }}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Category pill */}
            <span
              className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full transition-colors duration-500"
              style={{ color: accent, background: `${accent}20` }}
            >
              {entry.category}
            </span>
            {/* Season */}
            <span className="text-[10px] font-semibold text-white/45 uppercase tracking-wider">
              {entry.seasonText}
            </span>
          </div>

          {entry.subTitle && (
            <p className="text-[12px] text-white/60 leading-relaxed line-clamp-2 mt-0.5">
              {entry.subTitle}
            </p>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl opacity-40 transition-all duration-500"
        style={{ background: accent }}
      />
    </div>
  );
}
