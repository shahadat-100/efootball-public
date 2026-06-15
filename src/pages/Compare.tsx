import { useState, useMemo } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { ComputedPlayerStats } from '@/features/compare/types';
import { aggregatePlayerStats, getLarger } from '@/features/compare/utils';
import { CompareRadarChart } from '@/features/compare/components/CompareRadarChart';
import { CompareBarChartsColumn } from '@/features/compare/components/CompareBarChartsColumn';
import { PlayerSelectModal } from '@/features/compare/components/PlayerSelectModal';
import { Avatar } from '@/shared/components';
import { cn } from '@/shared/lib/cn';
import { Plus } from 'lucide-react';

export function Compare() {
  const { players, playerSeasonStats } = useFootballStore();

  const computedPlayers = useMemo(() => {
    return aggregatePlayerStats(players, playerSeasonStats);
  }, [players, playerSeasonStats]);

  const [p1, setP1] = useState<ComputedPlayerStats | null>(null);
  const [p2, setP2] = useState<ComputedPlayerStats | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [selectorTarget, setSelectorTarget] = useState<1 | 2 | null>(null);

  const handleSelect = (p: ComputedPlayerStats) => {
    if (selectorTarget === 1) setP1(p);
    if (selectorTarget === 2) setP2(p);
    setIsComparing(false); // Reset comparison state when player changes
    setSelectorTarget(null);
  };

  const renderSelectorTile = (index: 1 | 2, p: ComputedPlayerStats | null, accentColor: string, accentColorClasses: string) => {
    return (
      <div 
        onClick={() => setSelectorTarget(index)}
        className={cn(
          "relative h-40 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden group",
          p ? `border-${accentColorClasses} bg-card/40` : "border-border/50 bg-card/20 hover:bg-card/40 border-dashed"
        )}
        style={p ? { 
          borderColor: `${accentColor}80`, 
          boxShadow: `0 4px 20px ${accentColor}15, 0 10px 30px ${accentColor}10 inset` 
        } : {}}
      >
        {p ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-tr opacity-10" style={{ backgroundImage: `linear-gradient(to top right, transparent, ${accentColor})` }} />
            
            <div className="absolute top-2 right-2 bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-md tracking-widest z-10">
              RANK #{p.rank}
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="p-1 rounded-full border border-white/10 mb-3 bg-background" style={{ borderColor: `${accentColor}80` }}>
                <Avatar name={p.name} src={p.imageUrl} size={64} />
              </div>
              <h3 className="text-white font-black text-lg tracking-wide leading-none mb-1">{p.short.toUpperCase()}</h3>
              <span className="text-[10px] font-bold text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                {p.team} · #{p.jerseyNumber}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="p-3 rounded-full bg-white/5 border border-white/10 mb-2">
              <Plus className="w-6 h-6" style={{ color: accentColor }} />
            </div>
            <span className="text-[10px] font-black tracking-widest" style={{ color: accentColor }}>SELECT PLAYER</span>
          </div>
        )}
      </div>
    );
  };

  const renderComparison = () => {
    if (!p1 || !p2) return null;

    const m1 = p1.matches || 1;
    const m2 = p2.matches || 1;

    // Leader Summary Logic
    let p1Points = 0, p2Points = 0;
    if ((p1.wins/m1) > (p2.wins/m2)) p1Points++; else if ((p2.wins/m2) > (p1.wins/m1)) p2Points++;
    if ((p1.goals/m1) > (p2.goals/m2)) p1Points++; else if ((p2.goals/m2) > (p1.goals/m1)) p2Points++;
    if ((p1.ga/m1) < (p2.ga/m2)) p1Points++; else if ((p2.ga/m2) < (p1.ga/m1)) p2Points++; // lower is better
    if ((p1.cleansheets/m1) > (p2.cleansheets/m2)) p1Points++; else if ((p2.cleansheets/m2) > (p1.cleansheets/m1)) p2Points++;
    if ((p1.motm/m1) > (p2.motm/m2)) p1Points++; else if ((p2.motm/m2) > (p1.motm/m1)) p2Points++;

    const p1Leading = p1Points >= p2Points;
    const winner = p1Leading ? p1 : p2;
    const leaderColor = p1Leading ? '#3b82f6' : '#ef4444';

    const renderStatRow = (icon: string, label: string, val1Str: string, val2Str: string, winnerFlag: 0|1|2) => (
      <div className="flex items-center gap-4 mb-6">
        <div className={cn("flex-1 text-right text-lg font-black", winnerFlag === 1 ? "text-blue-500 underline decoration-2 underline-offset-4" : "text-blue-500/70")}>
          {val1Str}
        </div>
        <div className="w-32 flex flex-col items-center">
          <span className="text-[10px] font-bold text-muted-foreground tracking-wider mb-1 text-center leading-tight">{label}</span>
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg shadow-sm">
            {icon}
          </div>
        </div>
        <div className={cn("flex-1 text-left text-lg font-black", winnerFlag === 2 ? "text-red-500 underline decoration-2 underline-offset-4" : "text-red-500/70")}>
          {val2Str}
        </div>
      </div>
    );

    const rawStats = [
      { icon: '🏆', label: 'TOTAL WINS', v1: p1.wins, v2: p2.wins, flag: getLarger(p1.wins, p2.wins) },
      { icon: '➖', label: 'TOTAL DRAWS', v1: p1.draws, v2: p2.draws, flag: getLarger(p1.draws, p2.draws) },
      { icon: '✖️', label: 'TOTAL LOSSES', v1: p1.losses, v2: p2.losses, flag: getLarger(p2.losses, p1.losses) }, // lower better
      { icon: '⚽', label: 'TOTAL GOALS', v1: p1.goals, v2: p2.goals, flag: getLarger(p1.goals, p2.goals) },
      { icon: '🥅', label: 'GOALS AGST', v1: p1.ga, v2: p2.ga, flag: getLarger(p2.ga, p1.ga) }, // lower better
      { icon: '🛡️', label: 'CLEAN SHEETS', v1: p1.cleansheets, v2: p2.cleansheets, flag: getLarger(p1.cleansheets, p2.cleansheets) },
      { icon: '🎖️', label: 'MOTM AWARDS', v1: p1.motm, v2: p2.motm, flag: getLarger(p1.motm, p2.motm) },
      { icon: '🔥', label: 'HAT-TRICKS', v1: p1.hattricks, v2: p2.hattricks, flag: getLarger(p1.hattricks, p2.hattricks) },
    ];

    return (
      <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Radar & Bars Row */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-1 h-5 bg-amber-500 rounded-full" />
          <h3 className="text-sm font-black tracking-widest text-foreground">PERFORMANCE ANALYSIS</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-8 bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center justify-center">
            <CompareRadarChart p1={p1} p2={p2} color1="#3b82f6" color2="#ef4444" />
          </div>
          <div className="lg:col-span-4 bg-card border border-border rounded-3xl p-6 shadow-sm">
            <CompareBarChartsColumn
              goalsPerMatch1={p1.goals / m1}
              goalsPerMatch2={p2.goals / m2}
              winRate1={p1.wins / m1}
              winRate2={p2.wins / m2}
              drawRate1={p1.draws / m1}
              drawRate2={p2.draws / m2}
              lossRate1={p1.losses / m1}
              lossRate2={p2.losses / m2}
              csRate1={p1.cleansheets / m1}
              csRate2={p2.cleansheets / m2}
            />
          </div>
        </div>

        {/* Summary Card */}
        <div className="mb-12">
          <div 
            className="rounded-3xl border-2 p-6 md:p-8 flex items-center gap-6"
            style={{ 
              borderColor: leaderColor, 
              backgroundColor: `${leaderColor}15`,
              boxShadow: `0 10px 40px ${leaderColor}20` 
            }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${leaderColor}30` }}>
              <span className="text-3xl">📊</span>
            </div>
            <div>
              <p className="text-[11px] font-black tracking-widest mb-1" style={{ color: leaderColor }}>SUMMARY CARD</p>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase leading-none">{winner.name} LEADING</h2>
              <p className="text-sm text-muted-foreground font-medium">
                {winner.short} shows superior dominance in recent per-match performance metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Performance Rates */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-1 h-5 bg-amber-500 rounded-full" />
          <h3 className="text-sm font-black tracking-widest text-foreground">PERFORMANCE RATES</h3>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 md:p-10 mb-12 shadow-sm">
          {renderStatRow("🕒", "MATCH FREQUENCY", `${p1.matches}`, `${p2.matches}`, getLarger(p1.matches, p2.matches))}
          {renderStatRow("🏆", "WIN RATE", `${(p1.wins/m1*100).toFixed(1)}%`, `${(p2.wins/m2*100).toFixed(1)}%`, getLarger(p1.wins/m1, p2.wins/m2))}
          {renderStatRow("➖", "DRAW RATE", `${(p1.draws/m1*100).toFixed(1)}%`, `${(p2.draws/m2*100).toFixed(1)}%`, getLarger(p1.draws/m1, p2.draws/m2))}
          {renderStatRow("✖️", "LOSS RATE", `${(p1.losses/m1*100).toFixed(1)}%`, `${(p2.losses/m2*100).toFixed(1)}%`, getLarger(p2.losses/m2, p1.losses/m1))}
          {renderStatRow("⚽", "GOALS/MATCH", `${(p1.goals/m1).toFixed(2)}`, `${(p2.goals/m2).toFixed(2)}`, getLarger(p1.goals/m1, p2.goals/m2))}
          {renderStatRow("🥅", "GA/MATCH", `${(p1.ga/m1).toFixed(2)}`, `${(p2.ga/m2).toFixed(2)}`, getLarger(p2.ga/m2, p1.ga/m1))}
          {renderStatRow("🛡️", "CS RATE", `${(p1.cleansheets/m1*100).toFixed(1)}%`, `${(p2.cleansheets/m2*100).toFixed(1)}%`, getLarger(p1.cleansheets/m1, p2.cleansheets/m2))}
          {renderStatRow("🎖️", "MOTM RATE", `${(p1.motm/m1*100).toFixed(1)}%`, `${(p2.motm/m2*100).toFixed(1)}%`, getLarger(p1.motm/m1, p2.motm/m2))}
        </div>

        {/* Raw Stats */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-1 h-5 bg-amber-500 rounded-full" />
          <h3 className="text-sm font-black tracking-widest text-foreground">LIFETIME RAW STATS</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {rawStats.map((s, idx) => (
            <div key={idx} className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-sm flex flex-col items-center text-center">
              <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-3">{s.label}</span>
              <div className="flex items-center justify-between w-full">
                <span className={cn("text-lg font-black", s.flag === 1 ? "text-blue-500 underline decoration-2 underline-offset-4" : "text-blue-500/70")}>{s.v1}</span>
                <span className="text-xl">{s.icon}</span>
                <span className={cn("text-lg font-black", s.flag === 2 ? "text-red-500 underline decoration-2 underline-offset-4" : "text-red-500/70")}>{s.v2}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
      <div className="mb-10">
        <h2 className="font-semibold text-2xl tracking-tight text-foreground mb-2">Performance Battle</h2>
        <p className="text-muted-foreground text-sm">Player Comparison</p>
      </div>

      {/* Selection Area */}
      <div className="flex items-center gap-4 md:gap-6 mb-10">
        <div className="flex-1">
          {renderSelectorTile(1, p1, '#3b82f6', 'blue-500')}
        </div>
        
        {/* VS Bubble */}
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-background border-2 border-border/80 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.15)] relative z-10">
          <span className="text-amber-500 font-black italic text-sm md:text-lg tracking-tighter">VS</span>
        </div>

        <div className="flex-1">
          {renderSelectorTile(2, p2, '#ef4444', 'red-500')}
        </div>
      </div>

      {/* Compare Button */}
      {p1 && p2 && !isComparing && (
        <button 
          onClick={() => setIsComparing(true)}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-amber-950 font-black tracking-widest text-sm hover:from-amber-500 hover:to-amber-500 transition-all shadow-[0_5px_20px_rgba(245,158,11,0.3)] hover:-translate-y-1"
        >
          COMPARE STATS
        </button>
      )}

      {/* Output Content */}
      {isComparing && renderComparison()}

      {/* Modal */}
      {selectorTarget && (
        <PlayerSelectModal 
          players={computedPlayers} 
          onSelect={handleSelect} 
          onClose={() => setSelectorTarget(null)} 
        />
      )}
    </div>
  );
}
