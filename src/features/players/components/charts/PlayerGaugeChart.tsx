import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface PlayerGaugeChartProps {
  stats: {
    totalMatches: number;
    totalWins: number;
    totalCleanSheets: number;
    totalMOTM: number;
  };
}

export function PlayerGaugeChart({ stats }: PlayerGaugeChartProps) {
  const data = useMemo(() => {
    if (stats.totalMatches === 0) return [];
    
    const winRate = (stats.totalWins / stats.totalMatches) * 100;
    const csRate = (stats.totalCleanSheets / stats.totalMatches) * 100;
    const motmRate = (stats.totalMOTM / stats.totalMatches) * 100;

    return [
      { name: 'Win Rate', value: winRate, fill: '#10b981', trackFill: 'rgba(16,185,129,0.1)' },
      { name: 'CS Rate', value: csRate, fill: '#0ea5e9', trackFill: 'rgba(14,165,233,0.1)' },
      { name: 'MOTM Rate', value: motmRate, fill: '#f59e0b', trackFill: 'rgba(245,158,11,0.1)' },
    ];
  }, [stats]);

  if (data.length === 0) return null;

  return (
    <div className="w-full h-full min-h-[200px] relative flex flex-col items-center justify-end overflow-hidden pb-4">
      <ResponsiveContainer width="100%" height="150%">
        <PieChart>
          {/* Track 1: Win Rate */}
          <Pie
            data={[{ value: data[0].value }, { value: 100 - data[0].value }]}
            cx="50%" cy="80%"
            startAngle={180} endAngle={0}
            innerRadius="75%" outerRadius="90%"
            dataKey="value"
            stroke="none"
            cornerRadius={10}
          >
            <Cell fill={data[0].fill} />
            <Cell fill={data[0].trackFill} />
          </Pie>

          {/* Track 2: CS Rate */}
          <Pie
            data={[{ value: data[1].value }, { value: 100 - data[1].value }]}
            cx="50%" cy="80%"
            startAngle={180} endAngle={0}
            innerRadius="55%" outerRadius="70%"
            dataKey="value"
            stroke="none"
            cornerRadius={10}
          >
            <Cell fill={data[1].fill} />
            <Cell fill={data[1].trackFill} />
          </Pie>

          {/* Track 3: MOTM Rate */}
          <Pie
            data={[{ value: data[2].value }, { value: 100 - data[2].value }]}
            cx="50%" cy="80%"
            startAngle={180} endAngle={0}
            innerRadius="35%" outerRadius="50%"
            dataKey="value"
            stroke="none"
            cornerRadius={10}
          >
            <Cell fill={data[2].fill} />
            <Cell fill={data[2].trackFill} />
          </Pie>

          <Tooltip 
            formatter={(value: any, name: any) => {
              if (name !== 'value') return null;
              return [`${Number(value).toFixed(1)}%`, 'Rate'];
            }}
            contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Custom Legend */}
      <div className="flex gap-4 items-center justify-center mt-[-30px] z-10 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-border/50">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
