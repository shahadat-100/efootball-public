import { useRef, useState, useMemo, useEffect } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { PlayerProfileCard } from '@/features/gallery/components/templates/PlayerProfileCard';
import { TopScorerCard } from '@/features/gallery/components/templates/TopScorerCard';
import { PodiumCard } from '@/features/gallery/components/templates/PodiumCard';
import { Top10Card } from '@/features/gallery/components/templates/Top10Card';
import { BirthdayCard } from '@/features/gallery/components/templates/BirthdayCard';
import { downloadCard } from '@/features/gallery/components/shared/downloadCard';
import {
  getTopScorerWeekly,
  getTopScorerMonthly,
  getTopPlayersWeekly,
  getTopPlayersMonthly,
  getLast4Weeks,
  getLast3Months,
} from '@/features/gallery/utils/galleryStats';
import {
  Download,
  Image as ImageIcon,
  Sparkles,
  User,
  Award,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

type TemplateType =
  | 'player-profile'
  | 'top-scorer-weekly'
  | 'top-scorer-monthly'
  | 'podium-weekly'
  | 'podium-monthly'
  | 'top10-weekly'
  | 'top10-monthly'
  | 'player-week'
  | 'player-month'
  | 'birthday';

type AspectRatioType = '4:5' | '1:1' | '16:9' | '9:16';

const TEMPLATES: { id: TemplateType; label: string; category: string; defaultAspect: AspectRatioType }[] = [
  { id: 'player-profile', label: 'Player Profile Card', category: 'Individual', defaultAspect: '4:5' },
  { id: 'player-week', label: 'Player of the Week MVP', category: 'Individual', defaultAspect: '4:5' },
  { id: 'player-month', label: 'Player of the Month MVP', category: 'Individual', defaultAspect: '4:5' },
  { id: 'birthday', label: 'Birthday Celebration Card', category: 'Individual', defaultAspect: '4:5' },

  { id: 'podium-weekly', label: 'Top 3 Podium (Weekly)', category: 'Leaderboard', defaultAspect: '16:9' },
  { id: 'podium-monthly', label: 'Top 3 Podium (Monthly)', category: 'Leaderboard', defaultAspect: '16:9' },
  { id: 'top10-weekly', label: 'Top 10 Squad (Weekly)', category: 'Leaderboard', defaultAspect: '16:9' },
  { id: 'top10-monthly', label: 'Top 10 Squad (Monthly)', category: 'Leaderboard', defaultAspect: '16:9' },

  { id: 'top-scorer-weekly', label: 'Top Scorer of the Week', category: 'Golden Boot', defaultAspect: '4:5' },
  { id: 'top-scorer-monthly', label: 'Top Scorer of the Month', category: 'Golden Boot', defaultAspect: '4:5' },
];

export function Gallery() {
  const {
    players,
    playerSeasonStats,
    playerWeeklyStats,
    playerMonthlyStats,
    fetchPlayers,
    fetchPlayerSeasonStats,
    fetchPlayerWeeklyStats,
    fetchPlayerMonthlyStats,
  } = useFootballStore();

  useEffect(() => {
    fetchPlayers();
    fetchPlayerSeasonStats();
    fetchPlayerWeeklyStats();
    fetchPlayerMonthlyStats();
  }, [fetchPlayers, fetchPlayerSeasonStats, fetchPlayerWeeklyStats, fetchPlayerMonthlyStats]);

  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('player-profile');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');

  useEffect(() => {
    if (!selectedPlayerId && players.length > 0) {
      const shakib = players.find(p => p.coverImageUrl || p.name.toLowerCase().includes('shakib'));
      setSelectedPlayerId(shakib ? shakib.id : players[0].id);
    }
  }, [players, selectedPlayerId]);
  const aspectRatio = (TEMPLATES.find(t => t.id === activeTemplate)?.defaultAspect ?? '4:5') as AspectRatioType;
  const [isDownloading, setIsDownloading] = useState(false);

  // Available periods (last 4 weeks & last 3 months)
  const weekOptions = useMemo(() => getLast4Weeks(), []);
  const monthOptions = useMemo(() => getLast3Months(), []);

  // Selection states (index 0 is current period)
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(0);

  const selectedWeek = weekOptions[selectedWeekIndex] || weekOptions[0];
  const selectedMonth = monthOptions[selectedMonthIndex] || monthOptions[0];

  const isWeeklyTemplate = ['player-week', 'podium-weekly', 'top10-weekly', 'top-scorer-weekly'].includes(activeTemplate);
  const isMonthlyTemplate = ['player-month', 'podium-monthly', 'top10-monthly', 'top-scorer-monthly'].includes(activeTemplate);

  const cardRef = useRef<HTMLDivElement>(null);

  // Filtered player list based on search query
  const filteredPlayers = useMemo(() => {
    if (!playerSearchQuery.trim()) return players;
    return players.filter(p =>
      p.name.toLowerCase().includes(playerSearchQuery.toLowerCase()) ||
      (p.jerseyNumber && String(p.jerseyNumber).includes(playerSearchQuery))
    );
  }, [players, playerSearchQuery]);

  const selectedPlayer = players.find(p => p.id === selectedPlayerId) || filteredPlayers[0] || players[0];
  const selectedStats = playerSeasonStats.filter(s => s.playerId === selectedPlayer?.id);

  // Derived stats calculations based on selected periods
  const weeklyScorer = useMemo(
    () => getTopScorerWeekly(players, playerWeeklyStats, selectedWeek),
    [players, playerWeeklyStats, selectedWeek]
  );
  const monthlyScorer = useMemo(
    () => getTopScorerMonthly(players, playerMonthlyStats, selectedMonth),
    [players, playerMonthlyStats, selectedMonth]
  );

  const top3Weekly = useMemo(
    () => getTopPlayersWeekly(players, playerWeeklyStats, 3, selectedWeek),
    [players, playerWeeklyStats, selectedWeek]
  );
  const top3Monthly = useMemo(
    () => getTopPlayersMonthly(players, playerMonthlyStats, 3, selectedMonth),
    [players, playerMonthlyStats, selectedMonth]
  );
  const top10Weekly = useMemo(
    () => getTopPlayersWeekly(players, playerWeeklyStats, 10, selectedWeek),
    [players, playerWeeklyStats, selectedWeek]
  );
  const top10Monthly = useMemo(
    () => getTopPlayersMonthly(players, playerMonthlyStats, 10, selectedMonth),
    [players, playerMonthlyStats, selectedMonth]
  );

  const handleTemplateChange = (tmplId: TemplateType) => {
    setActiveTemplate(tmplId);
  };

  const handleDownload = async (format: 'png' | 'jpg') => {
    if (!cardRef.current) return;

    // Check if the current period is not completed yet and prompt warning
    if (isWeeklyTemplate && !selectedWeek.isOver) {
      const proceed = window.confirm(
        `⚠️ WARNING: ${selectedWeek.label} is currently in progress and not finished yet!\n\nWeekly awards should typically be created after the week is over.\n\nDo you still want to generate and download this image?`
      );
      if (!proceed) return;
    }

    if (isMonthlyTemplate && !selectedMonth.isOver) {
      const proceed = window.confirm(
        `⚠️ WARNING: ${selectedMonth.label} is currently in progress and not finished yet!\n\nMonthly awards should typically be created after the month is over.\n\nDo you still want to generate and download this image?`
      );
      if (!proceed) return;
    }

    setIsDownloading(true);
    let filename = `card-${activeTemplate}`;
    if (selectedPlayer && ['player-profile', 'birthday'].includes(activeTemplate)) {
      filename = `${selectedPlayer.name.toLowerCase().replace(/\s+/g, '-')}-${activeTemplate}`;
    } else if (activeTemplate === 'player-week' && top3Weekly[0]) {
      filename = `${top3Weekly[0].player.name.toLowerCase().replace(/\s+/g, '-')}-mvp-week-${selectedWeek.week}`;
    } else if (activeTemplate === 'player-month' && top3Monthly[0]) {
      filename = `${top3Monthly[0].player.name.toLowerCase().replace(/\s+/g, '-')}-mvp-month-${selectedMonth.monthIndex + 1}`;
    } else if (isWeeklyTemplate) {
      filename = `${activeTemplate}-week-${selectedWeek.week}`;
    } else if (isMonthlyTemplate) {
      filename = `${activeTemplate}-month-${selectedMonth.monthIndex + 1}`;
    }
    await downloadCard(cardRef.current, filename, format);
    setIsDownloading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <h2 className="font-heading font-bold text-2xl tracking-wide flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-amber-500" />
            Social Media Gallery & Card Generator
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            Generate and export high-resolution custom cards for social media sharing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Template & Period / Player Selection Controls */}
        <div className="lg:col-span-5 space-y-6">

          {/* Template Picker */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Choose Template ({TEMPLATES.length})
            </h3>

            <div className="flex flex-wrap gap-2 max-h-[320px] overflow-y-auto pr-1">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateChange(t.id)}
                  className={`text-left px-4 py-2 rounded-full border transition-all text-[11px] font-bold flex items-center gap-2 ${
                    activeTemplate === t.id
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                      : 'bg-background border-border text-foreground hover:border-amber-500/40 hover:bg-amber-500/10'
                  }`}
                >
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Period Selector (4 Weeks) */}
          {isWeeklyTemplate && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Select Week (Last 4 Weeks)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {weekOptions.map((opt, idx) => {
                  const isSelected = selectedWeekIndex === idx;
                  return (
                    <button
                      key={`${opt.year}-${opt.monthIndex}-${opt.week}`}
                      onClick={() => setSelectedWeekIndex(idx)}
                      className={`text-left p-3 rounded-xl border transition-all text-xs font-semibold flex flex-col gap-2 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-sm ring-1 ring-amber-500'
                          : 'bg-background border-border text-foreground hover:border-amber-500/40 hover:bg-amber-500/5'
                      }`}
                    >
                      <span className="font-bold text-xs">{opt.label}</span>
                      <div>
                        {opt.isOver ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Week Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold text-[10px] border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" /> In Progress (Not Over)
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Warning Notice if Selected Week is In Progress */}
              {!selectedWeek.isOver && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-2.5 text-amber-400 animate-in fade-in duration-200">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-amber-300">Week Not Over Yet</p>
                    <p className="text-amber-200/80 leading-relaxed text-[11px]">
                      {selectedWeek.label} is currently in progress. Weekly awards and MVP images should normally be created after the week concludes.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Monthly Period Selector (Last 3 Months) */}
          {isMonthlyTemplate && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Select Month (Last 3 Months)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {monthOptions.map((opt, idx) => {
                  const isSelected = selectedMonthIndex === idx;
                  return (
                    <button
                      key={`${opt.year}-${opt.monthIndex}`}
                      onClick={() => setSelectedMonthIndex(idx)}
                      className={`text-left p-3 rounded-xl border transition-all text-xs font-semibold flex flex-col gap-2 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-sm ring-1 ring-amber-500'
                          : 'bg-background border-border text-foreground hover:border-amber-500/40 hover:bg-amber-500/5'
                      }`}
                    >
                      <span className="font-bold text-xs">{opt.label}</span>
                      <div>
                        {opt.isOver ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold text-[10px] border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" /> In Progress
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Warning Notice if Selected Month is In Progress */}
              {!selectedMonth.isOver && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-2.5 text-amber-400 animate-in fade-in duration-200">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-amber-300">Month Not Over Yet</p>
                    <p className="text-amber-200/80 leading-relaxed text-[11px]">
                      {selectedMonth.label} is currently in progress. Monthly MVP and award images should normally be created after the month concludes.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Player Search & Selection */}
          {['player-profile', 'birthday'].includes(activeTemplate) && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="font-bold text-base flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" />
                Select Player (Search)
              </h3>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search player by name or jersey..."
                  value={playerSearchQuery}
                  onChange={e => setPlayerSearchQuery(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Search Results List */}
              <div className="max-h-48 overflow-y-auto border border-border rounded-xl divide-y divide-border">
                {filteredPlayers.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlayerId(p.id)}
                    className={`w-full text-left px-3 py-2.5 text-xs font-bold flex items-center justify-between transition-colors ${
                      selectedPlayer?.id === p.id
                        ? 'bg-amber-500/15 text-amber-500'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {p.jerseyNumber ? `#${p.jerseyNumber}` : ''}
                    </span>
                  </button>
                ))}
                {filteredPlayers.length === 0 && (
                  <p className="p-3 text-xs text-muted-foreground text-center">No player found matching search</p>
                )}
              </div>
            </div>
          )}

          {/* Export Action Card */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Download className="w-4 h-4 text-amber-500" />
              Export Image
            </h3>

            {((isWeeklyTemplate && !selectedWeek.isOver) || (isMonthlyTemplate && !selectedMonth.isOver)) && (
              <p className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Notice: Selected period is currently in progress. Final stats may differ.</span>
              </p>
            )}

            <div>
              <button
                disabled={isDownloading}
                onClick={() => handleDownload('png')}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download Card (PNG)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Card Preview (Scrollable & Responsive) */}
        <div className="lg:col-span-7 flex flex-col items-center bg-slate-950/5 rounded-3xl p-4 sm:p-8 border border-dashed border-border min-h-[600px] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between w-full mb-4 px-2 gap-2">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground shrink-0 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Live Preview ({aspectRatio})
            </p>

            {/* In-progress badge on preview */}
            {isWeeklyTemplate && (
              selectedWeek.isOver ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {selectedWeek.label} · Finalized
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {selectedWeek.label} · In Progress
                </span>
              )
            )}

            {isMonthlyTemplate && (
              selectedMonth.isOver ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {selectedMonth.label} · Finalized
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {selectedMonth.label} · In Progress
                </span>
              )
            )}
          </div>

          <div className="w-full flex justify-center overflow-x-auto overflow-y-visible pb-12 pt-2">
            <div className="shadow-2xl rounded-3xl overflow-hidden origin-top scale-[0.4] sm:scale-[0.6] md:scale-[0.75] lg:scale-[0.65] xl:scale-[0.85] 2xl:scale-100 transition-transform flex-shrink-0">
            {activeTemplate === 'player-profile' && selectedPlayer && (
              <PlayerProfileCard
                cardRef={cardRef}
                player={selectedPlayer}
                seasonStats={selectedStats}
                subtitle="Player Profile"
              />
            )}

            {activeTemplate === 'player-week' && (
              top3Weekly[0] ? (
                <PlayerProfileCard
                  cardRef={cardRef}
                  player={top3Weekly[0].player}
                  periodData={top3Weekly[0]}
                  title="MVP"
                  subtitle={`Player of the Week · ${selectedWeek.label}`}
                />
              ) : (
                <div className="text-center text-slate-400 py-20 text-xs w-full">No MVP stats recorded for {selectedWeek.label} yet.</div>
              )
            )}

            {activeTemplate === 'player-month' && (
              top3Monthly[0] ? (
                <PlayerProfileCard
                  cardRef={cardRef}
                  player={top3Monthly[0].player}
                  periodData={top3Monthly[0]}
                  title="MVP"
                  subtitle={`Player of the Month · ${selectedMonth.label}`}
                />
              ) : (
                <div className="text-center text-slate-400 py-20 text-xs w-full">No MVP stats recorded for {selectedMonth.label} yet.</div>
              )
            )}

            {activeTemplate === 'birthday' && selectedPlayer && (
              <BirthdayCard
                cardRef={cardRef}
                player={selectedPlayer}
                aspect={aspectRatio}
              />
            )}

            {activeTemplate === 'podium-weekly' && (
              <PodiumCard
                cardRef={cardRef}
                topPlayers={top3Weekly}
                title="TOP 3 WEEKLY PODIUM"
                subtitle={selectedWeek.label}
                aspect={aspectRatio}
              />
            )}

            {activeTemplate === 'podium-monthly' && (
              <PodiumCard
                cardRef={cardRef}
                topPlayers={top3Monthly}
                title="TOP 3 MONTHLY PODIUM"
                subtitle={selectedMonth.label}
                aspect={aspectRatio}
              />
            )}

            {activeTemplate === 'top10-weekly' && (
              <Top10Card
                cardRef={cardRef}
                topPlayers={top10Weekly}
                title="TOP 10 SQUAD OF THE WEEK"
                subtitle={selectedWeek.label}
                aspect={aspectRatio}
              />
            )}

            {activeTemplate === 'top10-monthly' && (
              <Top10Card
                cardRef={cardRef}
                topPlayers={top10Monthly}
                title="TOP 10 SQUAD OF THE MONTH"
                subtitle={selectedMonth.label}
                aspect={aspectRatio}
              />
            )}

            {activeTemplate === 'top-scorer-weekly' && (
              <TopScorerCard
                cardRef={cardRef}
                data={weeklyScorer}
                periodLabel={selectedWeek.label}
                type="weekly"
              />
            )}

            {activeTemplate === 'top-scorer-monthly' && (
              <TopScorerCard
                cardRef={cardRef}
                data={monthlyScorer}
                periodLabel={selectedMonth.label}
                type="monthly"
              />
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
