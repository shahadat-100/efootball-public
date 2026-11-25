import { useMemo } from 'react';
import { Player, PlayerSeasonStat } from '@/features/players/types';

import { Avatar } from '@/shared/components';
import { cn } from '@/shared/lib/cn';
import { Star, Crown, Zap } from 'lucide-react';

import { PlayerMonthlyStat, PlayerWeeklyStat } from '@/store/footballStore';
import {
  MONTHS_SHORT,
  findLatestWeeklyPeriod,
  findLatestMonthlyPeriod,
  calcPoints,
} from '@/features/overview/utils/leaderboardUtils';

interface PlayerSpotlightsProps {
  players: Player[];
  playerSeasonStats: PlayerSeasonStat[];
  playerWeeklyStats?: PlayerWeeklyStat[];
  playerMonthlyStats?: PlayerMonthlyStat[];
}

const MONTHS = MONTHS_SHORT;

// Helper: Calculate points from season stats
const calcSeasonPoints = (stats: PlayerSeasonStat[]): number =>
  stats.reduce((total, s) =>
    total + (s.wins * 10) + (s.draws * 5) - (s.losses * 3) + s.goals - s.goalsConceded + (s.motmCount * 4) + s.hattricks
  , 0);

export function PlayerSpotlights({ players, playerSeasonStats, playerWeeklyStats = [], playerMonthlyStats = [] }: PlayerSpotlightsProps) {
  const { weekTop, monthTop, seasonTop } = useMemo(() => {
    const latestWeekly = findLatestWeeklyPeriod(playerWeeklyStats);
    const latestMonthly = findLatestMonthlyPeriod(playerMonthlyStats);

    const weeklyMap = new Map<string, { pts: number; goals: number; motm: number }>();
    const monthlyMap = new Map<string, { pts: number; goals: number; motm: number }>();
    const seasonMap = new Map<string, { pts: number; goals: number; motm: number }>();

    players.forEach(p => {
      weeklyMap.set(p.id, { pts: 0, goals: 0, motm: 0 });
      monthlyMap.set(p.id, { pts: 0, goals: 0, motm: 0 });
      seasonMap.set(p.id, { pts: 0, goals: 0, motm: 0 });
    });

    // Week
    playerWeeklyStats.forEach(stat => {
      if (
        Number(stat.year) === latestWeekly.year &&
        Number(stat.monthIndex) === latestWeekly.monthIndex &&
        Number(stat.week) === latestWeekly.week
      ) {
        if (weeklyMap.has(stat.playerId)) {
          const wm = weeklyMap.get(stat.playerId)!;
          wm.pts += calcPoints(stat);
          wm.goals += stat.goals;
          wm.motm += stat.motmCount;
        }
      }
    });

    // Month
    playerMonthlyStats.forEach(stat => {
      if (
        Number(stat.year) === latestMonthly.year &&
        Number(stat.monthIndex) === latestMonthly.monthIndex
      ) {
        if (monthlyMap.has(stat.playerId)) {
          const mm = monthlyMap.get(stat.playerId)!;
          mm.pts += calcPoints(stat);
          mm.goals += stat.goals;
          mm.motm += stat.motmCount;
        }
      }
    });

    // Season (Current Year based on playerSeasonStats or current year entries)
    players.forEach(p => {
      const stats = playerSeasonStats.filter(s => s.playerId === p.id);
      const totalPoints = calcSeasonPoints(stats);
      const totalGoals = stats.reduce((acc, s) => acc + (s.goals || 0), 0);
      const totalMotm = stats.reduce((acc, s) => acc + (s.motmCount || 0), 0);
      seasonMap.set(p.id, { pts: totalPoints, goals: totalGoals, motm: totalMotm });
    });

    const getTop = (map: Map<string, { pts: number; goals: number; motm: number }>) => {
      const sorted = Array.from(map.entries())
        .map(([id, stats]) => ({ player: players.find(p => p.id === id)!, ...stats }))
        .filter(x => x.player && x.pts > 0)
        .sort((a, b) => b.pts - a.pts);
      return sorted[0] || null;
    };

    return {
      weekTop: { data: getTop(weeklyMap), label: `${MONTHS[latestWeekly.monthIndex]} Week ${latestWeekly.week}` },
      monthTop: { data: getTop(monthlyMap), label: `${MONTHS[latestMonthly.monthIndex]} ${latestMonthly.year}` },
      seasonTop: { data: getTop(seasonMap), label: `Overall Season` },
    };
  }, [players, playerWeeklyStats, playerMonthlyStats, playerSeasonStats]);

  const SpotlightCard = ({ 
    title, subtitle, data, type 
  }: { 
    title: string; subtitle: string; data: any; type: 'week' | 'month' | 'season' 
  }) => {
    if (!data) return null;

    const isSeason = type === 'season';
    const isMonth = type === 'month';


    const bgGradient = isSeason 
      ? 'from-amber-600 to-yellow-500' 
      : isMonth 
        ? 'from-blue-600 to-indigo-500' 
        : 'from-purple-600 to-fuchsia-500';

    const glowColor = isSeason ? 'bg-amber-500' : isMonth ? 'bg-blue-500' : 'bg-purple-500';

    return (
      <div className="relative group flex-1 min-w-[280px]">
        {/* Glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none",
          glowColor
        )} />
        
        <div className="relative bg-card border border-border rounded-3xl p-6 shadow-xl overflow-hidden h-full flex flex-col justify-between card-hover-lift">
          {/* Decorative Corner */}
          <div className={cn("absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none", glowColor)} />
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <div className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 shadow-sm text-white",
                `bg-gradient-to-r ${bgGradient}`
              )}>
                {isSeason ? <Crown size={12} /> : isMonth ? <Star size={12} /> : <Zap size={12} />}
                {title}
              </div>
              <p className="text-[11px] text-muted-foreground font-bold">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 relative z-10 mb-5">
            <Avatar 
              name={data.player.name} 
              size={64} 
              src={(data.player as any).profileImageUrl} 
              className={cn(
                "ring-4 ring-offset-2 ring-offset-card shadow-lg",
                isSeason ? "ring-amber-400" : isMonth ? "ring-blue-400" : "ring-purple-400"
              )} 
            />
            <div className="min-w-0">
              <p className="font-heading font-bold text-2xl text-foreground truncate leading-none mb-1">{data.player.name}</p>
              <p className="text-muted-foreground text-[12px] font-bold">👕 {data.player.jerseyNumber || '—'}</p>
            </div>
          </div>

          {/* Stats Ribbon */}
          <div className="grid grid-cols-3 gap-2 mt-auto relative z-10">
            <div className="bg-muted/50 rounded-xl p-2 text-center border border-border/50">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Points</p>
              <p className={cn(
                "font-heading font-bold text-xl",
                isSeason ? "text-amber-500" : isMonth ? "text-blue-500" : "text-purple-500"
              )}>{data.pts}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-2 text-center border border-border/50">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Goals</p>
              <p className="font-heading font-bold text-xl text-foreground flex items-center justify-center gap-1">
                {data.goals}
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-2 text-center border border-border/50">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">MOTM</p>
              <p className="font-heading font-bold text-xl text-foreground flex items-center justify-center gap-1">
                {data.motm}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const hasAnyTop = weekTop.data || monthTop.data || seasonTop.data;

  if (!hasAnyTop) return null;

  return (
    <div className="mb-12 stagger-children">
      <h3 className="font-heading font-bold text-[22px] tracking-tight mb-4 flex items-center gap-2">
        <SparklesIcon className="text-amber-500" /> Player Spotlights
      </h3>
      <div className="flex flex-col md:flex-row gap-6">
        {weekTop.data && (
          <SpotlightCard title="Player of the Week" subtitle={weekTop.label} data={weekTop.data} type="week" />
        )}
        {monthTop.data && (
          <SpotlightCard title="Player of the Month" subtitle={monthTop.label} data={monthTop.data} type="month" />
        )}
        {seasonTop.data && (
          <SpotlightCard title="Player of the Season" subtitle={seasonTop.label} data={seasonTop.data} type="season" />
        )}
      </div>
    </div>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("w-5 h-5", className)}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}
