import { Player } from '@/features/players/types';
import { Avatar } from '@/shared/components';
import { cn } from '@/shared/lib/cn';

interface AwardData {
  player: Player;
  motm: number;
  cleanSheets: number;
  hattricks: number;
}

interface AwardsLeaderboardProps {
  data: AwardData[];
}

export function AwardsLeaderboard({ data }: AwardsLeaderboardProps) {
  const topMotm = [...data].sort((a, b) => b.motm - a.motm).slice(0, 3).filter(d => d.motm > 0);
  const topCleanSheets = [...data].sort((a, b) => b.cleanSheets - a.cleanSheets).slice(0, 3).filter(d => d.cleanSheets > 0);
  const topHattricks = [...data].sort((a, b) => b.hattricks - a.hattricks).slice(0, 3).filter(d => d.hattricks > 0);

  const Column = ({ title, icon, items, valueKey, accentColor }: { title: string, icon: string, items: AwardData[], valueKey: keyof AwardData, accentColor: string }) => (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center gap-2 mb-5 p-3 rounded-xl shadow-sm border border-border/50" style={{ background: `linear-gradient(135deg, ${accentColor}08, ${accentColor}15)` }}>
        <span className="text-xl">{icon}</span>
        <span className="font-bold text-sm tracking-tight">{title}</span>
      </div>
      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground italic px-2">No awards yet</p>
        ) : (
          items.map((item, i) => (
            <div key={item.player.id} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-muted/40 transition-all group">
              <div className="flex items-center gap-3 min-w-0">
                <span className={cn(
                  "text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm",
                  i === 0 ? "medal-gold" :
                  i === 1 ? "medal-silver" :
                  "medal-bronze"
                )}>{i + 1}</span>
                <Avatar name={item.player.name} size={28} src={(item.player as any).profileImageUrl} />
                <span className="text-sm font-semibold truncate">{item.player.name.split(' ')[0]}</span>
              </div>
              <span 
                className="font-black text-sm px-3 py-1 rounded-lg border shadow-sm transition-transform group-hover:scale-105"
                style={{ 
                  background: `${accentColor}10`, 
                  borderColor: `${accentColor}20`,
                  color: accentColor 
                }}
              >
                {item[valueKey] as number}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden group">
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <p className="font-semibold text-base mb-6 text-foreground tracking-tight relative z-10">Awards Leaderboard</p>
      <div className="flex flex-col md:flex-row gap-6 md:gap-5 flex-1 relative z-10">
        <Column title="MOTM" icon="⭐" items={topMotm} valueKey="motm" accentColor="#f59e0b" />
        <Column title="Clean Sheets" icon="🧤" items={topCleanSheets} valueKey="cleanSheets" accentColor="#06b6d4" />
        <Column title="Hat-tricks" icon="🎩" items={topHattricks} valueKey="hattricks" accentColor="#a855f7" />
      </div>
    </div>
  );
}
