import { useState, useEffect } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Avatar, Badge } from '@/shared/components';
import { Award, Calendar, ChevronRight, Sparkles } from 'lucide-react';

export function HallOfFame() {
  const { 
    hallOfFame, 
    players, 
    fetchHallOfFame
  } = useFootballStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchHallOfFame();
      setIsLoading(false);
    };
    load();
  }, [fetchHallOfFame]);

  const getPlayer = (id: string) => players.find(p => p.id === id);

  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-8 gap-4 border-b border-border/40 pb-6 animate-pulse">
          <div className="space-y-2">
            <div className="h-7 w-40 bg-muted rounded-md" />
            <div className="h-4 w-72 bg-muted rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6 space-y-5 animate-pulse">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded-md" />
                    <div className="h-3 w-14 bg-muted rounded-md" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-20 bg-muted rounded-full" />
                  <div className="h-5 w-16 bg-muted rounded-full" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-36 bg-muted rounded-md" />
                <div className="h-20 bg-muted rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-8 gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            <h2 className="font-heading font-bold text-[28px] tracking-wide">Hall of Fame</h2>
          </div>
          <p className="text-muted-foreground text-[13px] font-medium">
            Recognizing the exceptional records and outstanding achievements of the Enigmatic Elites
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
        {hallOfFame.map(entry => {
          const player = getPlayer(entry.playerId);
          return (
            <div 
              key={entry.id}
              className="bg-card border border-border/60 hover:border-amber-500/40 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group card-hover-lift"
            >
              {/* Background Glow */}
              <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:from-amber-500/20 transition-all"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar name={player?.name ?? 'Legend'} size={52} src={player?.profileImageUrl} className="ring-2 ring-amber-500/20 ring-offset-2 ring-offset-card shadow-lg" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-md flex items-center justify-center shadow-md">
                        <Award size={11} className="text-amber-950" />
                      </div>
                    </div>
                    <div>
                      <p className="font-heading font-bold text-[18px] text-foreground leading-tight tracking-wide">{player?.name ?? 'Unknown Legend'}</p>
                      <p className="text-muted-foreground text-[11px] mt-0.5 font-bold">👕 {player?.jerseyNumber ?? '—'}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge bg="#78350f" c="#fcd34d" className="border border-amber-500/20 font-bold tracking-wider text-[10px] px-2.5 py-1 flex items-center gap-1 shadow-sm">
                      <Award size={11} className="shrink-0" />
                      {entry.category}
                    </Badge>
                    <Badge bg="#1a1a1a" c="#e5e5e5" className="border border-border/50 text-[10px] font-mono flex items-center gap-1">
                      <Calendar size={11} className="shrink-0" />
                      {entry.seasonText}
                    </Badge>
                  </div>
                </div>

                {/* Subtitle & Descriptions */}
                <div className="mb-4">
                  <h4 className="text-[13px] font-bold text-amber-500 mb-2 flex items-center gap-1.5">
                    <ChevronRight size={14} className="text-amber-500" />
                    {entry.subTitle}
                  </h4>
                  <p className="text-[12.5px] leading-relaxed text-muted-foreground bg-muted/30 p-4 rounded-xl border border-border/30 font-medium">
                    {entry.descriptions}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {hallOfFame.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-2xl bg-card/50 flex flex-col items-center justify-center">
            <Award className="w-12 h-12 text-amber-400/40 mb-3 animate-float" />
            <p className="text-muted-foreground text-[14px] font-medium">No one inducted yet — greatness awaits! 🏆</p>
          </div>
        )}
      </div>
    </div>
  );
}
