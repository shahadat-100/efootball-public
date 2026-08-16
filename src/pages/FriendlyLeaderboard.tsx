import { useMemo, useEffect, useState } from 'react';
import { useFootballStore } from '@/store/footballStore';
import {
  Swords, Trophy, Search, Zap, Calendar, Flame, Shield, Target,
  X, Crown, TrendingUp, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { Avatar } from '@/shared/components';
import { FriendlyPlayerStat } from '@/features/friendly-matches/types';
import { cn } from '@/shared/lib/cn';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

type ViewMode = 'weekly' | 'monthly' | 'overall';

// Points formula: Win×10 + Draw×5 - Loss×3 + GF - GA  (no MOTM/HT for friendly)
const calcPoints = (s: { wins: number; draws: number; losses: number; goalsScored: number; goalsConceded: number }) =>
  s.wins * 10 + s.draws * 5 - s.losses * 3 + s.goalsScored - s.goalsConceded;

export function FriendlyLeaderboard() {
  const { friendlyMatches, fetchFriendlyMatches, players, fetchPlayers } = useFootballStore();
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPlayerHeadToHead, setSelectedPlayerHeadToHead] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedWeek, setSelectedWeek] = useState<number>(() => {
    const d = new Date().getDate();
    return d >= 22 ? 4 : d >= 15 ? 3 : d >= 8 ? 2 : 1;
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchFriendlyMatches(), fetchPlayers()]);
      setIsLoading(false);
    };
    load();
  }, [fetchFriendlyMatches, fetchPlayers]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedPlayerHeadToHead(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const playerMap = useMemo(() => {
    const map = new Map<string, { name: string; avatar: string }>();
    players.forEach(p => map.set(p.id, { name: p.name, avatar: p.profileImageUrl || '' }));
    return map;
  }, [players]);

  const availableYears = useMemo(() => {
    const set = new Set<number>();
    set.add(new Date().getFullYear());
    friendlyMatches.forEach(m => {
      if (m.date) { const y = new Date(m.date).getFullYear(); if (!isNaN(y)) set.add(y); }
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [friendlyMatches]);

  const filteredMatches = useMemo(() => {
    return friendlyMatches.filter(m => {
      if (!m.date) return false;
      const d = new Date(m.date);
      const matchYear = d.getFullYear();
      const matchMonth = d.getMonth();
      const matchDay = d.getDate();
      if (viewMode === 'overall') return true;
      if (matchYear !== selectedYear) return false;
      if (viewMode === 'monthly') return matchMonth === selectedMonth;
      if (viewMode === 'weekly') {
        if (matchMonth !== selectedMonth) return false;
        const matchWeek = matchDay >= 22 ? 4 : matchDay >= 15 ? 3 : matchDay >= 8 ? 2 : 1;
        return matchWeek === selectedWeek;
      }
      return true;
    });
  }, [friendlyMatches, viewMode, selectedYear, selectedMonth, selectedWeek]);

  // Distinct global calendar match dates sorted chronologically descending
  const distinctGlobalDates = useMemo(() => {
    const dates = Array.from(new Set(filteredMatches.map(m => m.date).filter(Boolean) as string[]));
    return dates.sort((a, b) => b.localeCompare(a));
  }, [filteredMatches]);

  // Global recent 3 training dates (or 2 or 1 if fewer exist)
  const recentGlobalDates = useMemo(() => distinctGlobalDates.slice(0, 3), [distinctGlobalDates]);
  const recentGlobalDatesSet = useMemo(() => new Set(recentGlobalDates), [recentGlobalDates]);

  const statsList = useMemo<(FriendlyPlayerStat & {
    points: number;
    recentPoints: number;
    recentMatchesCount: number;
    recentDaysCount: number;
    isInForm: boolean;
    rankShift: number | null;
    form: Array<'win' | 'draw' | 'loss'>;
  })[]>(() => {
    // 1. Group matches by player
    const playerMatchesMap = new Map<string, typeof filteredMatches>();
    filteredMatches.forEach(m => {
      if (!playerMatchesMap.has(m.player1Id)) playerMatchesMap.set(m.player1Id, []);
      if (!playerMatchesMap.has(m.player2Id)) playerMatchesMap.set(m.player2Id, []);
      playerMatchesMap.get(m.player1Id)!.push(m);
      playerMatchesMap.get(m.player2Id)!.push(m);
    });

    // 2. Compute stats for each player
    const rawStats: (FriendlyPlayerStat & {
      points: number;
      recentPoints: number;
      recentMatchesCount: number;
      recentDaysCount: number;
      isInForm: boolean;
      rankShift: number | null;
      form: Array<'win' | 'draw' | 'loss'>;
    })[] = [];

    playerMatchesMap.forEach((pMatches, playerId) => {
      const playerInfo = playerMap.get(playerId);
      if (!playerInfo) return;

      // Sort matches chronologically descending
      const sortedMatches = [...pMatches].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

      let matches = 0, wins = 0, draws = 0, losses = 0, goalsScored = 0, goalsConceded = 0, cleanSheets = 0;
      let recentWins = 0, recentDraws = 0, recentLosses = 0, recentGf = 0, recentGa = 0, recentMatchesCount = 0;
      const recentDatesPlayed = new Set<string>();
      const form: Array<'win' | 'draw' | 'loss'> = [];

      sortedMatches.forEach(m => {
        const isP1 = m.player1Id === playerId;
        const myGoals = isP1 ? m.player1Goals : m.player2Goals;
        const oppGoals = isP1 ? m.player2Goals : m.player1Goals;

        matches += 1;
        goalsScored += myGoals;
        goalsConceded += oppGoals;
        if (oppGoals === 0) cleanSheets += 1;

        let res: 'win' | 'draw' | 'loss' = 'draw';
        if (myGoals > oppGoals) { wins += 1; res = 'win'; }
        else if (oppGoals > myGoals) { losses += 1; res = 'loss'; }
        else { draws += 1; res = 'draw'; }

        // Only matches within the GLOBAL recent 3 dates count toward current form & recent points
        if (m.date && recentGlobalDatesSet.has(m.date)) {
          recentDatesPlayed.add(m.date);
          recentMatchesCount += 1;
          recentGf += myGoals;
          recentGa += oppGoals;
          if (res === 'win') recentWins += 1;
          else if (res === 'loss') recentLosses += 1;
          else recentDraws += 1;

          if (form.length < 5) form.push(res);
        }
      });

      const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
      const points = calcPoints({ wins, draws, losses, goalsScored, goalsConceded });
      const recentPoints = calcPoints({
        wins: recentWins,
        draws: recentDraws,
        losses: recentLosses,
        goalsScored: recentGf,
        goalsConceded: recentGa,
      });

      rawStats.push({
        playerId,
        playerName: playerInfo.name,
        profileImageUrl: playerInfo.avatar,
        matches,
        wins,
        draws,
        losses,
        goalsScored,
        goalsConceded,
        cleanSheets,
        winRate,
        points,
        recentPoints,
        recentMatchesCount,
        recentDaysCount: recentDatesPlayed.size,
        isInForm: recentMatchesCount > 0,
        rankShift: null,
        form,
      });
    });

    // Sort current standings
    rawStats.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.winRate - a.winRate;
    });

    // 3. Compute baseline standings (matches played BEFORE the global recent dates)
    if (distinctGlobalDates.length > recentGlobalDates.length) {
      const priorMatches = filteredMatches.filter(m => m.date && !recentGlobalDatesSet.has(m.date));
      const priorMap = new Map<string, { wins: number; draws: number; losses: number; gf: number; ga: number }>();

      priorMatches.forEach(m => {
        const p1 = m.player1Id; const p2 = m.player2Id;
        if (!priorMap.has(p1)) priorMap.set(p1, { wins: 0, draws: 0, losses: 0, gf: 0, ga: 0 });
        if (!priorMap.has(p2)) priorMap.set(p2, { wins: 0, draws: 0, losses: 0, gf: 0, ga: 0 });
        const ps1 = priorMap.get(p1)!; const ps2 = priorMap.get(p2)!;
        ps1.gf += m.player1Goals; ps1.ga += m.player2Goals;
        ps2.gf += m.player2Goals; ps2.ga += m.player1Goals;
        if (m.player1Goals > m.player2Goals) { ps1.wins += 1; ps2.losses += 1; }
        else if (m.player2Goals > m.player1Goals) { ps2.wins += 1; ps1.losses += 1; }
        else { ps1.draws += 1; ps2.draws += 1; }
      });

      const priorRanked = Array.from(priorMap.entries())
        .map(([playerId, stat]) => ({
          playerId,
          pts: calcPoints({ wins: stat.wins, draws: stat.draws, losses: stat.losses, goalsScored: stat.gf, goalsConceded: stat.ga }),
          wins: stat.wins,
        }))
        .sort((a, b) => b.pts - a.pts || b.wins - a.wins);

      const priorRankMap = new Map<string, number>();
      priorRanked.forEach((r, i) => priorRankMap.set(r.playerId, i + 1));

      rawStats.forEach((item, idx) => {
        const currentRank = idx + 1;
        const prevRank = priorRankMap.get(item.playerId);
        if (prevRank !== undefined) {
          item.rankShift = prevRank - currentRank;
        } else if (item.isInForm && priorRankMap.size > 0) {
          // Player wasn't ranked before, now entered standings
          item.rankShift = priorRankMap.size + 1 - currentRank;
        }
      });
    }

    return rawStats;
  }, [filteredMatches, playerMap, distinctGlobalDates, recentGlobalDates, recentGlobalDatesSet]);

  // Most Improved player candidate across recent global training dates
  const mostImproved = useMemo(() => {
    if (statsList.length < 2) return null;
    // Only players who actually played during the recent global dates
    const candidates = statsList.filter(s =>
      s.isInForm && (
        (s.rankShift !== null && s.rankShift >= 1) ||
        (s.recentPoints > 0 && s.recentMatchesCount >= 2)
      )
    );
    if (!candidates.length) return null;
    return candidates.sort((a, b) =>
      (b.rankShift || 0) - (a.rankShift || 0) ||
      b.recentPoints - a.recentPoints ||
      b.points - a.points
    )[0];
  }, [statsList]);

  // Hero cards: Most Wins, Most Goals, Most Clean Sheets, Most Dominant (win rate, min 3 matches)
  const heroes = useMemo(() => {
    if (statsList.length === 0) return null;
    const byWins = [...statsList].sort((a, b) => b.wins - a.wins || b.points - a.points);
    const byGoals = [...statsList].sort((a, b) => b.goalsScored - a.goalsScored || b.wins - a.wins);
    const byCS = [...statsList].sort((a, b) => b.cleanSheets - a.cleanSheets || b.wins - a.wins);
    const eligible = statsList.filter(s => s.matches >= 3);
    const byDominance = eligible.sort((a, b) => b.winRate - a.winRate || b.wins - a.wins);
    return {
      wins: byWins[0]?.wins > 0 ? byWins[0] : null,
      goals: byGoals[0]?.goalsScored > 0 ? byGoals[0] : null,
      cs: byCS[0]?.cleanSheets > 0 ? byCS[0] : null,
      dominant: byDominance[0]?.winRate > 0 ? byDominance[0] : null,
    };
  }, [statsList]);

  const headToHeadMatrix = useMemo(() => {
    if (!selectedPlayerHeadToHead) return [];
    const pId = selectedPlayerHeadToHead;
    const oppMap = new Map<string, { oppId: string; oppName: string; oppAvatar: string; matches: number; wins: number; draws: number; losses: number; gf: number; ga: number }>();
    filteredMatches.forEach(m => {
      if (m.player1Id !== pId && m.player2Id !== pId) return;
      const isP1 = m.player1Id === pId;
      const oppId = isP1 ? m.player2Id : m.player1Id;
      const myGoals = isP1 ? m.player1Goals : m.player2Goals;
      const oppGoals = isP1 ? m.player2Goals : m.player1Goals;
      const oppInfo = playerMap.get(oppId);
      if (!oppMap.has(oppId)) oppMap.set(oppId, { oppId, oppName: oppInfo?.name || 'Unknown', oppAvatar: oppInfo?.avatar || '', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0 });
      const item = oppMap.get(oppId)!;
      item.matches += 1; item.gf += myGoals; item.ga += oppGoals;
      if (myGoals > oppGoals) item.wins += 1;
      else if (oppGoals > myGoals) item.losses += 1;
      else item.draws += 1;
    });
    return Array.from(oppMap.values()).sort((a, b) => b.matches - a.matches);
  }, [selectedPlayerHeadToHead, filteredMatches, playerMap]);

  const filteredStats = useMemo(() => {
    if (!search.trim()) return statsList;
    return statsList.filter(s => s.playerName.toLowerCase().includes(search.toLowerCase()));
  }, [statsList, search]);

  const enrichedMatches = useMemo(() => filteredMatches.map(m => ({
    ...m,
    p1Name: playerMap.get(m.player1Id)?.name || 'Unknown',
    p1Avatar: playerMap.get(m.player1Id)?.avatar || '',
    p2Name: playerMap.get(m.player2Id)?.name || 'Unknown',
    p2Avatar: playerMap.get(m.player2Id)?.avatar || '',
  })), [filteredMatches, playerMap]);

  const periodLabel =
    viewMode === 'weekly' ? `${MONTHS[selectedMonth]} Week ${selectedWeek}` :
    viewMode === 'monthly' ? `${MONTHS[selectedMonth]} ${selectedYear}` :
    'All-Time';

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-12 w-72 bg-muted rounded-lg" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-36 bg-card rounded-2xl border border-border" />)}
        </div>
        <div className="h-64 bg-card rounded-2xl border border-border" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ── */}
      <div className="mb-6 md:mb-8 flex flex-col gap-2">
        <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight flex items-center gap-3">
          <Swords className="w-8 h-8 md:w-12 md:h-12 text-primary inline-block" /> Friendly Arena
        </h1>
        <p className="text-muted-foreground text-sm md:text-base font-medium max-w-2xl">
          Periodic internal club standings — reset weekly &amp; monthly to crown training champions.
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mr-1">Points formula:</span>
          {[
            { label: 'Win', value: '+10', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Draw', value: '+5', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
            { label: 'Loss', value: '-3', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
            { label: 'GF', value: '+1', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
            { label: 'GA', value: '-1', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
          ].map(({ label, value, color }) => (
            <span key={label} className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${color}`}>
              {label} <span className="opacity-70">{value}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Period Filter ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-xl border border-border w-max">
          {(['weekly', 'monthly', 'overall'] as ViewMode[]).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={cn(
                "px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all",
                viewMode === mode ? "bg-primary text-primary-foreground shadow-md scale-105" : "text-muted-foreground hover:text-foreground hover:bg-background/80"
              )}>
              {mode === 'weekly' ? '📅 Weekly' : mode === 'monthly' ? '🗓️ Monthly' : '🏆 All Time'}
            </button>
          ))}
        </div>

        {viewMode !== 'overall' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
                className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-xs">
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
              className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-xs">
              {MONTHS.map((m, idx) => <option key={idx} value={idx}>{m}</option>)}
            </select>
            {viewMode === 'weekly' && (
              <select value={selectedWeek} onChange={e => setSelectedWeek(Number(e.target.value))}
                className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-xs">
                <option value={1}>Week 1 (1-7)</option>
                <option value={2}>Week 2 (8-14)</option>
                <option value={3}>Week 3 (15-21)</option>
                <option value={4}>Week 4 (22+)</option>
              </select>
            )}
          </div>
        )}

        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search player..."
            className="pl-8 pr-4 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-[200px]" />
        </div>
      </div>

      {/* ── Hero Spotlight Cards ── */}
      {heroes && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">

          {/* Most Wins */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/15 via-card to-card border border-emerald-500/30 rounded-2xl p-4 flex flex-col items-center text-center gap-2 shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="p-2 bg-emerald-500/20 text-emerald-500 rounded-xl">
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Most Wins</span>
            {heroes.wins ? (
              <>
                <Avatar src={heroes.wins.profileImageUrl} name={heroes.wins.playerName} className="w-12 h-12 rounded-full ring-2 ring-emerald-500/40 shadow-lg" />
                <div>
                  <p className="font-black text-foreground text-sm leading-tight truncate max-w-[100px]">{heroes.wins.playerName}</p>
                  <p className="text-[10px] text-muted-foreground">{periodLabel}</p>
                </div>
                <span className="font-mono font-black text-emerald-500 text-2xl leading-none">{heroes.wins.wins}<span className="text-sm ml-0.5 opacity-70">W</span></span>
              </>
            ) : <p className="text-xs text-muted-foreground mt-2">No data</p>}
          </div>

          {/* Most Goals */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/15 via-card to-card border border-amber-500/30 rounded-2xl p-4 flex flex-col items-center text-center gap-2 shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="p-2 bg-amber-500/20 text-amber-500 rounded-xl">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Most Goals</span>
            {heroes.goals ? (
              <>
                <Avatar src={heroes.goals.profileImageUrl} name={heroes.goals.playerName} className="w-12 h-12 rounded-full ring-2 ring-amber-500/40 shadow-lg" />
                <div>
                  <p className="font-black text-foreground text-sm leading-tight truncate max-w-[100px]">{heroes.goals.playerName}</p>
                  <p className="text-[10px] text-muted-foreground">{periodLabel}</p>
                </div>
                <span className="font-mono font-black text-amber-500 text-2xl leading-none">{heroes.goals.goalsScored}<span className="text-sm ml-0.5">⚽</span></span>
              </>
            ) : <p className="text-xs text-muted-foreground mt-2">No data</p>}
          </div>

          {/* Most Clean Sheets */}
          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500/15 via-card to-card border border-cyan-500/30 rounded-2xl p-4 flex flex-col items-center text-center gap-2 shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="p-2 bg-cyan-500/20 text-cyan-500 rounded-xl">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500">Most Clean Sheets</span>
            {heroes.cs ? (
              <>
                <Avatar src={heroes.cs.profileImageUrl} name={heroes.cs.playerName} className="w-12 h-12 rounded-full ring-2 ring-cyan-500/40 shadow-lg" />
                <div>
                  <p className="font-black text-foreground text-sm leading-tight truncate max-w-[100px]">{heroes.cs.playerName}</p>
                  <p className="text-[10px] text-muted-foreground">{periodLabel}</p>
                </div>
                <span className="font-mono font-black text-cyan-500 text-2xl leading-none">{heroes.cs.cleanSheets}<span className="text-sm ml-0.5">🧤</span></span>
              </>
            ) : <p className="text-xs text-muted-foreground mt-2">No data</p>}
          </div>

          {/* Most Dominant */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-card to-card border border-primary/30 rounded-2xl p-4 flex flex-col items-center text-center gap-2 shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="p-2 bg-primary/20 text-primary rounded-xl">
              <Crown className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-primary">Most Dominant</span>
            {heroes.dominant ? (
              <>
                <Avatar src={heroes.dominant.profileImageUrl} name={heroes.dominant.playerName} className="w-12 h-12 rounded-full ring-2 ring-primary/40 shadow-lg" />
                <div>
                  <p className="font-black text-foreground text-sm leading-tight truncate max-w-[100px]">{heroes.dominant.playerName}</p>
                  <p className="text-[10px] text-muted-foreground">{heroes.dominant.matches} matches</p>
                </div>
                <span className="font-mono font-black text-primary text-2xl leading-none">{heroes.dominant.winRate}<span className="text-sm ml-0.5 opacity-70">%</span></span>
              </>
            ) : <p className="text-xs text-muted-foreground mt-2">Min 3 matches needed</p>}
          </div>
        </div>
      )}

      {/* ── 🚀 Most Improved Banner (Based on last 3 dates data) ── */}
      {mostImproved && (
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4 flex-wrap mb-6 shadow-xs">
          <div className="absolute top-0 right-0 w-40 h-full bg-emerald-500/5 blur-2xl pointer-events-none"/>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-500"/>
            </div>
            <Avatar name={mostImproved.playerName} src={mostImproved.profileImageUrl} className="w-9 h-9 rounded-full ring-2 ring-emerald-500/30 shrink-0"/>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">🚀 Most Improved (Last 3 Dates)</p>
              <p className="text-sm font-bold text-foreground">{mostImproved.playerName}</p>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-3 ml-auto flex-wrap">
            {mostImproved.rankShift !== null && mostImproved.rankShift > 0 && (
              <span className="flex items-center gap-1 text-xs font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                <ArrowUp className="w-3.5 h-3.5"/> ▲{mostImproved.rankShift} rank{mostImproved.rankShift !== 1 ? 's' : ''} up
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              Now <span className="font-bold text-foreground">#{statsList.findIndex(r => r.playerId === mostImproved.playerId) + 1}</span>
              {' · '}{mostImproved.points > 0 ? `+${mostImproved.points}` : mostImproved.points} pts
              {mostImproved.recentPoints > 0 && (
                <span className="text-emerald-500 font-bold ml-1">
                  (+{mostImproved.recentPoints} in last 3 dates)
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Standings — 2 cols */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="font-heading font-bold text-base sm:text-lg text-foreground">
                {viewMode === 'weekly' ? `${MONTHS[selectedMonth]} Week ${selectedWeek} Standings` :
                 viewMode === 'monthly' ? `${MONTHS[selectedMonth]} ${selectedYear} Standings` :
                 'All-Time Standings'}
              </h2>
            </div>
            <span className="text-xs text-muted-foreground font-medium">{filteredStats.length} Players</span>
          </div>

          {/* ── MOBILE: Player Cards (hidden on md+) ── */}
          <div className="flex flex-col gap-3 md:hidden">
            {filteredStats.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground shadow-sm">
                <span className="text-4xl block mb-2">⚔️</span>
                <p className="font-medium text-sm">No matches in this period</p>
              </div>
            ) : filteredStats.map((stat, idx) => {
              const isRank1 = idx === 0;
              const isRank2 = idx === 1;
              const isRank3 = idx === 2;
              const isTop3 = idx < 3;
              const isSelected = selectedPlayerHeadToHead === stat.playerId;

              return (
                <div key={stat.playerId} className="relative">
                  {/* #1 crown bubble */}
                  {isRank1 && (
                    <div className="absolute -top-3 left-12 z-20 animate-bounce">
                      <div className="relative border-2 border-amber-500/60 bg-gradient-to-r from-amber-950 via-zinc-900 to-amber-950 px-3 py-1 text-amber-300 shadow-md rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5" /> King of the Arena! 👑
                        <div className="absolute -bottom-1.5 left-5 w-2 h-2 bg-zinc-900 border-r-2 border-b-2 border-amber-500/80 rotate-45" />
                      </div>
                    </div>
                  )}

                  <div className={cn(
                    "relative rounded-2xl border p-4 transition-all duration-200 active:scale-[0.98]",
                    isRank1 ? "bg-gradient-to-r from-amber-500/10 via-card to-card border-amber-500/40 shadow-md" :
                    isRank2 ? "bg-gradient-to-r from-slate-400/10 via-card to-card border-slate-400/40 shadow-sm" :
                    isRank3 ? "bg-gradient-to-r from-amber-700/10 via-card to-card border-amber-700/40 shadow-sm" :
                    "bg-card/90 border-border/80",
                    isSelected && "ring-2 ring-primary/40"
                  )}>
                    {/* Top row: rank + avatar + name + points */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Rank badge with rank shift */}
                        <div className="flex flex-col items-center justify-center shrink-0 w-9 h-9 rounded-xl bg-background/80 border border-border/60 shadow-xs">
                          <span className={cn(
                            "font-black text-xs leading-none",
                            isRank1 ? "text-amber-500 text-sm" :
                            isRank2 ? "text-slate-400 text-sm" :
                            isRank3 ? "text-amber-700 text-sm" : "text-muted-foreground"
                          )}>#{idx + 1}</span>
                          {stat.rankShift !== null && (
                            <span className={cn("flex items-center text-[8px] font-bold mt-0.5",
                              stat.rankShift > 0 ? "text-emerald-500" : stat.rankShift < 0 ? "text-red-500" : "text-muted-foreground/40")}>
                              {stat.rankShift > 0 ? <ArrowUp className="w-2 h-2" /> : stat.rankShift < 0 ? <ArrowDown className="w-2 h-2" /> : <Minus className="w-2 h-2" />}
                              {stat.rankShift !== 0 && Math.abs(stat.rankShift)}
                            </span>
                          )}
                        </div>

                        <Avatar src={stat.profileImageUrl} name={stat.playerName} className="w-10 h-10 rounded-full shrink-0" />

                        <div className="min-w-0">
                          <h4 className={cn(
                            "font-bold text-foreground truncate text-sm leading-tight flex items-center gap-1.5",
                            isTop3 && "text-amber-500 font-extrabold"
                          )}>
                            {stat.playerName}
                            {isRank1 && <Crown className="w-3.5 h-3.5 text-amber-500 inline shrink-0" />}
                          </h4>
                          {/* Recent form dots (ordered latest first) */}
                          <div className="flex items-center gap-1 mt-1">
                            {stat.form.length > 0 ? (
                              stat.form.map((res, fi) => (
                                <span key={fi} className={cn(
                                  "w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-black",
                                  res === 'win' ? "bg-emerald-500/25 text-emerald-500 ring-1 ring-emerald-500/30" :
                                  res === 'draw' ? "bg-amber-500/25 text-amber-500 ring-1 ring-amber-500/30" :
                                  "bg-red-500/25 text-red-500 ring-1 ring-red-500/30"
                                )}>{res.charAt(0).toUpperCase()}</span>
                              ))
                            ) : (
                              <span className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-tight">No recent form</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Points pill */}
                      <div className="shrink-0 text-right">
                        <span className={cn(
                          "font-black text-sm px-3 py-1.5 rounded-xl border shadow-xs inline-block",
                          stat.points > 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                          stat.points < 0 ? "bg-red-500/10 text-red-500 border-red-500/20" :
                          "bg-muted text-muted-foreground border-border"
                        )}>
                          {stat.points > 0 ? `+${stat.points}` : stat.points} <span className="text-[10px] font-semibold opacity-70">PTS</span>
                        </span>
                      </div>
                    </div>

                    {/* Sub stats grid */}
                    <div className="grid grid-cols-4 gap-1.5 pt-3 mt-3 border-t border-border/40 text-center text-xs">
                      <div className="bg-muted/20 border border-border/30 px-1 py-1 rounded-lg">
                        <span className="text-[8.5px] font-bold text-muted-foreground uppercase block tracking-wider">W-D-L</span>
                        <span className="font-bold text-foreground text-xs">{stat.wins}-{stat.draws}-{stat.losses}</span>
                      </div>
                      <div className="bg-muted/20 border border-border/30 px-1 py-1 rounded-lg">
                        <span className="text-[8.5px] font-bold text-muted-foreground uppercase block tracking-wider">Win%</span>
                        <span className={cn("font-bold text-xs", stat.winRate >= 60 ? "text-emerald-500" : stat.winRate >= 40 ? "text-amber-500" : "text-muted-foreground")}>
                          {stat.matches > 0 ? `${stat.winRate}%` : '—'}
                        </span>
                      </div>
                      <div className="bg-muted/20 border border-border/30 px-1 py-1 rounded-lg">
                        <span className="text-[8.5px] font-bold text-muted-foreground uppercase block tracking-wider">GF/GA</span>
                        <span className="font-bold text-foreground text-xs">{stat.goalsScored}/{stat.goalsConceded}</span>
                      </div>
                      <div className="bg-muted/20 border border-border/30 px-1 py-1 rounded-lg">
                        <span className="text-[8.5px] font-bold text-muted-foreground uppercase block tracking-wider">CS</span>
                        <span className="font-bold text-cyan-500 text-xs">{stat.cleanSheets > 0 ? `🛡️${stat.cleanSheets}` : '—'}</span>
                      </div>
                    </div>

                    {/* H2H button */}
                    <button
                      onClick={() => setSelectedPlayerHeadToHead(isSelected ? null : stat.playerId)}
                      className={cn(
                        "mt-3 w-full py-1.5 rounded-xl text-xs font-bold transition-all border",
                        isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-muted/60 hover:bg-muted text-foreground border-border/50"
                      )}>
                      <Zap className="w-3 h-3 inline mr-1" />H2H Breakdown
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── DESKTOP: Table (hidden below md) ── */}
          <div className="hidden md:block bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[580px]">
                <thead className="bg-muted/40 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider border-b border-border/50">
                  <tr>
                    <th className="py-3 px-3 sm:px-4 w-12 text-center">#</th>
                    <th className="py-3 px-3 sm:px-4">Player</th>
                    <th className="py-3 px-2 text-center">Form</th>
                    <th className="py-3 px-2 text-center">M</th>
                    <th className="py-3 px-2 text-center">W</th>
                    <th className="py-3 px-2 text-center">D</th>
                    <th className="py-3 px-2 text-center">L</th>
                    <th className="py-3 px-2 text-center">GF</th>
                    <th className="py-3 px-2 text-center">GA</th>
                    <th className="py-3 px-2 text-center">CS</th>
                    <th className="py-3 px-3 text-center">Win%</th>
                    <th className="py-3 px-3 text-center">Pts</th>
                    <th className="py-3 px-2 text-right">H2H</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredStats.map((stat, idx) => {
                    const isTop1 = idx === 0; const isTop2 = idx === 1; const isTop3 = idx === 2;
                    const isSelected = selectedPlayerHeadToHead === stat.playerId;
                    const rowBg = isTop1 ? 'bg-amber-500/5 hover:bg-amber-500/10' : isTop2 ? 'bg-slate-400/5 hover:bg-slate-400/10' : isTop3 ? 'bg-orange-700/5 hover:bg-orange-700/10' : 'hover:bg-muted/30';
                    return (
                      <tr key={stat.playerId} className={cn("transition-colors", rowBg, isSelected && "bg-primary/8")}>
                        <td className="py-3 px-2 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <span className="font-bold text-xs">
                              {isTop1 && <span className="inline-flex w-6 h-6 rounded-full bg-amber-500/15 text-amber-500 items-center justify-center font-black">1</span>}
                              {isTop2 && <span className="inline-flex w-6 h-6 rounded-full bg-slate-300/20 text-slate-400 items-center justify-center font-black">2</span>}
                              {isTop3 && <span className="inline-flex w-6 h-6 rounded-full bg-amber-700/20 text-amber-600 items-center justify-center font-black">3</span>}
                              {!isTop1 && !isTop2 && !isTop3 && <span className="text-muted-foreground">{idx + 1}</span>}
                            </span>
                            {stat.rankShift !== null && (
                              <span className={cn("flex items-center text-[9px] font-bold mt-0.5",
                                stat.rankShift > 0 ? "text-emerald-500" : stat.rankShift < 0 ? "text-red-500" : "text-muted-foreground/40")}>
                                {stat.rankShift > 0 ? <ArrowUp className="w-2.5 h-2.5" /> : stat.rankShift < 0 ? <ArrowDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                                {stat.rankShift !== 0 && Math.abs(stat.rankShift)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5 max-w-[140px] truncate">
                            <Avatar src={stat.profileImageUrl} name={stat.playerName} className="w-7 h-7 rounded-full border border-border shrink-0" />
                            <span className="truncate font-semibold text-foreground text-[13px]">{stat.playerName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            {stat.form.length === 0 ? <span className="text-muted-foreground/40 text-[11px]">—</span>
                              : stat.form.map((res, fi) => (
                                <span key={fi} className={cn("w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black shadow-xs",
                                  res === 'win' ? "bg-emerald-500/20 text-emerald-500 ring-1 ring-emerald-500/30" :
                                  res === 'draw' ? "bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/30" :
                                  "bg-red-500/20 text-red-500 ring-1 ring-red-500/30")}>
                                  {res.charAt(0).toUpperCase()}
                                </span>
                              ))}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center text-muted-foreground font-mono text-[13px]">{stat.matches}</td>
                        <td className="py-3 px-2 text-center font-bold text-emerald-500 font-mono text-[13px]">{stat.wins}</td>
                        <td className="py-3 px-2 text-center text-amber-500 font-mono text-[13px]">{stat.draws}</td>
                        <td className="py-3 px-2 text-center text-red-400 font-mono text-[13px]">{stat.losses}</td>
                        <td className="py-3 px-2 text-center font-bold text-foreground font-mono text-[13px]">{stat.goalsScored}</td>
                        <td className="py-3 px-2 text-center text-muted-foreground font-mono text-[13px]">{stat.goalsConceded}</td>
                        <td className="py-3 px-2 text-center font-semibold text-cyan-500 font-mono text-[13px]">{stat.cleanSheets > 0 ? stat.cleanSheets : <span className="text-muted-foreground/40">—</span>}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-bold",
                            stat.winRate >= 60 ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                            stat.winRate >= 40 ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                            "bg-muted text-muted-foreground"
                          )}>{stat.winRate}%</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn("font-black text-[13px] px-2 py-0.5 rounded-lg border shadow-sm",
                            stat.points > 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                            stat.points < 0 ? "bg-red-500/10 text-red-500 border-red-500/20" :
                            "bg-muted text-muted-foreground border-border"
                          )}>{stat.points > 0 ? `+${stat.points}` : stat.points}</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => setSelectedPlayerHeadToHead(isSelected ? null : stat.playerId)}
                            className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                              isSelected ? "bg-primary text-primary-foreground" : "bg-muted/80 hover:bg-muted text-foreground"
                            )}>H2H</button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStats.length === 0 && (
                    <tr><td colSpan={13} className="py-12 text-center text-muted-foreground text-sm">No friendly matches played in this period.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Duels Feed ── */}
        <div>
          <div className="bg-card border border-border/80 rounded-2xl shadow-sm p-4 sm:p-5 max-h-[600px] lg:max-h-[900px] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
              <h2 className="font-heading font-bold text-base text-foreground">Duels Feed</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {filteredMatches.length} Matches
              </span>
            </div>
            <div className="space-y-3">
              {enrichedMatches.map((m) => (
                <div key={m.id} className="p-3.5 bg-muted/30 border border-border/40 rounded-xl space-y-2 hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 max-w-[40%] truncate">
                      <Avatar src={m.p1Avatar} name={m.p1Name} className="w-5 h-5 rounded-full shrink-0" />
                      <span className={cn("font-bold truncate", m.player1Goals > m.player2Goals ? "text-emerald-500" : "text-foreground")}>{m.p1Name}</span>
                    </div>
                    <span className="font-mono font-black text-sm px-2 py-0.5 bg-background border border-border rounded-md shrink-0">{m.player1Goals} - {m.player2Goals}</span>
                    <div className="flex items-center gap-2 justify-end max-w-[40%] truncate">
                      <span className={cn("font-bold truncate", m.player2Goals > m.player1Goals ? "text-emerald-500" : "text-foreground")}>{m.p2Name}</span>
                      <Avatar src={m.p2Avatar} name={m.p2Name} className="w-5 h-5 rounded-full shrink-0" />
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground flex justify-between pt-1 border-t border-border/20">
                    <span>📅 {m.date}</span>
                    {m.notes && <span className="truncate max-w-[120px]" title={m.notes}>{m.notes}</span>}
                  </div>
                </div>
              ))}
              {enrichedMatches.length === 0 && (
                <p className="text-muted-foreground text-xs text-center py-8">No friendly duels found in this period.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── H2H Popup Modal ── */}
      {selectedPlayerHeadToHead && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 overflow-y-auto flex justify-center items-start animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedPlayerHeadToHead(null); }}
        >
          <div className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl relative overflow-hidden my-6 mx-4 animate-in slide-in-from-bottom-4 duration-300">
            <button onClick={() => setSelectedPlayerHeadToHead(null)}
              className="absolute top-4 right-4 z-[60] p-2 rounded-full bg-background/80 hover:bg-muted border border-border text-foreground hover:scale-105 transition-all shadow-md">
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl"><Zap className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">Head-to-Head</h3>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary font-bold">{playerMap.get(selectedPlayerHeadToHead)?.name}</span> · {periodLabel}
                  </p>
                </div>
              </div>

              {/* Player summary */}
              {(() => {
                const ps = statsList.find(s => s.playerId === selectedPlayerHeadToHead);
                return ps ? (
                  <div className="grid grid-cols-4 gap-2 mb-5 p-4 bg-muted/40 rounded-2xl border border-border/50">
                    {[
                      { label: 'Matches', value: ps.matches, color: 'text-foreground' },
                      { label: 'Wins', value: ps.wins, color: 'text-emerald-500' },
                      { label: 'Goals', value: ps.goalsScored, color: 'text-amber-500' },
                      { label: 'Pts', value: ps.points > 0 ? `+${ps.points}` : ps.points, color: 'text-primary' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="text-center">
                        <p className={`text-xl font-black font-mono ${color}`}>{value}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">{label}</p>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}

              {headToHeadMatrix.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">No H2H matches found in this period.</p>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {headToHeadMatrix.map((item) => {
                    const total = item.wins + item.draws + item.losses;
                    const winPct = total > 0 ? Math.round((item.wins / total) * 100) : 0;
                    const drawPct = total > 0 ? Math.round((item.draws / total) * 100) : 0;
                    return (
                      <div key={item.oppId} className="p-4 bg-muted/30 border border-border/50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar src={item.oppAvatar} name={item.oppName} className="w-8 h-8 rounded-full" />
                            <div>
                              <p className="font-bold text-sm text-foreground">{item.oppName}</p>
                              <p className="text-[10px] text-muted-foreground">{item.matches} matches · {item.gf}-{item.ga} goals</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-xs font-mono font-bold">
                              <span className="text-emerald-500">{item.wins}W</span>
                              <span className="text-muted-foreground">·</span>
                              <span className="text-amber-500">{item.draws}D</span>
                              <span className="text-muted-foreground">·</span>
                              <span className="text-red-400">{item.losses}L</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{winPct}% win rate</p>
                          </div>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden flex">
                          <div className="bg-emerald-500 transition-all" style={{ width: `${winPct}%` }} />
                          <div className="bg-amber-500/70 transition-all" style={{ width: `${drawPct}%` }} />
                          <div className="bg-red-400/70 transition-all flex-1" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
