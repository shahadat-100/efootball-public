import { useEffect, useMemo, useState } from 'react';
import { format, parseISO, subMonths } from 'date-fns';

interface ActivityTimelineProps {
  dates: string[];
}

export function ActivityTimeline({ dates }: ActivityTimelineProps) {
  const [animate, setAnimate] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
  const totalMatches = chartData.reduce((sum, d) => sum + d.count, 0);
  const activeMonths = chartData.filter(d => d.count > 0).length;
  const peakMonth = chartData.reduce((best, d) => d.count > best.count ? d : best, chartData[0]);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col relative overflow-hidden group">
      {/* Ambient glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/8 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 group-hover:opacity-150" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {/* Icon badge */}
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10">
              <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
            </span>
            <p className="font-bold text-sm text-foreground tracking-tight">Match Activity</p>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium pl-8">Last 12 months</p>
        </div>

        {/* Total badge */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-xl font-extrabold text-foreground leading-none">{totalMatches}</span>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Matches</span>
        </div>
      </div>

      {/* Mini stats strip */}
      <div className="relative z-10 flex items-center gap-3 mb-4 px-1">
        <div className="flex items-center gap-1.5 bg-muted/40 rounded-lg px-2.5 py-1.5 border border-border/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-muted-foreground font-semibold">{activeMonths} active months</span>
        </div>
        {peakMonth.count > 0 && (
          <div className="flex items-center gap-1.5 bg-muted/40 rounded-lg px-2.5 py-1.5 border border-border/40">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[10px] text-muted-foreground font-semibold">Peak: {peakMonth.month} ({peakMonth.count})</span>
          </div>
        )}
      </div>

      {/* Bar chart */}
      <div className="flex items-end justify-between gap-1 relative z-10" style={{ height: '90px' }}>
        {chartData.map((d, i) => {
          const heightPct = maxMatches > 0 ? (d.count / maxMatches) * 100 : 0;
          const isHovered = hoveredIndex === i;
          const isPeak = d.count === maxMatches && d.count > 0;

          return (
            <div
              key={d.key}
              className="flex flex-col items-center flex-1 h-full cursor-pointer group/bar"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Bar container */}
              <div className="relative w-full flex justify-center items-end flex-1 pb-1">
                {/* Hover tooltip */}
                {isHovered && d.count > 0 && (
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-20 flex items-center gap-1">
                    <span>{d.count}</span>
                    <span className="font-normal opacity-70">match{d.count !== 1 ? 'es' : ''}</span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
                  </div>
                )}

                {/* Bar */}
                <div
                  className="w-full max-w-[16px] rounded-t-[4px] transition-all duration-700 ease-out"
                  style={{
                    height: animate ? `${Math.max(heightPct, d.count > 0 ? 6 : 0)}%` : '0%',
                    background: d.count === 0
                      ? 'transparent'
                      : isPeak
                        ? 'linear-gradient(to top, rgba(200,16,46,0.9), rgba(220,50,80,1))'
                        : isHovered
                          ? 'linear-gradient(to top, rgba(200,16,46,0.55), rgba(220,50,80,0.85))'
                          : 'linear-gradient(to top, rgba(200,16,46,0.25), rgba(200,16,46,0.55))',
                    boxShadow: isHovered && d.count > 0 ? '0 0 8px rgba(200,16,46,0.4)' : 'none',
                    transitionDelay: `${i * 45}ms`,
                  }}
                />

                {/* Zero state dot */}
                {d.count === 0 && (
                  <div className="w-1 h-1 rounded-full bg-border mb-0.5" />
                )}
              </div>

              {/* Month label */}
              <span
                className="text-[9px] font-semibold transition-colors duration-150"
                style={{ color: isHovered ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}
              >
                {d.month}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom scale hint */}
      <div className="relative z-10 flex justify-between items-center mt-2 px-0.5">
        <span className="text-[9px] text-muted-foreground/50 font-medium">
          {format(subMonths(new Date(), 11), 'MMM yy')}
        </span>
        <span className="text-[9px] text-muted-foreground/50 font-medium">
          {format(new Date(), 'MMM yy')}
        </span>
      </div>
    </div>
  );
}
