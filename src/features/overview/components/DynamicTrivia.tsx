import { useMemo, useState, useEffect } from 'react';
import { Player, PlayerSeasonStat } from '@/features/players/types';
import { MatchEntry } from '@/features/match-entries/types';
import { Lightbulb, RefreshCw, Trophy, Target, Star, Flame } from 'lucide-react';
import { Avatar } from '@/shared/components';

interface DynamicTriviaProps {
  players: Player[];
  playerSeasonStats: PlayerSeasonStat[];
  matchEntries: MatchEntry[];
}

export function DynamicTrivia({ players, playerSeasonStats, matchEntries }: DynamicTriviaProps) {
  const [triviaIndex, setTriviaIndex] = useState(0);

  const trivias = useMemo(() => {
    if (players.length === 0) return [];
    
    const facts: { icon: any, text: string, player?: Player, color: string }[] = [];

    // 1. Most Goals overall
    const topScorer = [...playerSeasonStats].sort((a, b) => b.goals - a.goals)[0];
    if (topScorer && topScorer.goals > 0) {
      const p = players.find(p => p.id === topScorer.playerId);
      if (p) facts.push({ icon: Target, text: `Did you know? ${p.name} has scored a massive ${topScorer.goals} goals for the club!`, player: p, color: 'text-red-400' });
    }

    // 2. Highest Win Rate
    const highestWins = [...playerSeasonStats].sort((a, b) => b.wins - a.wins)[0];
    if (highestWins && highestWins.wins > 0) {
      const p = players.find(p => p.id === highestWins.playerId);
      if (p) facts.push({ icon: Trophy, text: `${p.name} is a winner! They have secured ${highestWins.wins} victories this season.`, player: p, color: 'text-amber-400' });
    }

    // 3. Clean Sheets
    const topCS = [...playerSeasonStats].sort((a, b) => b.cleansheets - a.cleansheets)[0];
    if (topCS && topCS.cleansheets > 0) {
      const p = players.find(p => p.id === topCS.playerId);
      if (p) facts.push({ icon: Star, text: `Defensive Wall: ${p.name} has kept ${topCS.cleansheets} clean sheets!`, player: p, color: 'text-blue-400' });
    }

    // 4. Random MOTM
    const motmPlayers = playerSeasonStats.filter(s => s.motmCount > 0);
    if (motmPlayers.length > 0) {
      const randomMOTM = motmPlayers[Math.floor(Math.random() * motmPlayers.length)];
      const p = players.find(p => p.id === randomMOTM.playerId);
      if (p) facts.push({ icon: Flame, text: `${p.name} is clutch! They have won Man of the Match ${randomMOTM.motmCount} times.`, player: p, color: 'text-orange-400' });
    }

    // 5. Hardest working player
    const mostApps = [...playerSeasonStats].sort((a, b) => b.appearances - a.appearances)[0];
    if (mostApps && mostApps.appearances > 0) {
      const p = players.find(p => p.id === mostApps.playerId);
      if (p) facts.push({ icon: Lightbulb, text: `Dedication! ${p.name} has played the most matches for the club (${mostApps.appearances}).`, player: p, color: 'text-purple-400' });
    }

    // Shuffle array
    return facts.sort(() => 0.5 - Math.random());
  }, [players, playerSeasonStats, matchEntries]);

  useEffect(() => {
    if (trivias.length > 0) {
      const interval = setInterval(() => {
        setTriviaIndex(prev => (prev + 1) % trivias.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [trivias.length]);

  if (trivias.length === 0) return null;

  const currentFact = trivias[triviaIndex];
  const Icon = currentFact.icon;

  return (
    <div className="bg-gradient-to-br from-[#1a1c2e] to-[#121420] border border-indigo-500/20 rounded-2xl p-6 h-full flex flex-col justify-between shadow-lg relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 opacity-10 transform rotate-12 transition-transform duration-700 group-hover:rotate-45">
        <Icon className="w-32 h-32 text-indigo-400" />
      </div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-indigo-400 animate-pulse" />
          <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest">Did You Know?</h3>
        </div>
        <button 
          onClick={() => setTriviaIndex((triviaIndex + 1) % trivias.length)}
          className="text-muted-foreground hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        {currentFact.player && (
          <Avatar 
            name={currentFact.player.name} 
            src={currentFact.player.profileImageUrl} 
            size={56} 
            className={`border-2 ${currentFact.color.replace('text-', 'border-')} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
          />
        )}
        <p className="text-sm md:text-base text-gray-200 font-medium leading-relaxed">
          {currentFact.text}
        </p>
      </div>
    </div>
  );
}
