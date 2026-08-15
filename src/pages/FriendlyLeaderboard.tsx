import { useMemo, useEffect, useState } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Swords, Trophy, Search, Target, Flame, Crown, Zap } from 'lucide-react';
import { Avatar } from '@/shared/components';
import { FriendlyPlayerStat } from '@/features/friendly-matches/types';

export function FriendlyLeaderboard() {
  const { friendlyMatches, fetchFriendlyMatches, players, fetchPlayers } = useFootballStore();
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPlayerHeadToHead, setSelectedPlayerHeadToHead] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchFriendlyMatches(), fetchPlayers()]);
      setIsLoading(false);
    };
    load();
  }, [fetchFriendlyMatches, fetchPlayers]);

  const playerMap = useMemo(() => {
    const map = new Map<string, { name: string; avatar: string }>();
    players.forEach(p => map.set(p.id, { name: p.name, avatar: p.profileImageUrl || '' }));
    return map;
  }, [players]);

  // Aggregate stats per player from friendly matches
  const statsList = useMemo<FriendlyPlayerStat[]>(() => {
    const map = new Map<string, {
      matches: number;
      wins: number;
      draws: number;
      losses: number;
      goalsScored: number;
      goalsConceded: number;
    }>();

    friendlyMatches.forEach(m => {
      const p1 = m.player1Id;
      const p2 = m.player2Id;

      if (!map.has(p1)) map.set(p1, { matches: 0, wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0 });
      if (!map.has(p2)) map.set(p2, { matches: 0, wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0 });

      const s1 = map.get(p1)!;
      const s2 = map.get(p2)!;

      s1.matches += 1;
      s2.matches += 1;
      s1.goalsScored += m.player1Goals;
      s1.goalsConceded += m.player2Goals;
      s2.goalsScored += m.player2Goals;
      s2.goalsConceded += m.player1Goals;

      if (m.player1Goals > m.player2Goals) {
        s1.wins += 1;
        s2.losses += 1;
      } else if (m.player2Goals > m.player1Goals) {
        s2.wins += 1;
        s1.losses += 1;
      } else {
        s1.draws += 1;
        s2.draws += 1;
      }
    });

    const result: FriendlyPlayerStat[] = [];
    map.forEach((stat, playerId) => {
      const playerInfo = playerMap.get(playerId);
      if (!playerInfo) return;
      const winRate = stat.matches > 0 ? Math.round((stat.wins / stat.matches) * 100) : 0;
      result.push({
        playerId,
        playerName: playerInfo.name,
        profileImageUrl: playerInfo.avatar,
        ...stat,
        winRate,
      });
    });

    // Rank by Wins DESC, Goals Scored DESC, Win Rate DESC
    return result.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.goalsScored !== a.goalsScored) return b.goalsScored - a.goalsScored;
      return b.winRate - a.winRate;
    });
  }, [friendlyMatches, playerMap]);

  // Highlight / Summary Stats Cards
  const summaryStats = useMemo(() => {
    const totalFriendlyMatches = friendlyMatches.length;
    const totalGoals = friendlyMatches.reduce((acc, m) => acc + m.player1Goals + m.player2Goals, 0);
    const avgGoalsPerMatch = totalFriendlyMatches > 0 ? (totalGoals / totalFriendlyMatches).toFixed(1) : '0';

    const topWinner = statsList.length > 0 ? statsList[0] : null;
    const topScorer = [...statsList].sort((a, b) => b.goalsScored - a.goalsScored)[0] || null;

    return {
      totalFriendlyMatches,
      totalGoals,
      avgGoalsPerMatch,
      topWinner,
      topScorer,
    };
  }, [friendlyMatches, statsList]);

  // Head-to-Head breakdown matrix for selected player
  const headToHeadMatrix = useMemo(() => {
    if (!selectedPlayerHeadToHead) return [];

    const pId = selectedPlayerHeadToHead;
    const oppMap = new Map<string, { oppId: string; oppName: string; oppAvatar: string; matches: number; wins: number; draws: number; losses: number; gf: number; ga: number }>();

    friendlyMatches.forEach(m => {
      if (m.player1Id !== pId && m.player2Id !== pId) return;

      const isP1 = m.player1Id === pId;
      const oppId = isP1 ? m.player2Id : m.player1Id;
      const myGoals = isP1 ? m.player1Goals : m.player2Goals;
      const oppGoals = isP1 ? m.player2Goals : m.player1Goals;
      const oppInfo = playerMap.get(oppId);

      if (!oppMap.has(oppId)) {
        oppMap.set(oppId, {
          oppId,
          oppName: oppInfo?.name || 'Unknown',
          oppAvatar: oppInfo?.avatar || '',
          matches: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          gf: 0,
          ga: 0,
        });
      }

      const item = oppMap.get(oppId)!;
      item.matches += 1;
      item.gf += myGoals;
      item.ga += oppGoals;

      if (myGoals > oppGoals) item.wins += 1;
      else if (oppGoals > myGoals) item.losses += 1;
      else item.draws += 1;
    });

    return Array.from(oppMap.values()).sort((a, b) => b.matches - a.matches);
  }, [selectedPlayerHeadToHead, friendlyMatches, playerMap]);

  const filteredStats = useMemo(() => {
    if (!search.trim()) return statsList;
    return statsList.filter(s => s.playerName.toLowerCase().includes(search.toLowerCase()));
  }, [statsList, search]);

  const enrichedMatches = useMemo(() => {
    return friendlyMatches.map(m => ({
      ...m,
      p1Name: playerMap.get(m.player1Id)?.name || 'Unknown',
      p1Avatar: playerMap.get(m.player1Id)?.avatar || '',
      p2Name: playerMap.get(m.player2Id)?.name || 'Unknown',
      p2Avatar: playerMap.get(m.player2Id)?.avatar || '',
    }));
  }, [friendlyMatches, playerMap]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-8 w-64 bg-muted rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-28 bg-card rounded-2xl border border-border" />
          <div className="h-28 bg-card rounded-2xl border border-border" />
          <div className="h-28 bg-card rounded-2xl border border-border" />
          <div className="h-28 bg-card rounded-2xl border border-border" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary/15 via-card to-card border border-primary/25 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
              <Swords className="w-4 h-4" /> Training & Friendly Arena
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-4xl text-foreground tracking-tight">
              Friendly Arena & Leaderboard
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1.5 max-w-xl">
              Complete club training analytics — internal 1v1 duels, head-to-head records, and goal charts.
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search player..."
                className="pl-9 pr-4 py-2.5 bg-background/80 backdrop-blur-md border border-border/80 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-[220px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Matches */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Duels</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Swords className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono font-black text-2xl sm:text-3xl text-foreground">{summaryStats.totalFriendlyMatches}</span>
            <span className="text-[11px] text-muted-foreground ml-2">matches played</span>
          </div>
        </div>

        {/* Total Goals */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Goals</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono font-black text-2xl sm:text-3xl text-foreground">{summaryStats.totalGoals}</span>
            <span className="text-[11px] text-muted-foreground ml-2">({summaryStats.avgGoalsPerMatch} / match)</span>
          </div>
        </div>

        {/* Top King (Most Wins) */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Most Wins</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            {summaryStats.topWinner ? (
              <>
                <Avatar src={summaryStats.topWinner.profileImageUrl} name={summaryStats.topWinner.playerName} className="w-7 h-7 rounded-full" />
                <div className="truncate">
                  <p className="font-bold text-xs sm:text-sm text-foreground truncate">{summaryStats.topWinner.playerName}</p>
                  <p className="text-[11px] font-mono text-emerald-500 font-semibold">{summaryStats.topWinner.wins} Wins ({summaryStats.topWinner.winRate}%)</p>
                </div>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">N/A</span>
            )}
          </div>
        </div>

        {/* Top Scorer */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Scorer</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            {summaryStats.topScorer ? (
              <>
                <Avatar src={summaryStats.topScorer.profileImageUrl} name={summaryStats.topScorer.playerName} className="w-7 h-7 rounded-full" />
                <div className="truncate">
                  <p className="font-bold text-xs sm:text-sm text-foreground truncate">{summaryStats.topScorer.playerName}</p>
                  <p className="text-[11px] font-mono text-foreground font-semibold">{summaryStats.topScorer.goalsScored} Goals</p>
                </div>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">N/A</span>
            )}
          </div>
        </div>
      </div>

      {/* Leaderboard Table & Matches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table - 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="font-heading font-bold text-lg text-foreground">Player Standings</h2>
              </div>
              <span className="text-xs text-muted-foreground font-medium">{filteredStats.length} Players</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider border-b border-border/50">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-3 text-center">M</th>
                    <th className="py-3 px-3 text-center">W</th>
                    <th className="py-3 px-3 text-center">D</th>
                    <th className="py-3 px-3 text-center">L</th>
                    <th className="py-3 px-3 text-center">GF</th>
                    <th className="py-3 px-3 text-center">GA</th>
                    <th className="py-3 px-4 text-center">Win %</th>
                    <th className="py-3 px-3 text-right">H2H</th>
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
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-primary/10 hover:bg-primary/15' : 'hover:bg-muted/30'
                        }`}
                        onClick={() => setSelectedPlayerHeadToHead(isSelected ? null : stat.playerId)}
                      >
                        <td className="py-3.5 px-4 text-center font-bold text-xs">
                          {isTop1 && <span className="inline-flex w-6 h-6 rounded-full bg-amber-500/15 text-amber-500 items-center justify-center font-black">1</span>}
                          {isTop2 && <span className="inline-flex w-6 h-6 rounded-full bg-slate-300/20 text-slate-300 items-center justify-center font-black">2</span>}
                          {isTop3 && <span className="inline-flex w-6 h-6 rounded-full bg-amber-700/20 text-amber-600 items-center justify-center font-black">3</span>}
                          {!isTop1 && !isTop2 && !isTop3 && <span className="text-muted-foreground">{idx + 1}</span>}
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-foreground">
                          <div className="flex items-center gap-3">
                            <Avatar src={stat.profileImageUrl} name={stat.playerName} className="w-8 h-8 rounded-full border border-border" />
                            <span>{stat.playerName}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center text-muted-foreground font-mono">{stat.matches}</td>
                        <td className="py-3.5 px-3 text-center font-bold text-emerald-500 font-mono">{stat.wins}</td>
                        <td className="py-3.5 px-3 text-center text-amber-500 font-mono">{stat.draws}</td>
                        <td className="py-3.5 px-3 text-center text-red-400 font-mono">{stat.losses}</td>
                        <td className="py-3.5 px-3 text-center font-bold text-foreground font-mono">{stat.goalsScored}</td>
                        <td className="py-3.5 px-3 text-center text-muted-foreground font-mono">{stat.goalsConceded}</td>

                        <td className="py-3.5 px-4 text-center font-black font-mono">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            stat.winRate >= 60 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                            stat.winRate >= 40 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {stat.winRate}%
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <button 
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
                      <td colSpan={10} className="py-12 text-center text-muted-foreground text-sm">
                        No friendly match records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Head to Head Breakdown Box */}
          {selectedPlayerHeadToHead && (
            <div className="bg-card border border-primary/30 rounded-2xl p-5 shadow-lg animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <h3 className="font-heading font-bold text-base text-foreground">
                    Head-to-Head Record: <span className="text-primary">{playerMap.get(selectedPlayerHeadToHead)?.name}</span>
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedPlayerHeadToHead(null)}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Close H2H
                </button>
              </div>

              {headToHeadMatrix.length === 0 ? (
                <p className="text-muted-foreground text-xs">No head-to-head matches found for this player.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                  {headToHeadMatrix.map((item) => (
                    <div key={item.oppId} className="p-3 bg-muted/30 border border-border/50 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={item.oppAvatar} name={item.oppName} className="w-7 h-7 rounded-full" />
                        <div>
                          <p className="font-bold text-xs text-foreground">{item.oppName}</p>
                          <p className="text-[10px] text-muted-foreground">{item.matches} Matches Played</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-emerald-500">{item.wins}W</span>{' '}
                        <span className="text-xs font-mono text-amber-500">{item.draws}D</span>{' '}
                        <span className="text-xs font-mono text-red-400">{item.losses}L</span>
                        <p className="text-[10px] font-mono text-muted-foreground mt-0.5">({item.gf} - {item.ga} Goals)</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Matches Feed - 1 Col */}
        <div className="space-y-4">
          <div className="bg-card border border-border/80 rounded-2xl shadow-sm p-5 max-h-[750px] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
              <h2 className="font-heading font-bold text-base text-foreground">Recent Duels</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Live Feed</span>
            </div>

            <div className="space-y-3">
              {enrichedMatches.slice(0, 15).map((m) => (
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
                <p className="text-muted-foreground text-xs text-center py-8">No recent duels recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
