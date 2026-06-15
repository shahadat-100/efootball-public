import { SideBySideBarChart } from './SideBySideBarChart';

interface CompareBarChartsColumnProps {
  goalsPerMatch1: number;
  goalsPerMatch2: number;
  winRate1: number;
  winRate2: number;
  drawRate1: number;
  drawRate2: number;
  lossRate1: number;
  lossRate2: number;
  csRate1: number;
  csRate2: number;
}

export function CompareBarChartsColumn({
  goalsPerMatch1,
  goalsPerMatch2,
  winRate1,
  winRate2,
  drawRate1,
  drawRate2,
  lossRate1,
  lossRate2,
  csRate1,
  csRate2,
}: CompareBarChartsColumnProps) {
  return (
    <div className="flex flex-col justify-center h-full pt-4">
      <SideBySideBarChart label="Win Rate" v1={winRate1} v2={winRate2} max={1.0} isPercent={true} />
      <SideBySideBarChart label="Draw Rate" v1={drawRate1} v2={drawRate2} max={1.0} isPercent={true} />
      <SideBySideBarChart label="Loss Rate" v1={lossRate1} v2={lossRate2} max={1.0} isPercent={true} />
      <SideBySideBarChart label="Goals / M" v1={goalsPerMatch1} v2={goalsPerMatch2} max={3.0} />
      <SideBySideBarChart label="CS Rate" v1={csRate1} v2={csRate2} max={1.0} isPercent={true} />
    </div>
  );
}
