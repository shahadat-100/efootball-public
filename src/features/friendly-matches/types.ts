export interface FriendlyMatch {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Goals: number;
  player2Goals: number;
  date: string;
  time?: string | null;
  notes?: string | null;
  createdAt?: string | null;
}

export interface FriendlyPlayerStat {
  playerId: string;
  playerName: string;
  profileImageUrl: string;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  winRate: number;
}
