import { useState } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Button, Input, Avatar, Badge } from '@/shared/components';
import { Search, Trophy, Target, TrendingUp, Star, Zap, Shield } from 'lucide-react';
import { RESULT_BADGE } from '@/shared/lib/constants';
import { cn } from '@/shared/lib/cn';

export function MatchEntries() {
  const { matchEntries, players } = useFootballStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'entries'>('overview');
  const PAGE_SIZE = 50;

  const getPlayer = (id: string) => players.find(p => p.id === id);

  // ── Aggregated totals ──────────────────────────────────────────
  const totals = matchEntries.reduce((acc, e) => ({
    matches: acc.matches + 1,
    goals: acc.goals + (e.goals || 0),
    conceded: acc.conceded + (e.goalsConceded || 0),
    wins: acc.wins + (e.result === 'win' ? 1 : 0),
    losses: acc.losses + (e.result === 'loss' ? 1 : 0),
    draws: acc.draws + (e.result === 'draw' ? 1 : 0),
    hattricks: acc.hattricks + (e.hattricks || 0),
    motm: acc.motm + (e.motm ? 1 : 0),
    cleanSheets: acc.cleanSheets + (e.cleanSheet ? 1 : 0),
  }), { matches: 0, goals: 0, conceded: 0, wins: 0, losses: 0, draws: 0, hattricks: 0, motm: 0, cleanSheets: 0 });

  const winRate = totals.matches > 0 ? Math.round((totals.wins / totals.matches) * 100) : 0;

  // ── Per-player breakdown ──────────────────────────────────────
  const playerStats = players.map(p => {
    const entries = matchEntries.filter(e => e.playerId === p.id);
    return {
      player: p,
      matches: entries.length,
      goals: entries.reduce((s, e) => s + (e.goals || 0), 0),
      conceded: entries.reduce((s, e) => s + (e.goalsConceded || 0), 0),
      wins: entries.filter(e => e.result === 'win').length,
      losses: entries.filter(e => e.result === 'loss').length,
      draws: entries.filter(e => e.result === 'draw').length,
      hattricks: entries.reduce((s, e) => s + (e.hattricks || 0), 0),
      motm: entries.filter(e => e.motm).length,
      cleanSheets: entries.filter(e => e.cleanSheet).length,
    };
  }).filter(ps => ps.matches > 0).sort((a, b) => b.goals - a.goals);

  // ── Filtered entries ──────────────────────────────────────────
  const filtered = matchEntries
    .filter(me => {
      if (!search) return true;
      const p = getPlayer(me.playerId);
      return p && p.name.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const STAT_CARDS = [
    { label: 'Total Entries', value: totals.matches, icon: Trophy, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
    { label: 'Goals Scored', value: totals.goals, icon: Target, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    { label: 'Win Rate', value: `${winRate}%`, icon: TrendingUp, color: '#c8102e', bg: 'rgba(200,16,46,0.08)' },
    { label: 'MOTM Awards', value: totals.motm, icon: Star, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    { label: 'Hat-tricks', value: totals.hattricks, icon: Zap, color: '#a855f7', bg: 'rgba(168,85,247,0.08)' },
    { label: 'Clean Sheets', value: totals.cleanSheets, icon: Shield, color: '#06b6d4', bg: 'rgba(6,182,212,0.08)' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="font-heading font-bold text-[28px] tracking-wide mb-1">Match Entries</h2>
          <p className="text-muted-foreground text-[13px] font-medium">
            {totals.matches} entries · {totals.wins}W {totals.losses}L {totals.draws}D · {totals.goals} goals
          </p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by player..."
              className="pl-9 w-full sm:w-[200px]"
            />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 stagger-children">
        {STAT_CARDS.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glassmorphism rounded-2xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all stat-glow" style={{ borderColor: `${card.color}15` }}>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${card.color}10` }}>
                  <Icon className="w-4 h-4" style={{ color: card.color }} />
                </div>
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">{card.label}</span>
              </div>
              <p className="text-[24px] font-heading font-bold" style={{ color: card.color }}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-muted/50 rounded-xl p-1.5 w-fit border border-border/50">
        {(['overview', 'entries'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-2 rounded-lg text-[13px] font-semibold transition-all capitalize",
              activeTab === tab ? 'bg-white text-foreground shadow-md border border-border/50' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab === 'overview' ? '📊 Player Overview' : '📋 All Entries'}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB — Per-player breakdown */}
      {activeTab === 'overview' && (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  {['Player', 'Matches', 'W', 'L', 'D', 'Win%', 'Goals', 'Conceded', 'HT', 'MOTM', 'CS'].map(h => (
                    <th key={h} className="px-4 py-3 whitespace-nowrap font-bold text-[10px] uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {playerStats.map((ps, idx) => {
                  const wr = ps.matches > 0 ? Math.round((ps.wins / ps.matches) * 100) : 0;
                  return (
                    <tr key={ps.player.id} className={cn("hover:bg-muted/30 transition-colors", idx % 2 === 0 ? "bg-white" : "bg-muted/5")}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                            idx === 0 ? "medal-gold" : idx === 1 ? "medal-silver" : idx === 2 ? "medal-bronze" : "bg-muted text-muted-foreground"
                          )}>{idx + 1}</span>
                          <Avatar name={ps.player.name} size={28} src={ps.player.profileImageUrl} />
                          <div>
                            <p className="font-semibold text-foreground">{ps.player.name}</p>
                            <p className="text-[11px] text-muted-foreground">👕 {ps.player.jerseyNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-foreground">{ps.matches}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-500">{ps.wins}</td>
                      <td className="px-4 py-3 font-semibold text-red-400">{ps.losses}</td>
                      <td className="px-4 py-3 text-muted-foreground">{ps.draws}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted/50 rounded-full h-2 shadow-inner">
                            <div className="bg-gradient-to-r from-primary to-red-400 h-2 rounded-full transition-all" style={{ width: `${wr}%` }} />
                          </div>
                          <span className="text-[12px] font-bold">{wr}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-black text-[15px] text-foreground">{ps.goals}</td>
                      <td className="px-4 py-3 font-semibold text-red-400">{ps.conceded}</td>
                      <td className="px-4 py-3">
                        {ps.hattricks > 0 ? <Badge bg="#1a1a1a" c="#e5e5e5" className="border border-gray-500/30 text-[10px]">HT×{ps.hattricks}</Badge> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {ps.motm > 0 ? <Badge bg="#78350f" c="#fcd34d" className="border border-amber-500/30 text-[10px]">★{ps.motm}</Badge> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {ps.cleanSheets > 0 ? <Badge bg="#111827" c="#67e8f9" className="border border-cyan-500/30 text-[10px]">CS×{ps.cleanSheets}</Badge> : <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  );
                })}
                {playerStats.length === 0 && (
                  <tr>
                    <td colSpan={11} className="py-16 text-center">
                      <span className="text-4xl mb-3 block">📊</span>
                      <p className="text-muted-foreground font-medium">No match entries yet. Add entries to get started!</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ENTRIES TAB — All individual entries */}
      {activeTab === 'entries' && (
        <>
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                  <tr>
                    {['Player', 'Date', 'Goals', 'Conceded', 'Result', 'Flags', 'Notes'].map(h => (
                      <th key={h} className="px-4 py-3 whitespace-nowrap font-bold text-[10px] uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {paginated.map((me, idx) => {
                    const p = getPlayer(me.playerId);
                    const rb = RESULT_BADGE[me.result as keyof typeof RESULT_BADGE] ?? RESULT_BADGE.draw;
                    const isBulk = (me as any).source === 'bulk' || me.notes?.startsWith('Generated from');
                    const resultClass = me.result === 'win' ? 'result-bar-win' : me.result === 'loss' ? 'result-bar-loss' : 'result-bar-draw';
                    return (
                      <tr key={me.id} className={cn("hover:bg-muted/30 transition-colors", resultClass, idx % 2 === 0 ? "bg-white" : "bg-muted/5")}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={p?.name ?? 'Unknown'} size={26} src={p?.profileImageUrl} />
                            <span className="font-semibold text-foreground">{p?.name ?? 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap font-medium">{me.date}</td>
                        <td className="px-4 py-3 font-black text-foreground text-[15px]">{me.goals}</td>
                        <td className="px-4 py-3 font-semibold text-red-400">{me.goalsConceded}</td>
                        <td className="px-4 py-3"><Badge bg={rb.bg} c={rb.c}>{me.result}</Badge></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {me.hattricks > 0 && <Badge bg="#1a1a1a" c="#e5e5e5" className="border border-gray-500/30 text-[10px] px-1.5 py-0">HT×{me.hattricks}</Badge>}
                            {me.motm && <Badge bg="#78350f" c="#fcd34d" className="border border-amber-500/30 text-[10px] px-1.5 py-0">MOTM</Badge>}
                            {me.cleanSheet && <Badge bg="#111827" c="#67e8f9" className="border border-cyan-500/30 text-[10px] px-1.5 py-0">CS</Badge>}
                            {isBulk && <Badge bg="#1e1b4b" c="#a5b4fc" className="border border-indigo-500/30 text-[10px] px-1.5 py-0">Bulk</Badge>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">{(me as any).notes || '—'}</td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <span className="text-4xl mb-3 block">📋</span>
                        <p className="text-muted-foreground font-medium">No entries found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
              <p className="text-[12px] text-muted-foreground font-medium">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <div className="flex items-center px-3 text-[12px] font-bold border border-border rounded-lg bg-muted/30">Page {page}/{totalPages}</div>
                <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
