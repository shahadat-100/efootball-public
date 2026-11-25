import { Player } from '@/features/players/types';
import { MatchEntry } from '@/features/match-entries/types';
import { PlayerMonthlyStat, PlayerWeeklyStat } from '@/store/footballStore';

export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export const MONTHS_SHORT = [
  'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
];

export interface RawStatValues {
  wins: number;
  draws: number;
  losses: number;
  goals: number;
  goalsConceded: number;
  hattricks: number;
  motmCount: number;
}

export function calcPoints(s: RawStatValues): number {
  return (
    (s.wins * 10) +
    (s.draws * 5) -
    (s.losses * 3) +
    s.goals -
    s.goalsConceded +
    (s.motmCount * 4) +
    s.hattricks
  );
}

/**
 * Calculates 1-indexed week of month (1 to 4):
 * Day 1-7: Week 1
 * Day 8-14: Week 2
 * Day 15-21: Week 3
 * Day 22+: Week 4
 */
export function getWeekNumber(dateInput: string | Date): number {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return 1;
  const day = d.getDate();
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4;
}

export interface WeeklyPeriod {
  year: number;
  monthIndex: number;
  week: number;
  label: string;
}

export interface MonthlyPeriod {
  year: number;
  monthIndex: number;
  label: string;
}

/**
 * Finds the latest weekly period with active matches or stats.
 * If the current calendar week has data, uses it.
 * Otherwise falls back to the most recent week in DB that has active data.
 */
export function findLatestWeeklyPeriod(
  playerWeeklyStats: PlayerWeeklyStat[] = [],
  matchEntries: MatchEntry[] = []
): WeeklyPeriod {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIndex = today.getMonth();
  const currentWeek = getWeekNumber(today);

  // Check if current calendar week has any active data
  const hasCurrentWeeklyStats = playerWeeklyStats.some(
    s =>
      Number(s.year) === currentYear &&
      Number(s.monthIndex) === currentMonthIndex &&
      Number(s.week) === currentWeek &&
      (s.appearances > 0 || (s.wins + s.draws + s.losses) > 0 || s.goals > 0)
  );

  const hasCurrentEntries = matchEntries.some(e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    return (
      !isNaN(d.getTime()) &&
      d.getFullYear() === currentYear &&
      d.getMonth() === currentMonthIndex &&
      getWeekNumber(d) === currentWeek
    );
  });

  if (hasCurrentWeeklyStats || hasCurrentEntries) {
    return {
      year: currentYear,
      monthIndex: currentMonthIndex,
      week: currentWeek,
      label: `Week ${currentWeek} · ${MONTHS[currentMonthIndex]} ${currentYear}`,
    };
  }

  // Find the newest period in playerWeeklyStats with data
  const activeWeeklyStats = playerWeeklyStats
    .filter(s => (s.appearances > 0 || (s.wins + s.draws + s.losses) > 0 || s.goals > 0))
    .slice()
    .sort((a, b) => {
      if (Number(a.year) !== Number(b.year)) return Number(b.year) - Number(a.year);
      if (Number(a.monthIndex) !== Number(b.monthIndex)) return Number(b.monthIndex) - Number(a.monthIndex);
      return Number(b.week) - Number(a.week);
    });

  if (activeWeeklyStats.length > 0) {
    const latest = activeWeeklyStats[0];
    return {
      year: Number(latest.year),
      monthIndex: Number(latest.monthIndex),
      week: Number(latest.week),
      label: `Week ${latest.week} · ${MONTHS[latest.monthIndex]} ${latest.year}`,
    };
  }

  // Check matchEntries if playerWeeklyStats is empty
  const validEntries = matchEntries
    .map(e => (e.date ? new Date(e.date) : null))
    .filter((d): d is Date => d !== null && !isNaN(d.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  if (validEntries.length > 0) {
    const latestDate = validEntries[0];
    const y = latestDate.getFullYear();
    const m = latestDate.getMonth();
    const w = getWeekNumber(latestDate);
    return {
      year: y,
      monthIndex: m,
      week: w,
      label: `Week ${w} · ${MONTHS[m]} ${y}`,
    };
  }

  return {
    year: currentYear,
    monthIndex: currentMonthIndex,
    week: currentWeek,
    label: `Week ${currentWeek} · ${MONTHS[currentMonthIndex]} ${currentYear}`,
  };
}

/**
 * Finds the latest monthly period with active matches or stats.
 */
export function findLatestMonthlyPeriod(
  playerMonthlyStats: PlayerMonthlyStat[] = [],
  matchEntries: MatchEntry[] = []
): MonthlyPeriod {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIndex = today.getMonth();

  const hasCurrentMonthlyStats = playerMonthlyStats.some(
    s =>
      Number(s.year) === currentYear &&
      Number(s.monthIndex) === currentMonthIndex &&
      (s.appearances > 0 || (s.wins + s.draws + s.losses) > 0 || s.goals > 0)
  );

  const hasCurrentEntries = matchEntries.some(e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    return !isNaN(d.getTime()) && d.getFullYear() === currentYear && d.getMonth() === currentMonthIndex;
  });

  if (hasCurrentMonthlyStats || hasCurrentEntries) {
    return {
      year: currentYear,
      monthIndex: currentMonthIndex,
      label: `${MONTHS[currentMonthIndex]} ${currentYear}`,
    };
  }

  const activeMonthlyStats = playerMonthlyStats
    .filter(s => (s.appearances > 0 || (s.wins + s.draws + s.losses) > 0 || s.goals > 0))
    .slice()
    .sort((a, b) => {
      if (Number(a.year) !== Number(b.year)) return Number(b.year) - Number(a.year);
      return Number(b.monthIndex) - Number(a.monthIndex);
    });

  if (activeMonthlyStats.length > 0) {
    const latest = activeMonthlyStats[0];
    return {
      year: Number(latest.year),
      monthIndex: Number(latest.monthIndex),
      label: `${MONTHS[latest.monthIndex]} ${latest.year}`,
    };
  }

  const validEntries = matchEntries
    .map(e => (e.date ? new Date(e.date) : null))
    .filter((d): d is Date => d !== null && !isNaN(d.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  if (validEntries.length > 0) {
    const latestDate = validEntries[0];
    const y = latestDate.getFullYear();
    const m = latestDate.getMonth();
    return {
      year: y,
      monthIndex: m,
      label: `${MONTHS[m]} ${y}`,
    };
  }

  return {
    year: currentYear,
    monthIndex: currentMonthIndex,
    label: `${MONTHS[currentMonthIndex]} ${currentYear}`,
  };
}

export interface AggregatedPlayerStat {
  player: Player;
  points: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  gf: number;
  gc: number;
  cs: number;
  ht: number;
  motm: number;
}

/**
 * Aggregates weekly stats across playerWeeklyStats and fallback matchEntries consistently for all players.
 */
export function getAggregatedWeeklyPlayerStats(
  players: Player[],
  playerWeeklyStats: PlayerWeeklyStat[],
  matchEntries: MatchEntry[],
  period: { year: number; monthIndex: number; week: number; seasonId?: number | null }
): AggregatedPlayerStat[] {
  const statsInPeriod = playerWeeklyStats.filter(s =>
    Number(s.year) === period.year &&
    Number(s.monthIndex) === period.monthIndex &&
    Number(s.week) === period.week &&
    (period.seasonId != null ? s.seasonId === period.seasonId : true)
  );

  const hasDbStats = statsInPeriod.some(
    s => s.appearances > 0 || (s.wins + s.draws + s.losses) > 0 || s.goals > 0
  );

  if (hasDbStats) {
    return players.map(p => {
      const s = statsInPeriod.filter(x => x.playerId === p.id);
      const wins = s.reduce((t, x) => t + (x.wins || 0), 0);
      const draws = s.reduce((t, x) => t + (x.draws || 0), 0);
      const losses = s.reduce((t, x) => t + (x.losses || 0), 0);
      const gf = s.reduce((t, x) => t + (x.goals || 0), 0);
      const gc = s.reduce((t, x) => t + (x.goalsConceded || 0), 0);
      const cs = s.reduce((t, x) => t + (x.cleansheets || 0), 0);
      const ht = s.reduce((t, x) => t + (x.hattricks || 0), 0);
      const motm = s.reduce((t, x) => t + (x.motmCount || 0), 0);
      const matches =
        s.reduce((t, x) => t + (x.appearances || (x.wins + x.draws + x.losses) || 0), 0) ||
        (wins + draws + losses);
      const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
      const points = calcPoints({
        wins, draws, losses, goals: gf, goalsConceded: gc, hattricks: ht, motmCount: motm,
      });
      return { player: p, points, matches, wins, draws, losses, winRate, gf, gc, cs, ht, motm };
    });
  }

  // Fallback to matchEntries
  const entriesInPeriod = matchEntries.filter(e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    if (isNaN(d.getTime())) return false;
    const yearMatch = d.getFullYear() === period.year;
    const monthMatch = d.getMonth() === period.monthIndex;
    const weekMatch = getWeekNumber(d) === period.week;
    const seasonMatch = period.seasonId != null ? e.seasonId === period.seasonId : true;
    return yearMatch && monthMatch && weekMatch && seasonMatch;
  });

  return players.map(p => {
    const pEntries = entriesInPeriod.filter(e => e.playerId === p.id);
    const wins = pEntries.filter(e => e.result === 'win').length;
    const draws = pEntries.filter(e => e.result === 'draw').length;
    const losses = pEntries.filter(e => e.result === 'loss').length;
    const gf = pEntries.reduce((t, e) => t + (e.goals || 0), 0);
    const gc = pEntries.reduce((t, e) => t + (e.goalsConceded || 0), 0);
    const cs = pEntries.filter(e => e.cleanSheet).length;
    const ht = pEntries.reduce((t, e) => t + (e.hattricks || 0), 0);
    const motm = pEntries.filter(e => e.motm).length;
    const matches = wins + draws + losses;
    const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
    const points = calcPoints({
      wins, draws, losses, goals: gf, goalsConceded: gc, hattricks: ht, motmCount: motm,
    });
    return { player: p, points, matches, wins, draws, losses, winRate, gf, gc, cs, ht, motm };
  });
}

/**
 * Aggregates monthly stats across playerMonthlyStats and fallback matchEntries consistently for all players.
 */
export function getAggregatedMonthlyPlayerStats(
  players: Player[],
  playerMonthlyStats: PlayerMonthlyStat[],
  matchEntries: MatchEntry[],
  period: { year: number; monthIndex: number; seasonId?: number | null }
): AggregatedPlayerStat[] {
  const statsInPeriod = playerMonthlyStats.filter(s =>
    Number(s.year) === period.year &&
    Number(s.monthIndex) === period.monthIndex &&
    (period.seasonId != null ? s.seasonId === period.seasonId : true)
  );

  const hasDbStats = statsInPeriod.some(
    s => s.appearances > 0 || (s.wins + s.draws + s.losses) > 0 || s.goals > 0
  );

  if (hasDbStats) {
    return players.map(p => {
      const s = statsInPeriod.filter(x => x.playerId === p.id);
      const wins = s.reduce((t, x) => t + (x.wins || 0), 0);
      const draws = s.reduce((t, x) => t + (x.draws || 0), 0);
      const losses = s.reduce((t, x) => t + (x.losses || 0), 0);
      const gf = s.reduce((t, x) => t + (x.goals || 0), 0);
      const gc = s.reduce((t, x) => t + (x.goalsConceded || 0), 0);
      const cs = s.reduce((t, x) => t + (x.cleansheets || 0), 0);
      const ht = s.reduce((t, x) => t + (x.hattricks || 0), 0);
      const motm = s.reduce((t, x) => t + (x.motmCount || 0), 0);
      const matches =
        s.reduce((t, x) => t + (x.appearances || (x.wins + x.draws + x.losses) || 0), 0) ||
        (wins + draws + losses);
      const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
      const points = calcPoints({
        wins, draws, losses, goals: gf, goalsConceded: gc, hattricks: ht, motmCount: motm,
      });
      return { player: p, points, matches, wins, draws, losses, winRate, gf, gc, cs, ht, motm };
    });
  }

  // Fallback to matchEntries
  const entriesInPeriod = matchEntries.filter(e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    if (isNaN(d.getTime())) return false;
    const yearMatch = d.getFullYear() === period.year;
    const monthMatch = d.getMonth() === period.monthIndex;
    const seasonMatch = period.seasonId != null ? e.seasonId === period.seasonId : true;
    return yearMatch && monthMatch && seasonMatch;
  });

  return players.map(p => {
    const pEntries = entriesInPeriod.filter(e => e.playerId === p.id);
    const wins = pEntries.filter(e => e.result === 'win').length;
    const draws = pEntries.filter(e => e.result === 'draw').length;
    const losses = pEntries.filter(e => e.result === 'loss').length;
    const gf = pEntries.reduce((t, e) => t + (e.goals || 0), 0);
    const gc = pEntries.reduce((t, e) => t + (e.goalsConceded || 0), 0);
    const cs = pEntries.filter(e => e.cleanSheet).length;
    const ht = pEntries.reduce((t, e) => t + (e.hattricks || 0), 0);
    const motm = pEntries.filter(e => e.motm).length;
    const matches = wins + draws + losses;
    const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
    const points = calcPoints({
      wins, draws, losses, goals: gf, goalsConceded: gc, hattricks: ht, motmCount: motm,
    });
    return { player: p, points, matches, wins, draws, losses, winRate, gf, gc, cs, ht, motm };
  });
}
