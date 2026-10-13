import { Player } from "@/types/player.types";
import { Match } from "@/types/match.types";

/**
 * Extrait les matchs auxquels un joueur a effectivement participé.
 * Utilise player.matchs si déjà renseigné, sinon cherche dans les matchs de l'équipe
 * si le joueur est présent dans homeTeamPlayers ou awayTeamPlayers.
 */
export function calculatePlayerMatches(player: Player, teamMatches: Match[] = []): Match[] {
  if (player.matchs && player.matchs.length > 0) {
    return player.matchs;
  }

  const license = player.licenseNumber;
  if (!license) return [];

  return teamMatches.filter(
    (m) =>
      m.homeTeamPlayers?.some((p) => p.licenseNumber === license) ||
      m.awayTeamPlayers?.some((p) => p.licenseNumber === license)
  );
}

export interface ComputedPlayerStats {
  playerMatches: Match[];
  matchesPlayed: number;
  totalGoals: number;
  totalShots: number;
  totalSaves: number;
  goalsPerMatch: number;
  savesPerMatch: number;
  isGoalkeeper: boolean;
  precision: number | null;
}

/**
 * Calcule de manière robuste et unifiée les statistiques individuelles d'un joueur.
 */
export function calculatePlayerStats(player: Player, teamMatches: Match[] = []): ComputedPlayerStats {
  const playerMatches = calculatePlayerMatches(player, teamMatches);
  const matchesPlayed = playerMatches.length;

  const totalGoals = player.stats.goal;
  const totalShots = Math.max(player.stats.shot, totalGoals);
  const totalSaves = player.stats.save;

  const goalsPerMatch = matchesPlayed > 0 ? totalGoals / matchesPlayed : 0;
  const savesPerMatch = matchesPlayed > 0 ? totalSaves / matchesPlayed : 0;

  const isGoalkeeper = totalSaves > 0 && totalGoals === 0;
  const precision = totalShots > 0 ? Math.round((totalGoals / totalShots) * 100) : null;

  return {
    playerMatches,
    matchesPlayed,
    totalGoals,
    totalShots,
    totalSaves,
    goalsPerMatch,
    savesPerMatch,
    isGoalkeeper,
    precision,
  };
}
