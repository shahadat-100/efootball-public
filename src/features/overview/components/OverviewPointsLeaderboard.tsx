import { useMemo, useState, useEffect } from 'react';
import { Player, PlayerSeasonStat, SeasonDb } from '@/features/players/types';
import { MatchEntry } from '@/features/match-entries/types';
import { PlayerMonthlyStat, PlayerWeeklyStat } from '@/store/footballStore';
import { Avatar } from '@/shared/components';
import { cn } from '@/shared/lib/cn';
import {
  MONTHS,
  findLatestWeeklyPeriod,
  findLatestMonthlyPeriod,
  getAggregatedWeeklyPlayerStats,
  getAggregatedMonthlyPlayerStats,
} from '@/features/overview/utils/leaderboardUtils';

interface OverviewPointsLeaderboardProps {
  players: Player[];
  matchEntries: MatchEntry[];
  seasons: SeasonDb[];
  playerSeasonStats: PlayerSeasonStat[];
  playerMonthlyStats?: PlayerMonthlyStat[];
  playerWeeklyStats?: PlayerWeeklyStat[];
  limit?: number;
}

interface RankedPlayer {
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

export function OverviewPointsLeaderboard({
  players,
  matchEntries,
  seasons,
  playerSeasonStats,
  playerMonthlyStats = [],
  playerWeeklyStats = [],
  limit = 8,
}: OverviewPointsLeaderboardProps) {
  // Find latest active weekly and monthly periods based on real data
  const latestWeekly = useMemo(
    () => findLatestWeeklyPeriod(playerWeeklyStats, matchEntries),
    [playerWeeklyStats, matchEntries]
  );
  const latestMonthly = useMemo(
    () => findLatestMonthlyPeriod(playerMonthlyStats, matchEntries),
    [playerMonthlyStats, matchEntries]
  );

  const [selectedWeeklyWeek, setSelectedWeeklyWeek] = useState<number>(latestWeekly.week);
  const [selectedWeeklyMonth, setSelectedWeeklyMonth] = useState<number>(latestWeekly.monthIndex);
  const [selectedWeeklyYear, setSelectedWeeklyYear] = useState<number>(latestWeekly.year);

  const [selectedMonthlySeasonId, setSelectedMonthlySeasonId] = useState<number | null>(null);
  const [selectedMonthlyMonth, setSelectedMonthlyMonth] = useState<number>(latestMonthly.monthIndex);
  const [selectedMonthlyYear, setSelectedMonthlyYear] = useState<number>(latestMonthly.year);

  const [selectedOverallSeasonId, setSelectedOverallSeasonId] = useState<number | null>(null);

  // Sync to latest active period if data loads asynchronously
  useEffect(() => {
    setSelectedWeeklyWeek(latestWeekly.week);
    setSelectedWeeklyMonth(latestWeekly.monthIndex);
    setSelectedWeeklyYear(latestWeekly.year);
  }, [latestWeekly.year, latestWeekly.monthIndex, latestWeekly.week]);

  useEffect(() => {
    setSelectedMonthlyMonth(latestMonthly.monthIndex);
    setSelectedMonthlyYear(latestMonthly.year);
  }, [latestMonthly.year, latestMonthly.monthIndex]);

  const { weeklyRanking, monthlyRanking, overallRanking } = useMemo(() => {
    // 1. Weekly Ranking using robust aggregator across playerWeeklyStats and matchEntries
    const weeklyAgg = getAggregatedWeeklyPlayerStats(
      players,
      playerWeeklyStats,
      matchEntries,
      {
        year: selectedWeeklyYear,
        monthIndex: selectedWeeklyMonth,
        week: selectedWeeklyWeek,
      }
    );

    const weeklyList: RankedPlayer[] = weeklyAgg
      .filter(r => r.matches > 0)
      .sort((a, b) => b.points - a.points || b.wins - a.wins || b.gf - a.gf);

    // 2. Monthly Ranking using robust aggregator across playerMonthlyStats and matchEntries
    const monthlyAgg = getAggregatedMonthlyPlayerStats(
      players,
      playerMonthlyStats,
      matchEntries,
      {
        year: selectedMonthlyYear,
        monthIndex: selectedMonthlyMonth,
        seasonId: selectedMonthlySeasonId,
      }
    );

    const monthlyList: RankedPlayer[] = monthlyAgg
      .filter(r => r.matches > 0)
      .sort((a, b) => b.points - a.points || b.wins - a.wins || b.gf - a.gf);

    // 3. Overall Ranking from playerSeasonStats
    const overallList: RankedPlayer[] = players.map(p => {
      const stats = playerSeasonStats.filter(s =>
        s.playerId === p.id &&
        (selectedOverallSeasonId === null || s.seasonId === selectedOverallSeasonId)
      );
      const wins   = stats.reduce((t, s) => t + (s.wins || 0), 0);
      const draws  = stats.reduce((t, s) => t + (s.draws || 0), 0);
      const losses = stats.reduce((t, s) => t + (s.losses || 0), 0);
      const gf     = stats.reduce((t, s) => t + (s.goals || 0), 0);
      const gc     = stats.reduce((t, s) => t + (s.goalsConceded || 0), 0);
      const cs     = stats.reduce((t, s) => t + (s.cleansheets || 0), 0);
      const ht     = stats.reduce((t, s) => t + (s.hattricks || 0), 0);
      const motm   = stats.reduce((t, s) => t + (s.motmCount || 0), 0);
      const matches = wins + draws + losses;
      const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
      const points  = wins * 10 + draws * 5 - losses * 3 + gf - gc + motm * 4 + ht;
      return { player: p, points, matches, wins, draws, losses, winRate, gf, gc, cs, ht, motm };
    }).sort((a, b) => b.points - a.points || b.wins - a.wins || b.gf - a.gf);

    const monthlySeasonLabel = selectedMonthlySeasonId
      ? seasons.find(s => s.id === selectedMonthlySeasonId)?.name ?? ''
      : selectedMonthlyYear.toString();

    return {
      weeklyRanking: {
        label: `Week ${selectedWeeklyWeek} · ${MONTHS[selectedWeeklyMonth]} ${selectedWeeklyYear}`,
        list: weeklyList,
      },
      monthlyRanking: {
        label: `${MONTHS[selectedMonthlyMonth]} · ${monthlySeasonLabel}`,
        list: monthlyList,
      },
      overallRanking: {
        label: selectedOverallSeasonId
          ? (seasons.find(s => s.id === selectedOverallSeasonId)?.name ?? 'Overall')
          : 'All Time',
        list: overallList,
      },
    };
  }, [
    players,
    matchEntries,
    playerSeasonStats,
    playerMonthlyStats,
    playerWeeklyStats,
    seasons,
    selectedWeeklyYear,
    selectedWeeklyMonth,
    selectedWeeklyWeek,
    selectedMonthlySeasonId,
    selectedMonthlyMonth,
    selectedMonthlyYear,
    selectedOverallSeasonId,
  ]);

  /* ─── Render helpers ─────────────────────────────────────────── */

  const selectCls = "text-[11px] bg-muted border border-border rounded-lg px-2.5 py-1.5 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm transition-all";

  const renderRow = (r: RankedPlayer, i: number) => (
    <div
      key={r.player.id}
      className={cn(
        'flex items-center gap-3 p-2.5 rounded-xl transition-all group',
        i === 0 ? 'bg-amber-500/5 hover:bg-amber-500/10' :
        i === 1 ? 'bg-slate-200/30 hover:bg-slate-200/50 dark:bg-slate-400/5 dark:hover:bg-slate-400/10' :
        i === 2 ? 'bg-amber-700/5 hover:bg-amber-700/10' :
        'hover:bg-muted/50'
      )}
    >
      {/* Rank badge */}
      <div className={cn(
        'font-black w-6 h-6 flex items-center justify-center rounded-full text-[10px] shrink-0 shadow-sm',
        i === 0 ? 'medal-gold' : i === 1 ? 'medal-silver' : i === 2 ? 'medal-bronze' : 'bg-muted text-muted-foreground/60'
      )}>
        {i + 1}
      </div>

      <Avatar name={r.player.name} size={32} src={(r.player as any).profileImageUrl} />

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold text-foreground truncate', i === 0 && 'font-bold')}>
          {r.player.name}
        </p>
        {r.matches > 0 && (
          <p className="text-[11px] text-muted-foreground">
            {r.matches}G · {r.wins}W
          </p>
        )}
      </div>

      <span className={cn(
        'font-black text-sm px-3 py-1 rounded-lg border shadow-sm shrink-0',
        r.points > 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
        r.points < 0 ? 'bg-red-500/10 text-red-500 border-red-500/20' :
        'bg-muted text-muted-foreground border-border'
      )}>
        {r.points > 0 ? `+${r.points}` : r.points}
      </span>
    </div>
  );

  const EmptyState = ({ emoji, msg }: { emoji: string; msg: string }) => (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <span className="text-3xl mb-2 block">{emoji}</span>
        <p className="text-muted-foreground text-sm font-medium">{msg}</p>
      </div>
    </div>
  );

  const CardWrapper = ({ children, accentColor }: { children: React.ReactNode; accentColor: string }) => (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col relative overflow-hidden group">
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity"
        style={{ backgroundColor: accentColor }}
      />
      {children}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">

      {/* ── Weekly ── */}
      <CardWrapper accentColor="#8b5cf6">
        <div className="mb-3 border-b border-border pb-3 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-base text-foreground tracking-tight">Weekly Points</h3>
            <span className="text-[10px] text-muted-foreground font-medium">{weeklyRanking.label}</span>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedWeeklyMonth}
              onChange={e => setSelectedWeeklyMonth(Number(e.target.value))}
              className={selectCls + ' flex-1'}
            >
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select
              value={selectedWeeklyWeek}
              onChange={e => setSelectedWeeklyWeek(Number(e.target.value))}
              className={selectCls + ' flex-1'}
            >
              {[1, 2, 3, 4].map(w => <option key={w} value={w}>Week {w}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1 relative z-10">
          {weeklyRanking.list.length === 0 || weeklyRanking.list.every(r => r.points === 0 && r.matches === 0) ? (
            <EmptyState emoji="📊" msg="No points this week" />
          ) : (
            weeklyRanking.list.slice(0, limit).map(renderRow)
          )}
        </div>
      </CardWrapper>

      {/* ── Monthly ── */}
      <CardWrapper accentColor="#06b6d4">
        <div className="mb-3 border-b border-border pb-3 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-base text-foreground tracking-tight">Monthly Points</h3>
            <span className="text-[10px] text-muted-foreground font-medium">{monthlyRanking.label}</span>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedMonthlySeasonId ?? ''}
              onChange={e => setSelectedMonthlySeasonId(e.target.value === '' ? null : Number(e.target.value))}
              className={selectCls + ' flex-1'}
            >
              <option value="">{selectedMonthlyYear} (Latest)</option>
              {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              value={selectedMonthlyMonth}
              onChange={e => setSelectedMonthlyMonth(Number(e.target.value))}
              className={selectCls + ' flex-1'}
            >
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1 relative z-10">
          {monthlyRanking.list.length === 0 || monthlyRanking.list.every(r => r.points === 0 && r.matches === 0) ? (
            <EmptyState emoji="📅" msg="No points for this period" />
          ) : (
            monthlyRanking.list.slice(0, limit).map(renderRow)
          )}
        </div>
      </CardWrapper>

      {/* ── Overall ── */}
      <CardWrapper accentColor="#f59e0b">
        <div className="mb-3 border-b border-border pb-3 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-base text-foreground tracking-tight">Overall Points</h3>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm">
              {overallRanking.label}
            </span>
          </div>
          <select
            value={selectedOverallSeasonId ?? ''}
            onChange={e => setSelectedOverallSeasonId(e.target.value === '' ? null : Number(e.target.value))}
            className={selectCls + ' w-full'}
          >
            <option value="">All Time</option>
            {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="space-y-1 relative z-10">
          {overallRanking.list.length === 0 || overallRanking.list.every(r => r.points === 0 && r.matches === 0) ? (
            <EmptyState emoji="🏆" msg="No points yet" />
          ) : (
            overallRanking.list.slice(0, limit).map(renderRow)
          )}
        </div>
      </CardWrapper>

    </div>
  );
}
