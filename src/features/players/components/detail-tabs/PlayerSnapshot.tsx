import React from 'react';
import { MatchEntry } from '@/shared/schemas/models';
import { differenceInDays, differenceInWeeks } from 'date-fns';

interface PlayerSnapshotProps {
  entries: MatchEntry[];
}

export function PlayerSnapshot({ entries }: PlayerSnapshotProps) {
  if (!entries || entries.length === 0) return null;

  // Ensure entries are sorted by date ascending
  const sortedEntries = [...entries]
    .filter(e => e.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  if (sortedEntries.length === 0) return null;

  const debutDate = new Date(sortedEntries[0].date!);
  const lastPlayedDate = new Date(sortedEntries[sortedEntries.length - 1].date!);

  const formattedDebut = debutDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const formattedLast = lastPlayedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Calculate Gaps
  let totalGapDays = 0;
  let maxGapDays = 0;
  let maxGapWeeks = 0;

  for (let i = 1; i < sortedEntries.length; i++) {
    const prev = new Date(sortedEntries[i - 1].date!);
    const curr = new Date(sortedEntries[i].date!);
    const days = differenceInDays(curr, prev);
    totalGapDays += days;
    if (days > maxGapDays) {
      maxGapDays = days;
      maxGapWeeks = differenceInWeeks(curr, prev);
    }
  }

  const avgGapDays = sortedEntries.length > 1 ? (totalGapDays / (sortedEntries.length - 1)).toFixed(1) : '0';
  const maxGapDisplay = maxGapWeeks > 1 ? `${(maxGapDays / 7).toFixed(1)} weeks` : `${maxGapDays} days`;

  // Calculate Longest Unbeaten Streak
  let maxUnbeaten = 0;
  let currentUnbeaten = 0;
  let maxUnbeatenStart = '';
  let maxUnbeatenEnd = '';
  let currentStart = '';

  sortedEntries.forEach((e) => {
    if (e.result === 'win' || e.result === 'draw') {
      if (currentUnbeaten === 0) currentStart = e.date!;
      currentUnbeaten++;
      if (currentUnbeaten > maxUnbeaten) {
        maxUnbeaten = currentUnbeaten;
        maxUnbeatenStart = currentStart;
        maxUnbeatenEnd = e.date!;
      }
    } else {
      currentUnbeaten = 0;
    }
  });

  const formatUnbeatenStr = (start: string, end: string) => {
    if (!start || !end) return '';
    const s = new Date(start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const e = new Date(end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return s === e ? s : `${s} — ${e}`;
  };

  // Highest Goals in a Match
  let maxGoals = 0;
  let maxGoalsMatch: MatchEntry | null = null;
  sortedEntries.forEach(e => {
    if ((e.goals || 0) > maxGoals) {
      maxGoals = e.goals || 0;
      maxGoalsMatch = e;
    }
  });

  const formatMaxGoalsMatch = (m: MatchEntry | null) => {
    if (!m) return '';
    const d = new Date(m.date!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${d} ${m.notes ? `(${m.notes})` : ''}`;
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm animate-in fade-in slide-in-from-bottom-2">
      <div className="mb-4">
        <h3 className="font-heading font-bold text-[18px] tracking-tight">Player Snapshot</h3>
        <p className="text-muted-foreground text-[13px]">Quick summary of player performance.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Debut', value: formattedDebut },
          { label: 'Last played', value: formattedLast },
          { label: 'Avg match to match gap', value: `${avgGapDays} days` },
          { label: 'Max match to match gap', value: maxGapDisplay },
          { 
            label: 'Highest unbeaten streak', 
            value: maxUnbeaten > 0 ? `${maxUnbeaten} matches: ${formatUnbeatenStr(maxUnbeatenStart, maxUnbeatenEnd)}` : 'None'
          },
          { 
            label: 'Highest goals in a match', 
            value: maxGoals > 0 ? `${maxGoals} goals — ${formatMaxGoalsMatch(maxGoalsMatch)}` : 'None'
          }
        ].map((stat, i) => (
          <div key={i} className="bg-muted/30 rounded-xl p-4 flex-1 min-w-[160px] border border-border/50">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-[14px] font-medium text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
