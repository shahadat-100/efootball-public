import { useEffect, useState } from 'react';

interface WinRateDonutProps {
  wins: number;
  draws: number;
  losses: number;
}

export function WinRateDonut({ wins, draws, losses }: WinRateDonutProps) {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const total = wins + draws + losses;
  
  const winPercentage = total > 0 ? (wins / total) * 100 : 0;
  const drawPercentage = total > 0 ? (draws / total) * 100 : 0;
  const lossPercentage = total > 0 ? (losses / total) * 100 : 0;

  // SVG circle math
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  
  const winStroke = animate ? (winPercentage / 100) * circumference : 0;
  const drawStroke = animate ? (drawPercentage / 100) * circumference : 0;
  const lossStroke = animate ? (lossPercentage / 100) * circumference : 0;

  const winOffset = 0;
  const drawOffset = animate ? -winStroke : 0;
  const lossOffset = animate ? drawOffset - drawStroke : 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
      {/* Decorative background blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />

      <p className="font-semibold text-base mb-4 text-foreground w-full text-left relative z-10">Win / Draw / Loss</p>
      
      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center relative z-10">
          <p className="text-muted-foreground text-sm">No match data</p>
        </div>
      ) : (
        <div className="relative flex items-center justify-center w-48 h-48 z-10">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            {/* Wins */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="url(#winGradient)"
              strokeWidth="12"
              strokeDasharray={`${winStroke} ${circumference}`}
              strokeDashoffset={winOffset}
              className="transition-all duration-[1500ms] ease-out"
              strokeLinecap="round"
            />
            {/* Draws */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="url(#drawGradient)"
              strokeWidth="12"
              strokeDasharray={`${drawStroke} ${circumference}`}
              strokeDashoffset={drawOffset}
              className="transition-all duration-[1500ms] ease-out"
              strokeLinecap="round"
            />
            {/* Losses */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="url(#lossGradient)"
              strokeWidth="12"
              strokeDasharray={`${lossStroke} ${circumference}`}
              strokeDashoffset={lossOffset}
              className="transition-all duration-[1500ms] ease-out"
              strokeLinecap="round"
            />
            
            <defs>
              <linearGradient id="winGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="drawGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="lossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-heading font-bold text-foreground tracking-tight">{total}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Matches</span>
          </div>
        </div>
      )}
      
      {total > 0 && (
        <div className="flex items-center justify-center gap-5 mt-6 w-full relative z-10">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <span className="text-sm font-bold text-emerald-600">{wins}</span>
            <span className="text-[10px] text-emerald-600/70 font-black tracking-widest">W</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <span className="text-sm font-bold text-amber-600">{draws}</span>
            <span className="text-[10px] text-amber-600/70 font-black tracking-widest">D</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 rounded-lg border border-red-500/20">
            <span className="text-sm font-bold text-red-600">{losses}</span>
            <span className="text-[10px] text-red-600/70 font-black tracking-widest">L</span>
          </div>
        </div>
      )}
    </div>
  );
}
