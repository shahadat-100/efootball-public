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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
        {hallOfFame.map((entry, idx) => {
          const player = getPlayer(entry.playerId);
          const { accent } = HOF_PALETTE[idx % HOF_PALETTE.length];

          return (
            <div
              key={entry.id}
              className="group relative bg-white border border-slate-100/80 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between"
              style={{
                boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  `0 20px 40px -15px ${accent}25, 0 8px 16px -6px rgba(0,0,0,0.04)`;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              {/* Subtle top subtle gradient ring blur effect */}
              <div
                className="absolute top-0 right-0 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-10 transition-opacity duration-300 group-hover:opacity-25"
                style={{ background: accent }}
              />

              {/* Card Main Header */}
              <div>
                {/* Top Chips Row */}
                <div className="flex items-center justify-between gap-2 mb-5">
                  {/* Floating Category Badge */}
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xs transition-transform group-hover:scale-105 duration-300"
                    style={{
                      color: accent,
                      background: `${accent}12`,
                      border: `1px solid ${accent}25`,
                    }}
                  >
                    <Award className="w-3.5 h-3.5 shrink-0" />
                    {entry.category}
                  </span>

                  {/* Season Badge */}
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100/80 border border-slate-200/60 px-3 py-1 rounded-full flex items-center gap-1">
                    <span>🏆</span> {entry.seasonText}
                  </span>
                </div>

                {/* Player Profile Header */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Glowing Pastel Avatar Frame */}
                  <div className="relative shrink-0">
                    <div
                      className="rounded-full p-[3px] transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${accent}, ${accent}40)`,
                      }}
                    >
                      <div className="rounded-full overflow-hidden bg-white" style={{ width: 64, height: 64 }}>
                        <Avatar
                          name={player?.name ?? 'Legend'}
                          src={player?.profileImageUrl}
                          size={64}
                        />
                      </div>
                    </div>

                    {/* Floating Crown Badge */}
                    <div
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-white"
                      style={{ background: accent }}
                    >
                      <Crown className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-lg text-slate-900 tracking-tight truncate group-hover:text-slate-950 transition-colors">
                      {player?.name ?? 'Unknown Legend'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {player?.jerseyNumber && (
                        <span
                          className="text-[11px] font-black px-2 py-0.5 rounded-md border"
                          style={{
                            color: accent,
                            background: `${accent}10`,
                            borderColor: `${accent}25`,
                          }}
                        >
                          #{player.jerseyNumber}
                        </span>
                      )}
                      {player?.playerRoles?.[0] && (
                        <span className="text-[12px] font-medium text-slate-500">
                          {player.playerRoles[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subtitle / Key Achievement */}
                {entry.subTitle && (
                  <div
                    className="rounded-2xl p-3.5 border mb-3 flex items-start gap-2.5 transition-colors duration-300"
                    style={{
                      background: `${accent}08`,
                      borderColor: `${accent}18`,
                    }}
                  >
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} />
                    <p className="text-[13px] font-bold leading-snug tracking-wide" style={{ color: accent }}>
                      {entry.subTitle}
                    </p>
                  </div>
                )}

                {/* Description */}
                {entry.descriptions && (
                  <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4">
                    <p className="text-[13px] leading-relaxed text-slate-600 font-normal">
                      {entry.descriptions}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Subtle Accent Bar */}
              <div
                className="h-1 w-full rounded-full mt-5 transition-all duration-300 opacity-40 group-hover:opacity-100"
                style={{ background: `linear-gradient(90deg, ${accent}, ${accent}30)` }}
              />
            </div>
          );
        })}

        {/* Empty state */}
        {hallOfFame.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center gap-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Crown className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">No legends inducted yet</p>
              <p className="text-sm text-slate-500 mt-1">Greatness awaits! 🏆</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
