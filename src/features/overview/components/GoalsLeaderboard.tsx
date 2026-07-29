import { useMemo, useState } from 'react';
import { Player, PlayerSeasonStat, SeasonDb } from '@/features/players/types';
import { MatchEntry } from '@/features/match-entries/types';
import { PlayerMonthlyStat, PlayerWeeklyStat } from '@/store/footballStore';
import { Avatar } from '@/shared/components';
import { cn } from '@/shared/lib/cn';
import {
  ArrowUp, ArrowDown, Minus, ChevronUp, ChevronDown,
  Search, Play, ChevronLeft, ChevronRight,
  TrendingUp, Eye, EyeOff, Radio, Crown
} from 'lucide-react';

interface GoalsLeaderboardProps {
  players: Player[];
  matchEntries: MatchEntry[];
  seasons: SeasonDb[];
  playerSeasonStats: PlayerSeasonStat[];
  playerMonthlyStats?: PlayerMonthlyStat[];
  playerWeeklyStats?: PlayerWeeklyStat[];
  limit?: number;
  onPlayerClick?: (playerId: string) => void;
}

interface RankedPlayer {
  player: Player;
  goals: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
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
const TAUNTS = [
  "Beat me if you can! ⚔️",
  "Catch me at the top! ⚡",
  "Top Goalscorer! ⚽👑",
  "Can anyone dethrone me? 🏆",
  "Sitting at #1! 🔥"
];

const today = new Date();
const currentMonthIndex = today.getMonth();
const currentYear = today.getFullYear();
const currentDay = today.getDate();

type ViewMode = 'weekly' | 'monthly' | 'overall';
type SortField = 'default' | 'matches' | 'wins' | 'draws' | 'losses' | 'winRate' | 'gc' | 'cs' | 'ht' | 'motm' | 'goals';
type SortDir = 'asc' | 'desc';
const PAGE_SIZE = 20;

export function GoalsLeaderboard({
  players, matchEntries, seasons, playerSeasonStats,
  playerMonthlyStats = [], playerWeeklyStats = [], onPlayerClick,
}: GoalsLeaderboardProps) {

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

  const [showInactive, setShowInactive] = useState(true);
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
      const active = raw.filter(r => !r.isInactive).sort((a, b) => b.goals - a.goals);
      const inactive = raw.filter(r => r.isInactive);
      return [
        ...active.map((r, i) => {
          const prev = prevRanked.find(x => x.id === r.player.id);
          return { ...r, rankShift: prev ? prev.rank - (i + 1) : null };
        }),
        ...inactive.map(r => ({ ...r, rankShift: null })),
      ];
    };

    // Weekly
    const prevWeek = selectedWeeklyWeek > 1 ? selectedWeeklyWeek - 1 : null;
    const prevWeeklyMap = new Map<string, number>();
    if (prevWeek !== null) {
      players.forEach(p => {
        const s = playerWeeklyStats.filter(s =>
          s.playerId === p.id && s.monthIndex === selectedWeeklyMonth && s.week === prevWeek &&
          (selectedWeeklySeasonId !== null ? s.seasonId === selectedWeeklySeasonId : s.year === currentYear)
        );
        prevWeeklyMap.set(p.id, s.reduce((t, x) => t + x.goals, 0));
      });
    }
    const prevWeeklyRanked = [...prevWeeklyMap.entries()].sort((a,b)=>b[1]-a[1]).map(([id],i)=>({id,rank:i+1}));

    const weeklyRaw: RankedPlayer[] = players.map(p => {
      const s = playerWeeklyStats.filter(x =>
        x.playerId === p.id && x.monthIndex === selectedWeeklyMonth && x.week === selectedWeeklyWeek &&
        (selectedWeeklySeasonId !== null ? x.seasonId === selectedWeeklySeasonId : x.year === currentYear)
      );
      const wins=s.reduce((t,x)=>t+x.wins,0),draws=s.reduce((t,x)=>t+x.draws,0),losses=s.reduce((t,x)=>t+x.losses,0);
      const goals=s.reduce((t,x)=>t+x.goals,0),gc=s.reduce((t,x)=>t+(x.goalsConceded||0),0);
      const cs=s.reduce((t,x)=>t+(x.cleansheets||0),0),ht=s.reduce((t,x)=>t+(x.hattricks||0),0),motm=s.reduce((t,x)=>t+(x.motmCount||0),0);
      const matches=wins+draws+losses,winRate=matches>0?Math.round((wins/matches)*100):0;
      return {player:p,goals,matches,wins,draws,losses,winRate,gc,cs,ht,motm,form:getForm(p.id),rankShift:null,isInactive:matches===0};
    });

    // Monthly
    const prevMonth = selectedMonthlyMonth > 0 ? selectedMonthlyMonth - 1 : null;
    const prevMonthlyMap = new Map<string, number>();
    if (prevMonth !== null) {
      players.forEach(p => {
        const s = playerMonthlyStats.filter(x =>
          x.playerId === p.id && x.monthIndex === prevMonth &&
          (selectedMonthlySeasonId !== null ? x.seasonId === selectedMonthlySeasonId : x.year === currentYear)
        );
        prevMonthlyMap.set(p.id, s.reduce((t, x) => t + x.goals, 0));
      });
    }
    const prevMonthlyRanked = [...prevMonthlyMap.entries()].sort((a,b)=>b[1]-a[1]).map(([id],i)=>({id,rank:i+1}));

    const monthlyRaw: RankedPlayer[] = players.map(p => {
      const s = playerMonthlyStats.filter(x =>
        x.playerId === p.id && x.monthIndex === selectedMonthlyMonth &&
        (selectedMonthlySeasonId !== null ? x.seasonId === selectedMonthlySeasonId : x.year === currentYear)
      );
      const wins=s.reduce((t,x)=>t+x.wins,0),draws=s.reduce((t,x)=>t+x.draws,0),losses=s.reduce((t,x)=>t+x.losses,0);
      const goals=s.reduce((t,x)=>t+x.goals,0),gc=s.reduce((t,x)=>t+(x.goalsConceded||0),0);
      const cs=s.reduce((t,x)=>t+(x.cleansheets||0),0),ht=s.reduce((t,x)=>t+(x.hattricks||0),0),motm=s.reduce((t,x)=>t+(x.motmCount||0),0);
      const matches=wins+draws+losses,winRate=matches>0?Math.round((wins/matches)*100):0;
      return {player:p,goals,matches,wins,draws,losses,winRate,gc,cs,ht,motm,form:getForm(p.id),rankShift:null,isInactive:matches===0};
    });

    // Overall
    const seasonIds = seasons.map(s => s.id);
    let prevSeasonId: number | null = null;
    if (selectedOverallSeasonId !== null) {
      const idx = seasonIds.indexOf(selectedOverallSeasonId);
      prevSeasonId = idx > 0 ? seasonIds[idx - 1] : null;
    }
    const prevOverallMap = new Map<string, number>();
    if (prevSeasonId !== null) {
      players.forEach(p => {
        const s = playerSeasonStats.filter(x => x.playerId === p.id && x.seasonId === prevSeasonId);
        prevOverallMap.set(p.id, s.reduce((t, x) => t + (x.goals || 0), 0));
      });
    }
    const prevOverallRanked = [...prevOverallMap.entries()].sort((a,b)=>b[1]-a[1]).map(([id],i)=>({id,rank:i+1}));

    const overallRaw: RankedPlayer[] = players.map(p => {
      const s = playerSeasonStats.filter(x =>
        x.playerId === p.id && (selectedOverallSeasonId === null || x.seasonId === selectedOverallSeasonId)
      );
      const wins=s.reduce((t,x)=>t+x.wins,0),draws=s.reduce((t,x)=>t+x.draws,0),losses=s.reduce((t,x)=>t+x.losses,0);
      const goals=s.reduce((t,x)=>t+(x.goals||0),0),gc=s.reduce((t,x)=>t+(x.goalsConceded||0),0);
      const cs=s.reduce((t,x)=>t+(x.cleansheets||0),0),ht=s.reduce((t,x)=>t+(x.hattricks||0),0),motm=s.reduce((t,x)=>t+(x.motmCount||0),0);
      const matches=wins+draws+losses,winRate=matches>0?Math.round((wins/matches)*100):0;
      return {player:p,goals,matches,wins,draws,losses,winRate,gc,cs,ht,motm,form:getForm(p.id),rankShift:null,isInactive:!recentIds.has(p.id)};
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

  const replayRanking = useMemo(() => {
    if (!replayMode || availablePeriods.length === 0) return null;
    const period = availablePeriods[Math.min(replayPeriodIndex, availablePeriods.length - 1)];
    if (!period) return null;
    const getForm = (pid: string): Array<'win' | 'draw' | 'loss'> =>
      [...matchEntries].filter(e=>e.playerId===pid&&e.date)
        .sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime())
        .slice(0,5).map(e=>e.result as 'win'|'draw'|'loss');
    const list: RankedPlayer[] = players.map(p => {
      const s = playerMonthlyStats.filter(x=>x.playerId===p.id&&x.year===period.year&&x.monthIndex===period.monthIndex);
      const wins=s.reduce((t,x)=>t+x.wins,0),draws=s.reduce((t,x)=>t+x.draws,0),losses=s.reduce((t,x)=>t+x.losses,0);
      const goals=s.reduce((t,x)=>t+x.goals,0),gc=s.reduce((t,x)=>t+(x.goalsConceded||0),0);
      const cs=s.reduce((t,x)=>t+(x.cleansheets||0),0),ht=s.reduce((t,x)=>t+(x.hattricks||0),0),motm=s.reduce((t,x)=>t+(x.motmCount||0),0);
      const matches=wins+draws+losses,winRate=matches>0?Math.round((wins/matches)*100):0;
      return {player:p,goals,matches,wins,draws,losses,winRate,gc,cs,ht,motm,form:getForm(p.id),rankShift:null,isInactive:matches===0};
    });
    const active = list.filter(r=>!r.isInactive).sort((a,b)=>b.goals-a.goals);
    const isLive = period.year === currentYear && period.monthIndex === currentMonthIndex;
    return { label: `${period.label}${isLive?' · 🔴 LIVE':' · Replay'}`, list: [...active,...list.filter(r=>r.isInactive)], isLive };
  }, [replayMode, replayPeriodIndex, availablePeriods, players, playerMonthlyStats, matchEntries]);

  const baseRanking = (replayMode && replayRanking) ? replayRanking
    : viewMode === 'weekly' ? weeklyRanking
    : viewMode === 'monthly' ? monthlyRanking
    : overallRanking;

  const visibleList = showInactive ? baseRanking.list : baseRanking.list.filter(r => !r.isInactive);

  const mostImproved = useMemo(() => {
    const candidates = baseRanking.list.filter(r => !r.isInactive && r.rankShift !== null && r.rankShift >= 2);
    if (!candidates.length) return null;
    return candidates.reduce((best, r) => r.rankShift! > best.rankShift! ? r : best);
  }, [baseRanking.list]);

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
        case 'losses': return r.losses; case 'winRate': return r.winRate; case 'gc': return r.gc;
        case 'cs': return r.cs; case 'ht': return r.ht; case 'motm': return r.motm;
        case 'goals': return r.goals; default: return 0;
      }
    };
    return [...active.sort((a,b)=>sortDir==='desc'?valOf(b)-valOf(a):valOf(a)-valOf(b)), ...inactive];
  }, [searchFiltered, sortField, sortDir]);

  const totalEntries = sortedList.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, totalEntries);
  const pageList = sortedList.slice(pageStart, pageEnd);
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
          {allInactiveCount > 0 && (
            <button onClick={() => setShowInactive(v=>!v)}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all",
                showInactive?"bg-muted/40 border-border text-muted-foreground hover:bg-muted/60":"bg-muted/20 border-border/50 text-muted-foreground/50")}>
              {showInactive?<Eye className="w-3.5 h-3.5"/>:<EyeOff className="w-3.5 h-3.5"/>}
              {showInactive?`Hide inactive (${allInactiveCount})`:`Show inactive (${allInactiveCount})`}
            </button>
          )}

          {availablePeriods.length > 0 && (
            <button onClick={() => { if(!replayMode){setReplayMode(true);setReplayPeriodIndex(availablePeriods.length-1);}else setReplayMode(false); }}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all",
                replayMode?"bg-violet-500/20 border-violet-500/40 text-violet-500":"bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted/60")}>
              <Play className="w-3.5 h-3.5"/>
              {replayMode?'Exit Replay':'📅 Replay'}
            </button>
          )}

          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 border border-red-500/20 whitespace-nowrap">
            {baseRanking.label}
          </span>
        </div>
      </div>

      {/* Replay Timeline */}
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

      {/* Most Improved Banner */}
      {mostImproved && !replayMode && (
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
              {' · '}{mostImproved.goals} goals
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

      {/* ── MOBILE CARDS VIEW (< md) WITH SPEECH BUBBLE FOR #1 ───────────────── */}
      <div className="flex flex-col gap-3 md:hidden">
        {isEmpty ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground shadow-sm">
            <span className="text-4xl block mb-2">⚽</span>
            <p className="font-medium text-sm">No data for this period</p>
          </div>
        ) : (
          pageList.map(r => {
            const activeRank = !r.isInactive ? activeListForRank.findIndex(x => x.player.id === r.player.id) : -1;
            const isTop3 = activeRank >= 0 && activeRank < 3;
            const isRank1 = activeRank === 0;

            return (
              <div key={r.player.id} className="relative pt-2">
                {/* 💬 Challenge Speech Bubble for #1 Top Scorer */}
                {isRank1 && (
                  <div className="absolute -top-3 left-10 z-20 animate-bounce">
                    <div className="relative border-2 border-red-500/60 bg-gradient-to-r from-red-950 via-zinc-900 to-red-950 px-3 py-1 text-red-300 shadow-md rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border-red-500/80">
                      <span>{TAUNTS[Math.abs(r.player.name.length) % TAUNTS.length]}</span>
                      <div className="absolute -bottom-1.5 left-5 w-2 h-2 bg-zinc-900 border-r-2 border-b-2 border-red-500/80 rotate-45" />
                    </div>
                  </div>
                )}

                <div
                  onClick={() => !r.isInactive && onPlayerClick?.(r.player.id)}
                  className={cn(
                    "relative rounded-2xl border p-4 transition-all duration-200 active:scale-[0.98]",
                    activeRank === 0 ? "bg-gradient-to-r from-red-500/10 via-card to-card border-red-500/40 shadow-md" :
                    activeRank === 1 ? "bg-gradient-to-r from-slate-400/10 via-card to-card border-slate-400/40 shadow-sm" :
                    activeRank === 2 ? "bg-gradient-to-r from-amber-700/10 via-card to-card border-amber-700/40 shadow-sm" :
                    "bg-card/90 border-border/80 shadow-xs",
                    r.isInactive && "opacity-40 bg-muted/10 border-border/30",
                    !r.isInactive && onPlayerClick && "cursor-pointer"
                  )}
                >
                  {/* Card Main Content */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank Badge */}
                      <div className="flex flex-col items-center justify-center shrink-0 w-9 h-9 rounded-xl bg-background/80 border border-border/60 shadow-xs">
                        <span className={cn(
                          "font-black text-xs leading-none",
                          activeRank === 0 ? "text-red-500 text-sm" :
                          activeRank === 1 ? "text-slate-400 text-sm" :
                          activeRank === 2 ? "text-amber-700 text-sm" : "text-muted-foreground"
                        )}>
                          #{activeRank >= 0 ? activeRank + 1 : '—'}
                        </span>
                        {r.rankShift !== null && (
                          <span className={cn("flex items-center text-[8px] font-bold mt-0.5",
                            r.rankShift > 0 ? "text-emerald-500" : r.rankShift < 0 ? "text-red-500" : "text-muted-foreground/40")}>
                            {r.rankShift > 0 ? <ArrowUp className="w-2 h-2" /> : r.rankShift < 0 ? <ArrowDown className="w-2 h-2" /> : <Minus className="w-2 h-2" />}
                            {r.rankShift!==0&&Math.abs(r.rankShift)}
                          </span>
                        )}
                      </div>

                      <Avatar name={r.player.name} size={40} src={(r.player as any).profileImageUrl} />

                      <div className="min-w-0">
                        <h4 className={cn("font-bold text-foreground truncate text-sm leading-tight flex items-center gap-1.5", isTop3 && "text-red-500 font-extrabold")}>
                          {r.player.name}
                          {activeRank === 0 && <Crown className="w-3.5 h-3.5 text-red-500 inline shrink-0" />}
                        </h4>

                        {/* Recent Form Dots */}
                        {!r.isInactive && (
                          <div className="flex items-center gap-1 mt-1">
                            {r.form.map((res, fi) => (
                              <span key={fi} className={cn("w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-black shadow-xs",
                                res === 'win' ? "bg-emerald-500/25 text-emerald-500 ring-1 ring-emerald-500/30" :
                                res === 'draw' ? "bg-amber-500/25 text-amber-500 ring-1 ring-amber-500/30" :
                                "bg-red-500/25 text-red-500 ring-1 ring-red-500/30")}>
                                {res.charAt(0).toUpperCase()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Goals Pill */}
                    <div className="shrink-0 text-right">
                      <span className={cn(
                        "font-black text-sm px-3 py-1.5 rounded-xl border shadow-xs inline-block",
                        r.goals > 0 ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-muted text-muted-foreground border-border"
                      )}>
                        ⚽ {r.goals} <span className="text-[10px] font-semibold opacity-70">GOALS</span>
                      </span>
                    </div>
                  </div>

                  {/* Sub Stats Row */}
                  <div className="grid grid-cols-4 gap-1.5 pt-3 mt-3 border-t border-border/40 text-center text-xs">
                    <div className="bg-muted/20 border border-border/30 px-1 py-1 rounded-lg">
                      <span className="text-[8.5px] font-bold text-muted-foreground uppercase block tracking-wider">W-D-L</span>
                      <span className="font-bold text-foreground text-xs">{r.wins}-{r.draws}-{r.losses}</span>
                    </div>
                    <div className="bg-muted/20 border border-border/30 px-1 py-1 rounded-lg">
                      <span className="text-[8.5px] font-bold text-muted-foreground uppercase block tracking-wider">WIN %</span>
                      <span className={cn("font-bold text-xs", r.winRate >= 60 ? "text-emerald-500" : r.winRate >= 40 ? "text-amber-500" : "text-muted-foreground")}>
                        {r.matches > 0 ? `${r.winRate}%` : '—'}
                      </span>
                    </div>
                    <div className="bg-muted/20 border border-border/30 px-1 py-1 rounded-lg">
                      <span className="text-[8.5px] font-bold text-muted-foreground uppercase block tracking-wider">HAT-TRICKS</span>
                      <span className="font-bold text-violet-400 text-xs">⚽ {r.ht}</span>
                    </div>
                    <div className="bg-muted/20 border border-border/30 px-1 py-1 rounded-lg">
                      <span className="text-[8.5px] font-bold text-muted-foreground uppercase block tracking-wider">MOTM/CS</span>
                      <span className="font-bold text-amber-500 text-xs">👑{r.motm} <span className="text-cyan-500 font-semibold">🛡️{r.cs}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── DESKTOP TABLE VIEW (>= md) ────────────────────────────────────────── */}
      <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '44px' }}/>
              <col style={{ width: '140px' }}/>
              <col style={{ width: '90px' }}/>
              <col style={{ width: '48px' }}/><col style={{ width: '48px' }}/><col style={{ width: '48px' }}/><col style={{ width: '48px' }}/>
              <col style={{ width: '60px' }}/><col style={{ width: '48px' }}/><col style={{ width: '48px' }}/>
              <col style={{ width: '64px' }}/><col style={{ width: '64px' }}/><col style={{ width: '72px' }}/>
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
                <SortTh field="gc" label="GC" title="Goals Conceded"/>
                <SortTh field="cs" label="CS" title="Clean Sheets"/>
                <SortTh field="ht" label="HT" title="Hat-tricks"/>
                <SortTh field="motm" label="MOTM" title="Man of the Match"/>
                <SortTh field="goals" label="⚽ Goals" title="Goals"/>
              </tr>
            </thead>
            <tbody>
              {isEmpty ? (
                <tr><td colSpan={13} className="py-20 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2"><span className="text-4xl">⚽</span><p className="font-medium text-sm">No data for this period</p></div>
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
                        {r.form.length===0?<span className="text-muted-foreground/40 text-[11px]">—</span>
                          :r.form.map((res,fi)=>(
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
                        r.goals>0?"bg-red-500/10 text-red-600 border-red-500/20":"bg-muted text-muted-foreground border-border")}>
                        {r.goals}
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
      {!isEmpty && (
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
