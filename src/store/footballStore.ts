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
  time: e.time || null,
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
  
  fetchPlayers: () => Promise<void>;
  setPlayers: (p: Player[]) => void;
  
  fetchMatches: () => Promise<void>;
  setMatches: (m: Match[]) => void;
  
  fetchMatchEntries: () => Promise<void>;
  setMatchEntries: (e: MatchEntry[]) => void;
  
  fetchNews: () => Promise<void>;
  setNews: (n: NewsArticle[]) => void;

  fetchSeasons: () => Promise<void>;
  fetchPlayerSeasonStats: () => Promise<void>;
  fetchCompetitions: () => Promise<void>;
  fetchAvailableRoles: () => Promise<void>;
  fetchAvailableTags: () => Promise<void>;

  fetchHallOfFame: () => Promise<void>;
}

export const useFootballStore = create<FootballStore>()(
  devtools(
    (set) => ({
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
      
      fetchPlayers: async () => {
        const { data, error } = await supabase
          .from('players')
          .select(`
            *,
            player_player_roles(
              role_id,
              player_role(name)
            ),
            player_custom_tags(
              tag_id,
              custom_tags(name)
            )
          `);
        if (data) {
          set({ players: data.map(mapPlayerFromDb) });
        }
        if (error) console.error('Error fetching players:', error);
      },
      setPlayers: (players) => set({ players }),
      
      fetchMatches: async () => {
        const { data, error } = await supabase.from('matches').select('*, competitions(name)');
        if (data) {
          set({ matches: data.map(mapMatchFromDb) });
        }
        if (error) console.error('Error fetching matches:', error);
      },
      setMatches: (matches) => set({ matches }),
      
      fetchMatchEntries: async () => {
        const { data, error } = await supabase.from('match_entries').select('*, matches(date)');
        if (data) {
          set({ matchEntries: data.map(mapMatchEntryFromDb) });
        }
        if (error) console.error('Error fetching match entries:', error);
      },
      setMatchEntries: (matchEntries) => set({ matchEntries }),
      fetchNews: async () => {
        const { data, error } = await supabase.from('news').select('*');
        if (data) set({ news: data as NewsArticle[] });
        if (error) console.error('Error fetching news:', error);
      },
      setNews: (news) => set({ news }),
      fetchSeasons: async () => {
        const { data, error } = await supabase.from('season').select('*').order('name', { ascending: true });
        if (data) {
          set({ seasons: data as SeasonDb[] });

          // Defensive initialization: If no seasons exist, create a default current season
          if (data.length === 0) {
            const defaultSeasonName = 'Season 1';
            const { data: newSeason } = await supabase
              .from('season')
              .insert({
                name: defaultSeasonName,
                is_current: true,
                start_date: new Date().toISOString()
              })
              .select()
              .single();
            if (newSeason) {
              set({ seasons: [newSeason as SeasonDb] });
            }
          }
        }
        if (error) console.error('Error fetching seasons:', error);
      },

      fetchPlayerSeasonStats: async () => {
        const { data, error } = await supabase.from('player_season_stats').select('*, season(name)');
        if (data) {
          set({
            playerSeasonStats: data.map(item => ({
              id: item.id,
              playerId: item.player_id,
              seasonId: item.season_id,
              seasonName: item.season?.name || `Season ${item.season_id}`,
              appearances: item.appearances || 0,
              goals: item.goals || 0,
              cleansheets: item.cleansheets || 0,
              hattricks: item.hattricks || 0,
              motmCount: item.motmcount || 0,
              wins: item.wins || 0,
              draws: item.draws || 0,
              losses: item.losses || 0,
              goalsConceded: item.goalsconceded || 0,
            }))
          });
        }
        if (error) console.error('Error fetching player season stats:', error);
      },

      fetchCompetitions: async () => {
        const { data, error } = await supabase.from('competitions').select('*');
        if (data) {
          set({ competitions: data as Competition[] });
        }
        if (error) console.error('Error fetching competitions:', error);
      },

      fetchAvailableRoles: async () => {
        const { data, error } = await supabase
          .from('player_role')
          .select('*')
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
        const { data, error } = await supabase
          .from('custom_tags')
          .select('*')
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
        const { data, error } = await supabase.from('hall_of_frame').select('*');
        if (data) {
          set({ hallOfFame: data.map(mapHallOfFameFromDb) });
        }
        if (error) console.error('Error fetching Hall of Fame:', error);
      },

    }),
    { enabled: process.env.NODE_ENV !== 'production' }
  )
);
