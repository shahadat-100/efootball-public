import { Match, MatchResult } from './types';

export function isClubTeam(name?: string | null): boolean {
  if (!name) return false;
  const n = name.toLowerCase();
  return n.includes('elite') || n.includes('enigmatic');
}

export function getClubResult(match: Match, matchResultsMap?: Map<string, string>): MatchResult | undefined {
  if (match.status !== 'upcoming' && match.homeScore != null && match.awayScore != null) {
    const clubIsHome = isClubTeam(match.homeTeam);
    const clubIsAway = isClubTeam(match.awayTeam);
    if (clubIsHome) {
      if (match.homeScore > match.awayScore) return 'win';
      if (match.homeScore < match.awayScore) return 'loss';
      return 'draw';
    }
    if (clubIsAway) {
      if (match.awayScore > match.homeScore) return 'win';
      if (match.awayScore < match.homeScore) return 'loss';
      return 'draw';
    }
    // Default fallback assuming home team is the club
    if (match.homeScore > match.awayScore) return 'win';
    if (match.homeScore < match.awayScore) return 'loss';
    return 'draw';
  }
  const stored = matchResultsMap?.get(match.id);
  if (stored === 'win' || stored === 'draw' || stored === 'loss') return stored;
  return undefined;
}
