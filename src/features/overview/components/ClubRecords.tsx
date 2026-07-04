import { useMemo } from 'react';
import { Player } from '@/features/players/types';
import { Match } from '@/features/matches/types';
import { MatchEntry } from '@/features/match-entries/types';
import { Avatar } from '@/shared/components';
import { Trophy, Flame } from 'lucide-react';

interface ClubRecordsProps {
  players: Player[];
  matches: Match[];
  matchEntries: MatchEntry[];
}

export function ClubRecords({ players, matches, matchEntries }: ClubRecordsProps) {
  // 1. Calculate Biggest Victory
  const biggestVictory = useMemo(() => {
    const matchResultsMap = new Map<string, string>();
    matchEntries.forEach(e => {
      if (e.matchId && !matchResultsMap.has(e.matchId) && e.result) {
        matchResultsMap.set(e.matchId, e.result);
      }
    });

    let maxDiff = -1;
    let bestMatch: Match | null = null;

    for (const m of matches) {
      const result = matchResultsMap.get(m.id as string);
      if (result === 'win' && m.status === 'finished') {
        const diff = Math.abs((m.homeScore || 0) - (m.awayScore || 0));
        if (diff > maxDiff) {
          maxDiff = diff;
          bestMatch = m;
        }
      }
    }

    if (!bestMatch) return null;

    const clubScore = Math.max(bestMatch.homeScore || 0, bestMatch.awayScore || 0);
    const oppScore = Math.min(bestMatch.homeScore || 0, bestMatch.awayScore || 0);
    const opponent = bestMatch.homeScore === clubScore ? bestMatch.awayTeam : bestMatch.homeTeam;

    return {
      match: bestMatch,
      score: `${clubScore} - ${oppScore}`,
      opponent,
      diff: maxDiff
    };
  }, [matches, matchEntries]);

  // 2. Calculate Most Goals in a Single Match (Player)
  const mostGoalsEntry = useMemo(() => {
    let maxGoals = -1;
    let topEntry: MatchEntry | null = null;

    for (const e of matchEntries) {
      if ((e.goals || 0) > maxGoals) {
        maxGoals = e.goals || 0;
        topEntry = e;
      }
    }

    if (!topEntry || maxGoals <= 0) return null;

    const player = players.find(p => p.id === topEntry!.playerId);
    const match = matches.find(m => m.id === topEntry!.matchId);

    return {
      player,
      entry: topEntry,
      goals: maxGoals,
      date: match?.date || topEntry.date || 'Unknown date'
    };
  }, [matchEntries, players, matches]);

  if (!biggestVictory && !mostGoalsEntry) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Biggest Victory Card */}
      {biggestVictory && (
        <div className="group relative rounded-3xl p-6 md:p-8 overflow-hidden bg-card border border-border shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform group-hover:scale-110" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-emerald-500/80">Biggest Victory</h3>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h4 className="font-heading font-black text-4xl md:text-5xl text-foreground tracking-tighter mb-1">
                  {biggestVictory.score}
                </h4>
                <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  vs <span className="text-foreground">{biggestVictory.opponent}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground font-medium mb-1">
                  {biggestVictory.match.competition}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Most Goals Card */}
      {mostGoalsEntry && mostGoalsEntry.player && (
        <div className="group relative rounded-3xl p-6 md:p-8 overflow-hidden bg-card border border-border shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform group-hover:scale-110" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-amber-500/80">Most Goals in a Match</h3>
              </div>
            </div>
            
            <div className="flex items-center gap-5">
              <Avatar 
                src={mostGoalsEntry.player.profileImageUrl} 
                name={mostGoalsEntry.player.name} 
                size={80} 
                className="ring-4 ring-amber-500/20 shadow-lg group-hover:scale-105 transition-transform duration-300" 
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-heading font-black text-2xl text-foreground truncate mb-1">
                  {mostGoalsEntry.player.name}
                </h4>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-3xl font-black text-amber-500 leading-none">
                    {mostGoalsEntry.goals} <span className="text-sm text-amber-500/70 uppercase tracking-widest">Goals</span>
                  </p>
                  <span className="text-[11px] text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-md">
                    {mostGoalsEntry.date}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
