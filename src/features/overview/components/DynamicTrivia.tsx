import { useMemo, useState, useEffect, useCallback } from 'react';
import { Player, PlayerSeasonStat } from '@/features/players/types';
import { Match } from '@/features/matches/types';
import { NewsArticle } from '@/features/news/types';
import { PlayerMonthlyStat, PlayerWeeklyStat } from '@/store/footballStore';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';

interface DynamicTriviaProps {
  players: Player[];
  playerSeasonStats: PlayerSeasonStat[];
  playerMonthlyStats: PlayerMonthlyStat[];
  playerWeeklyStats: PlayerWeeklyStat[];
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

export function DynamicTrivia({ players, playerSeasonStats, playerMonthlyStats, playerWeeklyStats, matches, news }: DynamicTriviaProps) {
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
    // 2. BEST-EVER MONTH RECORDS
    // ─────────────────────────────────────
    const monthRecords = playerMonthlyStats.filter(s => s.appearances > 0);
    if (monthRecords.length > 0) {
      const topMonthGoals = monthRecords.sort((a, b) => b.goals - a.goals)[0];
      if (topMonthGoals?.goals > 0) { const p = getP(topMonthGoals.playerId); if (p) push({ label: 'Best Goalscoring Month', headline: 'RECORD MONTH', highlight: String(topMonthGoals.goals), suffix: `goals in ${MONTH_NAMES[topMonthGoals.monthIndex]} ${topMonthGoals.year}`, player: p, accentColor: '#ef4444', bgGradient: 'from-red-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

      const topMonthWins = monthRecords.sort((a, b) => b.wins - a.wins)[0];
      if (topMonthWins?.wins > 0) { const p = getP(topMonthWins.playerId); if (p) push({ label: 'Most Wins in a Month', headline: 'WIN RECORD', highlight: String(topMonthWins.wins), suffix: `wins in ${MONTH_NAMES[topMonthWins.monthIndex]} ${topMonthWins.year}`, player: p, accentColor: '#22c55e', bgGradient: 'from-green-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

      const topMonthCS = monthRecords.sort((a, b) => b.cleansheets - a.cleansheets)[0];
      if (topMonthCS?.cleansheets > 0) { const p = getP(topMonthCS.playerId); if (p) push({ label: 'Best Defensive Month', headline: 'CLEAN SHEETS', highlight: String(topMonthCS.cleansheets), suffix: `clean sheets in ${MONTH_NAMES[topMonthCS.monthIndex]} ${topMonthCS.year}`, player: p, accentColor: '#3b82f6', bgGradient: 'from-blue-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }

      const topMonthMotm = monthRecords.sort((a, b) => b.motmCount - a.motmCount)[0];
      if (topMonthMotm?.motmCount > 0) { const p = getP(topMonthMotm.playerId); if (p) push({ label: 'Most MOTMs in a Month', headline: 'MONTHLY MOTM', highlight: String(topMonthMotm.motmCount), suffix: `MOTMs in ${MONTH_NAMES[topMonthMotm.monthIndex]} ${topMonthMotm.year}`, player: p, accentColor: '#f59e0b', bgGradient: 'from-amber-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
    }

    // ─────────────────────────────────────
    // 3. BEST-EVER WEEK RECORDS
    // ─────────────────────────────────────
    const weekRecords = playerWeeklyStats.filter(s => s.appearances > 0);
    if (weekRecords.length > 0) {
      const topWeekGoals = weekRecords.sort((a, b) => b.goals - a.goals)[0];
      if (topWeekGoals?.goals > 0) { const p = getP(topWeekGoals.playerId); if (p) push({ label: 'Best Scoring Week', headline: 'WEEKLY RECORD', highlight: String(topWeekGoals.goals), suffix: `goals in Week ${topWeekGoals.week} (${MONTH_NAMES[topWeekGoals.monthIndex]} ${topWeekGoals.year})`, player: p, accentColor: '#ef4444', bgGradient: 'from-red-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
      
      const topWeekWins = weekRecords.sort((a, b) => b.wins - a.wins)[0];
      if (topWeekWins?.wins > 0) { const p = getP(topWeekWins.playerId); if (p) push({ label: 'Most Wins in a Week', headline: 'WEEKLY RECORD', highlight: String(topWeekWins.wins), suffix: `wins in Week ${topWeekWins.week} (${MONTH_NAMES[topWeekWins.monthIndex]} ${topWeekWins.year})`, player: p, accentColor: '#22c55e', bgGradient: 'from-green-950/80 via-[#0d0d0d] to-[#0d0d0d]' }); }
    }

    // ─────────────────────────────────────
    // 5. CLUB MATCH RECORDS
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
  }, [players, playerSeasonStats, playerMonthlyStats, playerWeeklyStats, matches, news, agg]);

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
      className={`relative w-full overflow-hidden rounded-2xl bg-gradient-to-br ${fact.bgGradient} transition-all duration-500 shadow-xl`}
      style={{ minHeight: '180px', border: `1px solid ${fact.accentColor}33` }}
    >
      {/* Background FX */}
      <div className="absolute inset-0 pointer-events-none opacity-50" style={{ background: `radial-gradient(circle at 100% 0%, ${fact.accentColor}44 0%, transparent 50%)` }} />
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none translate-x-1/4 -translate-y-1/4">
        <Zap className="w-48 h-48" style={{ color: fact.accentColor }} />
      </div>

      <div className={`relative z-10 flex flex-col sm:flex-row items-stretch h-full transition-opacity duration-300 ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {/* Left/Top Player Avatar (eFootball Card Style Sidebar) */}
        {fact.player && (
          <div className="relative w-full sm:w-48 flex-shrink-0 bg-black/50 sm:border-r border-white/10 flex items-center justify-center p-6 group backdrop-blur-sm">
            {/* Backdrop glow */}
            <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at center, ${fact.accentColor} 0%, transparent 70%)` }} />
            
            <div className="relative z-10 flex flex-col items-center gap-3 text-center">
              <div 
                className="w-[68px] h-[68px] rounded-2xl overflow-hidden border-2 shadow-lg transition-transform duration-500 group-hover:scale-105"
                style={{ borderColor: `${fact.accentColor}88` }}
              >
                {fact.player.profileImageUrl 
                  ? <img src={fact.player.profileImageUrl} alt={fact.player.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-white font-black text-2xl" style={{ background: fact.accentColor + '44' }}>{fact.player.name[0]}</div>
                }
              </div>
              <span className="font-heading font-black text-white/90 text-[14px] leading-tight drop-shadow-md">
                {fact.player.name}
              </span>
            </div>
          </div>
        )}

        {/* Right/Bottom Content */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
          
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-full" style={{ backgroundColor: `${fact.accentColor}22` }}>
              <Zap className="w-4 h-4" style={{ color: fact.accentColor }} />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: fact.accentColor }}>{fact.label}</span>
          </div>

          <div className="flex items-end gap-4 mb-2 flex-wrap">
            <div className="font-black text-white leading-none tracking-tighter" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', textShadow: `0 4px 20px ${fact.accentColor}44` }}>
              {fact.highlight}
            </div>
            <div className="pb-2">
              <div className="font-black text-white/90 uppercase tracking-wider text-xl leading-none mb-1">
                {fact.headline}
              </div>
              <p className="text-sm text-white/60 font-medium leading-snug max-w-[280px]">
                {fact.suffix}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-1">
              <button onClick={() => go(-1)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/5">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => go(1)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/5">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs font-semibold text-white/30 tabular-nums bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              {triviaIndex + 1} of {trivias.length}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
