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

export function PointsLeaderboard({ players, matchEntries, seasons, playerSeasonStats }: PointsLeaderboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overall');
  const [selectedMonthlySeasonId, setSelectedMonthlySeasonId] = useState<number | null>(null);
  const [selectedMonthlyMonth, setSelectedMonthlyMonth] = useState<number>(currentMonthIndex);
  const [selectedOverallSeasonId, setSelectedOverallSeasonId] = useState<number | null>(null);

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
      s.w * 3 + s.d - s.l + s.gf - s.gc + s.motm * 2 + s.ht;

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

  const selectCls = "text-xs bg-background border border-border rounded-lg px-3 py-1.5 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer shadow-sm transition-all";

  const cols = [
    { key: 'rank',    label: '#',       cls: 'w-10 text-center' },
    { key: 'player',  label: 'Player',  cls: 'min-w-[160px]' },
    { key: 'matches', label: 'M',       cls: 'w-12 text-center', title: 'Matches' },
    { key: 'wins',    label: 'W',       cls: 'w-12 text-center', title: 'Wins' },
    { key: 'draws',   label: 'D',       cls: 'w-12 text-center', title: 'Draws' },
    { key: 'losses',  label: 'L',       cls: 'w-12 text-center', title: 'Losses' },
    { key: 'winRate', label: 'Win%',    cls: 'w-16 text-center', title: 'Win Rate' },
    { key: 'gf',      label: 'GF',      cls: 'w-12 text-center', title: 'Goals For' },
    { key: 'gc',      label: 'GC',      cls: 'w-12 text-center', title: 'Goals Conceded' },
    { key: 'cs',      label: 'CS',      cls: 'w-12 text-center', title: 'Clean Sheets' },
    { key: 'ht',      label: 'HT',      cls: 'w-12 text-center', title: 'Hat-tricks' },
    { key: 'motm',    label: 'MOTM',    cls: 'w-14 text-center', title: 'Man of the Match' },
    { key: 'points',  label: 'Pts',     cls: 'w-16 text-center font-bold', title: 'Points' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View mode tabs */}
        <div className="flex items-center gap-1 bg-muted/40 border border-border p-1 rounded-xl">
          {(['weekly', 'monthly', 'overall'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
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
              onChange={e => setSelectedMonthlySeasonId(e.target.value === '' ? null : Number(e.target.value))}
              className={selectCls}
            >
              <option value="">{currentYear} (Current)</option>
              {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              value={selectedMonthlyMonth}
              onChange={e => setSelectedMonthlyMonth(Number(e.target.value))}
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
            onChange={e => setSelectedOverallSeasonId(e.target.value === '' ? null : Number(e.target.value))}
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
          <div className="overflow-y-auto" style={{ maxHeight: '680px' }}>
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-20">
                <tr className="bg-muted/60 backdrop-blur border-b border-border">
                  {cols.map(c => (
                    <th
                      key={c.key}
                      title={c.title}
                      className={cn(
                        "py-3 px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap select-none",
                        c.cls
                      )}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeRanking.list.length === 0 || activeRanking.list.every(r => r.points === 0 && r.matches === 0) ? (
                  <tr>
                    <td colSpan={cols.length} className="py-20 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📊</span>
                        <p className="font-medium text-sm">No data for this period</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  activeRanking.list.map((r, i) => {
                    const isTop3 = i < 3;
                    const medalCls =
                      i === 0 ? 'medal-gold' :
                      i === 1 ? 'medal-silver' :
                      i === 2 ? 'medal-bronze' :
                      'bg-muted/60 text-muted-foreground/70 text-[10px]';
                    const rowCls =
                      i === 0 ? 'bg-amber-500/5 hover:bg-amber-500/10' :
                      i === 1 ? 'bg-slate-400/5 hover:bg-slate-400/10' :
                      i === 2 ? 'bg-orange-700/5 hover:bg-orange-700/10' :
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
                            {i + 1}
                          </div>
                        </td>

                        {/* Player */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={r.player.name} size={30} src={(r.player as any).profileImageUrl} />
                            <span className={cn("font-semibold text-foreground truncate max-w-[140px]", isTop3 && "font-bold")}>
                              {r.player.name}
                            </span>
                          </div>
                        </td>

                        {/* M */}
                        <td className="py-2.5 px-2 text-center text-muted-foreground font-medium">{r.matches}</td>

                        {/* W */}
                        <td className="py-2.5 px-2 text-center">
                          <span className={cn("font-semibold", r.wins > 0 ? "text-emerald-500" : "text-muted-foreground/60")}>{r.wins}</span>
                        </td>

                        {/* D */}
                        <td className="py-2.5 px-2 text-center">
                          <span className={cn("font-semibold", r.draws > 0 ? "text-amber-500" : "text-muted-foreground/60")}>{r.draws}</span>
                        </td>

                        {/* L */}
                        <td className="py-2.5 px-2 text-center">
                          <span className={cn("font-semibold", r.losses > 0 ? "text-red-500" : "text-muted-foreground/60")}>{r.losses}</span>
                        </td>

                        {/* Win% */}
                        <td className="py-2.5 px-2 text-center">
                          <span className={cn(
                            "text-xs font-bold px-1.5 py-0.5 rounded-md",
                            r.winRate >= 60 ? "bg-emerald-500/15 text-emerald-600" :
                            r.winRate >= 40 ? "bg-amber-500/15 text-amber-600" :
                            r.matches > 0 ? "bg-red-500/10 text-red-500" :
                            "text-muted-foreground/50"
                          )}>
                            {r.matches > 0 ? `${r.winRate}%` : '—'}
                          </span>
                        </td>

                        {/* GF */}
                        <td className="py-2.5 px-2 text-center font-medium text-foreground/80">{r.gf}</td>

                        {/* GC */}
                        <td className="py-2.5 px-2 text-center font-medium text-foreground/80">{r.gc}</td>

                        {/* CS */}
                        <td className="py-2.5 px-2 text-center">
                          {r.cs > 0 ? (
                            <span className="text-xs font-bold text-cyan-600 bg-cyan-500/10 px-1.5 py-0.5 rounded-md">{r.cs}</span>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>

                        {/* HT */}
                        <td className="py-2.5 px-2 text-center">
                          {r.ht > 0 ? (
                            <span className="text-xs font-bold text-violet-600 bg-violet-500/10 px-1.5 py-0.5 rounded-md">🎩 {r.ht}</span>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>

                        {/* MOTM */}
                        <td className="py-2.5 px-2 text-center">
                          {r.motm > 0 ? (
                            <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-md">⭐ {r.motm}</span>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>

                        {/* Points */}
                        <td className="py-2.5 px-2 text-center">
                          <span className={cn(
                            "font-black text-sm px-2.5 py-1 rounded-lg border shadow-sm",
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
      </div>

      {/* Footer count */}
      <p className="text-xs text-muted-foreground text-right">
        {activeRanking.list.length} players ranked
      </p>
    </div>
  );
}
