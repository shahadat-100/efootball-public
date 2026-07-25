import { useRef, useState, useMemo } from 'react';
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
  getCurrentWeekLabel,
  getCurrentMonthLabel,
} from '@/features/gallery/utils/galleryStats';
import { Download, Image as ImageIcon, Sparkles, User, Award, Search, Maximize2 } from 'lucide-react';

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
  const { players, playerSeasonStats, playerWeeklyStats, playerMonthlyStats } = useFootballStore();

  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('player-profile');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id || '');
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('4:5');
  const [isDownloading, setIsDownloading] = useState(false);

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

  // Derived stats calculations
  const weeklyScorer = useMemo(() => getTopScorerWeekly(players, playerWeeklyStats), [players, playerWeeklyStats]);
  const monthlyScorer = useMemo(() => getTopScorerMonthly(players, playerMonthlyStats), [players, playerMonthlyStats]);

  const top3Weekly = useMemo(() => getTopPlayersWeekly(players, playerWeeklyStats, 3), [players, playerWeeklyStats]);
  const top3Monthly = useMemo(() => getTopPlayersMonthly(players, playerMonthlyStats, 3), [players, playerMonthlyStats]);
  const top10Weekly = useMemo(() => getTopPlayersWeekly(players, playerWeeklyStats, 10), [players, playerWeeklyStats]);
  const top10Monthly = useMemo(() => getTopPlayersMonthly(players, playerMonthlyStats, 10), [players, playerMonthlyStats]);

  const handleTemplateChange = (tmplId: TemplateType) => {
    setActiveTemplate(tmplId);
    const tmpl = TEMPLATES.find(t => t.id === tmplId);
    if (tmpl) setAspectRatio(tmpl.defaultAspect);
  };

  const handleDownload = async (format: 'png' | 'jpg') => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    let filename = `card-${activeTemplate}`;
    if (selectedPlayer && ['player-profile', 'birthday'].includes(activeTemplate)) {
      filename = `${selectedPlayer.name.toLowerCase().replace(/\s+/g, '-')}-${activeTemplate}`;
    } else if (activeTemplate === 'player-week' && top3Weekly[0]) {
      filename = `${top3Weekly[0].player.name.toLowerCase().replace(/\s+/g, '-')}-mvp-week`;
    } else if (activeTemplate === 'player-month' && top3Monthly[0]) {
      filename = `${top3Monthly[0].player.name.toLowerCase().replace(/\s+/g, '-')}-mvp-month`;
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
        {/* Left Column: Template & Player Selection Controls */}
        <div className="lg:col-span-5 space-y-6">

          {/* Aspect Ratio Selector */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-amber-500" />
              Aspect Ratio / Dimensions
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {(['4:5', '1:1', '16:9', '9:16'] as AspectRatioType[]).map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-2 text-xs font-black rounded-xl border transition-all ${
                    aspectRatio === ratio
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                      : 'bg-background border-border text-foreground hover:border-amber-500/40'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

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
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 shrink-0 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Live Preview ({aspectRatio})
          </p>

          <div className="w-full flex justify-center overflow-x-auto overflow-y-visible pb-12 pt-2">
            <div className="shadow-2xl rounded-3xl overflow-hidden origin-top scale-[0.4] sm:scale-[0.6] md:scale-[0.75] lg:scale-[0.65] xl:scale-[0.85] 2xl:scale-100 transition-transform flex-shrink-0">
            {activeTemplate === 'player-profile' && selectedPlayer && (
              <PlayerProfileCard
                cardRef={cardRef}
                player={selectedPlayer}
                seasonStats={selectedStats}
                title="PROFILE"
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
                  subtitle={`Player of the Week · ${getCurrentWeekLabel()}`}
                />
              ) : (
                <div className="text-center text-slate-400 py-20 text-xs w-full">No MVP stats recorded for this week yet.</div>
              )
            )}

            {activeTemplate === 'player-month' && (
              top3Monthly[0] ? (
                <PlayerProfileCard
                  cardRef={cardRef}
                  player={top3Monthly[0].player}
                  periodData={top3Monthly[0]}
                  title="MVP"
                  subtitle={`Player of the Month · ${getCurrentMonthLabel()}`}
                />
              ) : (
                <div className="text-center text-slate-400 py-20 text-xs w-full">No MVP stats recorded for this month yet.</div>
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
                subtitle={getCurrentWeekLabel()}
                aspect={aspectRatio}
              />
            )}

            {activeTemplate === 'podium-monthly' && (
              <PodiumCard
                cardRef={cardRef}
                topPlayers={top3Monthly}
                title="TOP 3 MONTHLY PODIUM"
                subtitle={getCurrentMonthLabel()}
                aspect={aspectRatio}
              />
            )}

            {activeTemplate === 'top10-weekly' && (
              <Top10Card
                cardRef={cardRef}
                topPlayers={top10Weekly}
                title="TOP 10 SQUAD OF THE WEEK"
                subtitle={getCurrentWeekLabel()}
                aspect={aspectRatio}
              />
            )}

            {activeTemplate === 'top10-monthly' && (
              <Top10Card
                cardRef={cardRef}
                topPlayers={top10Monthly}
                title="TOP 10 SQUAD OF THE MONTH"
                subtitle={getCurrentMonthLabel()}
                aspect={aspectRatio}
              />
            )}

            {activeTemplate === 'top-scorer-weekly' && (
              <TopScorerCard
                cardRef={cardRef}
                data={weeklyScorer}
                periodLabel={getCurrentWeekLabel()}
                type="weekly"
              />
            )}

            {activeTemplate === 'top-scorer-monthly' && (
              <TopScorerCard
                cardRef={cardRef}
                data={monthlyScorer}
                periodLabel={getCurrentMonthLabel()}
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
