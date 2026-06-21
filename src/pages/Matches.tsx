import { useState, useMemo } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Match } from '@/features/matches/types';
import { Button, Input, Modal, Badge } from '@/shared/components';
import { fuzzyFilter } from '@/shared/lib/utils';
import { Search } from 'lucide-react';
import { STATUS_BADGE } from '@/shared/lib/constants';
import { cn } from '@/shared/lib/cn';

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

export function Matches() {
  const { matches, matchEntries } = useFootballStore();
  const [modal, setModal] = useState<{ type: 'info', data?: Match } | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

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
                const isElitesHome = m.homeTeam?.toLowerCase().includes('elite') || m.homeTeam?.toLowerCase().includes('enigmatic');
                const isElitesAway = m.awayTeam?.toLowerCase().includes('elite') || m.awayTeam?.toLowerCase().includes('enigmatic');

                let result = matchResultsMap.get(m.id);
                if (!result && m.status !== 'upcoming' && m.homeScore !== null && m.awayScore !== null && m.homeScore !== undefined && m.awayScore !== undefined) {
                  if (isElitesHome) {
                    if (m.homeScore > m.awayScore) result = 'win';
                    else if (m.homeScore < m.awayScore) result = 'loss';
                    else result = 'draw';
                  } else if (isElitesAway) {
                    if (m.awayScore > m.homeScore) result = 'win';
                    else if (m.awayScore < m.homeScore) result = 'loss';
                    else result = 'draw';
                  }
                }

                return (
                  <div 
                    key={m.id} 
                    className={cn(
                      "bg-card border rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-sm transition-all hover:shadow-md hover:border-border",
                      result === 'win' ? 'border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-500/8 via-card/50 to-card' :
                      result === 'loss' ? 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/8 via-card/50 to-card' :
                      result === 'draw' ? 'border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/8 via-card/50 to-card' :
                      'border-border'
                    )}
                  >
                    {/* Home Team */}
                    <div className="flex-1 flex items-center justify-end gap-3 text-center sm:text-right">
                      <div>
                        <p className="font-bold text-[15px]">{m.homeTeam}</p>
                        <p className="text-muted-foreground text-[10px] uppercase tracking-widest mt-0.5 font-bold">Home</p>
                      </div>
                      {isElitesHome && (
                        <img src="/images/club-logo.jpg" alt="TEE" className="w-10 h-10 rounded-full object-cover shadow-md ring-1 ring-border" />
                      )}
                    </div>
                    
                    {/* Score */}
                    <div className="flex-shrink-0 text-center px-4 min-w-[130px]">
                      <p className={cn(
                        "font-heading font-bold text-[28px] tracking-[6px] text-foreground leading-none",
                        m.status === 'upcoming' && "text-muted-foreground"
                      )}>
                        {m.status !== 'upcoming' ? `${m.homeScore} - ${m.awayScore}` : 'VS'}
                      </p>
                      <div className="flex gap-2 justify-center mt-2.5">
                        <Badge bg={sb.bg} c={sb.c}>{m.status}</Badge>
                      </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 flex items-center justify-start gap-3 text-center sm:text-left">
                      {isElitesAway && (
                        <img src="/images/club-logo.jpg" alt="TEE" className="w-10 h-10 rounded-full object-cover shadow-md ring-1 ring-border" />
                      )}
                      <div>
                        <p className="font-bold text-[15px]">{m.awayTeam}</p>
                        <p className="text-muted-foreground text-[10px] uppercase tracking-widest mt-0.5 font-bold">Away</p>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center sm:ml-auto w-full sm:w-auto justify-center sm:justify-end border-t sm:border-none border-border pt-3 sm:pt-0 mt-2 sm:mt-0">
                      <Badge className="bg-muted text-muted-foreground hidden lg:block mr-2 border border-border/50 font-medium">{m.competition}</Badge>
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
