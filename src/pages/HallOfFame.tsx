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
              className="group relative bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black border border-amber-500/20 rounded-2xl overflow-hidden shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              style={{
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px -5px rgba(245, 158, 11, 0.05)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  `0 15px 35px -5px rgba(0, 0, 0, 0.7), 0 0 25px 2px ${accent}40`;
                (e.currentTarget as HTMLElement).style.borderColor = `${accent}60`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px -5px rgba(245, 158, 11, 0.05)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245, 158, 11, 0.2)';
              }}
            >
              {/* Background ambient shine */}
              <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-15 transition-all duration-500 group-hover:opacity-30"
                style={{ background: accent }}
              />

              {/* Top Accent Metallic Bar */}
              <div
                className="h-1.5 w-full transition-all duration-300"
                style={{ background: `linear-gradient(90deg, ${accent}, #f59e0b, ${accent}88)` }}
              />

              {/* Card Header & Content */}
              <div className="relative z-10 p-5 flex flex-col gap-4 flex-1">
                {/* Header row: Season Chip & Category */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm"
                    style={{
                      color: accent,
                      borderColor: `${accent}40`,
                      background: `linear-gradient(135deg, ${accent}15, ${accent}05)`,
                    }}
                  >
                    <Award className="w-3 h-3 shrink-0" />
                    {entry.category}
                  </span>

                  <span className="text-[11px] font-extrabold text-amber-300/90 bg-amber-950/60 border border-amber-500/30 px-2.5 py-0.5 rounded-md tracking-wider flex items-center gap-1">
                    <span>🏆</span> {entry.seasonText}
                  </span>
                </div>

                {/* Main Player Profile Box */}
                <div className="flex items-center gap-4 my-1">
                  {/* Glowing Avatar Frame */}
                  <div className="relative shrink-0">
                    <div
                      className="rounded-full p-1 transition-all duration-300 shadow-md"
                      style={{ background: `linear-gradient(135deg, ${accent}, #f59e0b 50%, ${accent}33)` }}
                    >
                      <div className="rounded-full overflow-hidden bg-slate-950 p-0.5">
                        <Avatar
                          name={player?.name ?? 'Legend'}
                          src={player?.profileImageUrl}
                          size={64}
                        />
                      </div>
                    </div>

                    {/* Crown badge pin */}
                    <div
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-950"
                      style={{ background: `linear-gradient(135deg, ${accent}, #d97706)` }}
                    >
                      <Crown className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  {/* Player info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg text-white tracking-tight truncate group-hover:text-amber-300 transition-colors">
                      {player?.name ?? 'Unknown Legend'}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {player?.jerseyNumber && (
                        <span className="text-[11px] font-bold text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          #{player.jerseyNumber}
                        </span>
                      )}
                      {player?.primaryRole && (
                        <span className="text-[12px] font-semibold text-slate-400">
                          {player.primaryRole}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subtitle / Achievement highlight */}
                {entry.subTitle && (
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[13px] font-bold text-amber-200/90 leading-snug tracking-wide">
                      {entry.subTitle}
                    </p>
                  </div>
                )}

                {/* Description */}
                {entry.descriptions && (
                  <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5 mt-auto">
                    <p className="text-[12px] leading-relaxed text-slate-300 font-normal">
                      {entry.descriptions}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Card Accent Footer */}
              <div
                className="h-[2px] w-full opacity-60 group-hover:opacity-100 transition-all duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
              />
            </div>
          );
        })}

        {/* Empty state */}
        {hallOfFame.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center gap-4
                          border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/50">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Crown className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-white">No legends inducted yet</p>
              <p className="text-sm text-slate-400 mt-1">Greatness awaits! 🏆</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
