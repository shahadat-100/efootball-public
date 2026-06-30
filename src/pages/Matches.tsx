import { useState, useMemo, useEffect } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Match } from '@/features/matches/types';
import { Button, Input, Modal, Badge } from '@/shared/components';
import { fuzzyFilter } from '@/shared/lib/utils';
import { Search, Swords, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { STATUS_BADGE } from '@/shared/lib/constants';
import { cn } from '@/shared/lib/cn';
import { HOME_TEAM } from '@/shared/lib/constants';

// ── Helpers ─────────────────────────────────────────────────────

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
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** True if this team name belongs to The Enigmatic Elite / The Elite */
function isClubTeam(name?: string | null): boolean {
  const n = name?.toLowerCase() ?? '';
  return n.includes('elite') || n.includes('enigmatic');
}

/**
 * Returns the club's result for a match.
 * Priority: score (if available) → stored matchEntry result → undefined.
 */
function getClubResult(
  match: Match,
  matchResultsMap: Map<string, string>
): MatchResult | undefined {
  // 1️⃣ Score takes priority — if both scores exist, calculate from them
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
  // 2️⃣ Fall back to stored result from matchEntries
  const stored = matchResultsMap.get(match.id);
  if (stored === 'win' || stored === 'draw' || stored === 'loss') return stored;
  return undefined;
}

/** Generate a stable HSL color from a string */
function stringToHsl(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 55%, 38%)`;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

// ── Sub-components ───────────────────────────────────────────────

function TeamAvatar({ name, isElites }: { name: string; isElites: boolean }) {
  if (isElites) {
    return (
      <img
        src="/images/club-logo.jpg"
        alt="TEE"
        className="w-11 h-11 rounded-full object-cover shadow-md ring-2 ring-primary/30 flex-shrink-0"
      />
    );
  }
  const bg = stringToHsl(name);
  const initials = getInitials(name);
  return (
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center text-[13px] font-black text-white flex-shrink-0 shadow-md ring-2 ring-white/10"
      style={{ background: bg }}
    >
      {initials}
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
  const h2hMatches = useMemo(
    () =>
      matches
        .filter(
          (m) =>
            m.awayTeam?.toLowerCase() === opponent.toLowerCase() ||
            m.homeTeam?.toLowerCase() === opponent.toLowerCase()
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    [matches, opponent]
  );

  const { wins, draws, losses } = useMemo(() => {
    let wins = 0, draws = 0, losses = 0;
    h2hMatches.forEach((m) => {
      const result = getClubResult(m, matchResultsMap);
      if (result === 'win') wins++;
      else if (result === 'draw') draws++;
      else if (result === 'loss') losses++;
    });
    return { wins, draws, losses };
  }, [h2hMatches, matchResultsMap]);

  const total = wins + draws + losses;
  const winPct = total > 0 ? Math.round((wins / total) * 100) : 0;

  const recent5 = h2hMatches.filter((m) => m.status !== 'upcoming').slice(0, 5);

  return (
    <Modal title="" onClose={onClose} isOpen wide>
      {/* Header */}
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
        <div className="py-10 text-center text-muted-foreground text-[13px]">
          No matches found against this opponent.
        </div>
      ) : (
        <>
          {/* Overall Record */}
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

          {/* Win rate bar */}
          {total > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5 font-medium">
                <span>{winPct}% Win Rate</span>
                <span>{total} matches played</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                <div className="bg-emerald-500 h-full transition-all" style={{ width: `${total > 0 ? (wins / total) * 100 : 0}%` }} />
                <div className="bg-amber-500 h-full transition-all" style={{ width: `${total > 0 ? (draws / total) * 100 : 0}%` }} />
                <div className="bg-red-500 h-full transition-all" style={{ width: `${total > 0 ? (losses / total) * 100 : 0}%` }} />
              </div>
            </div>
          )}

          {/* Recent 5 matches */}
          {recent5.length > 0 && (
            <div className="mt-5">
              <p className="text-[11px] font-black text-muted-foreground tracking-widest uppercase mb-3">Recent Encounters</p>
              <div className="space-y-2">
                {recent5.map((m) => {
                  const result = getClubResult(m, matchResultsMap);
                  const dot =
                    result === 'win'
                      ? 'bg-emerald-500'
                      : result === 'loss'
                      ? 'bg-red-500'
                      : result === 'draw'
                      ? 'bg-amber-500'
                      : 'bg-muted';

                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 bg-muted/40 rounded-xl px-3 py-2.5"
                    >
                      <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', dot)} />
                      <span className="text-[12px] text-muted-foreground flex-shrink-0">{m.date}</span>
                      <span className="text-[12px] font-semibold flex-1 truncate">
                        {m.homeTeam} vs {m.awayTeam}
                      </span>
                      <span className="text-[13px] font-black tabular-nums">
                        {m.homeScore ?? '-'} – {m.awayScore ?? '-'}
                      </span>
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

  const visibleMatches = matches.filter((m) => m.competition !== 'Bulk Season');
  const filtered = fuzzyFilter(visibleMatches, search, ['homeTeam', 'awayTeam', 'competition']).sort(
    (a, b) => b.date.localeCompare(a.date)
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const groupedMatches = useMemo(() => {
    const groups: { date: string; label: string; matches: typeof paginated }[] = [];
    paginated.forEach((m) => {
      const existing = groups.find((g) => g.date === m.date);
      if (existing) {
        existing.matches.push(m);
      } else {
        groups.push({ date: m.date, label: formatDateLabel(m.date), matches: [m] });
      }
    });
    return groups;
  }, [paginated]);

  const matchResultsMap = useMemo(() => {
    const map = new Map<string, string>();
    matchEntries.forEach((e) => {
      if (e.matchId && !map.has(e.matchId) && e.result) {
        map.set(e.matchId, e.result);
      }
    });
    return map;
  }, [matchEntries]);

  // ── Loading skeleton ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 gap-4 animate-pulse">
          <div className="space-y-2">
            <div className="h-7 w-32 bg-muted rounded-md" />
            <div className="h-4 w-28 bg-muted rounded-md" />
          </div>
          <div className="h-9 w-48 bg-muted rounded-md" />
        </div>
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-5 animate-pulse">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-11 h-11 rounded-full bg-muted flex-shrink-0" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-7 w-20 bg-muted rounded" />
                <div className="h-5 w-14 bg-muted rounded-full" />
              </div>
              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="w-11 h-11 rounded-full bg-muted flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Modals */}
      {modal?.type === 'info' && (
        <Modal title="Generated Match" onClose={() => setModal(null)} isOpen>
          <div>
            <p className="text-[14px] text-foreground mb-4">
              This match was automatically generated from <strong>bulk season data</strong>.
            </p>
            <p className="text-[13px] text-muted-foreground mb-6">
              To correct any errors, please update the <strong>Weekly Stats</strong> in the player's profile.
              The system will then automatically regenerate the match history to match your changes.
            </p>
            <div className="flex justify-end">
              <Button onClick={() => setModal(null)}>I understand</Button>
            </div>
          </div>
        </Modal>
      )}

      {modal?.type === 'h2h' && (
        <H2HModal
          opponent={modal.opponent}
          matches={visibleMatches}
          matchResultsMap={matchResultsMap}
          onClose={() => setModal(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="font-heading font-bold text-[28px] tracking-wide mb-1">Matches</h2>
          <p className="text-muted-foreground text-[13px] font-medium">{visibleMatches.length} matches recorded</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search matches..."
            className="pl-9 w-full sm:w-[240px]"
          />
        </div>
      </div>

      {/* Grouped matches */}
      <div className="space-y-6">
        {groupedMatches.map((group) => (
          <div key={group.date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 mb-3">
              <span
                className={cn(
                  'text-[11px] font-black tracking-widest uppercase px-3 py-1 rounded-lg',
                  group.label === 'TODAY'
                    ? 'bg-primary/10 text-primary'
                    : group.label === 'YESTERDAY'
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {group.label}
              </span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            <div className="space-y-2.5">
              {group.matches.map((m) => {
                const sb = STATUS_BADGE[m.status as keyof typeof STATUS_BADGE] ?? STATUS_BADGE.finished;
                const result = getClubResult(m, matchResultsMap);

                const cardAccent =
                  result === 'win'
                    ? 'border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-500/8 via-card/50 to-card'
                    : result === 'loss'
                    ? 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/8 via-card/50 to-card'
                    : result === 'draw'
                    ? 'border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/8 via-card/50 to-card'
                    : 'border-border';

                return (
                  <div
                    key={m.id}
                    className={cn(
                      'bg-card border rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-border/80 group',
                      cardAccent
                    )}
                  >
                    {/* Main row */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 px-4 pt-4 pb-3">
                      {/* Home Team */}
                      <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
                        <div className="text-right min-w-0">
                          <p className="font-bold text-[14px] sm:text-[15px] leading-tight truncate">{m.homeTeam}</p>
                          <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold mt-0.5">Home</p>
                        </div>
                        <TeamAvatar name={m.homeTeam ?? ''} isElites={isClubTeam(m.homeTeam)} />
                      </div>

                      {/* Score + Status */}
                      <div className="flex-shrink-0 text-center px-3 flex flex-col items-center gap-1.5 min-w-[120px]">
                        <p
                          className={cn(
                            'font-heading font-black text-[26px] sm:text-[30px] tracking-[4px] leading-none',
                            m.status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
                          )}
                        >
                          {m.status !== 'upcoming' ? `${m.homeScore ?? '?'} – ${m.awayScore ?? '?'}` : 'VS'}
                        </p>
                        <Badge bg={sb.bg} c={sb.c}>{m.status}</Badge>
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 flex items-center justify-start gap-3 min-w-0">
                        <TeamAvatar name={m.awayTeam ?? ''} isElites={isClubTeam(m.awayTeam)} />
                        <div className="min-w-0">
                          <button
                            className="font-bold text-[14px] sm:text-[15px] leading-tight truncate block text-left hover:text-primary hover:underline underline-offset-2 transition-colors"
                            onClick={() => setModal({ type: 'h2h', opponent: m.awayTeam ?? '' })}
                            title="View Head-to-Head record"
                          >
                            {m.awayTeam}
                          </button>
                          <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold mt-0.5">Away</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer strip */}
                    <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-1 border-t border-border/30 mt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Competition badge — always visible */}
                        <span className="text-[11px] font-semibold text-muted-foreground bg-muted/60 border border-border/50 px-2.5 py-0.5 rounded-full">
                          {m.competition}
                        </span>
                        {m.time && (
                          <span className="text-[11px] text-muted-foreground/60">{m.time}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {/* H2H quick-action */}
                        <button
                          onClick={() => setModal({ type: 'h2h', opponent: m.awayTeam ?? '' })}
                          className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium px-2 py-1 bg-muted/40 rounded-lg border border-border/40 hover:bg-muted hover:text-foreground transition-colors"
                          title="Head to Head"
                        >
                          <Swords className="w-3 h-3" />
                          <span className="hidden sm:inline">H2H</span>
                        </button>

                        {m.id.startsWith('bulk-') && (
                          <button
                            onClick={() => setModal({ type: 'info' })}
                            className="text-[11px] text-muted-foreground font-medium px-2.5 py-1 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
                          >
                            Generated
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 bg-card border border-border p-4 rounded-2xl shadow-sm">
          <p className="text-[12px] text-muted-foreground font-medium">
            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of{' '}
            {filtered.length} matches
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
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
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
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
