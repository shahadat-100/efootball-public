interface PlayerRadarChartProps {
  stats: {
    goals: number;
    cleanSheets: number;
    motm: number;
    wins: number;
    matches: number;
  };
  maxStats?: {
    goals: number;
    cleanSheets: number;
    motm: number;
    wins: number;
    matches: number;
  };
}

export function PlayerRadarChart({ stats, maxStats }: PlayerRadarChartProps) {
  const defaultMax = {
    goals: 50,
    cleanSheets: 20,
    motm: 10,
    wins: 50,
    matches: 100,
  };

  const max = maxStats || defaultMax;

  const winPct = stats.matches > 0
    ? Math.round((stats.wins / stats.matches) * 100)
    : 0;

  const data = [
    { label: 'Goals',        short: 'G',    value: Math.min((stats.goals / Math.max(max.goals, 1)) * 100, 100),       display: `${stats.goals}` },
    { label: 'MOTM',         short: 'MOTM', value: Math.min((stats.motm / Math.max(max.motm, 1)) * 100, 100),         display: `${stats.motm}` },
    { label: 'Win %',        short: 'W%',   value: winPct,                                                            display: `${winPct}%` },
    { label: 'Matches',      short: 'M',    value: Math.min((stats.matches / Math.max(max.matches, 1)) * 100, 100),   display: `${stats.matches}` },
    { label: 'Clean Sheets', short: 'CS',   value: Math.min((stats.cleanSheets / Math.max(max.cleanSheets, 1)) * 100, 100), display: `${stats.cleanSheets}` },
  ];

  const size   = 220;
  const center = size / 2;
  const radius = 72;

  const getCoord = (angle: number, length: number) => ({
    x: center + length * Math.cos(angle - Math.PI / 2),
    y: center + length * Math.sin(angle - Math.PI / 2),
  });

  // Smart text-anchor based on x component of direction
  const getAnchor = (angle: number): 'start' | 'middle' | 'end' => {
    const x = Math.cos(angle - Math.PI / 2);
    if (x >  0.15) return 'start';
    if (x < -0.15) return 'end';
    return 'middle';
  };

  // Smart baseline based on y component
  const getBaseline = (angle: number): 'auto' | 'hanging' | 'middle' => {
    const y = Math.sin(angle - Math.PI / 2);
    if (y < -0.15) return 'auto';
    if (y >  0.15) return 'hanging';
    return 'middle';
  };

  // Label offset: push further from axis tip based on direction
  const getLabelOffset = (angle: number): number => {
    const y = Math.sin(angle - Math.PI / 2);
    // Top/bottom axes need more push
    return Math.abs(y) > 0.7 ? radius + 30 : radius + 24;
  };

  const points = data.map((d, i) => {
    const angle = (Math.PI * 2 * i) / data.length;
    return getCoord(angle, (d.value / 100) * radius);
  });

  const polygonString = points.map(p => `${p.x},${p.y}`).join(' ');

  const axes = data.map((d, i) => {
    const angle = (Math.PI * 2 * i) / data.length;
    return {
      ...d,
      tip:      getCoord(angle, radius),
      labelPos: getCoord(angle, getLabelOffset(angle)),
      anchor:   getAnchor(angle),
      baseline: getBaseline(angle),
    };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Radar SVG — labels removed from SVG to avoid overlap */}
      <svg width={size} height={size} className="overflow-visible">

        {/* Background rings */}
        {[0.2, 0.4, 0.6, 0.8, 1].map(scale => {
          const bg = data.map((_, i) => {
            const a = (Math.PI * 2 * i) / data.length;
            const p = getCoord(a, radius * scale);
            return `${p.x},${p.y}`;
          }).join(' ');
          return (
            <polygon
              key={scale}
              points={bg}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis lines */}
        {axes.map((a, i) => (
          <line
            key={i}
            x1={center} y1={center}
            x2={a.tip.x} y2={a.tip.y}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
        ))}

        {/* Filled polygon */}
        <polygon
          points={polygonString}
          fill="rgba(99,102,241,0.25)"
          stroke="rgba(99,102,241,1)"
          strokeWidth="2"
        />

        {/* Vertex dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="rgba(99,102,241,1)" />
        ))}

        {/* Smart-positioned short axis labels (no overlap) */}
        {axes.map((a, i) => (
          <text
            key={i}
            x={a.labelPos.x}
            y={a.labelPos.y}
            textAnchor={a.anchor}
            dominantBaseline={a.baseline}
            className="text-[10px] font-bold fill-white"
            style={{ fontSize: 10 }}
          >
            {a.short}
          </text>
        ))}
      </svg>

      {/* Stat legend below the chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', width: '100%', maxWidth: '220px' }}>
        {data.map(d => (
          <div key={d.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 8px' }}>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1, marginBottom: '2px' }}>{d.label}</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{d.display}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
