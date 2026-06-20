import { useMemo } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { StatCard } from '@/features/overview/components/StatCard';
import { Badge } from '@/shared/components';
import { STATUS_BADGE } from '@/shared/lib/constants';

// New visual components
import { WinRateDonut } from '@/features/overview/components/WinRateDonut';
import { TopScorersBars } from '@/features/overview/components/TopScorersBars';
import { AwardsLeaderboard } from '@/features/overview/components/AwardsLeaderboard';
import { ActivityTimeline } from '@/features/overview/components/ActivityTimeline';
import { PlayerSpotlights } from '@/features/overview/components/PlayerSpotlights';
import { TopScorerSpotlights } from '@/features/overview/components/TopScorerSpotlights';
import { PointsLeaderboard } from '@/features/overview/components/PointsLeaderboard';
import { MonthlyTopXI } from '@/features/overview/components/MonthlyTopXI';
import { LatestNewsCards } from '@/features/overview/components/LatestNewsCards';

import { Target, Trophy, XCircle, Users, Activity, Medal } from 'lucide-react';

interface OverviewProps {
  setTab: (tab: string) => void;
}

export function Overview({ setTab }: OverviewProps) {
  const { players, matchEntries, matches, playerSeasonStats, seasons, news } = useFootballStore();

  // ── 1. Stat Cards Data ──
  const totalGoals = playerSeasonStats.reduce((s, e) => s + (e.goals || 0), 0);
  const totalMatches = playerSeasonStats.reduce((s, e) => s + (e.appearances || 0), 0);
  const totalWins = playerSeasonStats.reduce((s, e) => s + (e.wins || 0), 0);
  const totalLosses = playerSeasonStats.reduce((s, e) => s + (e.losses || 0), 0);
  const totalDraws = playerSeasonStats.reduce((s, e) => s + (e.draws || 0), 0);

  const cards = [
    { label: 'Total Goals', value: totalGoals, tab: 'entries', color: '#c8102e', icon: <Target className="w-5 h-5" /> },
    { label: 'Total Matches', value: totalMatches, tab: 'matches', color: '#3b82f6', icon: <Activity className="w-5 h-5" /> },
    { label: 'Total Wins', value: totalWins, tab: 'entries', color: '#10b981', icon: <Trophy className="w-5 h-5" /> },
    { label: 'Total Losses', value: totalLosses, tab: 'entries', color: '#ef4444', icon: <XCircle className="w-5 h-5" /> },
    { label: 'Total Draws', value: totalDraws, tab: 'entries', color: '#f59e0b', icon: <Medal className="w-5 h-5" /> },
    { label: 'Players', value: players.length, tab: 'players', color: '#8b5cf6', icon: <Users className="w-5 h-5" /> },
  ];

  // ── 2. Win / Draw / Loss Data ──
  const uniqueMatchesResults = useMemo(() => {
    const matchResultsMap = new Map<string, string>();
    matchEntries.forEach(e => {
      if (e.matchId && !matchResultsMap.has(e.matchId) && e.result) {
        matchResultsMap.set(e.matchId, e.result);
      }
    });
    return { matchResultsMap };
  }, [matchEntries]);

  const donutStats = useMemo(() => {
    const wins = playerSeasonStats.reduce((s, e) => s + (e.wins || 0), 0);
    const draws = playerSeasonStats.reduce((s, e) => s + (e.draws || 0), 0);
    const losses = playerSeasonStats.reduce((s, e) => s + (e.losses || 0), 0);
    return { wins, draws, losses };
  }, [playerSeasonStats]);

  // ── 3. Awards Data ──
  const awardsData = useMemo(() => {
    return players.map(p => {
      const stats = playerSeasonStats.filter(s => s.playerId === p.id);

      const histMotm = stats.reduce((acc, s) => acc + (s.motmCount || 0), 0);
      const histCS = stats.reduce((acc, s) => acc + (s.cleansheets || 0), 0);
      const histHT = stats.reduce((acc, s) => acc + (s.hattricks || 0), 0);

      return {
        player: p,
        motm: histMotm,
        cleanSheets: histCS,
        hattricks: histHT,
      };
    });
  }, [players, playerSeasonStats]);

  // ── 4. Activity Timeline Data ──
  const matchDates = useMemo(() => {
    return matches.map(m => m.date).filter(Boolean) as string[];
  }, [matches]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* Hero Banner Section */}
      <div className="relative w-full rounded-3xl overflow-hidden mb-12 shadow-2xl aspect-[3/1] group">
        <img
          src="/images/hero-banner.jpg"
          alt="The Enigmatic Elite Banner"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-10 stagger-children">
        {cards.map(c => (
          <StatCard
            key={c.label}
            label={c.label}
            value={c.value}
            accent={c.color}
            icon={c.icon}
            onClick={() => setTab(c.tab)}
          />
        ))}
      </div>

      {/* Player Spotlights */}
      <PlayerSpotlights
        players={players}
        matchEntries={matchEntries}
        playerSeasonStats={playerSeasonStats}
      />

      {/* Top Scorer Spotlights */}
      <TopScorerSpotlights
        players={players}
        matchEntries={matchEntries}
        playerSeasonStats={playerSeasonStats}
      />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 stagger-children" style={{ animationDelay: '0.6s' }}>
        <div className="lg:col-span-1 h-full">
          <WinRateDonut
            wins={donutStats.wins || totalWins}
            draws={donutStats.draws || totalDraws}
            losses={donutStats.losses || totalLosses}
          />
        </div>
        <div className="lg:col-span-2 h-full">
          <TopScorersBars
            players={players}
            playerSeasonStats={playerSeasonStats}
            seasons={seasons}
            matchEntries={matchEntries}
          />
        </div>

        <div className="lg:col-span-2 h-full">
          <AwardsLeaderboard data={awardsData} />
        </div>
        <div className="lg:col-span-1 h-full">
          <ActivityTimeline dates={matchDates} />
        </div>
      </div>

      {/* Points Leaderboards */}
      <div className="mb-8">
        <PointsLeaderboard
          players={players}
          matchEntries={matchEntries}
          seasons={seasons}
          playerSeasonStats={playerSeasonStats}
          limit={5}
        />
      </div>

      {/* Monthly Top XI & Recent Matches Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 flex w-full min-w-0">
          <MonthlyTopXI players={players} matchEntries={matchEntries} />
        </div>

        <div className="xl:col-span-1 flex">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col w-full h-full max-h-[700px] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="font-semibold text-base text-foreground tracking-tight">Recent Matches</p>
              <Badge bg="#1a1a1a" c="#e5e5e5">Live</Badge>
            </div>
            {matches.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center my-auto">No matches yet</p>
            ) : (
              <div className="flex flex-col gap-2">
                {([...matches].reverse().slice(0, 8)).map(m => {
                  const sb = STATUS_BADGE[m.status as keyof typeof STATUS_BADGE] ?? STATUS_BADGE.finished;
                  const result = uniqueMatchesResults.matchResultsMap.get(m.id);

                  return (
                    <div key={m.id} className="py-4 border-b border-border/50 last:border-0 group transition-colors">
                      <div className="flex justify-between items-center gap-4 mb-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-[13px] font-bold text-foreground leading-tight">{m.homeTeam} <span className="text-muted-foreground font-normal mx-1">vs</span> {m.awayTeam}</span>
                          {m.status === 'finished' && result && (
                            <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-sm tracking-wider ${result === 'win' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                result === 'draw' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                  'bg-red-500/10 text-red-500 border border-red-500/20'
                              }`}>
                              {result === 'loss' ? 'lost' : result}
                            </span>
                          )}
                        </div>
                        <Badge bg={sb.bg} c={sb.c}>{m.status}</Badge>
                      </div>
                      <p className="text-[11px] font-medium text-muted-foreground">{m.competition} · {m.date}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Latest News Cards */}
      <LatestNewsCards news={news} onViewAll={() => setTab('news')} />

    </div>
  );
}
