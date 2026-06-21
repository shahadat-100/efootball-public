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
      </div>

      <div className="flex items-center gap-2 mb-8 bg-muted/30 p-1.5 rounded-xl w-max">
        <button
          onClick={() => setActiveTab('points')}
          className={cn(
            "px-5 py-2 text-sm font-bold rounded-lg transition-all",
            activeTab === 'points'
              ? "bg-background text-foreground shadow-sm ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          Points
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={cn(
            "px-5 py-2 text-sm font-bold rounded-lg transition-all",
            activeTab === 'goals'
              ? "bg-background text-foreground shadow-sm ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          Goals
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
