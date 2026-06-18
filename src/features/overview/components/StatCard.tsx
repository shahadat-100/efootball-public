import { cn } from '@/shared/lib/cn';
import { useEffect, useState } from 'react';

// Custom hook for animated counting
function useCountUp(endValue: number | string, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof endValue !== 'number') {
      return;
    }
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * endValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };
    requestAnimationFrame(animate);
  }, [endValue, duration]);

  if (typeof endValue === 'string') return endValue;
  return count;
}

interface StatCardProps {
  label: string;
  value: number | string;
  accent?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, accent = '#c8102e', onClick, icon }: StatCardProps) {
  const displayValue = useCountUp(value);

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden glassmorphism rounded-2xl p-6 transition-all duration-300 card-hover-lift stat-glow",
        onClick ? "cursor-pointer" : ""
      )}
      style={{
        boxShadow: `0 4px 20px ${accent}08`,
      }}
    >
      {/* Background glow gradient */}
      <div 
        className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: accent }}
      />
      
      {/* Bottom accent border */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, ${accent}80, ${accent}20)` }}
      />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          {icon ? (
            <div className="p-2 rounded-lg bg-background border border-border shadow-sm" style={{ color: accent }}>
              {icon}
            </div>
          ) : (
            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: accent }}></div>
          )}
          <p className="text-muted-foreground text-[13px] font-bold uppercase tracking-wider">{label}</p>
        </div>
      </div>
      
      <p className="text-4xl font-heading font-bold text-foreground tracking-tight relative z-10">
        {displayValue}
      </p>
    </div>
  );
}
