import React, { useEffect, useRef, useState } from 'react';
import { Player } from '@/features/players/types';
import { TournamentPlayerCard } from './TournamentPlayerCard';
import { supabase } from '@/lib/supabase';
import { X, CheckCircle2, AlertCircle, Share2, ArrowRight, Search, ChevronDown, Check, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { isInAppBrowser } from '@/shared/lib/downloadHelper';

interface ExistingRegistration {
  id: string;
  tournament_id: string;
  player_id: string;
  game_id: string;
  device_model: string;
  facebook_post_url: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
}

interface TournamentRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  tournamentTitle: string;
  seasonName?: string;
  players: Player[];
  playersLoading?: boolean;
  initialPlayerId?: string;
  onRegistrationSuccess?: () => void;
}

export const TournamentRegistrationModal: React.FC<TournamentRegistrationModalProps> = ({
  isOpen,
  onClose,
  tournamentId,
  tournamentTitle,
  seasonName = 'SEASON 1 • 2026',
  players,
  playersLoading = false,
  initialPlayerId,
  onRegistrationSuccess
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState(initialPlayerId || '');

  useEffect(() => {
    if (isOpen && initialPlayerId) {
      setSelectedPlayerId(initialPlayerId);
    }
  }, [isOpen, initialPlayerId]);
  const [playerSearch, setPlayerSearch] = useState('');
  const [isPlayerMenuOpen, setIsPlayerMenuOpen] = useState(false);
  const playerMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [gameId, setGameId] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [facebookPostUrl, setFacebookPostUrl] = useState('');
  
  const [existingReg, setExistingReg] = useState<ExistingRegistration | null>(null);
  const [checkingReg, setCheckingReg] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Lock body scroll and hide bottom navigation while modal is active
  useEffect(() => {
    if (isOpen) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      return () => {
        document.body.style.overflow = originalStyle;
        document.body.classList.remove('modal-open');
      };
    }
  }, [isOpen]);

  // Fallback player loading in case store has not yet populated players
  const [internalPlayers, setInternalPlayers] = useState<Player[]>([]);
  const [loadingInternal, setLoadingInternal] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (players && players.length > 0) return;

    let isMounted = true;
    const fetchDirect = async () => {
      try {
        setLoadingInternal(true);
        const { data, error: fetchErr } = await supabase
          .from('players')
          .select('id, name, profileimageurl, coverimageurl, jerseynumber')
          .order('name', { ascending: true })
          .limit(2000);

        if (isMounted && data && !fetchErr) {
          setInternalPlayers(
            data.map((p: any) => ({
              id: p.id,
              name: p.name,
              profileImageUrl: p.profileimageurl || p.profileImageUrl || '',
              coverImageUrl: p.coverimageurl || p.coverImageUrl || '',
              jerseyNumber: p.jerseynumber ?? undefined,
              playerRoles: [],
              customTags: [],
              customStringTags: [],
              createdAt: '',
              seasons: [],
            } as any))
          );
        }
      } catch (err) {
        console.error('Error fetching fallback players:', err);
      } finally {
        if (isMounted) setLoadingInternal(false);
      }
    };

    fetchDirect();

    return () => {
      isMounted = false;
    };
  }, [isOpen, players]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (playerMenuRef.current && !playerMenuRef.current.contains(event.target as Node)) {
        setIsPlayerMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  
  // Check existing registration when player or tournament changes
  useEffect(() => {
    if (!isOpen || !selectedPlayerId || !tournamentId) {
      setExistingReg(null);
      return;
    }

    let isCurrent = true;
    setCheckingReg(true);
    setError(null);

    supabase
      .from('tournament_registrations')
      .select('id, tournament_id, player_id, game_id, device_model, facebook_post_url, status, rejection_reason')
      .eq('tournament_id', tournamentId)
      .eq('player_id', selectedPlayerId)
      .maybeSingle()
      .then(({ data, error: fetchErr }) => {
        if (!isCurrent) return;
        setCheckingReg(false);
        if (fetchErr) {
          console.warn('Could not check existing registration:', fetchErr);
          return;
        }

        if (data) {
          const reg = data as ExistingRegistration;
          setExistingReg(reg);
          if (reg.game_id) setGameId(reg.game_id);
          if (reg.device_model) setDeviceModel(reg.device_model);
          if (reg.facebook_post_url) setFacebookPostUrl(reg.facebook_post_url);
        } else {
          setExistingReg(null);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [isOpen, selectedPlayerId, tournamentId]);

  if (!isOpen) return null;

  const activePlayers = (players && players.length > 0) ? players : internalPlayers;
  const isPlayerListLoading = (playersLoading && activePlayers.length === 0) || loadingInternal;

  const selectedPlayer = activePlayers.find(p => String(p.id) === String(selectedPlayerId));
  const isApproved = existingReg?.status === 'approved';
  const isRejected = existingReg?.status === 'rejected';
  const isPending = existingReg?.status === 'pending';

  const searchTerm = playerSearch.trim().toLowerCase();
  const filteredPlayers = searchTerm
    ? activePlayers.filter((p) => {
        const role = p.playerRoles?.[0]?.toLowerCase() ?? '';
        const jersey = p.jerseyNumber != null ? String(p.jerseyNumber) : '';
        return (
          p.name.toLowerCase().includes(searchTerm) ||
          role.includes(searchTerm) ||
          jersey.includes(searchTerm)
        );
      })
    : activePlayers;

  const handleSelectPlayer = (p: Player) => {
    setSelectedPlayerId(p.id);
    setIsPlayerMenuOpen(false);
    setPlayerSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedPlayerId) {
      setError('Please select your player profile.');
      return;
    }
    if (isApproved) {
      setError('This player is already an approved contender in this tournament.');
      return;
    }
    if (!gameId.trim()) {
      setError('Please enter your eFootball Game ID.');
      return;
    }
    if (!deviceModel.trim()) {
      setError('Please enter your device name / model.');
      return;
    }
    if (!facebookPostUrl.trim() || !facebookPostUrl.includes('facebook.com')) {
      setError('Please provide a valid Facebook post URL as proof.');
      return;
    }

    try {
      setSubmitting(true);

      // Attempt 1: Call RPC resubmit_tournament_registration if available
      let rpcSucceeded = false;
      try {
        const { error: rpcErr } = await supabase.rpc('resubmit_tournament_registration', {
          p_tournament_id: tournamentId,
          p_player_id: selectedPlayerId,
          p_game_id: gameId.trim(),
          p_device_model: deviceModel.trim(),
          p_facebook_post_url: facebookPostUrl.trim()
        });

        if (!rpcErr) {
          rpcSucceeded = true;
        } else if (rpcErr.message && !rpcErr.message.includes('function') && !rpcErr.message.includes('does not exist')) {
          throw rpcErr;
        }
      } catch (rpcCatch: any) {
        if (rpcCatch.message && !rpcCatch.message.includes('does not exist') && !rpcCatch.message.includes('42883')) {
          throw rpcCatch;
        }
      }

      // Attempt 2: If RPC didn't handle it, use direct table update or insert
      if (!rpcSucceeded) {
        if (existingReg?.id) {
          const { error: updateError } = await supabase
            .from('tournament_registrations')
            .update({
              game_id: gameId.trim(),
              device_model: deviceModel.trim(),
              facebook_post_url: facebookPostUrl.trim(),
              status: 'pending',
              rejection_reason: null,
              reviewed_at: null,
              reviewed_by: null,
              created_at: new Date().toISOString()
            })
            .eq('id', existingReg.id);

          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from('tournament_registrations')
            .insert({
              tournament_id: tournamentId,
              player_id: selectedPlayerId,
              game_id: gameId.trim(),
              device_model: deviceModel.trim(),
              facebook_post_url: facebookPostUrl.trim(),
              status: 'pending'
            });

          if (insertError) {
            if (insertError.code === '23505') {
              const { data: latest } = await supabase
                .from('tournament_registrations')
                .select('id, status')
                .eq('tournament_id', tournamentId)
                .eq('player_id', selectedPlayerId)
                .maybeSingle();

              if (latest?.status === 'approved') {
                throw new Error('This player is already an approved contender in this tournament.');
              }

              if (latest?.id) {
                const { error: retryUpdateErr } = await supabase
                  .from('tournament_registrations')
                  .update({
                    game_id: gameId.trim(),
                    device_model: deviceModel.trim(),
                    facebook_post_url: facebookPostUrl.trim(),
                    status: 'pending',
                    rejection_reason: null,
                    reviewed_at: null,
                    reviewed_by: null,
                    created_at: new Date().toISOString()
                  })
                  .eq('id', latest.id);

                if (retryUpdateErr) throw retryUpdateErr;
              } else {
                throw new Error('This player has already registered for this tournament.');
              }
            } else {
              throw insertError;
            }
          }
        }
      }

      setSuccess(true);
      if (onRegistrationSuccess) {
        onRegistrationSuccess();
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Failed to submit registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inApp = isInAppBrowser();

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-black/80 backdrop-blur-sm p-3 sm:p-6">
      <div className="min-h-full flex items-center justify-center py-3 sm:py-6">
        <div className="relative w-full max-w-4xl bg-[#09152b] border border-white/10 rounded-3xl shadow-2xl p-5 sm:p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {success ? (
            <div className="p-6 sm:p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Registration Submitted!</h3>
              <p className="text-white/70 max-w-md mb-6 text-sm leading-relaxed">
                Your application has been received. Our admin team will verify your Facebook post link. Once verified, you will be added to the tournament draw!
              </p>
              <button
                onClick={onClose}
                className="py-2.5 px-7 rounded-xl bg-[#c89850] text-[#00265a] font-black text-sm shadow hover:bg-[#b58641] transition"
              >
                Done
              </button>
            </div>
          ) : (
            <div>
              {/* In-App Browser Helper Tip */}
              {inApp && (
                <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="leading-snug">
                    <strong>Notice:</strong> Inside Facebook/Instagram browser? Tap <strong>•••</strong> and select <strong>Open in External Browser</strong> for seamless downloads. You can also tap and hold your card image to save directly to Photos!
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Form & Steps */}
                <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c89850]/15 border border-[#c89850]/30 text-[#c89850] text-xs font-bold uppercase tracking-wider mb-3">
                    <Share2 className="w-3.5 h-3.5" />
                    Registration Flow
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight mb-1">
                    Tournament Registration
                  </h2>
                  <p className="text-white/60 text-xs mb-6">
                    Select your profile, customize your official player card, post it on Facebook, and paste the link below!
                  </p>

                  {error && (
                    <div className="p-3 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  
                  {/* Registration Status Banners */}
                  {checkingReg && (
                    <div className="p-2.5 mb-4 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c89850]" />
                      <span>Checking registration history...</span>
                    </div>
                  )}

                  {isApproved && (
                    <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                      <div>
                        <p className="font-bold">Already Approved Contender!</p>
                        <p className="text-[11px] text-emerald-400/80">
                          This player has already been verified and included in this tournament.
                        </p>
                      </div>
                    </div>
                  )}

                  {isRejected && (
                    <div className="p-3.5 mb-4 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-200 text-xs">
                      <div className="flex items-center gap-2 font-bold text-amber-300 mb-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                        <span>Previous Application Rejected</span>
                      </div>
                      <p className="text-white/80 text-[11px] leading-relaxed">
                        Your previous registration was rejected. Please review or correct your Facebook link, Game ID, or device model below and re-submit!
                      </p>
                      <div className="mt-2 p-2 rounded-lg bg-black/40 border border-amber-500/20 text-[11px] text-amber-100">
                        <span className="font-bold text-amber-300">Admin Note:</span> {existingReg?.rejection_reason || 'Facebook post proof URL or Game ID not properly verified. Please check your submission and re-submit.'}
                      </div>
                    </div>
                  )}

                  {isPending && (
                    <div className="p-3 mb-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-blue-400" />
                      <div>
                        <p className="font-bold text-blue-300">Application Pending Review</p>
                        <p className="text-[11px] text-white/70">
                          Your registration is currently awaiting admin verification. You can make corrections below and update your application.
                        </p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Select Player Profile */}
                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-1.5">
                        Select Player Profile *
                      </label>

                      {/* Display Selected Player Card clearly on Mobile & Desktop */}
                      {selectedPlayer && !isPlayerMenuOpen ? (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-[#c89850]/40 shadow-inner">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 border border-[#c89850]/50 flex items-center justify-center flex-shrink-0">
                              {selectedPlayer.profileImageUrl || selectedPlayer.coverImageUrl ? (
                                <img
                                  src={selectedPlayer.profileImageUrl || selectedPlayer.coverImageUrl}
                                  alt={selectedPlayer.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-bold text-[#c89850]">
                                  {selectedPlayer.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm truncate">
                                  {selectedPlayer.name}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  <Check className="w-2.5 h-2.5" /> Selected
                                </span>
                              </div>
                              <div className="text-[11px] text-white/50 truncate">
                                {selectedPlayer.playerRoles?.[0] || 'Player'}
                                {selectedPlayer.jerseyNumber != null ? ` • #${selectedPlayer.jerseyNumber}` : ''}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsPlayerMenuOpen(true);
                              setPlayerSearch('');
                              setTimeout(() => searchInputRef.current?.focus(), 50);
                            }}
                            className="ml-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 hover:text-white text-xs font-bold transition flex-shrink-0 active:scale-95"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <div ref={playerMenuRef} className="relative">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                            <input
                              ref={searchInputRef}
                              type="text"
                              value={playerSearch}
                              onChange={(e) => {
                                setPlayerSearch(e.target.value);
                                setIsPlayerMenuOpen(true);
                              }}
                              onFocus={() => {
                                setIsPlayerMenuOpen(true);
                                setTimeout(() => {
                                  searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 120);
                              }}
                              placeholder={selectedPlayer ? `Selected: ${selectedPlayer.name} (type to search...)` : 'Search your name...'}
                              className="w-full py-2.5 pl-9 pr-9 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#c89850] transition"
                            />
                            {playerSearch ? (
                              <button
                                type="button"
                                onClick={() => setPlayerSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-white/40 hover:text-white transition"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <ChevronDown
                                className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none transition-transform ${isPlayerMenuOpen ? 'rotate-180' : ''}`}
                              />
                            )}
                          </div>

                          {isPlayerMenuOpen && (
                            <div className="absolute z-30 mt-1.5 w-full max-h-56 overflow-y-auto rounded-xl bg-[#0b1d3a] border border-white/15 shadow-2xl">
                              {filteredPlayers.length === 0 ? (
                                <div className="px-4 py-3 text-xs text-white/50">
                                  {isPlayerListLoading ? 'Loading players…' : 'No players found.'}
                                </div>
                              ) : (
                                filteredPlayers.map((p) => {
                                  const isSelected = String(p.id) === String(selectedPlayerId);
                                  return (
                                    <div
                                      key={p.id}
                                      role="button"
                                      tabIndex={0}
                                      onPointerDown={(e) => {
                                        e.preventDefault();
                                        handleSelectPlayer(p);
                                      }}
                                      onClick={() => handleSelectPlayer(p)}
                                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition cursor-pointer select-none active:bg-[#c89850]/25 ${
                                        isSelected ? 'bg-[#c89850]/20' : 'hover:bg-white/5'
                                      }`}
                                    >
                                      <div className="w-7 h-7 rounded-full overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
                                        {p.profileImageUrl || p.coverImageUrl ? (
                                          <img
                                            src={p.profileImageUrl || p.coverImageUrl}
                                            alt={p.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <span className="text-[11px] font-bold text-white/60">
                                            {p.name.charAt(0).toUpperCase()}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex flex-col min-w-0 flex-1">
                                        <span className="text-sm font-semibold text-white truncate">{p.name}</span>
                                        {(p.playerRoles?.[0] || p.jerseyNumber != null) && (
                                          <span className="text-[10px] text-white/45 truncate">
                                            {p.playerRoles?.[0] ?? 'Player'}
                                            {p.jerseyNumber != null ? ` • #${p.jerseyNumber}` : ''}
                                          </span>
                                        )}
                                      </div>
                                      {isSelected && <Check className="w-4 h-4 text-[#c89850] flex-shrink-0" />}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Game ID & Device in 2 cols */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-white/80 mb-1.5">
                          eFootball Game ID *
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your Game ID"
                          value={gameId}
                          onChange={(e) => setGameId(e.target.value)}
                          disabled={isApproved}
                          required
                          className="w-full py-2.5 px-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#c89850] transition font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/80 mb-1.5">
                          Device Model *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. iPhone 15 Pro / Poco X3"
                          value={deviceModel}
                          onChange={(e) => setDeviceModel(e.target.value)}
                          disabled={isApproved}
                          required
                          className="w-full py-2.5 px-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#c89850] transition"
                        />
                      </div>
                    </div>

                    {/* Facebook Post URL */}
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-white/80 mb-1.5">
                        Facebook Post Proof URL *
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.facebook.com/your-post-url"
                        value={facebookPostUrl}
                        onChange={(e) => setFacebookPostUrl(e.target.value)}
                        disabled={isApproved}
                        required
                        className="w-full py-2.5 px-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#c89850] transition"
                      />
                      <p className="text-[11px] text-white/45 mt-1">
                        Download your customized card from below, share it on Facebook, and paste your post link here.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || isApproved || checkingReg}
                      className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#c89850] hover:bg-[#b58641] text-[#00265a] font-black text-sm tracking-wide shadow-lg transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : isApproved ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#00265a]" />
                          <span>Already Registered & Approved</span>
                        </>
                      ) : isRejected ? (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          <span>Re-Submit Corrected Registration</span>
                        </>
                      ) : isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          <span>Update Registration Details</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Registration</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Live Card Generator Preview */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center bg-black/30 p-4 sm:p-6 rounded-2xl border border-white/5">
                <div className="text-center mb-3">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#c89850]">
                    Live Card Preview
                  </span>
                </div>

                <TournamentPlayerCard
                  playerName={selectedPlayer ? selectedPlayer.name : 'YOUR NAME'}
                  playerImageUrl={selectedPlayer?.coverImageUrl || selectedPlayer?.profileImageUrl}
                  gameId={gameId || 'YOUR_GAME_ID'}
                  deviceModel={deviceModel || 'YOUR DEVICE'}
                  tournamentTitle={tournamentTitle}
                  seasonName={seasonName}
                />
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
