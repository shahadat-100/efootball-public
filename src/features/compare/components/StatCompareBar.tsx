import { cn } from '@/shared/lib/cn';

interface StatCompareBarProps {
  label: string;
  p1Value: number;
  p2Value: number;
  p1Name: string;
  p2Name: string;
  better: 'higher' | 'lower';
  isFloat?: boolean;
}

export function StatCompareBar({ label, p1Value, p2Value, better, isFloat = false }: StatCompareBarProps) {
  const formatValue = (v: number) => {
    if (label.includes('Rate')) return `${v}%`;
    return isFloat ? v.toFixed(2) : v;
  };

  const isTie = p1Value === p2Value;
  const p1Better = !isTie && (better === 'higher' ? p1Value > p2Value : p1Value < p2Value);
  const p2Better = !isTie && (better === 'higher' ? p2Value > p1Value : p2Value < p1Value);

  // Calculate proportional bar widths
  let p1Pct = 50;
  let p2Pct = 50;
  const total = p1Value + p2Value;
  if (total > 0) {
    p1Pct = Math.round((p1Value / total) * 100);
    p2Pct = 100 - p1Pct;
    // Min 8% so bar is visible
    if (p1Value > 0) p1Pct = Math.max(8, p1Pct);
    if (p2Value > 0) p2Pct = Math.max(8, p2Pct);
  }

  return (
    <div className="flex flex-col mb-4">
      <div className="flex justify-between items-end mb-1.5 px-0.5">
        <span className={cn(
          "text-[14px] leading-none tabular-nums transition-all duration-300",
          p1Better ? "text-emerald-500 font-black scale-110" : "text-foreground font-semibold opacity-80"
        )}>
          {formatValue(p1Value)}
        </span>

        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center px-2 leading-none">
          {label}
        </span>

        <span className={cn(
          "text-[14px] leading-none tabular-nums transition-all duration-300",
          p2Better ? "text-emerald-500 font-black scale-110" : "text-foreground font-semibold opacity-80"
        )}>
          {formatValue(p2Value)}
        </span>
      </div>

      {/* Dual-sided progress bar */}
      <div className="flex w-full h-2.5 rounded-full bg-muted/30 overflow-hidden gap-[2px]">
        <div
          className="h-full rounded-l-full bg-gradient-to-r from-blue-600 to-blue-400"
          style={{ width: `${p1Pct}%`, opacity: p1Value > 0 ? 1 : 0.2 }}
        />
        <div
          className="h-full rounded-r-full bg-gradient-to-l from-red-600 to-red-400"
          style={{ width: `${p2Pct}%`, opacity: p2Value > 0 ? 1 : 0.2 }}
        />
      </div>
    </div>
  );
}
