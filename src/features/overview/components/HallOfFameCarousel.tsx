import { useEffect, useState } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Avatar } from '@/shared/components';
import { Award, ChevronLeft, ChevronRight, Crown, Sparkles, Trophy } from 'lucide-react';

// Cycling accent palette — same family used on the Hall of Fame tab page,
// brand crimson first so the carousel still reads as "this club's" trophy case.
const HOF_PALETTE: string[] = [
  '#c8102e', // Crimson (brand primary)
  '#f59e0b', // Gold
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

  // ── Empty State ──────────────────────────────────────────────────────────
  if (hallOfFame.length === 0) {
    return (
      <div className="rounded-2xl h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border bg-muted/20 relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-amber-500/30 bg-amber-500/10 shadow-inner mb-3">
          <Crown className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-black text-foreground uppercase tracking-[0.25em]">Hall of Fame</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Legendary achievements will be enshrined here</p>
        </div>
      </div>
    );
  }

  const entry = hallOfFame[currentIndex];
  const player = players.find(p => p.id === entry.playerId);
  const accent = HOF_PALETTE[currentIndex % HOF_PALETTE.length];

  return (
    <div className="relative rounded-2xl overflow-hidden h-full border border-border shadow-sm transition-all duration-500 bg-card group">

      {/* ── Ambient accent glows — same "atmosphere" trick as the gallery cards, tuned for a white card ── */}
      <div
        className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-70 transition-all duration-700"
        style={{ background: `radial-gradient(circle, ${accent}1a, transparent)` }}
      />
      <div
        className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(circle, #f59e0b14, transparent)' }}
      />

      {/* Giant faint watermark word — the gallery cards' signature move, ported to light mode */}
      <div
        className="absolute inset-x-0 bottom-2 text-center font-heading font-black leading-none select-none pointer-events-none whitespace-nowrap"
        style={{ fontSize: 96, color: `${accent}0d`, letterSpacing: 2 }}
      >
        LEGEND
      </div>

      {/* Subtle dot-grid texture for that "sports card" surface */}
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(#00000008_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Top foil accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, transparent 5%, ${accent}30, ${accent}, ${accent}30, transparent 95%)` }}
      />

      {/* ── Content Wrapper ─────────────────────────────────────────────── */}
      <div className="relative z-10 h-full flex flex-col p-5 justify-between gap-4">

        {/* ── Top Bar: Title + Nav ─────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/15 border border-amber-500/30 shadow-sm shrink-0">
              <Crown className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <span className="text-[12px] font-black text-foreground uppercase tracking-[0.2em] block leading-tight flex items-center gap-1.5">
                Hall of Fame <Sparkles className="w-3 h-3 text-amber-500/80" />
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                Legend {currentIndex + 1} of {hallOfFame.length}
              </span>
            </div>
          </div>

          {/* Navigation controls */}
          {hallOfFame.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all border border-border active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate(1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all border border-border active:scale-95"
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
          {/* Avatar with Gradient Ring + Crown Badge — same motif as the gallery cards' hero avatar */}
          <div className="relative shrink-0">
            <div
              className="rounded-2xl p-[3px] shadow-lg relative"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}80, ${accent}30)` }}
            >
              <div className="rounded-2xl overflow-hidden bg-background" style={{ width: 92, height: 92 }}>
                <Avatar name={player?.name ?? 'Legend'} src={player?.profileImageUrl} size={92} />
              </div>
            </div>

            {/* Top Crown Ribbon */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 border-2 border-white shadow-md">
              <Crown className="w-3.5 h-3.5 text-amber-950" />
            </div>

            {/* Bottom "Legend" Ribbon */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-amber-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 shadow-sm border border-amber-200">
                Legend
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
            <div>
              <h4 className="font-heading font-black text-xl text-foreground tracking-tight leading-none truncate">
                {player?.name ?? 'Unknown Legend'}
              </h4>
              {player?.jerseyNumber && (
                <span className="text-[11px] font-black tracking-wider mt-1 block" style={{ color: accent }}>
                  #{player.jerseyNumber}
                </span>
              )}
            </div>

            {/* Tags / Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-xl shadow-sm border"
                style={{ color: accent, backgroundColor: `${accent}12`, borderColor: `${accent}35` }}
              >
                <Award className="w-3.5 h-3.5" />
                {entry.category}
              </span>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                {entry.seasonText}
              </span>
            </div>

            {/* Quote / Subtitle */}
            {entry.subTitle && (
              <p className="text-[12px] font-medium text-muted-foreground italic line-clamp-2 leading-relaxed bg-muted/50 p-2 rounded-xl border border-border">
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
                    ? `linear-gradient(90deg, ${accent}, ${accent}cc)`
                    : '#e5e7eb',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom foil accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent 5%, ${accent}25, ${accent}, ${accent}25, transparent 95%)` }}
      />
    </div>
  );
}
