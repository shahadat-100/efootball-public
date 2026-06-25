import { useState, useEffect } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Button, Input } from '@/shared/components';
import { fuzzyFilter } from '@/shared/lib/utils';
import { Search, Flame } from 'lucide-react';
import { NewsCard } from '@/features/news/components/NewsCard';
import { NEWS_CATEGORIES } from '@/shared/lib/constants';

const CATEGORY_TABS = ['All', ...NEWS_CATEGORIES] as const;
type TabValue = typeof CATEGORY_TABS[number];

export function News() {
  const { news, fetchNews } = useFootballStore();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabValue>('All');
  const [hotOnly, setHotOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const PAGE_SIZE = 50;

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchNews();
      setIsLoading(false);
    };
    load();
  }, [fetchNews]);

  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-8 gap-4 animate-pulse">
          <div className="space-y-2">
            <div className="h-7 w-24 bg-muted rounded-md" />
            <div className="h-4 w-28 bg-muted rounded-md" />
          </div>
          <div className="h-9 w-44 bg-muted rounded-md" />
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col shadow-sm animate-pulse">
              <div className="h-48 w-full bg-muted" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-20 bg-muted rounded-md" />
                <div className="h-5 w-full bg-muted rounded-md" />
                <div className="h-5 w-4/5 bg-muted rounded-md" />
                <div className="space-y-1">
                  <div className="h-3 bg-muted rounded-md w-full" />
                  <div className="h-3 bg-muted rounded-md w-full" />
                  <div className="h-3 bg-muted rounded-md w-3/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Sort purely by most recent: date desc, then created_at desc as tiebreaker
  const sorted = [...news].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });

  const categoryFiltered = activeTab === 'All'
    ? sorted
    : sorted.filter(n => n.category === activeTab);

  const hotFiltered = hotOnly
    ? categoryFiltered.filter(n => n.hot)
    : categoryFiltered;

  const filtered = fuzzyFilter(hotFiltered, search, ['title', 'author', 'category']);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hotCount = news.filter(n => n.hot).length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="font-heading font-bold text-[28px] tracking-wide mb-1">News</h2>
          <p className="text-muted-foreground text-[13px] font-medium">{news.length} articles</p>
        </div>
        <div className="flex gap-3 items-center">
          {/* Hot filter toggle */}
          <button
            onClick={() => { setHotOnly(h => !h); setPage(1); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '999px',
              border: hotOnly ? '1.5px solid #ff3131' : '1.5px solid transparent',
              background: hotOnly
                ? 'linear-gradient(135deg,rgba(255,49,49,0.18),rgba(255,107,53,0.12))'
                : 'rgba(0,0,0,0.06)',
              color: hotOnly ? '#ff3131' : '#888',
              fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
          >
            <Flame size={13} />
            Hot {hotCount > 0 && `(${hotCount})`}
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search articles..."
              className="pl-9 w-full sm:w-[220px]"
            />
          </div>
        </div>
      </div>

      {/* ── Category Filter Tabs ── */}
      <div
        style={{
          display: 'flex', gap: '8px', flexWrap: 'wrap',
          marginBottom: '24px',
        }}
      >
        {CATEGORY_TABS.map(tab => {
          const isActive = activeTab === tab;
          const tabColors: Record<string, { bg: string; text: string; border: string }> = {
            All:       { bg: '#c8102e',  text: '#fff',    border: '#c8102e' },
            Milestone: { bg: '#991b1b',  text: '#fecaca', border: '#7f1d1d' },
            General:   { bg: '#0a1628',  text: '#93c5fd', border: '#1e3a5f' },
            Player:    { bg: '#059669',  text: '#fff',    border: '#047857' },
            League:    { bg: '#0a1628',  text: '#93c5fd', border: '#1e3a5f' },
            Transfer:  { bg: '#059669',  text: '#fff',    border: '#047857' },
          };
          const colors = tabColors[tab] || tabColors['All'];
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                border: `1.5px solid ${isActive ? colors.border : 'rgba(0,0,0,0.12)'}`,
                background: isActive ? colors.bg : 'transparent',
                color: isActive ? colors.text : '#888',
                fontSize: '12px', fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: "'Oswald', sans-serif",
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── Cards Grid ── */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 stagger-children">
        {paginated.map(n => (
          <NewsCard key={n.id} article={n} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-2xl bg-card/50">
            <span className="text-4xl mb-3 block">📰</span>
            <p className="text-muted-foreground text-[14px] font-medium">No articles found — stay tuned for updates!</p>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 bg-card border border-border p-4 rounded-2xl shadow-sm">
          <p className="text-[12px] text-muted-foreground font-medium">
            Showing {(page-1)*PAGE_SIZE + 1} to {Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length} articles
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center px-3 text-[12px] font-bold border border-border rounded-lg bg-muted/30">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
