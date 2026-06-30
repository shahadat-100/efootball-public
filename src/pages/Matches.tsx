import { useState, useMemo, useEffect } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Match } from '@/features/matches/types';
import { Button, Input, Modal, Badge } from '@/shared/components';
import { fuzzyFilter } from '@/shared/lib/utils';
import { Search, Swords, TrendingUp, TrendingDown, Minus, Trophy, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { STATUS_BADGE } from '@/shared/lib/constants';
import { cn } from '@/shared/lib/cn';
import { HOME_TEAM } from '@/shared/lib/constants';

// ── Types & Helpers ──────────────────────────────────────────────

type MatchResult = 'win' | 'draw' | 'loss';

function formatDateLabel(dateStr: string): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  if (dateStr === todayStr) return 'TODAY';
  if (dateStr === yesterdayStr) return 'YESTERDAY';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function isClubTeam(name?: string | null): boolean {
  const n = name?.toLowerCase() ?? '';
  return n.includes('elite') || n.includes('enigmatic');
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
  const stored = matchResultsMap.get(match.id);
  if (stored === 'win' || stored === 'draw' || stored === 'loss') return stored;
  return undefined;
}

function getClubGoalDiff(match: Match): number {
  if (match.homeScore == null || match.awayScore == null) return 0;
  if (isClubTeam(match.homeTeam)) return match.homeScore - match.awayScore;
  if (isClubTeam(match.awayTeam)) return match.awayScore - match.homeScore;
  return 0;
}

function stringToHsl(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 55%, 38%)`;
}

function getInitials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

// ── Sub-components ───────────────────────────────────────────────

function TeamAvatar({ name, isElites, size = 'md' }: { name: string; isElites: boolean; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-8 h-8 text-[11px]' : 'w-11 h-11 text-[13px]';
  if (isElites) {
    return (
      <img src="/images/club-logo.jpg" alt="TEE"
        className={cn(cls, 'rounded-full object-cover shadow-md ring-2 ring-primary/30 flex-shrink-0')} />
    );
  }
  return (
    <div className={cn(cls, 'rounded-full flex items-center justify-center font-black text-white flex-shrink-0 shadow-md ring-2 ring-white/10')}
      style={{ background: stringToHsl(name) }}>
      {getInitials(name)}
    </div>
  );
}

// ── Stats Strip ──────────────────────────────────────────────────

interface StatsStripProps {
  matches: Match[];
  matchResultsMap: Map<string, string>;
}

function StatsStrip({ matches, matchResultsMap }: StatsStripProps) {
  const finished = matches.filter(m => m.status !== 'upcoming');

  const { wins, draws, losses } = useMemo(() => {
    let wins = 0, draws = 0, losses = 0;
    finished.forEach(m => {
      const r = getClubResult(m, matchResultsMap);
      if (r === 'win') wins++;
      else if (r === 'draw') draws++;
      else if (r === 'loss') losses++;
    });
    return { wins, draws, losses };
  }, [finished, matchResultsMap]);

  const total = wins + draws + losses;
  const winPct = total > 0 ? Math.round((wins / total) * 100) : 0;

  // Biggest Win
  const biggestWin = useMemo(() => {
    let best: Match | null = null;
    let bestDiff = -1;
    finished.forEach(m => {
      const r = getClubResult(m, matchResultsMap);
      if (r === 'win') {
        const diff = getClubGoalDiff(m);
        if (diff > bestDiff) { bestDiff = diff; best = m; }
      }
    });
    return best as Match | null;
  }, [finished, matchResultsMap]);

  const biggestWinScore = biggestWin
    ? (isClubTeam(biggestWin.homeTeam)
        ? `${biggestWin.homeScore}–${biggestWin.awayScore}`
        : `${biggestWin.awayScore}–${biggestWin.homeScore}`)
    : null;

  const biggestWinOpponent = biggestWin
    ? (isClubTeam(biggestWin.homeTeam) ? biggestWin.awayTeam : biggestWin.homeTeam)
    : null;

  const stats = [
    { label: 'Wins', value: wins, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Draws', value: draws, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Win Rate', value: `${winPct}%`, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
    { label: 'Played', value: total, color: 'text-foreground', bg: 'bg-muted/60 border-border' },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
      {stats.map(({ label, value, color, bg }) => (
        <div key={label} className={cn('rounded-2xl border px-4 py-3 text-center', bg)}>
          <p className={cn('text-[22px] font-black leading-none', color)}>{value}</p>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">{label}</p>
        </div>
      ))}
      {/* Biggest Win card */}
      {biggestWin && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 flex items-center gap-3 col-span-2 sm:col-span-4 lg:col-span-1">
          <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest">Biggest Win</p>
            <p className="text-[15px] font-black text-amber-500 leading-tight">{biggestWinScore}</p>
            <p className="text-[11px] text-muted-foreground truncate">vs {biggestWinOpponent}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Top Beaten Opponents ─────────────────────────────────────────

interface TopBeatenOpponentsProps {
  matches: Match[];
  matchResultsMap: Map<string, string>;
  onOpponentClick: (name: string) => void;
}

function TopBeatenOpponents({ matches, matchResultsMap, onOpponentClick }: TopBeatenOpponentsProps) {
  const [expanded, setExpanded] = useState(false);

  const opponentWins = useMemo(() => {
    const map = new Map<string, { wins: number; played: number }>();
    matches.forEach(m => {
      const r = getClubResult(m, matchResultsMap);
      const opponent = isClubTeam(m.homeTeam) ? m.awayTeam : m.homeTeam;
      if (!opponent || isClubTeam(opponent)) return;
      if (!map.has(opponent)) map.set(opponent, { wins: 0, played: 0 });
      const entry = map.get(opponent)!;
      entry.played++;
      if (r === 'win') entry.wins++;
    });
    return Array.from(map.entries())
      .filter(([, v]) => v.wins > 0)
      .sort((a, b) => b[1].wins - a[1].wins || b[1].played - a[1].played)
      .slice(0, 10)
      .map(([name, stats]) => ({ name, ...stats }));
  }, [matches, matchResultsMap]);

  if (opponentWins.length === 0) return null;

  const maxWins = opponentWins[0].wins;
  const visibleList = expanded ? opponentWins : opponentWins.slice(0, 5);

  return (
    <div className="mb-8 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50">
        <Flame className="w-4 h-4 text-orange-500" />
        <h3 className="font-bold text-[14px]">Most Beaten Opponents</h3>
        <span className="ml-auto text-[11px] text-muted-foreground font-medium">All time wins</span>
      </div>

      <div className="p-4 space-y-2">
        {visibleList.map((opp, i) => (
          <button
            key={opp.name}
            onClick={() => onOpponentClick(opp.name)}
            className="w-full flex items-center gap-3 group hover:bg-muted/50 rounded-xl px-2 py-1.5 transition-colors"
          >
            {/* Rank */}
            <span className={cn(
              'text-[12px] font-black w-5 text-center flex-shrink-0',
              i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-600' : 'text-muted-foreground'
            )}>
              {i + 1}
            </span>

            {/* Avatar */}
            <TeamAvatar name={opp.name} isElites={false} size="sm" />

            {/* Name */}
            <span className="text-[13px] font-semibold flex-1 text-left truncate group-hover:text-primary transition-colors">
              {opp.name}
            </span>

            {/* Bar */}
            <div className="hidden sm:flex items-center gap-2 w-[120px] flex-shrink-0">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${(opp.wins / maxWins) * 100}%` }}
                />
              </div>
            </div>

            {/* Win count */}
            <span className="text-[13px] font-black text-emerald-500 flex-shrink-0 w-14 text-right">
              {opp.wins}W
              <span className="text-[10px] text-muted-foreground font-medium ml-1">/ {opp.played}</span>
            </span>

            {/* H2H arrow hint */}
            <Swords className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary flex-shrink-0 transition-colors" />
          </button>
        ))}
      </div>

      {opponentWins.length > 5 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full py-3 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-muted-foreground hover:text-foreground border-t border-border/50 transition-colors"
        >
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Show all {opponentWins.length}</>}
        </button>
      )}
    </div>
  );
}

// ── H2H Modal ────────────────────────────────────────────────────

interface H2HModalProps {
  opponent: string;
  matches: Match[];
  matchResultsMap: Map<string, string>;
  onClose: () => void;
}

function H2HModal({ opponent, matches, matchResultsMap, onClose }: H2HModalProps) {
  const h2hMatches = useMemo(() =>
    matches
      .filter(m =>
        m.awayTeam?.toLowerCase() === opponent.toLowerCase() ||
        m.homeTeam?.toLowerCase() === opponent.toLowerCase()
      )
      .sort((a, b) => b.date.localeCompare(a.date)),
    [matches, opponent]
  );

  const { wins, draws, losses } = useMemo(() => {
    let wins = 0, draws = 0, losses = 0;
    h2hMatches.forEach(m => {
      const r = getClubResult(m, matchResultsMap);
      if (r === 'win') wins++;
      else if (r === 'draw') draws++;
      else if (r === 'loss') losses++;
    });
    return { wins, draws, losses };
  }, [h2hMatches, matchResultsMap]);

  const total = wins + draws + losses;
  const winPct = total > 0 ? Math.round((wins / total) * 100) : 0;
  const recent5 = h2hMatches.filter(m => m.status !== 'upcoming').slice(0, 5);

  return (
    <Modal title="" onClose={onClose} isOpen wide>
      <div className="flex flex-col items-center gap-3 pb-5 border-b border-border/50 -mt-1">
        <div className="flex items-center gap-3">
          <TeamAvatar name={HOME_TEAM} isElites />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] font-black text-muted-foreground tracking-widest uppercase">Head to Head</span>
            <Swords className="w-5 h-5 text-primary" />
          </div>
          <TeamAvatar name={opponent} isElites={false} />
        </div>
        <div>
          <p className="text-center font-bold text-[15px]">{HOME_TEAM}</p>
          <p className="text-center text-[12px] text-muted-foreground">vs {opponent}</p>
        </div>
      </div>

      {h2hMatches.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground text-[13px]">No matches found against this opponent.</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: 'Wins', value: wins, color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: TrendingUp },
              { label: 'Draws', value: draws, color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Minus },
              { label: 'Losses', value: losses, color: 'text-red-500', bg: 'bg-red-500/10', icon: TrendingDown },
            ].map(({ label, value, color, bg, icon: Icon }) => (
              <div key={label} className={cn('rounded-xl p-3 text-center', bg)}>
                <Icon className={cn('w-4 h-4 mx-auto mb-1', color)} />
                <p className={cn('text-[24px] font-black leading-none', color)}>{value}</p>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {total > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5 font-medium">
                <span>{winPct}% Win Rate</span>
                <span>{total} matches played</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: `${(wins / total) * 100}%` }} />
                <div className="bg-amber-500 h-full" style={{ width: `${(draws / total) * 100}%` }} />
                <div className="bg-red-500 h-full" style={{ width: `${(losses / total) * 100}%` }} />
              </div>
            </div>
          )}

          {recent5.length > 0 && (
            <div className="mt-5">
              <p className="text-[11px] font-black text-muted-foreground tracking-widest uppercase mb-3">Recent Encounters</p>
              <div className="space-y-2">
                {recent5.map(m => {
                  const result = getClubResult(m, matchResultsMap);
                  const dot = result === 'win' ? 'bg-emerald-500' : result === 'loss' ? 'bg-red-500' : result === 'draw' ? 'bg-amber-500' : 'bg-muted';
                  return (
                    <div key={m.id} className="flex items-center gap-3 bg-muted/40 rounded-xl px-3 py-2.5">
                      <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', dot)} />
                      <span className="text-[11px] text-muted-foreground flex-shrink-0">{m.date}</span>
                      <span className="text-[12px] font-semibold flex-1 truncate">{m.homeTeam} vs {m.awayTeam}</span>
                      <span className="text-[13px] font-black tabular-nums">{m.homeScore ?? '-'} – {m.awayScore ?? '-'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

// ── Main Page ────────────────────────────────────────────────────

export function Matches() {
  const { matches, matchEntries, fetchMatches, fetchMatchEntries } = useFootballStore();
  const [modal, setModal] = useState<{ type: 'info' } | { type: 'h2h'; opponent: string } | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const PAGE_SIZE = 50;

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchMatches(), fetchMatchEntries()]);
      setIsLoading(false);
    };
    load();
  }, [fetchMatches, fetchMatchEntries]);

  const visibleMatches = matches.filter(m => m.competition !== 'Bulk Season');

  const matchResultsMap = useMemo(() => {
    const map = new Map<string, string>();
    matchEntries.forEach(e => {
      if (e.matchId && !map.has(e.matchId) && e.result) map.set(e.matchId, e.result);
    });
    return map;
  }, [matchEntries]);

  const filtered = fuzzyFilter(visibleMatches, search, ['homeTeam', 'awayTeam', 'competition'])
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const groupedMatches = useMemo(() => {
    const groups: { date: string; label: string; matches: typeof paginated }[] = [];
    paginated.forEach(m => {
      const existing = groups.find(g => g.date === m.date);
      if (existing) existing.matches.push(m);
      else groups.push({ date: m.date, label: formatDateLabel(m.date), matches: [m] });
    });
    return groups;
  }, [paginated]);

  // ── Loading skeleton ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-300 space-y-4">
        <div className="flex justify-between items-center animate-pulse">
          <div className="space-y-2">
            <div className="h-7 w-32 bg-muted rounded-md" />
            <div className="h-4 w-24 bg-muted rounded-md" />
          </div>
          <div className="h-9 w-44 bg-muted rounded-md" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded-2xl" />)}
        </div>
        <div className="h-48 bg-muted rounded-2xl animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 animate-pulse">
            <div className="w-11 h-11 rounded-full bg-muted flex-shrink-0" />
            <div className="flex-1 h-4 bg-muted rounded" />
            <div className="h-8 w-20 bg-muted rounded" />
            <div className="flex-1 h-4 bg-muted rounded" />
            <div className="w-11 h-11 rounded-full bg-muted flex-shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Modals */}
      {modal?.type === 'info' && (
        <Modal title="Generated Match" onClose={() => setModal(null)} isOpen>
          <p className="text-[14px] text-foreground mb-4">
            This match was automatically generated from <strong>bulk season data</strong>.
          </p>
          <p className="text-[13px] text-muted-foreground mb-6">
            To correct any errors, please update the <strong>Weekly Stats</strong> in the player's profile.
          </p>
          <div className="flex justify-end">
            <Button onClick={() => setModal(null)}>I understand</Button>
          </div>
        </Modal>
      )}
      {modal?.type === 'h2h' && (
        <H2HModal opponent={modal.opponent} matches={visibleMatches} matchResultsMap={matchResultsMap} onClose={() => setModal(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="font-heading font-bold text-[28px] tracking-wide mb-1">Matches</h2>
          <p className="text-muted-foreground text-[13px] font-medium">{visibleMatches.length} matches recorded</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search matches..." className="pl-9 w-full sm:w-[240px]" />
        </div>
      </div>

      {/* Stats Strip */}
      {!search && <StatsStrip matches={visibleMatches} matchResultsMap={matchResultsMap} />}

      {/* Top Beaten Opponents */}
      {!search && (
        <TopBeatenOpponents
          matches={visibleMatches}
          matchResultsMap={matchResultsMap}
          onOpponentClick={name => setModal({ type: 'h2h', opponent: name })}
        />
      )}

      {/* Grouped matches */}
      {/* Grouped matches */}
      <div className="space-y-6">
        {groupedMatches.map(group => (
          <div key={group.date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 mb-4 mt-2">
              <span className={cn(
                'text-[11px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg shadow-sm border',
                group.label === 'TODAY' ? 'bg-primary/10 text-primary border-primary/20' :
                group.label === 'YESTERDAY' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                'bg-muted/50 text-muted-foreground border-border/50'
              )}>
                {group.label}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-border/80 to-transparent" />
            </div>

            <div className="space-y-3">
              {group.matches.map(m => {
                const sb = STATUS_BADGE[m.status as keyof typeof STATUS_BADGE] ?? STATUS_BADGE.finished;
                const result = getClubResult(m, matchResultsMap);

                // Premium visual styling based on result
                const isWin = result === 'win';
                const isLoss = result === 'loss';
                const isDraw = result === 'draw';

                const cardGradient = isWin ? 'from-emerald-500/10 via-card to-card' :
                                     isLoss ? 'from-red-500/10 via-card to-card' :
                                     isDraw ? 'from-amber-500/10 via-card to-card' : 'from-muted/30 to-card';
                
                const cardBorder = isWin ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]' :
                                   isLoss ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]' :
                                   isDraw ? 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'border-border/60 shadow-sm';

                const accentColor = isWin ? 'text-emerald-500' : isLoss ? 'text-red-500' : isDraw ? 'text-amber-500' : 'text-muted-foreground';

                return (
                  <div key={m.id} className={cn(
                    'relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-md hover:scale-[1.01] group',
                    cardBorder, 'bg-card'
                  )}>
                    {/* Background Gradient */}
                    <div className={cn("absolute inset-0 bg-gradient-to-r opacity-60", cardGradient)} />
                    
                    {/* Top result accent bar */}
                    <div className={cn(
                      "absolute top-0 left-0 right-0 h-1.5 transition-colors",
                      isWin ? 'bg-emerald-500' : isLoss ? 'bg-red-500' : isDraw ? 'bg-amber-500' : 'bg-muted'
                    )} />

                    <div className="relative z-10">
                      {/* Top info strip */}
                      <div className="flex items-center justify-between px-5 pt-3 pb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                          {m.competition}
                        </span>
                        {m.time && (
                          <span className="text-[10px] font-bold text-muted-foreground/50">
                            {m.time}
                          </span>
                        )}
                      </div>

                      {/* Main row */}
                      <div className="flex items-center gap-2 px-5 py-3">
                        {/* Home Team */}
                        <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
                          <div className="text-right min-w-0">
                            <p className="font-bold text-[14px] sm:text-[16px] leading-tight truncate text-foreground">{m.homeTeam}</p>
                            <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mt-0.5">Home</p>
                          </div>
                          <TeamAvatar name={m.homeTeam ?? ''} isElites={isClubTeam(m.homeTeam)} />
                        </div>

                        {/* Score Box */}
                        <div className="flex-shrink-0 text-center px-4 flex flex-col items-center gap-1.5 min-w-[130px]">
                          <div className="flex items-center justify-center gap-2">
                            <span className={cn(
                              "font-heading font-black text-[28px] sm:text-[34px] leading-none tracking-tight",
                              m.status === 'upcoming' ? "text-muted-foreground/40" : 
                              (m.homeScore ?? 0) > (m.awayScore ?? 0) ? accentColor : "text-foreground"
                            )}>
                              {m.status !== 'upcoming' ? m.homeScore : '-'}
                            </span>
                            <span className="text-[20px] font-bold text-muted-foreground/30 px-1 mb-1">-</span>
                            <span className={cn(
                              "font-heading font-black text-[28px] sm:text-[34px] leading-none tracking-tight",
                              m.status === 'upcoming' ? "text-muted-foreground/40" : 
                              (m.awayScore ?? 0) > (m.homeScore ?? 0) ? accentColor : "text-foreground"
                            )}>
                              {m.status !== 'upcoming' ? m.awayScore : '-'}
                            </span>
                          </div>
                          <Badge bg={sb.bg} c={sb.c} className="shadow-sm">{m.status}</Badge>
                        </div>

                        {/* Away Team */}
                        <div className="flex-1 flex items-center justify-start gap-3 min-w-0">
                          <TeamAvatar name={m.awayTeam ?? ''} isElites={isClubTeam(m.awayTeam)} />
                          <div className="min-w-0">
                            <button
                              className="font-bold text-[14px] sm:text-[16px] leading-tight truncate block text-left hover:text-primary transition-colors focus:outline-none"
                              onClick={() => setModal({ type: 'h2h', opponent: m.awayTeam ?? '' })}
                            >
                              {m.awayTeam}
                            </button>
                            <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mt-0.5">Away</p>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between px-4 pb-2.5 pt-1">
                        <div>
                          {m.id.startsWith('bulk-') && (
                            <button onClick={() => setModal({ type: 'info' })}
                              className="text-[10px] font-bold tracking-wide uppercase text-muted-foreground/80 px-2.5 py-1 bg-muted/40 rounded-lg border border-border/40 hover:bg-muted hover:text-foreground transition-colors">
                              Generated Match
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => setModal({ type: 'h2h', opponent: m.awayTeam ?? '' })}
                          className="flex items-center gap-1.5 text-[11px] font-black tracking-wide uppercase text-foreground/80 px-3 py-1.5 bg-background/50 rounded-lg border border-border/60 hover:bg-muted hover:text-foreground hover:border-primary/50 transition-all shadow-sm group-hover:shadow group-hover:border-primary/30"
                        >
                          <Swords className="w-3.5 h-3.5 text-primary/70" />
                          H2H Record
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-border/60 rounded-3xl bg-card/30">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 shadow-inner">
              <span className="text-3xl">⚽</span>
            </div>
            <h3 className="font-bold text-[18px] text-foreground mb-1">No Matches Found</h3>
            <p className="text-muted-foreground text-[14px] font-medium">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 bg-card border border-border p-4 rounded-2xl shadow-sm">
          <p className="text-[12px] text-muted-foreground font-medium">
            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} matches
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm"
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
              disabled={page === 1}>Previous</Button>
            <div className="flex items-center px-3 text-[12px] font-bold border border-border rounded-lg bg-muted/30">
              Page {page} of {totalPages}
            </div>
            <Button variant="secondary" size="sm"
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
              disabled={page === totalPages}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
