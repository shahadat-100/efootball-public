import { useMemo } from 'react';
import { Match } from '@/features/matches/types';
import { Badge } from '@/shared/components';
import { STATUS_BADGE } from '@/shared/lib/constants';
import { Activity, Swords } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface RecentMatchesCardProps {
  matches: Match[];
  matchResultsMap: Map<string, string>;
}

function TeamInitials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-muted border-2 border-border flex items-center justify-center text-sm font-black text-foreground shadow-sm">
      {initials}
    </div>
  );
}

function ClubLogo() {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border shadow-sm shrink-0">
      <img src="/images/club-logo.jpg" alt="Club Logo" className="w-full h-full object-cover" />
    </div>
  );
}

export function RecentMatchesCard({ matches, matchResultsMap }: RecentMatchesCardProps) {
  const recentMatches = useMemo(() =>
    [...matches]
      .sort((a, b) => {
        // Sort by date descending (most recent first)
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
      })
      .slice(0, 7),
    [matches]
  );

  const getResultMeta = (match: Match) => {
    const result = matchResultsMap.get(match.id);
    if (match.status !== 'finished' || !result) {
      return {
        label: null,
        textColor: 'text-foreground',
        pillBg: 'bg-muted/50 border-border',
      };
    }
    if (result === 'win') return {
      label: 'WIN',
      textColor: 'text-emerald-500',
      pillBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
    };
    if (result === 'draw') return {
      label: 'DRAW',
      textColor: 'text-amber-500',
      pillBg: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
    };
    return {
      label: 'LOSS',
      textColor: 'text-red-500',
      pillBg: 'bg-red-500/10 border-red-500/30 text-red-500',
    };
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-[17px] text-foreground tracking-tight">Recent Matches</span>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Last {recentMatches.length}
        </span>
      </div>

      {/* Match List */}
      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 py-12 opacity-50">
          <Swords className="w-10 h-10 text-muted-foreground" />
          <p className="text-sm font-bold text-muted-foreground">No matches yet</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border/40 overflow-y-auto flex-1">
          {recentMatches.map(m => {
            const meta = getResultMeta(m);
            const sb = STATUS_BADGE[m.status as keyof typeof STATUS_BADGE] ?? STATUS_BADGE.finished;
            const isFinished = m.status === 'finished';

            return (
              <div
                key={m.id}
                className="group flex flex-col gap-3 px-5 py-4 transition-all duration-200 hover:bg-muted/40"
              >
                {/* Top row: competition + status badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground truncate max-w-[150px]">
                    {m.competition}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {meta.label && (
                      <span className={cn('text-[11px] font-black uppercase tracking-widest', meta.textColor)}>
                        {meta.label}
                      </span>
                    )}
                    <Badge bg={sb.bg} c={sb.c}>{m.status}</Badge>
                  </div>
                </div>

                {/* Main: Teams + Score */}
                <div className="flex items-center justify-between gap-3">
                  {/* Home Team (Club Logo) */}
                  <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                    <ClubLogo />
                    <span className="text-[13px] font-bold text-foreground text-center line-clamp-1 w-full px-1">
                      {m.homeTeam}
                    </span>
                  </div>

                  {/* Score / VS */}
                  <div
                    className={cn(
                      'flex items-center justify-center shrink-0 px-3 py-1.5 rounded-xl border-2 font-black text-lg tracking-wider min-w-[70px] shadow-sm',
                      isFinished ? meta.pillBg : 'bg-muted border-border/80 text-foreground'
                    )}
                  >
                    {isFinished
                      ? `${m.homeScore ?? 0} - ${m.awayScore ?? 0}`
                      : 'VS'
                    }
                  </div>

                  {/* Away Team (Initials) */}
                  <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                    <TeamInitials name={m.awayTeam} />
                    <span className="text-[13px] font-bold text-foreground text-center line-clamp-1 w-full px-1">
                      {m.awayTeam}
                    </span>
                  </div>
                </div>

                {/* Bottom: date + time */}
                <div className="flex items-center justify-center mt-1">
                  <span className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider bg-background/50 px-3 py-1 rounded-full border border-border/50 shadow-sm">
                    {m.date ? formatDate(m.date) : '—'}
                    {m.time ? ` · ${m.time}` : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
