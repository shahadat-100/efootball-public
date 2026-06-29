import { useMemo, useState } from 'react';
import { Player, PlayerSeasonStat, SeasonDb } from '@/features/players/types';
import { MatchEntry } from '@/features/match-entries/types';
import { PlayerMonthlyStat, PlayerWeeklyStat } from '@/store/footballStore';
import { Avatar } from '@/shared/components';
import { cn } from '@/shared/lib/cn';

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

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const today = new Date();
const currentMonthIndex = today.getMonth();
const currentYear = today.getFullYear();
const currentDay = today.getDate();

export function OverviewPointsLeaderboard({
  players,
  matchEntries,
  seasons,
  playerSeasonStats,
  playerMonthlyStats = [],
  playerWeeklyStats = [],
  limit = 8,
}: OverviewPointsLeaderboardProps) {
  const [selectedMonthlySeasonId, setSelectedMonthlySeasonId] = useState<number | null>(null);
  const [selectedMonthlyMonth, setSelectedMonthlyMonth]       = useState<number>(currentMonthIndex);
  const [selectedOverallSeasonId, setSelectedOverallSeasonId] = useState<number | null>(null);

  const { weeklyRanking, monthlyRanking, overallRanking } = useMemo(() => {
    const lastDayOfCurrentMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    let activeWeekStart = 1, activeWeekEnd = 7, activeWeekName = 'Week 1';
    if (currentDay >= 8  && currentDay <= 14) { activeWeekStart = 8;  activeWeekEnd = 14; activeWeekName = 'Week 2'; }
    else if (currentDay >= 15 && currentDay <= 21) { activeWeekStart = 15; activeWeekEnd = 21; activeWeekName = 'Week 3'; }
    else if (currentDay >= 22) { activeWeekStart = 22; activeWeekEnd = lastDayOfCurrentMonth; activeWeekName = 'Week 4'; }

    const calcPoints = (s: { wins: number; draws: number; losses: number; goals: number; goalsConceded: number; hattricks: number; motmCount: number }) =>
      s.wins * 10 + s.draws * 5 - s.losses * 3 + s.goals - s.goalsConceded + s.motmCount * 4 + s.hattricks;

    // Weekly from playerWeeklyStats
    let activeWeekNumber = 1;
    if (currentDay >= 8  && currentDay <= 14) activeWeekNumber = 2;
    else if (currentDay >= 15 && currentDay <= 21) activeWeekNumber = 3;
    else if (currentDay >= 22) activeWeekNumber = 4;

    const weeklyList: RankedPlayer[] = players.map(p => {
      const stats = playerWeeklyStats.filter(s =>
        s.playerId === p.id &&
        s.year === currentYear &&
        s.monthIndex === currentMonthIndex &&
        s.week === activeWeekNumber
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
      const points = calcPoints({ wins, draws, losses, goals: gf, goalsConceded: gc, hattricks: ht, motmCount: motm });
      return { player: p, points, matches, wins, draws, losses, winRate, gf, gc, cs, ht, motm };
    }).filter(r => r.matches > 0).sort((a, b) => b.points - a.points);

    // Monthly from playerMonthlyStats
    const monthlyList: RankedPlayer[] = players.map(p => {
      const stats = playerMonthlyStats.filter(s =>
        s.playerId === p.id &&
        s.monthIndex === selectedMonthlyMonth &&
        (selectedMonthlySeasonId !== null ? s.seasonId === selectedMonthlySeasonId : s.year === currentYear)
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
      const points = calcPoints({ wins, draws, losses, goals: gf, goalsConceded: gc, hattricks: ht, motmCount: motm });
      return { player: p, points, matches, wins, draws, losses, winRate, gf, gc, cs, ht, motm };
    }).filter(r => r.matches > 0).sort((a, b) => b.points - a.points);

    const overallList: RankedPlayer[] = players.map(p => {
      const stats = playerSeasonStats.filter(s =>
        s.playerId === p.id &&
        (selectedOverallSeasonId === null || s.seasonId === selectedOverallSeasonId)
      );
      const wins   = stats.reduce((t, s) => t + s.wins, 0);
      const draws  = stats.reduce((t, s) => t + s.draws, 0);
      const losses = stats.reduce((t, s) => t + s.losses, 0);
      const gf     = stats.reduce((t, s) => t + s.goals, 0);
      const gc     = stats.reduce((t, s) => t + (s.goalsConceded || 0), 0);
      const cs     = stats.reduce((t, s) => t + (s.cleansheets || 0), 0);
      const ht     = stats.reduce((t, s) => t + (s.hattricks || 0), 0);
      const motm   = stats.reduce((t, s) => t + (s.motmCount || 0), 0);
      const matches = wins + draws + losses;
      const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
      const points  = wins * 10 + draws * 5 - losses * 3 + gf - gc + motm * 4 + ht;
      return { player: p, points, matches, wins, draws, losses, winRate, gf, gc, cs, ht, motm };
    }).sort((a, b) => b.points - a.points);

    const monthlySeasonLabel = selectedMonthlySeasonId
      ? seasons.find(s => s.id === selectedMonthlySeasonId)?.name ?? ''
      : currentYear.toString();

    return {
      weeklyRanking:  { label: activeWeekName, list: weeklyList },
      monthlyRanking: { label: `${MONTHS[selectedMonthlyMonth]} · ${monthlySeasonLabel}`, list: monthlyList },
      overallRanking: {
        label: selectedOverallSeasonId
          ? (seasons.find(s => s.id === selectedOverallSeasonId)?.name ?? 'Overall')
          : 'All Time',
        list: overallList,
      },
    };
  }, [players, matchEntries, playerSeasonStats, playerMonthlyStats, playerWeeklyStats, seasons, selectedMonthlySeasonId, selectedMonthlyMonth, selectedOverallSeasonId]);

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
        <div className="mb-4 border-b border-border pb-3 flex items-center justify-between relative z-10">
          <h3 className="font-bold text-base text-foreground tracking-tight">Weekly Points</h3>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 border border-purple-500/20 shadow-sm">
            {weeklyRanking.label}
          </span>
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
              <option value="">{currentYear} (Current)</option>
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
