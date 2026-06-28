import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFootballStore } from '@/store/footballStore';
import { NewsCard } from '@/features/news/components/NewsCard';
import { ArrowLeft, Calendar, User, Flame } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { NewsArticle } from '@/features/news/types';

export function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { news, fetchNews } = useFootballStore();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      setIsLoading(true);
      if (news.length === 0) {
        await fetchNews();
      }
      setIsLoading(false);
    };
    load();
  }, [id, fetchNews, news.length]);

  useEffect(() => {
    if (news.length > 0 && id) {
      const found = news.find((n) => n.id === id);
      setArticle(found || null);
    }
  }, [id, news]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-[400px] bg-muted rounded-3xl" />
        <div className="space-y-4 max-w-3xl mx-auto px-4">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="space-y-2 pt-8">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
        <button
          onClick={() => navigate('/news')}
          className="text-primary hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to News
        </button>
      </div>
    );
  }

  // Determine styles based on category
  let categoryColor = '#0a1628';
  let categoryAccent = '#93c5fd';
  let categoryGradient = 'from-blue-500/20 to-blue-900/40';

  if (article.category === 'Player' || article.category === 'Transfer') {
    categoryColor = '#071a0f';
    categoryAccent = '#6ee7b7';
    categoryGradient = 'from-emerald-500/20 to-emerald-900/40';
  } else if (article.category === 'Milestone') {
    categoryColor = '#1a0005';
    categoryAccent = '#fca5a5';
    categoryGradient = 'from-red-500/20 to-red-900/40';
  }

  // Get 3 recent news (excluding current)
  const recentNews = [...news]
    .filter(n => n.id !== article.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const d = new Date(article.date);
  const formattedDate = isNaN(d.getTime()) ? article.date : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Back Button */}
      <button
        onClick={() => navigate('/news')}
        className="group flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:text-primary transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Back to News
      </button>

      {/* Hero Section */}
      <div 
        className="relative rounded-[2rem] overflow-hidden mb-12 shadow-2xl border border-border/50"
        style={{ minHeight: '400px', maxHeight: '60vh' }}
      >
        <img
          src={article.image || '/images/hero-banner.jpg'}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/hero-banner.jpg'; }}
        />
        <div className={cn("absolute inset-0 bg-gradient-to-t via-background/60 to-transparent", categoryGradient)} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-5xl mx-auto w-full">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span 
              className="px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full"
              style={{ background: categoryColor, color: categoryAccent, border: `1px solid ${categoryAccent}40` }}
            >
              {article.category}
            </span>
            {article.hot && (
              <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                <Flame className="w-3.5 h-3.5" /> Hot News
              </span>
            )}
          </div>
          <h1 className="font-heading font-black text-3xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight tracking-tight max-w-4xl">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: categoryAccent }} />
              <span className="text-foreground/90">{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: categoryAccent }} />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-3xl mx-auto px-4 md:px-0">
        <div className="prose prose-invert prose-lg max-w-none prose-headings:font-heading prose-headings:font-bold prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-primary/80">
          <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed mb-10 first-letter:text-5xl first-letter:font-black first-letter:mr-1 first-letter:float-left first-letter:text-primary">
            {article.content}
          </p>
          
          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 my-12 opacity-50">
            <div className="h-px bg-border flex-1" />
            <div className="w-2 h-2 rotate-45" style={{ background: categoryAccent }} />
            <div className="w-2 h-2 rotate-45" style={{ background: categoryAccent }} />
            <div className="w-2 h-2 rotate-45" style={{ background: categoryAccent }} />
            <div className="h-px bg-border flex-1" />
          </div>
        </div>
      </div>

      {/* Recent News Footer */}
      {recentNews.length > 0 && (
        <div className="mt-20 pt-12 border-t border-border">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-heading font-black text-2xl">Recent News</h3>
            <button 
              onClick={() => navigate('/news')}
              className="text-sm font-bold text-primary hover:underline flex items-center gap-2"
            >
              View All <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recentNews.map(n => (
              <NewsCard key={n.id} article={n} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
