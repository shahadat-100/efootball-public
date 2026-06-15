import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { ComputedPlayerStats } from '../types';
import { getNormalizedStats } from '../utils';

interface CompareRadarChartProps {
  p1: ComputedPlayerStats;
  p2: ComputedPlayerStats;
  color1?: string;
  color2?: string;
}

const LABELS = ["MATCHES", "WIN %", "LOSS %", "DRAW %", "GOALS/M", "HT/M", "CS %", "MOTM %", "PTS/M", "GA/M"];

export function CompareRadarChart({
  p1,
  p2,
  color1 = '#3b82f6', // blue-500
  color2 = '#ef4444', // red-500
}: CompareRadarChartProps) {
  const v1 = getNormalizedStats(p1);
  const v2 = getNormalizedStats(p2);

  const data = LABELS.map((label, i) => ({
    subject: label,
    A: v1[i],
    B: v2[i],
    fullMark: 1,
  }));

  return (
    <div className="w-full h-full min-h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#333333" strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#a3a3a3', fontSize: 10, fontWeight: 700 }} 
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 1]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar
            name={p1.short}
            dataKey="A"
            stroke={color1}
            strokeWidth={2}
            fill={color1}
            fillOpacity={0.3}
          />
          <Radar
            name={p2.short}
            dataKey="B"
            stroke={color2}
            strokeWidth={2}
            fill={color2}
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
