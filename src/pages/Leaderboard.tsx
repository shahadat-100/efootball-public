import { useState } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { PointsLeaderboard } from '@/features/overview/components/PointsLeaderboard';
import { GoalsLeaderboard } from '@/features/overview/components/GoalsLeaderboard';
import { cn } from '@/shared/lib/cn';

export function Leaderboard() {
  const { players, matchEntries, seasons, playerSeasonStats } = useFootballStore();
  const [activeTab, setActiveTab] = useState<'points' | 'goals'>('points');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 md:mb-10 flex flex-col gap-2">
        <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight flex items-center gap-3">
          <span className="text-amber-500">🏆</span> Leaderboard
        </h1>
        <p className="text-muted-foreground text-sm md:text-base font-medium max-w-2xl">
          Comprehensive rankings of all players across weekly, monthly, and overall timeframes.
        </p>

        {/* Scoring formula hint */}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {activeTab === 'points' ? (
            <>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mr-1">Points formula:</span>
              {[
                { label: 'Win', value: '+10', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
                { label: 'Draw', value: '+5', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
                { label: 'Loss', value: '-3', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
                { label: 'GF', value: '+1', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
                { label: 'GC', value: '-1', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
                { label: '👑 MOTM', value: '+4', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
                { label: '⚽ HT', value: '+1 Per HT', color: 'text-violet-600 bg-violet-500/10 border-violet-500/20' },
              ].map(({ label, value, color }) => (
                <span key={label} className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${color}`}>
                  {label} <span className="opacity-70">{value}</span>
                </span>
              ))}
            </>
          ) : (
            <>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mr-1">Ranked by:</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border text-red-600 bg-red-500/10 border-red-500/20">
                ⚽ Total Goals scored
              </span>
              <span className="text-[10px] text-muted-foreground/50 ml-1">· all other stats shown for context</span>
            </>
          )}
        </div>
      </div>


      {/* Points / Goals switcher */}
      <div className="flex items-center gap-2 mb-8 bg-muted/30 p-1.5 rounded-xl border border-border w-max">
        <button
          onClick={() => setActiveTab('points')}
          className={cn(
            "px-6 py-2.5 text-sm font-bold uppercase tracking-wider rounded-lg transition-all",
            activeTab === 'points'
              ? "bg-primary text-primary-foreground shadow-md scale-105"
              : "text-muted-foreground hover:text-foreground hover:bg-background/80"
          )}
        >
          🎯 Points
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={cn(
            "px-6 py-2.5 text-sm font-bold uppercase tracking-wider rounded-lg transition-all",
            activeTab === 'goals'
              ? "bg-primary text-primary-foreground shadow-md scale-105"
              : "text-muted-foreground hover:text-foreground hover:bg-background/80"
          )}
        >
          ⚽ Goals
        </button>
      </div>

      {activeTab === 'points' ? (
        <PointsLeaderboard
          players={players}
          matchEntries={matchEntries}
          seasons={seasons}
          playerSeasonStats={playerSeasonStats}
        />
      ) : (
        <GoalsLeaderboard
          players={players}
          matchEntries={matchEntries}
          seasons={seasons}
          playerSeasonStats={playerSeasonStats}
        />
      )}
    </div>
  );
}
