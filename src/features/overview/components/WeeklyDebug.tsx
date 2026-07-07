/**
 * TEMPORARY DEBUG COMPONENT — DELETE AFTER DEBUGGING
 */
import { useMemo } from 'react';
import { useFootballStore } from '@/store/footballStore';

export function WeeklyDebug() {
  const { playerWeeklyStats, playerMonthlyStats, players } = useFootballStore();

  const info = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();
    const currentWeek = currentDay >= 22 ? 4 : currentDay >= 15 ? 3 : currentDay >= 8 ? 2 : 1;

    const calcPoints = (w: number, d: number, l: number, g: number, gc: number, ht: number, motm: number) =>
      w * 10 + d * 5 - l * 3 + g - gc + motm * 4 + ht;

    // Monthly top 5
    const monthlyTop = players.map(p => {
      const rows = playerMonthlyStats.filter(
        s => s.playerId === p.id && s.monthIndex === currentMonth && s.year === currentYear
      );
      const w = rows.reduce((t,s)=>t+s.wins,0);
      const d = rows.reduce((t,s)=>t+s.draws,0);
      const l = rows.reduce((t,s)=>t+s.losses,0);
      const g = rows.reduce((t,s)=>t+s.goals,0);
      const gc = rows.reduce((t,s)=>t+(s.goalsConceded||0),0);
      const ht = rows.reduce((t,s)=>t+(s.hattricks||0),0);
      const motm = rows.reduce((t,s)=>t+(s.motmCount||0),0);
      const matches = w+d+l;
      return { name: p.name, pts: calcPoints(w,d,l,g,gc,ht,motm), matches, w, d, l, g };
    }).filter(r=>r.matches>0).sort((a,b)=>b.pts-a.pts).slice(0,5);

    // Weekly top 5
    const weeklyTop = players.map(p => {
      const rows = playerWeeklyStats.filter(
        s => s.playerId === p.id && s.monthIndex === currentMonth && s.week === currentWeek && s.year === currentYear
      );
      const w = rows.reduce((t,s)=>t+s.wins,0);
      const d = rows.reduce((t,s)=>t+s.draws,0);
      const l = rows.reduce((t,s)=>t+s.losses,0);
      const g = rows.reduce((t,s)=>t+s.goals,0);
      const gc = rows.reduce((t,s)=>t+(s.goalsConceded||0),0);
      const ht = rows.reduce((t,s)=>t+(s.hattricks||0),0);
      const motm = rows.reduce((t,s)=>t+(s.motmCount||0),0);
      const matches = w+d+l;
      return { name: p.name, pts: calcPoints(w,d,l,g,gc,ht,motm), matches, w, d, l, g };
    }).filter(r=>r.matches>0).sort((a,b)=>b.pts-a.pts).slice(0,5);

    // Does monthly top player appear in weekly at all?
    const monthlyTop1Name = monthlyTop[0]?.name;
    const weeklyTop1Name = weeklyTop[0]?.name;
    const isSame = monthlyTop1Name === weeklyTop1Name;

    const monthlyTop1Player = players.find(p => p.name === monthlyTop1Name);
    const monthlyTop1WeeklyRows = monthlyTop1Player
      ? playerWeeklyStats.filter(s =>
          s.playerId === monthlyTop1Player.id &&
          s.monthIndex === currentMonth &&
          s.year === currentYear
        )
      : [];
    const monthlyTop1AllWeeks = [...new Set(monthlyTop1WeeklyRows.map(s=>s.week))].sort();
    const monthlyTop1HasCurrentWeek = monthlyTop1AllWeeks.includes(currentWeek);

    return {
      currentMonth, currentYear, currentWeek,
      monthlyTop, weeklyTop,
      monthlyTop1Name, weeklyTop1Name, isSame,
      monthlyTop1AllWeeks, monthlyTop1HasCurrentWeek,
    };
  }, [playerWeeklyStats, playerMonthlyStats, players]);

  const Row = ({ r, i }: { r: any; i: number }) => (
    <div style={{display:'flex', gap:8, padding:'2px 0'}}>
      <span style={{color:'#aaa', minWidth:16}}>#{i+1}</span>
      <span style={{minWidth:130, fontWeight: i===0 ? 'bold' : 'normal'}}>{r.name}</span>
      <span style={{color:'#f0c040', minWidth:50}}>Pts:{r.pts}</span>
      <span style={{color:'#aaa'}}>M:{r.matches} W:{r.w} D:{r.d} L:{r.l} G:{r.g}</span>
    </div>
  );

  return (
    <div style={{
      background: '#0d0d1a', border: '2px solid #e94560', borderRadius: 12,
      padding: 16, marginBottom: 16, fontFamily: 'monospace', fontSize: 12, color: '#eee'
    }}>
      <div style={{ color: '#e94560', fontWeight: 'bold', marginBottom: 8 }}>
        🔍 DEEP DEBUG — month_index={info.currentMonth} week={info.currentWeek} year={info.currentYear}
      </div>

      <div style={{display:'flex', gap:40, flexWrap:'wrap'}}>
        <div>
          <div style={{color:'#4fc3f7', marginBottom:4, fontWeight:'bold'}}>📅 MONTHLY TOP 5 (all of month {info.currentMonth})</div>
          {info.monthlyTop.map((r, i) => <Row key={i} r={r} i={i} />)}
        </div>
        <div>
          <div style={{color:'#81c784', marginBottom:4, fontWeight:'bold'}}>📆 WEEKLY TOP 5 (week {info.currentWeek} only)</div>
          {info.weeklyTop.length > 0
            ? info.weeklyTop.map((r, i) => <Row key={i} r={r} i={i} />)
            : <div style={{color:'#f44336'}}>⚠️ No data for this week</div>
          }
        </div>
      </div>

      <hr style={{ borderColor: '#444', margin: '10px 0' }} />
      <div style={{color: info.isSame ? '#4caf50' : '#ff9800', marginBottom:4}}>
        {info.isSame
          ? '✅ Top player is SAME in both views (expected)'
          : `⚠️ Monthly #1: "${info.monthlyTop1Name}"  ≠  Weekly #1: "${info.weeklyTop1Name}"`}
      </div>
      <div style={{color: info.monthlyTop1HasCurrentWeek ? '#4caf50' : '#f44336'}}>
        Monthly #1 ("{info.monthlyTop1Name}") has weekly data in weeks: [{info.monthlyTop1AllWeeks.join(', ')}]
        {' '}{info.monthlyTop1HasCurrentWeek
          ? `✅ (has week ${info.currentWeek} data)`
          : `❌ (NO data for week ${info.currentWeek} — that's the bug!)`}
      </div>
    </div>
  );
}
