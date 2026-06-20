import { useState, useMemo } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { PlayerCard, PlayerDetail } from '@/features/players';
import { Input } from '@/shared/components';
import { fuzzyFilter } from '@/shared/lib/utils';
import { Search, SlidersHorizontal } from 'lucide-react';

export function Players() {
  const { players, playerSeasonStats } = useFootballStore();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rank' | 'name'>('rank');

  if (selectedId) {
    return <PlayerDetail playerId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  // Calculate points and sort players
  const sortedPlayers = useMemo(() => {
    const calcSeasonPoints = (s: any) =>
      (s.wins * 3) + s.draws - s.losses + s.goals - s.goalsConceded + (s.motmCount * 2) + s.hattricks;

    const mapped = players.map(p => {
      const stats = playerSeasonStats.filter(s => s.playerId === p.id);
      const points = stats.reduce((acc, s) => acc + calcSeasonPoints(s), 0);
      return { player: p, points };
    });

    if (sortBy === 'rank') {
      // Sort by points descending (rank)
      mapped.sort((a, b) => b.points - a.points);
    } else if (sortBy === 'name') {
      // Sort alphabetically by name
      mapped.sort((a, b) => a.player.name.localeCompare(b.player.name));
    }

    return mapped.map(x => x.player);
  }, [players, playerSeasonStats, sortBy]);

  const filtered = fuzzyFilter(sortedPlayers, search, ['name']);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="font-bold text-[22px] mb-1">Players</h2>
          <p className="text-muted-foreground text-[13px]">{players.length} registered players</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search players..." 
              className="pl-9 w-full sm:w-[220px]"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'rank' | 'name')}
              className="text-xs bg-muted border border-border rounded-lg px-3 py-2 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm"
            >
              <option value="rank">Sort by Rank</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => (
          <PlayerCard 
            key={p.id} 
            player={p} 
            onView={() => setSelectedId(p.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl">
            <p className="text-muted-foreground text-[14px]">No players found</p>
          </div>
        )}
      </div>
    </div>
  );
}

