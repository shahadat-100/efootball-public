import { useEffect, useState } from 'react';

interface SeasonData {
  season: string;
  goals: number;
  goalsConceded: number;
  winRate: number;
}

interface SeasonPerformanceChartProps {
  data: SeasonData[];
}

// Build a smooth cubic bezier curve through points
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const curr = pts[i];
    const next = pts[i + 1];
    const cpx = (curr.x + next.x) / 2;
    d += ` C ${cpx} ${curr.y}, ${cpx} ${next.y}, ${next.x} ${next.y}`;
  }
  return d;
}

export function SeasonPerformanceChart({ data }: SeasonPerformanceChartProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  if (data.length === 0) {
    return (
      <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-2xl p-6 shadow-xl h-full flex flex-col items-center justify-center">
        <p className="text-muted-foreground text-[13px]">No data available</p>
      </div>
    );
  }

  const chartH = 260;
  const chartW = 500;
  const padL = 40;
  const padR = 20;
  const padT = 16;
  const padB = 44;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  // Y-axis scale (goals)
  const maxGoal = Math.max(8, ...data.flatMap(d => [d.goals, d.goalsConceded]));
  const yMax = Math.ceil(maxGoal * 1.3 / 5) * 5;

  const getY = (val: number) => padT + innerH - (val / yMax) * innerH;

  const n = data.length;
  const stepX = n > 1 ? innerW / (n - 1) : innerW;
  const getX = (i: number) => padL + (n > 1 ? stepX * i : innerW / 2);

  const gridCount = 4;
  const gridVals = Array.from({ length: gridCount + 1 }, (_, i) => (yMax / gridCount) * i);

  // Build points arrays
  const goalsPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.goals) }));
  const concededPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.goalsConceded) }));

  const goalsPath = smoothPath(goalsPoints);
  const concededPath = smoothPath(concededPoints);

  // Area fill paths (line path closed to bottom)
  const baseY = padT + innerH;
  const goalsArea = `${goalsPath} L ${goalsPoints[goalsPoints.length - 1].x} ${baseY} L ${goalsPoints[0].x} ${baseY} Z`;
  const concededArea = `${concededPath} L ${concededPoints[concededPoints.length - 1].x} ${baseY} L ${concededPoints[0].x} ${baseY} Z`;

  return (
    <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-2xl p-5 shadow-xl shadow-black/5 h-full flex flex-col relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-blue-500/5 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-rose-500/5 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-bold text-[17px] tracking-tight text-foreground">Season Performance</h3>
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
            Goals For · Goals Conceded · Win Rate
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-0">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible" style={{ minHeight: 180 }}>
          <defs>
            {/* Goals area gradient */}
            <linearGradient id="areaGF" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
            {/* Conceded area gradient */}
            <linearGradient id="areaGC" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Horizontal grid */}
          {gridVals.map((v, i) => {
            const y = getY(v);
            return (
              <g key={i}>
                <line
                  x1={padL} y1={y} x2={chartW - padR} y2={y}
                  stroke="currentColor"
                  className="text-border/25"
                  strokeDasharray={i === 0 ? '0' : '3 6'}
                  strokeWidth="0.8"
                />
                <text x={padL - 8} y={y} textAnchor="end" dominantBaseline="middle"
                  className="fill-muted-foreground/70 font-medium" fontSize={8.5}>
                  {Math.round(v)}
                </text>
              </g>
            );
          })}

          {/* Area fills */}
          <path d={goalsArea} fill="url(#areaGF)"
            style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.8s ease-out 0.15s' }} />
          <path d={concededArea} fill="url(#areaGC)"
            style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.8s ease-out 0.3s' }} />

          {/* Goals line */}
          <path
            d={goalsPath} fill="none" stroke="#3b82f6"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{
              opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease-out 0.2s',
              filter: 'drop-shadow(0px 2px 4px rgba(59,130,246,0.3))',
            }}
          />

          {/* Conceded line */}
          <path
            d={concededPath} fill="none" stroke="#f43f5e"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{
              opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease-out 0.35s',
              filter: 'drop-shadow(0px 2px 4px rgba(244,63,94,0.3))',
            }}
          />

          {/* Hover columns + data points */}
          {data.map((d, i) => {
            const x = getX(i);
            const isHovered = hoveredIdx === i;

            return (
              <g key={i}>
                {/* Invisible hover target */}
                <rect
                  x={x - stepX / 2} y={padT} width={stepX} height={innerH}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{ cursor: 'crosshair' }}
                />

                {/* Vertical guide on hover */}
                {isHovered && (
                  <line x1={x} y1={padT} x2={x} y2={padT + innerH}
                    stroke="currentColor" className="text-muted-foreground/30" strokeDasharray="3 3" strokeWidth="1" />
                )}

                {/* Goals dot */}
                <circle cx={x} cy={getY(d.goals)} r={isHovered ? 5.5 : 3.5}
                  fill={isHovered ? '#3b82f6' : 'var(--background)'} stroke="#3b82f6" strokeWidth="2"
                  className="transition-all duration-200" style={{ filter: isHovered ? 'drop-shadow(0 0 6px rgba(59,130,246,0.5))' : 'none' }}
                />
                {/* Conceded dot */}
                <circle cx={x} cy={getY(d.goalsConceded)} r={isHovered ? 5.5 : 3.5}
                  fill={isHovered ? '#f43f5e' : 'var(--background)'} stroke="#f43f5e" strokeWidth="2"
                  className="transition-all duration-200" style={{ filter: isHovered ? 'drop-shadow(0 0 6px rgba(244,63,94,0.5))' : 'none' }}
                />

                {/* Hover tooltip */}
                {isHovered && (
                  <g>
                    <rect x={x - 52} y={padT - 2} width={104} height={50} rx={8}
                      fill="var(--card)" stroke="var(--border)" strokeWidth="1"
                      style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }} />
                    <text x={x} y={padT + 14} textAnchor="middle" fontSize={9} fontWeight="700"
                      className="fill-foreground">{d.season.replace('eFootball ', '')}</text>
                    <text x={x - 20} y={padT + 30} textAnchor="middle" fontSize={8} fontWeight="600" fill="#3b82f6">
                      GF: {d.goals}
                    </text>
                    <text x={x + 20} y={padT + 30} textAnchor="middle" fontSize={8} fontWeight="600" fill="#f43f5e">
                      GA: {d.goalsConceded}
                    </text>
                    <text x={x} y={padT + 42} textAnchor="middle" fontSize={8} fontWeight="600" fill="#10b981">
                      WR: {d.winRate.toFixed(0)}%
                    </text>
                  </g>
                )}

                {/* X label */}
                <text x={x} y={chartH - 8}
                  textAnchor="middle" fontSize={10} fontWeight="600"
                  className="fill-muted-foreground transition-opacity duration-500"
                  style={{ opacity: mounted ? 1 : 0, transitionDelay: `${i * 100 + 400}ms` }}>
                  {d.season.replace('eFootball ', '')}
                </text>
              </g>
            );
          })}

          {/* Win Rate badges on each point */}
          {data.map((d, i) => {
            const x = getX(i);
            const isHovered = hoveredIdx === i;
            if (isHovered) return null; // tooltip already shows it
            return (
              <g key={`wr-${i}`} style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease-out', transitionDelay: `${i * 100 + 500}ms` }}>
                <rect x={x - 16} y={padT + innerH + 8} width={32} height={16} rx={8}
                  fill="#10b981" fillOpacity="0.12" stroke="#10b981" strokeWidth="0.6" strokeOpacity="0.3" />
                <text x={x} y={padT + innerH + 19} textAnchor="middle" fontSize={8} fontWeight="700" fill="#10b981">
                  {d.winRate.toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + innerH}
            stroke="currentColor" className="text-border/40" strokeWidth="1" />
          <line x1={padL} y1={padT + innerH} x2={chartW - padR} y2={padT + innerH}
            stroke="currentColor" className="text-border/40" strokeWidth="1" />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex justify-center items-center gap-6 mt-2">
        {[
          { label: 'Goals For',  color: '#3b82f6', type: 'area' },
          { label: 'Conceded',   color: '#f43f5e', type: 'area' },
          { label: 'Win Rate',   color: '#10b981', type: 'badge' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 group cursor-default">
            {item.type === 'area' ? (
              <svg width="14" height="10" viewBox="0 0 14 10" className="shrink-0">
                <path d="M 0 8 Q 4 2, 7 5 Q 10 8, 14 3 L 14 10 L 0 10 Z" fill={item.color} fillOpacity="0.25" />
                <path d="M 0 8 Q 4 2, 7 5 Q 10 8, 14 3" fill="none" stroke={item.color} strokeWidth="1.5" />
              </svg>
            ) : (
              <div
                className="w-2.5 h-2.5 rounded-full transition-transform duration-200 group-hover:scale-125"
                style={{ background: item.color, boxShadow: `0 0 6px ${item.color}90` }}
              />
            )}
            <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
