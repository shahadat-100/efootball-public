import { useState } from 'react';
import { ComputedPlayerStats } from '../types';
import { Search, X } from 'lucide-react';
import { Avatar } from '@/shared/components';

interface PlayerSelectModalProps {
  players: ComputedPlayerStats[];
  onSelect: (p: ComputedPlayerStats) => void;
  onClose: () => void;
}

export function PlayerSelectModal({ players, onSelect, onClose }: PlayerSelectModalProps) {
  const [query, setQuery] = useState('');

  const filtered = players.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl flex flex-col h-[80vh] max-h-[600px] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center gap-3 bg-muted/20">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 rounded-full text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              autoFocus
              type="text"
              placeholder="Search players..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No players found
            </div>
          ) : (
            filtered.map(p => (
              <button
                key={p.id}
                onClick={() => onSelect(p)}
                className="w-full text-left p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors flex items-center gap-4 group"
              >
                <div className="relative">
                  <Avatar name={p.name} src={p.imageUrl} size={40} />
                  <div className="absolute -top-1 -left-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[8px] font-black px-1.5 rounded-sm">
                    #{p.rank}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {p.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-bold text-emerald-500">{p.team}</span>
                    <span className="text-muted-foreground text-[10px]">·</span>
                    <span className="text-[10px] text-muted-foreground">👕 {p.jerseyNumber}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
