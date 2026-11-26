import React, { useState, useMemo } from 'react';
import { Player, PlayerSeasonStat } from '@/features/players/types';
import { PlayerMonthlyStat, PlayerWeeklyStat } from '@/store/footballStore';
import {
  findLatestWeeklyPeriod,
  MONTHS_SHORT,
} from '@/features/overview/utils/leaderboardUtils';
import { Cake, Crown, Zap, Flame, Trophy, Sparkles } from 'lucide-react';

export interface CardStackItem {
  id: string;
  type: 'birthday' | 'potm' | 'potw' | 'top-scorer';
  tag: string;
  tagIcon: React.ReactNode;
  title: string;
  subtitle: string;
  player: Player;
  statValue: string;
  statLabel: string;
  accentColor: string;
  bgImage: string;
  badgeBg: string;
}

interface HeaderCardStackProps {
  players: Player[];
  playerSeasonStats: PlayerSeasonStat[];
  playerWeeklyStats?: PlayerWeeklyStat[];
  playerMonthlyStats?: PlayerMonthlyStat[];
  onPlayerClick?: (player: Player) => void;
}

const FALLBACK_PLAYER_IMAGE = '/images/player-fallback.png';

export const HeaderCardStack: React.FC<HeaderCardStackProps> = ({
  players,
  playerSeasonStats,
  playerWeeklyStats = [],
  playerMonthlyStats = [],
  onPlayerClick: _onPlayerClick,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // ── 1. Calculate All Card Stack Items ──
  const cards = useMemo<CardStackItem[]>(() => {
    if (players.length === 0) return [];

    const items: CardStackItem[] = [];
    const now = new Date();
    const today = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // A. 🎂 Birthday Cards (if any player has birthday today)
    players.forEach((p) => {
      if (!p.dateOfBirth) return;
      const rawBirthDate = p.dateOfBirth.slice(0, 10);
      const birthDate = new Date(rawBirthDate);
      if (Number.isNaN(birthDate.getTime())) return;
      const birthMonthDay = `${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;

      if (birthMonthDay === today) {
        items.push({
          id: `bday-${p.id}`,
          type: 'birthday',
          tag: 'BIRTHDAY TODAY',
          tagIcon: <Cake className="w-3.5 h-3.5 text-amber-300" />,
          title: 'HAPPY BIRTHDAY!',
          subtitle: 'Wish them a great day',
          player: p,
          statValue: '🎉 SPECIAL DAY',
          statLabel: 'Birthday Star',
          accentColor: '#FFD700',
          bgImage: '/images/gallery-bg/bg-enigmatic-elite.png',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
        });
      }
    });

    // Helper: compute points
    const computePoints = (s: { wins: number; draws: number; losses: number; goals: number; goalsConceded: number; hattricks: number; motmCount: number }) =>
      s.wins * 10 + s.draws * 5 - s.losses * 3 + s.goals - s.goalsConceded + s.motmCount * 4 + s.hattricks;

    // B. 👑 Player of the Month (Current & Last Month)
    const curYear = now.getFullYear();
    const curMonthIndex = now.getMonth();
    const curMonthName = MONTHS_SHORT[curMonthIndex];

    // Current Month POTM
    const curMonthRanked = players.map((p) => {
      const stats = playerMonthlyStats.filter((s) => s.playerId === p.id && s.monthIndex === curMonthIndex && s.year === curYear);
      const wins = stats.reduce((t, s) => t + s.wins, 0);
      const draws = stats.reduce((t, s) => t + s.draws, 0);
      const losses = stats.reduce((t, s) => t + s.losses, 0);
      const goals = stats.reduce((t, s) => t + s.goals, 0);
      const gc = stats.reduce((t, s) => t + (s.goalsConceded || 0), 0);
      const ht = stats.reduce((t, s) => t + (s.hattricks || 0), 0);
      const motm = stats.reduce((t, s) => t + (s.motmCount || 0), 0);
      const points = computePoints({ wins, draws, losses, goals, goalsConceded: gc, hattricks: ht, motmCount: motm });
      return { player: p, points, goals, matches: wins + draws + losses };
    }).filter((r) => r.matches > 0).sort((a, b) => b.points - a.points);

    if (curMonthRanked.length > 0) {
      const top = curMonthRanked[0];
      items.push({
        id: `potm-cur-${top.player.id}`,
        type: 'potm',
        tag: `POTM · ${curMonthName}`,
        tagIcon: <Crown className="w-3.5 h-3.5 text-red-400" />,
        title: 'PLAYER OF THE MONTH',
        subtitle: `${curMonthName} ${curYear} Leader`,
        player: top.player,
        statValue: `${top.points} PTS`,
        statLabel: `${top.goals} Goals · ${top.matches} Matches`,
        accentColor: '#ef4444',
        bgImage: '/images/gallery-bg/bg-mvp-month.jpg',
        badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
      });
    }

    // Last Month POTM
    const lastMonthIndex = curMonthIndex === 0 ? 11 : curMonthIndex - 1;
    const lastMonthYear = curMonthIndex === 0 ? curYear - 1 : curYear;
    const lastMonthName = MONTHS_SHORT[lastMonthIndex];

    const lastMonthRanked = players.map((p) => {
      const stats = playerMonthlyStats.filter((s) => s.playerId === p.id && s.monthIndex === lastMonthIndex && s.year === lastMonthYear);
      const wins = stats.reduce((t, s) => t + s.wins, 0);
      const draws = stats.reduce((t, s) => t + s.draws, 0);
      const losses = stats.reduce((t, s) => t + s.losses, 0);
      const goals = stats.reduce((t, s) => t + s.goals, 0);
      const gc = stats.reduce((t, s) => t + (s.goalsConceded || 0), 0);
      const ht = stats.reduce((t, s) => t + (s.hattricks || 0), 0);
      const motm = stats.reduce((t, s) => t + (s.motmCount || 0), 0);
      const points = computePoints({ wins, draws, losses, goals, goalsConceded: gc, hattricks: ht, motmCount: motm });
      return { player: p, points, goals, matches: wins + draws + losses };
    }).filter((r) => r.matches > 0).sort((a, b) => b.points - a.points);

    if (lastMonthRanked.length > 0) {
      const topLast = lastMonthRanked[0];
      items.push({
        id: `potm-last-${topLast.player.id}`,
        type: 'potm',
        tag: `POTM · ${lastMonthName}`,
        tagIcon: <Trophy className="w-3.5 h-3.5 text-amber-400" />,
        title: 'LAST MONTH MVP',
        subtitle: `${lastMonthName} ${lastMonthYear} Winner`,
        player: topLast.player,
        statValue: `${topLast.points} PTS`,
        statLabel: `${topLast.goals} Goals · Reigning MVP`,
        accentColor: '#f59e0b',
        bgImage: '/images/gallery-bg/bg-player-of-month.png',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      });
    }

    // C. ⚡ Player of the Week (Current Week & Last Week)
    const latestWeekly = findLatestWeeklyPeriod(playerWeeklyStats);
    const curWeekRanked = players.map((p) => {
      const stats = playerWeeklyStats.filter(
        (s) => Number(s.year) === latestWeekly.year && Number(s.monthIndex) === latestWeekly.monthIndex && Number(s.week) === latestWeekly.week && s.playerId === p.id
      );
      const wins = stats.reduce((t, s) => t + s.wins, 0);
      const draws = stats.reduce((t, s) => t + s.draws, 0);
      const losses = stats.reduce((t, s) => t + s.losses, 0);
      const goals = stats.reduce((t, s) => t + s.goals, 0);
      const gc = stats.reduce((t, s) => t + (s.goalsConceded || 0), 0);
      const ht = stats.reduce((t, s) => t + (s.hattricks || 0), 0);
      const motm = stats.reduce((t, s) => t + (s.motmCount || 0), 0);
      const points = computePoints({ wins, draws, losses, goals, goalsConceded: gc, hattricks: ht, motmCount: motm });
      return { player: p, points, goals, matches: wins + draws + losses };
    }).filter((r) => r.matches > 0).sort((a, b) => b.points - a.points);

    if (curWeekRanked.length > 0) {
      const topWeek = curWeekRanked[0];
      items.push({
        id: `potw-cur-${topWeek.player.id}`,
        type: 'potw',
        tag: `POTW · WEEK ${latestWeekly.week}`,
        tagIcon: <Zap className="w-3.5 h-3.5 text-sky-400" />,
        title: 'PLAYER OF THE WEEK',
        subtitle: `Week ${latestWeekly.week} Peak Form`,
        player: topWeek.player,
        statValue: `${topWeek.points} PTS`,
        statLabel: `${topWeek.goals} Goals · In-Form Star`,
        accentColor: '#38bdf8',
        bgImage: '/images/gallery-bg/bg-mvp-week.png',
        badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
      });
    }

    // D. ⚽ Top Scorers (Week, Month & Season Golden Boot)
    // 1) Top Scorer Week
    const weekScorers = players.map((p) => {
      const stats = playerWeeklyStats.filter(
        (s) => Number(s.year) === latestWeekly.year && Number(s.monthIndex) === latestWeekly.monthIndex && Number(s.week) === latestWeekly.week && s.playerId === p.id
      );
      const goals = stats.reduce((t, s) => t + s.goals, 0);
      return { player: p, goals };
    }).filter((r) => r.goals > 0).sort((a, b) => b.goals - a.goals);

    if (weekScorers.length > 0) {
      const topWeekScorer = weekScorers[0];
      items.push({
        id: `scorer-week-${topWeekScorer.player.id}`,
        type: 'top-scorer',
        tag: 'TOP SCORER · WEEK',
        tagIcon: <Flame className="w-3.5 h-3.5 text-orange-400" />,
        title: 'TOP SCORER (WEEK)',
        subtitle: `Matchday Firepower`,
        player: topWeekScorer.player,
        statValue: `${topWeekScorer.goals} GOALS`,
        statLabel: `Week ${latestWeekly.week} Top Gun`,
        accentColor: '#f97316',
        bgImage: '/images/gallery-bg/bg-top-scorer-week.png',
        badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      });
    }

    // 2) Top Scorer Month
    const monthScorers = players.map((p) => {
      const stats = playerMonthlyStats.filter((s) => s.playerId === p.id && s.monthIndex === curMonthIndex && s.year === curYear);
      const goals = stats.reduce((t, s) => t + s.goals, 0);
      return { player: p, goals };
    }).filter((r) => r.goals > 0).sort((a, b) => b.goals - a.goals);

    if (monthScorers.length > 0) {
      const topMonthScorer = monthScorers[0];
      items.push({
        id: `scorer-month-${topMonthScorer.player.id}`,
        type: 'top-scorer',
        tag: `TOP SCORER · ${curMonthName}`,
        tagIcon: <Flame className="w-3.5 h-3.5 text-rose-400" />,
        title: 'TOP SCORER (MONTH)',
        subtitle: `${curMonthName} Goal Machine`,
        player: topMonthScorer.player,
        statValue: `${topMonthScorer.goals} GOALS`,
        statLabel: `${curMonthName} Top Scorer`,
        accentColor: '#f43f5e',
        bgImage: '/images/gallery-bg/bg-top-scorer-month.jpg',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      });
    }

    // 3) Season Golden Boot Leader
    const seasonScorers = players.map((p) => {
      const stats = playerSeasonStats.filter((s) => s.playerId === p.id);
      const goals = stats.reduce((t, s) => t + (s.goals || 0), 0);
      return { player: p, goals };
    }).filter((r) => r.goals > 0).sort((a, b) => b.goals - a.goals);

    if (seasonScorers.length > 0) {
      const goldenBoot = seasonScorers[0];
      items.push({
        id: `golden-boot-${goldenBoot.player.id}`,
        type: 'top-scorer',
        tag: 'GOLDEN BOOT',
        tagIcon: <Trophy className="w-3.5 h-3.5 text-amber-300" />,
        title: 'GOLDEN BOOT LEADER',
        subtitle: 'All-Time Club Top Scorer',
        player: goldenBoot.player,
        statValue: `${goldenBoot.goals} GOALS`,
        statLabel: 'Club Top Marksman',
        accentColor: '#eab308',
        bgImage: '/images/gallery-bg/bg-golden-boot.jpg',
        badgeBg: 'bg-amber-500/25 text-amber-300 border-amber-400/50',
      });
    }

    // Fallback if very few items: Add players or club showcase cards
    if (items.length < 3) {
      if (players.length > 0) {
        players.slice(0, 3).forEach((p, i) => {
          items.push({
            id: `featured-${p.id}-${i}`,
            type: 'potm',
            tag: 'CLUB ELITE',
            tagIcon: <Sparkles className="w-3.5 h-3.5 text-red-400" />,
            title: 'THE ENIGMATIC ELITE',
            subtitle: 'Featured Player',
            player: p,
            statValue: `#${p.jerseyNumber ?? i + 1}`,
            statLabel: 'Squad Member',
            accentColor: '#ef4444',
            bgImage: '/images/gallery-bg/bg-enigmatic-elite.png',
            badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
          });
        });
      } else {
        // Guaranteed fallback cards even before data loads so deck never disappears
        const defaultPlayer: Player = {
          id: 'elite-default-star',
          name: 'THE ENIGMATIC ELITE',
          jerseyNumber: 10,
          playerRoles: ['Forward'],
          customTags: [],
          customStringTags: [],
          createdAt: new Date().toISOString(),
          seasons: [],
          email: 'elite@club.com',
          profileImageUrl: FALLBACK_PLAYER_IMAGE,
        };

        items.push(
          {
            id: 'fallback-golden-boot',
            type: 'top-scorer',
            tag: 'GOLDEN BOOT',
            tagIcon: <Trophy className="w-3.5 h-3.5 text-amber-300" />,
            title: 'GOLDEN BOOT',
            subtitle: 'Club Top Scorer',
            player: defaultPlayer,
            statValue: 'GOLDEN BOOT',
            statLabel: 'Top Marksman',
            accentColor: '#eab308',
            bgImage: '/images/gallery-bg/bg-golden-boot.jpg',
            badgeBg: 'bg-amber-500/25 text-amber-300 border-amber-400/50',
          },
          {
            id: 'fallback-potm',
            type: 'potm',
            tag: 'MVP OF THE MONTH',
            tagIcon: <Crown className="w-3.5 h-3.5 text-red-400" />,
            title: 'PLAYER OF THE MONTH',
            subtitle: 'Club Monthly MVP',
            player: defaultPlayer,
            statValue: 'MVP FORM',
            statLabel: 'Top Form',
            accentColor: '#ef4444',
            bgImage: '/images/gallery-bg/bg-mvp-month.jpg',
            badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
          },
          {
            id: 'fallback-elite',
            type: 'potw',
            tag: 'THE ENIGMATIC ELITE',
            tagIcon: <Sparkles className="w-3.5 h-3.5 text-sky-400" />,
            title: 'IN MYSTERY WE REIGN',
            subtitle: 'Matchday Squad',
            player: defaultPlayer,
            statValue: '#10 SQUAD',
            statLabel: 'Squad Roster',
            accentColor: '#38bdf8',
            bgImage: '/images/gallery-bg/bg-enigmatic-elite.png',
            badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
          }
        );
      }
    }

    return items;
  }, [players, playerSeasonStats, playerWeeklyStats, playerMonthlyStats]);

  const totalCards = cards.length;

  const nextCard = () => {
    if (totalCards <= 1) return;
    setActiveIndex((prev) => (prev + 1) % totalCards);
  };

  if (totalCards === 0) return null;

  return (
    <div className="relative flex flex-col items-center select-none" style={{ perspective: '1400px' }}>
      
      {/* ═══ 3D CoverFlow / Card Stack Container ═══ */}
      <div
        className="relative w-[240px] sm:w-[270px] md:w-[290px] h-[350px] sm:h-[390px] md:h-[420px]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {cards.map((card, i) => {
          // Calculate relative position from activeIndex in range [-half, +half]
          let diff = i - activeIndex;
          if (diff > totalCards / 2) diff -= totalCards;
          if (diff < -totalCards / 2) diff += totalCards;

          const isCenter = diff === 0;
          const isHoveredThis = hoveredIndex === i;
          const isVisible = Math.abs(diff) <= 2;

          let transformStyle = '';
          let zIndex = 30 - Math.abs(diff) * 10;
          let opacity = 1;
          let filter = 'none';

          if (!isVisible) {
            transformStyle = 'translate3d(0, 0, -120px) scale(0.6)';
            opacity = 0;
            zIndex = 0;
          } else if (isCenter) {
            zIndex = 35;
            if (isHoveredThis) {
              // Portfolio book pull-out effect: moves forward and up, scales up
              transformStyle = 'translate3d(0, -18px, 90px) rotateY(0deg) scale(1.08)';
            } else {
              transformStyle = 'translate3d(0, 0, 30px) rotateY(0deg) scale(1.02)';
            }
            opacity = 1;
            filter = 'none';
          } else if (diff === 1) {
            // Right 1 (immediately behind center to the right)
            zIndex = 25;
            if (isHoveredThis) {
              transformStyle = 'translate3d(clamp(65px, 9vw, 105px), -12px, 60px) rotateY(-12deg) scale(0.96)';
              filter = 'brightness(0.9)';
            } else {
              transformStyle = 'translate3d(clamp(50px, 7.5vw, 85px), 0, -25px) rotateY(-24deg) scale(0.88)';
              filter = 'brightness(0.7)';
            }
            opacity = 0.88;
          } else if (diff === -1) {
            // Left 1 (immediately behind center to the left)
            zIndex = 25;
            if (isHoveredThis) {
              transformStyle = 'translate3d(clamp(-105px, -9vw, -65px), -12px, 60px) rotateY(12deg) scale(0.96)';
              filter = 'brightness(0.9)';
            } else {
              transformStyle = 'translate3d(clamp(-85px, -7.5vw, -50px), 0, -25px) rotateY(24deg) scale(0.88)';
              filter = 'brightness(0.7)';
            }
            opacity = 0.88;
          } else if (diff === 2) {
            // Right 2 (further behind)
            zIndex = 15;
            if (isHoveredThis) {
              transformStyle = 'translate3d(clamp(115px, 15vw, 160px), -8px, 20px) rotateY(-20deg) scale(0.84)';
              filter = 'brightness(0.75)';
            } else {
              transformStyle = 'translate3d(clamp(95px, 13vw, 140px), 0, -70px) rotateY(-36deg) scale(0.76)';
              filter = 'brightness(0.45)';
            }
            opacity = 0.55;
          } else if (diff === -2) {
            // Left 2 (further behind)
            zIndex = 15;
            if (isHoveredThis) {
              transformStyle = 'translate3d(clamp(-160px, -15vw, -115px), -8px, 20px) rotateY(20deg) scale(0.84)';
              filter = 'brightness(0.75)';
            } else {
              transformStyle = 'translate3d(clamp(-140px, -13vw, -95px), 0, -70px) rotateY(36deg) scale(0.76)';
              filter = 'brightness(0.45)';
            }
            opacity = 0.55;
          }

          const imageSrc =
            card.player.coverImageUrl || card.player.profileImageUrl || FALLBACK_PLAYER_IMAGE;

          return (
            <div
              key={card.id}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => {
                if (isCenter) {
                  nextCard();
                } else {
                  setActiveIndex(i);
                }
              }}
              style={{
                transform: transformStyle,
                zIndex,
                opacity,
                filter,
                transition: 'transform 0.42s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease, filter 0.35s ease',
                transformStyle: 'preserve-3d',
                pointerEvents: isVisible ? 'auto' : 'none',
              }}
              className="absolute inset-0 cursor-pointer rounded-none overflow-hidden border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.85)] bg-[#0d0e14] group"
            >
              {/* Card Template Background Image */}
              <img
                src={card.bgImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                onError={(e) => {
                  e.currentTarget.src = '/images/gallery-bg/bg-enigmatic-elite.png';
                }}
              />

              {/* Dark Vignette Overlay for Crisp Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30 pointer-events-none" />

              {/* Player Photo Cutout in Center */}
              <div className="absolute inset-x-0 bottom-10 h-[78%] z-10 pointer-events-none flex items-end justify-center overflow-hidden">
                <img
                  src={imageSrc}
                  alt={card.player.name}
                  className="h-full w-auto max-w-[95%] object-contain object-bottom group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_PLAYER_IMAGE;
                  }}
                />
              </div>

              {/* Bottom: Player Name & Stat Value */}
              <div className="absolute bottom-0 inset-x-0 p-3.5 z-20 bg-gradient-to-t from-black via-black/90 to-transparent pt-5 flex items-baseline justify-between">
                <h4 className="font-heading text-lg sm:text-xl font-black text-white uppercase tracking-tight truncate max-w-[70%]">
                  {card.player.name}
                </h4>
                <div
                  className="font-mono text-xs sm:text-sm font-black px-2 py-0.5 rounded-none border backdrop-blur-sm"
                  style={{
                    color: card.accentColor,
                    borderColor: `${card.accentColor}60`,
                    backgroundColor: `${card.accentColor}18`,
                  }}
                >
                  {card.statValue}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Deck Indicator (Dots Counter) ═══ */}
      <div className="flex items-center justify-center gap-1.5 mt-5 z-20">
        {cards.slice(0, 7).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            aria-label={`Go to card ${idx + 1}`}
            className={`h-1.5 transition-all duration-300 rounded-none ${
              idx === activeIndex
                ? 'w-6 bg-[#bc0100] shadow-[0_0_8px_rgba(188,1,0,0.8)]'
                : 'w-1.5 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

    </div>
  );
};
