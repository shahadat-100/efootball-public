import { MatchEntry } from '@/features/match-entries/types';

interface PlayerTimelineProps {
  entries: MatchEntry[];
}

interface Milestone {
  id: string;
  title: string;
  date: string;
  type: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  subText?: string;
  sortOrder: number;
}

export function PlayerTimeline({ entries }: PlayerTimelineProps) {
  if (!entries || entries.length === 0) return null;

  // Ensure entries are sorted by date ascending for sequential calculation
  const sortedEntries = [...entries]
    .filter(e => e.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  if (sortedEntries.length === 0) return null;

  const milestones: Milestone[] = [];

  let appearances = 0;
  let wins = 0;
  let draws = 0;
  let cleanSheets = 0;
  let motms = 0;
  let hattricks = 0;
  let doubleHattricks = 0;
  let maxMargin = 0;
  let maxMarginMatch: any = null;
  let maxGoals = 0;
  let maxGoalsMatch: any = null;

  const addMilestone = (title: string, date: string, type: string, tag: string, subText?: string) => {
    let tagColor = '#94a3b8';
    let tagBg = '#f1f5f9';
    
    if (tag === 'W') { tagColor = '#6366f1'; tagBg = '#e0e7ff'; }
    else if (tag === 'D') { tagColor = '#f59e0b'; tagBg = '#fef3c7'; }
    else if (tag === 'CS') { tagColor = '#10b981'; tagBg = '#d1fae5'; }
    else if (tag === 'HT' || tag === 'DHT') { tagColor = '#a855f7'; tagBg = '#f3e8ff'; }
    else if (tag === 'MOTM') { tagColor = '#ea580c'; tagBg = '#ffedd5'; }
    else if (tag === 'PL') { tagColor = '#3b82f6'; tagBg = '#dbeafe'; }

    milestones.push({
      id: `${type}-${milestones.length}`,
      title,
      date,
      type,
      tag,
      tagColor,
      tagBg,
      subText,
      sortOrder: new Date(date).getTime()
    });
  };


  let currentWinStreak = 0;
  let currentUnbeatenStreak = 0;
  let currentCleanSheetStreak = 0;

  let winStreak5Times = 0;
  let unbeaten10Times = 0;
  let cs3Times = 0;
  let defMasterclassTimes = 0;
  let doubleHattrickTimes = 0;

  let lastWinStreak5Date = '';
  let lastUnbeaten10Date = '';
  let lastCs3Date = '';
  let lastDefMasterclassDate = '';
  let lastDoubleHattrickDate = '';

  sortedEntries.forEach((e) => {
    appearances++;
    if (appearances === 1) addMilestone('Played Debut', e.date!, 'debut', 'PL');
    if (appearances === 50) addMilestone('50th Appearance', e.date!, 'app_50', 'PL');
    if (appearances === 100) addMilestone('100th Appearance', e.date!, 'app_100', 'PL');
    if (appearances === 150) addMilestone('150th Appearance', e.date!, 'app_150', 'PL');
    if (appearances === 200) addMilestone('200th Appearance', e.date!, 'app_200', 'PL');

    if (e.result === 'win') {
      wins++;
      if (wins === 1) addMilestone('First Win', e.date!, 'win_1', 'W');
      if (wins === 50) addMilestone('50th Win', e.date!, 'win_50', 'W');
      if (wins === 100) addMilestone('100th Win', e.date!, 'win_100', 'W');

      const margin = (e.goals || 0) - (e.goalsConceded || 0);
      if (margin > maxMargin) {
        maxMargin = margin;
        maxMarginMatch = e;
      }
    }

    if (e.result === 'draw') {
      draws++;
      if (draws === 1) addMilestone('First Draw', e.date!, 'draw_1', 'D');
      if (draws === 50) addMilestone('50th Draw', e.date!, 'draw_50', 'D');
    }

    if (e.cleanSheet) {
      cleanSheets++;
      if (cleanSheets === 1) addMilestone('First Clean Sheet', e.date!, 'cs_1', 'CS');
      if (cleanSheets === 50) addMilestone('50th Clean Sheet', e.date!, 'cs_50', 'CS');
    }

    if (e.motm) {
      motms++;
      if (motms === 1) addMilestone('First MOTM', e.date!, 'motm_1', 'MOTM');
      if (motms === 50) addMilestone('50th MOTM', e.date!, 'motm_50', 'MOTM');
    }

    if ((e.hattricks || 0) > 0) {
      hattricks += e.hattricks!;
      if (e.hattricks === 1 && hattricks === 1) addMilestone('First Hat-Trick', e.date!, 'ht_1', 'HT');
      if (hattricks >= 50 && hattricks - e.hattricks! < 50) addMilestone('50th Hat-Trick', e.date!, 'ht_50', 'HT');
      
      if (e.hattricks! >= 2) {
        doubleHattricks++;
        if (doubleHattricks === 1) addMilestone('First Double HT', e.date!, 'dht_1', 'DHT');
      }
    }

    if ((e.goals || 0) > maxGoals) {
      maxGoals = e.goals || 0;
      maxGoalsMatch = e;
    }

    // Legendary Performances
    if (e.motm && e.cleanSheet) {
      defMasterclassTimes++;
      lastDefMasterclassDate = e.date!;
    }
    if ((e.goals || 0) >= 6) {
      doubleHattrickTimes++;
      lastDoubleHattrickDate = e.date!;
    }

    // Streaks Logic
    if (e.result === 'win') {
      currentWinStreak++;
      currentUnbeatenStreak++;
      if (currentWinStreak % 5 === 0) {
        winStreak5Times++;
        lastWinStreak5Date = e.date!;
      }
    } else if (e.result === 'draw') {
      currentWinStreak = 0;
      currentUnbeatenStreak++;
    } else {
      currentWinStreak = 0;
      currentUnbeatenStreak = 0;
    }

    if (currentUnbeatenStreak > 0 && currentUnbeatenStreak % 10 === 0) {
      unbeaten10Times++;
      lastUnbeaten10Date = e.date!;
    }

    if (e.cleanSheet) {
      currentCleanSheetStreak++;
      if (currentCleanSheetStreak % 3 === 0) {
        cs3Times++;
        lastCs3Date = e.date!;
      }
    } else {
      currentCleanSheetStreak = 0;
    }
  });

  if (defMasterclassTimes > 0) addMilestone(`Defensive Masterclass (${defMasterclassTimes} ${defMasterclassTimes === 1 ? 'time' : 'times'})`, lastDefMasterclassDate, 'def_master_agg', '🛡️', 'Clean Sheet + MOTM');
  if (doubleHattrickTimes > 0) addMilestone(`Double Hat-trick (${doubleHattrickTimes} ${doubleHattrickTimes === 1 ? 'time' : 'times'})`, lastDoubleHattrickDate, 'dht_agg', '⚽', 'Legendary Performance');
  if (winStreak5Times > 0) addMilestone(`5-Match Win Streak (${winStreak5Times} ${winStreak5Times === 1 ? 'time' : 'times'})`, lastWinStreak5Date, 'ws5_agg', '🔥');
  if (unbeaten10Times > 0) addMilestone(`10 Matches Unbeaten (${unbeaten10Times} ${unbeaten10Times === 1 ? 'time' : 'times'})`, lastUnbeaten10Date, 'ub10_agg', '🛡️');
  if (cs3Times > 0) addMilestone(`3 Consecutive Clean Sheets (${cs3Times} ${cs3Times === 1 ? 'time' : 'times'})`, lastCs3Date, 'cs3_agg', '🧤');


  // Add the dynamic records (they only get added at the end based on their final max values)
  if (maxMarginMatch) {
    addMilestone(
      `Biggest margin win (+${maxMargin})`, 
      maxMarginMatch.date!, 
      'record_margin', 
      'W', 
      `${maxMarginMatch.goals}-${maxMarginMatch.goalsConceded} ${maxMarginMatch.notes ? `vs ${maxMarginMatch.notes}` : ''}`
    );
  }
  
  if (maxGoalsMatch && maxGoals > 3) {
    addMilestone(
      `Highest goals in a match: ${maxGoals} goals`, 
      maxGoalsMatch.date!, 
      'record_goals', 
      '⚽', 
      `${maxGoalsMatch.goals}-${maxGoalsMatch.goalsConceded} ${maxGoalsMatch.notes ? `vs ${maxGoalsMatch.notes}` : ''}`
    );
  }

  // Sort milestones newest first
  milestones.sort((a, b) => b.sortOrder - a.sortOrder);

  const formatDisplayDate = (dStr: string) => {
    return new Date(dStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading font-bold text-[18px] tracking-tight">Career Timeline</h3>
          {milestones.length > 0 && (
            <p className="text-muted-foreground text-[13px]">Last milestone: {formatDisplayDate(milestones[0].date)}</p>
          )}
        </div>
        <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full flex items-center gap-2">
          <span className="text-[12px]">★ Milestones</span>
          <span className="bg-primary text-primary-foreground font-bold text-[12px] w-6 h-6 rounded-full flex items-center justify-center">
            {milestones.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {milestones.map((m) => (
          <div key={m.id} className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-[14px] text-foreground pr-8 leading-tight">{m.title}</h4>
              <span 
                className="text-[10px] font-black px-1.5 py-0.5 rounded flex items-center justify-center min-w-[24px]"
                style={{ backgroundColor: m.tagBg, color: m.tagColor, border: `1px solid ${m.tagColor}40` }}
              >
                {m.tag}
              </span>
            </div>
            
            <p className="text-muted-foreground text-[12px] font-medium mb-1">{formatDisplayDate(m.date)}</p>
            
            {m.subText && (
              <p className="text-muted-foreground/80 text-[11px] mt-2 border-t border-border/30 pt-2">{m.subText}</p>
            )}
            
            {/* Decorative background flair */}
            <div 
              className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity pointer-events-none"
              style={{ backgroundColor: m.tagColor }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
