import { useEffect, useMemo, useState } from 'react';
import { format, parseISO, subMonths } from 'date-fns';

interface ActivityTimelineProps {
  dates: string[];
}

export function ActivityTimeline({ dates }: ActivityTimelineProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const chartData = useMemo(() => {
    const now = new Date();
    const last12Months = Array.from({ length: 12 }).map((_, i) => {
      const d = subMonths(now, 11 - i);
      return {
        month: format(d, 'MMM'),
        year: format(d, 'yy'),
        key: format(d, 'yyyy-MM'),
        count: 0
      };
    });

    dates.forEach(dateStr => {
      if (!dateStr) return;
      try {
        const date = parseISO(dateStr);
        const key = format(date, 'yyyy-MM');
        const monthObj = last12Months.find(m => m.key === key);
        if (monthObj) {
          monthObj.count++;
        }
      } catch (e) {
        // ignore invalid dates
      }
    });

    return last12Months;
  }, [dates]);

  const maxMatches = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        <p className="font-semibold text-base text-foreground mb-1 tracking-tight">Match Activity</p>
        <p className="text-[11px] text-muted-foreground mb-6 font-medium">Matches played over the last 12 months</p>
      </div>

      <div className="flex items-end justify-between h-32 gap-1 sm:gap-2 relative z-10">
        {chartData.map((d, i) => {
          const heightPct = (d.count / maxMatches) * 100;
          return (
            <div key={d.key} className="flex flex-col items-center flex-1 group/bar">
              <div className="relative w-full flex justify-center h-full items-end pb-2">
                <div 
                  className="w-full max-w-[24px] rounded-t-md transition-all duration-1000 ease-out"
                  style={{ 
                    height: animate ? `${heightPct}%` : '0%', 
                    minHeight: d.count > 0 ? '4px' : '0px',
                    background: d.count > 0 
                      ? `linear-gradient(to top, rgba(200,16,46,0.3), rgba(200,16,46,0.7))` 
                      : 'transparent',
                    transitionDelay: `${i * 50}ms`
                  }}
                />
                
                {/* Tooltip */}
                <div className="absolute -top-8 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-foreground text-background text-[10px] px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap pointer-events-none z-10 font-bold">
                  {d.count} matches
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{d.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
