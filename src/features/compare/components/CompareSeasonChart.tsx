import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface SeasonData {
  season: string;
  p1: number;
  p2: number;
}

interface CompareSeasonChartProps {
  data: SeasonData[];
  p1Name: string;
  p2Name: string;
  p1Color: string;
  p2Color: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-white/10 rounded-lg p-3 shadow-2xl">
        <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-xs font-bold text-white/90">{entry.name}:</span>
            <span className="text-xs font-black text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function CompareSeasonChart({ data, p1Name, p2Name, p1Color, p2Color }: CompareSeasonChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[250px]">
        <p className="text-muted-foreground text-[13px]">No season data available</p>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex justify-center items-center" style={{ minHeight: 250, height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
          <XAxis 
            dataKey="season" 
            tick={{ fill: '#a3a3a3', fontSize: 10, fontWeight: 700 }} 
            axisLine={false} 
            tickLine={false} 
            dy={10}
          />
          <YAxis 
            tick={{ fill: '#a3a3a3', fontSize: 10, fontWeight: 700 }} 
            axisLine={false} 
            tickLine={false} 
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff', strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.2 }} />
          <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700, marginTop: 10 }} iconType="circle" />
          <Line
            type="monotone"
            dataKey="p1"
            name={p1Name}
            stroke={p1Color}
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: '#000' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="p2"
            name={p2Name}
            stroke={p2Color}
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: '#000' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
