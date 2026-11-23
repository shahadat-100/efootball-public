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

const SLIDE_MS = 4500;

const POSTER_IMAGE = '/images/hero-player-bg.png';
const HERO_BACKGROUND = 'radial-gradient(circle at 50% 20%, #2a2b33 0%, #17181d 45%, #0d0d10 100%)';
const FADE_COLOR = '#0d0d10';

function sum(stats: PlayerSeasonStat[], key: keyof PlayerSeasonStat): number {
  return stats.reduce((total, stat) => total + (Number(stat[key]) || 0), 0);
}

function Cutout({ player, small }: { player: Player; small: boolean }) {
  const [failed, setFailed] = useState(false);
  const src = player.coverImageUrl || player.profileImageUrl;

  if (!src || failed) {
    return (
      <div
        className="relative z-10 flex h-[86%] items-end justify-center font-heading text-[8rem] font-black leading-none text-white/10"
        aria-hidden
      >
        {player.name?.charAt(0) ?? '?'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={player.name}
      draggable={false}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`relative z-10 h-[92%] w-auto max-w-full select-none object-contain object-bottom ${small ? 'pointer-events-none' : ''}`}
    />
  );
}

export function PlayerHighlightHero({ players, playerSeasonStats }: PlayerHighlightHeroProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const items = useMemo<HighlightItem[]>(() => {
    // Only include players who have photos/cutouts to keep the hero showcase clean and save egress
    const playersWithPhoto = players.filter((p) => Boolean(p.coverImageUrl || p.profileImageUrl));
    const sourceList = playersWithPhoto.length > 0 ? playersWithPhoto : players;

    return [...sourceList]
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
  }, [players, playerSeasonStats]);

  const total = items.length;

  useEffect(() => {
    if (paused || total < 2) return;
    const timer = window.setTimeout(() => setActive((current) => (current + 1) % total), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [active, paused, total]);

  // Shortest signed offset so the wrap-around still slides smoothly.
  const relativeOffset = (index: number) => {
    if (total === 0) return 0;
    let offset = index - active;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    return offset;
  };

  const positionFor = (offset: number) => {
    const base = { left: '50%', scale: 0.6, opacity: 0, blur: 3, zIndex: 5, pointerEvents: 'none' as const };
    // Middle player in exact center
    if (offset === 0) return { ...base, left: '50%', scale: 1, opacity: 1, blur: 0, zIndex: 30, pointerEvents: 'auto' as const };
    // Left player: 1 on left
    if (offset === -1) return { ...base, left: '16%', scale: 0.72, opacity: 0.45, blur: 1, zIndex: 20, pointerEvents: 'auto' as const };
    // Right player: 1 on right
    if (offset === 1) return { ...base, left: '84%', scale: 0.72, opacity: 0.45, blur: 1, zIndex: 20, pointerEvents: 'auto' as const };
    return base;
  };

  const current = items[active];

  return (
    <section
      className="relative mb-8 h-[300px] w-full overflow-hidden rounded-3xl shadow-2xl md:h-[380px] lg:h-[460px]"
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

      {/* ── 70% : player carousel ── */}
      <div className="relative h-full w-full overflow-hidden lg:w-[70%]">
        {/* The poster, centered with the middle player so 'THE' is on left, 'ELITE' is on right */}
        <img
          src={POSTER_IMAGE}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[160%] md:h-[175%] lg:h-[190%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-90 select-none"
        />
        {items.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-sm uppercase tracking-[0.3em] text-white/30">
            Loading players…
          </p>
        )}

        {items.map((item, index) => {
          const offset = relativeOffset(index);
          // Exactly 3 players: Middle (0), Left (-1), Right (1)
          if (Math.abs(offset) > 1) return null;

          const pos = positionFor(offset);
          return (
            <motion.div
              key={item.player.id}
              className="absolute bottom-0 top-0 flex w-[44%] sm:w-[40%] -translate-x-1/2 items-end justify-center"
              style={{ left: pos.left, zIndex: pos.zIndex, pointerEvents: pos.pointerEvents }}
              animate={{
                scale: pos.scale,
                opacity: pos.opacity,
                filter: reduceMotion ? 'blur(0px)' : `blur(${pos.blur}px)`,
              }}
              transition={{ duration: reduceMotion ? 0.2 : 0.75, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => offset !== 0 && setActive(index)}
              role={offset === 0 ? undefined : 'button'}
              aria-label={offset === 0 ? undefined : `Show ${item.player.name}`}
            >
              {/* ground shadow — behind the cutout */}
              <div
                className="absolute bottom-[7%] left-1/2 h-[7%] w-[62%] -translate-x-1/2 rounded-full bg-black/60 blur-xl"
                style={{ opacity: reduceMotion ? 0.4 : pos.opacity }}
                aria-hidden
              />
              <Cutout player={item.player} small={offset !== 0} />
              {/* bottom fade — attached to each cutout, blends into the fixed background */}
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-[16%]"
                style={{ background: `linear-gradient(to bottom, transparent, ${FADE_COLOR})`, opacity: pos.opacity }}
                aria-hidden
              />
            </motion.div>
          );
        })}

        {/* controls */}
      </div>

      {/* ── 30% : highlight box (desktop only) ── */}
      <aside className="absolute inset-y-0 right-0 hidden w-[30%] flex-col justify-center border-l border-white/10 bg-black/25 px-8 backdrop-blur-sm lg:flex">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/40">Player Highlight</p>
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.player.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: reduceMotion ? 0.15 : 0.35, ease: 'easeOut' }}
            >
              <h2 className="font-heading text-4xl font-black uppercase leading-none text-white xl:text-5xl">
                {current.player.name}
              </h2>
              <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7">
                {[
                  { label: 'Wins', value: current.wins },
                  { label: 'Goals', value: current.goals },
                  { label: 'Matches', value: current.matches },
                  { label: 'Win Rate', value: current.winRate === null ? '—' : `${current.winRate}%` },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-heading text-3xl font-bold text-white xl:text-4xl">{stat.value}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/40">{stat.label}</p>
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
