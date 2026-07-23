import { useEffect, useState } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Avatar } from '@/shared/components';
import { Award, ChevronLeft, ChevronRight, Crown, Sparkles, Star, Trophy } from 'lucide-react';

// ── Per-legend accent palette ───────────────────────────────────────────────
const HOF_PALETTE: string[] = [
  '#b8860b', // Dark Gold
  '#c8102e', // Crimson
  '#1e40af', // Deep Blue
  '#047857', // Deep Emerald
  '#6d28d9', // Deep Violet
  '#be123c', // Deep Rose
  '#0e7490', // Deep Cyan
  '#0f766e', // Deep Teal
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
    }, 200);
  };

  // ── Empty State ──────────────────────────────────────────────────────────────
  if (hallOfFame.length === 0) {
    return (
      <div className="rounded-2xl h-full flex flex-col items-center justify-center text-center gap-3 border border-amber-200/60 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 shadow-sm">
        <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-amber-300/50 bg-gradient-to-br from-amber-100 to-amber-50">
          <Crown className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-black text-amber-800 uppercase tracking-[0.2em]">Hall of Fame</p>
          <p className="text-xs text-amber-600/60 mt-1">Legends will be inducted here</p>
        </div>
      </div>
    );
  }

  const entry = hallOfFame[currentIndex];
  const player = players.find(p => p.id === entry.playerId);
  const accent = HOF_PALETTE[currentIndex % HOF_PALETTE.length];

  return (
    <div className="relative rounded-2xl overflow-hidden h-full border border-amber-200/50 shadow-md transition-all duration-500 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40">

      {/* ── Decorative golden texture elements ──────────────────────────── */}
      {/* Top-left ornamental glow */}
      <div className="absolute -top-20 -left-20 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-[0.12]"
        style={{ background: 'radial-gradient(circle, #f59e0b, #d97706, transparent)' }}
      />
      {/* Bottom-right ornamental glow */}
      <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-[0.10]"
        style={{ background: `radial-gradient(circle, ${accent}, transparent)` }}
      />
      {/* Top gold filigree line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent 5%, #d4a84420, #f59e0b60, #d4a84420, transparent 95%)' }}
      />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 h-full flex flex-col px-5 pt-4 pb-4 gap-3">

        {/* ── Header: "Hall of Fame" crest + navigation ───────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Crest icon */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-300/50 shadow-sm">
              <Crown className="w-4.5 h-4.5 text-amber-700" />
            </div>
            <div>
              <span className="text-[11px] font-black text-amber-900/80 uppercase tracking-[0.18em] block leading-tight">
                Hall of Fame
              </span>
              <span className="text-[10px] font-semibold text-amber-600/50 tracking-wide">
                {currentIndex + 1} / {hallOfFame.length} Legends
              </span>
            </div>
          </div>

          {/* Nav */}
          {hallOfFame.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate(-1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-500 hover:text-amber-800 transition-all border border-amber-200/60 bg-white/70 hover:bg-amber-50 hover:shadow-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate(1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-500 hover:text-amber-800 transition-all border border-amber-200/60 bg-white/70 hover:bg-amber-50 hover:shadow-sm"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* ── Divider with golden ornament ─────────────────────────────── */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
          <Star className="w-3 h-3 text-amber-400/60 fill-amber-300/40" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
        </div>

        {/* ── Main Content: Horizontal Player Legacy Card ─────────────── */}
        <div
          className={`flex-1 flex items-center gap-5 transition-all duration-300 ${
            animating ? 'opacity-0 scale-[0.97]' : 'opacity-100 scale-100'
          }`}
        >
          {/* Left: Grand Avatar with legacy frame */}
          <div className="relative shrink-0">
            {/* Outer golden frame */}
            <div
              className="rounded-xl p-[3px] shadow-lg"
              style={{
                background: 'linear-gradient(145deg, #f59e0b, #d97706, #b8860b, #d4a844)',
              }}
            >
              <div className="rounded-xl overflow-hidden bg-amber-50" style={{ width: 96, height: 96 }}>
                <Avatar name={player?.name ?? 'Legend'} src={player?.profileImageUrl} size={96} />
              </div>
            </div>

            {/* Crown badge — top center */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-b from-amber-400 to-amber-600 border-2 border-white shadow-lg">
              <Crown className="w-4 h-4 text-white" />
            </div>

            {/* "LEGEND" ribbon — bottom */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div
                className="px-3 py-[3px] rounded-full text-[8px] font-black uppercase tracking-[0.25em] text-white shadow-md border border-amber-500/50"
                style={{
                  background: 'linear-gradient(90deg, #d97706, #f59e0b, #d97706)',
                }}
              >
                ★ Legend ★
              </div>
            </div>
          </div>

          {/* Right: Player Legacy Info */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {/* Player Name — large, commanding */}
            <div>
              <h4 className="font-black text-[19px] text-slate-900 tracking-tight leading-tight truncate">
                {player?.name ?? 'Unknown'}
              </h4>
              {player?.jerseyNumber && (
                <span className="text-[11px] font-black text-amber-700/70 mt-0.5 block tracking-wider">
                  #{player.jerseyNumber}
                </span>
              )}
            </div>

            {/* Achievement badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-xs"
                style={{
                  color: accent,
                  background: `${accent}12`,
                  border: `1px solid ${accent}25`,
                }}
              >
                <Award className="w-3 h-3" />
                {entry.category}
              </span>
              <span className="text-[10px] font-bold text-amber-800/70 bg-amber-100/80 border border-amber-200/60 px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                <Trophy className="w-3 h-3 text-amber-500" />
                {entry.seasonText}
              </span>
            </div>

            {/* Subtitle / Achievement Quote */}
            {entry.subTitle && (
              <div className="flex items-start gap-1.5 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[12px] font-semibold text-amber-800/80 leading-snug line-clamp-2 italic">
                  "{entry.subTitle}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom: Dot indicators ──────────────────────────────────── */}
        {hallOfFame.length > 1 && (
          <div className="flex justify-center gap-1.5 pt-0.5">
            {hallOfFame.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAnimating(true);
                  setTimeout(() => { setCurrentIndex(idx); setAnimating(false); }, 200);
                }}
                className="rounded-full transition-all duration-300"
                style={{
                  width: idx === currentIndex ? 20 : 6,
                  height: 6,
                  background: idx === currentIndex
                    ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                    : '#e5d9c3',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom golden filigree line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent 5%, #d4a84420, #f59e0b50, #d4a84420, transparent 95%)' }}
      />
    </div>
  );
}
