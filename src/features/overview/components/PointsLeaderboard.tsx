import { useMemo, useState } from 'react';
import { Player, PlayerSeasonStat, SeasonDb } from '@/features/players/types';
import { MatchEntry } from '@/features/match-entries/types';
import { PlayerMonthlyStat, PlayerWeeklyStat } from '@/store/footballStore';
import { Avatar } from '@/shared/components';
import { cn } from '@/shared/lib/cn';
import {
  ArrowUp, ArrowDown, Minus, ChevronUp, ChevronDown,
  Search, Play, ChevronLeft, ChevronRight,
  TrendingUp, Eye, EyeOff, Radio,
} from 'lucide-react';

interface PointsLeaderboardProps {
  players: Player[];
  matchEntries: MatchEntry[];
  seasons: SeasonDb[];
  playerSeasonStats: PlayerSeasonStat[];
  playerMonthlyStats?: PlayerMonthlyStat[];
  playerWeeklyStats?: PlayerWeeklyStat[];
  limit?: number;
  compact?: boolean;
  compactLimit?: number;
  onPlayerClick?: (playerId: string) => void;
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
  form: Array<'win' | 'draw' | 'loss'>;
  rankShift: number | null;
  isInactive: boolean;
}

interface ReplayPeriod {
  year: number;
  monthIndex: number;
  label: string;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const today = new Date();
const currentMonthIndex = today.getMonth();
const currentYear = today.getFullYear();
const currentDay = today.getDate();

type ViewMode = 'weekly' | 'monthly' | 'overall';
type SortField = 'default' | 'matches' | 'wins' | 'draws' | 'losses' | 'winRate' | 'gf' | 'gc' | 'cs' | 'ht' | 'motm' | 'points';
type SortDir = 'asc' | 'desc';
const PAGE_SIZE = 20;

const calcPts = (s: { wins: number; draws: number; losses: number; goals: number; goalsConceded: number; hattricks: number; motmCount: number }) =>
  s.wins * 10 + s.draws * 5 - s.losses * 3 + s.goals - s.goalsConceded + s.motmCount * 4 + s.hattricks;

export function PointsLeaderboard({
  players, matchEntries, seasons, playerSeasonStats,
  playerMonthlyStats = [], playerWeeklyStats = [],
  compact = false, compactLimit = 8, onPlayerClick,
}: PointsLeaderboardProps) {

  const [viewMode, setViewMode] = useState<ViewMode>('overall');
  const [selectedMonthlySeasonId, setSelectedMonthlySeasonId] = useState<number | null>(null);
  const [selectedMonthlyMonth, setSelectedMonthlyMonth] = useState<number>(currentMonthIndex);
  const [selectedOverallSeasonId, setSelectedOverallSeasonId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('default');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedWeeklySeasonId, setSelectedWeeklySeasonId] = useState<number | null>(null);
  const [selectedWeeklyMonth, setSelectedWeeklyMonth] = useState<number>(currentMonthIndex);
  const [selectedWeeklyWeek, setSelectedWeeklyWeek] = useState<number>(() => {
    if (currentDay >= 8 && currentDay <= 14) return 2;
    if (currentDay >= 15 && currentDay <= 21) return 3;
    if (currentDay >= 22) return 4;
    return 1;
  });

  // Idea 18: inactive toggle
  const [showInactive, setShowInactive] = useState(true);

  // Idea 16: replay timeline
  const [replayMode, setReplayMode] = useState(false);
  const [replayPeriodIndex, setReplayPeriodIndex] = useState(0);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDir === 'desc') setSortDir('asc');
      else { setSortField('default'); setSortDir('desc'); }
    } else {
      setSortField(field); setSortDir('desc');
    }
    setPage(1);
  };

  const { weeklyRanking, monthlyRanking, overallRanking, availablePeriods } = useMemo(() => {
    const getWeek = (dateStr: string) => {
      const d = new Date(dateStr).getDate();
      return d >= 22 ? 4 : d >= 15 ? 3 : d >= 8 ? 2 : 1;
    };

    const getForm = (playerId: string): Array<'win' | 'draw' | 'loss'> =>
      [...matchEntries]
        .filter(e => e.playerId === playerId && e.date)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(e => e.result as 'win' | 'draw' | 'loss');

    const periodSet = new Set(playerMonthlyStats.map(s => `${s.year}-${s.monthIndex}`));
    const availablePeriods: ReplayPeriod[] = [...periodSet]
      .map(key => {
        const [year, monthIndex] = key.split('-').map(Number);
        return { year, monthIndex, label: `${MONTHS_SHORT[monthIndex]} ${year}` };
      })
      .sort((a, b) => a.year !== b.year ? a.year - b.year : a.monthIndex - b.monthIndex);

    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentIds = new Set(matchEntries.filter(e => e.date && new Date(e.date) >= thirtyDaysAgo).map(e => e.playerId));

    const buildRanked = (raw: RankedPlayer[], prevRanked: { id: string; rank: number }[]): RankedPlayer[] => {
      const active = raw.filter(r => !r.isInactive).sort((a, b) => b.points - a.points);
      const inactive = raw.filter(r => r.isInactive);
      return [
        ...active.map((r, i) => {
          const prev = prevRanked.find(x => x.id === r.player.id);
          return { ...r, rankShift: prev ? prev.rank - (i + 1) : null };
        }),
        ...inactive.map(r => ({ ...r, rankShift: null })),
      ];
    };

    // ── Weekly ──────────────────────────────────────────────────────
    const prevWeek = selectedWeeklyWeek > 1 ? selectedWeeklyWeek - 1 : null;
    const prevWeeklyMap = new Map<string, number>();
    if (prevWeek !== null) {
      players.forEach(p => {
        const s = playerWeeklyStats.filter(s =>
          s.playerId === p.id && s.monthIndex === selectedWeeklyMonth && s.week === prevWeek &&
          (selectedWeeklySeasonId !== null ? s.seasonId === selectedWeeklySeasonId : s.year === currentYear)
        );
        prevWeeklyMap.set(p.id, calcPts({ wins: s.reduce((t,x)=>t+x.wins,0), draws: s.reduce((t,x)=>t+x.draws,0), losses: s.reduce((t,x)=>t+x.losses,0), goals: s.reduce((t,x)=>t+x.goals,0), goalsConceded: s.reduce((t,x)=>t+(x.goalsConceded||0),0), hattricks: s.reduce((t,x)=>t+(x.hattricks||0),0), motmCount: s.reduce((t,x)=>t+(x.motmCount||0),0) }));
      });
    }
    const prevWeeklyRanked = [...prevWeeklyMap.entries()].sort((a,b)=>b[1]-a[1]).map(([id],i)=>({id,rank:i+1}));

    const weeklyRaw: RankedPlayer[] = players.map(p => {
      const entries = matchEntries.filter(e => {
        if (e.playerId !== p.id || !e.date) return false;
        const d = new Date(e.date);
        if (isNaN(d.getTime())) return false;
        return d.getMonth() === selectedWeeklyMonth && getWeek(e.date) === selectedWeeklyWeek &&
          (selectedWeeklySeasonId !== null ? e.seasonId === selectedWeeklySeasonId : d.getFullYear() === currentYear);
      });
      let wins, draws, losses, gf, gc, cs, ht, motm;
      if (entries.length > 0) {
        wins=entries.filter(e=>e.result==='win').length; draws=entries.filter(e=>e.result==='draw').length; losses=entries.filter(e=>e.result==='loss').length;
        gf=entries.reduce((t,e)=>t+(e.goals||0),0); gc=entries.reduce((t,e)=>t+(e.goalsConceded||0),0); cs=entries.filter(e=>e.cleanSheet).length;
        ht=entries.reduce((t,e)=>t+(e.hattricks||0),0); motm=entries.filter(e=>e.motm).length;
      } else {
        const s = playerWeeklyStats.filter(s => s.playerId===p.id && s.monthIndex===selectedWeeklyMonth && s.week===selectedWeeklyWeek && (selectedWeeklySeasonId!==null?s.seasonId===selectedWeeklySeasonId:s.year===currentYear));
        wins=s.reduce((t,x)=>t+x.wins,0); draws=s.reduce((t,x)=>t+x.draws,0); losses=s.reduce((t,x)=>t+x.losses,0);
        gf=s.reduce((t,x)=>t+x.goals,0); gc=s.reduce((t,x)=>t+(x.goalsConceded||0),0); cs=s.reduce((t,x)=>t+(x.cleansheets||0),0);
        ht=s.reduce((t,x)=>t+(x.hattricks||0),0); motm=s.reduce((t,x)=>t+(x.motmCount||0),0);
      }
      const matches=wins+draws+losses, winRate=matches>0?Math.round((wins/matches)*100):0;
      return {player:p, points:calcPts({wins,draws,losses,goals:gf,goalsConceded:gc,hattricks:ht,motmCount:motm}), matches,wins,draws,losses,winRate,gf,gc,cs,ht,motm, form:getForm(p.id), rankShift:null, isInactive:matches===0};
    });

    // ── Monthly ─────────────────────────────────────────────────────
    const prevMonth = selectedMonthlyMonth > 0 ? selectedMonthlyMonth - 1 : null;
    const prevMonthlyMap = new Map<string, number>();
    if (prevMonth !== null) {
      players.forEach(p => {
        const s = playerMonthlyStats.filter(s => s.playerId===p.id && s.monthIndex===prevMonth && (selectedMonthlySeasonId!==null?s.seasonId===selectedMonthlySeasonId:s.year===currentYear));
        prevMonthlyMap.set(p.id, calcPts({wins:s.reduce((t,x)=>t+x.wins,0),draws:s.reduce((t,x)=>t+x.draws,0),losses:s.reduce((t,x)=>t+x.losses,0),goals:s.reduce((t,x)=>t+x.goals,0),goalsConceded:s.reduce((t,x)=>t+(x.goalsConceded||0),0),hattricks:s.reduce((t,x)=>t+(x.hattricks||0),0),motmCount:s.reduce((t,x)=>t+(x.motmCount||0),0)}));
      });
    }
    const prevMonthlyRanked = [...prevMonthlyMap.entries()].sort((a,b)=>b[1]-a[1]).map(([id],i)=>({id,rank:i+1}));

    const monthlyRaw: RankedPlayer[] = players.map(p => {
      const s = playerMonthlyStats.filter(s => s.playerId===p.id && s.monthIndex===selectedMonthlyMonth && (selectedMonthlySeasonId!==null?s.seasonId===selectedMonthlySeasonId:s.year===currentYear));
      const wins=s.reduce((t,x)=>t+x.wins,0),draws=s.reduce((t,x)=>t+x.draws,0),losses=s.reduce((t,x)=>t+x.losses,0);
      const gf=s.reduce((t,x)=>t+x.goals,0),gc=s.reduce((t,x)=>t+(x.goalsConceded||0),0),cs=s.reduce((t,x)=>t+(x.cleansheets||0),0);
      const ht=s.reduce((t,x)=>t+(x.hattricks||0),0),motm=s.reduce((t,x)=>t+(x.motmCount||0),0);
      const matches=wins+draws+losses,winRate=matches>0?Math.round((wins/matches)*100):0;
      return {player:p,points:calcPts({wins,draws,losses,goals:gf,goalsConceded:gc,hattricks:ht,motmCount:motm}),matches,wins,draws,losses,winRate,gf,gc,cs,ht,motm,form:getForm(p.id),rankShift:null,isInactive:matches===0};
    });

    // ── Overall ─────────────────────────────────────────────────────
    const seasonIds = seasons.map(s => s.id);
    let prevSeasonId: number | null = null;
    if (selectedOverallSeasonId !== null) {
      const idx = seasonIds.indexOf(selectedOverallSeasonId);
      prevSeasonId = idx > 0 ? seasonIds[idx - 1] : null;
    }
    const prevOverallMap = new Map<string, number>();
    if (prevSeasonId !== null) {
      players.forEach(p => {
        const s = playerSeasonStats.filter(s => s.playerId===p.id && s.seasonId===prevSeasonId);
        prevOverallMap.set(p.id, s.reduce((t,x)=>t+x.wins*10+x.draws*5-x.losses*3+x.goals-x.goalsConceded+x.motmCount*4+x.hattricks,0));
      });
    }
    const prevOverallRanked = [...prevOverallMap.entries()].sort((a,b)=>b[1]-a[1]).map(([id],i)=>({id,rank:i+1}));

    const overallRaw: RankedPlayer[] = players.map(p => {
      const s = playerSeasonStats.filter(s => s.playerId===p.id && (selectedOverallSeasonId===null||s.seasonId===selectedOverallSeasonId));
      const wins=s.reduce((t,x)=>t+x.wins,0),draws=s.reduce((t,x)=>t+x.draws,0),losses=s.reduce((t,x)=>t+x.losses,0);
      const gf=s.reduce((t,x)=>t+x.goals,0),gc=s.reduce((t,x)=>t+(x.goalsConceded||0),0),cs=s.reduce((t,x)=>t+(x.cleansheets||0),0);
      const ht=s.reduce((t,x)=>t+(x.hattricks||0),0),motm=s.reduce((t,x)=>t+(x.motmCount||0),0);
      const matches=wins+draws+losses,winRate=matches>0?Math.round((wins/matches)*100):0;
      return {player:p,points:wins*10+draws*5-losses*3+gf-gc+motm*4+ht,matches,wins,draws,losses,winRate,gf,gc,cs,ht,motm,form:getForm(p.id),rankShift:null,isInactive:!recentIds.has(p.id)};
    });

    const mlabel = `${MONTHS[selectedMonthlyMonth]} · ${selectedMonthlySeasonId?seasons.find(s=>s.id===selectedMonthlySeasonId)?.name??'':currentYear}`;
    const wlabel = `Week ${selectedWeeklyWeek} · ${MONTHS[selectedWeeklyMonth]} · ${selectedWeeklySeasonId?seasons.find(s=>s.id===selectedWeeklySeasonId)?.name??'':currentYear}`;
    const olabel = selectedOverallSeasonId?(seasons.find(s=>s.id===selectedOverallSeasonId)?.name??'Overall'):'All Time';

    return {
      weeklyRanking:  { label: wlabel, list: buildRanked(weeklyRaw, prevWeeklyRanked) },
      monthlyRanking: { label: mlabel, list: buildRanked(monthlyRaw, prevMonthlyRanked) },
      overallRanking: { label: olabel, list: buildRanked(overallRaw, prevSeasonId!==null?prevOverallRanked:[]) },
      availablePeriods,
    };
  }, [players, matchEntries, playerSeasonStats, playerMonthlyStats, playerWeeklyStats, seasons, selectedMonthlySeasonId, selectedMonthlyMonth, selectedWeeklySeasonId, selectedWeeklyMonth, selectedWeeklyWeek, selectedOverallSeasonId]);

  // Idea 16: Replay ranking
  const replayRanking = useMemo(() => {
    if (!replayMode || availablePeriods.length === 0) return null;
    const period = availablePeriods[Math.min(replayPeriodIndex, availablePeriods.length - 1)];
    if (!period) return null;
    const getForm = (pid: string): Array<'win' | 'draw' | 'loss'> =>
      [...matchEntries].filter(e=>e.playerId===pid&&e.date)
        .sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime())
        .slice(0,5).map(e=>e.result as 'win'|'draw'|'loss');
    const list: RankedPlayer[] = players.map(p => {
      const s = playerMonthlyStats.filter(x => x.playerId===p.id && x.year===period.year && x.monthIndex===period.monthIndex);
      const wins=s.reduce((t,x)=>t+x.wins,0),draws=s.reduce((t,x)=>t+x.draws,0),losses=s.reduce((t,x)=>t+x.losses,0);
      const gf=s.reduce((t,x)=>t+x.goals,0),gc=s.reduce((t,x)=>t+(x.goalsConceded||0),0),cs=s.reduce((t,x)=>t+(x.cleansheets||0),0);
      const ht=s.reduce((t,x)=>t+(x.hattricks||0),0),motm=s.reduce((t,x)=>t+(x.motmCount||0),0);
      const matches=wins+draws+losses,winRate=matches>0?Math.round((wins/matches)*100):0;
      return {player:p,points:calcPts({wins,draws,losses,goals:gf,goalsConceded:gc,hattricks:ht,motmCount:motm}),matches,wins,draws,losses,winRate,gf,gc,cs,ht,motm,form:getForm(p.id),rankShift:null,isInactive:matches===0};
    });
    const active = list.filter(r=>!r.isInactive).sort((a,b)=>b.points-a.points);
    const isLive = period.year === currentYear && period.monthIndex === currentMonthIndex;
    return { label: `${period.label}${isLive?' · 🔴 LIVE':' · Replay'}`, list: [...active,...list.filter(r=>r.isInactive)], isLive };
  }, [replayMode, replayPeriodIndex, availablePeriods, players, playerMonthlyStats, matchEntries]);

  const baseRanking = (replayMode && replayRanking) ? replayRanking
    : viewMode === 'weekly' ? weeklyRanking
    : viewMode === 'monthly' ? monthlyRanking
    : overallRanking;

  // Idea 18: Filter inactive
  const visibleList = showInactive ? baseRanking.list : baseRanking.list.filter(r => !r.isInactive);

  // Idea 17: Most Improved
  const mostImproved = useMemo(() => {
    const candidates = baseRanking.list.filter(r => !r.isInactive && r.rankShift !== null && r.rankShift >= 2);
    if (!candidates.length) return null;
    return candidates.reduce((best, r) => r.rankShift! > best.rankShift! ? r : best);
  }, [baseRanking.list]);

  // Search & sort
  const searchFiltered = useMemo(() => {
    if (!searchQuery.trim()) return visibleList;
    const q = searchQuery.toLowerCase();
    return visibleList.filter(r => r.player.name.toLowerCase().includes(q));
  }, [visibleList, searchQuery]);

  const sortedList = useMemo(() => {
    if (sortField === 'default') return searchFiltered;
    const active = searchFiltered.filter(r=>!r.isInactive);
    const inactive = searchFiltered.filter(r=>r.isInactive);
    const valOf = (r: RankedPlayer) => {
      switch(sortField) {
        case 'matches': return r.matches; case 'wins': return r.wins; case 'draws': return r.draws;
        case 'losses': return r.losses; case 'winRate': return r.winRate; case 'gf': return r.gf;
        case 'gc': return r.gc; case 'cs': return r.cs; case 'ht': return r.ht;
        case 'motm': return r.motm; case 'points': return r.points; default: return 0;
      }
    };
    return [...active.sort((a,b)=>sortDir==='desc'?valOf(b)-valOf(a):valOf(a)-valOf(b)), ...inactive];
  }, [searchFiltered, sortField, sortDir]);

  const totalEntries = sortedList.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, totalEntries);
  const pageList = compact ? sortedList.slice(0, compactLimit) : sortedList.slice(pageStart, pageEnd);
  // Always use the FULL unfiltered list for rank numbers so search doesn't re-rank players
  const activeListForRank = baseRanking.list.filter(r => !r.isInactive);
  const allInactiveCount = baseRanking.list.filter(r => r.isInactive).length;
  const inactiveCount = sortedList.filter(r => r.isInactive).length;
  const isEmpty = activeListForRank.length === 0;

  const selectCls = "text-xs bg-background border border-border rounded-lg px-3 py-1.5 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer shadow-sm transition-all";
  const handleViewMode = (mode: ViewMode) => { setViewMode(mode); setPage(1); setReplayMode(false); };

  const SortTh = ({ field, label, title }: { field: SortField; label: string; title: string }) => {
    const active = sortField === field;
    return (
      <th title={title} onClick={() => handleSort(field)}
        className="py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap select-none cursor-pointer hover:text-foreground transition-colors text-center px-1 group">
        <span className="inline-flex items-center gap-0.5">
          {label}
          {active ? (sortDir==='desc'?<ChevronDown className="w-3 h-3 text-primary"/>:<ChevronUp className="w-3 h-3 text-primary"/>)
          :<ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity"/>}
        </span>
      </th>
    );
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Controls Row */}
      <div className="flex flex-wrap items-center gap-3">
        {!replayMode && (
          <div className="flex items-center gap-1 bg-muted/40 border border-border p-1 rounded-xl">
            {(['weekly','monthly','overall'] as ViewMode[]).map(mode => (
              <button key={mode} onClick={() => handleViewMode(mode)}
                className={cn("px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                  viewMode===mode?"bg-primary text-primary-foreground shadow-md":"text-muted-foreground hover:text-foreground hover:bg-background/60")}>
                {mode}
              </button>
            ))}
          </div>
        )}

        {!replayMode && viewMode==='weekly' && (
          <div className="flex items-center gap-2">
            <select value={selectedWeeklySeasonId??''} onChange={e=>{setSelectedWeeklySeasonId(e.target.value===''?null:Number(e.target.value));setPage(1);}} className={selectCls}>
              <option value="">{currentYear} (Current)</option>
              {seasons.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={selectedWeeklyMonth} onChange={e=>{setSelectedWeeklyMonth(Number(e.target.value));setPage(1);}} className={selectCls}>
              {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
            </select>
            <select value={selectedWeeklyWeek} onChange={e=>{setSelectedWeeklyWeek(Number(e.target.value));setPage(1);}} className={selectCls}>
              {[1,2,3,4].map(w=><option key={w} value={w}>Week {w}</option>)}
            </select>
          </div>
        )}

        {!replayMode && viewMode==='monthly' && (
          <div className="flex items-center gap-2">
            <select value={selectedMonthlySeasonId??''} onChange={e=>{setSelectedMonthlySeasonId(e.target.value===''?null:Number(e.target.value));setPage(1);}} className={selectCls}>
              <option value="">{currentYear} (Current)</option>
              {seasons.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={selectedMonthlyMonth} onChange={e=>{setSelectedMonthlyMonth(Number(e.target.value));setPage(1);}} className={selectCls}>
              {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
            </select>
          </div>
        )}

        {!replayMode && viewMode==='overall' && (
          <select value={selectedOverallSeasonId??''} onChange={e=>{setSelectedOverallSeasonId(e.target.value===''?null:Number(e.target.value));setPage(1);}} className={selectCls}>
            <option value="">All Time</option>
            {seasons.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* Idea 18: inactive toggle */}
          {allInactiveCount > 0 && (
            <button onClick={() => setShowInactive(v=>!v)}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all",
                showInactive?"bg-muted/40 border-border text-muted-foreground hover:bg-muted/60":"bg-muted/20 border-border/50 text-muted-foreground/50")}>
              {showInactive?<Eye className="w-3.5 h-3.5"/>:<EyeOff className="w-3.5 h-3.5"/>}
              {showInactive?`Hide inactive (${allInactiveCount})`:`Show inactive (${allInactiveCount})`}
            </button>
          )}

          {/* Idea 16: replay button */}
          {!compact && availablePeriods.length > 0 && (
            <button onClick={() => { if(!replayMode){setReplayMode(true);setReplayPeriodIndex(availablePeriods.length-1);}else setReplayMode(false); }}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all",
                replayMode?"bg-violet-500/20 border-violet-500/40 text-violet-500":"bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted/60")}>
              <Play className="w-3.5 h-3.5"/>
              {replayMode?'Exit Replay':'📅 Replay'}
            </button>
          )}

          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
            {baseRanking.label}
          </span>
        </div>
      </div>

      {/* Idea 16: Replay Timeline Slider */}
      {replayMode && availablePeriods.length > 0 && (
        <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-violet-500/80">📅 Timeline Replay</span>
              {replayRanking?.isLive && (
                <span className="flex items-center gap-1 text-[10px] font-black text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                  <Radio className="w-2.5 h-2.5 animate-pulse"/> LIVE
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-foreground bg-background/80 border border-border px-3 py-1 rounded-lg shadow-sm">
              {availablePeriods[Math.min(replayPeriodIndex, availablePeriods.length-1)]?.label ?? '—'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setReplayPeriodIndex(i=>Math.max(0,i-1))} disabled={replayPeriodIndex===0}
              className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronLeft className="w-4 h-4"/>
            </button>
            <div className="flex-1">
              <input type="range" min={0} max={availablePeriods.length-1} value={replayPeriodIndex}
                onChange={e => setReplayPeriodIndex(Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"/>
              <div className="flex justify-between mt-0.5">
                <span className="text-[10px] text-muted-foreground/50">{availablePeriods[0]?.label}</span>
                <span className="text-[10px] text-muted-foreground/50">{availablePeriods[availablePeriods.length-1]?.label}</span>
              </div>
            </div>
            <button onClick={() => setReplayPeriodIndex(i=>Math.min(availablePeriods.length-1,i+1))} disabled={replayPeriodIndex===availablePeriods.length-1}
              className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronRight className="w-4 h-4"/>
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/50 text-center">{availablePeriods.length} monthly periods available · drag to navigate</p>
        </div>
      )}

      {/* Idea 17: Most Improved Banner */}
      {mostImproved && !replayMode && !compact && (
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4 flex-wrap">
          <div className="absolute top-0 right-0 w-40 h-full bg-emerald-500/5 blur-2xl pointer-events-none"/>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-500"/>
            </div>
            <Avatar name={mostImproved.player.name} size={36} src={(mostImproved.player as any).profileImageUrl} className="ring-2 ring-emerald-500/30 shrink-0"/>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70">🚀 Most Improved</p>
              <p className="text-sm font-bold text-foreground">{mostImproved.player.name}</p>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-3 ml-auto flex-wrap">
            <span className="flex items-center gap-1 text-xs font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <ArrowUp className="w-3.5 h-3.5"/> ▲{mostImproved.rankShift} rank{mostImproved.rankShift !== 1 ? 's' : ''} up
            </span>
            <span className="text-xs text-muted-foreground">
              Now <span className="font-bold text-foreground">#{activeListForRank.findIndex(r=>r.player.id===mostImproved.player.id)+1}</span>
              {' · '}{mostImproved.points > 0 ? `+${mostImproved.points}` : mostImproved.points} pts
            </span>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"/>
        <input type="text" placeholder="Search player..." value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm transition-all"/>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '44px' }}/>
              <col style={{ width: '140px' }}/>
              <col style={{ width: '90px' }}/>
              <col style={{ width: '48px' }}/><col style={{ width: '48px' }}/><col style={{ width: '48px' }}/><col style={{ width: '48px' }}/>
              <col style={{ width: '60px' }}/><col style={{ width: '48px' }}/><col style={{ width: '48px' }}/><col style={{ width: '48px' }}/>
              <col style={{ width: '64px' }}/><col style={{ width: '64px' }}/><col style={{ width: '64px' }}/>
            </colgroup>
            <thead className="sticky top-0 z-20">
              <tr className="bg-muted/60 backdrop-blur border-b border-border">
                <th title="Rank" className="py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap select-none text-center px-2">#</th>
                <th title="Player" className="py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap select-none text-left px-3">Player</th>
                <th title="Recent Form" className="py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap select-none text-center px-1">Form</th>
                <SortTh field="matches" label="M" title="Matches"/>
                <SortTh field="wins" label="W" title="Wins"/>
                <SortTh field="draws" label="D" title="Draws"/>
                <SortTh field="losses" label="L" title="Losses"/>
                <SortTh field="winRate" label="Win%" title="Win Rate"/>
                <SortTh field="gf" label="GF" title="Goals For"/>
                <SortTh field="gc" label="GC" title="Goals Conceded"/>
                <SortTh field="cs" label="CS" title="Clean Sheets"/>
                <SortTh field="ht" label="HT" title="Hat-tricks"/>
                <SortTh field="motm" label="MOTM" title="Man of the Match"/>
                <SortTh field="points" label="Pts" title="Points"/>
              </tr>
            </thead>
            <tbody>
              {isEmpty ? (
                <tr><td colSpan={14} className="py-20 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2"><span className="text-4xl">📊</span><p className="font-medium text-sm">No data for this period</p></div>
                </td></tr>
              ) : pageList.map(r => {
                const activeRank = !r.isInactive ? activeListForRank.findIndex(x => x.player.id === r.player.id) : -1;
                const isTop3 = activeRank >= 0 && activeRank < 3;
                const medalCls = r.isInactive ? 'bg-muted/30 text-muted-foreground/30 text-[10px]'
                  : activeRank===0 ? 'medal-gold' : activeRank===1 ? 'medal-silver' : activeRank===2 ? 'medal-bronze'
                  : 'bg-muted/60 text-muted-foreground/70 text-[10px]';
                const rowCls = r.isInactive ? 'opacity-40 bg-muted/10'
                  : activeRank===0 ? 'bg-amber-500/5 hover:bg-amber-500/10'
                  : activeRank===1 ? 'bg-slate-400/5 hover:bg-slate-400/10'
                  : activeRank===2 ? 'bg-orange-700/5 hover:bg-orange-700/10'
                  : 'hover:bg-muted/40';

                return (
                  <tr key={r.player.id}
                    onClick={() => !r.isInactive && onPlayerClick?.(r.player.id)}
                    className={cn("border-b border-border/50 transition-colors group", rowCls, !r.isInactive && onPlayerClick && "cursor-pointer")}>

                    <td className="py-2.5 px-2 text-center">
                      {r.isInactive ? <span className="text-[10px] text-muted-foreground/30 font-bold">—</span> : (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className={cn('w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black mx-auto shrink-0 shadow-sm', medalCls)}>{activeRank+1}</div>
                          {r.rankShift !== null && (
                            <span className={cn("flex items-center text-[9px] font-bold leading-none",
                              r.rankShift>0?"text-emerald-500":r.rankShift<0?"text-red-500":"text-muted-foreground/50")}>
                              {r.rankShift>0?<ArrowUp className="w-2.5 h-2.5"/>:r.rankShift<0?<ArrowDown className="w-2.5 h-2.5"/>:<Minus className="w-2.5 h-2.5"/>}
                              {r.rankShift!==0&&Math.abs(r.rankShift)}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar name={r.player.name} size={28} src={(r.player as any).profileImageUrl}/>
                        <div className="min-w-0">
                          <span className={cn("font-semibold text-foreground truncate text-[13px] block", isTop3&&"font-bold")}>{r.player.name}</span>
                          {r.isInactive && <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/40 bg-muted/30 px-1.5 py-0.5 rounded">Inactive</span>}
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-1 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {r.form.length===0 ? <span className="text-muted-foreground/40 text-[11px]">—</span>
                          : r.form.map((res,fi)=>(
                            <span key={fi} className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black shadow-sm",
                              res==='win'?"bg-emerald-500/20 text-emerald-500 ring-1 ring-emerald-500/30":
                              res==='draw'?"bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/30":
                              "bg-red-500/20 text-red-500 ring-1 ring-red-500/30")}>
                              {res.charAt(0).toUpperCase()}
                            </span>
                          ))}
                      </div>
                    </td>

                    <td className="py-2.5 px-1 text-center text-muted-foreground font-medium text-[13px]">{r.matches}</td>
                    <td className="py-2.5 px-1 text-center"><span className={cn("font-semibold text-[13px]",r.wins>0?"text-emerald-500":"text-muted-foreground/50")}>{r.wins}</span></td>
                    <td className="py-2.5 px-1 text-center"><span className={cn("font-semibold text-[13px]",r.draws>0?"text-amber-500":"text-muted-foreground/50")}>{r.draws}</span></td>
                    <td className="py-2.5 px-1 text-center"><span className={cn("font-semibold text-[13px]",r.losses>0?"text-red-500":"text-muted-foreground/50")}>{r.losses}</span></td>
                    <td className="py-2.5 px-1 text-center">
                      <span className={cn("text-[11px] font-bold px-1.5 py-0.5 rounded-md",
                        r.winRate>=60?"bg-emerald-500/15 text-emerald-600":r.winRate>=40?"bg-amber-500/15 text-amber-600":
                        r.matches>0?"bg-red-500/10 text-red-500":"text-muted-foreground/40")}>
                        {r.matches>0?`${r.winRate}%`:'—'}
                      </span>
                    </td>
                    <td className="py-2.5 px-1 text-center font-medium text-foreground/80 text-[13px]">{r.gf}</td>
                    <td className="py-2.5 px-1 text-center font-medium text-foreground/80 text-[13px]">{r.gc}</td>
                    <td className="py-2.5 px-1 text-center">
                      {r.cs>0?<span className="text-[11px] font-bold text-cyan-600 bg-cyan-500/10 px-1.5 py-0.5 rounded-md">{r.cs}</span>:<span className="text-muted-foreground/40 text-[12px]">—</span>}
                    </td>
                    <td className="py-2.5 px-1 text-center">
                      {r.ht>0?<span className="text-[11px] font-bold text-violet-600 bg-violet-500/10 px-1.5 py-0.5 rounded-md">⚽ {r.ht}</span>:<span className="text-muted-foreground/40 text-[12px]">—</span>}
                    </td>
                    <td className="py-2.5 px-1 text-center">
                      {r.motm>0?<span className="text-[11px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-md">👑 {r.motm}</span>:<span className="text-muted-foreground/40 text-[12px]">—</span>}
                    </td>
                    <td className="py-2.5 px-1 text-center">
                      <span className={cn("font-black text-[13px] px-2 py-0.5 rounded-lg border shadow-sm",
                        r.points>0?"bg-emerald-500/10 text-emerald-600 border-emerald-500/20":
                        r.points<0?"bg-red-500/10 text-red-500 border-red-500/20":
                        "bg-muted text-muted-foreground border-border")}>
                        {r.points>0?`+${r.points}`:r.points}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!isEmpty && !compact && (
        <div className="flex items-center justify-between px-1 flex-wrap gap-2">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{pageStart+1}–{pageEnd}</span> of{' '}
            <span className="font-semibold text-foreground">{totalEntries}</span> players
            {inactiveCount>0&&showInactive&&<span className="text-muted-foreground/50 ml-1">({inactiveCount} inactive)</span>}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={safePage<=1}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all",
                safePage<=1?"border-border/50 text-muted-foreground/40 cursor-not-allowed":"border-border bg-card hover:bg-muted/50 text-foreground active:scale-95")}>
              ← Previous
            </button>
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 min-w-[80px] text-center">Page {safePage}/{totalPages}</span>
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={safePage>=totalPages}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all",
                safePage>=totalPages?"border-border/50 text-muted-foreground/40 cursor-not-allowed":"border-border bg-card hover:bg-muted/50 text-foreground active:scale-95")}>
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
