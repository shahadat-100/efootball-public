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

export function SeasonPerformanceChart({ data }: SeasonPerformanceChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  if (data.length === 0) {
    return (
      <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-2xl p-6 shadow-xl h-full flex flex-col items-center justify-center">
        <p className="text-muted-foreground text-[13px]">No data available</p>
      </div>
    );
  }

  const chartH = 240;
  const chartW = 480;
  const padL = 40;
  const padR = 16;
  const padT = 20;
  const padB = 42;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  // Max for left Y-axis (goals)
  const maxGoal = Math.max(10, ...data.flatMap(d => [d.goals, d.goalsConceded]));
  const yMax = Math.ceil(maxGoal * 1.25 / 5) * 5;

  const getY = (val: number) => padT + innerH - (val / yMax) * innerH;
  const getH = (val: number) => Math.max(2, (val / yMax) * innerH);

  // Win rate scaled to same axis
  const getWRY = (pct: number) => getY((pct / 100) * yMax);
  const getWRH = (pct: number) => getH((pct / 100) * yMax);

  const n = data.length;
  const slotW = innerW / n;
  const groupW = slotW * 0.72;
  const gap = 2;
  const barW = (groupW - gap * 2) / 3;
  const getSlotX = (i: number) => padL + slotW * i + (slotW - groupW) / 2;

  const gridCount = 4;
  const gridVals = Array.from({ length: gridCount + 1 }, (_, i) => (yMax / gridCount) * i);

  return (
    <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-2xl p-5 shadow-xl shadow-black/5 h-full flex flex-col relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-blue-500/5 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-emerald-500/5 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Header */}
      <div className="mb-4">
        <h3 className="font-bold text-[17px] tracking-tight text-foreground">Season Performance</h3>
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
          Goals For · Goals Conceded · Win Rate %
        </p>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-0">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible" style={{ minHeight: 180 }}>
          <defs>
            <linearGradient id="spGF2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="spGC2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="spWR2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.85" />
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
                  className="text-border/30"
                  strokeDasharray={i === 0 ? '0' : '4 5'}
                  strokeWidth="1"
                />
                <text x={padL - 6} y={y} textAnchor="end" dominantBaseline="middle"
                  className="fill-muted-foreground font-semibold" fontSize={9}>
                  {Math.round(v)}
                </text>
              </g>
            );
          })}

          {/* Lines per series */}
          {(() => {
            const series = [
              { key: 'goals', color: '#3b82f6', isWR: false },
              { key: 'goalsConceded', color: '#f43f5e', isWR: false },
              { key: 'winRate', color: '#10b981', isWR: true },
            ];

            return series.map((s, si) => {
              const points = data.map((d, i) => {
                const x = getSlotX(i) + groupW / 2;
                const rawVal = d[s.key as keyof SeasonData] as number;
                const y = s.isWR ? getWRY(rawVal) : getY(rawVal);
                return { x, y, rawVal };
              });

              const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

              return (
                <g key={s.key} style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease-out', transitionDelay: `${si * 100}ms` }}>
                  {/* Line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: `drop-shadow(0px 4px 6px ${s.color}40)` }}
                    className="transition-all duration-700 ease-out"
                  />
                  {/* Points */}
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill="var(--background)"
                        stroke={s.color}
                        strokeWidth="2.5"
                        className="transition-all duration-700 ease-out hover:r-6"
                      />
                      {/* Value label on top */}
                      {p.rawVal > 0 && (
                        <text
                          x={p.x}
                          y={p.y - 10 - (si * 2)} // slightly offset to prevent overlap
                          textAnchor="middle"
                          fontSize={s.isWR ? 8 : 9}
                          fontWeight="700"
                          fill={s.color}
                          style={{
                            opacity: mounted ? 1 : 0,
                            transitionDelay: `${i * 50 + si * 100 + 300}ms`,
                          }}
                        >
                          {s.isWR ? `${p.rawVal.toFixed(0)}%` : p.rawVal}
                        </text>
                      )}
                    </g>
                  ))}
                </g>
              );
            });
          })()}

          {/* X axis labels */}
          {data.map((d, i) => {
            const x = getSlotX(i) + groupW / 2;
            return (
              <text
                key={i}
                x={x} y={chartH - 6}
                textAnchor="middle" fontSize={10} fontWeight="600"
                className="fill-muted-foreground transition-opacity duration-700"
                style={{ opacity: mounted ? 1 : 0, transitionDelay: `${i * 80 + 500}ms` }}
              >
                {d.season.replace('eFootball ', '')}
              </text>
            );
          })}

          {/* Y Axis line */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + innerH}
            stroke="currentColor" className="text-border/50" strokeWidth="1" />
          {/* X Axis line */}
          <line x1={padL} y1={padT + innerH} x2={chartW - padR} y2={padT + innerH}
            stroke="currentColor" className="text-border/50" strokeWidth="1" />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex justify-center items-center gap-5 mt-3">
        {[
          { label: 'Goals For',  color: '#3b82f6' },
          { label: 'Conceded',   color: '#f43f5e' },
          { label: 'Win Rate %', color: '#10b981' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 group cursor-default">
            <div
              className="w-2.5 h-2.5 rounded-full transition-transform duration-200 group-hover:scale-125"
              style={{ background: item.color, boxShadow: `0 0 6px ${item.color}90` }}
            />
            <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
