import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFootballStore } from '@/store/footballStore';
import { NewsCard } from '@/features/news/components/NewsCard';
import { ArrowLeft, Calendar, User, Flame, Share2 } from 'lucide-react';
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
        <div className="h-[50vh] bg-muted w-full" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 0 100%)' }} />
        <div className="space-y-4 max-w-4xl mx-auto px-6 -mt-12 relative z-10">
          <div className="h-10 w-40 bg-muted rounded-full mx-auto md:mx-0" />
          <div className="h-12 bg-muted rounded w-3/4 mt-4" />
          <div className="h-4 bg-muted rounded w-1/4 mt-6" />
          <div className="space-y-3 pt-12">
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

  // Determine styles based on category matching the magazine vibe
  let categoryColor = '#0a1628'; // Navy for General/League
  let categoryAccent = '#3b82f6';
  
  if (article.category === 'Player' || article.category === 'Transfer') {
    categoryColor = '#064e3b'; // Deep Emerald
    categoryAccent = '#10b981';
  } else if (article.category === 'Milestone') {
    categoryColor = '#4c0519'; // Deep Crimson
    categoryAccent = '#f43f5e';
  }

  // Get 3 recent news (excluding current)
  const recentNews = [...news]
    .filter(n => n.id !== article.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const d = new Date(article.date);
  const formattedDate = isNaN(d.getTime()) ? article.date : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div 
      className="animate-in fade-in duration-500 min-h-screen pb-16 relative"
      style={{ 
        // Background gradient blending from a dark top to the category color
        background: `linear-gradient(to bottom, #020617 0%, ${categoryColor} 40%, #020617 100%)` 
      }}
    >
      {/* Back Button (Floating on Image) */}
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={() => navigate('/news')}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 hover:scale-105 transition-all shadow-lg"
          title="Back to News"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Top Image Section with Magazine-Style Cut */}
      <div 
        className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden"
        style={{ 
          // Dynamic angled cut at the bottom of the image
          clipPath: 'polygon(0 0, 100% 0, 100% 92%, 0 100%)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}
      >
        <img
          src={article.image || '/images/hero-banner.jpg'}
          alt={article.title}
          className="w-full h-full object-cover"
          onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/hero-banner.jpg'; }}
        />
        {/* Subtle overlay to make top buttons readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/20" />
      </div>

      {/* Main Content Area */}
      <div className="relative max-w-5xl mx-auto px-6 md:px-12 -mt-16 md:-mt-24 z-10">
        
        {/* Overlapping Pill Badge */}
        <div className="flex justify-center md:justify-start mb-6 md:mb-8">
          <div 
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-black font-black uppercase tracking-[0.2em] text-xs md:text-sm shadow-2xl transition-transform hover:scale-105"
            style={{ 
              boxShadow: `0 10px 30px ${categoryAccent}40`,
              border: `2px solid ${categoryAccent}`
            }}
          >
            {article.category}
            {article.hot && <Flame className="w-4 h-4 text-red-500" />}
          </div>
        </div>

        {/* Magazine-Style Headline */}
        <div className="mb-8">
          <h1 
            className="font-heading font-black text-4xl md:text-6xl lg:text-7xl text-white uppercase leading-[0.95] tracking-tighter"
            style={{ textShadow: '0 10px 30px rgba(0,0,0,0.8)' }}
          >
            {article.title}
          </h1>
          
          {/* Angled highlight accent line under title */}
          <div 
            className="h-2 w-32 mt-6 rounded-full" 
            style={{ background: categoryAccent, boxShadow: `0 0 15px ${categoryAccent}` }} 
          />
        </div>

        {/* Metadata Strip */}
        <div className="flex flex-wrap items-center gap-6 text-[10px] md:text-xs font-black text-white/60 uppercase tracking-widest mb-12 py-4 border-y border-white/10">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" style={{ color: categoryAccent }} />
            <span className="text-white/90">By {article.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: categoryAccent }} />
            <span className="text-white/90">{formattedDate}</span>
          </div>
          <div className="ml-auto flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </div>
        </div>

        {/* Article Body */}
        <div className="prose prose-invert prose-lg md:prose-xl max-w-4xl mx-auto md:mx-0">
          <p className="text-white/90 leading-relaxed font-medium">
            {/* The first letter drop cap */}
            <span 
              className="float-left text-7xl md:text-8xl font-black font-heading leading-none pr-3 pt-2"
              style={{ color: categoryAccent, textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}
            >
              {article.content.charAt(0)}
            </span>
            {article.content.slice(1)}
          </p>
        </div>

        {/* End of article marker */}
        <div className="flex items-center gap-4 my-16 opacity-30">
          <div className="h-px bg-white flex-1" />
          <div className="w-2 h-2 rotate-45 bg-white" />
          <div className="w-2 h-2 rotate-45 bg-white" />
          <div className="h-px bg-white flex-1" />
        </div>
      </div>

      {/* Recent News Footer */}
      {recentNews.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-2 h-8 rounded-full" style={{ background: categoryAccent }} />
              <h3 className="font-heading font-black text-3xl uppercase tracking-tight text-white">More Headlines</h3>
            </div>
            <button 
              onClick={() => navigate('/news')}
              className="text-xs font-black uppercase tracking-widest text-white/60 hover:text-white flex items-center gap-2 transition-colors"
            >
              View All <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recentNews.map(n => (
              <NewsCard key={n.id} article={n} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
