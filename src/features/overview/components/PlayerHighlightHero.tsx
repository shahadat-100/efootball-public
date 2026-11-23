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

const SLIDE_MS = 2000;

const POSTER_IMAGE = '/images/hero-player-bg.jpg?v=3';
const HERO_BACKGROUND = '#0d0d10';

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
      className="relative w-full aspect-[2/1] overflow-hidden rounded-none shadow-none flex items-center justify-center"
      style={{ background: HERO_BACKGROUND }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-label="Player highlight"
    >
      {/* Full 100% Background Artwork (matches 2:1 aspect ratio, so nothing gets cut off) */}
      <img
        src={POSTER_IMAGE}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center select-none"
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
            {/* Player cutout image container — bigger size, moved down, NO shadows */}
            <div className="relative z-10 h-[104%] sm:h-[110%] w-auto max-w-[85%] sm:max-w-[70%] flex items-end justify-center translate-y-[5%] sm:translate-y-[7%]">
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
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
