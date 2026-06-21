import { PlayerSeasonStat } from '@/features/players/types';

/**
 * Calculates a fair, unquestionable performance rating for a player based on their season stats.
 * It uses Option B: (Wins*3 + Draws*1 + Goals*1 + CleanSheets*1 + MOTM*2) / Matches Played.
 * It also applies a reliability penalty for players with fewer than 100 matches.
 * 
 * @param stats Array of PlayerSeasonStat objects for the player.
 * @returns A normalized rating score.
 */
export const calcPlayerRating = (stats: PlayerSeasonStat[] | undefined | null): number => {
  if (!stats || stats.length === 0) return 0;

  const totalMatches = stats.reduce((acc, s) => acc + (s.appearances || 0), 0);
  if (totalMatches === 0) return 0;

  const totalWins = stats.reduce((acc, s) => acc + (s.wins || 0), 0);
  const totalDraws = stats.reduce((acc, s) => acc + (s.draws || 0), 0);
  const totalGoals = stats.reduce((acc, s) => acc + (s.goals || 0), 0);
  const totalCleanSheets = stats.reduce((acc, s) => acc + (s.cleansheets || 0), 0);
  const totalMOTM = stats.reduce((acc, s) => acc + (s.motmCount || 0), 0);

  // Raw Individual Performance Rating Per Game
  const rawRatingPerGame = (
    (totalWins * 3) + 
    (totalDraws * 1) + 
    (totalGoals * 1) + 
    (totalCleanSheets * 1) + 
    (totalMOTM * 2)
  ) / totalMatches;

  // Reliability Factor: Must have 100+ matches for full score. 
  // Linearly scales down if fewer matches (e.g., 50 matches = 50% of their actual rating).
  // This makes it 100% fair and stops 1-match wonders from being #1.
  const reliabilityFactor = Math.min(1, totalMatches / 100);

  return rawRatingPerGame * reliabilityFactor;
};

/**
 * Calculates total raw points across seasons (if still needed for legacy UI).
 */
export const calcTotalRawPoints = (stats: PlayerSeasonStat[] | undefined | null): number => {
  if (!stats || stats.length === 0) return 0;
  return stats.reduce((total, s) =>
    total + (s.wins * 3) + s.draws - s.losses + s.goals - s.goalsConceded + (s.motmCount * 2) + s.hattricks
  , 0);
};
