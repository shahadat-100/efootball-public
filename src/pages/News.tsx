import { useState, useEffect } from 'react';
import { useFootballStore } from '@/store/footballStore';
import { Button, Input, Badge } from '@/shared/components';
import { fuzzyFilter } from '@/shared/lib/utils';
import { Search } from 'lucide-react';

const DEFAULT_NEWS_IMAGE = '/images/hero-banner.jpg';

export function News() {
  const { news, fetchNews } = useFootballStore();
  const [search, setSearch] = useState('');
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

  const sorted = [...news].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });
  const filtered = fuzzyFilter(sorted, search, ['title', 'author', 'category']);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="font-heading font-bold text-[28px] tracking-wide mb-1">News</h2>
          <p className="text-muted-foreground text-[13px] font-medium">{news.length} articles</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search articles..." 
              className="pl-9 w-full sm:w-[220px]"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 stagger-children">
        {paginated.map(n => (
          <div key={n.id} className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 card-hover-lift group">
            <div className="h-48 w-full overflow-hidden flex-shrink-0 relative">
              <img 
                src={n.image || DEFAULT_NEWS_IMAGE} 
                alt={n.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-3 left-3 flex gap-2">
                {n.hot && <Badge bg="#7f1d1d" c="#fca5a5" className="shadow-lg border border-red-500/20">🔥 Hot</Badge>}
                <Badge bg="rgba(0,0,0,0.6)" c="#ffffff" className="backdrop-blur-sm border border-white/10">{n.category}</Badge>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-muted-foreground text-[11px] font-medium">{n.date}</span>
              </div>
              <h3 className="font-bold text-[15px] mb-2 leading-tight group-hover:text-primary transition-colors">{n.title}</h3>
              <p className="text-muted-foreground text-[12px] leading-relaxed mb-4 flex-1 break-words line-clamp-3">
                {n.content || 'No content provided.'}
              </p>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                <p className="text-muted-foreground text-[11px]">By <span className="font-semibold text-foreground">{n.author}</span></p>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-2xl bg-card/50">
            <span className="text-4xl mb-3 block">📰</span>
            <p className="text-muted-foreground text-[14px] font-medium">No articles found — stay tuned for updates!</p>
          </div>
        )}
      </div>

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
