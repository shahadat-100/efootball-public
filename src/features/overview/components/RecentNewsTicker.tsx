import { useMemo } from 'react';
import { NewsArticle } from '@/features/news/types';
import { Badge } from '@/shared/components';
import { Calendar } from 'lucide-react';

interface RecentNewsTickerProps {
  news: NewsArticle[];
}

export function RecentNewsTicker({ news }: RecentNewsTickerProps) {
  const recentNews = useMemo(() => {
    return news.filter((item) => {
      if (!item.date) return false;
      const itemDate = new Date(item.date);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - itemDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    });
  }, [news]);

  if (recentNews.length === 0) return null;

  return (
    <div className="w-full overflow-hidden bg-card border border-border rounded-xl py-2 px-4 mb-8 flex items-center relative group shadow-sm">
      <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-card via-card to-transparent z-10 flex items-center pl-4">
        <Badge bg="#c8102e" c="#fff" className="font-bold whitespace-nowrap shadow-md">
          LATEST NEWS
        </Badge>
      </div>
      
      {/* Marquee Container */}
      <div className="flex-1 overflow-hidden ml-24 pl-4">
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
          {/* First block */}
          <div className="flex gap-10 px-5 items-center">
            {recentNews.map((item) => (
              <div key={item.id} className="flex items-center gap-2 whitespace-nowrap">
                {item.hot && <span className="text-amber-500 font-bold text-sm shrink-0">🔥</span>}
                <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
                  {item.title}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0 ml-1">
                  <Calendar className="w-3 h-3" />
                  {item.date}
                </span>
              </div>
            ))}
          </div>
          {/* Second block (duplicate for infinite scroll loop) */}
          <div className="flex gap-10 px-5 items-center" aria-hidden="true">
            {recentNews.map((item) => (
              <div key={`${item.id}-dup`} className="flex items-center gap-2 whitespace-nowrap">
                {item.hot && <span className="text-amber-500 font-bold text-sm shrink-0">🔥</span>}
                <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
                  {item.title}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0 ml-1">
                  <Calendar className="w-3 h-3" />
                  {item.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none"></div>
    </div>
  );
}
