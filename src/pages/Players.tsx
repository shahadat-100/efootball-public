import { useState, useMemo, useEffect } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { PlayerCard, PlayerDetail } from '@/features/players';
import { Button, Input } from '@/shared/components';
import { fuzzyFilter } from '@/shared/lib/utils';
import { Search, SlidersHorizontal } from 'lucide-react';

export function Players() {
  const { players, playerSeasonStats, fetchPlayers, fetchPlayerSeasonStats } = useFootballStore();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rank' | 'name'>('rank');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const PAGE_SIZE = 24;

  // Lazy load players and stats
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchPlayers(),
        fetchPlayerSeasonStats(),
      ]);
      setIsLoading(false);
    };
    load();
  }, [fetchPlayers, fetchPlayerSeasonStats]);

  // Calculate points and sort players
  const sortedPlayers = useMemo(() => {
    const calcSeasonPoints = (s: any) =>
      (s.wins * 10) + (s.draws * 5) - (s.losses * 3) + s.goals - s.goalsConceded + (s.motmCount * 4) + s.hattricks;

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
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedPlayers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (selectedId) {
    return <PlayerDetail playerId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 gap-4 animate-pulse">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-muted rounded-md" />
            <div className="h-4 w-40 bg-muted rounded-md" />
          </div>
          <div className="flex gap-3">
            <div className="h-9 w-44 bg-muted rounded-md" />
            <div className="h-9 w-28 bg-muted rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted rounded-md" />
                  <div className="h-3 w-16 bg-muted rounded-md" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded-md w-full" />
                <div className="h-3 bg-muted rounded-md w-5/6" />
              </div>
              <div className="flex gap-2 pt-2">
                <div className="h-7 flex-1 bg-muted rounded-md" />
                <div className="h-7 w-12 bg-muted rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
              onChange={e => { setSearch(e.target.value); setPage(1); }} 
              placeholder="Search players..." 
              className="pl-9 w-full sm:w-[220px]"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value as 'rank' | 'name'); setPage(1); }}
              className="text-xs bg-muted border border-border rounded-lg px-3 py-2 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm"
            >
              <option value="rank">Sort by Rank</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedPlayers.map(p => (
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 bg-card border border-border p-4 rounded-2xl shadow-sm">
          <p className="text-[12px] text-muted-foreground font-medium">
            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} players
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center px-3 text-[12px] font-bold border border-border rounded-lg bg-muted/30">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

