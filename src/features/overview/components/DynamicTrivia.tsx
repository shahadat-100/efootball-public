import { useMemo, useState, useEffect, useCallback } from 'react';
import { Player, PlayerSeasonStat } from '@/features/players/types';
import { MatchEntry } from '@/features/match-entries/types';
import { Match } from '@/features/matches/types';
import { NewsArticle } from '@/features/news/types';
import { PlayerMonthlyStat, PlayerWeeklyStat } from '@/store/footballStore';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';

interface DynamicTriviaProps {
  players: Player[];
  playerSeasonStats: PlayerSeasonStat[];
  playerMonthlyStats: PlayerMonthlyStat[];
  playerWeeklyStats: PlayerWeeklyStat[];
  matchEntries: MatchEntry[];
  matches: Match[];
  news: NewsArticle[];
}

interface TriviaFact {
  label: string;
  headline: string;
  highlight: string;
  suffix: string;
  player?: Player;
  accentColor: string;
  bgGradient: string;
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const now = new Date();
const currentMonthIndex = now.getMonth();
const currentYear = now.getFullYear();
const currentDay = now.getDate();
const currentWeek = currentDay <= 7 ? 1 : currentDay <= 14 ? 2 : currentDay <= 21 ? 3 : 4;

export function DynamicTrivia({ players, playerSeasonStats, playerMonthlyStats, playerWeeklyStats, matchEntries, matches, news }: DynamicTriviaProps) {
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  // ── Aggregate season stats per player ──
  const agg = useMemo(() => {
    const map = new Map<string, { goals: number; wins: number; losses: number; draws: number; cleansheets: number; hattricks: number; motmCount: number; appearances: number; goalsConceded: number }>();
    playerSeasonStats.forEach(s => {
      const prev = map.get(s.playerId) ?? { goals: 0, wins: 0, losses: 0, draws: 0, cleansheets: 0, hattricks: 0, motmCount: 0, appearances: 0, goalsConceded: 0 };
      map.set(s.playerId, {
        goals: prev.goals + (s.goals || 0),
        wins: prev.wins + (s.wins || 0),
        losses: prev.losses + (s.losses || 0),
        draws: prev.draws + (s.draws || 0),
        cleansheets: prev.cleansheets + (s.cleansheets || 0),
        hattricks: prev.hattricks + (s.hattricks || 0),
        motmCount: prev.motmCount + (s.motmCount || 0),
        appearances: prev.appearances + (s.appearances || 0),
        goalsConceded: prev.goalsConceded + (s.goalsConceded || 0),
      });
    });
    return map;
  }, [playerSeasonStats]);

  const trivias = useMemo((): TriviaFact[] => {
    if (players.length === 0) return [];
    const facts: TriviaFact[] = [];
    const getP = (id: string) => players.find(p => p.id === id);

    type AggKey = 'goals' | 'wins' | 'losses' | 'draws' | 'cleansheets' | 'hattricks' | 'motmCount' | 'appearances' | 'goalsConceded';
    const sortBy = (key: AggKey) => [...agg.entries()].sort((a, b) => (b[1][key] ?? 0) - (a[1][key] ?? 0));

    // ── SEASON / ALL-TIME STATS ──
    const topGoals = sortBy('goals')[0];
    if (topGoals?.[1].goals > 0) { const p = getP(topGoals[0]); if (p) facts.push({ label: 'All-Time Top Scorer', headline: 'GOALS', highlight: String(topGoals[1].goals), suffix: 'goals scored total', player: p, accentColor: '#ef4444', bgGradient: 'from-red-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    const topWins = sortBy('wins')[0];
    if (topWins?.[1].wins > 0) { const p = getP(topWins[0]); if (p) facts.push({ label: 'Victory King', headline: 'WINS', highlight: String(topWins[1].wins), suffix: 'matches won', player: p, accentColor: '#22c55e', bgGradient: 'from-green-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    const topMotm = sortBy('motmCount')[0];
    if (topMotm?.[1].motmCount > 0) { const p = getP(topMotm[0]); if (p) facts.push({ label: 'Man of the Match King', headline: 'MOTM', highlight: String(topMotm[1].motmCount), suffix: 'MOTM awards', player: p, accentColor: '#f59e0b', bgGradient: 'from-amber-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    const topCS = sortBy('cleansheets')[0];
    if (topCS?.[1].cleansheets > 0) { const p = getP(topCS[0]); if (p) facts.push({ label: 'Defensive Wall', headline: 'CLEAN SHEETS', highlight: String(topCS[1].cleansheets), suffix: 'shutouts kept', player: p, accentColor: '#3b82f6', bgGradient: 'from-blue-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    const topHT = sortBy('hattricks')[0];
    if (topHT?.[1].hattricks > 0) { const p = getP(topHT[0]); if (p) facts.push({ label: 'Hat-Trick Hero', headline: 'HAT-TRICKS', highlight: String(topHT[1].hattricks), suffix: 'hat-tricks scored', player: p, accentColor: '#a855f7', bgGradient: 'from-purple-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    const topApps = sortBy('appearances')[0];
    if (topApps?.[1].appearances > 0) { const p = getP(topApps[0]); if (p) facts.push({ label: 'Club Stalwart', headline: 'APPEARANCES', highlight: String(topApps[1].appearances), suffix: 'matches played', player: p, accentColor: '#06b6d4', bgGradient: 'from-cyan-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    const topLoss = sortBy('losses')[0];
    if (topLoss?.[1].losses > 0) { const p = getP(topLoss[0]); if (p) facts.push({ label: 'True Warrior 💪', headline: 'LOSSES', highlight: String(topLoss[1].losses), suffix: 'times — never gave up!', player: p, accentColor: '#f97316', bgGradient: 'from-orange-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    const topGC = sortBy('goalsConceded')[0];
    if (topGC?.[1].goalsConceded > 0) { const p = getP(topGC[0]); if (p) facts.push({ label: 'Learning the Hard Way', headline: 'GOALS CONCEDED', highlight: String(topGC[1].goalsConceded), suffix: 'goals let in', player: p, accentColor: '#fb7185', bgGradient: 'from-rose-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    // Win rate (min 10 games)
    const winRates = [...agg.entries()].filter(([, s]) => s.appearances >= 10).map(([id, s]) => ({ id, rate: Math.round((s.wins / s.appearances) * 100) })).sort((a, b) => b.rate - a.rate);
    if (winRates[0]) { const p = getP(winRates[0].id); if (p) facts.push({ label: 'Highest Win Rate', headline: 'WIN RATE', highlight: `${winRates[0].rate}%`, suffix: 'of matches won', player: p, accentColor: '#10b981', bgGradient: 'from-emerald-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    // Goals per match (min 5 games)
    const gpm = [...agg.entries()].filter(([, s]) => s.appearances >= 5).map(([id, s]) => ({ id, v: parseFloat((s.goals / s.appearances).toFixed(2)) })).sort((a, b) => b.v - a.v);
    if (gpm[0]?.v > 0) { const p = getP(gpm[0].id); if (p) facts.push({ label: 'Most Clinical Finisher', headline: 'GOALS / GAME', highlight: String(gpm[0].v), suffix: 'average per match', player: p, accentColor: '#f43f5e', bgGradient: 'from-rose-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    // ── MONTHLY LEADERBOARD (current month) ──
    const thisMonthStats = playerMonthlyStats.filter(s => s.monthIndex === currentMonthIndex && s.year === currentYear);

    const topMonthGoals = [...thisMonthStats].sort((a, b) => b.goals - a.goals)[0];
    if (topMonthGoals?.goals > 0) { const p = getP(topMonthGoals.playerId); if (p) facts.push({ label: `${MONTH_NAMES[currentMonthIndex]} Top Scorer`, headline: 'THIS MONTH', highlight: String(topMonthGoals.goals), suffix: `goals in ${MONTH_NAMES[currentMonthIndex]}`, player: p, accentColor: '#ef4444', bgGradient: 'from-red-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    const topMonthWins = [...thisMonthStats].sort((a, b) => b.wins - a.wins)[0];
    if (topMonthWins?.wins > 0) { const p = getP(topMonthWins.playerId); if (p) facts.push({ label: `${MONTH_NAMES[currentMonthIndex]} Win Leader`, headline: 'MONTHLY WINS', highlight: String(topMonthWins.wins), suffix: `wins in ${MONTH_NAMES[currentMonthIndex]}`, player: p, accentColor: '#22c55e', bgGradient: 'from-green-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    const topMonthMotm = [...thisMonthStats].sort((a, b) => b.motmCount - a.motmCount)[0];
    if (topMonthMotm?.motmCount > 0) { const p = getP(topMonthMotm.playerId); if (p) facts.push({ label: `${MONTH_NAMES[currentMonthIndex]} MOTM Leader`, headline: 'MONTHLY MOTM', highlight: String(topMonthMotm.motmCount), suffix: `MOTM awards this month`, player: p, accentColor: '#f59e0b', bgGradient: 'from-amber-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    const topMonthCS = [...thisMonthStats].sort((a, b) => b.cleansheets - a.cleansheets)[0];
    if (topMonthCS?.cleansheets > 0) { const p = getP(topMonthCS.playerId); if (p) facts.push({ label: `${MONTH_NAMES[currentMonthIndex]} Clean Sheet Leader`, headline: 'MONTHLY CS', highlight: String(topMonthCS.cleansheets), suffix: 'shutouts this month', player: p, accentColor: '#3b82f6', bgGradient: 'from-blue-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    // Points calc for monthly leaderboard
    const calcPts = (s: { wins: number; draws: number; losses: number; goals: number; goalsConceded: number; hattricks: number; motmCount: number }) =>
      s.wins * 10 + s.draws * 5 - s.losses * 3 + s.goals - s.goalsConceded + s.motmCount * 4 + s.hattricks;

    const topMonthPts = [...thisMonthStats].map(s => ({ ...s, pts: calcPts(s) })).sort((a, b) => b.pts - a.pts)[0];
    if (topMonthPts?.pts > 0) { const p = getP(topMonthPts.playerId); if (p) facts.push({ label: `${MONTH_NAMES[currentMonthIndex]} Points Leader`, headline: 'LEADERBOARD', highlight: String(topMonthPts.pts), suffix: 'points this month', player: p, accentColor: '#8b5cf6', bgGradient: 'from-violet-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    // ── WEEKLY LEADERBOARD (current week) ──
    const thisWeekStats = playerWeeklyStats.filter(s => s.week === currentWeek && s.monthIndex === currentMonthIndex && s.year === currentYear);

    const topWeekGoals = [...thisWeekStats].sort((a, b) => b.goals - a.goals)[0];
    if (topWeekGoals?.goals > 0) { const p = getP(topWeekGoals.playerId); if (p) facts.push({ label: `Week ${currentWeek} Top Scorer`, headline: 'THIS WEEK', highlight: String(topWeekGoals.goals), suffix: 'goals this week', player: p, accentColor: '#ef4444', bgGradient: 'from-red-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    const topWeekPts = [...thisWeekStats].map(s => ({ ...s, pts: calcPts(s) })).sort((a, b) => b.pts - a.pts)[0];
    if (topWeekPts?.pts > 0) { const p = getP(topWeekPts.playerId); if (p) facts.push({ label: `Week ${currentWeek} Points Leader`, headline: 'WEEKLY RANK', highlight: String(topWeekPts.pts), suffix: 'points this week', player: p, accentColor: '#06b6d4', bgGradient: 'from-cyan-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    const topWeekCS = [...thisWeekStats].sort((a, b) => b.cleansheets - a.cleansheets)[0];
    if (topWeekCS?.cleansheets > 0) { const p = getP(topWeekCS.playerId); if (p) facts.push({ label: `Week ${currentWeek} Clean Sheet`, headline: 'WEEKLY CS', highlight: String(topWeekCS.cleansheets), suffix: 'clean sheets this week', player: p, accentColor: '#10b981', bgGradient: 'from-emerald-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    const topWeekMotm = [...thisWeekStats].sort((a, b) => b.motmCount - a.motmCount)[0];
    if (topWeekMotm?.motmCount > 0) { const p = getP(topWeekMotm.playerId); if (p) facts.push({ label: `Week ${currentWeek} MOTM`, headline: 'WEEKLY MOTM', highlight: String(topWeekMotm.motmCount), suffix: 'MOTM awards this week', player: p, accentColor: '#a855f7', bgGradient: 'from-purple-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    // ── MATCH ENTRIES — Individual match facts ──
    // Biggest single-game haul
    const biggestGame = [...matchEntries].sort((a, b) => (b.goals ?? 0) - (a.goals ?? 0))[0];
    if (biggestGame?.goals && biggestGame.goals >= 3) {
      const p = getP(biggestGame.playerId);
      if (p) facts.push({ label: 'Biggest Single Game Performance', headline: 'IN ONE MATCH', highlight: String(biggestGame.goals), suffix: `goals in one game${biggestGame.date ? ` (${biggestGame.date})` : ''}`, player: p, accentColor: '#f59e0b', bgGradient: 'from-amber-950/80 via-[#0d0d0d] to-[#0d0d0d]' });
    }

    // Most opponents faced
    const opponentsMap = new Map<string, Set<string>>();
    matchEntries.forEach(e => { if (!e.notes || !e.playerId) return; if (!opponentsMap.has(e.playerId)) opponentsMap.set(e.playerId, new Set()); opponentsMap.get(e.playerId)!.add(e.notes.split('(')[0].trim()); });
    const topOpponents = [...opponentsMap.entries()].sort((a, b) => b[1].size - a[1].size)[0];
    if (topOpponents?.[1].size > 2) { const p = getP(topOpponents[0]); if (p) facts.push({ label: 'Most Battle-Hardened', headline: 'OPPONENTS FACED', highlight: String(topOpponents[1].size), suffix: 'different opponents', player: p, accentColor: '#8b5cf6', bgGradient: 'from-violet-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    // Longest win streak from entries
    const entriesByPlayer = new Map<string, MatchEntry[]>();
    matchEntries.forEach(e => { if (!entriesByPlayer.has(e.playerId)) entriesByPlayer.set(e.playerId, []); entriesByPlayer.get(e.playerId)!.push(e); });
    let bestStreak = 0; let bestStreakPlayerId = '';
    entriesByPlayer.forEach((entries, playerId) => {
      const sorted = [...entries].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
      let streak = 0, max = 0;
      sorted.forEach(e => { if (e.result === 'win') { streak++; max = Math.max(max, streak); } else streak = 0; });
      if (max > bestStreak) { bestStreak = max; bestStreakPlayerId = playerId; }
    });
    if (bestStreak >= 3) { const p = getP(bestStreakPlayerId); if (p) facts.push({ label: 'Longest Win Streak Ever', headline: 'WIN STREAK', highlight: String(bestStreak), suffix: 'wins in a row', player: p, accentColor: '#22c55e', bgGradient: 'from-green-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    // Most MOTM in a single month
    const motmMonthly = [...playerMonthlyStats].sort((a, b) => b.motmCount - a.motmCount)[0];
    if (motmMonthly?.motmCount > 1) { const p = getP(motmMonthly.playerId); if (p) facts.push({ label: 'Most MOTMs in One Month', headline: 'BEST MONTH', highlight: String(motmMonthly.motmCount), suffix: `MOTM in ${MONTH_NAMES[motmMonthly.monthIndex]}`, player: p, accentColor: '#f59e0b', bgGradient: 'from-amber-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    // Most goals in a single month
    const goalsMonthly = [...playerMonthlyStats].sort((a, b) => b.goals - a.goals)[0];
    if (goalsMonthly?.goals > 0) { const p = getP(goalsMonthly.playerId); if (p) facts.push({ label: 'Best Scoring Month Ever', headline: 'RECORD MONTH', highlight: String(goalsMonthly.goals), suffix: `goals in ${MONTH_NAMES[goalsMonthly.monthIndex]}`, player: p, accentColor: '#ef4444', bgGradient: 'from-red-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    // Most CS in a single month
    const csMonthly = [...playerMonthlyStats].sort((a, b) => b.cleansheets - a.cleansheets)[0];
    if (csMonthly?.cleansheets > 0) { const p = getP(csMonthly.playerId); if (p) facts.push({ label: 'Best CS Month Ever', headline: 'RECORD MONTH', highlight: String(csMonthly.cleansheets), suffix: `clean sheets in ${MONTH_NAMES[csMonthly.monthIndex]}`, player: p, accentColor: '#3b82f6', bgGradient: 'from-blue-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    // ── MATCHES — Club-level records ──
    const finishedMatches = matches.filter(m => m.status === 'finished' && m.homeScore !== null && m.awayScore !== null);

    // Biggest club win (home score - away score)
    const biggestWin = [...finishedMatches]
      .map(m => ({ m, diff: (m.homeScore ?? 0) - (m.awayScore ?? 0) }))
      .sort((a, b) => b.diff - a.diff)[0];
    if (biggestWin?.diff > 0) {
      facts.push({ label: 'Club\'s Biggest Victory', headline: 'WIN BY', highlight: `+${biggestWin.diff}`, suffix: `vs ${biggestWin.m.awayTeam} (${biggestWin.m.homeScore}-${biggestWin.m.awayScore})`, accentColor: '#22c55e', bgGradient: 'from-green-950/80 via-[#0d0d0d] to-[#0d0d0d]' });
    }

    // Most goals in one match (combined)
    const highestScoring = [...finishedMatches]
      .map(m => ({ m, total: (m.homeScore ?? 0) + (m.awayScore ?? 0) }))
      .sort((a, b) => b.total - a.total)[0];
    if (highestScoring?.total >= 6) {
      facts.push({ label: 'Most Goals in One Match', headline: 'EPIC GAME', highlight: String(highestScoring.total), suffix: `goals! ${highestScoring.m.homeTeam} ${highestScoring.m.homeScore}-${highestScoring.m.awayScore} ${highestScoring.m.awayTeam}`, accentColor: '#f97316', bgGradient: 'from-orange-950/80 via-[#0d0d0d] to-[#0d0d0d]' });
    }

    // Total matches played
    if (finishedMatches.length > 0) {
      facts.push({ label: 'Club Journey So Far', headline: 'TOTAL MATCHES', highlight: String(finishedMatches.length), suffix: 'competitive matches played', accentColor: '#06b6d4', bgGradient: 'from-cyan-950/80 via-[#0d0d0d] to-[#0d0d0d]' });
    }

    // Total goals scored by club
    const clubTotalGoals = finishedMatches.reduce((sum, m) => sum + (m.homeScore ?? 0), 0);
    if (clubTotalGoals > 0) {
      facts.push({ label: 'Total Goals Scored', headline: 'CLUB GOALS', highlight: String(clubTotalGoals), suffix: 'goals scored as a club', accentColor: '#ef4444', bgGradient: 'from-red-950/80 via-[#0d0d0d] to-[#0d0d0d]' });
    }

    // ── NEWS — Latest headline as trivia ──
    const latestNews = [...news].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))[0];
    if (latestNews?.title) {
      facts.push({ label: '📰 Latest Club News', headline: latestNews.category?.toUpperCase() ?? 'NEWS', highlight: '🗞️', suffix: latestNews.title, accentColor: '#8b5cf6', bgGradient: 'from-violet-950/80 via-[#0d0d0d] to-[#0d0d0d]' });
    }
    // Hot news
    const hotNews = news.filter(n => n.hot).slice(0, 1)[0];
    if (hotNews?.title && hotNews.id !== latestNews?.id) {
      facts.push({ label: '🔥 Trending News', headline: hotNews.category?.toUpperCase() ?? 'HOT', highlight: '🔥', suffix: hotNews.title, accentColor: '#f97316', bgGradient: 'from-orange-950/80 via-[#0d0d0d] to-[#0d0d0d]' });
    }

    // Shuffle and return
    return facts.sort(() => 0.5 - Math.random());
  }, [players, playerSeasonStats, playerMonthlyStats, playerWeeklyStats, matchEntries, matches, news, agg]);

  const go = useCallback((dir: 1 | -1) => {
    setAnimating(true);
    setTimeout(() => {
      setTriviaIndex(prev => (prev + dir + trivias.length) % trivias.length);
      setAnimating(false);
    }, 150);
  }, [trivias.length]);

  useEffect(() => {
    if (trivias.length > 1) {
      const t = setInterval(() => go(1), 7000);
      return () => clearInterval(t);
    }
  }, [trivias.length, go]);

  if (trivias.length === 0) return null;

  const fact = trivias[triviaIndex];

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl bg-gradient-to-r ${fact.bgGradient} transition-all duration-500`}
      style={{ minHeight: '220px', border: `1px solid ${fact.accentColor}22` }}
    >
      {/* Glow blob */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 0% 50%, ${fact.accentColor}22 0%, transparent 60%)` }} />

      {/* Content */}
      <div className={`relative z-10 flex items-stretch h-full transition-opacity duration-150 ${animating ? 'opacity-0' : 'opacity-100'}`}>

        {/* Left — Text */}
        <div className="flex-1 flex flex-col justify-center gap-2 p-8 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3.5 h-3.5" style={{ color: fact.accentColor }} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: fact.accentColor }}>{fact.label}</span>
          </div>

          {/* Big bold stat */}
          <div className="leading-none font-black text-white" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', textShadow: `0 0 40px ${fact.accentColor}55` }}>
            {fact.highlight}
          </div>

          {/* Headline */}
          <div className="font-black text-white/80 uppercase tracking-widest" style={{ fontSize: 'clamp(0.85rem, 1.8vw, 1.25rem)' }}>
            {fact.headline}
          </div>

          <p className="text-sm text-white/50 font-medium mt-1 line-clamp-2">
            {fact.player ? `${fact.player.name} · ` : ''}{fact.suffix}
          </p>

          {/* Dots + nav */}
          <div className="flex items-center gap-3 mt-4">
            <button onClick={() => go(-1)} className="text-white/30 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <div className="flex gap-1.5 flex-wrap max-w-[240px]">
              {trivias.map((_, i) => (
                <button key={i} onClick={() => setTriviaIndex(i)}
                  className="rounded-full transition-all duration-300"
                  style={{ width: i === triviaIndex ? '20px' : '6px', height: '6px', background: i === triviaIndex ? fact.accentColor : 'rgba(255,255,255,0.2)' }}
                />
              ))}
            </div>
            <button onClick={() => go(1)} className="text-white/30 hover:text-white transition-colors"><ChevronRight className="w-4 h-4" /></button>
            <span className="text-[10px] text-white/25 ml-1">{triviaIndex + 1}/{trivias.length}</span>
          </div>
        </div>

        {/* Right — Player cutout */}
        {fact.player?.profileImageUrl && (
          <div className="relative flex-shrink-0 w-52 flex items-end justify-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(to left, ${fact.accentColor}18, transparent 80%)` }} />
            <img
              src={fact.player.profileImageUrl}
              alt={fact.player.name}
              className="relative z-10 h-full w-full object-cover object-top"
              style={{ mixBlendMode: 'luminosity', filter: 'contrast(1.1) brightness(0.95)' }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-16 z-20 pointer-events-none" style={{ background: 'linear-gradient(to top, #0d0d0d, transparent)' }} />
          </div>
        )}
      </div>
    </div>
  );
}
