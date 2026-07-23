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
      <div className="rounded-3xl p-6 h-full flex flex-col items-center justify-center text-center gap-3 border border-slate-100 bg-white shadow-sm">
        <div className="w-14 h-14 rounded-full flex items-center justify-center border border-amber-200 bg-amber-50">
          <Crown className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Hall of Fame</p>
          <p className="text-xs text-slate-400 mt-1">Legends will be inducted here</p>
        </div>
      </div>
    );
  }

  const entry = hallOfFame[currentIndex];
  const player = players.find(p => p.id === entry.playerId);
  const { accent } = HOF_PALETTE[currentIndex % HOF_PALETTE.length];

  return (
    <div
      className="relative rounded-3xl overflow-hidden h-full flex flex-col shadow-md border border-slate-100 bg-white transition-all duration-500 p-5"
    >
      {/* Top accent glow blur */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-500"
        style={{ background: accent }}
      />

      {/* ── Header row ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between pb-2">
        {/* "Club Legends" label */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center transition-colors duration-500 shadow-xs"
            style={{ background: `${accent}15`, color: accent }}
          >
            <Crown className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Club Legends</span>
        </div>

        {/* Nav arrows + dots */}
        {hallOfFame.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 bg-slate-50/80 hover:bg-slate-100"
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
                    background: idx === currentIndex ? accent : '#cbd5e1',
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => navigate(1)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 bg-slate-50/80 hover:bg-slate-100"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Main card body ────────────────────────────────────────────────────── */}
      <div
        className={`relative z-10 flex-1 flex flex-col items-center justify-center pt-2 transition-all duration-300 ${
          animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* Avatar with glowing pastel ring */}
        <div className="relative mb-3">
          <div
            className="rounded-full p-1 transition-all duration-500 shadow-md"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}40)` }}
          >
            <div className="rounded-full overflow-hidden bg-white p-0.5" style={{ width: 80, height: 80 }}>
              <Avatar name={player?.name ?? 'Legend'} src={player?.profileImageUrl} size={80} />
            </div>
          </div>

          {/* Award badge */}
          <div
            className="absolute -bottom-1 -right-1 w-6.5 h-6.5 rounded-full flex items-center justify-center border-2 border-white shadow-md transition-colors duration-500"
            style={{ background: accent }}
          >
            <Award className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Spotlight "LEGEND" pill */}
        <div
          className="text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-1.5 shadow-xs"
          style={{ background: accent }}
        >
          ★ Legend
        </div>

        {/* Player name */}
        <h4 className="font-extrabold text-lg text-slate-900 tracking-tight leading-tight text-center truncate w-full">
          {player?.name ?? 'Unknown'}
        </h4>

        {/* Inner clean info box */}
        <div
          className="mt-3 w-full rounded-2xl border p-3 flex flex-col gap-1.5 transition-all duration-500"
          style={{
            background: `${accent}06`,
            borderColor: `${accent}20`,
          }}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Category pill */}
            <span
              className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
              style={{ color: accent, background: `${accent}15`, borderColor: `${accent}30` }}
            >
              {entry.category}
            </span>
            {/* Season */}
            <span className="text-[10px] font-extrabold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-2xs">
              🏆 {entry.seasonText}
            </span>
          </div>

          {entry.subTitle && (
            <p className="text-[12px] font-bold leading-snug line-clamp-2 mt-0.5" style={{ color: accent }}>
              {entry.subTitle}
            </p>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl opacity-50 transition-all duration-500"
        style={{ background: accent }}
      />
    </div>
  );
}
