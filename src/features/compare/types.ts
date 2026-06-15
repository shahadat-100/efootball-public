export interface ComputedPlayerStats {
  id: string;
  name: string;
  team: string;
  jerseyNumber: number;
  rank: number;
  imageUrl: string;
  short: string;
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  goals: number; // or gf
  ga: number; // goals against
  cleansheets: number;
  motm: number;
  hattricks: number;
  pts: number;
}
