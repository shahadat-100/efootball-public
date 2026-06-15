
interface SideBySideBarChartProps {
  label: string;
  v1: number;
  v2: number;
  max: number;
  color1?: string;
  color2?: string;
  isPercent?: boolean;
}

export function SideBySideBarChart({
  label,
  v1,
  v2,
  max,
  color1 = '#3b82f6',
  color2 = '#ef4444',
  isPercent = false,
}: SideBySideBarChartProps) {
  const s1 = isPercent ? `${(v1 * 100).toFixed(1)}%` : `${Number.isInteger(v1) ? v1 : v1.toFixed(2)}`;
  const s2 = isPercent ? `${(v2 * 100).toFixed(1)}%` : `${Number.isInteger(v2) ? v2 : v2.toFixed(2)}`;

  const buildBar = (value: number, color: string, textLabel: string) => {
    // clamp width factor between 5% and 100% so that empty values still have a tiny blip
    const widthFactor = Math.max(0.05, Math.min(1, value / max)) * 100;
    
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 relative h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(0,0,0,0.5)]"
            style={{ 
              width: `${widthFactor}%`, 
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}80` 
            }}
          />
        </div>
        <span 
          className="text-[10px] font-black w-10 text-right"
          style={{ color }}
        >
          {textLabel}
        </span>
      </div>
    );
  };

  return (
    <div className="mb-5">
      <p className="text-muted-foreground text-[8px] font-bold tracking-widest uppercase mb-1.5">
        {label}
      </p>
      <div className="flex flex-col gap-1.5">
        {buildBar(v1, color1, s1)}
        {buildBar(v2, color2, s2)}
      </div>
    </div>
  );
}
