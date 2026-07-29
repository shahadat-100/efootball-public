import { useEffect, useState } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Avatar } from '@/shared/components';
import { Award, ChevronLeft, ChevronRight, Crown, Sparkles, Trophy } from 'lucide-react';

const HOF_PALETTE: string[] = [
  '#f59e0b', // Gold
  '#ef4444', // Red
  '#3b82f6', // Blue
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
    }, 200);
  };

  // ── Empty State ──────────────────────────────────────────────────────────────
  if (hallOfFame.length === 0) {
    return (
      <div className="rounded-3xl h-full flex flex-col items-center justify-center text-center p-6 border border-amber-500/20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/40 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-amber-500/30 bg-amber-500/10 shadow-inner mb-3">
          <Crown className="w-8 h-8 text-amber-400 animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-black text-amber-400 uppercase tracking-[0.25em]">Hall of Fame</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Legendary achievements will be enshrined here</p>
        </div>
      </div>
    );
  }

  const entry = hallOfFame[currentIndex];
  const player = players.find(p => p.id === entry.playerId);
  const accent = HOF_PALETTE[currentIndex % HOF_PALETTE.length];

  return (
    <div className="relative rounded-3xl overflow-hidden h-full border border-amber-500/30 shadow-2xl transition-all duration-500 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black group">

      {/* ── Ambient Background Glows ───────────────────────────────────── */}
      <div
        className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-25 transition-all duration-700"
        style={{ background: `radial-gradient(circle, ${accent}, transparent)` }}
      />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-15"
        style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }}
      />

      {/* Subtle Grid / Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Top Gold Border Highlight */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent 5%, #f59e0b40, #f59e0b, #f59e0b40, transparent 95%)' }}
      />

      {/* ── Content Wrapper ─────────────────────────────────────────────── */}
      <div className="relative z-10 h-full flex flex-col p-5 justify-between gap-4">

        {/* ── Top Bar: Title + Nav ─────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/40 shadow-lg shadow-amber-500/5">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[12px] font-black text-amber-400 uppercase tracking-[0.2em] block leading-tight flex items-center gap-1.5">
                Hall of Fame <Sparkles className="w-3 h-3 text-amber-400/80" />
              </span>
              <span className="text-[11px] font-semibold text-zinc-400">
                Legend {currentIndex + 1} of {hallOfFame.length}
              </span>
            </div>
          </div>

          {/* Navigation controls */}
          {hallOfFame.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-amber-400 transition-all border border-zinc-800 bg-zinc-900/80 hover:bg-amber-500/10 hover:border-amber-500/40 active:scale-95 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate(1)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-amber-400 transition-all border border-zinc-800 bg-zinc-900/80 hover:bg-amber-500/10 hover:border-amber-500/40 active:scale-95 shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── Main Card Content ────────────────────────────────────────── */}
        <div
          className={`flex-1 flex items-center gap-5 transition-all duration-300 ${
            animating ? 'opacity-0 translate-y-1 scale-95' : 'opacity-100 translate-y-0 scale-100'
          }`}
        >
          {/* Avatar with Golden Trophy Badge Frame */}
          <div className="relative shrink-0">
            <div
              className="rounded-2xl p-[3px] shadow-2xl relative"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #b8860b, #78350f, #f59e0b)',
              }}
            >
              <div className="rounded-2xl overflow-hidden bg-zinc-950" style={{ width: 92, height: 92 }}>
                <Avatar name={player?.name ?? 'Legend'} src={player?.profileImageUrl} size={92} />
              </div>
            </div>

            {/* Top Crown Ribbon */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 border border-amber-200 shadow-md">
              <Crown className="w-3.5 h-3.5 text-zinc-950" />
            </div>

            {/* Bottom Ribbon */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-amber-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 shadow-md border border-amber-200">
                Legend
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
            <div>
              <h4 className="font-black text-xl text-zinc-100 tracking-tight leading-none truncate flex items-center gap-2">
                {player?.name ?? 'Unknown Legend'}
              </h4>
              {player?.jerseyNumber && (
                <span className="text-[11px] font-black text-amber-400/90 tracking-wider mt-1 block">
                  #{player.jerseyNumber}
                </span>
              )}
            </div>

            {/* Tags / Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-xl shadow-sm border"
                style={{
                  color: accent,
                  backgroundColor: `${accent}15`,
                  borderColor: `${accent}35`,
                }}
              >
                <Award className="w-3.5 h-3.5" />
                {entry.category}
              </span>
              <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                {entry.seasonText}
              </span>
            </div>

            {/* Quote / Subtitle */}
            {entry.subTitle && (
              <p className="text-[12px] font-medium text-zinc-300 italic line-clamp-2 leading-relaxed bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/60">
                "{entry.subTitle}"
              </p>
            )}
          </div>
        </div>

        {/* ── Bottom Carousel Dots ─────────────────────────────────────── */}
        {hallOfFame.length > 1 && (
          <div className="flex justify-center gap-1.5">
            {hallOfFame.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAnimating(true);
                  setTimeout(() => { setCurrentIndex(idx); setAnimating(false); }, 200);
                }}
                className="rounded-full transition-all duration-300"
                style={{
                  width: idx === currentIndex ? 24 : 6,
                  height: 6,
                  background: idx === currentIndex
                    ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                    : '#27272a',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Gold Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent 5%, #f59e0b30, #f59e0b, #f59e0b30, transparent 95%)' }}
      />
    </div>
  );
}
