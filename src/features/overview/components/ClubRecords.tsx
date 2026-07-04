import { useMemo } from 'react';
import { Player } from '@/features/players/types';
import { Match } from '@/features/matches/types';
import { MatchEntry } from '@/features/match-entries/types';
import { Avatar } from '@/shared/components';
import { Trophy, Flame, Shield } from 'lucide-react';

interface ClubRecordsProps {
  players: Player[]
  matches: Match[]
  matchEntries: MatchEntry[]
}

export function ClubRecords({ players, matches, matchEntries }: ClubRecordsProps) {

  // 1. Biggest Victory
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
    const oppScore  = Math.min(bestMatch.homeScore || 0, bestMatch.awayScore || 0);
    const opponent  = bestMatch.homeScore === clubScore ? bestMatch.awayTeam : bestMatch.homeTeam;

    return { match: bestMatch, score: `${clubScore} - ${oppScore}`, opponent, diff: maxDiff };
  }, [matches, matchEntries]);

  // 2. Most Goals in a Single Match — supports TIES (multiple players)
  const mostGoalsRecord = useMemo(() => {
    // Find the max single-match goal tally
    let maxGoals = 0;
    for (const e of matchEntries) {
      if ((e.goals || 0) > maxGoals) maxGoals = e.goals || 0;
    }

    if (maxGoals <= 0) return null;

    // Collect ALL entries that share this max
    const topEntries = matchEntries.filter(e => (e.goals || 0) === maxGoals);

    // Map them to player + match info, deduplicate by playerId
    const seen = new Set<string>();
    const results: Array<{
      player: Player;
      goals: number;
      goalsConceded: number;
      date: string;
    }> = [];

    for (const e of topEntries) {
      if (seen.has(e.playerId)) continue;
      seen.add(e.playerId);
      const player = players.find(p => p.id === e.playerId);
      const match  = matches.find(m => m.id === e.matchId);
      if (!player) continue;
      results.push({
        player,
        goals: maxGoals,
        goalsConceded: e.goalsConceded || 0,
        date: match?.date || e.date || '',
      });
    }

    return { maxGoals, holders: results };
  }, [matchEntries, players, matches]);

  if (!biggestVictory && !mostGoalsRecord) return null;

  const isTied = (mostGoalsRecord?.holders.length ?? 0) > 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

      {/* ── Biggest Victory ── */}
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
                <p className="text-sm font-semibold text-muted-foreground">
                  vs <span className="text-foreground">{biggestVictory.opponent}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground font-medium">{biggestVictory.match.competition}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Most Goals in a Match ── */}
      {mostGoalsRecord && mostGoalsRecord.holders.length > 0 && (
        <div className="group relative rounded-3xl p-6 md:p-8 overflow-hidden bg-card border border-border shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform group-hover:scale-110" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-amber-500/80">
                Most Goals in a Match
              </h3>
              {/* Tie badge */}
              {isTied && (
                <span className="ml-auto text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/20">
                  Shared Record
                </span>
              )}
            </div>

            {/* Record number */}
            <p className="font-heading font-black text-4xl md:text-5xl text-amber-500 tracking-tighter mb-4">
              {mostGoalsRecord.maxGoals}
              <span className="text-base text-amber-500/60 ml-2 uppercase tracking-widest font-bold">Goals</span>
            </p>

            {/* All holders */}
            <div className={`flex flex-col gap-3 ${isTied ? 'divide-y divide-border' : ''}`}>
              {mostGoalsRecord.holders.map(({ player, goalsConceded, date }) => (
                <div key={player.id} className="flex items-center gap-4 pt-2 first:pt-0">
                  <Avatar
                    src={player.profileImageUrl}
                    name={player.name}
                    size={isTied ? 44 : 72}
                    className="ring-2 ring-amber-500/30 shadow-md shrink-0 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="min-w-0">
                    <h4 className={`font-heading font-black text-foreground truncate ${isTied ? 'text-base' : 'text-2xl'}`}>
                      {player.name}
                    </h4>
                    <div className="flex items-center gap-3 flex-wrap mt-0.5">
                      {/* Goals Conceded in that match */}
                      <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                        <Shield className="w-3 h-3" />
                        {goalsConceded} conceded
                      </span>
                      {date && (
                        <span className="text-[10px] text-muted-foreground font-medium bg-muted/50 px-2 py-0.5 rounded-md">
                          {date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
