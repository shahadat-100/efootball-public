import { useState, useMemo, useEffect } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Match } from '@/features/matches/types';
import { Button, Input, Modal, Badge } from '@/shared/components';
import { fuzzyFilter } from '@/shared/lib/utils';
import { CalendarDays, Search, Shield, Swords, Trophy, X } from 'lucide-react';
import { HOME_TEAM, RESULT_BADGE, STATUS_BADGE } from '@/shared/lib/constants';
import { cn } from '@/shared/lib/cn';

type MatchResult = 'win' | 'draw' | 'loss';

function formatDateLabel(dateStr: string): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const matchDate = new Date(dateStr);
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) return 'TODAY';
  if (dateStr === yesterdayStr) return 'YESTERDAY';
  
  return matchDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

function sortMatchesByDateDesc(a: Match, b: Match) {
  const aStamp = `${a.date || ''} ${a.time || ''}`;
  const bStamp = `${b.date || ''} ${b.time || ''}`;
  return bStamp.localeCompare(aStamp);
}

function isClubTeam(team?: string) {
  const value = team?.toLowerCase() || '';
  return team === HOME_TEAM || value.includes('elite') || value.includes('enigmatic');
}

function getOpponentName(match: Match) {
  if (isClubTeam(match.homeTeam) && !isClubTeam(match.awayTeam)) return match.awayTeam;
  if (isClubTeam(match.awayTeam) && !isClubTeam(match.homeTeam)) return match.homeTeam;
  return match.awayTeam || match.homeTeam || 'Opponent';
}

function getClubResult(match: Match, matchResultsMap: Map<string, string>): MatchResult | undefined {
  if (match.status !== 'upcoming' && match.homeScore != null && match.awayScore != null) {
    const clubIsHome = isClubTeam(match.homeTeam);
    const clubIsAway = isClubTeam(match.awayTeam);

    if (clubIsHome) {
      if (match.homeScore > match.awayScore) return 'win';
      if (match.homeScore < match.awayScore) return 'loss';
      return 'draw';
    }

    if (clubIsAway) {
      if (match.awayScore > match.homeScore) return 'win';
      if (match.awayScore < match.homeScore) return 'loss';
      return 'draw';
    }
  }

  const storedResult = matchResultsMap.get(match.id);
  if (storedResult === 'win' || storedResult === 'draw' || storedResult === 'loss') return storedResult;

  return undefined;
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function Matches() {
  const { matches, matchEntries, fetchMatches, fetchMatchEntries } = useFootballStore();
  const [modal, setModal] = useState<{ type: 'info' } | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const PAGE_SIZE = 50;

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchMatches(),
        fetchMatchEntries(), // since match results rely on it
      ]);
      setIsLoading(false);
    };
    load();
  }, [fetchMatches, fetchMatchEntries]);

  const visibleMatches = matches.filter(m => m.competition !== 'Bulk Season');
  const filtered = fuzzyFilter(visibleMatches, search, ['homeTeam', 'awayTeam', 'competition'])
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Group paginated matches by date
  const groupedMatches = useMemo(() => {
    const groups: { date: string; label: string; matches: typeof paginated }[] = [];
    paginated.forEach(m => {
      const existing = groups.find(g => g.date === m.date);
      if (existing) {
        existing.matches.push(m);
      } else {
        groups.push({ date: m.date, label: formatDateLabel(m.date), matches: [m] });
      }
    });
    return groups;
  }, [paginated]);

  // Build result map from entries
  const matchResultsMap = useMemo(() => {
    const map = new Map<string, string>();
    matchEntries.forEach(e => {
      if (e.matchId && !map.has(e.matchId) && e.result) {
        map.set(e.matchId, e.result);
      }
    });
    return map;
  }, [matchEntries]);

  const selectedH2H = useMemo(() => {
    if (!selectedMatch) return null;

    const opponent = getOpponentName(selectedMatch);
    const opponentKey = opponent.toLowerCase();
    const opponentMatches = visibleMatches
      .filter(m => getOpponentName(m).toLowerCase() === opponentKey)
      .sort(sortMatchesByDateDesc);

    const playedMatches = opponentMatches.filter(m => getClubResult(m, matchResultsMap));
    const record = playedMatches.reduce(
      (acc, match) => {
        const result = getClubResult(match, matchResultsMap);
        if (result === 'win') acc.wins += 1;
        if (result === 'draw') acc.draws += 1;
        if (result === 'loss') acc.losses += 1;
        return acc;
      },
      { wins: 0, draws: 0, losses: 0 }
    );

    return {
      opponent,
      matches: playedMatches,
      recent: playedMatches.slice(0, 5),
      ...record,
    };
  }, [matchResultsMap, selectedMatch, visibleMatches]);

  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 gap-4 animate-pulse">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-muted rounded-md" />
            <div className="h-4 w-28 bg-muted rounded-md" />
          </div>
          <div className="flex gap-3">
            <div className="h-9 w-44 bg-muted rounded-md" />
            <div className="h-9 w-28 bg-muted rounded-md" />
          </div>
        </div>
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center gap-6 animate-pulse">
              <div className="flex-1 flex flex-col items-center sm:items-end space-y-1">
                <div className="h-4 w-24 bg-muted rounded-md" />
                <div className="h-3 w-12 bg-muted rounded-md" />
              </div>
              <div className="flex-shrink-0 text-center px-4 border-x border-border/50 min-w-[120px] flex flex-col items-center space-y-2">
                <div className="h-6 w-16 bg-muted rounded-md" />
                <div className="h-4 w-12 bg-muted rounded-md" />
                <div className="h-3 w-20 bg-muted rounded-md" />
              </div>
              <div className="flex-1 flex flex-col items-center sm:items-start space-y-1">
                <div className="h-4 w-24 bg-muted rounded-md" />
                <div className="h-3 w-12 bg-muted rounded-md" />
              </div>
              <div className="flex gap-2 items-center sm:ml-auto w-full sm:w-auto justify-center sm:justify-end border-t sm:border-none border-border pt-4 sm:pt-0 mt-2 sm:mt-0">
                <div className="h-6 w-20 bg-muted rounded-md" />
                <div className="h-6 w-14 bg-muted rounded-md" />
                <div className="h-6 w-8 bg-muted rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {modal?.type === 'info' && (
        <Modal title="Generated Match" onClose={() => setModal(null)} isOpen>
          <div className="p-4">
            <p className="text-[14px] text-foreground mb-4">
              This match was automatically generated from **bulk season data**. 
            </p>
            <p className="text-[13px] text-muted-foreground mb-6">
              To correct any errors, please update the **Weekly Stats** in the player's profile. 
              The system will then automatically regenerate the match history to match your changes.
            </p>
            <div className="flex justify-end">
              <Button onClick={() => setModal(null)}>I understand</Button>
            </div>
          </div>
        </Modal>
      )}

      {selectedMatch && selectedH2H && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/70 backdrop-blur-sm" onClick={() => setSelectedMatch(null)}>
          <aside
            className="h-full w-full max-w-md bg-card border-l border-border shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary mb-2">
                    <Swords className="w-4 h-4" />
                    Head to Head
                  </div>
                  <h3 className="font-heading text-[30px] font-bold leading-none">{selectedH2H.opponent}</h3>
                  <p className="text-[13px] text-muted-foreground mt-2">
                    {selectedH2H.matches.length} previous matches against this opponent
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedMatch(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
                  <p className="font-heading text-[30px] font-bold text-emerald-600 leading-none">{selectedH2H.wins}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mt-2">Wins</p>
                </div>
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-center">
                  <p className="font-heading text-[30px] font-bold text-amber-600 leading-none">{selectedH2H.draws}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mt-2">Draws</p>
                </div>
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center">
                  <p className="font-heading text-[30px] font-bold text-red-600 leading-none">{selectedH2H.losses}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-700 mt-2">Losses</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/25 p-4">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    <h4 className="font-bold text-[14px]">Recent 5 Results</h4>
                  </div>
                  <Badge className="bg-card text-muted-foreground border-border">{selectedH2H.wins}W {selectedH2H.draws}D {selectedH2H.losses}L</Badge>
                </div>

                {selectedH2H.recent.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedH2H.recent.map(match => {
                      const result = getClubResult(match, matchResultsMap);
                      const badge = result ? RESULT_BADGE[result] : STATUS_BADGE.finished;

                      return (
                        <button
                          key={match.id}
                          className="w-full rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                          onClick={() => setSelectedMatch(match)}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-bold">{match.homeTeam} vs {match.awayTeam}</p>
                              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <CalendarDays className="w-3.5 h-3.5" />
                                {formatShortDate(match.date)}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-heading text-[22px] font-bold leading-none">{match.homeScore} - {match.awayScore}</p>
                              <Badge bg={badge.bg} c={badge.c} className="mt-2 capitalize">{result}</Badge>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[13px] text-muted-foreground">No completed H2H matches yet.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="font-heading font-bold text-[28px] tracking-wide mb-1">Matches</h2>
          <p className="text-muted-foreground text-[13px] font-medium">{visibleMatches.length} matches recorded</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search matches..." 
              className="pl-9 w-full sm:w-[220px]"
            />
          </div>
        </div>
      </div>

      {/* Grouped matches */}
      <div className="space-y-6">
        {groupedMatches.map(group => (
          <div key={group.date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 mb-3">
              <span className={cn(
                "text-[11px] font-black tracking-widest uppercase px-3 py-1 rounded-lg",
                group.label === 'TODAY' ? 'bg-primary/10 text-primary' :
                group.label === 'YESTERDAY' ? 'bg-amber-500/10 text-amber-600' :
                'bg-muted text-muted-foreground'
              )}>
                {group.label}
              </span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            <div className="space-y-3">
              {group.matches.map(m => {
                const sb = STATUS_BADGE[m.status as keyof typeof STATUS_BADGE] ?? STATUS_BADGE.finished;
                const isElitesAway = isClubTeam(m.awayTeam);
                const result = getClubResult(m, matchResultsMap);
                const resultBadge = result ? RESULT_BADGE[result] : null;
                const resultTone =
                  result === 'win' ? 'from-emerald-500 to-emerald-600 text-emerald-700 bg-emerald-500/10 border-emerald-500/25' :
                  result === 'loss' ? 'from-red-500 to-red-600 text-red-700 bg-red-500/10 border-red-500/25' :
                  result === 'draw' ? 'from-amber-500 to-amber-600 text-amber-700 bg-amber-500/10 border-amber-500/25' :
                  'from-zinc-300 to-zinc-400 text-muted-foreground bg-muted/40 border-border';
                const scoreText = m.status !== 'upcoming' ? `${m.homeScore ?? '-'}:${m.awayScore ?? '-'}` : 'VS';

                return (
                  <div
                    key={m.id} 
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedMatch(m)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedMatch(m);
                      }
                    }}
                    className={cn(
                      "group relative w-full overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/30",
                      result === 'win' ? 'border-emerald-500/25' :
                      result === 'loss' ? 'border-red-500/25' :
                      result === 'draw' ? 'border-amber-500/25' :
                      'border-border'
                    )}
                  >
                    <div className={cn("absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b", resultTone)} />

                    <div className="px-4 py-3 sm:px-5 sm:py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <Badge className="bg-muted text-muted-foreground border border-border/50 font-medium">
                            <Shield className="w-3 h-3 mr-1" />
                            {m.competition}
                          </Badge>
                          <Badge bg={sb.bg} c={sb.c} className="capitalize">{m.status}</Badge>
                          {resultBadge && <Badge bg={resultBadge.bg} c={resultBadge.c} className="capitalize">{result}</Badge>}
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-primary">
                          H2H Details
                        </span>
                      </div>

                      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 pt-4">
                        <div className="min-w-0 text-right">
                          <p className="truncate text-[15px] font-black leading-tight text-foreground sm:text-[17px]">{m.homeTeam}</p>
                          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Home</p>
                        </div>

                        <div className="flex min-w-[116px] flex-col items-center">
                          <div className={cn("h-1 w-16 rounded-full bg-gradient-to-r", resultTone)} />
                          <p className={cn(
                            "font-heading text-[42px] font-bold leading-none tracking-wide text-foreground tabular-nums sm:text-[52px]",
                            m.status === 'upcoming' && "text-muted-foreground"
                          )}>
                            {scoreText}
                          </p>
                          <div className="mt-1 h-1 w-16 rounded-full bg-border" />
                        </div>

                        <div className="flex min-w-0 items-center gap-2 text-left">
                          {isElitesAway && (
                            <img src="/images/club-logo.jpg" alt="TEE" className="h-9 w-9 shrink-0 rounded-full object-cover shadow-sm ring-1 ring-border" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-black leading-tight text-foreground sm:text-[17px]">{m.awayTeam}</p>
                            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Away</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
                        <p className="text-[12px] font-medium text-muted-foreground">Click to view opponent history and recent form</p>
                        {m.id.startsWith('bulk-') && (
                          <button 
                            onClick={e => {
                              e.stopPropagation();
                              setModal({ type: 'info' });
                            }}
                            className="shrink-0 text-[11px] text-muted-foreground font-medium px-2.5 py-1 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
                          >
                            Generated
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl bg-card/50">
            <span className="text-4xl mb-3 block">⚽</span>
            <p className="text-muted-foreground text-[14px] font-medium">No matches found — the pitch awaits!</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 bg-card border border-border p-4 rounded-2xl shadow-sm">
          <p className="text-[12px] text-muted-foreground font-medium">
            Showing {(page-1)*PAGE_SIZE + 1} to {Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length} matches
          </p>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0,0); }}
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
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0,0); }}
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
