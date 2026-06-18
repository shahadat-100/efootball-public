import { useFootballStore } from '@/store/footballStore';
import { PointsLeaderboard } from '@/features/overview/components/PointsLeaderboard';

export function Leaderboard() {
  const { players, matchEntries, seasons, playerSeasonStats } = useFootballStore();

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

      <PointsLeaderboard
        players={players}
        matchEntries={matchEntries}
        seasons={seasons}
        playerSeasonStats={playerSeasonStats}
      />
    </div>
  );
}
