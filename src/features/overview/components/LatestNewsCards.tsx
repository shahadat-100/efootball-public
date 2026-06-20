import { useMemo } from 'react';
import { NewsArticle } from '@/features/news/types';
import { Badge } from '@/shared/components';
import { Calendar, User, ArrowRight, Flame } from 'lucide-react';

interface LatestNewsCardsProps {
  news: NewsArticle[];
  limit?: number;
  onViewAll?: () => void;
}

export function LatestNewsCards({ news, limit = 3, onViewAll }: LatestNewsCardsProps) {
  const latestNews = useMemo(() => {
    return [...news]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }, [news, limit]);

  if (latestNews.length === 0) return null;

  return (
    <div className="mb-12 stagger-children">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-bold text-[22px] tracking-tight flex items-center gap-2">
          <span className="bg-primary/10 text-primary p-1.5 rounded-lg">
            <Flame className="w-5 h-5" />
          </span>
          Latest News
        </h3>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {latestNews.map((article) => (
          <div 
            key={article.id} 
            className="group bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 card-hover-lift flex flex-col"
          >
            {/* Image Container */}
            <div className="relative h-48 w-full overflow-hidden bg-muted">
              <img 
                src={article.image || '/images/hero-banner.jpg'} 
                alt={article.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Badges overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Badge bg="#1a1a1a" c="#fff" className="shadow-md">
                  {article.category}
                </Badge>
                {article.hot && (
                  <Badge bg="#f59e0b" c="#fff" className="shadow-md flex items-center gap-1">
                    🔥 HOT
                  </Badge>
                )}
              </div>
            </div>

            {/* Content Container */}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {article.date}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> {article.author}
                </span>
              </div>
              
              <h4 className="font-heading font-bold text-xl leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h4>
              
              <div 
                className="text-sm text-muted-foreground line-clamp-3 flex-1"
                dangerouslySetInnerHTML={{ __html: article.content || 'No content provided.' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
