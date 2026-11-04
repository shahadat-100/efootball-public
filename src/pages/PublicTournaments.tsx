import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Tournament, TournamentMatch, TournamentGroup, TournamentParticipant, TournamentRegistration, TournamentStatus } from '@/features/tournaments/types';
import { calculateGroupStandings } from '@/features/tournaments/utils/tournamentEngine';
import { TournamentRegistrationModal } from '@/features/tournaments/components/TournamentRegistrationModal';
import { MatchScoreSubmissionModal } from '@/features/tournaments/components/MatchScoreSubmissionModal';
import { TournamentKnockoutBracket } from '@/features/tournaments/components/TournamentKnockoutBracket';
import { TournamentPlayerCard } from '@/features/tournaments/components/TournamentPlayerCard';
import { useFootballStore, mapPlayerFromDb } from '@/store/footballStore';
import { 
  Trophy, Calendar, Users, Smartphone,
  Clock, Sparkles, Eye, X, Hash, GitBranch, UserPlus, CheckCircle2
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export function PublicTournaments() {
  const storePlayers = useFootballStore((state) => state.players) || [];
  const fetchPlayers = useFootballStore((state) => state.fetchPlayers);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  
  const [groups, setGroups] = useState<TournamentGroup[]>([]);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  
  const [activeTab, setActiveTab] = useState<'participants' | 'matches' | 'groups' | 'bracket'>('participants');
  const [selectedMatchday, setSelectedMatchday] = useState<number>(1);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [selectedMatchForSubmission, setSelectedMatchForSubmission] = useState<TournamentMatch | null>(null);
  const [viewingPlayerCard, setViewingPlayerCard] = useState<TournamentRegistration | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all tournaments
  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const list = data || [];
      setTournaments(list);
      if (list.length > 0 && !selectedTournament) {
        setSelectedTournament(list[0]);
      }
    } catch (err) {
      console.error('Error fetching tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch details for the selected tournament
  const fetchTournamentDetails = async (tournamentId: string) => {
    try {
      // NOTE: select plain rows and join players in JS. The public API does not
      // expose foreign keys between tournament tables and `players`, so
      // PostgREST nested selects (`player:players(*)`) return a 400.
      const [groupsRes, participantsRes, matchesRes, regRes, playersRes] = await Promise.all([
        supabase.from('tournament_groups').select('*').eq('tournament_id', tournamentId).order('name', { ascending: true }),
        supabase.from('tournament_participants').select('*').eq('tournament_id', tournamentId),
        supabase.from('tournament_matches').select('*').eq('tournament_id', tournamentId).order('matchday', { ascending: true }),
        supabase.from('tournament_registrations').select('*').eq('tournament_id', tournamentId).eq('status', 'approved'),
        supabase.from('players').select('*').limit(2000),
      ]);

      if (groupsRes.error) console.error('Error fetching groups:', groupsRes.error);
      if (participantsRes.error) console.error('Error fetching participants:', participantsRes.error);
      if (matchesRes.error) console.error('Error fetching matches:', matchesRes.error);
      if (regRes.error) console.error('Error fetching registrations:', regRes.error);
      if (playersRes.error) console.error('Error fetching players:', playersRes.error);

      const playerMap = new Map<string, ReturnType<typeof mapPlayerFromDb>>(
        (playersRes.data || []).map((p: any) => [p.id, mapPlayerFromDb(p)])
      );

      setGroups((groupsRes.data as TournamentGroup[]) || []);
      setParticipants(
        ((participantsRes.data as any[]) || []).map((p) => ({
          ...p,
          player: p.player_id ? playerMap.get(p.player_id) : undefined,
        })) as TournamentParticipant[]
      );
      setMatches(
        ((matchesRes.data as any[]) || []).map((m) => ({
          ...m,
          player1: m.player1_id ? playerMap.get(m.player1_id) : undefined,
          player2: m.player2_id ? playerMap.get(m.player2_id) : undefined,
        })) as TournamentMatch[]
      );
      setRegistrations(
        ((regRes.data as any[]) || []).map((r) => ({
          ...r,
          player: r.player_id ? playerMap.get(r.player_id) : undefined,
        })) as TournamentRegistration[]
      );

      const cur = tournaments.find(t => t.id === tournamentId);
      if (cur?.status === 'group_stage') {
        setActiveTab('matches');
      } else if (cur?.status === 'knockout_stage') {
        setActiveTab('bracket');
      } else {
        setActiveTab('participants');
      }
    } catch (err) {
      console.error('Error fetching tournament details:', err);
    }
  };

  useEffect(() => {
    fetchTournaments();
    // Public visitors land here directly, so make sure the player list is
    // available for the registration form's player picker.
    fetchPlayers().finally(() => setPlayersLoading(false));
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchTournamentDetails(selectedTournament.id);
    }
  }, [selectedTournament]);

  const matchdayMatches = matches.filter(m => m.stage === 'group' && m.matchday === selectedMatchday);
  const availableMatchdays = Array.from(new Set(matches.filter(m => m.stage === 'group').map(m => m.matchday))).sort((a, b) => a - b);

  const getStageIndex = (status?: string) => {
    switch (status) {
      case 'registration_open': return 1;
      case 'group_stage': return 2;
      case 'knockout_stage': return 3;
      case 'completed': return 4;
      default: return 1;
    }
  };

  const currentStep = getStageIndex(selectedTournament?.status);

  const formatShortDate = (value?: string | null) => {
    if (!value) return 'TBA';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'TBA';
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  };

  const statusMeta: Record<TournamentStatus, {
    label: string;
    hint: (t: Tournament) => string;
    icon: typeof Trophy;
    dot: string;
    badge: string;
    iconWrap: string;
    bar: string;
  }> = {
    registration_open: {
      label: 'Registration Open',
      hint: (t) => `Register by ${formatShortDate(t.registration_deadline)}`,
      icon: UserPlus,
      dot: 'bg-emerald-500',
      badge: 'bg-emerald-500/10 text-emerald-600',
      iconWrap: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600',
      bar: 'bg-emerald-500',
    },
    group_stage: {
      label: 'Group Stage',
      hint: (t) => `Kicked off ${formatShortDate(t.start_date)}`,
      icon: Users,
      dot: 'bg-blue-500',
      badge: 'bg-blue-500/10 text-blue-600',
      iconWrap: 'bg-blue-500/10 border-blue-500/20 text-blue-600',
      bar: 'bg-blue-500',
    },
    knockout_stage: {
      label: 'Knockouts',
      hint: (t) => `Finals by ${formatShortDate(t.final_deadline)}`,
      icon: GitBranch,
      dot: 'bg-amber-500',
      badge: 'bg-amber-500/10 text-amber-600',
      iconWrap: 'bg-amber-500/10 border-amber-500/20 text-amber-600',
      bar: 'bg-amber-500',
    },
    completed: {
      label: 'Completed',
      hint: () => 'Champion crowned',
      icon: Trophy,
      dot: 'bg-slate-400',
      badge: 'bg-slate-500/10 text-slate-600',
      iconWrap: 'bg-slate-500/10 border-slate-500/20 text-slate-600',
      bar: 'bg-slate-400',
    },
    draft: {
      label: 'Coming Soon',
      hint: (t) => `Starts ${formatShortDate(t.start_date)}`,
      icon: Clock,
      dot: 'bg-gray-400',
      badge: 'bg-gray-500/10 text-gray-600',
      iconWrap: 'bg-gray-500/10 border-gray-500/20 text-gray-600',
      bar: 'bg-gray-400',
    },
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* ─── Page Header ─── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight flex items-center gap-3">
            <span className="text-amber-500">🏆</span> Tournament Hub
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-medium max-w-2xl">
            Active and upcoming championships. Select a tournament chip to view registered contenders, fixtures, and standings.
          </p>
        </div>

        {selectedTournament?.status === 'registration_open' && (
          <button
            onClick={() => setIsRegModalOpen(true)}
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary text-primary-foreground font-black text-sm tracking-wide shadow-sm hover:opacity-90 transition active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            Register & Get Card
          </button>
        )}
      </div>

      {/* ─── Tournament Selector ─── */}
      {tournaments.length > 0 ? (
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              Choose a Tournament
            </h2>
            <span className="text-[11px] font-semibold text-muted-foreground">
              {tournaments.length} available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tournaments.map((t) => {
              const isSelected = selectedTournament?.id === t.id;
              const meta = statusMeta[t.status];
              const StatusIcon = meta.icon;

              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTournament(t)}
                  className={cn(
                    'group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.99]',
                    isSelected
                      ? 'bg-[#00265a] border-[#c89850] shadow-lg ring-1 ring-[#c89850]/30'
                      : 'bg-card border-border hover:border-[#c89850]/50 hover:shadow-md'
                  )}
                >
                  {/* Status accent bar */}
                  <span className={cn('absolute inset-y-0 left-0 w-1', meta.bar)} />

                  <div className="flex items-start gap-3 pl-1.5">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition',
                        isSelected
                          ? 'bg-white/10 border-white/20 text-[#c89850]'
                          : meta.iconWrap
                      )}
                    >
                      <StatusIcon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={cn(
                          'text-sm font-black leading-tight truncate',
                          isSelected ? 'text-white' : 'text-foreground'
                        )}>
                          {t.title}
                        </h3>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#c89850] flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                          isSelected ? 'bg-white/10 text-white/80' : meta.badge
                        )}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', meta.dot)} />
                          {meta.label}
                        </span>
                        {t.season_name && (
                          <span className={cn(
                            'text-[10px] font-semibold truncate',
                            isSelected ? 'text-white/50' : 'text-muted-foreground/70'
                          )}>
                            {t.season_name}
                          </span>
                        )}
                      </div>

                      <p className={cn(
                        'mt-1.5 text-[11px] font-medium truncate',
                        isSelected ? 'text-white/60' : 'text-muted-foreground'
                      )}>
                        {meta.hint(t)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : !loading ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border text-muted-foreground text-sm shadow-sm mb-6">
          <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="font-bold text-foreground">No tournaments available right now</p>
          <p className="text-xs text-muted-foreground mt-1">Check back soon for upcoming tournaments!</p>
        </div>
      ) : null}

      {/* ─── Selected Tournament Content ─── */}
      {selectedTournament && (
        <div className="space-y-6">
          {/* Progress Timeline (* --- | --- | --- *) */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between relative max-w-3xl mx-auto px-4">
              {/* Background Connecting Line */}
              <div className="absolute left-8 right-8 top-4 h-[2px] bg-border -z-0" />
              {/* Active Progress Line */}
              <div 
                className="absolute left-8 top-4 h-[2px] bg-primary transition-all duration-500 -z-0"
                style={{ width: `${((currentStep - 1) / 3) * 85}%` }}
              />

              {[
                { step: 1, label: 'Registration', desc: `${registrations.length} Players` },
                { step: 2, label: 'Group Stage', desc: 'Round-Robin' },
                { step: 3, label: 'Knockouts', desc: 'QF → Semis' },
                { step: 4, label: 'Finals', desc: 'Championship' },
              ].map((s) => {
                const isDone = currentStep > s.step;
                const isCurrent = currentStep === s.step;

                return (
                  <div key={s.step} className="flex flex-col items-center relative z-10 bg-card px-2">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all',
                      isDone ? 'bg-primary text-primary-foreground shadow' :
                      isCurrent ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110' :
                      'bg-muted text-muted-foreground border border-border'
                    )}>
                      {isDone ? '✓' : s.step}
                    </div>
                    <span className={cn(
                      'text-xs font-bold mt-2 text-center whitespace-nowrap',
                      isCurrent ? 'text-foreground font-black' : 'text-muted-foreground'
                    )}>
                      {s.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 hidden sm:block whitespace-nowrap">
                      {s.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-muted/40 p-1.5 rounded-2xl border border-border w-max overflow-x-auto">
            <button
              onClick={() => setActiveTab('participants')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap',
                activeTab === 'participants' ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Users className="w-3.5 h-3.5" />
              Contenders ({registrations.length})
            </button>

            {matches.length > 0 && (
              <>
                <button
                  onClick={() => setActiveTab('matches')}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap',
                    activeTab === 'matches' ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Matchday Fixtures
                </button>

                <button
                  onClick={() => setActiveTab('groups')}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap',
                    activeTab === 'groups' ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Group Tables
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('bracket')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap',
                activeTab === 'bracket' ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <GitBranch className="w-3.5 h-3.5" />
              Knockout Tree
            </button>
          </div>

          {/* ─── TAB 1: REGISTERED PLAYERS / CONTENDERS ─── */}
          {activeTab === 'participants' && (
            <div className="space-y-4">
              {registrations.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-card border border-border text-muted-foreground text-sm shadow-sm">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-foreground">No approved contenders yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Be the first to register and generate your official player card!</p>
                  {selectedTournament.status === 'registration_open' && (
                    <button
                      onClick={() => setIsRegModalOpen(true)}
                      className="mt-4 inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Register Now
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {registrations.map((reg) => (
                    <div
                      key={reg.id}
                      className="p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition duration-200 shadow-sm flex flex-col items-center text-center group"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border overflow-hidden mb-3 group-hover:scale-105 transition">
                        {reg.player?.profileImageUrl ? (
                          <img src={reg.player.profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">⚽</div>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-foreground truncate max-w-[130px]">
                        {reg.player?.name || 'Player'}
                      </h4>

                      <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center justify-center gap-1 font-mono text-[11px] text-foreground font-semibold">
                          <Hash className="w-3 h-3 text-primary" />
                          <span className="truncate max-w-[110px]">{reg.game_id}</span>
                        </span>
                        <span className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground/70">
                          <Smartphone className="w-2.5 h-2.5" />
                          <span className="truncate max-w-[110px]">{reg.device_model}</span>
                        </span>
                      </div>

                      <button
                        onClick={() => setViewingPlayerCard(reg)}
                        className="mt-3 w-full py-1.5 px-2 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground text-foreground font-bold text-[11px] transition flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Card</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 2: MATCHDAY FIXTURES ─── */}
          {activeTab === 'matches' && (
            <div className="space-y-4">
              {availableMatchdays.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {availableMatchdays.map((md) => (
                    <button
                      key={md}
                      onClick={() => setSelectedMatchday(md)}
                      className={cn(
                        'py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition border',
                        selectedMatchday === md
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-card text-muted-foreground border-border hover:text-foreground'
                      )}
                    >
                      Matchday {md}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {matchdayMatches.map((m) => {
                  const isFinished = m.status === 'completed';
                  const isAutoWin = m.is_auto_win;

                  return (
                    <div key={m.id} className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 pb-2 border-b border-border/50">
                        <span className="font-bold text-primary">Matchday {m.matchday}</span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-muted-foreground/60" />
                          Play by: {new Date(m.play_deadline).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        {/* Player 1 */}
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs overflow-hidden flex-shrink-0">
                            {m.player1?.profileImageUrl ? (
                              <img src={m.player1.profileImageUrl} alt="" className="w-full h-full object-cover" />
                            ) : '⚽'}
                          </div>
                          <span className="font-bold text-sm text-foreground truncate">{m.player1?.name || 'TBD'}</span>
                        </div>

                        {/* Score */}
                        <div className="px-3 text-center flex-shrink-0">
                          {isFinished ? (
                            <span className="text-base font-black font-mono text-foreground px-2 py-1 rounded-lg bg-muted">
                              {m.player1_score} - {m.player2_score}
                            </span>
                          ) : (
                            <span className="text-xs font-black text-muted-foreground px-2 py-1 rounded bg-muted/50">
                              VS
                            </span>
                          )}
                        </div>

                        {/* Player 2 */}
                        <div className="flex items-center justify-end gap-2.5 flex-1 min-w-0 text-right">
                          <span className="font-bold text-sm text-foreground truncate">{m.player2?.name || 'TBD'}</span>
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs overflow-hidden flex-shrink-0">
                            {m.player2?.profileImageUrl ? (
                              <img src={m.player2.profileImageUrl} alt="" className="w-full h-full object-cover" />
                            ) : '⚽'}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                        {isAutoWin ? (
                          <span className="text-[11px] font-bold text-amber-500">Auto-Win Walkover</span>
                        ) : isFinished ? (
                          <span className="text-[11px] font-bold text-emerald-500">Verified Result</span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Pending match play</span>
                        )}

                        {!isFinished && (
                          <button
                            onClick={() => setSelectedMatchForSubmission(m)}
                            className="py-1 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold text-xs transition"
                          >
                            Submit Score
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── TAB 3: GROUP STANDINGS ─── */}
          {activeTab === 'groups' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {groups.map((group) => {
                const groupParticipants = participants.filter(p => p.group_id === group.id);
                const groupMatches = matches.filter(m => m.group_id === group.id);
                const standings = calculateGroupStandings(groupParticipants, groupMatches);

                return (
                  <div key={group.id} className="p-5 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-black text-foreground uppercase tracking-wider">
                        {group.name}
                      </h3>
                      <span className="text-xs text-muted-foreground font-semibold">Top 2 Qualify</span>
                    </div>

                    <table className="w-full text-left text-xs">
                      <thead className="text-muted-foreground uppercase font-bold border-b border-border/50 pb-2">
                        <tr>
                          <th className="py-2">#</th>
                          <th className="py-2">Player</th>
                          <th className="py-2 text-center">P</th>
                          <th className="py-2 text-center">W</th>
                          <th className="py-2 text-center">D</th>
                          <th className="py-2 text-center">L</th>
                          <th className="py-2 text-center">GD</th>
                          <th className="py-2 text-right font-black text-foreground">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 font-medium">
                        {standings.map((row) => (
                          <tr key={row.participant_id} className="hover:bg-muted/40 transition">
                            <td className="py-2.5 font-bold text-muted-foreground">{row.rank}</td>
                            <td className="py-2.5 font-bold text-foreground flex items-center gap-2">
                              {row.avatar_url && (
                                <img src={row.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                              )}
                              <span className="truncate max-w-[120px]">{row.player_name}</span>
                            </td>
                            <td className="py-2.5 text-center text-muted-foreground">{row.played}</td>
                            <td className="py-2.5 text-center text-emerald-500 font-bold">{row.won}</td>
                            <td className="py-2.5 text-center text-muted-foreground">{row.drawn}</td>
                            <td className="py-2.5 text-center text-rose-500 font-bold">{row.lost}</td>
                            <td className="py-2.5 text-center font-mono">
                              {row.gd > 0 ? `+${row.gd}` : row.gd}
                            </td>
                            <td className="py-2.5 text-right font-black text-foreground text-sm">
                              {row.points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── TAB 4: KNOCKOUT BRACKET WITH DRAW LINES ─── */}
          {activeTab === 'bracket' && (
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <TournamentKnockoutBracket
                matches={matches}
                championName={selectedTournament?.champion_player_id ? 'Tournament Champion' : null}
              />
            </div>
          )}
        </div>
      )}

      {/* Registration Modal */}
      {selectedTournament && (
        <TournamentRegistrationModal
          isOpen={isRegModalOpen}
          onClose={() => setIsRegModalOpen(false)}
          tournamentId={selectedTournament.id}
          tournamentTitle={selectedTournament.title}
          players={storePlayers}
          playersLoading={playersLoading}
          onRegistrationSuccess={() => {
            if (selectedTournament) fetchTournamentDetails(selectedTournament.id);
          }}
        />
      )}

      {/* Match Score Submission Modal */}
      {selectedMatchForSubmission && (
        <MatchScoreSubmissionModal
          isOpen={Boolean(selectedMatchForSubmission)}
          onClose={() => setSelectedMatchForSubmission(null)}
          match={selectedMatchForSubmission}
          onSubmitted={() => {
            if (selectedTournament) fetchTournamentDetails(selectedTournament.id);
            setSelectedMatchForSubmission(null);
          }}
        />
      )}

      {/* View Official Tournament Player Card Modal */}
      {viewingPlayerCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setViewingPlayerCard(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition z-20"
            >
              <X className="w-4 h-4" />
            </button>

            <TournamentPlayerCard
              playerName={viewingPlayerCard.player?.name || 'PLAYER'}
              playerImageUrl={viewingPlayerCard.player?.coverImageUrl}
              gameId={viewingPlayerCard.game_id}
              deviceModel={viewingPlayerCard.device_model}
              tournamentTitle={selectedTournament?.title}
              seasonName={selectedTournament?.season_name || 'SEASON 1 • 2026'}
            />
          </div>
        </div>
      )}
    </div>
  );
}
