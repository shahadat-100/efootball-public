import { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useFootballStore } from '@/store/footballStore';
import { Hexagon, Users, ClipboardList, Trophy, Newspaper, Award, Menu, X, BarChart3, Medal, Shield } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const NAV = [
  { id: 'overview', label: 'Overview', icon: Hexagon },
  { id: 'players', label: 'Players', icon: Users },
  { id: 'entries', label: 'Match entries', icon: ClipboardList },
  { id: 'matches', label: 'Matches', icon: Trophy },
  { id: 'compare', label: 'Compare', icon: BarChart3 },
  { id: 'leaderboard', label: 'Leaderboard', icon: Medal },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'hall-of-fame', label: 'Hall of Fame', icon: Award },
  { id: 'club-info', label: 'Club Info', icon: Shield },
];

// Bottom nav items for mobile (top 5)
const BOTTOM_NAV = [
  { id: 'overview', label: 'Overview', icon: Hexagon },
  { id: 'players', label: 'Players', icon: Users },
  { id: 'matches', label: 'Matches', icon: Trophy },
  { id: 'compare', label: 'Compare', icon: BarChart3 },
  { id: 'leaderboard', label: 'Leaderboard', icon: Medal },
];

// Page title map
const PAGE_TITLES: Record<string, string> = {
  overview: 'Overview',
  players: 'Players',
  entries: 'Match Entries',
  matches: 'Matches',
  compare: 'Compare',
  leaderboard: 'Leaderboard',
  news: 'News',
  'hall-of-fame': 'Hall of Fame',
  'club-info': 'Club Info',
};

export function AppShell() {
  const state = useFootballStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const initializeData = useFootballStore(state => state.initializeData);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Dynamic page title
  useEffect(() => {
    const segment = location.pathname.split('/').filter(Boolean)[0] || 'overview';
    const pageTitle = PAGE_TITLES[segment] || 'Overview';
    document.title = `${pageTitle} — The Enigmatic Elite `;
  }, [location.pathname]);

  const counts: Record<string, number> = {
    players: state.players.length,
    entries: state.matchEntries.length,
    matches: state.matches.length,
    news: state.news.length,
    'hall-of-fame': state.hallOfFame.length,
  };

  return (
    <div className="flex flex-col h-screen min-h-[600px] max-h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Topbar */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-border/60 h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm z-20 w-full relative">
        <div className="flex items-center gap-6 lg:gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 -ml-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <img
              src="/images/club-logo.jpg"
              alt="The Enigmatic Elite"
              className="w-9 h-9 rounded-full object-cover shadow-md ring-2 ring-primary/20"
            />
            <div className="flex flex-col">
              <span className="font-heading font-bold text-[16px] tracking-tight text-foreground leading-none">THE ENIGMATIC ELITE</span>
              <span className="text-[9px] text-muted-foreground font-medium tracking-widest uppercase leading-none mt-0.5">In Mystery We Reign</span>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-0.5 relative">
            {NAV.map(t => {
              const Icon = t.icon;
              const isActive = location.pathname.includes('/' + t.id);
              return (
                <NavLink
                  key={t.id}
                  to={`/${t.id}`}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary group",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4 transition-all duration-200",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground group-hover:scale-110"
                  )} strokeWidth={2} />
                  <span>{t.label}</span>
                  {counts[t.id] > 0 && (
                    <span className={cn(
                      "ml-0.5 flex h-5 items-center justify-center px-1.5 rounded-full text-[10px] font-bold transition-all",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {counts[t.id]}
                    </span>
                  )}
                  {/* Active indicator bar */}
                  {isActive && (
                    <span className="absolute -bottom-[13px] left-2 right-2 h-[3px] bg-gradient-to-r from-primary to-red-400 rounded-full animate-fade-in-scale" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/8 border border-primary/15">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary leading-none hidden sm:block">The Enigmatic Elite</span>
          </div>
        </div>

        {/* Navigation - Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-border shadow-lg p-4 flex flex-col gap-1 md:hidden animate-in slide-in-from-top-2 duration-200 z-30">
            {NAV.map(t => {
              const Icon = t.icon;
              const isActive = location.pathname.includes('/' + t.id);
              return (
                <NavLink
                  key={t.id}
                  to={`/${t.id}`}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all",
                    isActive
                      ? "bg-primary/5 text-foreground border border-primary/20"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} strokeWidth={2} />
                  <span>{t.label}</span>
                  {counts[t.id] > 0 && (
                    <span className={cn(
                      "ml-auto flex h-6 items-center justify-center px-2 rounded-full text-[11px] font-bold",
                      isActive ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                    )}>
                      {counts[t.id]}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden h-full relative">
        {/* Overlay when mobile menu is open */}
        {isMobileMenuOpen && (
          <div
            className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 md:hidden animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        <main className="flex-1 bg-background overflow-y-auto p-4 sm:p-6 lg:p-10 relative w-full h-full pb-20 md:pb-0">
          <div className="max-w-[1600px] mx-auto pb-12 w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav md:hidden flex items-center justify-around py-2 px-1">
        {BOTTOM_NAV.map(t => {
          const Icon = t.icon;
          const isActive = location.pathname.includes('/' + t.id);
          return (
            <NavLink
              key={t.id}
              to={`/${t.id}`}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all min-w-[56px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all",
                isActive ? "bg-primary/10" : ""
              )}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={cn(
                "text-[10px] font-semibold leading-none",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>{t.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
