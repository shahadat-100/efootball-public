import { useMemo } from 'react';
import { PlayerSeasonStat } from '@/features/players/types';
import { MatchEntry } from '@/features/match-entries/types';

export interface AchievementBadge {
  id: string;
  icon: string;
  label: string;
  description: string;
  color: string;
  unlocked: boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface Props {
  seasonStats: PlayerSeasonStat[];
  matchEntries: MatchEntry[];
}

const TIER_COLORS = {
  bronze: { bg: '#92400e20', border: '#d97706', text: '#d97706', badge: 'linear-gradient(135deg, #92400e, #d97706)' },
  silver: { bg: '#1e293b20', border: '#94a3b8', text: '#cbd5e1', badge: 'linear-gradient(135deg, #475569, #cbd5e1)' },
  gold: { bg: '#78350f20', border: '#fbbf24', text: '#fbbf24', badge: 'linear-gradient(135deg, #b45309, #fbbf24)' },
  platinum: { bg: '#1e1b4b20', border: '#a78bfa', text: '#a78bfa', badge: 'linear-gradient(135deg, #4c1d95, #a78bfa)' },
};

export function usePlayerAchievements({ seasonStats, matchEntries }: Props): AchievementBadge[] {
  return useMemo(() => {
    const totalMatches = seasonStats.reduce((s, x) => s + x.appearances, 0);
    const totalGoals = seasonStats.reduce((s, x) => s + x.goals, 0);
    const totalWins = seasonStats.reduce((s, x) => s + x.wins, 0);
    const totalMOTM = seasonStats.reduce((s, x) => s + x.motmCount, 0);
    const totalCS = seasonStats.reduce((s, x) => s + x.cleansheets, 0);
    const totalHT = seasonStats.reduce((s, x) => s + x.hattricks, 0);
    const seasons = seasonStats.length;

    // Win streak and advanced calculation
    const sorted = [...matchEntries]
      .filter(e => e.date)
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
    
    let maxStreak = 0, streak = 0;
    let maxUnbeatenStreak = 0, unbeatenStreak = 0;
    let maxScoringStreak = 0, scoringStreak = 0;
    let maxMotmStreak = 0, motmStreak = 0;
    let maxGoalsInMatch = 0;

    sorted.forEach(e => {
      if (e.result === 'win') { streak++; maxStreak = Math.max(maxStreak, streak); }
      else streak = 0;

      if (e.result === 'win' || e.result === 'draw') { unbeatenStreak++; maxUnbeatenStreak = Math.max(maxUnbeatenStreak, unbeatenStreak); }
      else unbeatenStreak = 0;

      if (e.goals > 0) { scoringStreak++; maxScoringStreak = Math.max(maxScoringStreak, scoringStreak); }
      else scoringStreak = 0;

      if (e.motm) { motmStreak++; maxMotmStreak = Math.max(maxMotmStreak, motmStreak); }
      else motmStreak = 0;

      maxGoalsInMatch = Math.max(maxGoalsInMatch, e.goals);
    });

    const totalDraws = seasonStats.reduce((s, x) => s + x.draws, 0);
    const gpm = totalMatches > 0 ? totalGoals / totalMatches : 0;
    const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;

    const badges: AchievementBadge[] = [
      // Matches milestones
      { id: 'matches_10', icon: '👟', label: 'First Steps', description: '10 matches played', color: TIER_COLORS.bronze.text, tier: 'bronze', unlocked: totalMatches >= 10 },
      { id: 'matches_50', icon: '🎽', label: 'Veteran', description: '50 matches played', color: TIER_COLORS.silver.text, tier: 'silver', unlocked: totalMatches >= 50 },
      { id: 'matches_100', icon: '💯', label: 'Centurion', description: '100 matches played', color: TIER_COLORS.gold.text, tier: 'gold', unlocked: totalMatches >= 100 },
      { id: 'matches_200', icon: '🏟️', label: 'Legend', description: '200 matches played', color: TIER_COLORS.platinum.text, tier: 'platinum', unlocked: totalMatches >= 200 },
      { id: 'matches_300', icon: '🏛️', label: 'Iron Man', description: '300 matches played', color: TIER_COLORS.platinum.text, tier: 'platinum', unlocked: totalMatches >= 300 },

      // Goals milestones
      { id: 'goals_10', icon: '⚽', label: 'Scorer', description: '10 goals scored', color: TIER_COLORS.bronze.text, tier: 'bronze', unlocked: totalGoals >= 10 },
      { id: 'goals_50', icon: '🎯', label: 'Marksman', description: '50 goals scored', color: TIER_COLORS.silver.text, tier: 'silver', unlocked: totalGoals >= 50 },
      { id: 'goals_100', icon: '🔥', label: 'Goal Machine', description: '100 goals scored', color: TIER_COLORS.gold.text, tier: 'gold', unlocked: totalGoals >= 100 },
      { id: 'goals_200', icon: '👑', label: 'All-Time Scorer', description: '200 goals scored', color: TIER_COLORS.platinum.text, tier: 'platinum', unlocked: totalGoals >= 200 },
      { id: 'goals_300', icon: '⚜️', label: 'Golden Boot', description: '300 goals scored', color: TIER_COLORS.platinum.text, tier: 'platinum', unlocked: totalGoals >= 300 },

      // Match performance
      { id: 'gpm_1', icon: '🦅', label: 'Deadly Finisher', description: 'Goals per match > 1.0 (min 15 matches)', color: TIER_COLORS.gold.text, tier: 'gold', unlocked: totalMatches >= 15 && gpm >= 1.0 },
      { id: 'win_rate_80', icon: '🍀', label: 'Lucky Charm', description: 'Win Rate > 80% (min 15 matches)', color: TIER_COLORS.platinum.text, tier: 'platinum', unlocked: totalMatches >= 15 && winRate >= 80 },
      { id: 'draw_15', icon: '🤝', label: 'Draw Specialist', description: '15 draws', color: TIER_COLORS.silver.text, tier: 'silver', unlocked: totalDraws >= 15 },
      { id: 'goals_in_match_6', icon: '☄️', label: 'Double Hat-trick', description: 'Scored 6+ goals in a single match', color: TIER_COLORS.platinum.text, tier: 'platinum', unlocked: maxGoalsInMatch >= 6 },

      // Wins
      { id: 'wins_25', icon: '✅', label: 'Winner', description: '25 wins', color: TIER_COLORS.bronze.text, tier: 'bronze', unlocked: totalWins >= 25 },
      { id: 'wins_100', icon: '🏆', label: 'Champion', description: '100 wins', color: TIER_COLORS.gold.text, tier: 'gold', unlocked: totalWins >= 100 },

      // MOTM
      { id: 'motm_5', icon: '⭐', label: 'Star Player', description: '5 MOTM awards', color: TIER_COLORS.bronze.text, tier: 'bronze', unlocked: totalMOTM >= 5 },
      { id: 'motm_10', icon: '🌟', label: 'Elite Player', description: '10 MOTM awards', color: TIER_COLORS.silver.text, tier: 'silver', unlocked: totalMOTM >= 10 },
      { id: 'motm_25', icon: '💫', label: 'MOTM King', description: '25 MOTM awards', color: TIER_COLORS.gold.text, tier: 'gold', unlocked: totalMOTM >= 25 },
      { id: 'motm_streak_3', icon: '🎭', label: 'Masterclass', description: 'MOTM in 3 consecutive matches', color: TIER_COLORS.platinum.text, tier: 'platinum', unlocked: maxMotmStreak >= 3 },

      // Clean Sheets
      { id: 'cs_10', icon: '🛡️', label: 'Wall', description: '10 clean sheets', color: TIER_COLORS.bronze.text, tier: 'bronze', unlocked: totalCS >= 10 },
      { id: 'cs_25', icon: '🏰', label: 'Fort Knox', description: '25 clean sheets', color: TIER_COLORS.silver.text, tier: 'silver', unlocked: totalCS >= 25 },
      { id: 'cs_50', icon: '🗿', label: 'Unbreakable', description: '50 clean sheets', color: TIER_COLORS.gold.text, tier: 'gold', unlocked: totalCS >= 50 },

      // Hat-tricks
      { id: 'ht_1', icon: '🎩', label: 'Hat-trick Hero', description: 'First hat-trick', color: TIER_COLORS.silver.text, tier: 'silver', unlocked: totalHT >= 1 },
      { id: 'ht_5', icon: '🪄', label: 'Magician', description: '5 hat-tricks', color: TIER_COLORS.gold.text, tier: 'gold', unlocked: totalHT >= 5 },

      // Seasons
      { id: 'seasons_3', icon: '📅', label: 'Seasoned Pro', description: '3 seasons played', color: TIER_COLORS.silver.text, tier: 'silver', unlocked: seasons >= 3 },

      // Streaks
      { id: 'streak_5', icon: '🔴', label: 'Hot Streak', description: '5-game win streak', color: TIER_COLORS.silver.text, tier: 'silver', unlocked: maxStreak >= 5 },
      { id: 'streak_10', icon: '🌋', label: 'Unstoppable', description: '10-game win streak', color: TIER_COLORS.platinum.text, tier: 'platinum', unlocked: maxStreak >= 10 },
      { id: 'unbeaten_10', icon: '🧿', label: 'Unflappable', description: '10 consecutive matches without a loss', color: TIER_COLORS.gold.text, tier: 'gold', unlocked: maxUnbeatenStreak >= 10 },
      { id: 'scoring_5', icon: '🚀', label: 'Goal Poacher', description: 'Scored in 5 consecutive matches', color: TIER_COLORS.silver.text, tier: 'silver', unlocked: maxScoringStreak >= 5 },
    ];

    return badges;
  }, [seasonStats, matchEntries]);
}

export function AchievementBadges({ seasonStats, matchEntries }: Props) {
  const badges = usePlayerAchievements({ seasonStats, matchEntries });
  const unlocked = badges.filter(b => b.unlocked);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Achievements
        </p>
        <span className="text-[10px] font-black text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
          {unlocked.length} Earned
        </span>
      </div>

      {unlocked.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">No achievements unlocked yet</p>
      )}

      {/* Unlocked Badges */}
      {unlocked.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {unlocked.map(badge => {
            const t = TIER_COLORS[badge.tier];
            return (
              <div
                key={badge.id}
                className="group relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl border cursor-default transition-all hover:scale-105"
                style={{ background: t.bg, borderColor: t.border }}
                title={badge.description}
              >
                <span className="text-xl leading-none">{badge.icon}</span>
                <span className="text-[9px] font-black uppercase tracking-wide leading-none" style={{ color: t.text }}>
                  {badge.label}
                </span>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-50 whitespace-nowrap">
                  <div className="bg-black/90 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white/80 font-semibold shadow-2xl">
                    {badge.description}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
