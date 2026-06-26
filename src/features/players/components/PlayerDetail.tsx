import { useRef, useState } from 'react';
import { Avatar, Badge, Button, PieChart } from '@/shared/components';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { useFootballStore } from '@/store/footballStore';
import { RESULT_BADGE } from '@/shared/lib/constants';
import { PlayerRadarChart } from './PlayerRadarChart';
import { SeasonPerformanceChart } from './SeasonPerformanceChart';
import { RankTrendCard } from './RankTrendCard';
import { SeasonTable } from './SeasonTable';
import { AchievementBadges } from './AchievementBadges';
import { cn } from '@/shared/lib/cn';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';

interface PlayerDetailProps {
  playerId: string;
  onBack: () => void;
}
export function PlayerDetail({ playerId, onBack }: PlayerDetailProps) {
  const { players, matchEntries, playerSeasonStats, seasons } = useFootballStore();
  const player = players.find(p => p.id === playerId);
  const stats = usePlayerStats(playerId);

  const captureRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

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

  const historyEntries = [...entries]
    .sort((a, b) => {
      const dateTimeA = a.time ? `${a.date}T${a.time}` : (a.date ? `${a.date}T00:00:00` : '');
      const dateTimeB = b.time ? `${b.date}T${b.time}` : (b.date ? `${b.date}T00:00:00` : '');
      const dateA = new Date(dateTimeA).getTime();
      const dateB = new Date(dateTimeB).getTime();
      const validA = isNaN(dateA) ? 0 : dateA;
      const validB = isNaN(dateB) ? 0 : dateB;
      if (validA !== validB) return validB - validA;
      return String(b.id).localeCompare(String(a.id));
    })
    .slice(0, 30); // Requested to show 30 instead of 50


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
    const recent10 = historyEntries.slice(0, 10);
    if (recent10.length < 10) {
      return { text: 'STABLE / N/A', color: '#9ca3af', icon: '➖' };
    }
    
    const calcPoints = (entries: typeof historyEntries) => 
      entries.reduce((sum, e) => sum + (e.result === 'win' ? 10 : e.result === 'draw' ? 5 : e.result === 'loss' ? -3 : 0), 0) / entries.length;

    const first5Avg = calcPoints(recent10.slice(0, 5)); // newer
    const last5Avg = calcPoints(recent10.slice(5, 10)); // older

    if (first5Avg > last5Avg) {
      return { text: 'IN FORM', color: '#10b981', icon: '📈' };
    } else if (first5Avg < last5Avg) {
      return { text: 'OUT OF FORM', color: '#ef4444', icon: '📉' };
    } else {
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
      <div ref={captureRef} className="relative rounded-2xl p-6 md:p-8 lg:p-12 lg:min-h-[380px] flex flex-col justify-center mb-6 shadow-xl overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #111827, #1f2937, #111827)' }}>
        {player.coverImageUrl && (
          <img src={player.coverImageUrl} alt={`${player.name} cover`} className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay pointer-events-none" />
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

        {/* ═══ Quick Stats Ribbon ═══ */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/10">
          <div className="flex flex-wrap gap-6 items-start">
            {/* Recent Form */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2">Recent Form (Last 10)</h4>
              <div className="flex gap-1.5 flex-wrap">
                {(() => {
                  const recent10 = historyEntries.slice(0, 10).reverse();
                  if (recent10.length === 0) return <span className="text-[11px] text-white/30">No matches yet</span>;
                  return recent10.map((entry, i) => {
                    const result = entry.result || 'draw';
                    const isWin = result === 'win';
                    const isDraw = result === 'draw';
                    return (
                      <div
                        key={entry.id || i}
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-[11px] shadow-md cursor-default"
                        style={isWin
                          ? { background: 'rgba(16,185,129,0.3)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.2)' }
                          : isDraw
                          ? { background: 'rgba(245,158,11,0.3)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.2)' }
                          : { background: 'rgba(239,68,68,0.3)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }
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
              <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2">Form Trend</h4>
              <span 
                className="font-black text-[13px] px-3 py-1 rounded-lg shadow-md border flex items-center gap-1.5 w-max" 
                style={{ backgroundColor: `${formStatus.color}20`, color: formStatus.color, borderColor: `${formStatus.color}30` }}
              >
                <span>{formStatus.icon}</span>
                {formStatus.text}
              </span>
            </div>

            {/* Ranks */}
            {[
              { label: 'Overall Rank', value: currentRank, color: '#fbbf24', bgColor: 'rgba(251,191,36,0.2)' },
              { label: 'Month Rank', value: recentMonthRank, color: '#34d399', bgColor: 'rgba(52,211,153,0.2)' },
              { label: 'Week Rank', value: recentWeekRank, color: '#a78bfa', bgColor: 'rgba(167,139,250,0.2)' },
            ].map(r => (
              <div key={r.label}>
                <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2">{r.label}</h4>
                <div className="flex items-center gap-2">
                  <span className="font-black text-[14px] px-3 py-1 rounded-lg shadow-md" style={{ backgroundColor: r.bgColor, color: r.color }}>
                    #{r.value || '-'}
                  </span>
                </div>
              </div>
            ))}

            {/* Season Ranks */}
            {seasonRanksList.map((sr: any) => (
              <div key={sr.seasonName}>
                <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2">{sr.seasonName}</h4>
                <div className="flex items-center gap-2">
                  <span className="font-black text-[14px] px-3 py-1 rounded-lg shadow-md" style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd' }}>
                    #{sr.rank || '-'}
                  </span>
                </div>
              </div>
            ))}

            {/* Win Rate */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2">Win Rate</h4>
              <span className="font-black text-[14px] px-3 py-1 rounded-lg shadow-md" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                {(stats.totalMatches > 0 ? (stats.totalWins / stats.totalMatches) * 100 : 0).toFixed(0)}%
              </span>
            </div>

            {player.email && (
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2">Email</h4>
                <span className="text-[13px] text-white/70 font-medium">{player.email}</span>
              </div>
            )}
          </div>
        </div>
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
      {(() => {
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

        const buildPeriodKey = (date: Date, mode: 'month' | 'week') => {
          const monthKey = date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
          if (mode === 'month') return monthKey;
          const weekNum = Math.ceil(date.getDate() / 7);
          return `W${weekNum} ${monthKey}`;
        };

        // Collect all unique period keys from this player's entries
        const myMonthKeys = new Set<string>();
        const myWeekKeys = new Set<string>();
        entries.forEach(e => {
          if (!e.date) return;
          const d = new Date(e.date);
          if (isNaN(d.getTime())) return;
          myMonthKeys.add(buildPeriodKey(d, 'month'));
          myWeekKeys.add(buildPeriodKey(d, 'week'));
        });

        const getRankForPeriod = (periodKey: string, mode: 'month' | 'week'): { rank: number; wins: number; draws: number; losses: number; goals: number; matches: number; totalPlayers: number } => {
          const playerPoints = new Map<string, PeriodStats>();
          matchEntries.forEach(e => {
            if (!e.date) return;
            const d = new Date(e.date);
            if (isNaN(d.getTime())) return;
            if (buildPeriodKey(d, mode) !== periodKey) return;
            if (!playerPoints.has(e.playerId)) {
              playerPoints.set(e.playerId, { wins: 0, draws: 0, losses: 0, goals: 0, matches: 0, points: 0 });
            }
            const ps = playerPoints.get(e.playerId)!;
            ps.matches += 1;
            ps.goals += e.goals || 0;
            if (e.result === 'win') { ps.wins += 1; ps.points += 3; }
            else if (e.result === 'draw') { ps.draws += 1; ps.points += 1; }
            else if (e.result === 'loss') { ps.losses += 1; }
            if (e.motm) ps.points += 2;
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

        // Only keep months where this player ranked top 5
        const monthlyRankData = Array.from(myMonthKeys)
          .map(key => ({ label: key, ...getRankForPeriod(key, 'month') }))
          .filter(d => d.rank <= 5)
          .sort((a, b) => a.rank - b.rank); // best rank first

        return (
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
                subtitle="Months this player reached Top 5 in the leaderboard"
                data={monthlyRankData}
              />
            </div>
          </>
        );
      })()}

      {/* ═══════════════════════════════════════════
          MATCH HISTORY TABLE — Improved
          ═══════════════════════════════════════════ */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <p className="font-heading font-bold text-[18px] mb-4 tracking-tight">Match History <span className="text-muted-foreground text-[13px] font-sans font-normal ml-2">(Recent 30)</span></p>
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
      </div>

      {/* ═══════════════════════════════════════════
          ACHIEVEMENT BADGES
          ═══════════════════════════════════════════ */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
        <AchievementBadges
          seasonStats={playerSeasonStats.filter(s => s.playerId === playerId)}
        />
      </div>

    </div>
  );
}
