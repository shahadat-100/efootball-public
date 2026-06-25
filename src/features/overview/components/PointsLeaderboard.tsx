import { useMemo, useState } from 'react';
import { Player, PlayerSeasonStat, SeasonDb } from '@/features/players/types';
import { MatchEntry } from '@/features/match-entries/types';
import { Avatar } from '@/shared/components';
import { cn } from '@/shared/lib/cn';

interface PointsLeaderboardProps {
  players: Player[];
  matchEntries: MatchEntry[];
  seasons: SeasonDb[];
  playerSeasonStats: PlayerSeasonStat[];
  limit?: number;
  /** compact=true → show top N rows, hide pagination (for Overview widget) */
  compact?: boolean;
  compactLimit?: number;
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

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const today = new Date();
const currentMonthIndex = today.getMonth();
const currentYear = today.getFullYear();
const currentDay = today.getDate();

type ViewMode = 'weekly' | 'monthly' | 'overall';

const PAGE_SIZE = 20;

export function PointsLeaderboard({ players, matchEntries, seasons, playerSeasonStats, compact = false, compactLimit = 8 }: PointsLeaderboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overall');
  const [selectedMonthlySeasonId, setSelectedMonthlySeasonId] = useState<number | null>(null);
  const [selectedMonthlyMonth, setSelectedMonthlyMonth] = useState<number>(currentMonthIndex);
  const [selectedOverallSeasonId, setSelectedOverallSeasonId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const { weeklyRanking, monthlyRanking, overallRanking } = useMemo(() => {
    let activeWeekStart = 1, activeWeekEnd = 7, activeWeekName = 'Week 1';
    if (currentDay >= 8  && currentDay <= 14) { activeWeekStart = 8;  activeWeekEnd = 14; activeWeekName = 'Week 2'; }
    else if (currentDay >= 15 && currentDay <= 21) { activeWeekStart = 15; activeWeekEnd = 21; activeWeekName = 'Week 3'; }
    else if (currentDay >= 22) { activeWeekStart = 22; activeWeekEnd = 31; activeWeekName = 'Week 4'; }

    type StatsMap = Map<string, { w: number; d: number; l: number; gf: number; gc: number; cs: number; ht: number; motm: number }>;
    const empty = () => ({ w: 0, d: 0, l: 0, gf: 0, gc: 0, cs: 0, ht: 0, motm: 0 });

    const weeklyMap: StatsMap  = new Map();
    const monthlyMap: StatsMap = new Map();
    players.forEach(p => {
      weeklyMap.set(p.id, empty());
      monthlyMap.set(p.id, empty());
    });

    matchEntries.forEach(entry => {
      if (!entry.date) return;
      const d = new Date(entry.date);

      const isCurrentWeek =
        d.getFullYear() === currentYear &&
        d.getMonth() === currentMonthIndex &&
        d.getDate() >= activeWeekStart &&
        d.getDate() <= activeWeekEnd;

      const isMonthMatch = d.getMonth() === selectedMonthlyMonth;
      const isSeasonOrYearMatch = selectedMonthlySeasonId !== null
        ? entry.seasonId === selectedMonthlySeasonId
        : d.getFullYear() === currentYear;

      const applyTo = (map: StatsMap) => {
        const s = map.get(entry.playerId);
        if (!s) return;
        if (entry.result === 'win') s.w++;
        else if (entry.result === 'draw') s.d++;
        else if (entry.result === 'loss') s.l++;
        s.gf += entry.goals || 0;
        s.gc += entry.goalsConceded || 0;
        if (entry.cleanSheet) s.cs++;
        s.ht += entry.hattricks || 0;
        if (entry.motm) s.motm++;
      };

      if (isCurrentWeek && weeklyMap.has(entry.playerId)) applyTo(weeklyMap);
      if (isMonthMatch && isSeasonOrYearMatch && monthlyMap.has(entry.playerId)) applyTo(monthlyMap);
    });

    const calcPoints = (s: { w: number; d: number; l: number; gf: number; gc: number; ht: number; motm: number }) =>
      s.w * 10 + s.d * 5 - s.l * 3 + s.gf - s.gc + s.motm * 4 + s.ht;

    const fromMap = (map: StatsMap): RankedPlayer[] =>
      Array.from(map.entries())
        .map(([id, s]) => {
          const player = players.find(p => p.id === id)!;
          if (!player) return null;
          const matches = s.w + s.d + s.l;
          const winRate = matches > 0 ? Math.round((s.w / matches) * 100) : 0;
          return { player, points: calcPoints(s), matches, wins: s.w, draws: s.d, losses: s.l, winRate, gf: s.gf, gc: s.gc, cs: s.cs, ht: s.ht, motm: s.motm };
        })
        .filter(Boolean)
        .sort((a, b) => b!.points - a!.points) as RankedPlayer[];

    // Overall from playerSeasonStats
    const overallList: RankedPlayer[] = players.map(p => {
      const stats = playerSeasonStats.filter(s =>
        s.playerId === p.id &&
        (selectedOverallSeasonId === null || s.seasonId === selectedOverallSeasonId)
      );
      const wins = stats.reduce((t, s) => t + s.wins, 0);
      const draws = stats.reduce((t, s) => t + s.draws, 0);
      const losses = stats.reduce((t, s) => t + s.losses, 0);
      const gf = stats.reduce((t, s) => t + s.goals, 0);
      const gc = stats.reduce((t, s) => t + (s.goalsConceded || 0), 0);
      const cs = stats.reduce((t, s) => t + (s.cleansheets || 0), 0);
      const ht = stats.reduce((t, s) => t + (s.hattricks || 0), 0);
      const motm = stats.reduce((t, s) => t + (s.motmCount || 0), 0);
      const matches = wins + draws + losses;
      const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
      const points = wins * 3 + draws - losses + gf - gc + motm * 2 + ht;
      return { player: p, points, matches, wins, draws, losses, winRate, gf, gc, cs, ht, motm };
    }).sort((a, b) => b.points - a.points);

    const monthlySeasonLabel = selectedMonthlySeasonId
      ? seasons.find(s => s.id === selectedMonthlySeasonId)?.name ?? ''
      : currentYear.toString();

    return {
      weeklyRanking:  { label: activeWeekName, list: fromMap(weeklyMap) },
      monthlyRanking: { label: `${MONTHS[selectedMonthlyMonth]} · ${monthlySeasonLabel}`, list: fromMap(monthlyMap) },
      overallRanking: {
        label: selectedOverallSeasonId
          ? (seasons.find(s => s.id === selectedOverallSeasonId)?.name ?? 'Overall')
          : 'All Time',
        list: overallList,
      },
    };
  }, [players, matchEntries, playerSeasonStats, seasons, selectedMonthlySeasonId, selectedMonthlyMonth, selectedOverallSeasonId]);

  const activeRanking =
    viewMode === 'weekly' ? weeklyRanking :
    viewMode === 'monthly' ? monthlyRanking :
    overallRanking;

  // Reset to page 1 whenever filter changes
  const totalEntries = activeRanking.list.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageEnd   = Math.min(pageStart + PAGE_SIZE, totalEntries);
  // In compact mode show only the top N rows; otherwise show the current page slice
  const pageList  = compact
    ? activeRanking.list.slice(0, compactLimit)
    : activeRanking.list.slice(pageStart, pageEnd);

  const selectCls = "text-xs bg-background border border-border rounded-lg px-3 py-1.5 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer shadow-sm transition-all";

  const handleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    setPage(1);
  };

  const isEmpty = activeRanking.list.length === 0 || activeRanking.list.every(r => r.points === 0 && r.matches === 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View mode tabs */}
        <div className="flex items-center gap-1 bg-muted/40 border border-border p-1 rounded-xl">
          {(['weekly', 'monthly', 'overall'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => handleViewMode(mode)}
              className={cn(
                "px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                viewMode === mode
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/60"
              )}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Monthly filters */}
        {viewMode === 'monthly' && (
          <div className="flex items-center gap-2">
            <select
              value={selectedMonthlySeasonId ?? ''}
              onChange={e => { setSelectedMonthlySeasonId(e.target.value === '' ? null : Number(e.target.value)); setPage(1); }}
              className={selectCls}
            >
              <option value="">{currentYear} (Current)</option>
              {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              value={selectedMonthlyMonth}
              onChange={e => { setSelectedMonthlyMonth(Number(e.target.value)); setPage(1); }}
              className={selectCls}
            >
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
        )}

        {/* Overall filter */}
        {viewMode === 'overall' && (
          <select
            value={selectedOverallSeasonId ?? ''}
            onChange={e => { setSelectedOverallSeasonId(e.target.value === '' ? null : Number(e.target.value)); setPage(1); }}
            className={selectCls}
          >
            <option value="">All Time</option>
            {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}

        {/* Label badge */}
        <span className="ml-auto text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
          {activeRanking.label}
        </span>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '44px' }} />   {/* # */}
              <col style={{ width: '160px' }} />  {/* Player */}
              <col style={{ width: '48px' }} />   {/* M */}
              <col style={{ width: '48px' }} />   {/* W */}
              <col style={{ width: '48px' }} />   {/* D */}
              <col style={{ width: '48px' }} />   {/* L */}
              <col style={{ width: '60px' }} />   {/* Win% */}
              <col style={{ width: '48px' }} />   {/* GF */}
              <col style={{ width: '48px' }} />   {/* GC */}
              <col style={{ width: '48px' }} />   {/* CS */}
              <col style={{ width: '64px' }} />   {/* HT */}
              <col style={{ width: '64px' }} />   {/* MOTM */}
              <col style={{ width: '64px' }} />   {/* Pts */}
            </colgroup>
            <thead className="sticky top-0 z-20">
              <tr className="bg-muted/60 backdrop-blur border-b border-border">
                {[
                  { label: '#',    title: 'Rank' },
                  { label: 'Player', title: 'Player' },
                  { label: 'M',    title: 'Matches' },
                  { label: 'W',    title: 'Wins' },
                  { label: 'D',    title: 'Draws' },
                  { label: 'L',    title: 'Losses' },
                  { label: 'Win%', title: 'Win Rate' },
                  { label: 'GF',   title: 'Goals For' },
                  { label: 'GC',   title: 'Goals Conceded' },
                  { label: 'CS',   title: 'Clean Sheets' },
                  { label: 'HT',   title: 'Hat-tricks' },
                  { label: 'MOTM', title: 'Man of the Match' },
                  { label: 'Pts',  title: 'Points' },
                ].map((c, idx) => (
                  <th
                    key={idx}
                    title={c.title}
                    className={cn(
                      "py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap select-none",
                      idx === 0 ? 'text-center px-2' :
                      idx === 1 ? 'text-left px-3' :
                      'text-center px-1'
                    )}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isEmpty ? (
                <tr>
                  <td colSpan={13} className="py-20 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📊</span>
                      <p className="font-medium text-sm">No data for this period</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pageList.map((r, i) => {
                  const globalIdx = pageStart + i;
                  const isTop3 = globalIdx < 3;

                  const medalCls =
                    globalIdx === 0 ? 'medal-gold' :
                    globalIdx === 1 ? 'medal-silver' :
                    globalIdx === 2 ? 'medal-bronze' :
                    'bg-muted/60 text-muted-foreground/70 text-[10px]';

                  const rowCls =
                    globalIdx === 0 ? 'bg-amber-500/5 hover:bg-amber-500/10' :
                    globalIdx === 1 ? 'bg-slate-400/5 hover:bg-slate-400/10' :
                    globalIdx === 2 ? 'bg-orange-700/5 hover:bg-orange-700/10' :
                    'hover:bg-muted/40';

                  return (
                    <tr
                      key={r.player.id}
                      className={cn(
                        "border-b border-border/50 transition-colors group",
                        rowCls
                      )}
                    >
                      {/* Rank */}
                      <td className="py-2.5 px-2 text-center">
                        <div className={cn(
                          'w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black mx-auto shrink-0 shadow-sm',
                          medalCls
                        )}>
                          {globalIdx + 1}
                        </div>
                      </td>

                      {/* Player */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar name={r.player.name} size={28} src={(r.player as any).profileImageUrl} />
                          <span className={cn(
                            "font-semibold text-foreground truncate text-[13px]",
                            isTop3 && "font-bold"
                          )}>
                            {r.player.name}
                          </span>
                        </div>
                      </td>

                      {/* M */}
                      <td className="py-2.5 px-1 text-center text-muted-foreground font-medium text-[13px]">{r.matches}</td>

                      {/* W */}
                      <td className="py-2.5 px-1 text-center">
                        <span className={cn("font-semibold text-[13px]", r.wins > 0 ? "text-emerald-500" : "text-muted-foreground/50")}>{r.wins}</span>
                      </td>

                      {/* D */}
                      <td className="py-2.5 px-1 text-center">
                        <span className={cn("font-semibold text-[13px]", r.draws > 0 ? "text-amber-500" : "text-muted-foreground/50")}>{r.draws}</span>
                      </td>

                      {/* L */}
                      <td className="py-2.5 px-1 text-center">
                        <span className={cn("font-semibold text-[13px]", r.losses > 0 ? "text-red-500" : "text-muted-foreground/50")}>{r.losses}</span>
                      </td>

                      {/* Win% */}
                      <td className="py-2.5 px-1 text-center">
                        <span className={cn(
                          "text-[11px] font-bold px-1.5 py-0.5 rounded-md",
                          r.winRate >= 60 ? "bg-emerald-500/15 text-emerald-600" :
                          r.winRate >= 40 ? "bg-amber-500/15 text-amber-600" :
                          r.matches > 0  ? "bg-red-500/10 text-red-500" :
                          "text-muted-foreground/40"
                        )}>
                          {r.matches > 0 ? `${r.winRate}%` : '—'}
                        </span>
                      </td>

                      {/* GF */}
                      <td className="py-2.5 px-1 text-center font-medium text-foreground/80 text-[13px]">{r.gf}</td>

                      {/* GC */}
                      <td className="py-2.5 px-1 text-center font-medium text-foreground/80 text-[13px]">{r.gc}</td>

                      {/* CS */}
                      <td className="py-2.5 px-1 text-center">
                        {r.cs > 0 ? (
                          <span className="text-[11px] font-bold text-cyan-600 bg-cyan-500/10 px-1.5 py-0.5 rounded-md">{r.cs}</span>
                        ) : (
                          <span className="text-muted-foreground/40 text-[12px]">—</span>
                        )}
                      </td>

                      {/* HT */}
                      <td className="py-2.5 px-1 text-center">
                        {r.ht > 0 ? (
                          <span className="text-[11px] font-bold text-violet-600 bg-violet-500/10 px-1.5 py-0.5 rounded-md">⚽ {r.ht}</span>
                        ) : (
                          <span className="text-muted-foreground/40 text-[12px]">—</span>
                        )}
                      </td>

                      {/* MOTM */}
                      <td className="py-2.5 px-1 text-center">
                        {r.motm > 0 ? (
                          <span className="text-[11px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-md">👑 {r.motm}</span>
                        ) : (
                          <span className="text-muted-foreground/40 text-[12px]">—</span>
                        )}
                      </td>

                      {/* Points */}
                      <td className="py-2.5 px-1 text-center">
                        <span className={cn(
                          "font-black text-[13px] px-2 py-0.5 rounded-lg border shadow-sm",
                          r.points > 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                          r.points < 0 ? "bg-red-500/10 text-red-500 border-red-500/20" :
                          "bg-muted text-muted-foreground border-border"
                        )}>
                          {r.points > 0 ? `+${r.points}` : r.points}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination footer — hidden in compact/overview mode */}
      {!isEmpty && !compact && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{pageStart + 1}–{pageEnd}</span> of{' '}
            <span className="font-semibold text-foreground">{totalEntries}</span> players
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all",
                safePage <= 1
                  ? "border-border/50 text-muted-foreground/40 cursor-not-allowed"
                  : "border-border bg-card hover:bg-muted/50 text-foreground active:scale-95"
              )}
            >
              ← Previous
            </button>

            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 min-w-[80px] text-center">
              Page {safePage}/{totalPages}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all",
                safePage >= totalPages
                  ? "border-border/50 text-muted-foreground/40 cursor-not-allowed"
                  : "border-border bg-card hover:bg-muted/50 text-foreground active:scale-95"
              )}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
