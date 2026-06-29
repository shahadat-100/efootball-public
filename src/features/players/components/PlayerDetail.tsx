import { useRef, useState, useEffect } from 'react';
import { Avatar, Badge, Button, PieChart } from '@/shared/components';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { useFootballStore } from '@/store/footballStore';
import { RESULT_BADGE } from '@/shared/lib/constants';
import { PlayerRadarChart } from './PlayerRadarChart';
import { SeasonPerformanceChart } from './SeasonPerformanceChart';
import { RankTrendCard } from './RankTrendCard';
import { SeasonTable } from './SeasonTable';
import { AchievementBadges } from './AchievementBadges';
import { PlayerSnapshot } from './detail-tabs/PlayerSnapshot';
import { PlayerTimeline } from './detail-tabs/PlayerTimeline';
import { PlayerOverviewDashboard } from './detail-tabs/PlayerOverviewDashboard';
import { cn } from '@/shared/lib/cn';
import { toPng } from 'html-to-image';
import { Download, User, Activity, BarChart2, Award } from 'lucide-react';
interface PlayerDetailProps {
  playerId: string;
  onBack: () => void;
}
export function PlayerDetail({ playerId, onBack }: PlayerDetailProps) {
  const { players, matchEntries, playerSeasonStats, seasons, fetchPlayerMatchEntries } = useFootballStore();
  
  useEffect(() => {
    fetchPlayerMatchEntries(playerId);
  }, [playerId, fetchPlayerMatchEntries]);

  const player = players.find(p => p.id === playerId);
  const stats = usePlayerStats(playerId);

  const captureRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const ITEMS_PER_PAGE = 30;
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'statistics' | 'achievements'>('overview');

  const handleExport = async () => {
    if (!captureRef.current || !player) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `player_card_${player.name.replace(/\s+/g, '_')}.png`;
      a.click();
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };


  if (!player) {
    onBack();
    return null;
  }

  const entries = matchEntries.filter(me => me.playerId === playerId);

  const allSortedEntries = [...entries]
    .sort((a, b) => {
      const dateTimeA = a.time ? `${a.date}T${a.time}` : (a.date ? `${a.date}T00:00:00` : '');
      const dateTimeB = b.time ? `${b.date}T${b.time}` : (b.date ? `${b.date}T00:00:00` : '');
      const dateA = new Date(dateTimeA).getTime();
      const dateB = new Date(dateTimeB).getTime();
      const validA = isNaN(dateA) ? 0 : dateA;
      const validB = isNaN(dateB) ? 0 : dateB;
      if (validA !== validB) return validB - validA;
      return String(b.id).localeCompare(String(a.id));
    });

  const totalPages = Math.max(1, Math.ceil(allSortedEntries.length / ITEMS_PER_PAGE));
  const historyEntries = allSortedEntries.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE);


  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentWeekEntries = entries.filter(e => e.date && new Date(e.date) >= oneWeekAgo);
  const weekChartData = [
    { label: 'Wins', value: recentWeekEntries.filter(e => e.result === 'win').length, color: '#10b981' },
    { label: 'Draws', value: recentWeekEntries.filter(e => e.result === 'draw').length, color: '#f59e0b' },
    { label: 'Losses', value: recentWeekEntries.filter(e => e.result === 'loss').length, color: '#ef4444' }
  ];

  const currentDay = new Date().getDate();
  const currentMonthIndex = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getFormStatus = () => {
    const recentN = historyEntries.slice(0, 10);
    if (recentN.length === 0) {
      return { text: 'STABLE / N/A', color: '#9ca3af', icon: '➖' };
    }
    
    let wins = 0;
    
    recentN.forEach(e => {
      if (e.result?.toLowerCase() === 'win') wins++;
    });

    const winRate = wins / recentN.length;

    if (winRate > 0.6) {
      return { text: 'IN FORM', color: '#10b981', icon: '📈' };
    } 
    else if (winRate < 0.3) {
      return { text: 'OUT OF FORM', color: '#ef4444', icon: '📉' };
    } 
    else {
      return { text: 'STABLE', color: '#f59e0b', icon: '➖' };
    }
  };
  const formStatus = getFormStatus();

  // Find the month of their most recent match to show relevant monthly stats
  let targetMonthIndex = currentMonthIndex;
  let targetYear = currentYear;
  if (historyEntries.length > 0 && historyEntries[0].date) {
    const lastMatchDate = new Date(historyEntries[0].date);
    targetMonthIndex = lastMatchDate.getMonth();
    targetYear = lastMatchDate.getFullYear();
  }

  const monthlyEntries = entries.filter(e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    return d.getMonth() === targetMonthIndex && d.getFullYear() === targetYear;
  });
  const monthChartData = [
    { label: 'Wins', value: monthlyEntries.filter(e => e.result === 'win').length, color: '#10b981' },
    { label: 'Draws', value: monthlyEntries.filter(e => e.result === 'draw').length, color: '#f59e0b' },
    { label: 'Losses', value: monthlyEntries.filter(e => e.result === 'loss').length, color: '#ef4444' }
  ];


  // Points calculation helper (matching PointsLeaderboard)
  const calcSeasonPoints = (s: any) =>
    (s.wins * 10) + (s.draws * 5) - (s.losses * 3) + s.goals - s.goalsConceded + (s.motmCount * 4) + s.hattricks;

  // Compute Leaderboard Rank based on total points
  const playerRanks = players.map(p => {
    const pStats = playerSeasonStats.filter(s => s.playerId === p.id);
    const totalPoints = pStats.reduce((acc, s) => acc + calcSeasonPoints(s), 0);
    return { id: p.id, points: totalPoints };
  }).sort((a, b) => b.points - a.points);

  const rankIndex = playerRanks.findIndex(r => r.id === player.id);
  const currentRank = rankIndex !== -1 ? rankIndex + 1 : undefined;

  // Compute Ranks for all seasons
  const seasonRanksList = seasons.map(s => {
    const pStats = playerSeasonStats.find(ps => ps.playerId === player.id && ps.seasonId === s.id);
    if (!pStats || pStats.appearances === 0) return null;

    const ranksForSeason = players.map(p => {
      const pS = playerSeasonStats.find(ps => ps.playerId === p.id && ps.seasonId === s.id);
      return { id: p.id, points: pS ? calcSeasonPoints(pS) : 0 };
    }).sort((a, b) => b.points - a.points);
    
    const sRankIndex = ranksForSeason.findIndex(r => r.id === player.id);
    return {
      seasonName: s.name,
      rank: sRankIndex !== -1 ? sRankIndex + 1 : undefined,
      isCurrent: s.is_current,
    };
  }).filter(Boolean);

  // Compute Recent Week and Recent Month Ranks

  let activeWeekStart = 1, activeWeekEnd = 7;
  if (currentDay >= 8  && currentDay <= 14) { activeWeekStart = 8;  activeWeekEnd = 14; }
  else if (currentDay >= 15 && currentDay <= 21) { activeWeekStart = 15; activeWeekEnd = 21; }
  else if (currentDay >= 22) { activeWeekStart = 22; activeWeekEnd = 31; }

  const calcEntryPoints = (e: any) => {
    let pts = 0;
    if (e.result === 'win') pts += 10;
    else if (e.result === 'draw') pts += 5;
    else if (e.result === 'loss') pts -= 3;
    pts += (e.goals || 0);
    pts -= (e.goalsConceded || 0);
    pts += (e.motm ? 4 : 0);
    pts += (e.hattricks || 0);
    return pts;
  };

  const weeklyMap = new Map<string, number>();
  const monthlyMap = new Map<string, number>();
  players.forEach(p => { weeklyMap.set(p.id, 0); monthlyMap.set(p.id, 0); });

  matchEntries.forEach(entry => {
    if (!entry.date) return;
    const d = new Date(entry.date);
    const pts = calcEntryPoints(entry);

    // Week
    const isCurrentWeek =
      d.getFullYear() === currentYear &&
      d.getMonth() === currentMonthIndex &&
      d.getDate() >= activeWeekStart &&
      d.getDate() <= activeWeekEnd;
    if (isCurrentWeek && weeklyMap.has(entry.playerId)) {
      weeklyMap.set(entry.playerId, weeklyMap.get(entry.playerId)! + pts);
    }

    // Month
    const isMonthMatch = d.getMonth() === currentMonthIndex && d.getFullYear() === currentYear;
    if (isMonthMatch && monthlyMap.has(entry.playerId)) {
      monthlyMap.set(entry.playerId, monthlyMap.get(entry.playerId)! + pts);
    }
  });

  const getRankFromMap = (map: Map<string, number>, pId: string) => {
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    const idx = sorted.findIndex(([id]) => id === pId);
    return idx !== -1 ? idx + 1 : undefined;
  };

  const recentWeekRank = getRankFromMap(weeklyMap, player.id);
  const recentMonthRank = getRankFromMap(monthlyMap, player.id);

  // Dynamically calculate the maximum league stats to correctly scale the radar chart
  const maxLeagueStats = players.reduce((max, p) => {
    const pStats = playerSeasonStats.filter(s => s.playerId === p.id);
    const goals = pStats.reduce((sum, s) => sum + (s.goals || 0), 0);
    const cleanSheets = pStats.reduce((sum, s) => sum + (s.cleansheets || 0), 0);
    const motm = pStats.reduce((sum, s) => sum + (s.motmCount || 0), 0);
    const wins = pStats.reduce((sum, s) => sum + (s.wins || 0), 0);
    const matches = pStats.reduce((sum, s) => sum + (s.appearances || 0), 0);
    
    return {
      goals: Math.max(max.goals, goals),
      cleanSheets: Math.max(max.cleanSheets, cleanSheets),
      motm: Math.max(max.motm, motm),
      wins: Math.max(max.wins, wins),
      matches: Math.max(max.matches, matches),
    };
  }, { goals: 10, cleanSheets: 5, motm: 2, wins: 10, matches: 20 });

  // Prepare Data for SeasonPerformanceChart & SeasonTable
  // Use authoritative playerSeasonStats values (wins, losses, motm, cleanSheets, etc.)
  // so the Season Table shows correct counts from the DB rather than recomputed estimates.
  const seasonData = stats.seasonBreakdown.map((sb) => {
    const sWins = sb.wins;
    const sDraws = sb.draws;
    const sLosses = sb.losses;
    const winRate = sb.matches > 0 ? (sWins / sb.matches) * 100 : 0;
    const drawRate = sb.matches > 0 ? (sDraws / sb.matches) * 100 : 0;
    const lossRate = sb.matches > 0 ? (sLosses / sb.matches) * 100 : 0;

    return {
      season: sb.seasonName ? `eFootball ${sb.seasonName}` : `eFootball ${sb.year}`,
      matches: sb.matches,
      appearances: sb.matches,
      wins: sWins,
      draws: sDraws,
      losses: sLosses,
      winRate,
      drawRate,
      lossRate,
      goals: sb.goals,
      goalsConceded: sb.goalsConceded,
      cleanSheets: sb.cleanSheets,
      motm: sb.motm,
      hattricks: sb.hattricks,
    };
  }).reverse(); // Order older to newer for chart

  const allTime = {
    season: 'All-time',
    matches: stats.totalMatches,
    wins: stats.totalWins,
    draws: stats.totalDraws,
    losses: stats.totalLosses,
    winRate: stats.totalMatches > 0 ? (stats.totalWins / stats.totalMatches) * 100 : 0,
    drawRate: stats.totalMatches > 0 ? (stats.totalDraws / stats.totalMatches) * 100 : 0,
    lossRate: stats.totalMatches > 0 ? (stats.totalLosses / stats.totalMatches) * 100 : 0,
    goals: stats.totalGoals,
    goalsConceded: stats.totalGoalsConceded,
    cleanSheets: stats.totalCleanSheets,
    motm: stats.totalMOTM,
    hattricks: stats.totalHattricks
  };

  // ── Monthly & Weekly RANK calculation ──────────────────────────────
  type PeriodStats = { wins: number; draws: number; losses: number; goals: number; matches: number; points: number };

  const buildPeriodKey = (dateStr: string, mode: 'month' | 'week') => {
    if (!dateStr || dateStr.length < 10) return '';
    const [year, month, day] = dateStr.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (isNaN(d.getTime())) return '';
    
    const monthKey = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    if (mode === 'month') return monthKey;
    
    const weekNum = Math.ceil(d.getDate() / 7);
    return `W${weekNum} ${monthKey}`;
  };

  // Collect all unique period keys from this player's entries
  const myMonthKeys = new Set<string>();
  const myWeekKeys = new Set<string>();
  entries.forEach(e => {
    if (!e.date) return;
    const mk = buildPeriodKey(e.date, 'month');
    if (mk) myMonthKeys.add(mk);
    const wk = buildPeriodKey(e.date, 'week');
    if (wk) myWeekKeys.add(wk);
  });

  const getRankForPeriod = (periodKey: string, mode: 'month' | 'week'): { rank: number; wins: number; draws: number; losses: number; goals: number; matches: number; totalPlayers: number } => {
    const playerPoints = new Map<string, PeriodStats>();
    matchEntries.forEach(e => {
      if (!e.date) return;
      const pk = buildPeriodKey(e.date, mode);
      if (pk !== periodKey) return;
      if (!playerPoints.has(e.playerId)) {
        playerPoints.set(e.playerId, { wins: 0, draws: 0, losses: 0, goals: 0, matches: 0, points: 0 });
      }
      const ps = playerPoints.get(e.playerId)!;
      ps.matches += 1;
      ps.goals += e.goals || 0;
      if (e.result === 'win') { ps.wins += 1; ps.points += 10; }
      else if (e.result === 'draw') { ps.draws += 1; ps.points += 5; }
      else if (e.result === 'loss') { ps.losses += 1; ps.points -= 3; }
      ps.points += (e.goals || 0);
      ps.points -= (e.goalsConceded || 0);
      if (e.motm) ps.points += 4;
      ps.points += (e.hattricks || 0);
    });

    const sorted = Array.from(playerPoints.entries()).sort((a, b) => b[1].points - a[1].points || b[1].goals - a[1].goals);
    const rankIdx = sorted.findIndex(([id]) => id === playerId);
    const myStats = playerPoints.get(playerId) || { wins: 0, draws: 0, losses: 0, goals: 0, matches: 0, points: 0 };
    return {
      rank: rankIdx !== -1 ? rankIdx + 1 : sorted.length + 1,
      ...myStats,
      totalPlayers: sorted.length
    };
  };

  const monthlyRankData = Array.from(myMonthKeys)
    .map(key => ({ label: key, ...getRankForPeriod(key, 'month') }))
    .sort((a, b) => {
      // Sort by most recent month first, fallback to rank
      const dateA = new Date(`1 ${a.label}`);
      const dateB = new Date(`1 ${b.label}`);
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return dateB.getTime() - dateA.getTime();
      }
      return a.rank - b.rank;
    });

  const renderTrophyCabinet = () => {
    const trophies = [];
    const seasonRankBadges = {
      1: { icon: '🏆', label: 'Champion', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
      2: { icon: '🥈', label: 'Runner-Up', color: 'text-gray-300', bg: 'bg-gray-400/10', border: 'border-gray-400/30' },
      3: { icon: '🥉', label: 'Bronze Star', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
      4: { icon: '⭐', label: 'Elite Four', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
      5: { icon: '🎖️', label: 'Top Five', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    } as const;

    seasonRanksList.forEach(s => {
      if (!s?.rank || s.rank < 1 || s.rank > 5) return;
      if (s.isCurrent) return;

      const badge = seasonRankBadges[s.rank as keyof typeof seasonRankBadges];
      trophies.push({
        icon: badge.icon,
        title: `eFootball ${s?.seasonName} ${badge.label}`,
        color: badge.color,
        bg: badge.bg,
        border: badge.border,
      });
    });

    if (stats.totalMOTM >= 20) {
      trophies.push({ icon: '👑', title: `Star Player (${stats.totalMOTM} MOTM)`, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' });
    }

    if (stats.totalCleanSheets >= 50) {
      trophies.push({ icon: '🧤', title: `Golden Glove (${stats.totalCleanSheets} CS)`, color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/30' });
    }

    if (stats.totalHattricks >= 50) {
      trophies.push({ icon: '⚽', title: `Hat-trick Hero (${stats.totalHattricks})`, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' });
    }

    if (trophies.length === 0) return null;

    return (
      <div className="w-full">
        <h4 className="text-[10px] uppercase tracking-widest text-white/50 font-black mb-3">Trophy Cabinet</h4>
        <div className="flex gap-2.5 flex-wrap">
          {trophies.map((t, i) => (
            <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${t.border} ${t.bg} shadow-sm hover:scale-105 transition-transform`}>
              <span className="text-[16px] drop-shadow-md">{t.icon}</span>
              <span className={`text-[11px] font-bold ${t.color}`}>{t.title}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderNextMilestone = () => {
    const milestones = [
      { name: 'Goals', current: stats.totalGoals, steps: [10, 50, 100, 150, 200, 250, 300, 400, 500, 1000] },
      { name: 'Matches', current: stats.totalMatches, steps: [10, 50, 100, 150, 200, 250, 300, 400, 500, 1000] },
      { name: 'Wins', current: stats.totalWins, steps: [10, 50, 100, 150, 200, 250, 300, 400, 500] },
    ];

    let closestMilestone: any = null;
    let highestPercentage = 0;

    milestones.forEach(m => {
      const nextStep = m.steps.find(s => s > m.current);
      if (nextStep) {
        const prevStep = m.steps.slice().reverse().find(s => s <= m.current) || 0;
        const progress = (m.current - prevStep) / (nextStep - prevStep);
        
        if (progress > highestPercentage) {
          highestPercentage = progress;
          closestMilestone = {
            title: `${nextStep} Career ${m.name}`,
            current: m.current,
            target: nextStep,
            percent: Math.round(progress * 100),
            remaining: nextStep - m.current
          };
        }
      }
    });

    if (!closestMilestone || closestMilestone.percent === 0) return null;

    return (
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-6">
        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-black mb-3 flex items-center gap-2">
          <span>🎯 Next Milestone</span>
          <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[9px]">{closestMilestone.percent}%</span>
        </h4>
        <div className="bg-muted/30 border border-border/50 rounded-xl p-4 transition-all hover:bg-muted/50">
          <div className="flex justify-between items-end mb-2.5">
            <div>
              <p className="text-[14px] font-bold text-foreground leading-tight">{closestMilestone.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Just <strong className="text-primary font-black">{closestMilestone.remaining} more</strong> to go!</p>
            </div>
            <span className="text-[12px] font-black text-primary bg-primary/10 px-2 py-1 rounded-lg border border-primary/20">{closestMilestone.current} / {closestMilestone.target}</span>
          </div>
          <div className="h-2.5 bg-border rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-1000 relative" 
              style={{ width: `${closestMilestone.percent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Back navigation & Actions */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={onBack}>← Back</Button>
          <span className="text-muted-foreground text-[12px]">Players /</span>
          <span className="text-[12px] font-semibold">{player.name}</span>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export Card'}
        </button>
      </div>

      {/* ═══════════════════════════════════════════
          HERO ZONE — Player Header
          ═══════════════════════════════════════════ */}
      <div ref={captureRef} className="relative rounded-2xl p-6 md:p-8 lg:p-12 min-h-[380px] md:min-h-[450px] lg:min-h-[550px] flex flex-col justify-center mb-6 shadow-xl overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #111827, #1f2937, #111827)' }}>
        {player.coverImageUrl && (
          <img src={player.coverImageUrl} alt={`${player.name} cover`} className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-overlay pointer-events-none" />
        )}
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')]" />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none" style={{ background: 'rgba(99,102,241,0.15)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-[60px] pointer-events-none" style={{ background: 'rgba(59,130,246,0.12)' }} />
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start">
          {/* Left side: Avatar + Info */}
          <div className="flex gap-6 items-center flex-wrap flex-1">
            <div className="relative">
              <Avatar name={player.name} size={110} src={player.profileImageUrl} className="ring-4 ring-white/10 ring-offset-4 ring-offset-gray-900 shadow-2xl" />
              {currentRank && currentRank <= 3 && (
                <div className={cn(
                  "absolute -bottom-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-lg",
                  currentRank === 1 ? "medal-gold" : currentRank === 2 ? "medal-silver" : "medal-bronze"
                )}>
                  #{currentRank}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="font-heading font-bold text-[32px] md:text-[38px] text-white tracking-wide leading-none mb-1">{player.name}</h2>
              <p className="text-white/40 text-[14px] font-bold mb-3">👕 {player.jerseyNumber || '—'}</p>
              
              <div className="flex gap-1.5 flex-wrap mb-4">
                {(player.playerRoles ?? []).map(t => (
                  <Badge key={t} bg="rgba(255,255,255,0.1)" c="#e5e5e5" className="border border-white/10">{t}</Badge>
                ))}
                {(player.customTags ?? []).map(t => (
                  <Badge key={t} bg="rgba(255,255,255,0.06)" c="#9ca3af" className="border border-white/10">{t}</Badge>
                ))}
                {(player.customStringTags ?? []).map(t => (
                  <Badge key={`str-${t}`} bg="rgba(59,130,246,0.15)" c="#93c5fd" className="border border-blue-500/20">{t}</Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Right side: Radar Chart */}
          <div className="w-full lg:w-auto lg:min-w-[250px] flex justify-center">
            <PlayerRadarChart 
              stats={{
                goals: stats.totalGoals,
                cleanSheets: stats.totalCleanSheets,
                motm: stats.totalMOTM,
                wins: stats.totalWins,
                matches: stats.totalMatches
              }} 
              maxStats={maxLeagueStats}
            />
          </div>
        </div>

        {/* HERO ZONE EXPANSION: Quick Stats & Trophies */}
        <div className="relative z-10 mt-8 pt-8 border-t border-white/10 w-full flex flex-col gap-6">
          <div className="flex flex-wrap gap-8 items-start justify-between">
            {/* Quick Stats Group */}
            <div className="flex flex-wrap gap-8 flex-1">
              {/* Recent Form */}
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-white/50 font-black mb-2">Recent Form (Last 10)</h4>
                <div className="flex gap-1.5 flex-wrap">
                  {(() => {
                    const recent10 = historyEntries.slice(0, 10).reverse();
                    if (recent10.length === 0) return <span className="text-[11px] text-white/30">No matches yet</span>;
                    return recent10.map((entry, i) => {
                      const result = entry.result?.toLowerCase() || 'draw';
                      const isWin = result === 'win';
                      const isDraw = result === 'draw';
                      return (
                        <div
                          key={entry.id || i}
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-[11px] shadow-md cursor-default"
                          style={isWin
                            ? { background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
                            : isDraw
                            ? { background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }
                            : { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }
                          }
                          title={`${entry.date}: ${entry.goals ?? 0} goals • ${result.toUpperCase()}`}
                        >
                          {result.charAt(0).toUpperCase()}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Form Status */}
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-white/50 font-black mb-2">Form Trend</h4>
                <span 
                  className="font-black text-[13px] px-3 py-1 rounded-lg shadow-md border flex items-center gap-1.5 w-max" 
                  style={{ backgroundColor: `${formStatus.color}20`, color: formStatus.color, borderColor: `${formStatus.color}40` }}
                >
                  <span>{formStatus.icon}</span>
                  {formStatus.text}
                </span>
              </div>

              {/* Ranks */}
              {[
                { label: 'Overall Rank', value: currentRank, color: '#fbbf24', bgColor: 'rgba(251,191,36,0.15)' },
                { label: 'Month Rank', value: recentMonthRank, color: '#34d399', bgColor: 'rgba(52,211,153,0.15)' },
                { label: 'Week Rank', value: recentWeekRank, color: '#a78bfa', bgColor: 'rgba(167,139,250,0.15)' },
              ].map(r => (
                <div key={r.label}>
                  <h4 className="text-[10px] uppercase tracking-widest text-white/50 font-black mb-2">{r.label}</h4>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[14px] px-3 py-1 rounded-lg border shadow-sm backdrop-blur-sm" style={{ backgroundColor: r.bgColor, color: r.color, borderColor: r.bgColor.replace('0.15', '0.3') }}>
                      #{r.value || '-'}
                    </span>
                  </div>
                </div>
              ))}

              {/* Season Ranks */}
              {seasonRanksList.map((sr: any) => (
                <div key={sr?.seasonName}>
                  <h4 className="text-[10px] uppercase tracking-widest text-white/50 font-black mb-2">{sr?.seasonName}</h4>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[14px] px-3 py-1 rounded-lg border shadow-sm backdrop-blur-sm" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', borderColor: 'rgba(59,130,246,0.3)' }}>
                      #{sr.rank || '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Trophies Group */}
            <div className="w-full xl:w-auto xl:max-w-md">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                {renderTrophyCabinet()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Tab Navigation ══ */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'timeline', label: 'Timeline', icon: Activity },
          { id: 'statistics', label: 'Statistics', icon: BarChart2 },
          { id: 'achievements', label: 'Achievements', icon: Award },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ══ Tab Content ══ */}
      {activeTab === 'overview' && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <div className="mb-6">
            <PlayerSnapshot entries={entries} />
          </div>
          {renderNextMilestone()}
          <div className="mt-6">
            <PlayerOverviewDashboard entries={entries} stats={stats} />
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <PlayerTimeline entries={entries} />
      )}

      {activeTab === 'statistics' && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          {/* All-Time Statistics Overview */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="font-heading font-bold text-[18px] tracking-tight">All-Time Statistics</h3>
                {currentRank && <p className="text-[13px] text-muted-foreground mt-0.5">Rank #{currentRank}</p>}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { l: 'M', v: stats.totalMatches },
                  { l: 'W', v: stats.totalWins },
                  { l: 'D', v: stats.totalDraws },
                  { l: 'L', v: stats.totalLosses },
                  { l: 'WIN%', v: `${(stats.totalMatches > 0 ? (stats.totalWins / stats.totalMatches) * 100 : 0).toFixed(1)}%` },
                  { l: 'GF', v: stats.totalGoals },
                  { l: 'GA', v: stats.totalGoalsConceded },
                ].map(s => (
                  <div key={s.l} className="bg-muted/40 rounded-xl px-4 py-2 border border-border/50 text-center flex-1 min-w-[50px]">
                    <p className="text-[10px] font-bold text-muted-foreground mb-0.5">{s.l}</p>
                    <p className="text-[15px] font-black text-foreground">{s.v}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { l: 'CS', v: stats.totalCleanSheets },
                  { l: 'MOTM', v: stats.totalMOTM },
                  { l: 'PTS', v: playerRanks.find(r => r.id === player.id)?.points || 0 },
                ].map(s => (
                  <div key={s.l} className="bg-muted/40 rounded-xl px-4 py-2 border border-border/50 text-center flex-none min-w-[70px]">
                    <p className="text-[10px] font-bold text-muted-foreground mb-0.5">{s.l}</p>
                    <p className="text-[15px] font-black text-foreground">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Latest Season Statistics Overview */}
            {(() => {
              const latestSeasonStats = stats.seasonBreakdown[0];
              if (!latestSeasonStats) return null;
              const sRanks = seasonRanksList.find(sr => sr?.seasonName === latestSeasonStats.seasonName) || { rank: undefined };
              return (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="font-heading font-bold text-[18px] tracking-tight">Season {latestSeasonStats.seasonName || latestSeasonStats.year} Stats</h3>
                    {sRanks.rank && <p className="text-[13px] text-muted-foreground mt-0.5">Rank #{sRanks.rank}</p>}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      { l: 'M', v: latestSeasonStats.matches },
                      { l: 'W', v: latestSeasonStats.wins },
                      { l: 'D', v: latestSeasonStats.draws },
                      { l: 'L', v: latestSeasonStats.losses },
                      { l: 'WIN%', v: `${(latestSeasonStats.matches > 0 ? (latestSeasonStats.wins / latestSeasonStats.matches) * 100 : 0).toFixed(1)}%` },
                      { l: 'GF', v: latestSeasonStats.goals },
                      { l: 'GA', v: latestSeasonStats.goalsConceded },
                    ].map(s => (
                      <div key={s.l} className="bg-muted/40 rounded-xl px-4 py-2 border border-border/50 text-center flex-1 min-w-[50px]">
                        <p className="text-[10px] font-bold text-muted-foreground mb-0.5">{s.l}</p>
                        <p className="text-[15px] font-black text-foreground">{s.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { l: 'CS', v: latestSeasonStats.cleanSheets },
                      { l: 'MOTM', v: latestSeasonStats.motm },
                    ].map(s => (
                      <div key={s.l} className="bg-muted/40 rounded-xl px-4 py-2 border border-border/50 text-center flex-none min-w-[70px]">
                        <p className="text-[10px] font-bold text-muted-foreground mb-0.5">{s.l}</p>
                        <p className="text-[15px] font-black text-foreground">{s.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>


      {/* ═══════════════════════════════════════════
          CAREER STATS — Grouped by category
          ═══════════════════════════════════════════ */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
        <h3 className="font-heading font-bold text-[18px] mb-5 tracking-tight">Career Stats</h3>
        
        {/* Attack */}
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">⚽ Attack</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Goals', value: stats.totalGoals, color: '#10b981', icon: '⚽' },
              { label: 'Hat-tricks', value: stats.totalHattricks, color: '#a855f7', icon: '⚽' },
              { label: 'MOTM', value: stats.totalMOTM, color: '#f59e0b', icon: '👑' },
            ].map(({ label, value, color, icon }) => (
              <div key={label} className="rounded-xl p-3 transition-transform hover:scale-[1.02] shadow-sm" style={{ background: `${color}08`, border: `1.5px solid ${color}20` }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[13px]">{icon}</span>
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{label}</p>
                </div>
                <p className="text-[24px] font-heading font-bold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Defense */}
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-3">🛡️ Defense</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Clean Sheets', value: stats.totalCleanSheets, color: '#38bdf8', icon: '🧤' },
              { label: 'Goals Conceded', value: stats.totalGoalsConceded, color: '#ef4444', icon: '🥅' },
              { label: 'Matches', value: stats.totalMatches, color: '#6366f1', icon: '🎮' },
            ].map(({ label, value, color, icon }) => (
              <div key={label} className="rounded-xl p-3 transition-transform hover:scale-[1.02] shadow-sm" style={{ background: `${color}08`, border: `1.5px solid ${color}20` }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[13px]">{icon}</span>
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{label}</p>
                </div>
                <p className="text-[24px] font-heading font-bold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-3">📊 Results</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Wins', value: stats.totalWins, color: '#22c55e', icon: '🏆' },
              { label: 'Draws', value: stats.totalDraws, color: '#f59e0b', icon: '🤝' },
              { label: 'Losses', value: stats.totalLosses, color: '#f87171', icon: '❌' },
            ].map(({ label, value, color, icon }) => (
              <div key={label} className="rounded-xl p-3 transition-transform hover:scale-[1.02] shadow-sm" style={{ background: `${color}08`, border: `1.5px solid ${color}20` }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[13px]">{icon}</span>
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{label}</p>
                </div>
                <p className="text-[24px] font-heading font-bold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Visualizations Section */}
      <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-1 min-h-[320px]">
                <SeasonPerformanceChart data={seasonData} />
              </div>
              <div className="lg:col-span-1 min-h-[320px] bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3" />
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-heading font-bold text-[18px] tracking-tight text-left">Monthly Performance</h3>
                  <Badge bg="var(--muted)" c="var(--muted-foreground)">{MONTHS[targetMonthIndex]} {targetYear}</Badge>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <PieChart data={monthChartData} size={140} />
                </div>
              </div>
              <div className="lg:col-span-1 min-h-[320px] bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3" />
                <h3 className="font-heading font-bold text-[18px] tracking-tight w-full text-left mb-6">Recent Week</h3>
                <div className="flex-1 flex items-center justify-center">
                  <PieChart data={weekChartData} size={140} />
                </div>
              </div>
            </div>

            <SeasonTable data={[...seasonData].reverse()} allTime={allTime} />

            <div className="my-4">
              <RankTrendCard
                title="Monthly Rank"
                subtitle="Monthly performance and rank overview"
                data={monthlyRankData}
              />
            </div>
          </>

      {/* ═══════════════════════════════════════════
          MATCH HISTORY TABLE — Improved
          ═══════════════════════════════════════════ */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="font-heading font-bold text-[18px] tracking-tight">Match History</h3>
        </div>
        {historyEntries.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-xl">
            <span className="text-4xl mb-3 block">🎮</span>
            <p className="text-muted-foreground text-[14px] font-medium">No entries yet — the journey begins here!</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-[12px] text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border sticky top-0 z-10">
                <tr>
                  {['Date', 'Goals', 'Conceded', 'Result', 'Flags', 'Notes'].map(h => (
                    <th key={h} className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {historyEntries.map((e, idx) => {
                  const rb = RESULT_BADGE[e.result as keyof typeof RESULT_BADGE] ?? RESULT_BADGE.draw;
                  const resultClass = e.result === 'win' ? 'result-bar-win' : e.result === 'loss' ? 'result-bar-loss' : 'result-bar-draw';
                  return (
                    <tr key={e.id} className={cn(
                      "hover:bg-muted/30 transition-colors",
                      resultClass,
                      idx % 2 === 0 ? "bg-white" : "bg-muted/10"
                    )}>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap font-medium">{e.date}</td>
                      <td className="px-4 py-3 font-black text-foreground text-[14px]">{e.goals}</td>
                      <td className="px-4 py-3 text-red-400 font-bold">{e.goalsConceded}</td>
                      <td className="px-4 py-3"><Badge bg={rb.bg} c={rb.c}>{e.result}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {e.hattricks > 0 && <Badge bg="#1a1a1a" c="#e5e5e5" className="border border-gray-500/30 text-[10px] px-1.5 py-0">HT×{e.hattricks}</Badge>}
                          {e.motm && <Badge bg="#78350f" c="#fcd34d" className="border border-amber-500/30 text-[10px] px-1.5 py-0">MOTM</Badge>}
                          {e.cleanSheet && <Badge bg="#111111" c="#e5e5e5" className="border border-gray-500/30 text-[10px] px-1.5 py-0">CS</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">{e.notes || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center border-t border-border/50 pt-6">
            <div className="flex items-center gap-6 bg-muted/30 px-4 py-2 rounded-xl border border-border shadow-sm">
              <button
                onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                disabled={historyPage === 1}
                className="text-[13px] font-bold hover:text-primary disabled:opacity-40 disabled:hover:text-inherit transition-all flex items-center gap-2"
              >
                ← Previous
              </button>
              <div className="px-3 border-x border-border/50">
                <span className="text-[12px] font-black text-foreground">Page {historyPage} of {totalPages}</span>
              </div>
              <button
                onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                disabled={historyPage === totalPages}
                className="text-[13px] font-bold hover:text-primary disabled:opacity-40 disabled:hover:text-inherit transition-all flex items-center gap-2"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )}

  {activeTab === 'achievements' && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Achievements Summary */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="font-heading font-bold text-[18px] tracking-tight">Achievements Summary</h3>
                <p className="text-[13px] text-muted-foreground">Official milestones and ranking achievements.</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[32px] font-heading font-black text-primary leading-none mb-1">
                    {seasonRanksList.filter(sr => sr?.rank && sr?.rank <= Math.max(5, players.length * 0.2)).length}
                  </p>
                  <p className="text-[11px] font-bold text-muted-foreground">Season Top 20%</p>
                </div>
                <div>
                  <p className="text-[32px] font-heading font-black text-primary leading-none mb-1">
                    {monthlyRankData.filter(d => d.rank <= Math.max(3, players.length * 0.1)).length}
                  </p>
                  <p className="text-[11px] font-bold text-muted-foreground">Month Top 10%</p>
                </div>
                <div>
                  <p className="text-[32px] font-heading font-black text-primary leading-none mb-1">
                    {recentWeekRank && recentWeekRank <= Math.max(3, players.length * 0.05) ? 1 : 0}
                  </p>
                  <p className="text-[11px] font-bold text-muted-foreground">Week Top 5%</p>
                </div>
              </div>
            </div>

            {/* Rankings Overview */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="font-heading font-bold text-[18px] tracking-tight">Rankings Overview</h3>
                <p className="text-[13px] text-muted-foreground">Season rank and wins by official ranking data.</p>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                <div className="border border-border/50 rounded-xl p-3 min-w-[100px] text-center shrink-0">
                  <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Overall</p>
                  <p className="text-[20px] font-heading font-black text-foreground leading-none mb-2">#{currentRank || '-'}</p>
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{stats.totalWins} Wins</span>
                </div>
                {seasonRanksList.map(sr => {
                  const sStats = stats.seasonBreakdown.find(sb => sb.seasonName === sr?.seasonName);
                  return (
                    <div key={sr?.seasonName} className="border border-border/50 rounded-xl p-3 min-w-[100px] text-center shrink-0">
                      <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Season {sr?.seasonName}</p>
                      <p className="text-[20px] font-heading font-black text-foreground leading-none mb-2">#{sr?.rank || '-'}</p>
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{sStats?.wins || 0} Wins</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
            <AchievementBadges
              seasonStats={playerSeasonStats.filter(s => s.playerId === playerId)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
