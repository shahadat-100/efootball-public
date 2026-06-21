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
          "text-[13px] font-black leading-none tabular-nums",
          p1Better ? "text-blue-400" : "text-white/50"
        )}>
          {formatValue(p1Value)}
        </span>

        <span className="text-[10px] font-black uppercase tracking-widest text-white/50 text-center px-2 leading-none">
          {label}
        </span>

        <span className={cn(
          "text-[13px] font-black leading-none tabular-nums",
          p2Better ? "text-red-400" : "text-white/50"
        )}>
          {formatValue(p2Value)}
        </span>
      </div>

      {/* Dual-sided progress bar */}
      <div className="flex w-full h-2 rounded-full overflow-hidden gap-[2px]">
        <div
          className={cn(
            "h-full rounded-l-full transition-all duration-700 ease-out",
            p1Better
              ? "bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_8px_#3b82f680]"
              : "bg-blue-900/40"
          )}
          style={{ width: `${p1Pct}%` }}
        />
        <div
          className={cn(
            "h-full rounded-r-full transition-all duration-700 ease-out",
            p2Better
              ? "bg-gradient-to-l from-red-600 to-red-400 shadow-[0_0_8px_#ef444480]"
              : "bg-red-900/40"
          )}
          style={{ width: `${p2Pct}%` }}
        />
      </div>
    </div>
  );
}
