import { useState, useMemo } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Avatar, Badge, Button } from '@/shared/components';
import { CompareRadarChart } from '@/features/compare/components/CompareRadarChart';
import { aggregatePlayerStats } from '@/features/compare/utils';
import { cn } from '@/shared/lib/cn';
import { BarChart3, ChevronDown, CheckCircle2 } from 'lucide-react';

export function Compare() {
  const { players, playerSeasonStats } = useFootballStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(true);

  const togglePlayer = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const computedStatsList = useMemo(() => aggregatePlayerStats(players, playerSeasonStats), [players, playerSeasonStats]);

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
      
      return { player: p!, stats, computed };
    }).filter(p => p.player && p.computed);
  }, [selectedIds, players, computedStatsList]);

  const MetricRow = ({ label, value1, value2, better }: { label: string, value1: number, value2: number, better: 'higher' | 'lower' }) => {
    let p1Better = false;
    let p2Better = false;
    
    if (value1 !== value2) {
      if (better === 'higher') {
        p1Better = value1 > value2;
        p2Better = value2 > value1;
      } else {
        p1Better = value1 < value2;
        p2Better = value2 < value1;
      }
    }

    return (
      <div className="flex items-center justify-between py-4 border-b border-border/50 hover:bg-muted/10 transition-colors">
        <div className="w-1/3 text-center">
          <span className={cn(
            "text-[13px] sm:text-[15px] font-black tracking-tight px-2 sm:px-3 py-1 rounded-lg transition-all",
            p1Better ? "bg-emerald-500/10 text-emerald-600 shadow-sm" : "text-foreground"
          )}>
            {value1}
          </span>
        </div>
        <div className="w-1/3 text-center px-1">
          <span className="text-[9px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-1.5 sm:px-2 py-1 rounded-md block sm:inline leading-none">
            {label}
          </span>
        </div>
        <div className="w-1/3 text-center">
          <span className={cn(
            "text-[13px] sm:text-[15px] font-black tracking-tight px-2 sm:px-3 py-1 rounded-lg transition-all",
            p2Better ? "bg-emerald-500/10 text-emerald-600 shadow-sm" : "text-foreground"
          )}>
            {value2}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-bold text-[28px] tracking-wide">Compare Players</h2>
          </div>
          <p className="text-muted-foreground text-[13px] font-medium">Select two players to compare their career statistics side by side</p>
        </div>
        {!isSelecting && (
          <Button variant="secondary" onClick={() => setIsSelecting(true)}>Change Players</Button>
        )}
      </div>

      {isSelecting ? (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-[16px]">Select 2 Players</h3>
            <Badge bg="#111111" c="#ffffff" className="text-[12px] px-3 py-1 shadow-md">
              {selectedIds.length} / 2 Selected
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-8 stagger-children">
            {players.map(p => {
              const isSelected = selectedIds.includes(p.id);
              const isDisabled = selectedIds.length >= 2 && !isSelected;
              return (
                <button
                  key={p.id}
                  onClick={() => togglePlayer(p.id)}
                  disabled={isDisabled}
                  className={cn(
                    "relative flex flex-col items-center p-4 rounded-xl border transition-all duration-200 group text-left w-full h-full card-hover-lift",
                    isSelected ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20" : 
                    isDisabled ? "opacity-40 cursor-not-allowed border-border" : 
                    "border-border hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-primary animate-in zoom-in duration-200">
                      <CheckCircle2 className="w-5 h-5 fill-primary/20" />
                    </div>
                  )}
                  <Avatar name={p.name} size={48} src={p.profileImageUrl} className={cn("mb-3 shadow-sm transition-transform duration-300", isSelected && "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-card")} />
                  <span className={cn("text-[13px] font-bold text-center leading-tight", isSelected ? "text-primary" : "text-foreground")}>{p.name}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold mt-1">👕 {p.jerseyNumber}</span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end border-t border-border/50 pt-6">
            <Button 
              size="lg" 
              disabled={selectedIds.length !== 2} 
              onClick={() => setIsSelecting(false)}
              className="w-full sm:w-auto min-w-[200px] shadow-glow-red"
            >
              Compare Selected Players
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden flex flex-col">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row border-b border-border bg-gradient-to-br from-gray-900 to-gray-800 p-6 sm:p-8 relative gap-6 sm:gap-0">
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')]" />
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />

            {selectedPlayers.map((p, i) => (
              <div key={p.player.id} className={cn(
                "flex-1 flex flex-col items-center justify-center relative z-10",
                i === 0 ? "border-b sm:border-b-0 sm:border-r border-white/10 pb-6 sm:pb-0" : "pt-6 sm:pt-0"
              )}>
                <Avatar name={p.player.name} size="w-16 h-16 sm:w-24 sm:h-24" src={p.player.profileImageUrl} className="ring-4 ring-white/10 ring-offset-4 ring-offset-gray-900 shadow-2xl mb-4" />
                <h3 className="font-heading font-bold text-[20px] sm:text-[28px] text-white tracking-wide text-center leading-none mb-2">{p.player.name}</h3>
                <p className="text-white/50 text-[11px] sm:text-[13px] font-bold">👕 {p.player.jerseyNumber}</p>
              </div>
            ))}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 border-2 border-white/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center z-20 shadow-xl">
              <span className="text-[10px] sm:text-[12px] font-black text-primary tracking-widest">VS</span>
            </div>
          </div>

          {/* Radar Charts */}
          <div className="flex border-b border-border bg-card p-6 min-h-[400px]">
            {selectedPlayers.length === 2 && (
              <CompareRadarChart 
                p1={selectedPlayers[0].computed!} 
                p2={selectedPlayers[1].computed!} 
                maxStats={maxStats} 
              />
            )}
          </div>

          {/* Winner Summary */}
          {(() => {
            const p1Stats = selectedPlayers[0].stats;
            const p2Stats = selectedPlayers[1].stats;
            const p1 = selectedPlayers[0].player;
            const p2 = selectedPlayers[1].player;

            const p1Leading = p1Stats.points >= p2Stats.points;
            const winner = p1Leading ? p1 : p2;
            const leaderColor = p1Leading ? '#3b82f6' : '#ef4444';

            return (
              <div className="px-6 md:px-8 py-8 border-b border-border bg-card/30">
                <div 
                  className="rounded-3xl border p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 max-w-3xl mx-auto transition-all"
                  style={{ 
                    borderColor: `${leaderColor}40`, 
                    backgroundColor: `${leaderColor}08`,
                    boxShadow: `0 10px 40px ${leaderColor}15` 
                  }}
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${leaderColor}20` }}>
                    <span className="text-3xl">🏆</span>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[11px] font-black tracking-widest mb-1" style={{ color: leaderColor }}>PERFORMANCE ANALYSIS</p>
                    <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2 uppercase leading-none">{winner.name} IS LEADING</h2>
                    <p className="text-sm text-muted-foreground font-medium">
                      Based on per-match statistics (Win Rate, Goals per Match, Goals Conceded, Clean Sheets, and MOTM), <strong className="text-foreground">{winner.name}</strong> currently has the superior overall statistical performance record.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Metrics */}
          <div className="p-6 md:p-8 bg-card">
            <div className="max-w-3xl mx-auto">
              <h4 className="text-center font-heading font-bold text-[20px] mb-6 flex items-center justify-center gap-2">
                Overall Career Comparison
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </h4>
              <div className="bg-muted/10 rounded-2xl border border-border p-2">
                <MetricRow label="Matches Played" value1={selectedPlayers[0].stats.matches} value2={selectedPlayers[1].stats.matches} better="higher" />
                <MetricRow label="Goals Scored" value1={selectedPlayers[0].stats.goals} value2={selectedPlayers[1].stats.goals} better="higher" />
                <MetricRow label="Win Rate" 
                  value1={selectedPlayers[0].stats.matches > 0 ? Math.round((selectedPlayers[0].stats.wins / selectedPlayers[0].stats.matches) * 100) : 0} 
                  value2={selectedPlayers[1].stats.matches > 0 ? Math.round((selectedPlayers[1].stats.wins / selectedPlayers[1].stats.matches) * 100) : 0} 
                  better="higher" />
                <MetricRow label="Wins" value1={selectedPlayers[0].stats.wins} value2={selectedPlayers[1].stats.wins} better="higher" />
                <MetricRow label="Draws" value1={selectedPlayers[0].stats.draws} value2={selectedPlayers[1].stats.draws} better="higher" />
                <MetricRow label="Losses" value1={selectedPlayers[0].stats.losses} value2={selectedPlayers[1].stats.losses} better="lower" />
                <MetricRow label="Goals Conceded" value1={selectedPlayers[0].stats.conceded} value2={selectedPlayers[1].stats.conceded} better="lower" />
                <MetricRow label="Clean Sheets" value1={selectedPlayers[0].stats.cleanSheets} value2={selectedPlayers[1].stats.cleanSheets} better="higher" />
                <MetricRow label="MOTM Awards" value1={selectedPlayers[0].stats.motm} value2={selectedPlayers[1].stats.motm} better="higher" />
                <MetricRow label="Hat-tricks" value1={selectedPlayers[0].stats.hattricks} value2={selectedPlayers[1].stats.hattricks} better="higher" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
