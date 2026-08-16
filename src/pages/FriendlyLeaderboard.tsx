import { useMemo, useEffect, useState } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Swords, Trophy, Search, Zap, Calendar, Flame, Shield, Target, X } from 'lucide-react';
import { Avatar } from '@/shared/components';
import { FriendlyPlayerStat } from '@/features/friendly-matches/types';
import { cn } from '@/shared/lib/cn';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

type ViewMode = 'weekly' | 'monthly' | 'overall';

export function FriendlyLeaderboard() {
  const { friendlyMatches, fetchFriendlyMatches, players, fetchPlayers } = useFootballStore();
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPlayerHeadToHead, setSelectedPlayerHeadToHead] = useState<string | null>(null);

  // Time-period Filter States
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

  // Close H2H popup on ESC
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
      if (m.date) {
        const y = new Date(m.date).getFullYear();
        if (!isNaN(y)) set.add(y);
      }
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

  const statsList = useMemo<FriendlyPlayerStat[]>(() => {
    const map = new Map<string, {
      matches: number; wins: number; draws: number; losses: number;
      goalsScored: number; goalsConceded: number; cleanSheets: number;
    }>();

    filteredMatches.forEach(m => {
      const p1 = m.player1Id;
      const p2 = m.player2Id;

      if (!map.has(p1)) map.set(p1, { matches: 0, wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0, cleanSheets: 0 });
      if (!map.has(p2)) map.set(p2, { matches: 0, wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0, cleanSheets: 0 });

      const s1 = map.get(p1)!;
      const s2 = map.get(p2)!;

      s1.matches += 1; s2.matches += 1;
      s1.goalsScored += m.player1Goals; s1.goalsConceded += m.player2Goals;
      s2.goalsScored += m.player2Goals; s2.goalsConceded += m.player1Goals;

      if (m.player2Goals === 0) s1.cleanSheets += 1;
      if (m.player1Goals === 0) s2.cleanSheets += 1;

      if (m.player1Goals > m.player2Goals) { s1.wins += 1; s2.losses += 1; }
      else if (m.player2Goals > m.player1Goals) { s2.wins += 1; s1.losses += 1; }
      else { s1.draws += 1; s2.draws += 1; }
    });

    const result: FriendlyPlayerStat[] = [];
    map.forEach((stat, playerId) => {
      const playerInfo = playerMap.get(playerId);
      if (!playerInfo) return;
      const winRate = stat.matches > 0 ? Math.round((stat.wins / stat.matches) * 100) : 0;
      result.push({ playerId, playerName: playerInfo.name, profileImageUrl: playerInfo.avatar, ...stat, winRate });
    });

    return result.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.goalsScored !== a.goalsScored) return b.goalsScored - a.goalsScored;
      return b.winRate - a.winRate;
    });
  }, [filteredMatches, playerMap]);

  const highlights = useMemo(() => {
    if (statsList.length === 0) return null;
    const mostGoalsPlayer = [...statsList].sort((a, b) => b.goalsScored - a.goalsScored || b.wins - a.wins)[0];
    const mostWinsPlayer = [...statsList].sort((a, b) => b.wins - a.wins || b.goalsScored - a.goalsScored)[0];
    const mostCleanSheetsPlayer = [...statsList].sort((a, b) => b.cleanSheets - a.cleanSheets || b.wins - a.wins)[0];
    return {
      mostGoals: mostGoalsPlayer && mostGoalsPlayer.goalsScored > 0 ? mostGoalsPlayer : null,
      mostWins: mostWinsPlayer && mostWinsPlayer.wins > 0 ? mostWinsPlayer : null,
      mostCleanSheets: mostCleanSheetsPlayer && mostCleanSheetsPlayer.cleanSheets > 0 ? mostCleanSheetsPlayer : null,
    };
  }, [statsList]);

  // H2H data for popup
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

      if (!oppMap.has(oppId)) {
        oppMap.set(oppId, { oppId, oppName: oppInfo?.name || 'Unknown', oppAvatar: oppInfo?.avatar || '', matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0 });
      }
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

  const enrichedMatches = useMemo(() => {
    return filteredMatches.map(m => ({
      ...m,
      p1Name: playerMap.get(m.player1Id)?.name || 'Unknown',
      p1Avatar: playerMap.get(m.player1Id)?.avatar || '',
      p2Name: playerMap.get(m.player2Id)?.name || 'Unknown',
      p2Avatar: playerMap.get(m.player2Id)?.avatar || '',
    }));
  }, [filteredMatches, playerMap]);

  const periodLabel =
    viewMode === 'weekly' ? `${MONTHS[selectedMonth]} Week ${selectedWeek}` :
    viewMode === 'monthly' ? MONTHS[selectedMonth] :
    'All-Time';

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-12 w-72 bg-muted rounded-lg" />
        <div className="h-32 bg-card rounded-2xl border border-border" />
        <div className="h-64 bg-card rounded-2xl border border-border" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header — same style as Leaderboard */}
      <div className="mb-6 md:mb-8 flex flex-col gap-2">
        <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight flex items-center gap-3">
          <span className="text-primary"><Swords className="w-8 h-8 md:w-12 md:h-12 inline-block" /></span> Friendly Arena
        </h1>
        <p className="text-muted-foreground text-sm md:text-base font-medium max-w-2xl">
          Periodic internal club standings — reset weekly &amp; monthly to crown training champions.
        </p>

        {/* Ranked-by hint */}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mr-1">Ranked by:</span>
          {[
            { label: 'Wins', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Goals Scored', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
            { label: 'Win %', color: 'text-primary bg-primary/10 border-primary/20' },
          ].map(({ label, color }) => (
            <span key={label} className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${color}`}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Period Filter — same tab pill style as Leaderboard */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-xl border border-border w-max">
          {(['weekly', 'monthly', 'overall'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all",
                viewMode === mode
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/80"
              )}
            >
              {mode === 'weekly' ? '📅 Weekly' : mode === 'monthly' ? '🗓️ Monthly' : '🏆 All Time'}
            </button>
          ))}
        </div>

        {/* Year / Month / Week dropdowns */}
        {viewMode !== 'overall' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              >
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            >
              {MONTHS.map((m, idx) => <option key={idx} value={idx}>{m}</option>)}
            </select>
            {viewMode === 'weekly' && (
              <select
                value={selectedWeek}
                onChange={e => setSelectedWeek(Number(e.target.value))}
                className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              >
                <option value={1}>Week 1 (1-7)</option>
                <option value={2}>Week 2 (8-14)</option>
                <option value={3}>Week 3 (15-21)</option>
                <option value={4}>Week 4 (22+)</option>
              </select>
            )}
          </div>
        )}

        {/* Search */}
        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search player..."
            className="pl-8 pr-4 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-[200px]"
          />
        </div>
      </div>

      {/* Highlight Cards */}
      {highlights && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {/* Most Goals */}
          <div className="bg-gradient-to-br from-amber-500/10 via-card to-card border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className="p-3 bg-amber-500/20 text-amber-500 rounded-xl shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">Most Goals ({periodLabel})</span>
              {highlights.mostGoals ? (
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <div className="flex items-center gap-2 truncate">
                    <Avatar src={highlights.mostGoals.profileImageUrl} name={highlights.mostGoals.playerName} className="w-6 h-6 rounded-full shrink-0" />
                    <span className="font-bold text-sm text-foreground truncate">{highlights.mostGoals.playerName}</span>
                  </div>
                  <span className="font-mono font-black text-amber-500 text-base shrink-0">{highlights.mostGoals.goalsScored} ⚽</span>
                </div>
              ) : <p className="text-xs text-muted-foreground mt-0.5">No goals recorded</p>}
            </div>
          </div>

          {/* Most Wins */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className="p-3 bg-emerald-500/20 text-emerald-500 rounded-xl shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Most Wins ({periodLabel})</span>
              {highlights.mostWins ? (
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <div className="flex items-center gap-2 truncate">
                    <Avatar src={highlights.mostWins.profileImageUrl} name={highlights.mostWins.playerName} className="w-6 h-6 rounded-full shrink-0" />
                    <span className="font-bold text-sm text-foreground truncate">{highlights.mostWins.playerName}</span>
                  </div>
                  <span className="font-mono font-black text-emerald-500 text-base shrink-0">{highlights.mostWins.wins} W</span>
                </div>
              ) : <p className="text-xs text-muted-foreground mt-0.5">No wins recorded</p>}
            </div>
          </div>

          {/* Most Clean Sheets */}
          <div className="bg-gradient-to-br from-cyan-500/10 via-card to-card border border-cyan-500/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className="p-3 bg-cyan-500/20 text-cyan-500 rounded-xl shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-500">Clean Sheets ({periodLabel})</span>
              {highlights.mostCleanSheets ? (
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <div className="flex items-center gap-2 truncate">
                    <Avatar src={highlights.mostCleanSheets.profileImageUrl} name={highlights.mostCleanSheets.playerName} className="w-6 h-6 rounded-full shrink-0" />
                    <span className="font-bold text-sm text-foreground truncate">{highlights.mostCleanSheets.playerName}</span>
                  </div>
                  <span className="font-mono font-black text-cyan-500 text-base shrink-0">{highlights.mostCleanSheets.cleanSheets} 🧤</span>
                </div>
              ) : <p className="text-xs text-muted-foreground mt-0.5">No clean sheets</p>}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid — same 2/3 + 1/3 as Leaderboard on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Standings Table — 2 cols */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border/60 flex items-center justify-between">
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

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[560px]">
                <thead className="bg-muted/40 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider border-b border-border/50">
                  <tr>
                    <th className="py-3 px-3 sm:px-4 w-10 text-center">#</th>
                    <th className="py-3 px-3 sm:px-4">Player</th>
                    <th className="py-3 px-2 sm:px-3 text-center">M</th>
                    <th className="py-3 px-2 sm:px-3 text-center">W</th>
                    <th className="py-3 px-2 sm:px-3 text-center">D</th>
                    <th className="py-3 px-2 sm:px-3 text-center">L</th>
                    <th className="py-3 px-2 sm:px-3 text-center">GF</th>
                    <th className="py-3 px-2 sm:px-3 text-center">GA</th>
                    <th className="py-3 px-2 sm:px-3 text-center">CS</th>
                    <th className="py-3 px-3 sm:px-4 text-center">Win %</th>
                    <th className="py-3 px-2 sm:px-3 text-right">H2H</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredStats.map((stat, idx) => {
                    const isTop1 = idx === 0;
                    const isTop2 = idx === 1;
                    const isTop3 = idx === 2;
                    const isSelected = selectedPlayerHeadToHead === stat.playerId;

                    return (
                      <tr
                        key={stat.playerId}
                        className={`transition-colors ${isSelected ? 'bg-primary/8' : 'hover:bg-muted/30'}`}
                      >
                        <td className="py-3 px-3 sm:px-4 text-center font-bold text-xs">
                          {isTop1 && <span className="inline-flex w-6 h-6 rounded-full bg-amber-500/15 text-amber-500 items-center justify-center font-black">1</span>}
                          {isTop2 && <span className="inline-flex w-6 h-6 rounded-full bg-slate-300/20 text-slate-400 items-center justify-center font-black">2</span>}
                          {isTop3 && <span className="inline-flex w-6 h-6 rounded-full bg-amber-700/20 text-amber-600 items-center justify-center font-black">3</span>}
                          {!isTop1 && !isTop2 && !isTop3 && <span className="text-muted-foreground">{idx + 1}</span>}
                        </td>

                        <td className="py-3 px-3 sm:px-4 font-semibold text-foreground">
                          <div className="flex items-center gap-2.5 max-w-[130px] sm:max-w-none truncate">
                            <Avatar src={stat.profileImageUrl} name={stat.playerName} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border shrink-0" />
                            <span className="truncate">{stat.playerName}</span>
                          </div>
                        </td>

                        <td className="py-3 px-2 sm:px-3 text-center text-muted-foreground font-mono">{stat.matches}</td>
                        <td className="py-3 px-2 sm:px-3 text-center font-bold text-emerald-500 font-mono">{stat.wins}</td>
                        <td className="py-3 px-2 sm:px-3 text-center text-amber-500 font-mono">{stat.draws}</td>
                        <td className="py-3 px-2 sm:px-3 text-center text-red-400 font-mono">{stat.losses}</td>
                        <td className="py-3 px-2 sm:px-3 text-center font-bold text-foreground font-mono">{stat.goalsScored}</td>
                        <td className="py-3 px-2 sm:px-3 text-center text-muted-foreground font-mono">{stat.goalsConceded}</td>
                        <td className="py-3 px-2 sm:px-3 text-center font-semibold text-cyan-500 font-mono">{stat.cleanSheets}</td>

                        <td className="py-3 px-3 sm:px-4 text-center font-black font-mono">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            stat.winRate >= 60 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                            stat.winRate >= 40 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {stat.winRate}%
                          </span>
                        </td>

                        <td className="py-3 px-2 sm:px-3 text-right">
                          <button
                            onClick={() => setSelectedPlayerHeadToHead(isSelected ? null : stat.playerId)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                              isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted/80 hover:bg-muted text-foreground'
                            }`}
                          >
                            H2H
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredStats.length === 0 && (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-muted-foreground text-sm">
                        No friendly matches played in this selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Duels Feed — 1 col */}
        <div>
          <div className="bg-card border border-border/80 rounded-2xl shadow-sm p-4 sm:p-5 max-h-[600px] lg:max-h-[750px] overflow-y-auto">
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
                      <span className={`font-bold truncate ${m.player1Goals > m.player2Goals ? 'text-emerald-500' : 'text-foreground'}`}>
                        {m.p1Name}
                      </span>
                    </div>

                    <span className="font-mono font-black text-sm px-2 py-0.5 bg-background border border-border rounded-md shrink-0">
                      {m.player1Goals} - {m.player2Goals}
                    </span>

                    <div className="flex items-center gap-2 justify-end max-w-[40%] truncate">
                      <span className={`font-bold truncate ${m.player2Goals > m.player1Goals ? 'text-emerald-500' : 'text-foreground'}`}>
                        {m.p2Name}
                      </span>
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

      {/* H2H Popup Modal */}
      {selectedPlayerHeadToHead && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 overflow-y-auto flex justify-center items-start animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedPlayerHeadToHead(null); }}
        >
          <div className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl relative overflow-hidden my-6 mx-4 animate-in slide-in-from-bottom-4 duration-300">
            {/* Close button */}
            <button
              onClick={() => setSelectedPlayerHeadToHead(null)}
              className="absolute top-4 right-4 z-[60] p-2 rounded-full bg-background/80 hover:bg-muted border border-border text-foreground hover:scale-105 transition-all shadow-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">
                    Head-to-Head
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary font-bold">{playerMap.get(selectedPlayerHeadToHead)?.name}</span>
                    {' '}· {periodLabel}
                  </p>
                </div>
              </div>

              {/* Player Summary Row */}
              {(() => {
                const ps = statsList.find(s => s.playerId === selectedPlayerHeadToHead);
                return ps ? (
                  <div className="grid grid-cols-4 gap-2 mb-5 p-4 bg-muted/40 rounded-2xl border border-border/50">
                    {[
                      { label: 'Matches', value: ps.matches, color: 'text-foreground' },
                      { label: 'Wins', value: ps.wins, color: 'text-emerald-500' },
                      { label: 'Goals', value: ps.goalsScored, color: 'text-amber-500' },
                      { label: 'Win %', value: `${ps.winRate}%`, color: 'text-primary' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="text-center">
                        <p className={`text-xl font-black font-mono ${color}`}>{value}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">{label}</p>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}

              {/* H2H breakdown */}
              {headToHeadMatrix.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">No head-to-head matches found in this period.</p>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {headToHeadMatrix.map((item) => {
                    const total = item.wins + item.draws + item.losses;
                    const winPct = total > 0 ? Math.round((item.wins / total) * 100) : 0;
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

                        {/* Win progress bar */}
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden flex">
                          <div className="bg-emerald-500 transition-all" style={{ width: `${winPct}%` }} />
                          <div className="bg-amber-500/70 transition-all" style={{ width: `${total > 0 ? Math.round((item.draws / total) * 100) : 0}%` }} />
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
