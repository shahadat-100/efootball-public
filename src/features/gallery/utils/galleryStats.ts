import { Player, PlayerSeasonStat } from '@/features/players/types';
import { PlayerMonthlyStat, PlayerWeeklyStat } from '@/store/footballStore';

// ── Points formula (matches existing app logic) ────────────────────────────
const calcPoints = (s: {
  wins: number; draws: number; losses: number;
  goals: number; goalsConceded: number;
  hattricks: number; motmCount: number;
}) =>
  (s.wins * 10) + (s.draws * 5) - (s.losses * 3) +
  s.goals - s.goalsConceded + (s.motmCount * 4) + s.hattricks;

// ── Current time helpers ───────────────────────────────────────────────────
function getCurrentPeriod() {
  const today = new Date();
  const year = today.getFullYear();
  const monthIndex = today.getMonth();
  const day = today.getDate();
  let week = 1;
  if (day >= 8 && day <= 14) week = 2;
  else if (day >= 15 && day <= 21) week = 3;
  else if (day >= 22) week = 4;
  return { year, monthIndex, week };
}

export interface RankedPlayer {
  player: Player;
  points: number;
  goals: number;
  motm: number;
  appearances: number;
}

// ── Top players by weekly stats ────────────────────────────────────────────
export function getTopPlayersWeekly(
  players: Player[],
  weeklyStats: PlayerWeeklyStat[],
  count = 10
): RankedPlayer[] {
  const { year, monthIndex, week } = getCurrentPeriod();
  const map = new Map<string, { pts: number; goals: number; motm: number; apps: number }>();

  players.forEach(p => map.set(p.id, { pts: 0, goals: 0, motm: 0, apps: 0 }));

  weeklyStats.forEach(stat => {
    if (stat.year === year && stat.monthIndex === monthIndex && stat.week === week) {
      const entry = map.get(stat.playerId);
      if (entry) {
        entry.pts += calcPoints(stat);
        entry.goals += stat.goals;
        entry.motm += stat.motmCount;
        entry.apps += stat.appearances;
      }
    }
  });

  return [...map.entries()]
    .filter(([, v]) => v.pts > 0 || v.goals > 0)
    .sort((a, b) => b[1].pts - a[1].pts)
    .slice(0, count)
    .map(([id, v]) => ({
      player: players.find(p => p.id === id)!,
      points: v.pts,
      goals: v.goals,
      motm: v.motm,
      appearances: v.apps,
    }))
    .filter(r => r.player);
}

// ── Top players by monthly stats ───────────────────────────────────────────
export function getTopPlayersMonthly(
  players: Player[],
  monthlyStats: PlayerMonthlyStat[],
  count = 10
): RankedPlayer[] {
  const { year, monthIndex } = getCurrentPeriod();
  const map = new Map<string, { pts: number; goals: number; motm: number; apps: number }>();

  players.forEach(p => map.set(p.id, { pts: 0, goals: 0, motm: 0, apps: 0 }));

  monthlyStats.forEach(stat => {
    if (stat.year === year && stat.monthIndex === monthIndex) {
      const entry = map.get(stat.playerId);
      if (entry) {
        entry.pts += calcPoints(stat);
        entry.goals += stat.goals;
        entry.motm += stat.motmCount;
        entry.apps += stat.appearances;
      }
    }
  });

  return [...map.entries()]
    .filter(([, v]) => v.pts > 0 || v.goals > 0)
    .sort((a, b) => b[1].pts - a[1].pts)
    .slice(0, count)
    .map(([id, v]) => ({
      player: players.find(p => p.id === id)!,
      points: v.pts,
      goals: v.goals,
      motm: v.motm,
      appearances: v.apps,
    }))
    .filter(r => r.player);
}

// ── Top scorer (by goals) — weekly ─────────────────────────────────────────
export function getTopScorerWeekly(
  players: Player[],
  weeklyStats: PlayerWeeklyStat[]
): RankedPlayer | null {
  const ranked = getTopPlayersWeekly(players, weeklyStats, 10);
  const sorted = [...ranked].sort((a, b) => b.goals - a.goals);
  return sorted[0] ?? null;
}

// ── Top scorer (by goals) — monthly ────────────────────────────────────────
export function getTopScorerMonthly(
  players: Player[],
  monthlyStats: PlayerMonthlyStat[]
): RankedPlayer | null {
  const ranked = getTopPlayersMonthly(players, monthlyStats, 10);
  const sorted = [...ranked].sort((a, b) => b.goals - a.goals);
  return sorted[0] ?? null;
}

// ── Top scorer (by goals) — season ─────────────────────────────────────────
export function getTopScorerSeason(
  players: Player[],
  seasonStats: PlayerSeasonStat[]
): RankedPlayer | null {
  const map = new Map<string, { goals: number; pts: number; motm: number; apps: number }>();

  seasonStats.forEach(stat => {
    const entry = map.get(stat.playerId) ?? { goals: 0, pts: 0, motm: 0, apps: 0 };
    entry.goals += stat.goals;
    entry.pts += calcPoints({
      wins: stat.wins, draws: stat.draws, losses: stat.losses,
      goals: stat.goals, goalsConceded: stat.goalsConceded,
      hattricks: stat.hattricks, motmCount: stat.motmCount,
    });
    entry.motm += stat.motmCount;
    entry.apps += stat.appearances;
    map.set(stat.playerId, entry);
  });

  const sorted = [...map.entries()]
    .filter(([, v]) => v.goals > 0)
    .sort((a, b) => b[1].goals - a[1].goals);

  if (sorted.length === 0) return null;
  const [id, v] = sorted[0];
  const player = players.find(p => p.id === id);
  if (!player) return null;
  return { player, points: v.pts, goals: v.goals, motm: v.motm, appearances: v.apps };
}

// ── Season leaders (best scorer, most MOTM, best win record) ───────────────
export interface SeasonLeaders {
  topScorer: RankedPlayer | null;
  topMotm: RankedPlayer | null;
  topWinner: RankedPlayer | null;
}

export function getSeasonLeaders(
  players: Player[],
  seasonStats: PlayerSeasonStat[]
): SeasonLeaders {
  const map = new Map<string, { goals: number; motm: number; wins: number; pts: number; apps: number }>();

  seasonStats.forEach(stat => {
    const entry = map.get(stat.playerId) ?? { goals: 0, motm: 0, wins: 0, pts: 0, apps: 0 };
    entry.goals += stat.goals;
    entry.motm += stat.motmCount;
    entry.wins += stat.wins;
    entry.apps += stat.appearances;
    entry.pts += calcPoints({
      wins: stat.wins, draws: stat.draws, losses: stat.losses,
      goals: stat.goals, goalsConceded: stat.goalsConceded,
      hattricks: stat.hattricks, motmCount: stat.motmCount,
    });
    map.set(stat.playerId, entry);
  });

  const entries = [...map.entries()];
  const find = (sortFn: (a: [string, any], b: [string, any]) => number): RankedPlayer | null => {
    const sorted = entries.filter(([, v]) => v.apps > 0).sort(sortFn);
    if (sorted.length === 0) return null;
    const [id, v] = sorted[0];
    const player = players.find(p => p.id === id);
    if (!player) return null;
    return { player, points: v.pts, goals: v.goals, motm: v.motm, appearances: v.apps };
  };

  return {
    topScorer: find((a, b) => b[1].goals - a[1].goals),
    topMotm: find((a, b) => b[1].motm - a[1].motm),
    topWinner: find((a, b) => b[1].wins - a[1].wins),
  };
}

// ── Period labels ──────────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function getCurrentWeekLabel(): string {
  const { week, monthIndex } = getCurrentPeriod();
  return `Week ${week}, ${MONTHS[monthIndex]}`;
}

export function getCurrentMonthLabel(): string {
  const { monthIndex, year } = getCurrentPeriod();
  return `${MONTHS[monthIndex]} ${year}`;
}
