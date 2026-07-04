import { useMemo, useEffect, useState } from 'react';
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
import { OverviewPointsLeaderboard } from '@/features/overview/components/OverviewPointsLeaderboard';
import { MonthlyTopXI } from '@/features/overview/components/MonthlyTopXI';
import { LatestNewsCards } from '@/features/overview/components/LatestNewsCards';
import { ClubRecords } from '@/features/overview/components/ClubRecords';
import { TeamMilestones } from '@/features/overview/components/TeamMilestones';

import { Target, Trophy, XCircle, Users, Activity, Medal, Cake, PartyPopper } from 'lucide-react';
import { Avatar } from '@/shared/components';

interface OverviewProps {
  setTab: (tab: string) => void;
}

export function Overview({ setTab }: OverviewProps) {
  const { players, matchEntries, matches, playerSeasonStats, seasons, news, playerMonthlyStats, playerWeeklyStats, fetchPlayers, fetchMatches, fetchMatchEntries, fetchPlayerSeasonStats, fetchPlayerMonthlyStats, fetchPlayerWeeklyStats, fetchNews } = useFootballStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchPlayers(),
        fetchMatches(),
        fetchMatchEntries(),
        fetchPlayerSeasonStats(),
        fetchPlayerMonthlyStats(),
        fetchPlayerWeeklyStats(),
        fetchNews(),
      ]);
      setIsLoading(false);
    };
    load();
  }, [fetchPlayers, fetchMatches, fetchMatchEntries, fetchPlayerSeasonStats, fetchPlayerMonthlyStats, fetchPlayerWeeklyStats, fetchNews]);

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

  const topWinnerPlayer = useMemo(() => {
    if (players.length === 0 || playerSeasonStats.length === 0) return null;

    const winsByPlayer = players.map(p => {
      const stats = playerSeasonStats.filter(s => s.playerId === p.id);
      const playerWins = stats.reduce((acc, s) => acc + (s.wins || 0), 0);
      return { player: p, wins: playerWins };
    });

    winsByPlayer.sort((a, b) => b.wins - a.wins);

    if (winsByPlayer.length > 0 && winsByPlayer[0].wins > 0) {
      return winsByPlayer[0];
    }
    return null;
  }, [players, playerSeasonStats]);

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

  const birthdayPlayers = useMemo(() => {
    const now = new Date();
    const today = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    return players.filter(player => {
      if (!player.dateOfBirth) return false;
      const rawBirthDate = player.dateOfBirth.slice(0, 10);
      const birthDate = new Date(rawBirthDate);
      if (Number.isNaN(birthDate.getTime())) return false;
      const birthMonthDay = `${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;

      return birthMonthDay === today;
    });
  }, [players]);

  const confettiPieces = useMemo(() => {
    if (birthdayPlayers.length === 0) return [];

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#f43f5e'];
    return Array.from({ length: Math.min(28, birthdayPlayers.length * 10) }, (_, index) => {
      const size = 6 + Math.random() * 8;
      return {
        id: index,
        left: `${Math.random() * 100}%`,
        top: `${-10 - Math.random() * 30}px`,
        delay: `${Math.random() * 1.8}s`,
        duration: `${2.8 + Math.random() * 1.8}s`,
        size,
        color: colors[index % colors.length],
        rotation: `${Math.random() * 360}deg`,
        drift: `${-20 + Math.random() * 40}px`,
      };
    });
  }, [birthdayPlayers.length]);

  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="mb-10 space-y-2 animate-pulse">
          <div className="h-6 w-64 bg-muted rounded-md" />
          <div className="h-4 w-80 bg-muted rounded-md" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3 animate-pulse">
              <div className="h-4 w-20 bg-muted rounded-md" />
              <div className="h-8 w-12 bg-muted rounded-md" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 h-[320px] bg-card border border-border rounded-xl p-5 animate-pulse" />
          <div className="lg:col-span-2 h-[320px] bg-card border border-border rounded-xl p-5 animate-pulse" />
          <div className="lg:col-span-2 h-[320px] bg-card border border-border rounded-xl p-5 animate-pulse" />
          <div className="lg:col-span-1 h-[320px] bg-card border border-border rounded-xl p-5 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

      {birthdayPlayers.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl mb-8 border border-border bg-gradient-to-r from-card via-muted/40 to-card shadow-lg">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {confettiPieces.map(piece => (
              <span
                key={piece.id}
                className="absolute rounded-sm opacity-90 birthday-confetti"
                style={{
                  left: piece.left,
                  top: piece.top,
                  width: `${piece.size}px`,
                  height: `${piece.size * 0.55}px`,
                  backgroundColor: piece.color,
                  animationDelay: piece.delay,
                  animationDuration: piece.duration,
                  transform: `rotate(${piece.rotation})`,
                  ['--confetti-drift' as any]: piece.drift,
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.10),_transparent_30%)]" />
          <div className="relative p-5 md:p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center">
                <PartyPopper className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/70 mb-1">Birthday Alert</p>
                <h2 className="text-xl md:text-2xl font-black text-foreground leading-tight">
                  {birthdayPlayers.length === 1
                    ? `Today is ${birthdayPlayers[0].name}'s birthday`
                    : `Today is ${birthdayPlayers.length} players' birthday`}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Send them some love and make their day special.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {birthdayPlayers.map(player => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-background/80 px-3 py-2 shadow-sm backdrop-blur-sm"
                >
                  <Avatar name={player.name} src={player.profileImageUrl} size={32} className="ring-2 ring-primary/15" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Cake className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-semibold text-foreground truncate">{player.name}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">Wish them a great day</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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

      {/* Club Records and Milestones */}
      <ClubRecords players={players} matches={matches} matchEntries={matchEntries} />
      <TeamMilestones playerSeasonStats={playerSeasonStats} />

      {/* Player Spotlights */}
      <PlayerSpotlights
        players={players}
        playerSeasonStats={playerSeasonStats}
        playerWeeklyStats={playerWeeklyStats}
        playerMonthlyStats={playerMonthlyStats}
      />

      {/* Top Scorer Spotlights */}
      <TopScorerSpotlights
        players={players}
        playerSeasonStats={playerSeasonStats}
        playerWeeklyStats={playerWeeklyStats}
        playerMonthlyStats={playerMonthlyStats}
      />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 stagger-children" style={{ animationDelay: '0.6s' }}>
        <div className="lg:col-span-1 h-full">
          <WinRateDonut
            wins={donutStats.wins || totalWins}
            draws={donutStats.draws || totalDraws}
            losses={donutStats.losses || totalLosses}
            topWinnerName={topWinnerPlayer?.player.name}
            topWinnerWins={topWinnerPlayer?.wins}
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

      {/* Points Leaderboard — 3 cards: Weekly / Monthly / Overall */}
      <div className="mb-8">
        <OverviewPointsLeaderboard
          players={players}
          matchEntries={matchEntries}
          seasons={seasons}
          playerSeasonStats={playerSeasonStats}
          playerMonthlyStats={playerMonthlyStats}
          playerWeeklyStats={playerWeeklyStats}
          limit={5}
        />
      </div>

      {/* Monthly Top XI & Recent Matches Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 w-full min-w-0">
          <MonthlyTopXI players={players} matchEntries={matchEntries} playerMonthlyStats={playerMonthlyStats} />
        </div>

        <div className="xl:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col w-full">
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
