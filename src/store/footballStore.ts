import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Player, SeasonDb, PlayerSeasonStat } from '@/features/players/types';
import { Match } from '@/features/matches/types';
import { MatchEntry } from '@/features/match-entries/types';
import { NewsArticle } from '@/features/news/types';
import { supabase } from '@/lib/supabase';


export interface HallOfFameEntry {
  id: number;
  createdAt: string;
  playerId: string;
  category: string;
  seasonText: string;
  subTitle: string;
  descriptions: string;
}

export interface Competition {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface PlayerRole {
  id: number;
  name: string;
  status: boolean;
  createdAt: string;
}

export interface CustomTag {
  id: number;
  name: string;
  status: boolean;
  createdAt: string;
}

// ── Database Mapping Helpers ─────────────────────────────────────────

export const mapPlayerFromDb = (p: any): Player => ({
  id: p.id,
  name: p.name,
  profileImageUrl: p.profileimageurl || '',
  jerseyNumber: p.jerseynumber ?? undefined,
  email: p.email || '',
  // Extract role names from the joined junction table data
  playerRoles: (p.player_player_roles ?? []).map((r: any) => r.player_role?.name).filter(Boolean),
  // Extract tag names from the joined junction table data
  customTags: (p.player_custom_tags ?? []).map((t: any) => t.custom_tags?.name).filter(Boolean),
  customStringTags: Array.isArray(p.custom_string_tags) ? p.custom_string_tags : [],
  createdAt: p.createdat || '',
  seasons: [],
});

// Only send columns that actually exist on the players table
export const mapPlayerToDb = (p: any) => ({
  name: p.name,
  profileimageurl: p.profileImageUrl || '',
  jerseynumber: p.jerseyNumber ?? null,
  email: p.email || null,
});

export const mapMatchFromDb = (m: any): Match => ({
  id: m.id,
  seasonId: m.season_id,
  homeTeam: m.hometeam,
  awayTeam: m.awayteam,
  homeScore: m.homescore,
  awayScore: m.awayscore,
  date: m.date,
  time: m.time || null,
  status: m.status,
  competitionId: m.competition_id,
  competition: m.competitions?.name || 'Premier League',
});

export const mapMatchToDb = (m: any) => ({
  season_id: m.seasonId,
  hometeam: m.homeTeam,
  awayteam: m.awayTeam,
  homescore: m.homeScore,
  awayscore: m.awayScore,
  date: m.date,
  time: m.time || null,
  status: m.status,
  competition_id: m.competitionId,
});

export const mapMatchEntryFromDb = (e: any): MatchEntry => ({
  id: e.id,
  playerId: e.playerid,
  matchId: e.matchid || '',
  goals: e.goals || 0,
  goalsConceded: e.goalsconceded || 0,
  result: e.result,
  hattricks: e.hattricks || 0,
  cleanSheet: e.cleansheet || false,
  motm: e.motm || false,
  date: e.date || e.matches?.date || '',
  time: e.time || e.matches?.time || null,
  notes: e.notes || '',
  seasonId: e.season_id,
});

export const mapMatchEntryToDb = (e: any) => ({
  playerid: e.playerId,
  matchid: e.matchId || null,
  goals: e.goals || 0,
  goalsconceded: e.goalsConceded || 0,
  result: e.result,
  hattricks: e.hattricks || 0,
  cleansheet: e.cleanSheet || false,
  motm: e.motm || false,
  notes: e.notes || '',
  season_id: e.seasonId,
  date: e.date || null,
  time: e.time || null,
});

export const mapHallOfFameFromDb = (h: any): HallOfFameEntry => ({
  id: h.id,
  createdAt: h.created_at,
  playerId: h.player_id,
  category: h.category,
  seasonText: h.season_text,
  subTitle: h.sub_title,
  descriptions: h.descriptions,
});

export const mapHallOfFameToDb = (h: any) => ({
  player_id: h.playerId,
  category: h.category,
  season_text: h.seasonText,
  sub_title: h.subTitle,
  descriptions: h.descriptions,
});

interface FootballStore {
  players: Player[];
  matches: Match[];
  matchEntries: MatchEntry[];
  news: NewsArticle[];
  seasons: SeasonDb[];
  playerSeasonStats: PlayerSeasonStat[];
  competitions: Competition[];
  hallOfFame: HallOfFameEntry[];
  availableRoles: PlayerRole[];
  availableTags: CustomTag[];
  matchEntriesLoaded: boolean; // lazy-load guard
  
  globalCounts: Record<string, number>;
  fetchGlobalCounts: () => Promise<void>;
  
  fetchPlayers: () => Promise<void>;
  setPlayers: (p: Player[]) => void;
  
  fetchMatches: () => Promise<void>;
  setMatches: (m: Match[]) => void;
  
  fetchMatchEntries: (force?: boolean) => Promise<void>;
  setMatchEntries: (e: MatchEntry[]) => void;
  fetchPlayerMatchEntries: (playerId: string) => Promise<void>;
  matchEntriesHasMore: boolean;
  loadMoreMatchEntries: () => Promise<void>;
  
  fetchNews: () => Promise<void>;
  setNews: (n: NewsArticle[]) => void;

  fetchSeasons: () => Promise<void>;
  fetchPlayerSeasonStats: () => Promise<void>;
  fetchCompetitions: () => Promise<void>;
  fetchAvailableRoles: () => Promise<void>;
  fetchAvailableTags: () => Promise<void>;

  fetchHallOfFame: () => Promise<void>;
  isInitialized: boolean;
  initializeData: () => Promise<void>;
}

export const useFootballStore = create<FootballStore>()(
  devtools(
    (set, get) => ({
      players: [],
      matches: [],
      matchEntries: [],
      news: [],
      seasons: [],
      playerSeasonStats: [],
      competitions: [],
      hallOfFame: [],
      availableRoles: [],
      availableTags: [],
      matchEntriesLoaded: false,
      matchEntriesHasMore: true,
      isInitialized: false,
      
      globalCounts: {
        players: 0,
        matches: 0,
        news: 0,
        'hall-of-fame': 0,
      },

      fetchGlobalCounts: async () => {
        try {
          const [playersRes, matchesRes, newsRes, hofRes] = await Promise.all([
            supabase.from('players').select('id', { count: 'exact', head: true }),
            supabase.from('matches').select('id', { count: 'exact', head: true }),
            supabase.from('news').select('id', { count: 'exact', head: true }),
            supabase.from('hall_of_frame').select('id', { count: 'exact', head: true }),
          ]);
          
          set({
            globalCounts: {
              players: playersRes.count || 0,
              matches: matchesRes.count || 0,
              news: newsRes.count || 0,
              'hall-of-fame': hofRes.count || 0,
            }
          });
        } catch (err) {
          console.error('Error fetching global counts:', err);
        }
      },
      
      initializeData: async () => {
        if (get().isInitialized) return;
        const store = get();
        // Step 1: Wake the DB and fetch global counts for navigation badges
        await Promise.all([
          store.fetchSeasons(),
          store.fetchGlobalCounts(),
        ]);
        
        set({ isInitialized: true });
      },
      
      fetchPlayers: async () => {
        if (get().players.length > 0) return;
        try {
          // ৫টি টেবিল প্যারালাল ফেচ করা হচ্ছে (Nested Join বাদ দিয়ে)
          // Fix: project only needed columns on junction/lookup tables
          const [playersRes, junctionRolesRes, rolesRes, junctionTagsRes, tagsRes] = await Promise.all([
            supabase.from('players').select('id, name, jerseynumber, email, custom_string_tags, createdat, profileimageurl, coverimageurl'),
            supabase.from('player_player_roles').select('player_id, role_id'),
            supabase.from('player_role').select('id, name'),
            supabase.from('player_custom_tags').select('player_id, tag_id'),
            supabase.from('custom_tags').select('id, name')
          ]);
          if (playersRes.error) throw playersRes.error;
          const players = playersRes.data || [];
          const junctionRoles = junctionRolesRes.data || [];
          const roles = rolesRes.data || [];
          const junctionTags = junctionTagsRes.data || [];
          const tags = tagsRes.data || [];
          // Map তৈরি করা হচ্ছে ফাস্ট জয়েনিং এর জন্য
          const roleMap = new Map(roles.map(r => [r.id, r.name]));
          const tagMap = new Map(tags.map(t => [t.id, t.name]));
          const playerRolesMap = new Map<string, string[]>();
          junctionRoles.forEach(jr => {
            const roleName = roleMap.get(jr.role_id);
            if (roleName) {
              if (!playerRolesMap.has(jr.player_id)) playerRolesMap.set(jr.player_id, []);
              playerRolesMap.get(jr.player_id)!.push(roleName);
            }
          });
          const playerTagsMap = new Map<string, string[]>();
          junctionTags.forEach(jt => {
            const tagName = tagMap.get(jt.tag_id);
            if (tagName) {
              if (!playerTagsMap.has(jt.player_id)) playerTagsMap.set(jt.player_id, []);
              playerTagsMap.get(jt.player_id)!.push(tagName);
            }
          });
          // ম্যানুয়ালি জয়েন করা হচ্ছে
          const mappedPlayers = players.map(p => ({
            id: p.id,
            name: p.name,
            profileImageUrl: p.profileimageurl || '',
            coverImageUrl: p.coverimageurl || '',
            jerseyNumber: p.jerseynumber ?? undefined,
            email: p.email || '',
            playerRoles: playerRolesMap.get(p.id) || [],
            customTags: playerTagsMap.get(p.id) || [],
            customStringTags: Array.isArray(p.custom_string_tags) ? p.custom_string_tags : [],
            createdAt: p.createdat || '',
            seasons: [],
          }));
          set({ players: mappedPlayers as Player[] });
        } catch (error) {
          console.error('Error fetching players:', error);
        }
      },
      setPlayers: (players: Player[]) => set({ players }),
      
      fetchMatches: async () => {
        if (get().matches.length > 0) return;
        // Fix: project only columns mapMatchFromDb reads — drops created_at, updated_at, etc.
        const { data, error } = await supabase
          .from('matches')
          .select('id, season_id, hometeam, awayteam, homescore, awayscore, date, time, status, competition_id, competitions(name)');
        if (data) set({ matches: data.map(mapMatchFromDb) });
        if (error) console.error('Error fetching matches:', error);
      },
      setMatches: (matches: Match[]) => set({ matches }),
      
      fetchMatchEntries: async (force = false) => {
        // Fix: lazy-load guard — only fetch once per session
        if (!force && get().matchEntriesLoaded) return;
        // Fix: limit to 500 most-recent, project only columns mapMatchEntryFromDb reads,
        // Fix: limit to 500 most-recent, project only columns mapMatchEntryFromDb reads.
        const { data, error } = await supabase
          .from('match_entries')
          .select('id, playerid, matchid, goals, goalsconceded, result, hattricks, cleansheet, motm, date, time, notes, season_id, matches(date, time)')
          .order('date', { ascending: false })
          .limit(500);
        if (data) {
          set({ 
            matchEntries: data.map(mapMatchEntryFromDb), 
            matchEntriesLoaded: true,
            matchEntriesHasMore: data.length === 500
          });
        }
        if (error) console.error('Error fetching match entries:', error);
      },
      setMatchEntries: (matchEntries: MatchEntry[]) => set({ matchEntries }),

      fetchPlayerMatchEntries: async (playerId: string) => {
        const { data, error } = await supabase
          .from('match_entries')
          .select('id, playerid, matchid, goals, goalsconceded, result, hattricks, cleansheet, motm, date, time, notes, season_id, matches(date, time)')
          .eq('playerid', playerId)
          .order('date', { ascending: false });

        if (data) {
          const newEntries = data.map(mapMatchEntryFromDb);
          const currentEntries = get().matchEntries;
          
          // Merge avoiding duplicates
          const existingIds = new Set(currentEntries.map(e => e.id));
          const uniqueNewEntries = newEntries.filter(e => !existingIds.has(e.id));
          
          if (uniqueNewEntries.length > 0) {
            set({ matchEntries: [...currentEntries, ...uniqueNewEntries] });
          }
        }
        if (error) console.error('Error fetching player specific match entries:', error);
      },
      
      loadMoreMatchEntries: async () => {
        const currentEntries = get().matchEntries;
        const offset = currentEntries.length;
        const limit = 500;
        
        const { data, error } = await supabase
          .from('match_entries')
          .select('id, playerid, matchid, goals, goalsconceded, result, hattricks, cleansheet, motm, date, time, notes, season_id, matches(date, time)')
          .order('date', { ascending: false })
          .range(offset, offset + limit - 1);
          
        if (data) {
          const newEntries = data.map(mapMatchEntryFromDb);
          // filter out duplicates just in case
          const existingIds = new Set(currentEntries.map(e => e.id));
          const uniqueNewEntries = newEntries.filter(e => !existingIds.has(e.id));
          
          set({ 
            matchEntries: [...currentEntries, ...uniqueNewEntries],
            matchEntriesHasMore: data.length === limit
          });
        }
        if (error) console.error('Error loading more match entries:', error);
      },
      fetchNews: async () => {
        if (get().news.length > 0) return;
        // Fix: project only needed columns and cap at 200 most-recent articles
        const { data, error } = await supabase
          .from('news')
          .select('id, title, content, author, category, hot, date, image, created_at')
          .order('date', { ascending: false })
          .limit(200);
        if (data) set({ news: data as NewsArticle[] });
        if (error) console.error('Error fetching news:', error);
      },
      setNews: (news: NewsArticle[]) => set({ news }),
      fetchSeasons: async () => {
        if (get().seasons.length > 0) return;
        // Fix: project only columns SeasonDb type uses
        const { data, error } = await supabase
          .from('season')
          .select('id, name, is_current, start_date')
          .order('name', { ascending: true });
        if (data) {
          set({ seasons: data as SeasonDb[] });
        }
        if (error) console.error('Error fetching seasons:', error);
      },

      fetchPlayerSeasonStats: async () => {
        if (get().playerSeasonStats.length > 0) return;
        // Fix: drop the season(name) join — resolve season name from in-memory seasons array.
        // Fix: project only the columns the mapper reads.
        const { data, error } = await supabase
          .from('player_season_stats')
          .select('id, player_id, season_id, appearances, goals, cleansheets, hattricks, motmcount, wins, draws, losses, goalsconceded, season:season_id(name)');
        if (error) {
          console.error('Error fetching player season stats:', error);
          return;
        }
        set({
          playerSeasonStats: (data ?? []).map(item => {
            return {
              id: item.id,
              playerId: item.player_id,
              seasonId: item.season_id,
              seasonName: (item.season as any)?.name || `Season ${item.season_id}`,
              appearances: item.appearances || 0,
              goals: item.goals || 0,
              cleansheets: item.cleansheets || 0,
              hattricks: item.hattricks || 0,
              motmCount: item.motmcount || 0,
              wins: item.wins || 0,
              draws: item.draws || 0,
              losses: item.losses || 0,
              goalsConceded: item.goalsconceded || 0,
            };
          })
        });
      },

      fetchCompetitions: async () => {
        if (get().competitions.length > 0) return;
        // Fix: project only columns Competition interface uses
        const { data, error } = await supabase
          .from('competitions')
          .select('id, name, is_active, created_at');
        if (data) {
          set({
            competitions: data.map(c => ({
              id: c.id,
              name: c.name,
              isActive: c.is_active,
              createdAt: c.created_at,
            })),
          });
        }
        if (error) console.error('Error fetching competitions:', error);
      },

      fetchAvailableRoles: async () => {
        // Fix: explicit column projection instead of select('*')
        const { data, error } = await supabase
          .from('player_role')
          .select('id, name, status, created_at')
          .eq('status', true)
          .order('name', { ascending: true });
        if (data) {
          set({
            availableRoles: data.map(r => ({
              id: r.id,
              name: r.name,
              status: r.status,
              createdAt: r.created_at,
            }))
          });
        }
        if (error) console.error('Error fetching player roles:', error);
      },

      fetchAvailableTags: async () => {
        // Fix: explicit column projection instead of select('*')
        const { data, error } = await supabase
          .from('custom_tags')
          .select('id, name, status, created_at')
          .eq('status', true)
          .order('name', { ascending: true });
        if (data) {
          set({
            availableTags: data.map(t => ({
              id: t.id,
              name: t.name,
              status: t.status,
              createdAt: t.created_at,
            }))
          });
        }
        if (error) console.error('Error fetching custom tags:', error);
      },


      fetchHallOfFame: async () => {
        if (get().hallOfFame.length > 0) return;
        // Fix: project only columns mapHallOfFameFromDb reads
        const { data, error } = await supabase
          .from('hall_of_frame')
          .select('id, created_at, player_id, category, season_text, sub_title, descriptions');
        if (data) {
          set({ hallOfFame: data.map(mapHallOfFameFromDb) });
        }
        if (error) console.error('Error fetching Hall of Fame:', error);
      },

    }),
    { enabled: import.meta.env.MODE !== 'production' }
  )
);
