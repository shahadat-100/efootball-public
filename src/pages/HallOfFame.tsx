import { useState, useEffect } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Avatar } from '@/shared/components';
import { Award, Crown, Sparkles } from 'lucide-react';

// Cycling accent palette — matches app theme colours
const HOF_PALETTE: { accent: string; light: string }[] = [
  { accent: '#c8102e', light: '#fff1f2' }, // Crimson
  { accent: '#3b82f6', light: '#eff6ff' }, // Royal Blue
  { accent: '#10b981', light: '#ecfdf5' }, // Emerald
  { accent: '#8b5cf6', light: '#f5f3ff' }, // Violet
  { accent: '#f59e0b', light: '#fffbeb' }, // Amber / Gold
  { accent: '#06b6d4', light: '#ecfeff' }, // Cyan
  { accent: '#f43f5e', light: '#fff1f2' }, // Rose
  { accent: '#14b8a6', light: '#f0fdfa' }, // Teal
];

export function HallOfFame() {
  const { hallOfFame, players, fetchPlayers, fetchHallOfFame } = useFootballStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchHallOfFame(), fetchPlayers()]);
      setIsLoading(false);
    };
    load();
  }, [fetchHallOfFame, fetchPlayers]);

  const getPlayer = (id: string) => players.find(p => p.id === id);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-300 space-y-4">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-border rounded-2xl overflow-hidden animate-pulse flex h-[160px]">
              <div className="w-1.5 bg-muted shrink-0" />
              <div className="flex items-center gap-4 p-5 w-full">
                <div className="w-16 h-16 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-muted rounded-full w-2/3" />
                  <div className="h-3 bg-muted rounded-full w-1/3" />
                  <div className="h-3 bg-muted rounded-full w-full" />
                  <div className="h-3 bg-muted rounded-full w-5/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border/40">
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
          <Crown className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-[26px] tracking-wide flex items-center gap-2">
            Hall of Fame
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </h2>
          <p className="text-muted-foreground text-[13px] font-medium">
            Recognizing the exceptional records and outstanding achievements of the Enigmatic Elites
          </p>
        </div>
      </div>

      {/* ── Cards Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
        {hallOfFame.map((entry, idx) => {
          const player = getPlayer(entry.playerId);
          const { accent, light } = HOF_PALETTE[idx % HOF_PALETTE.length];

          return (
            <div
              key={entry.id}
              className="group relative bg-white border border-border/70 rounded-2xl overflow-hidden
                         shadow-sm hover:-translate-y-1 transition-all duration-300 flex"
              style={{
                boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  `0 8px 32px rgba(0,0,0,0.1), 0 0 0 2px ${accent}30`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  '0 1px 6px rgba(0,0,0,0.06)';
              }}
            >
              {/* Left accent bar */}
              <div
                className="w-1.5 shrink-0 transition-all duration-300 group-hover:w-2"
                style={{ background: `linear-gradient(to bottom, ${accent}, ${accent}99)` }}
              />

              {/* Card body */}
              <div className="flex-1 p-4 sm:p-5 flex flex-col gap-3 min-w-0">

                {/* Top row: Avatar + Name + Badges */}
                <div className="flex items-center gap-3.5">

                  {/* Avatar with accent ring */}
                  <div className="relative shrink-0">
                    <div
                      className="rounded-full p-[3px] transition-all duration-300"
                      style={{ background: `linear-gradient(135deg, ${accent}, ${accent}55)` }}
                    >
                      <div className="rounded-full overflow-hidden bg-white">
                        <Avatar
                          name={player?.name ?? 'Legend'}
                          src={player?.profileImageUrl}
                          size={64}
                        />
                      </div>
                    </div>
                    {/* Award pin */}
                    <div
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center shadow-md border-2 border-white"
                      style={{ background: accent }}
                    >
                      <Award className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  {/* Name + jersey */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-[17px] text-foreground leading-tight truncate">
                      {player?.name ?? 'Unknown Legend'}
                    </h3>
                    {player?.jerseyNumber && (
                      <p className="text-[12px] font-semibold text-muted-foreground mt-0.5">
                        #{player.jerseyNumber}
                      </p>
                    )}
                  </div>

                  {/* Category + Season chips stacked */}
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors duration-300"
                      style={{ background: light, color: accent }}
                    >
                      <Award className="w-2.5 h-2.5 inline mr-1" />
                      {entry.category}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                      style={{ color: accent, borderColor: `${accent}30`, background: `${accent}08` }}
                    >
                      🏆 {entry.seasonText}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div
                  className="h-px rounded-full"
                  style={{ background: `linear-gradient(to right, ${accent}40, transparent)` }}
                />

                {/* Subtitle */}
                {entry.subTitle && (
                  <div className="flex items-start gap-2">
                    <div
                      className="w-1 rounded-full shrink-0 mt-0.5 self-stretch min-h-[14px]"
                      style={{ background: accent }}
                    />
                    <p
                      className="text-[13px] font-bold uppercase tracking-wide leading-snug"
                      style={{ color: accent }}
                    >
                      {entry.subTitle}
                    </p>
                  </div>
                )}

                {/* Description */}
                {entry.descriptions && (
                  <p
                    className="text-[12px] sm:text-[13px] leading-relaxed text-muted-foreground rounded-xl px-3 py-2.5 border"
                    style={{
                      background: light,
                      borderColor: `${accent}18`,
                    }}
                  >
                    {entry.descriptions}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {hallOfFame.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center gap-4
                          border-2 border-dashed border-border rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Crown className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No legends inducted yet</p>
              <p className="text-sm text-muted-foreground mt-1">Greatness awaits! 🏆</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
