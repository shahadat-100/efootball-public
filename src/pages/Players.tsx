import { useState } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { PlayerCard, PlayerDetail } from '@/features/players';
import { Input } from '@/shared/components';
import { fuzzyFilter } from '@/shared/lib/utils';
import { Search } from 'lucide-react';

export function Players() {
  const { players } = useFootballStore();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (selectedId) {
    return <PlayerDetail playerId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  const filtered = fuzzyFilter(players, search, ['name']);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="font-bold text-[22px] mb-1">Players</h2>
          <p className="text-muted-foreground text-[13px]">{players.length} registered players</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search players..." 
              className="pl-9 w-full sm:w-[220px]"
            />
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
