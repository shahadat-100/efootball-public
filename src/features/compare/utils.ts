import { Player, PlayerSeasonStat } from '@/features/players/types';
import { ComputedPlayerStats } from './types';
import { calcPlayerRating } from '@/utils/playerStats';

export function aggregatePlayerStats(
  players: Player[],
  playerSeasonStats: PlayerSeasonStat[]
): ComputedPlayerStats[] {
  // 1. Calculate overall points for rank mapping using the new fair logic
  const overallMap = new Map<string, number>();
  players.forEach(p => {
    const stats = playerSeasonStats.filter(s => s.playerId === p.id);
    overallMap.set(p.id, calcPlayerRating(stats));
  });

  // 2. Determine ranks based on fair rating
  const sortedIds = Array.from(overallMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);

  // 3. Aggregate each player
  return players.map((p) => {
    const stats = playerSeasonStats.filter(s => s.playerId === p.id);
    const rank = sortedIds.indexOf(p.id) + 1;

    const matches = stats.reduce((acc, s) => acc + (s.appearances || 0), 0);
    const wins = stats.reduce((acc, s) => acc + (s.wins || 0), 0);
    const losses = stats.reduce((acc, s) => acc + (s.losses || 0), 0);
    const draws = stats.reduce((acc, s) => acc + (s.draws || 0), 0);
    const goals = stats.reduce((acc, s) => acc + (s.goals || 0), 0);
    const ga = stats.reduce((acc, s) => acc + (s.goalsConceded || 0), 0);
    const cleansheets = stats.reduce((acc, s) => acc + (s.cleansheets || 0), 0);
    const motm = stats.reduce((acc, s) => acc + (s.motmCount || 0), 0);
    const hattricks = stats.reduce((acc, s) => acc + (s.hattricks || 0), 0);
    const pts = overallMap.get(p.id) || 0;

    const shortName = p.name.split(' ').length > 1 
        ? `${p.name.split(' ')[0][0]}. ${p.name.split(' ')[1]}`
        : p.name;

    return {
      id: p.id,
      name: p.name,
      team: 'Elites',
      jerseyNumber: p.jerseyNumber || 0,
      rank: rank > 0 ? rank : 99,
      imageUrl: p.profileImageUrl || '',
      short: shortName,
      matches,
      wins,
      losses,
      draws,
      goals,
      ga,
      cleansheets,
      motm,
      hattricks,
      pts,
    };
  });
}

// Dynamically scales values based on max performance in the league to make it fair
export function getNormalizedStats(
  p: ComputedPlayerStats, 
  maxStats: {
    matches: number;
    winRate: number;
    lossRate: number;
    drawRate: number;
    goalsPerMatch: number;
    hattricksPerMatch: number;
    csRate: number;
    motmRate: number;
    ptsPerMatch: number;
    gaPerMatch: number;
  }
): number[] {
  const m = p.matches > 0 ? p.matches : 1;

  const getRatio = (val: number, max: number) => max > 0 ? Math.min(1, val / max) : 0;

  return [
    getRatio(p.matches, maxStats.matches),
    getRatio(p.wins / m, maxStats.winRate),
    getRatio(p.losses / m, maxStats.lossRate),
    getRatio(p.draws / m, maxStats.drawRate),
    getRatio(p.goals / m, maxStats.goalsPerMatch),
    getRatio(p.hattricks / m, maxStats.hattricksPerMatch),
    getRatio(p.cleansheets / m, maxStats.csRate),
    getRatio(p.motm / m, maxStats.motmRate),
    getRatio(p.pts, maxStats.ptsPerMatch), // p.pts is already their new dynamic rating
    getRatio(p.ga / m, maxStats.gaPerMatch),
  ];
}

export function getLarger(v1: number, v2: number): 0 | 1 | 2 {
  if (v1 === v2) return 0;
  return v1 > v2 ? 1 : 2;
}
