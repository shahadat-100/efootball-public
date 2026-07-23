import React, { useRef, useState } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { PlayerProfileCard } from '@/features/gallery/components/templates/PlayerProfileCard';
import { TopScorerCard } from '@/features/gallery/components/templates/TopScorerCard';
import { downloadCard } from '@/features/gallery/components/shared/downloadCard';
import {
  getTopScorerWeekly,
  getTopScorerMonthly,
  getTopScorerSeason,
  getCurrentWeekLabel,
  getCurrentMonthLabel,
} from '@/features/gallery/utils/galleryStats';
import { Download, Image as ImageIcon, Sparkles, User, Flame, Award } from 'lucide-react';

type TemplateType =
  | 'player-profile'
  | 'top-scorer-weekly'
  | 'top-scorer-monthly'
  | 'top-scorer-season';

const TEMPLATES: { id: TemplateType; label: string; category: string }[] = [
  { id: 'player-profile', label: 'Player Profile Card', category: 'Individual Player' },
  { id: 'top-scorer-weekly', label: 'Top Scorer of the Week', category: 'Spotlight' },
  { id: 'top-scorer-monthly', label: 'Top Scorer of the Month', category: 'Spotlight' },
  { id: 'top-scorer-season', label: 'Golden Boot (Season Leader)', category: 'Spotlight' },
];

export function Gallery() {
  const { players, playerSeasonStats, playerWeeklyStats, playerMonthlyStats } = useFootballStore();

  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('player-profile');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id || '');
  const [isDownloading, setIsDownloading] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const selectedPlayer = players.find(p => p.id === selectedPlayerId) || players[0];
  const selectedStats = playerSeasonStats.filter(s => s.playerId === selectedPlayerId);

  // Derived top scorers
  const weeklyScorer = getTopScorerWeekly(players, playerWeeklyStats);
  const monthlyScorer = getTopScorerMonthly(players, playerMonthlyStats);
  const seasonScorer = getTopScorerSeason(players, playerSeasonStats);

  const handleDownload = async (format: 'png' | 'jpg') => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    let filename = `card-${activeTemplate}`;
    if (activeTemplate === 'player-profile' && selectedPlayer) {
      filename = `${selectedPlayer.name.toLowerCase().replace(/\s+/g, '-')}-profile-card`;
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
          {/* Template Picker */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Choose Template
            </h3>

            <div className="grid grid-cols-1 gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTemplate(t.id)}
                  className={`text-left p-3 rounded-xl border transition-all text-xs font-bold flex items-center justify-between ${
                    activeTemplate === t.id
                      ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-xs'
                      : 'bg-background border-border text-foreground hover:border-amber-500/30'
                  }`}
                >
                  <span>{t.label}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded-md">
                    {t.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Options */}
          {activeTemplate === 'player-profile' && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="font-bold text-base flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" />
                Select Player
              </h3>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">Select Player for Card</label>
                <select
                  value={selectedPlayerId}
                  onChange={e => setSelectedPlayerId(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  {players.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.jerseyNumber ? `(#${p.jerseyNumber})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Export Action Card */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Download className="w-4 h-4 text-amber-500" />
              Export Image
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={isDownloading}
                onClick={() => handleDownload('png')}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
              <button
                disabled={isDownloading}
                onClick={() => handleDownload('jpg')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border border-slate-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-amber-400" />
                Download JPG
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Card Preview */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-950/5 rounded-3xl p-6 border border-dashed border-border min-h-[550px]">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Live Preview
          </p>

          <div className="shadow-2xl rounded-3xl overflow-hidden scale-90 sm:scale-100 origin-center transition-all">
            {activeTemplate === 'player-profile' && selectedPlayer && (
              <PlayerProfileCard
                cardRef={cardRef}
                player={selectedPlayer}
                seasonStats={selectedStats}
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

            {activeTemplate === 'top-scorer-season' && (
              <TopScorerCard
                cardRef={cardRef}
                data={seasonScorer}
                periodLabel="All-Time / Season"
                type="season"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
