import { Player, PlayerSeasonStat } from '@/features/players/types';
import { ComputedPlayerStats } from './types';

// Points from aggregated season stats (for Overall)
const calcSeasonPoints = (stats: PlayerSeasonStat[]): number =>
  stats.reduce((total, s) =>
    total + (s.wins * 3) + s.draws - s.losses + s.goals - s.goalsConceded + (s.motmCount * 2) + s.hattricks
  , 0);

export function aggregatePlayerStats(
  players: Player[],
  playerSeasonStats: PlayerSeasonStat[]
): ComputedPlayerStats[] {
  // 1. Calculate overall points for rank mapping
  const overallMap = new Map<string, number>();
  players.forEach(p => {
    const stats = playerSeasonStats.filter(s => s.playerId === p.id);
    overallMap.set(p.id, calcSeasonPoints(stats));
  });

  // 2. Determine ranks
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

// Normalized Data for Radar Chart
export function getNormalizedStats(p: ComputedPlayerStats): number[] {
  const m = p.matches > 0 ? p.matches : 1;

  // matches (÷ 40)
  // win rate (wins/m)
  // loss rate (losses/m)
  // draw rate (draws/m)
  // goals/m (÷ 3)
  // hattricks/m (÷ 0.5)
  // cs rate (cleansheets/m)
  // motm rate (motm/m)
  // pts/m (÷ 3)
  // ga/m (÷ 3)
  
  return [
    Math.min(1, p.matches / 40),
    Math.min(1, p.wins / m),
    Math.min(1, p.losses / m),
    Math.min(1, p.draws / m),
    Math.min(1, (p.goals / m) / 3),
    Math.min(1, (p.hattricks / m) / 0.5),
    Math.min(1, p.cleansheets / m),
    Math.min(1, p.motm / m),
    Math.min(1, (p.pts / m) / 3),
    Math.min(1, (p.ga / m) / 3),
  ];
}

export function getLarger(v1: number, v2: number): 0 | 1 | 2 {
  if (v1 === v2) return 0;
  return v1 > v2 ? 1 : 2;
}
