import { useState, useMemo, useRef } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Avatar, Input } from '@/shared/components';
import { CompareRadarChart } from '@/features/compare/components/CompareRadarChart';
import { CompareSeasonChart } from '@/features/compare/components/CompareSeasonChart';
import { StatCompareBar } from '@/features/compare/components/StatCompareBar';
import { aggregatePlayerStats } from '@/features/compare/utils';
import { cn } from '@/shared/lib/cn';
import { BarChart3, Trophy, Flame, Target, Shield, Zap, Download, Filter, Search } from 'lucide-react';
import { toPng } from 'html-to-image';

function StatCompareText({ label, p1Value, p2Value, better = 'higher' }: any) {
  const isTie = p1Value === p2Value;
  const p1Better = !isTie && (better === 'higher' ? p1Value > p2Value : p1Value < p2Value);
  const p2Better = !isTie && (better === 'higher' ? p2Value > p1Value : p2Value < p1Value);

  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <span className={cn(
        "text-base font-black w-[20%] text-left",
        p1Better ? "text-emerald-500 scale-105" : "text-foreground opacity-80"
      )}>
        {p1Value}
      </span>
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center w-[60%] px-2">
        {label}
      </span>
      <span className={cn(
        "text-base font-black w-[20%] text-right",
        p2Better ? "text-emerald-500 scale-105" : "text-foreground opacity-80"
      )}>
        {p2Value}
      </span>
    </div>
  );
}

const P1_COLOR = '#0ea5e9';
const P2_COLOR = '#ef4444';

function RadarLegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: color, backgroundColor: `${color}40` }} />
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
    </div>
  );
}

export function Compare() {
  const { players, matchEntries, playerSeasonStats, seasons } = useFootballStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | 'all'>('all');
  const [showComparison, setShowComparison] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [chartMetric, setChartMetric] = useState<'goals' | 'points' | 'winRate'>('points');
  const [searchQuery, setSearchQuery] = useState('');
  const captureRef = useRef<HTMLDivElement>(null);

  const togglePlayer = (id: string) => {
    setSelectedIds(prev => {
      let newSelection = prev;
      if (prev.includes(id)) newSelection = prev.filter(p => p !== id);
      else if (prev.length >= 2) newSelection = [prev[1], id];
      else newSelection = [...prev, id];
      
      if (newSelection.length < 2) {
        setShowComparison(false);
      }
      return newSelection;
    });
  };

  const filteredSeasonStats = useMemo(() => {
    if (selectedSeasonId === 'all') return playerSeasonStats;
    return playerSeasonStats.filter(s => s.seasonId === selectedSeasonId);
  }, [playerSeasonStats, selectedSeasonId]);

  const filteredMatchEntries = useMemo(() => {
    if (selectedSeasonId === 'all') return matchEntries;
    return matchEntries.filter(m => m.seasonId === selectedSeasonId);
  }, [matchEntries, selectedSeasonId]);

  const computedStatsList = useMemo(() => aggregatePlayerStats(players, filteredSeasonStats), [players, filteredSeasonStats]);

  const filteredPlayersList = useMemo(() => {
    if (!searchQuery) return computedStatsList;
    const lowerQ = searchQuery.toLowerCase();
    return computedStatsList.filter(p => p.name.toLowerCase().includes(lowerQ));
  }, [computedStatsList, searchQuery]);

  const maxStats = useMemo(() => {
    let ms = {
      matches: 1, winRate: 0.1, lossRate: 0.1, drawRate: 0.1, goalsPerMatch: 0.1,
      hattricksPerMatch: 0.1, csRate: 0.1, motmRate: 0.1, ptsPerMatch: 0.1, gaPerMatch: 0.1
    };
    computedStatsList.forEach(p => {
      const m = p.matches || 1;
      ms.matches = Math.max(ms.matches, p.matches);
      ms.winRate = Math.max(ms.winRate, p.wins / m);
      ms.lossRate = Math.max(ms.lossRate, p.losses / m);
      ms.drawRate = Math.max(ms.drawRate, p.draws / m);
      ms.goalsPerMatch = Math.max(ms.goalsPerMatch, p.goals / m);
      ms.hattricksPerMatch = Math.max(ms.hattricksPerMatch, p.hattricks / m);
      ms.csRate = Math.max(ms.csRate, p.cleansheets / m);
      ms.motmRate = Math.max(ms.motmRate, p.motm / m);
      ms.ptsPerMatch = Math.max(ms.ptsPerMatch, p.pts);
      ms.gaPerMatch = Math.max(ms.gaPerMatch, p.ga / m);
    });
    return ms;
  }, [computedStatsList]);

  const selectedPlayers = useMemo(() => {
    return selectedIds.map(id => {
      const p = players.find(p => p.id === id);
      const computed = computedStatsList.find(c => c.id === id);
      const stats = {
        matches: computed?.matches || 0,
        goals: computed?.goals || 0,
        conceded: computed?.ga || 0,
        wins: computed?.wins || 0,
        draws: computed?.draws || 0,
        losses: computed?.losses || 0,
        motm: computed?.motm || 0,
        cleanSheets: computed?.cleansheets || 0,
        hattricks: computed?.hattricks || 0,
        points: computed?.pts || 0,
      };
      const entries = filteredMatchEntries.filter(e => e.playerId === id);
      return { player: p!, stats, computed, entries };
    }).filter(p => p.player && p.computed);
  }, [selectedIds, players, computedStatsList, filteredMatchEntries]);

  const p1 = selectedPlayers[0];
  const p2 = selectedPlayers[1];
  const m1 = p1?.stats.matches || 1;
  const m2 = p2?.stats.matches || 1;
  
  const compareReady = selectedPlayers.length === 2;
  const p1Leading = compareReady && p1.stats.points >= p2.stats.points;

  const seasonChartData = useMemo(() => {
    if (!p1 || !p2) return [];
    const sortedSeasons = [...seasons].sort((a,b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    return sortedSeasons.map(season => {
      const p1Stat = filteredSeasonStats.find(s => s.seasonId === season.id && s.playerId === p1.player?.id);
      const p2Stat = filteredSeasonStats.find(s => s.seasonId === season.id && s.playerId === p2.player?.id);
      
      let v1 = 0, v2 = 0;
      if (chartMetric === 'goals') {
        v1 = p1Stat?.goals || 0;
        v2 = p2Stat?.goals || 0;
      } else if (chartMetric === 'points') {
        v1 = p1Stat ? (p1Stat.wins*3) + p1Stat.draws - p1Stat.losses + p1Stat.goals - p1Stat.goalsConceded + ((p1Stat as any).motmCount*2) + p1Stat.hattricks : 0;
        v2 = p2Stat ? (p2Stat.wins*3) + p2Stat.draws - p2Stat.losses + p2Stat.goals - p2Stat.goalsConceded + ((p2Stat as any).motmCount*2) + p2Stat.hattricks : 0;
      } else if (chartMetric === 'winRate') {
        v1 = p1Stat?.appearances ? Math.round((p1Stat.wins / p1Stat.appearances) * 100) : 0;
        v2 = p2Stat?.appearances ? Math.round((p2Stat.wins / p2Stat.appearances) * 100) : 0;
      }

      return {
        season: season.name || 'Season',
        p1: v1,
        p2: v2
      };
    });
  }, [seasons, filteredSeasonStats, p1, p2, chartMetric]);

  const winner = compareReady ? (p1Leading ? p1 : p2) : null;
  const winnerColor = p1Leading ? P1_COLOR : P2_COLOR;

  const handleExport = async () => {
    if (!captureRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `compare_${p1.player?.name.replace(/\s+/g, '_')}_vs_${p2.player?.name.replace(/\s+/g, '_')}.png`;
      a.click();
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* ═══════════════════════════════════════════ 
          HEADER
          ═══════════════════════════════════════════ */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl tracking-tight">Player Comparison</h1>
            <p className="text-xs text-muted-foreground font-medium">Select 2 players to compare their career performance</p>
          </div>
        </div>

        {/* Season Filter */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select 
            value={selectedSeasonId}
            onChange={(e) => setSelectedSeasonId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-transparent border-none text-sm font-semibold text-foreground focus:ring-0 outline-none cursor-pointer"
          >
            <option value="all">All-Time Career</option>
            {seasons.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ 
          PLAYER SELECTION GRID
          ═══════════════════════════════════════════ */}
      <div className="relative rounded-3xl border border-border bg-card overflow-hidden shadow-lg mb-8">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-heading font-black text-xl text-foreground tracking-tight">Select Players</h3>
              <p className="text-xs font-bold text-muted-foreground mt-1">Pick 2 players for head-to-head comparison</p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search players..."
                  className="pl-9 w-full sm:w-[200px]"
                />
              </div>
              <span className="bg-primary/10 text-primary font-black px-4 py-1.5 rounded-full text-sm">
                {selectedIds.length}/2 Selected
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredPlayersList.sort((a, b) => a.name.localeCompare(b.name)).map(p => {
              const isSelected = selectedIds.includes(p.id);
              const isP1 = selectedIds[0] === p.id;
              const selColor = isP1 ? P1_COLOR : P2_COLOR;
              return (
                <button
                  key={p.id}
                  onClick={() => togglePlayer(p.id)}
                  className={cn(
                    'group relative flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300',
                    isSelected
                      ? 'shadow-xl scale-[1.02]'
                      : 'border-border bg-background/50 hover:bg-background hover:border-primary/40 hover:shadow-md'
                  )}
                  style={isSelected ? {
                    borderColor: selColor,
                    backgroundColor: `${selColor}10`,
                  } : undefined}
                >
                  <div className={cn(
                    "w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 transition-colors duration-300 flex items-center justify-center",
                    isSelected ? "border-transparent" : "border-border group-hover:border-primary/30"
                  )}
                  style={isSelected ? { borderColor: selColor, boxShadow: `0 0 15px ${selColor}40` } : undefined}
                  >
                    <Avatar src={players.find(pl => pl.id === p.id)?.profileImageUrl} size="full" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="text-center w-full">
                    <span className={cn(
                      "block text-sm font-bold truncate",
                      isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {p.name}
                    </span>
                    {isSelected && (
                      <span className="inline-block mt-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm"
                            style={{ backgroundColor: selColor, color: '#fff' }}>
                        {isP1 ? 'Player 1' : 'Player 2'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ 
          START COMPARISON BUTTON
          ═══════════════════════════════════════════ */}
      {selectedIds.length === 2 && !showComparison && (
        <div className="flex justify-center my-12">
          <button 
            onClick={() => setShowComparison(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 py-5 rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-3"
          >
            <Zap className="w-6 h-6" />
            <span className="text-lg">Compare Players</span>
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════ 
          COMPARISON AREA (only when button is clicked)
          ═══════════════════════════════════════════ */}
      {showComparison && compareReady && (
        <div className="space-y-6 relative mt-6">
          
          {/* Top Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowComparison(false)}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              ← Back to Selection
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export as Image'}
            </button>
          </div>

          <div ref={captureRef} className="space-y-6 rounded-3xl" style={{ background: 'var(--background)', padding: '8px', margin: '-8px' }}>
            {/* ─── HERO VS SECTION ─── */}
          <div
            className="relative rounded-3xl overflow-hidden border bg-card/80"
            style={{ borderColor: `${winnerColor}40` }}
          >
            {/* Glow orbs background */}
            <div
              className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: P1_COLOR }}
            />
            <div
              className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: P2_COLOR }}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-0 py-8 px-6">

              {/* Player 1 Card */}
              <div
                className={cn(
                  "flex flex-col items-center text-center p-6 rounded-2xl border transition-all flex-1 w-full md:max-w-xs",
                  p1Leading ? "shadow-2xl scale-105" : "opacity-80"
                )}
                style={{
                  borderColor: p1Leading ? `${P1_COLOR}60` : `${P1_COLOR}20`,
                  background: `${P1_COLOR}0A`,
                  boxShadow: p1Leading ? `0 0 50px ${P1_COLOR}30, inset 0 0 30px ${P1_COLOR}08` : 'none',
                }}
              >
                {p1Leading && (
                  <div className="mb-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest" style={{ background: `${P1_COLOR}20`, color: P1_COLOR }}>
                    <Trophy className="w-3 h-3" /> LEADING
                  </div>
                )}
                <div className="relative mb-4">
                  <div
                    className="w-24 h-24 rounded-full overflow-hidden border-4"
                    style={{ borderColor: p1Leading ? P1_COLOR : `${P1_COLOR}40` }}
                  >
                    <Avatar src={p1.player?.profileImageUrl} size="xl" />
                  </div>
                  {p1Leading && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: P1_COLOR }}>
                      👑
                    </div>
                  )}
                </div>
                <h2 className="font-heading font-black text-xl text-foreground mb-1">{p1.player?.name}</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: P1_COLOR }}>Player 1</p>
                <div
                  className="rounded-xl px-5 py-3 w-full"
                  style={{ background: `${P1_COLOR}15`, border: `1px solid ${P1_COLOR}30` }}
                >
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Rating Score</p>
                  <p className="text-3xl font-black" style={{ color: P1_COLOR }}>
                    {p1.stats.points.toFixed(2)}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 w-full text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">Matches</p>
                    <p className="text-foreground font-black text-sm">{p1.stats.matches}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">Win%</p>
                    <p className="text-foreground font-black text-sm">{m1 > 0 ? Math.round((p1.stats.wins / m1) * 100) : 0}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">Goals</p>
                    <p className="text-foreground font-black text-sm">{p1.stats.goals}</p>
                  </div>
                </div>
              </div>

              {/* VS Divider */}
              <div className="flex flex-col items-center gap-3 px-6 py-4 shrink-0">
                <div
                  className="w-16 h-16 rounded-full border-2 flex items-center justify-center shadow-2xl"
                  style={{ borderColor: `${winnerColor}60`, background: `${winnerColor}15`, boxShadow: `0 0 30px ${winnerColor}40` }}
                >
                  <span className="font-heading font-black text-lg text-foreground">VS</span>
                </div>
                <div className="w-[1px] h-16 hidden md:block opacity-20" style={{ background: `linear-gradient(to bottom, ${P1_COLOR}, ${P2_COLOR})` }} />
              </div>

              {/* Player 2 Card */}
              <div
                className={cn(
                  "flex flex-col items-center text-center p-6 rounded-2xl border transition-all flex-1 w-full md:max-w-xs",
                  !p1Leading ? "shadow-2xl scale-105" : "opacity-80"
                )}
                style={{
                  borderColor: !p1Leading ? `${P2_COLOR}60` : `${P2_COLOR}20`,
                  background: `${P2_COLOR}0A`,
                  boxShadow: !p1Leading ? `0 0 50px ${P2_COLOR}30, inset 0 0 30px ${P2_COLOR}08` : 'none',
                }}
              >
                {!p1Leading && (
                  <div className="mb-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest" style={{ background: `${P2_COLOR}20`, color: P2_COLOR }}>
                    <Trophy className="w-3 h-3" /> LEADING
                  </div>
                )}
                <div className="relative mb-4">
                  <div
                    className="w-24 h-24 rounded-full overflow-hidden border-4"
                    style={{ borderColor: !p1Leading ? P2_COLOR : `${P2_COLOR}40` }}
                  >
                    <Avatar src={p2.player?.profileImageUrl} size="xl" />
                  </div>
                  {!p1Leading && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: P2_COLOR }}>
                      👑
                    </div>
                  )}
                </div>
                <h2 className="font-heading font-black text-xl text-foreground mb-1">{p2.player?.name}</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: P2_COLOR }}>Player 2</p>
                <div
                  className="rounded-xl px-5 py-3 w-full"
                  style={{ background: `${P2_COLOR}15`, border: `1px solid ${P2_COLOR}30` }}
                >
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Rating Score</p>
                  <p className="text-3xl font-black" style={{ color: P2_COLOR }}>
                    {p2.stats.points.toFixed(2)}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 w-full text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">Matches</p>
                    <p className="text-foreground font-black text-sm">{p2.stats.matches}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">Win%</p>
                    <p className="text-foreground font-black text-sm">{m2 > 0 ? Math.round((p2.stats.wins / m2) * 100) : 0}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">Goals</p>
                    <p className="text-foreground font-black text-sm">{p2.stats.goals}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── VERDICT BANNER ─── */}
          <div
            className="rounded-3xl border p-8 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${winnerColor}15, ${winnerColor}08)`,
              borderColor: `${winnerColor}40`,
              boxShadow: `0 20px 60px ${winnerColor}20`,
            }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: winnerColor }} />
            <div className="relative z-10 text-center">
              <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: winnerColor }}>
                🏆 Performance Verdict
              </p>
              <h2 className="font-heading font-black text-3xl md:text-4xl text-foreground mb-3 uppercase">
                {winner?.player?.name} is leading
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Based on per-match fair statistics including Win Rate, Goals per Match, Goals Conceded, Clean Sheets, and MOTM.{' '}
                <strong className="text-foreground">{winner?.player?.name}</strong> currently holds the superior overall statistical performance record.
              </p>
              <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                <Zap className="w-3 h-3" /> Note: Players with fewer than 100 matches have a reliability penalty applied
              </div>
            </div>
          </div>

          {/* ─── RADAR + FORM WAVE ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Radar Chart */}
            <div
              className="rounded-3xl border border-border bg-card overflow-hidden"
              
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                  <h3 className="font-heading font-black text-foreground text-base uppercase tracking-tight">Skill Radar</h3>
                  <p className="text-[10px] text-muted-foreground font-bold">Overall performance shape</p>
                </div>
                <div className="flex items-center gap-4">
                  <RadarLegendDot color={P1_COLOR} label={p1.player?.name?.split(' ')[0] || 'P1'} />
                  <RadarLegendDot color={P2_COLOR} label={p2.player?.name?.split(' ')[0] || 'P2'} />
                </div>
              </div>
              <div className="p-4 flex items-center justify-center min-h-[380px]">
                <CompareRadarChart
                  p1={p1.computed!}
                  p2={p2.computed!}
                  maxStats={maxStats}
                />
              </div>
            </div>

            {/* Right Column: Match Outcomes + Career Highlights */}
            <div className="flex flex-col gap-6">
              {/* Match Outcomes Breakdown */}
              <div className="rounded-3xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <div>
                    <h3 className="font-heading font-black text-foreground text-base uppercase tracking-tight">Match Outcomes</h3>
                    <p className="text-[10px] text-muted-foreground font-bold">Win / Draw / Loss Distribution</p>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {[
                    { player: p1, color: P1_COLOR },
                    { player: p2, color: P2_COLOR }
                  ].map(({ player, color }) => {
                    const total = player.stats.matches || 1;
                    const wPct = (player.stats.wins / total) * 100;
                    const dPct = (player.stats.draws / total) * 100;
                    const lPct = (player.stats.losses / total) * 100;
                    
                    return (
                      <div key={player.player?.id}>
                        <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color }}>{player.player?.name}</p>
                        <div className="flex w-full h-8 rounded-xl overflow-hidden gap-1 bg-muted/30">
                        <div className="h-full bg-emerald-500/80 flex items-center justify-center text-[10px] font-black text-white" style={{ width: `${wPct}%` }}>
                            {wPct > 10 ? 'W' : ''}
                          </div>
                          <div className="h-full bg-amber-500/80 flex items-center justify-center text-[10px] font-black text-white" style={{ width: `${dPct}%` }}>
                            {dPct > 10 ? 'D' : ''}
                          </div>
                          <div className="h-full bg-red-500/80 flex items-center justify-center text-[10px] font-black text-white" style={{ width: `${lPct}%` }}>
                            {lPct > 10 ? 'L' : ''}
                          </div>
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] font-bold text-muted-foreground">
                          <span>{player.stats.wins} Wins ({Math.round(wPct)}%)</span>
                          <span>{player.stats.draws} Draws ({Math.round(dPct)}%)</span>
                          <span>{player.stats.losses} Losses ({Math.round(lPct)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Season Performance */}
              <div className="rounded-3xl border border-border bg-card overflow-hidden flex-1 flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <div>
                    <h3 className="font-heading font-black text-foreground text-base uppercase tracking-tight">Season Performance</h3>
                    <p className="text-[10px] text-muted-foreground font-bold">Trend over time</p>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-xl border border-border">
                    {(['points', 'goals', 'winRate'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setChartMetric(m)}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                          chartMetric === m 
                            ? "bg-primary text-primary-foreground shadow-md scale-105" 
                            : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                        )}
                      >
                        {m === 'points' ? 'Rating' : m === 'goals' ? 'Goals' : 'Win %'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-center min-h-[250px]">
                  <CompareSeasonChart 
                    data={seasonChartData} 
                    p1Name={p1?.player?.name?.split(' ')[0] || 'P1'} 
                    p2Name={p2?.player?.name?.split(' ')[0] || 'P2'} 
                    p1Color={P1_COLOR} 
                    p2Color={P2_COLOR} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─── FIFA-STYLE STAT COMPARISON BARS ─── */}
          <div
            className="rounded-3xl border border-border bg-card overflow-hidden"
            
          >
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-heading font-black text-foreground text-base uppercase tracking-tight">Performance Analysis</h3>
                <p className="text-[10px] text-muted-foreground font-bold">Head-to-head stats breakdown</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: P1_COLOR }} />
                  <span className="text-xs font-bold text-muted-foreground truncate max-w-[80px]">{p1.player?.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: P2_COLOR }} />
                  <span className="text-xs font-bold text-muted-foreground truncate max-w-[80px]">{p2.player?.name}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Per-match rating breakdown */}
              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Flame className="w-3 h-3" /> Rating Components (per match)
                </p>
                <div className="space-y-3">
                  <StatCompareBar label="Win Rate" p1Value={m1 > 0 ? Math.round((p1.stats.wins / m1) * 100) : 0} p2Value={m2 > 0 ? Math.round((p2.stats.wins / m2) * 100) : 0} p1Name={p1.player?.name || ''} p2Name={p2.player?.name || ''} better="higher" />
                  <StatCompareBar label="Goals / Match" p1Value={m1 > 0 ? p1.stats.goals / m1 : 0} p2Value={m2 > 0 ? p2.stats.goals / m2 : 0} p1Name={p1.player?.name || ''} p2Name={p2.player?.name || ''} better="higher" isFloat />
                  <StatCompareBar label="Conceded / Match" p1Value={m1 > 0 ? p1.stats.conceded / m1 : 0} p2Value={m2 > 0 ? p2.stats.conceded / m2 : 0} p1Name={p1.player?.name || ''} p2Name={p2.player?.name || ''} better="lower" isFloat />
                  <StatCompareBar label="Clean Sheets / Match" p1Value={m1 > 0 ? p1.stats.cleanSheets / m1 : 0} p2Value={m2 > 0 ? p2.stats.cleanSheets / m2 : 0} p1Name={p1.player?.name || ''} p2Name={p2.player?.name || ''} better="higher" isFloat />
                  <StatCompareBar label="MOTM / Match" p1Value={m1 > 0 ? p1.stats.motm / m1 : 0} p2Value={m2 > 0 ? p2.stats.motm / m2 : 0} p1Name={p1.player?.name || ''} p2Name={p2.player?.name || ''} better="higher" isFloat />
                </div>
              </div>

              {/* Career totals */}
              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Target className="w-3 h-3" /> Career Totals
                </p>
                <div className="space-y-1 px-2">
                  <StatCompareText label="Matches" p1Value={p1.stats.matches} p2Value={p2.stats.matches} better="higher" />
                  <StatCompareText label="Goals Scored" p1Value={p1.stats.goals} p2Value={p2.stats.goals} better="higher" />
                  <StatCompareText label="Wins" p1Value={p1.stats.wins} p2Value={p2.stats.wins} better="higher" />
                  <StatCompareText label="Draws" p1Value={p1.stats.draws} p2Value={p2.stats.draws} better="higher" />
                  <StatCompareText label="Losses" p1Value={p1.stats.losses} p2Value={p2.stats.losses} better="lower" />
                </div>
              </div>

              {/* Defensive & Special */}
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Defensive & Honours
                </p>
                <div className="space-y-1 px-2">
                  <StatCompareText label="Goals Conceded" p1Value={p1.stats.conceded} p2Value={p2.stats.conceded} better="lower" />
                  <StatCompareText label="Clean Sheets" p1Value={p1.stats.cleanSheets} p2Value={p2.stats.cleanSheets} better="higher" />
                  <StatCompareText label="MOTM Awards" p1Value={p1.stats.motm} p2Value={p2.stats.motm} better="higher" />
                  <StatCompareText label="Hat-tricks" p1Value={p1.stats.hattricks} p2Value={p2.stats.hattricks} better="higher" />
                </div>
              </div>
            </div>
          </div>
          </div> {/* End captureRef */}
        </div>
      )}

      {/* Empty state */}
      {!compareReady && (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center rounded-3xl border border-dashed border-border bg-card/30 p-12">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-primary/50" />
          </div>
          <h3 className="font-heading font-bold text-xl text-foreground mb-2">Select 2 Players</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Pick any 2 players from the list above to see their full head-to-head statistical comparison.
          </p>
        </div>
      )}
    </div>
  );
}
