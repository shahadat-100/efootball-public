import { useEffect, useState } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Avatar } from '@/shared/components';
import { Award, ChevronLeft, ChevronRight, Crown, Star, Trophy } from 'lucide-react';

// ── Per-legend color palette ────────────────────────────────────────────────
const HOF_PALETTE: string[] = [
  '#f59e0b', // Gold
  '#c8102e', // Crimson
  '#3b82f6', // Royal Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#14b8a6', // Teal
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
  const accent = HOF_PALETTE[currentIndex % HOF_PALETTE.length];

  return (
    <div className="relative rounded-3xl overflow-hidden h-full bg-white border border-slate-100 shadow-sm transition-all duration-500">

      {/* Decorative background elements */}
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-[0.08] transition-all duration-700"
        style={{ background: accent }}
      />
      <div
        className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-[0.06] transition-all duration-700"
        style={{ background: accent }}
      />

      {/* ── Content Layout ───────────────────────────────────────────────── */}
      <div className="relative z-10 h-full flex flex-col p-5 gap-4">

        {/* Header: Title + Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-500"
              style={{ background: `${accent}10`, borderColor: `${accent}25`, color: accent }}
            >
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[12px] font-black text-slate-800 uppercase tracking-wider block leading-tight">Club Legends</span>
              <span className="text-[10px] font-medium text-slate-400">{currentIndex + 1} of {hallOfFame.length}</span>
            </div>
          </div>

          {/* Nav controls */}
          {hallOfFame.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate(-1)}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all border border-slate-150 bg-slate-50 hover:bg-white hover:shadow-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate(1)}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all border border-slate-150 bg-slate-50 hover:bg-white hover:shadow-sm"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* ── Main Content: Horizontal Player Card ─────────────────────── */}
        <div
          className={`flex-1 flex items-center gap-5 transition-all duration-300 ${
            animating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
          }`}
        >
          {/* Left: Large Avatar with decorative frame */}
          <div className="relative shrink-0">
            {/* Outer decorative ring */}
            <div
              className="rounded-2xl p-[3px] shadow-lg transition-all duration-500"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}50)` }}
            >
              <div className="rounded-2xl overflow-hidden bg-white" style={{ width: 100, height: 100 }}>
                <Avatar name={player?.name ?? 'Legend'} src={player?.profileImageUrl} size={100} />
              </div>
            </div>

            {/* Floating star badge */}
            <div
              className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center border-2 border-white shadow-md transition-colors duration-500"
              style={{ background: accent }}
            >
              <Star className="w-3.5 h-3.5 text-white fill-white" />
            </div>

            {/* Award pin bottom */}
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-md border-2 border-white"
              style={{ background: accent }}
            >
              ★ Legend
            </div>
          </div>

          {/* Right: Player Info Stack */}
          <div className="flex-1 min-w-0 flex flex-col gap-2.5">
            {/* Player Name */}
            <div>
              <h4 className="font-extrabold text-[18px] text-slate-900 tracking-tight leading-tight truncate">
                {player?.name ?? 'Unknown'}
              </h4>
              {player?.jerseyNumber && (
                <span className="text-[11px] font-bold text-slate-400 mt-0.5 block">
                  #{player.jerseyNumber}
                </span>
              )}
            </div>

            {/* Category & Season Row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border transition-colors duration-500"
                style={{
                  color: accent,
                  background: `${accent}10`,
                  borderColor: `${accent}22`,
                }}
              >
                <Award className="w-3 h-3" />
                {entry.category}
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-150 px-2 py-1 rounded-lg flex items-center gap-1">
                🏆 {entry.seasonText}
              </span>
            </div>

            {/* Subtitle / Achievement */}
            {entry.subTitle && (
              <p
                className="text-[12px] font-semibold leading-snug line-clamp-2"
                style={{ color: accent }}
              >
                {entry.subTitle}
              </p>
            )}
          </div>
        </div>

        {/* ── Bottom: Dot indicators ──────────────────────────────────── */}
        {hallOfFame.length > 1 && (
          <div className="flex justify-center gap-1.5 pt-1">
            {hallOfFame.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAnimating(true);
                  setTimeout(() => { setCurrentIndex(idx); setAnimating(false); }, 180);
                }}
                className="rounded-full transition-all duration-300"
                style={{
                  width: idx === currentIndex ? 20 : 6,
                  height: 6,
                  background: idx === currentIndex ? accent : '#e2e8f0',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] opacity-60 transition-all duration-500"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}40, transparent)` }}
      />
    </div>
  );
}
