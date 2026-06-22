// import { useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabase';
// import { Shield, Star, Trophy, BookOpen, ChevronDown, ChevronUp, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
// import { cn } from '@/shared/lib/cn';

// // ─── Types ───────────────────────────────────────────────────────────────────
// interface ClubRule {
//   id: string;
//   title: string;
//   subtitle: string | null;
//   description: string | null;
//   created_at: string;
// }
// interface ClubRank {
//   id: string;
//   image_url: string | null;
//   title: string;
//   subtitle: string | null;
//   description: string | null;
//   created_at: string;
// }
// interface ClubAchievement {
//   id: string;
//   image_url: string | null;
//   title: string;
//   subtitle: string | null;
//   description: string | null;
//   created_at: string;
// }

// type TabId = 'rules' | 'ranks' | 'achievements';

// const TABS: { id: TabId; label: string; icon: React.FC<{ className?: string }> }[] = [
//   { id: 'rules',        label: 'Club Rules',    icon: BookOpen },
//   { id: 'ranks',        label: 'Ranks & Badges', icon: Star },
//   { id: 'achievements', label: 'Achievements',  icon: Trophy },
// ];

// // ─── Skeleton ─────────────────────────────────────────────────────────────────
// function SkeletonCard({ hasImage, logoStyle }: { hasImage?: boolean; logoStyle?: boolean }) {
//   return (
//     <div className="bg-white border border-border rounded-2xl overflow-hidden animate-pulse">
//       {hasImage && (
//         logoStyle ? (
//           <div className="flex flex-col items-center pt-7 pb-4 px-6 bg-muted/30">
//             <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-muted" />
//           </div>
//         ) : (
//           <div className="h-44 sm:h-48 bg-muted" />
//         )
//       )}
//       <div className="p-4 sm:p-5 space-y-3">
//         <div className="h-4 bg-muted rounded-full w-2/3" />
//         <div className="h-3 bg-muted rounded-full w-1/2" />
//         <div className="space-y-1.5">
//           <div className="h-3 bg-muted rounded-full w-full" />
//           <div className="h-3 bg-muted rounded-full w-5/6" />
//           <div className="h-3 bg-muted rounded-full w-4/6" />
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Empty State ──────────────────────────────────────────────────────────────
// function EmptyState({ label }: { label: string }) {
//   return (
//     <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
//       <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
//         <Shield className="w-8 h-8 text-muted-foreground" />
//       </div>
//       <div>
//         <p className="font-semibold text-foreground text-base">No {label} yet</p>
//         <p className="text-muted-foreground text-sm mt-1">Data will appear here once added.</p>
//       </div>
//     </div>
//   );
// }

// // ─── Error Banner ─────────────────────────────────────────────────────────────
// function ErrorBanner({ message }: { message: string }) {
//   return (
//     <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
//       <AlertCircle className="w-5 h-5 shrink-0" />
//       <span>{message}</span>
//     </div>
//   );
// }

// // ─── Rank Card — centered logo-style image ────────────────────────────────────
// function RankCard({ item }: { item: ClubRank }) {
//   const [imgError, setImgError] = useState(false);
//   const [expanded, setExpanded] = useState(false);
//   const hasLongDesc = (item.description?.length ?? 0) > 120;

//   return (
//     <div className="group relative bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lift hover:-translate-y-1 transition-all duration-300 flex flex-col">
//       {/* Logo / Badge Image — centered */}
//       <div className="relative flex flex-col items-center justify-center pt-7 pb-5 px-6
//                       bg-gradient-to-b from-muted/50 to-white border-b border-border/50">
//         {/* Decorative radial glow behind logo */}
//         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//           <div className="w-32 h-32 rounded-full bg-primary/6 blur-2xl" />
//         </div>
//         {item.image_url && !imgError ? (
//           <img
//             src={item.image_url}
//             alt={item.title}
//             className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-md
//                        transition-transform duration-500 group-hover:scale-110"
//             onError={() => setImgError(true)}
//           />
//         ) : (
//           <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-muted/60
//                           flex items-center justify-center border border-border">
//             <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
//           </div>
//         )}
//       </div>

//       {/* Content */}
//       <div className="p-4 sm:p-5 flex flex-col flex-1 text-center">
//         <h3 className="font-heading font-bold text-[15px] sm:text-[16px] text-foreground tracking-tight leading-tight">
//           {item.title}
//         </h3>
//         {item.subtitle && (
//           <p className="text-primary text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider mt-1">
//             {item.subtitle}
//           </p>
//         )}
//         {item.description && (
//           <div className="mt-3 text-left">
//             <p className={cn(
//               "text-muted-foreground text-[12px] sm:text-[13px] leading-relaxed transition-all",
//               !expanded && hasLongDesc && "line-clamp-3"
//             )}>
//               {item.description}
//             </p>
//             {hasLongDesc && (
//               <button
//                 onClick={() => setExpanded(!expanded)}
//                 className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
//               >
//                 {expanded ? 'Show less' : 'Read more'}
//                 {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
//               </button>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Hover accent bar */}
//       <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-red-400
//                       scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
//     </div>
//   );
// }

// // ─── Achievement Card — full-bleed cover image ────────────────────────────────
// function AchievementCard({ item }: { item: ClubAchievement }) {
//   const [imgError, setImgError] = useState(false);
//   const [expanded, setExpanded] = useState(false);
//   const hasLongDesc = (item.description?.length ?? 0) > 120;

//   return (
//     <div className="group relative bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lift hover:-translate-y-1 transition-all duration-300">
//       {/* Cover Image */}
//       <div className="relative h-44 sm:h-52 bg-gradient-to-br from-muted to-secondary overflow-hidden">
//         {item.image_url && !imgError ? (
//           <img
//             src={item.image_url}
//             alt={item.title}
//             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
//             onError={() => setImgError(true)}
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center">
//             <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
//           </div>
//         )}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//       </div>

//       {/* Content */}
//       <div className="p-4 sm:p-5">
//         <h3 className="font-heading font-bold text-[15px] sm:text-[16px] text-foreground tracking-tight leading-tight truncate">
//           {item.title}
//         </h3>
//         {item.subtitle && (
//           <p className="text-primary text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider mt-1">
//             {item.subtitle}
//           </p>
//         )}
//         {item.description && (
//           <div className="mt-3">
//             <p className={cn(
//               "text-muted-foreground text-[12px] sm:text-[13px] leading-relaxed transition-all",
//               !expanded && hasLongDesc && "line-clamp-3"
//             )}>
//               {item.description}
//             </p>
//             {hasLongDesc && (
//               <button
//                 onClick={() => setExpanded(!expanded)}
//                 className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
//               >
//                 {expanded ? 'Show less' : 'Read more'}
//                 {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
//               </button>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Hover accent bar */}
//       <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-red-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
//     </div>
//   );
// }

// // ─── Rule Accordion Card ──────────────────────────────────────────────────────
// function RuleCard({ rule, index }: { rule: ClubRule; index: number }) {
//   const [open, setOpen] = useState(false);

//   return (
//     <div
//       className={cn(
//         "group bg-white border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-300",
//         open ? "shadow-md border-primary/20" : "hover:shadow-md hover:-translate-y-0.5"
//       )}
//     >
//       <button
//         onClick={() => setOpen(!open)}
//         className="w-full flex items-center gap-4 p-4 sm:p-5 text-left"
//         aria-expanded={open}
//       >
//         {/* Number badge */}
//         <div className={cn(
//           "shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-heading font-bold text-sm transition-all duration-200",
//           open
//             ? "bg-primary text-white shadow-glow-red"
//             : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
//         )}>
//           {String(index + 1).padStart(2, '0')}
//         </div>

//         {/* Titles */}
//         <div className="flex-1 min-w-0">
//           <h3 className="font-heading font-bold text-[14px] sm:text-[15px] text-foreground tracking-tight leading-tight">
//             {rule.title}
//           </h3>
//           {rule.subtitle && (
//             <p className="text-muted-foreground text-[11px] sm:text-[12px] font-medium mt-0.5 truncate">
//               {rule.subtitle}
//             </p>
//           )}
//         </div>

//         {/* Chevron */}
//         <div className={cn(
//           "shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200",
//           open ? "bg-primary/10 text-primary rotate-180" : "bg-muted text-muted-foreground group-hover:bg-muted"
//         )}>
//           <ChevronDown className="w-4 h-4" />
//         </div>
//       </button>

//       {/* Expandable description */}
//       <div className={cn(
//         "overflow-hidden transition-all duration-300",
//         open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
//       )}>
//         {rule.description && (
//           <div className="px-4 sm:px-5 pb-4 sm:pb-5">
//             <div className="pt-2 border-t border-border/60">
//               <p className="text-muted-foreground text-[12px] sm:text-[13px] leading-relaxed pt-3">
//                 {rule.description}
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────
// export function ClubInfo() {
//   const [activeTab, setActiveTab] = useState<TabId>('rules');
//   const [rules, setRules]             = useState<ClubRule[]>([]);
//   const [ranks, setRanks]             = useState<ClubRank[]>([]);
//   const [achievements, setAchievements] = useState<ClubAchievement[]>([]);
//   const [loading, setLoading] = useState<Record<TabId, boolean>>({ rules: false, ranks: false, achievements: false });
//   const [errors, setErrors]   = useState<Record<TabId, string | null>>({ rules: null, ranks: null, achievements: null });
//   const [fetched, setFetched] = useState<Record<TabId, boolean>>({ rules: false, ranks: false, achievements: false });

//   // Lazy-fetch each tab on first visit
//   useEffect(() => {
//     if (fetched[activeTab]) return;

//     const fetchTab = async () => {
//       setLoading(prev => ({ ...prev, [activeTab]: true }));
//       setErrors(prev => ({ ...prev, [activeTab]: null }));

//       try {
//         if (activeTab === 'rules') {
//           const { data, error } = await supabase
//             .from('club_rules')
//             .select('*')
//             .order('created_at', { ascending: false });
//           if (error) throw error;
//           setRules(data ?? []);
//         } else if (activeTab === 'ranks') {
//           const { data, error } = await supabase
//             .from('club_ranks')
//             .select('*')
//             .order('created_at', { ascending: false });
//           if (error) throw error;
//           setRanks(data ?? []);
//         } else if (activeTab === 'achievements') {
//           const { data, error } = await supabase
//             .from('club_achievements')
//             .select('*')
//             .order('created_at', { ascending: false });
//           if (error) throw error;
//           setAchievements(data ?? []);
//         }
//         setFetched(prev => ({ ...prev, [activeTab]: true }));
//       } catch (err: unknown) {
//         const msg = err instanceof Error ? err.message : 'Failed to load data.';
//         setErrors(prev => ({ ...prev, [activeTab]: msg }));
//       } finally {
//         setLoading(prev => ({ ...prev, [activeTab]: false }));
//       }
//     };

//     fetchTab();
//   }, [activeTab, fetched]);

//   const isLoading = loading[activeTab];
//   const error     = errors[activeTab];

//   return (
//     <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">

//       {/* ── Page Header ── */}
//       <div className="relative rounded-3xl overflow-hidden mb-8 sm:mb-10 bg-gradient-to-br from-[#0d0d0d] via-[#1a0608] to-[#0d0d0d] p-6 sm:p-8 lg:p-10 shadow-xl">
//         {/* Background glow blobs */}
//         <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
//         <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-red-900/20 rounded-full blur-2xl pointer-events-none" />

//         <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
//           {/* Icon */}
//           <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 shadow-glow-red">
//             <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
//           </div>

//           <div className="flex-1">
//             <h1 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
//               Club Info
//             </h1>
//             <p className="text-white/50 text-[13px] sm:text-sm mt-1 max-w-lg">
//               Explore our club's rules, ranking tiers, and proudest achievements.
//             </p>
//           </div>

//           {/* Stats summary badges */}
//           <div className="flex flex-wrap gap-2 sm:gap-3 sm:ml-auto">
//             {[
//               { label: 'Rules',        value: fetched.rules ? rules.length : '—',         icon: BookOpen },
//               { label: 'Ranks',        value: fetched.ranks ? ranks.length : '—',         icon: Star },
//               { label: 'Achievements', value: fetched.achievements ? achievements.length : '—', icon: Trophy },
//             ].map(s => {
//               const Icon = s.icon;
//               return (
//                 <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/8 border border-white/12 backdrop-blur-sm">
//                   <Icon className="w-3.5 h-3.5 text-primary" />
//                   <span className="text-white/80 text-[11px] font-semibold">{s.label}</span>
//                   <span className="text-white font-bold text-[12px]">{s.value}</span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* ── Tab Bar ── */}
//       <div className="relative mb-6 sm:mb-8">
//         {/* Desktop: pill tabs */}
//         <div className="flex items-center bg-muted/60 border border-border rounded-2xl p-1 gap-1 w-full sm:w-auto sm:inline-flex">
//           {TABS.map(tab => {
//             const Icon = tab.icon;
//             const isActive = activeTab === tab.id;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={cn(
//                   "relative flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-[12px] sm:text-[13px] font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary",
//                   isActive
//                     ? "bg-white text-foreground shadow-sm"
//                     : "text-muted-foreground hover:text-foreground hover:bg-white/50"
//                 )}
//               >
//                 <Icon className={cn(
//                   "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors",
//                   isActive ? "text-primary" : "text-muted-foreground"
//                 )} />
//                 <span className="hidden xs:inline sm:inline">{tab.label}</span>
//                 {/* Mobile: active indicator dot */}
//                 {isActive && (
//                   <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary sm:hidden" />
//                 )}
//               </button>
//             );
//           })}
//         </div>
//         {/* Active tab label for mobile */}
//         <p className="mt-3 sm:hidden text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
//           {TABS.find(t => t.id === activeTab)?.label}
//         </p>
//       </div>

//       {/* ── Content ── */}
//       {error && <div className="mb-6"><ErrorBanner message={error} /></div>}

//       {/* Club Rules Tab */}
//       {activeTab === 'rules' && (
//         <div className="space-y-3">
//           {isLoading ? (
//             Array.from({ length: 5 }).map((_, i) => (
//               <div key={i} className="bg-white border border-border rounded-2xl p-4 sm:p-5 animate-pulse">
//                 <div className="flex items-center gap-4">
//                   <div className="w-10 h-10 rounded-xl bg-muted shrink-0" />
//                   <div className="flex-1 space-y-2">
//                     <div className="h-4 bg-muted rounded-full w-1/2" />
//                     <div className="h-3 bg-muted rounded-full w-1/3" />
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : rules.length === 0 && !error ? (
//             <EmptyState label="Club Rules" />
//           ) : (
//             rules.map((rule, i) => <RuleCard key={rule.id} rule={rule} index={i} />)
//           )}
//         </div>
//       )}

//       {/* Ranks Tab */}
//       {activeTab === 'ranks' && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
//           {isLoading ? (
//             Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} hasImage logoStyle />)
//           ) : ranks.length === 0 && !error ? (
//             <div className="col-span-full"><EmptyState label="Ranks" /></div>
//           ) : (
//             ranks.map(rank => <RankCard key={rank.id} item={rank} />)
//           )}
//         </div>
//       )}

//       {/* Achievements Tab */}
//       {activeTab === 'achievements' && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
//           {isLoading ? (
//             Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} hasImage />)
//           ) : achievements.length === 0 && !error ? (
//             <div className="col-span-full"><EmptyState label="Achievements" /></div>
//           ) : (
//             achievements.map(ach => <AchievementCard key={ach.id} item={ach} />)
//           )}
//         </div>
//       )}

//       {/* Loading spinner for active fetch */}
//       {isLoading && (
//         <div className="fixed bottom-24 sm:bottom-6 right-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold shadow-xl z-50">
//           <Loader2 className="w-3.5 h-3.5 animate-spin" />
//           Loading...
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Shield, Star, Trophy, BookOpen, ChevronDown, ChevronUp, AlertCircle, Loader2, Image as ImageIcon, Flame, Crown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ClubRule {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  created_at: string;
}
interface ClubRank {
  id: string;
  image_url: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  created_at: string;
}
interface ClubAchievement {
  id: string;
  image_url: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  created_at: string;
}

type TabId = 'rules' | 'ranks' | 'achievements';

const TABS: { id: TabId; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'rules', label: 'Club Rules', icon: BookOpen },
  { id: 'ranks', label: 'Ranks & Badges', icon: Star },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard({ hasImage, logoStyle }: { hasImage?: boolean; logoStyle?: boolean }) {
  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden animate-pulse">
      {hasImage && (
        logoStyle ? (
          <div className="flex flex-col items-center pt-7 pb-4 px-6 bg-muted/30">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-muted" />
          </div>
        ) : (
          <div className="h-44 sm:h-48 bg-muted" />
        )
      )}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="h-4 bg-muted rounded-full w-2/3" />
        <div className="h-3 bg-muted rounded-full w-1/2" />
        <div className="space-y-1.5">
          <div className="h-3 bg-muted rounded-full w-full" />
          <div className="h-3 bg-muted rounded-full w-5/6" />
          <div className="h-3 bg-muted rounded-full w-4/6" />
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
        <Shield className="w-8 h-8 text-muted-foreground" />
      </div>
      <div>
        <p className="font-semibold text-foreground text-base">No {label} yet</p>
        <p className="text-muted-foreground text-sm mt-1">Data will appear here once added.</p>
      </div>
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// ─── Rank Card ────────────────────────────────────────────────────────────────
function RankCard({ item }: { item: ClubRank }) {
  const [imgError, setImgError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const hasLongDesc = (item.description?.length ?? 0) > 120;

  return (
    <div className="group relative bg-white border border-border/60 rounded-2xl overflow-hidden
                    shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col">

      {/* Top accent bar */}
      <div className="h-[3px] bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

      {/* Badge image — centered with dark gradient bg */}
      <div className="relative flex flex-col items-center justify-center pt-8 pb-6 px-6
                      bg-gradient-to-b from-slate-900 to-slate-800 border-b border-white/5">
        {/* Radial glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-36 h-36 rounded-full bg-amber-400/10 blur-2xl" />
        </div>

        {/* Crown icon top-right */}
        <div className="absolute top-3 right-3 opacity-20">
          <Crown className="w-5 h-5 text-amber-400" />
        </div>

        {item.image_url && !imgError ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-xl
                       transition-transform duration-500 group-hover:scale-110 group-hover:drop-shadow-2xl"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl
                          bg-white/5 border border-white/10
                          flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-white/20" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 text-center">
        <h3 className="font-bold text-[15px] sm:text-[16px] text-foreground tracking-tight leading-tight">
          {item.title}
        </h3>
        {item.subtitle && (
          <p className="text-amber-500 text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider mt-1.5">
            {item.subtitle}
          </p>
        )}
        {item.description && (
          <div className="mt-3 text-left">
            <p className={cn(
              "text-muted-foreground text-[12px] sm:text-[13px] leading-relaxed transition-all",
              !expanded && hasLongDesc && "line-clamp-3"
            )}>
              {item.description}
            </p>
            {hasLongDesc && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-amber-500 hover:text-amber-600 transition-colors"
              >
                {expanded ? 'Show less' : 'Read more'}
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hover bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px]
                      bg-gradient-to-r from-amber-400 to-yellow-300
                      scale-x-0 group-hover:scale-x-100
                      transition-transform duration-300 origin-left" />
    </div>
  );
}

// ─── Achievement Card ─────────────────────────────────────────────────────────
function AchievementCard({ item }: { item: ClubAchievement }) {
  const [imgError, setImgError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const hasLongDesc = (item.description?.length ?? 0) > 120;

  return (
    <div className="group relative bg-white border border-border/60 rounded-2xl overflow-hidden
                    shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300">

      {/* Cover image */}
      <div className="relative h-44 sm:h-52 bg-slate-900 overflow-hidden">
        {item.image_url && !imgError ? (
          <>
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
              onError={() => setImgError(true)}
            />
            {/* Permanent bottom scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-white/20" />
          </div>
        )}

        {/* Trophy badge overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5
                        bg-black/50 backdrop-blur-sm border border-white/10
                        rounded-full px-2.5 py-1">
          <Trophy className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] font-semibold text-white/90 uppercase tracking-wide">Achievement</span>
        </div>

        {/* Title overlay on image */}
        {item.image_url && !imgError && (
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <h3 className="font-bold text-[15px] sm:text-[16px] text-white tracking-tight leading-tight truncate drop-shadow">
              {item.title}
            </h3>
            {item.subtitle && (
              <p className="text-amber-400 text-[11px] font-semibold uppercase tracking-wider mt-0.5 drop-shadow">
                {item.subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Content (title shown here only if no image) */}
      <div className="p-4 sm:p-5">
        {(!item.image_url || imgError) && (
          <>
            <h3 className="font-bold text-[15px] sm:text-[16px] text-foreground tracking-tight leading-tight truncate">
              {item.title}
            </h3>
            {item.subtitle && (
              <p className="text-amber-500 text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider mt-1">
                {item.subtitle}
              </p>
            )}
          </>
        )}
        {item.description && (
          <div className={cn((!item.image_url || imgError) && "mt-3")}>
            <p className={cn(
              "text-muted-foreground text-[12px] sm:text-[13px] leading-relaxed transition-all",
              !expanded && hasLongDesc && "line-clamp-3"
            )}>
              {item.description}
            </p>
            {hasLongDesc && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-amber-500 hover:text-amber-600 transition-colors"
              >
                {expanded ? 'Show less' : 'Read more'}
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hover accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px]
                      bg-gradient-to-r from-amber-400 to-yellow-300
                      scale-x-0 group-hover:scale-x-100
                      transition-transform duration-300 origin-left" />
    </div>
  );
}

// ─── Rule Accordion Card ──────────────────────────────────────────────────────
function RuleCard({ rule, index }: { rule: ClubRule; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "group bg-white border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-300",
        open ? "shadow-md border-primary/20" : "hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 sm:p-5 text-left"
        aria-expanded={open}
      >
        {/* Number badge */}
        <div className={cn(
          "shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200",
          open
            ? "bg-primary text-white"
            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        )}>
          {String(index + 1).padStart(2, '0')}
        </div>

        {/* Titles */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[14px] sm:text-[15px] text-foreground tracking-tight leading-tight">
            {rule.title}
          </h3>
          {rule.subtitle && (
            <p className="text-muted-foreground text-[11px] sm:text-[12px] font-medium mt-0.5 truncate">
              {rule.subtitle}
            </p>
          )}
        </div>

        {/* Chevron */}
        <div className={cn(
          "shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200",
          open ? "bg-primary/10 text-primary rotate-180" : "bg-muted text-muted-foreground"
        )}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {/* Expandable description */}
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        {rule.description && (
          <div className="px-4 sm:px-5 pb-4 sm:pb-5">
            <div className="pt-2 border-t border-border/60">
              <p className="text-muted-foreground text-[12px] sm:text-[13px] leading-relaxed pt-3">
                {rule.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function ClubInfo() {
  const [activeTab, setActiveTab] = useState<TabId>('rules');
  const [rules, setRules] = useState<ClubRule[]>([]);
  const [ranks, setRanks] = useState<ClubRank[]>([]);
  const [achievements, setAchievements] = useState<ClubAchievement[]>([]);
  const [loading, setLoading] = useState<Record<TabId, boolean>>({ rules: false, ranks: false, achievements: false });
  const [errors, setErrors] = useState<Record<TabId, string | null>>({ rules: null, ranks: null, achievements: null });
  const [fetched, setFetched] = useState<Record<TabId, boolean>>({ rules: false, ranks: false, achievements: false });

  useEffect(() => {
    if (fetched[activeTab]) return;

    const fetchTab = async () => {
      setLoading(prev => ({ ...prev, [activeTab]: true }));
      setErrors(prev => ({ ...prev, [activeTab]: null }));

      try {
        if (activeTab === 'rules') {
          const { data, error } = await supabase.from('club_rules').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          setRules(data ?? []);
        } else if (activeTab === 'ranks') {
          const { data, error } = await supabase.from('club_ranks').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          setRanks(data ?? []);
        } else if (activeTab === 'achievements') {
          const { data, error } = await supabase.from('club_achievements').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          setAchievements(data ?? []);
        }
        setFetched(prev => ({ ...prev, [activeTab]: true }));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load data.';
        setErrors(prev => ({ ...prev, [activeTab]: msg }));
      } finally {
        setLoading(prev => ({ ...prev, [activeTab]: false }));
      }
    };

    fetchTab();
  }, [activeTab, fetched]);

  const isLoading = loading[activeTab];
  const error = errors[activeTab];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">

      {/* ── Hero Banner ── */}
      <div className="relative rounded-3xl overflow-hidden mb-8 sm:mb-10 shadow-xl">

        {/* Dark layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

        {/* Gold accent glow top-left */}
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        {/* Subtle red glow bottom-right */}
        <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-red-800/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

        {/* Content */}
        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">

            {/* Icon */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl
                              bg-gradient-to-br from-amber-400/20 to-amber-600/10
                              border border-amber-400/30
                              flex items-center justify-center shadow-lg">
                <Flame className="w-8 h-8 text-amber-400" />
              </div>
              {/* Small crown above */}
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
                <Crown className="w-3.5 h-3.5 text-slate-900" />
              </div>
            </div>

            {/* Title block */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-semibold text-amber-400/80 uppercase tracking-widest">
                  The Elits · COBEG
                </span>
              </div>
              <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
                Club Info
              </h1>
              <p className="text-white/45 text-[13px] sm:text-sm mt-1.5 max-w-lg">
                Explore our club's rules, ranking tiers, and proudest achievements.
              </p>
            </div>

            {/* Stats summary badges */}
            <div className="flex flex-wrap gap-2 sm:gap-2.5 sm:ml-auto">
              {[
                { label: 'Rules', value: fetched.rules ? rules.length : '—', icon: BookOpen },
                { label: 'Ranks', value: fetched.ranks ? ranks.length : '—', icon: Star },
                { label: 'Achievements', value: fetched.achievements ? achievements.length : '—', icon: Trophy },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl
                               bg-white/5 border border-white/10 backdrop-blur-sm"
                  >
                    <Icon className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-white/60 text-[11px] font-medium">{s.label}</span>
                    <span className="text-white font-bold text-[13px]">{s.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom gold accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
      </div>

      {/* ── Tab Bar ── */}
      <div className="relative mb-6 sm:mb-8">
        <div className="flex items-center bg-muted/60 border border-border rounded-2xl p-1 gap-1 w-full sm:w-auto sm:inline-flex">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-[12px] sm:text-[13px] font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                )}
              >
                <Icon className={cn(
                  "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors",
                  isActive ? "text-amber-500" : "text-muted-foreground"
                )} />
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500 sm:hidden" />
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 sm:hidden text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          {TABS.find(t => t.id === activeTab)?.label}
        </p>
      </div>

      {/* ── Content ── */}
      {error && <div className="mb-6"><ErrorBanner message={error} /></div>}

      {/* Club Rules */}
      {activeTab === 'rules' && (
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white border border-border rounded-2xl p-4 sm:p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded-full w-1/2" />
                    <div className="h-3 bg-muted rounded-full w-1/3" />
                  </div>
                </div>
              </div>
            ))
          ) : rules.length === 0 && !error ? (
            <EmptyState label="Club Rules" />
          ) : (
            rules.map((rule, i) => <RuleCard key={rule.id} rule={rule} index={i} />)
          )}
        </div>
      )}

      {/* Ranks */}
      {activeTab === 'ranks' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} hasImage logoStyle />)
          ) : ranks.length === 0 && !error ? (
            <div className="col-span-full"><EmptyState label="Ranks" /></div>
          ) : (
            ranks.map(rank => <RankCard key={rank.id} item={rank} />)
          )}
        </div>
      )}

      {/* Achievements */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} hasImage />)
          ) : achievements.length === 0 && !error ? (
            <div className="col-span-full"><EmptyState label="Achievements" /></div>
          ) : (
            achievements.map(ach => <AchievementCard key={ach.id} item={ach} />)
          )}
        </div>
      )}

      {/* Loading toast */}
      {isLoading && (
        <div className="fixed bottom-24 sm:bottom-6 right-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold shadow-xl z-50">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Loading...
        </div>
      )}
    </div>
  );
}