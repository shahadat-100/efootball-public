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
    const push = (f: TriviaFact) => { if (f.highlight && f.highlight !== '0') facts.push(f); };

    type AggStat = { goals: number; wins: number; losses: number; draws: number; cleansheets: number; hattricks: number; motmCount: number; appearances: number; goalsConceded: number };
    type AggKey = keyof AggStat;
    const topOf = (arr: Array<[string, AggStat]>, key: AggKey) => arr.sort((a, b) => (b[1][key] ?? 0) - (a[1][key] ?? 0))[0];

    // ─────────────────────────────────────
    // 1. ALL-TIME (across all seasons)
    // ─────────────────────────────────────
    const aggAll = [...agg.entries()];

    const at = topOf([...aggAll], 'goals');
    if (at?.[1].goals > 0) { const p = getP(at[0]); if (p) push({ label: 'All-Time Top Scorer', headline: 'GOALS', highlight: String(at[1].goals), suffix: 'total goals scored', player: p, accentColor: '#ef4444', bgGradient: 'from-red-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
    const atW = topOf([...aggAll], 'wins');
    if (atW?.[1].wins > 0) { const p = getP(atW[0]); if (p) push({ label: 'All-Time Victory King', headline: 'WINS', highlight: String(atW[1].wins), suffix: 'matches won ever', player: p, accentColor: '#22c55e', bgGradient: 'from-green-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
    const atM = topOf([...aggAll], 'motmCount');
    if (atM?.[1].motmCount > 0) { const p = getP(atM[0]); if (p) push({ label: 'All-Time MOTM King', headline: 'MOTM', highlight: String(atM[1].motmCount), suffix: 'Man of the Match awards', player: p, accentColor: '#f59e0b', bgGradient: 'from-amber-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
    const atCS = topOf([...aggAll], 'cleansheets');
    if (atCS?.[1].cleansheets > 0) { const p = getP(atCS[0]); if (p) push({ label: 'All-Time Defensive Wall', headline: 'CLEAN SHEETS', highlight: String(atCS[1].cleansheets), suffix: 'shutouts kept', player: p, accentColor: '#3b82f6', bgGradient: 'from-blue-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
    const atHT = topOf([...aggAll], 'hattricks');
    if (atHT?.[1].hattricks > 0) { const p = getP(atHT[0]); if (p) push({ label: 'All-Time Hat-Trick Hero', headline: 'HAT-TRICKS', highlight: String(atHT[1].hattricks), suffix: 'hat-tricks scored', player: p, accentColor: '#a855f7', bgGradient: 'from-purple-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
    const atA = topOf([...aggAll], 'appearances');
    if (atA?.[1].appearances > 0) { const p = getP(atA[0]); if (p) push({ label: 'Club Stalwart — Most Loyal', headline: 'APPEARANCES', highlight: String(atA[1].appearances), suffix: 'matches played', player: p, accentColor: '#06b6d4', bgGradient: 'from-cyan-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
    const atL = topOf([...aggAll], 'losses');
    if (atL?.[1].losses > 0) { const p = getP(atL[0]); if (p) push({ label: 'True Warrior 💪', headline: 'LOSSES', highlight: String(atL[1].losses), suffix: 'never gave up!', player: p, accentColor: '#f97316', bgGradient: 'from-orange-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
    // Win rate all-time (min 5 games)
    const wrAll = aggAll.filter(([, s]) => s.appearances >= 5).map(([id, s]) => ({ id, rate: Math.round((s.wins / s.appearances) * 100) })).sort((a, b) => b.rate - a.rate)[0];
    if (wrAll) { const p = getP(wrAll.id); if (p) push({ label: 'All-Time Highest Win Rate', headline: 'WIN RATE', highlight: `${wrAll.rate}%`, suffix: 'of matches won', player: p, accentColor: '#10b981', bgGradient: 'from-emerald-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
    // Goals per match all-time
    const gpmAll = aggAll.filter(([, s]) => s.appearances >= 5).map(([id, s]) => ({ id, v: parseFloat((s.goals / s.appearances).toFixed(2)) })).sort((a, b) => b.v - a.v)[0];
    if (gpmAll?.v > 0) { const p = getP(gpmAll.id); if (p) push({ label: 'Most Clinical Finisher', headline: 'GOALS/GAME', highlight: String(gpmAll.v), suffix: 'average goals per match', player: p, accentColor: '#f43f5e', bgGradient: 'from-rose-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    // ─────────────────────────────────────
    // 2. PER-SEASON facts
    // ─────────────────────────────────────
    const seasonIds = [...new Set(playerSeasonStats.map(s => s.seasonId))];
    seasonIds.forEach(seasonId => {
      const season = playerSeasonStats.find(s => s.seasonId === seasonId);
      const label = season?.seasonName || `Season ${seasonId}`;
      const rows = playerSeasonStats.filter(s => s.seasonId === seasonId);

      const aggS = new Map<string, AggStat>();
      rows.forEach(s => { aggS.set(s.playerId, { goals: s.goals, wins: s.wins, losses: s.losses, draws: s.draws, cleansheets: s.cleansheets, hattricks: s.hattricks, motmCount: s.motmCount, appearances: s.appearances, goalsConceded: s.goalsConceded }); });
      const sArr = [...aggS.entries()];

      const sg = topOf([...sArr], 'goals'); if (sg?.[1].goals > 0) { const p = getP(sg[0]); if (p) push({ label: `${label} Top Scorer`, headline: 'SEASON GOALS', highlight: String(sg[1].goals), suffix: `goals in ${label}`, player: p, accentColor: '#ef4444', bgGradient: 'from-red-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
      const sw = topOf([...sArr], 'wins'); if (sw?.[1].wins > 0) { const p = getP(sw[0]); if (p) push({ label: `${label} Win Leader`, headline: 'SEASON WINS', highlight: String(sw[1].wins), suffix: `wins in ${label}`, player: p, accentColor: '#22c55e', bgGradient: 'from-green-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
      const sm = topOf([...sArr], 'motmCount'); if (sm?.[1].motmCount > 0) { const p = getP(sm[0]); if (p) push({ label: `${label} MOTM Leader`, headline: 'SEASON MOTM', highlight: String(sm[1].motmCount), suffix: `MOTM awards in ${label}`, player: p, accentColor: '#f59e0b', bgGradient: 'from-amber-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
      const sc = topOf([...sArr], 'cleansheets'); if (sc?.[1].cleansheets > 0) { const p = getP(sc[0]); if (p) push({ label: `${label} Clean Sheet Leader`, headline: 'SEASON CS', highlight: String(sc[1].cleansheets), suffix: `clean sheets in ${label}`, player: p, accentColor: '#3b82f6', bgGradient: 'from-blue-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
      const calcPts = (s: AggStat) => s.wins * 10 + s.draws * 5 - s.losses * 3 + s.goals - s.goalsConceded + s.motmCount * 4 + s.hattricks;
      const sp = [...sArr].map(([id, s]) => ({ id, pts: calcPts(s) })).sort((a, b) => b.pts - a.pts)[0];
      if (sp?.pts > 0) { const p = getP(sp.id); if (p) push({ label: `${label} Points Leader`, headline: 'SEASON RANK', highlight: String(sp.pts), suffix: `points in ${label}`, player: p, accentColor: '#8b5cf6', bgGradient: 'from-violet-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
    });

    // ─────────────────────────────────────
    // 3. EVERY MONTH that has data
    // ─────────────────────────────────────
    const monthKeys = [...new Set(playerMonthlyStats.map(s => `${s.year}-${s.monthIndex}`))];
    monthKeys.forEach(key => {
      const [yr, mi] = key.split('-').map(Number);
      const mLabel = `${MONTH_NAMES[mi]} ${yr}`;
      const rows = playerMonthlyStats.filter(s => s.year === yr && s.monthIndex === mi);

      type MS = typeof rows[0];
      const top = <K extends keyof MS>(key: K) => [...rows].sort((a, b) => (Number(b[key]) || 0) - (Number(a[key]) || 0))[0];
      const calcPts = (s: MS) => s.wins * 10 + s.draws * 5 - s.losses * 3 + s.goals - s.goalsConceded + s.motmCount * 4 + s.hattricks;

      const mg = top('goals'); if (mg?.goals > 0) { const p = getP(mg.playerId); if (p) push({ label: `${mLabel} Top Scorer`, headline: 'MONTHLY GOALS', highlight: String(mg.goals), suffix: `goals in ${mLabel}`, player: p, accentColor: '#ef4444', bgGradient: 'from-red-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
      const mw = top('wins'); if (mw?.wins > 0) { const p = getP(mw.playerId); if (p) push({ label: `${mLabel} Win Leader`, headline: 'MONTHLY WINS', highlight: String(mw.wins), suffix: `wins in ${mLabel}`, player: p, accentColor: '#22c55e', bgGradient: 'from-green-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
      const mm = top('motmCount'); if (mm?.motmCount > 0) { const p = getP(mm.playerId); if (p) push({ label: `${mLabel} MOTM Leader`, headline: 'MONTHLY MOTM', highlight: String(mm.motmCount), suffix: `MOTM awards in ${mLabel}`, player: p, accentColor: '#f59e0b', bgGradient: 'from-amber-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
      const mc = top('cleansheets'); if (mc?.cleansheets > 0) { const p = getP(mc.playerId); if (p) push({ label: `${mLabel} Clean Sheet King`, headline: 'MONTHLY CS', highlight: String(mc.cleansheets), suffix: `clean sheets in ${mLabel}`, player: p, accentColor: '#3b82f6', bgGradient: 'from-blue-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
      const mh = top('hattricks'); if (mh?.hattricks > 0) { const p = getP(mh.playerId); if (p) push({ label: `${mLabel} Hat-Trick Hero`, headline: 'MONTHLY HT', highlight: String(mh.hattricks), suffix: `hat-tricks in ${mLabel}`, player: p, accentColor: '#a855f7', bgGradient: 'from-purple-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
      const mp = [...rows].map(s => ({ ...s, pts: calcPts(s) })).sort((a, b) => b.pts - a.pts)[0];
      if (mp?.pts > 0) { const p = getP(mp.playerId); if (p) push({ label: `${mLabel} Points Leader`, headline: 'MONTHLY RANK', highlight: String(mp.pts), suffix: `points in ${mLabel}`, player: p, accentColor: '#8b5cf6', bgGradient: 'from-violet-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
      const ma = top('appearances'); if (ma?.appearances > 0) { const p = getP(ma.playerId); if (p) push({ label: `${mLabel} Most Active`, headline: 'MONTHLY APPS', highlight: String(ma.appearances), suffix: `matches played in ${mLabel}`, player: p, accentColor: '#06b6d4', bgGradient: 'from-cyan-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
    });

    // ─────────────────────────────────────
    // 4. EVERY WEEK that has data
    // ─────────────────────────────────────
    const weekKeys = [...new Set(playerWeeklyStats.map(s => `${s.year}-${s.monthIndex}-${s.week}`))];
    weekKeys.forEach(key => {
      const [yr, mi, wk] = key.split('-').map(Number);
      const wLabel = `Week ${wk} · ${MONTH_NAMES[mi]} ${yr}`;
      const rows = playerWeeklyStats.filter(s => s.year === yr && s.monthIndex === mi && s.week === wk);

      type WS = typeof rows[0];
      const top = <K extends keyof WS>(key: K) => [...rows].sort((a, b) => (Number(b[key]) || 0) - (Number(a[key]) || 0))[0];
      const calcPts = (s: WS) => s.wins * 10 + s.draws * 5 - s.losses * 3 + s.goals - s.goalsConceded + s.motmCount * 4 + s.hattricks;

      const wg = top('goals'); if (wg?.goals > 0) { const p = getP(wg.playerId); if (p) push({ label: `${wLabel} Top Scorer`, headline: 'WEEKLY GOALS', highlight: String(wg.goals), suffix: `goals in ${wLabel}`, player: p, accentColor: '#ef4444', bgGradient: 'from-red-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
      const ww = top('wins'); if (ww?.wins > 0) { const p = getP(ww.playerId); if (p) push({ label: `${wLabel} Win Leader`, headline: 'WEEKLY WINS', highlight: String(ww.wins), suffix: `wins in ${wLabel}`, player: p, accentColor: '#22c55e', bgGradient: 'from-green-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
      const wm = top('motmCount'); if (wm?.motmCount > 0) { const p = getP(wm.playerId); if (p) push({ label: `${wLabel} MOTM`, headline: 'WEEKLY MOTM', highlight: String(wm.motmCount), suffix: `MOTM awards in ${wLabel}`, player: p, accentColor: '#f59e0b', bgGradient: 'from-amber-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
      const wc = top('cleansheets'); if (wc?.cleansheets > 0) { const p = getP(wc.playerId); if (p) push({ label: `${wLabel} Clean Sheet`, headline: 'WEEKLY CS', highlight: String(wc.cleansheets), suffix: `clean sheets in ${wLabel}`, player: p, accentColor: '#3b82f6', bgGradient: 'from-blue-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
      const wp = [...rows].map(s => ({ ...s, pts: calcPts(s) })).sort((a, b) => b.pts - a.pts)[0];
      if (wp?.pts > 0) { const p = getP(wp.playerId); if (p) push({ label: `${wLabel} Points Leader`, headline: 'WEEKLY RANK', highlight: String(wp.pts), suffix: `points in ${wLabel}`, player: p, accentColor: '#8b5cf6', bgGradient: 'from-violet-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
    });

    // ─────────────────────────────────────
    // 5. INDIVIDUAL MATCH ENTRIES
    // ─────────────────────────────────────
    // Every entry with 3+ goals gets its own fact
    matchEntries
      .filter(e => (e.goals ?? 0) >= 3)
      .forEach(e => {
        const p = getP(e.playerId);
        if (!p) return;
        const dateStr = e.date ? ` (${e.date})` : '';
        if ((e.goals ?? 0) >= 5) push({ label: '🔥 Legendary Performance', headline: 'IN ONE MATCH', highlight: String(e.goals), suffix: `goals by ${p.name}${dateStr}`, player: p, accentColor: '#f59e0b', bgGradient: 'from-amber-950/80 via-[#0d0d0d] to-[#0d0d0d]' });
        else if ((e.goals ?? 0) >= 4) push({ label: '⚡ Unstoppable Game', headline: 'IN ONE MATCH', highlight: String(e.goals), suffix: `goals by ${p.name}${dateStr}`, player: p, accentColor: '#f97316', bgGradient: 'from-orange-950/80 via-[#0d0d0d] to-[#0d0d0d]' });
        else push({ label: '🎩 Hat-Trick Alert', headline: 'HAT-TRICK', highlight: String(e.goals), suffix: `goals by ${p.name}${dateStr}`, player: p, accentColor: '#a855f7', bgGradient: 'from-purple-950/80 via-[#0d0d0d] to-[#0d0d0d]' });
      });

    // Win streak per player
    const entriesByPlayer = new Map<string, MatchEntry[]>();
    matchEntries.forEach(e => { if (!entriesByPlayer.has(e.playerId)) entriesByPlayer.set(e.playerId, []); entriesByPlayer.get(e.playerId)!.push(e); });
    let bestStreak = 0, bestStreakPid = '';
    entriesByPlayer.forEach((entries, pid) => {
      const sorted = [...entries].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
      let streak = 0, max = 0;
      sorted.forEach(e => { if (e.result === 'win') { streak++; max = Math.max(max, streak); } else streak = 0; });
      if (max > bestStreak) { bestStreak = max; bestStreakPid = pid; }
    });
    if (bestStreak >= 3) { const p = getP(bestStreakPid); if (p) push({ label: 'Longest Win Streak Ever', headline: 'WIN STREAK', highlight: String(bestStreak), suffix: 'wins in a row', player: p, accentColor: '#22c55e', bgGradient: 'from-green-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    // Most opponents faced (match entry notes)
    const opMap = new Map<string, Set<string>>();
    matchEntries.forEach(e => { if (!e.notes || !e.playerId) return; if (!opMap.has(e.playerId)) opMap.set(e.playerId, new Set()); opMap.get(e.playerId)!.add(e.notes.split('(')[0].trim()); });
    const topOp = [...opMap.entries()].sort((a, b) => b[1].size - a[1].size)[0];
    if (topOp?.[1].size > 2) { const p = getP(topOp[0]); if (p) push({ label: 'Most Battle-Hardened', headline: 'OPPONENTS FACED', highlight: String(topOp[1].size), suffix: 'different opponents', player: p, accentColor: '#8b5cf6', bgGradient: 'from-violet-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

    // ─────────────────────────────────────
    // 6. CLUB MATCH RECORDS
    // ─────────────────────────────────────
    const done = matches.filter(m => m.status === 'finished' && m.homeScore !== null && m.awayScore !== null);
    const bigW = [...done].map(m => ({ m, d: (m.homeScore ?? 0) - (m.awayScore ?? 0) })).sort((a, b) => b.d - a.d)[0];
    if (bigW?.d > 0) push({ label: "Club's Biggest Victory", headline: 'WIN BY', highlight: `+${bigW.d}`, suffix: `vs ${bigW.m.awayTeam} (${bigW.m.homeScore}–${bigW.m.awayScore})`, accentColor: '#22c55e', bgGradient: 'from-green-950/80 via-[#0d0d0d] to-[#0d0d0d]' });
    const hiS = [...done].map(m => ({ m, t: (m.homeScore ?? 0) + (m.awayScore ?? 0) })).sort((a, b) => b.t - a.t)[0];
    if (hiS?.t >= 6) push({ label: 'Most Goals in One Match', headline: 'EPIC GAME', highlight: String(hiS.t), suffix: `goals! ${hiS.m.homeTeam} ${hiS.m.homeScore}–${hiS.m.awayScore} ${hiS.m.awayTeam}`, accentColor: '#f97316', bgGradient: 'from-orange-950/80 via-[#0d0d0d] to-[#0d0d0d]' });
    if (done.length > 0) push({ label: 'Club Journey So Far', headline: 'TOTAL MATCHES', highlight: String(done.length), suffix: 'competitive matches played', accentColor: '#06b6d4', bgGradient: 'from-cyan-950/80 via-[#0d0d0d] to-[#0d0d0d]' });
    const clubGoals = done.reduce((s, m) => s + (m.homeScore ?? 0), 0);
    if (clubGoals > 0) push({ label: 'Total Club Goals', headline: 'GOALS SCORED', highlight: String(clubGoals), suffix: 'goals scored as a club', accentColor: '#ef4444', bgGradient: 'from-red-950/80 via-[#0d0d0d] to-[#0d0d0d]' });

    // ─────────────────────────────────────
    // 7. NEWS
    // ─────────────────────────────────────
    const latestN = [...news].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).slice(0, 3);
    latestN.forEach(n => {
      if (n.title) push({ label: n.hot ? '🔥 Trending News' : '📰 Latest News', headline: n.category?.toUpperCase() ?? 'NEWS', highlight: '🗞️', suffix: n.title, accentColor: n.hot ? '#f97316' : '#8b5cf6', bgGradient: n.hot ? 'from-orange-950/80 via-[#0d0d0d] to-[#0d0d0d]' : 'from-violet-950/80 via-[#0d0d0d] to-[#0d0d0d]' });
    });

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
        <div className="flex-1 flex flex-col justify-center gap-2 p-8">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3.5 h-3.5" style={{ color: fact.accentColor }} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: fact.accentColor }}>{fact.label}</span>
          </div>

          {/* Player avatar — circular */}
          {fact.player && (
            <div className="flex items-center gap-3 mb-1">
              <div
                className="flex-shrink-0 rounded-full overflow-hidden"
                style={{ width: 48, height: 48, border: `2px solid ${fact.accentColor}66`, boxShadow: `0 0 14px ${fact.accentColor}44` }}
              >
                {fact.player.profileImageUrl
                  ? <img src={fact.player.profileImageUrl} alt={fact.player.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg" style={{ background: fact.accentColor + '33' }}>{fact.player.name[0]}</div>
                }
              </div>
              <span className="text-sm font-bold text-white/70">{fact.player.name}</span>
            </div>
          )}

          {/* Big bold stat */}
          <div className="leading-none font-black text-white" style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)', textShadow: `0 0 40px ${fact.accentColor}55` }}>
            {fact.highlight}
          </div>

          {/* Headline */}
          <div className="font-black text-white/80 uppercase tracking-widest" style={{ fontSize: 'clamp(0.85rem, 1.8vw, 1.2rem)' }}>
            {fact.headline}
          </div>

          <p className="text-sm text-white/40 font-medium mt-1 line-clamp-2">{fact.suffix}</p>

          {/* Prev/Next + counter only */}
          <div className="flex items-center gap-3 mt-4">
            <button onClick={() => go(-1)} className="text-white/30 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-[11px] font-bold text-white/25 tabular-nums">{triviaIndex + 1} / {trivias.length}</span>
            <button onClick={() => go(1)} className="text-white/30 hover:text-white transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
