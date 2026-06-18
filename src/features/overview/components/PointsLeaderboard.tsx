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
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

// Points from aggregated season stats (for Overall)
const calcSeasonPoints = (stats: PlayerSeasonStat[]): number =>
  stats.reduce((total, s) =>
    total + (s.wins * 3) + s.draws - s.losses + s.goals - s.goalsConceded + (s.motmCount * 2) + s.hattricks
  , 0);

// Points from individual match entries (for Weekly / Monthly)
const calcEntryPoints = (entries: MatchEntry[]): number =>
  entries.reduce((total, e) => {
    let pts = 0;
    if (e.result === 'win') pts += 3;
    else if (e.result === 'draw') pts += 1;
    else if (e.result === 'loss') pts -= 1;
    pts += (e.goals || 0);
    pts -= (e.goalsConceded || 0);
    pts += (e.motm ? 2 : 0);
    pts += (e.hattricks || 0);
    return total + pts;
  }, 0);

const today = new Date();
const currentMonthIndex = today.getMonth(); // 0-indexed
const currentYear = today.getFullYear();
const currentDay = today.getDate();

export function PointsLeaderboard({ players, matchEntries, seasons, playerSeasonStats, limit }: PointsLeaderboardProps) {
  // ── Monthly filters ──
  const [selectedMonthlySeasonId, setSelectedMonthlySeasonId] = useState<number | null>(null);
  const [selectedMonthlyMonth, setSelectedMonthlyMonth]       = useState<number>(currentMonthIndex); // 0-indexed

  // ── Overall filter ──
  const [selectedOverallSeasonId, setSelectedOverallSeasonId] = useState<number | null>(null);

  const { weeklyRanking, monthlyRanking, overallRanking } = useMemo(() => {
    // Current week bucket
    let activeWeekStart = 1, activeWeekEnd = 7, activeWeekName = 'Week 1';
    if (currentDay >= 8  && currentDay <= 14) { activeWeekStart = 8;  activeWeekEnd = 14; activeWeekName = 'Week 2'; }
    else if (currentDay >= 15 && currentDay <= 21) { activeWeekStart = 15; activeWeekEnd = 21; activeWeekName = 'Week 3'; }
    else if (currentDay >= 22) { activeWeekStart = 22; activeWeekEnd = 31; activeWeekName = 'Week 4'; }

    const weeklyMap  = new Map<string, number>();
    const monthlyMap = new Map<string, number>();
    const overallMap = new Map<string, number>();

    players.forEach(p => {
      weeklyMap.set(p.id, 0);
      monthlyMap.set(p.id, 0);
      overallMap.set(p.id, 0);
    });

    matchEntries.forEach(entry => {
      if (!entry.date) return;
      const d = new Date(entry.date);
      const pts = calcEntryPoints([entry]);

      // ── Weekly: always current week of current year ──
      const isCurrentWeek =
        d.getFullYear() === currentYear &&
        d.getMonth() === currentMonthIndex &&
        d.getDate() >= activeWeekStart &&
        d.getDate() <= activeWeekEnd;

      if (isCurrentWeek && weeklyMap.has(entry.playerId)) {
        weeklyMap.set(entry.playerId, weeklyMap.get(entry.playerId)! + pts);
      }

      // ── Monthly: filtered by season + month ──
      const isMonthMatch = d.getMonth() === selectedMonthlyMonth;
      const isSeasonOrYearMatch = selectedMonthlySeasonId !== null
        ? entry.seasonId === selectedMonthlySeasonId
        : d.getFullYear() === currentYear; // default: current year

      if (isMonthMatch && isSeasonOrYearMatch && monthlyMap.has(entry.playerId)) {
        monthlyMap.set(entry.playerId, monthlyMap.get(entry.playerId)! + pts);
      }
    });

    // ── Overall: from playerSeasonStats (includes historical) ──
    players.forEach(p => {
      const stats = playerSeasonStats.filter(s =>
        s.playerId === p.id &&
        (selectedOverallSeasonId === null || s.seasonId === selectedOverallSeasonId)
      );
      overallMap.set(p.id, calcSeasonPoints(stats));
    });

    const toSortedList = (map: Map<string, number>): RankedPlayer[] =>
      Array.from(map.entries())
        .map(([id, points]) => ({ player: players.find(p => p.id === id)!, points }))
        .filter(x => x.player)
        .sort((a, b) => b.points - a.points);

    const monthlySeasonLabel = selectedMonthlySeasonId
      ? seasons.find(s => s.id === selectedMonthlySeasonId)?.name ?? ''
      : currentYear.toString();

    return {
      weeklyRanking:  { name: activeWeekName, list: toSortedList(weeklyMap) },
      monthlyRanking: { label: `${MONTHS[selectedMonthlyMonth]} · ${monthlySeasonLabel}`, list: toSortedList(monthlyMap) },
      overallRanking: {
        name: selectedOverallSeasonId
          ? (seasons.find(s => s.id === selectedOverallSeasonId)?.name ?? 'Overall')
          : 'All Time',
        list: toSortedList(overallMap)
      },
    };
  }, [players, matchEntries, playerSeasonStats, seasons, selectedMonthlySeasonId, selectedMonthlyMonth, selectedOverallSeasonId]);

  const renderRow = (r: RankedPlayer, i: number) => (
    <div key={r.player.id} className={cn(
      "flex items-center gap-3 p-2.5 rounded-xl transition-all group",
      i === 0 ? "bg-amber-500/5 hover:bg-amber-500/10" :
      i === 1 ? "bg-slate-200/30 hover:bg-slate-200/50" :
      i === 2 ? "bg-amber-700/5 hover:bg-amber-700/10" :
      "hover:bg-muted/50"
    )}>
      <div className={cn(
        'font-black w-6 h-6 flex items-center justify-center rounded-full text-[10px] shrink-0 shadow-sm',
        i === 0 ? 'medal-gold' : i === 1 ? 'medal-silver' : i === 2 ? 'medal-bronze' : 'bg-muted text-muted-foreground/60'
      )}>
        {i + 1}
      </div>
      <Avatar name={r.player.name} size={32} src={(r.player as any).profileImageUrl} />
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-semibold text-foreground truncate",
          i === 0 && "font-bold"
        )}>{r.player.name}</p>
      </div>
      <div className={cn(
        "font-black text-sm px-3 py-1 rounded-lg border shadow-sm",
        r.points > 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
        r.points < 0 ? "bg-red-500/10 text-red-500 border-red-500/20" :
        "bg-muted text-muted-foreground border-border"
      )}>
        {r.points > 0 ? `+${r.points}` : r.points}
      </div>
    </div>
  );

  const selectCls = "text-[11px] bg-muted border border-border rounded-lg px-2.5 py-1.5 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm";

  const CardWrapper = ({ children, accentColor }: { children: React.ReactNode, accentColor: string }) => (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col h-[420px] relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity" style={{ backgroundColor: accentColor }} />
      {children}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">

      {/* ── Weekly: no filter, always current week ── */}
      <CardWrapper accentColor="#8b5cf6">
        <div className="mb-4 border-b border-border pb-3 flex items-center justify-between relative z-10">
          <h3 className="font-bold text-base text-foreground tracking-tight">Weekly Points</h3>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 border border-purple-500/20 shadow-sm">
            {weeklyRanking.name}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar relative z-10">
          {weeklyRanking.list.length === 0 || weeklyRanking.list.every(r => r.points === 0) ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <span className="text-3xl mb-2 block">📊</span>
                <p className="text-muted-foreground text-sm font-medium">No points this week</p>
              </div>
            </div>
          ) : (
            weeklyRanking.list.slice(0, limit).map((r, i) => renderRow(r, i))
          )}
        </div>
      </CardWrapper>

      {/* ── Monthly: season + month filters ── */}
      <CardWrapper accentColor="#06b6d4">
        <div className="mb-4 border-b border-border pb-3 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-base text-foreground tracking-tight">Monthly Points</h3>
            <span className="text-[10px] text-muted-foreground font-medium">{monthlyRanking.label}</span>
          </div>
          {/* Two filter dropdowns */}
          <div className="flex gap-2">
            <select
              value={selectedMonthlySeasonId ?? ''}
              onChange={e => setSelectedMonthlySeasonId(e.target.value === '' ? null : Number(e.target.value))}
              className={selectCls + ' flex-1'}
            >
              <option value="">{currentYear} (Current)</option>
              {seasons.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              value={selectedMonthlyMonth}
              onChange={e => setSelectedMonthlyMonth(Number(e.target.value))}
              className={selectCls + ' flex-1'}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar relative z-10">
          {monthlyRanking.list.length === 0 || monthlyRanking.list.every(r => r.points === 0) ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <span className="text-3xl mb-2 block">📅</span>
                <p className="text-muted-foreground text-sm font-medium">No points for this period</p>
              </div>
            </div>
          ) : (
            monthlyRanking.list.slice(0, limit).map((r, i) => renderRow(r, i))
          )}
        </div>
      </CardWrapper>

      {/* ── Overall: season filter ── */}
      <CardWrapper accentColor="#f59e0b">
        <div className="mb-4 border-b border-border pb-3 flex items-center justify-between relative z-10">
          <h3 className="font-bold text-base text-foreground tracking-tight">Overall Points</h3>
          <select
            value={selectedOverallSeasonId ?? ''}
            onChange={e => setSelectedOverallSeasonId(e.target.value === '' ? null : Number(e.target.value))}
            className={selectCls}
          >
            <option value="">All Time</option>
            {seasons.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar relative z-10">
          {overallRanking.list.length === 0 || overallRanking.list.every(r => r.points === 0) ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <span className="text-3xl mb-2 block">🏆</span>
                <p className="text-muted-foreground text-sm font-medium">No points yet</p>
              </div>
            </div>
          ) : (
            overallRanking.list.slice(0, limit).map((r, i) => renderRow(r, i))
          )}
        </div>
      </CardWrapper>

    </div>
  );
}
