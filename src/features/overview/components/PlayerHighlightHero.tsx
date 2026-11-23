import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Player, PlayerSeasonStat } from '@/features/players/types';

interface PlayerHighlightHeroProps {
  players: Player[];
  playerSeasonStats: PlayerSeasonStat[];
}

interface HighlightItem {
  player: Player;
  wins: number;
  goals: number;
  matches: number;
  winRate: number | null;
}

const SLIDE_MS = 1500;

const POSTER_IMAGE = '/images/hero-player-bg.png';
const HERO_BACKGROUND = 'radial-gradient(circle at 50% 20%, #2a2b33 0%, #17181d 45%, #0d0d10 100%)';
const FADE_COLOR = '#0d0d10';

const isValidImageUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed.length < 5) return false;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/');
};

function sum(stats: PlayerSeasonStat[], key: keyof PlayerSeasonStat): number {
  return stats.reduce((total, stat) => total + (Number(stat[key]) || 0), 0);
}

export function PlayerHighlightHero({ players, playerSeasonStats }: PlayerHighlightHeroProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
  const reduceMotion = useReducedMotion();

  const items = useMemo<HighlightItem[]>(() => {
    // STRICT: Only players who have a valid, working image URL
    const playersWithPhoto = players.filter(
      (p) => isValidImageUrl(p.profileImageUrl) && !failedIds.has(p.id)
    );

    return playersWithPhoto
      .sort((a, b) => (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999) || a.name.localeCompare(b.name))
      .map((player) => {
        const stats = playerSeasonStats.filter((stat) => stat.playerId === player.id);
        const wins = sum(stats, 'wins');
        const draws = sum(stats, 'draws');
        const losses = sum(stats, 'losses');
        const played = wins + draws + losses;
        return {
          player,
          wins,
          goals: sum(stats, 'goals'),
          matches: sum(stats, 'appearances') || played,
          winRate: played > 0 ? Math.round((wins / played) * 100) : null,
        };
      });
  }, [players, playerSeasonStats, failedIds]);

  const total = items.length;

  useEffect(() => {
    if (paused || total < 2) return;
    const timer = window.setTimeout(() => setActive((current) => (current + 1) % total), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [active, paused, total]);

  const current = items[active];

  return (
    <section
      className="relative mb-8 h-[320px] sm:h-[380px] md:h-[420px] lg:h-[460px] w-full overflow-hidden rounded-3xl shadow-2xl flex flex-row"
      style={{ background: HERO_BACKGROUND }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-label="Player highlight"
    >
      {/* blurred, enlarged copy of the same poster as a backdrop */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${POSTER_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(28px) brightness(0.45) saturate(1.2)',
          transform: 'scale(1.15)',
        }}
        aria-hidden
      />
      {/* dark veil so the cutouts stay readable */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/40 via-black/10 to-[#0d0d10]" aria-hidden />

      {/* ── 70% : Single Player Spotlight Stage ── */}
      <div className="relative h-full w-[70%] overflow-hidden z-10 flex items-center justify-center">
        {/* The 1587x2245 poster, perfectly centered */}
        <img
          src={POSTER_IMAGE}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-full sm:h-[110%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-95 select-none"
        />

        {items.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-sm uppercase tracking-[0.3em] text-white/30 z-10">
            Loading players…
          </p>
        )}

        {/* Exactly 1 Single Player at a time, perfectly centered in the gap of 'THE ELITE' */}
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.player.id}
              className="absolute inset-0 flex items-end justify-center z-10 pointer-events-none select-none"
              initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.04 }}
              transition={{ duration: reduceMotion ? 0.15 : 0.3, ease: 'easeOut' }}
            >
              {/* Ground shadow under the player */}
              <div
                className="absolute bottom-[4%] left-1/2 h-[6%] w-[55%] -translate-x-1/2 rounded-full bg-black/70 blur-xl"
                aria-hidden
              />

              {/* Player cutout image container — h-[88%] guarantees plenty of headroom, head never gets cut off */}
              <div className="relative z-10 h-[88%] w-auto max-w-[85%] flex items-end justify-center">
                <img
                  src={current.player.profileImageUrl}
                  alt={current.player.name}
                  draggable={false}
                  loading="eager"
                  decoding="async"
                  onError={() => {
                    setFailedIds((prev) => new Set(prev).add(current.player.id));
                  }}
                  className="h-full w-auto max-w-full object-contain object-bottom select-none"
                />
              </div>

              {/* Bottom fade — blends legs smoothly into bottom edge */}
              <div
                className="pointer-events-none absolute bottom-0 inset-x-0 h-[16%]"
                style={{ background: `linear-gradient(to bottom, transparent, ${FADE_COLOR})` }}
                aria-hidden
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 30% : Highlight Details Box ── */}
      <aside className="relative flex w-[30%] h-full flex-col justify-center border-l border-white/10 bg-black/30 px-3 sm:px-5 lg:px-8 backdrop-blur-sm z-20">
        <p className="mb-1 sm:mb-3 text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.25em] sm:tracking-[0.35em] text-white/40">
          Player Highlight
        </p>
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.player.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: reduceMotion ? 0.15 : 0.35, ease: 'easeOut' }}
            >
              <h2 className="font-heading text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black uppercase leading-tight text-white line-clamp-3 break-words">
                {current.player.name}
              </h2>
              <div className="mt-3 sm:mt-5 md:mt-7 grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-3 sm:gap-y-6">
                {[
                  { label: 'Wins', value: current.wins },
                  { label: 'Goals', value: current.goals },
                  { label: 'Matches', value: current.matches },
                  { label: 'Win Rate', value: current.winRate === null ? '—' : `${current.winRate}%` },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-heading text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white leading-none">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[8px] sm:text-[9px] lg:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-white/40">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </section>
  );
}
