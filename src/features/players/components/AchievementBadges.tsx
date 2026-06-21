import { useMemo } from 'react';
import { PlayerSeasonStat } from '@/features/players/types';

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
}

const TIER_COLORS = {
  bronze: { bg: '#92400e20', border: '#d97706', text: '#d97706', badge: 'linear-gradient(135deg, #92400e, #d97706)' },
  silver: { bg: '#1e293b20', border: '#94a3b8', text: '#cbd5e1', badge: 'linear-gradient(135deg, #475569, #cbd5e1)' },
  gold: { bg: '#78350f20', border: '#fbbf24', text: '#fbbf24', badge: 'linear-gradient(135deg, #b45309, #fbbf24)' },
  platinum: { bg: '#1e1b4b20', border: '#a78bfa', text: '#a78bfa', badge: 'linear-gradient(135deg, #4c1d95, #a78bfa)' },
};

export function usePlayerAchievements({ seasonStats }: Props): AchievementBadge[] {
  return useMemo(() => {
    const totalGoals = seasonStats.reduce((s, x) => s + x.goals, 0);
    const totalMOTM = seasonStats.reduce((s, x) => s + x.motmCount, 0);
    const totalCS = seasonStats.reduce((s, x) => s + x.cleansheets, 0);
    const totalHT = seasonStats.reduce((s, x) => s + x.hattricks, 0);
    const badges: AchievementBadge[] = [];

    const getTier = (val: number, max: number): 'bronze' | 'silver' | 'gold' | 'platinum' => {
      if (val >= max * 0.75) return 'platinum';
      if (val >= max * 0.5) return 'gold';
      if (val >= max * 0.25) return 'silver';
      return 'bronze';
    };

    const addMilestones = (current: number, steps: number[], type: string, maxMilestone: number) => {
      steps.forEach(m => {
        if (current >= m) {
          const tier = getTier(m, maxMilestone);
          badges.push({
            id: `${type.replace(' ', '_').toLowerCase()}_${m}`,
            icon: '',
            label: `${m} ${type}`,
            description: `Achieved ${m} ${type}`,
            color: TIER_COLORS[tier].text,
            tier,
            unlocked: true
          });
        }
      });
    };

    const mainSteps = [10, 50, ...Array.from({length: 50}, (_, i) => (i+1)*100)];
    const motmSteps = [5, 10, 25, 50, ...Array.from({length: 10}, (_, i) => (i+1)*100)];
    const csSteps = [10, 25, 50, ...Array.from({length: 10}, (_, i) => (i+1)*100)];

    addMilestones(totalGoals, mainSteps, 'Goals', 5000);
    addMilestones(totalMOTM, motmSteps, 'MOTM', 1000);
    addMilestones(totalCS, csSteps, 'Clean Sheets', 1000);
    addMilestones(totalHT, [1, 5, 10, 25, 50, 100], 'Hat-tricks', 100);

    // Sort so highest milestones are first
    badges.sort((a, b) => {
      const numA = parseInt(a.label.split(' ')[0]) || 0;
      const numB = parseInt(b.label.split(' ')[0]) || 0;
      return numB - numA;
    });

    return badges;
  }, [seasonStats]);
}

export function AchievementBadges({ seasonStats }: Props) {
  const badges = usePlayerAchievements({ seasonStats });
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
                className="group relative flex flex-col items-center justify-center gap-1 px-4 py-2.5 rounded-xl border cursor-default transition-all hover:scale-105"
                style={{ background: t.bg, borderColor: t.border }}
                title={badge.description}
              >
                <span className="text-[12px] font-black uppercase tracking-wide leading-none" style={{ color: t.text }}>
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
