import { useState, useMemo, useRef } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Avatar } from '@/shared/components';
import { CompareRadarChart } from '@/features/compare/components/CompareRadarChart';
import { CompareFormChart } from '@/features/compare/components/CompareFormChart';
import { StatCompareBar } from '@/features/compare/components/StatCompareBar';
import { aggregatePlayerStats } from '@/features/compare/utils';
import { cn } from '@/shared/lib/cn';
import { BarChart3, Trophy, Flame, Target, Shield, Zap, Download, Filter } from 'lucide-react';
import html2canvas from 'html2canvas';

const P1_COLOR = '#3b82f6';
const P2_COLOR = '#ef4444';

function RadarLegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: color, backgroundColor: `${color}40` }} />
      <span className="text-xs font-bold text-white/80">{label}</span>
    </div>
  );
}

export function Compare() {
  const { players, matchEntries, playerSeasonStats, seasons } = useFootballStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | 'all'>('all');
  const [showComparison, setShowComparison] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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

  const compareReady = selectedPlayers.length === 2;

  // Derived comparison data
  const p1 = selectedPlayers[0];
  const p2 = selectedPlayers[1];
  const p1Leading = compareReady && p1.stats.points >= p2.stats.points;
  const winner = compareReady ? (p1Leading ? p1 : p2) : null;
  const winnerColor = p1Leading ? P1_COLOR : P2_COLOR;

  const m1 = p1?.stats.matches || 1;
  const m2 = p2?.stats.matches || 1;

  const handleExport = async () => {
    if (!captureRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(captureRef.current, { 
        backgroundColor: document.documentElement.classList.contains('dark') ? '#0a0a0a' : '#ffffff',
        scale: 2, // Higher resolution
        useCORS: true
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
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
      <div className="bg-card border border-border rounded-2xl p-5 mb-8 shadow-sm">
        <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-widest mb-4">
          Select Players ({selectedIds.length}/2)
        </h3>
        <div className="flex flex-wrap gap-2">
          {computedStatsList.sort((a, b) => a.name.localeCompare(b.name)).map(p => {
            const isSelected = selectedIds.includes(p.id);
            const isP1 = selectedIds[0] === p.id;
            const selColor = isP1 ? P1_COLOR : P2_COLOR;
            return (
              <button
                key={p.id}
                onClick={() => togglePlayer(p.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all duration-200',
                  isSelected
                    ? 'text-white shadow-md scale-105'
                    : 'border-border text-foreground bg-background hover:border-primary/40 hover:bg-primary/5'
                )}
                style={isSelected ? {
                  borderColor: `${selColor}80`,
                  backgroundColor: `${selColor}18`,
                  color: selColor,
                } : undefined}
              >
                <Avatar src={players.find(pl => pl.id === p.id)?.profileImageUrl} size="xs" />
                <span>{p.name}</span>
                {isSelected && (
                  <span className="text-[10px] font-black opacity-80">{isP1 ? 'P1' : 'P2'}</span>
                )}
              </button>
            );
          })}
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

          <div ref={captureRef} className="space-y-6 bg-background p-2 -m-2 rounded-3xl">
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
                <h2 className="font-heading font-black text-xl text-white mb-1">{p1.player?.name}</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: P1_COLOR }}>Player 1</p>
                <div
                  className="rounded-xl px-5 py-3 w-full"
                  style={{ background: `${P1_COLOR}15`, border: `1px solid ${P1_COLOR}30` }}
                >
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Rating Score</p>
                  <p className="text-3xl font-black" style={{ color: P1_COLOR }}>
                    {p1.stats.points.toFixed(2)}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 w-full text-center">
                  <div>
                    <p className="text-[10px] text-white/40 font-bold uppercase mb-0.5">Matches</p>
                    <p className="text-white font-black text-sm">{p1.stats.matches}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 font-bold uppercase mb-0.5">Win%</p>
                    <p className="text-white font-black text-sm">{m1 > 0 ? Math.round((p1.stats.wins / m1) * 100) : 0}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 font-bold uppercase mb-0.5">Goals</p>
                    <p className="text-white font-black text-sm">{p1.stats.goals}</p>
                  </div>
                </div>
              </div>

              {/* VS Divider */}
              <div className="flex flex-col items-center gap-3 px-6 py-4 shrink-0">
                <div
                  className="w-16 h-16 rounded-full border-2 flex items-center justify-center shadow-2xl"
                  style={{ borderColor: `${winnerColor}60`, background: `${winnerColor}15`, boxShadow: `0 0 30px ${winnerColor}40` }}
                >
                  <span className="font-heading font-black text-lg text-white">VS</span>
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
                <h2 className="font-heading font-black text-xl text-white mb-1">{p2.player?.name}</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: P2_COLOR }}>Player 2</p>
                <div
                  className="rounded-xl px-5 py-3 w-full"
                  style={{ background: `${P2_COLOR}15`, border: `1px solid ${P2_COLOR}30` }}
                >
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Rating Score</p>
                  <p className="text-3xl font-black" style={{ color: P2_COLOR }}>
                    {p2.stats.points.toFixed(2)}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 w-full text-center">
                  <div>
                    <p className="text-[10px] text-white/40 font-bold uppercase mb-0.5">Matches</p>
                    <p className="text-white font-black text-sm">{p2.stats.matches}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 font-bold uppercase mb-0.5">Win%</p>
                    <p className="text-white font-black text-sm">{m2 > 0 ? Math.round((p2.stats.wins / m2) * 100) : 0}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 font-bold uppercase mb-0.5">Goals</p>
                    <p className="text-white font-black text-sm">{p2.stats.goals}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── RADAR + FORM WAVE ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Radar Chart */}
            <div
              className="rounded-3xl border overflow-hidden"
              style={{ background: 'linear-gradient(145deg, #0a0a12, #0d111c)', borderColor: '#ffffff10' }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div>
                  <h3 className="font-heading font-black text-white text-base uppercase tracking-tight">Skill Radar</h3>
                  <p className="text-[10px] text-white/40 font-bold">Overall performance shape</p>
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

            {/* Recent Form Wave Chart */}
            <div
              className="rounded-3xl border overflow-hidden"
              style={{ background: 'linear-gradient(145deg, #0a0a12, #0d111c)', borderColor: '#ffffff10' }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div>
                  <h3 className="font-heading font-black text-white text-base uppercase tracking-tight">Recent Form</h3>
                  <p className="text-[10px] text-white/40 font-bold">Last 10 matches — W=3, D=1, L=0</p>
                </div>
                <div className="flex items-center gap-4">
                  <RadarLegendDot color={P1_COLOR} label={p1.player?.name?.split(' ')[0] || 'P1'} />
                  <RadarLegendDot color={P2_COLOR} label={p2.player?.name?.split(' ')[0] || 'P2'} />
                </div>
              </div>

              <div className="p-6">
                <CompareFormChart
                  p1Name={p1.player?.name?.split(' ')[0] || 'P1'}
                  p1Entries={p1.entries}
                  p2Name={p2.player?.name?.split(' ')[0] || 'P2'}
                  p2Entries={p2.entries}
                />

                {/* Form summary badges */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {[
                    { player: p1, color: P1_COLOR },
                    { player: p2, color: P2_COLOR },
                  ].map(({ player, color }) => {
                    const last5 = [...player.entries]
                      .filter(e => e.date)
                      .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
                      .slice(0, 5);
                    const formPts = last5.reduce((s, e) => s + (e.result === 'win' ? 3 : e.result === 'draw' ? 1 : 0), 0);
                    const maxPts = last5.length * 3;
                    const formPct = maxPts > 0 ? Math.round((formPts / maxPts) * 100) : 0;

                    return (
                      <div key={player.player?.id} className="rounded-2xl p-4" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2 truncate" style={{ color }}>{player.player?.name}</p>
                        <div className="flex items-end gap-2">
                          <p className="text-2xl font-black text-white leading-none">{formPct}%</p>
                          <p className="text-[10px] text-white/40 font-bold mb-0.5">form</p>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {last5.map((e, i) => (
                            <div
                              key={i}
                              className="flex-1 h-1.5 rounded-full"
                              style={{
                                background: e.result === 'win' ? '#10b981' : e.result === 'draw' ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          ))}
                          {Array.from({ length: Math.max(0, 5 - last5.length) }, (_, i) => (
                            <div key={`empty-${i}`} className="flex-1 h-1.5 rounded-full bg-white/10" />
                          ))}
                        </div>
                        <p className="text-[9px] text-white/30 font-bold mt-1">Last {last5.length} matches</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ─── FIFA-STYLE STAT COMPARISON BARS ─── */}
          <div
            className="rounded-3xl border overflow-hidden"
            style={{ background: 'linear-gradient(145deg, #0a0a12, #0d111c)', borderColor: '#ffffff10' }}
          >
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-black text-white text-base uppercase tracking-tight">Performance Analysis</h3>
                <p className="text-[10px] text-white/40 font-bold">Head-to-head stats breakdown</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: P1_COLOR }} />
                  <span className="text-xs font-bold text-white/70 truncate max-w-[80px]">{p1.player?.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: P2_COLOR }} />
                  <span className="text-xs font-bold text-white/70 truncate max-w-[80px]">{p2.player?.name}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Per-match rating breakdown */}
              <div className="mb-6 pb-6 border-b border-white/5">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
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
              <div className="mb-6 pb-6 border-b border-white/5">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Target className="w-3 h-3" /> Career Totals
                </p>
                <div className="space-y-3">
                  <StatCompareBar label="Matches" p1Value={p1.stats.matches} p2Value={p2.stats.matches} p1Name={p1.player?.name || ''} p2Name={p2.player?.name || ''} better="higher" />
                  <StatCompareBar label="Goals Scored" p1Value={p1.stats.goals} p2Value={p2.stats.goals} p1Name={p1.player?.name || ''} p2Name={p2.player?.name || ''} better="higher" />
                  <StatCompareBar label="Wins" p1Value={p1.stats.wins} p2Value={p2.stats.wins} p1Name={p1.player?.name || ''} p2Name={p2.player?.name || ''} better="higher" />
                  <StatCompareBar label="Draws" p1Value={p1.stats.draws} p2Value={p2.stats.draws} p1Name={p1.player?.name || ''} p2Name={p2.player?.name || ''} better="higher" />
                  <StatCompareBar label="Losses" p1Value={p1.stats.losses} p2Value={p2.stats.losses} p1Name={p1.player?.name || ''} p2Name={p2.player?.name || ''} better="lower" />
                </div>
              </div>

              {/* Defensive & Special */}
              <div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Defensive & Honours
                </p>
                <div className="space-y-3">
                  <StatCompareBar label="Goals Conceded" p1Value={p1.stats.conceded} p2Value={p2.stats.conceded} p1Name={p1.player?.name || ''} p2Name={p2.player?.name || ''} better="lower" />
                  <StatCompareBar label="Clean Sheets" p1Value={p1.stats.cleanSheets} p2Value={p2.stats.cleanSheets} p1Name={p1.player?.name || ''} p2Name={p2.player?.name || ''} better="higher" />
                  <StatCompareBar label="MOTM Awards" p1Value={p1.stats.motm} p2Value={p2.stats.motm} p1Name={p1.player?.name || ''} p2Name={p2.player?.name || ''} better="higher" />
                  <StatCompareBar label="Hat-tricks" p1Value={p1.stats.hattricks} p2Value={p2.stats.hattricks} p1Name={p1.player?.name || ''} p2Name={p2.player?.name || ''} better="higher" />
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
              <h2 className="font-heading font-black text-3xl md:text-4xl text-white mb-3 uppercase">
                {winner?.player?.name} is leading
              </h2>
              <p className="text-sm text-white/60 max-w-xl mx-auto">
                Based on per-match fair statistics including Win Rate, Goals per Match, Goals Conceded, Clean Sheets, and MOTM.{' '}
                <strong className="text-white">{winner?.player?.name}</strong> currently holds the superior overall statistical performance record.
              </p>
              <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-white/30 font-bold uppercase tracking-widest">
                <Zap className="w-3 h-3" /> Note: Players with fewer than 100 matches have a reliability penalty applied
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
