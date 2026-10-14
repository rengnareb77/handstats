"use server";

import { revalidatePath, updateTag } from "next/cache";
import { parserService } from "@/lib/services/parser.services";
import { teamService } from "@/lib/services/team.services";
import { matchService } from "@/lib/services/match.services";
import { Match, MatchEvent } from "@/types/match.types";
import { ApiError } from "@/lib/api/errors";
import { ActionResult } from "./types";

/**
 * Server Action pour importer et créer un match depuis un fichier PDF ou URL.
 * Parse le PDF, lie le match à l'équipe, met à jour les stats des joueurs,
 * et revalide automatiquement le cache de l'équipe.
 */
export async function addMatchAction(
  teamId: string,
  formData: FormData,
  isHome: boolean
): Promise<ActionResult<Match>> {
  try {
    const parsedMatch = await parserService.parseMatchPDF(formData);
    const match = { ...parsedMatch, isHome };

    await teamService.addMatchToTeam(teamId, match);

    const players = isHome ? match.homeTeamPlayers : match.awayTeamPlayers;
    if (players && players.length > 0) {
      await matchService.addAllPlayersStats(players, teamId, match.codeRencontre);
    }

    updateTag(`team-${teamId}`);
    updateTag(`team-${teamId}-matches`);
    revalidatePath(`/equipe/${teamId}`);

    return { success: true, data: match };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        fieldErrors: error.fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inattendue lors de l'ajout du match",
    };
  }
}

/**
 * Server Action pour ajouter un événement à un match existant.
 */
export async function addMatchEventAction(
  matchId: string,
  teamId: string,
  event: MatchEvent
): Promise<ActionResult<Match>> {
  try {
    const updatedMatch = await matchService.addEventToMatch(matchId, event);
    updateTag(`match-${matchId}`);
    revalidatePath(`/equipe/${teamId}/matchs/${matchId}`);
    return { success: true, data: updatedMatch };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        fieldErrors: error.fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'ajout de l'événement",
    };
  }
}

/**
 * Server Action pour modifier un événement d'un match.
 */
export async function updateMatchEventAction(
  matchId: string,
  teamId: string,
  oldEvent: MatchEvent,
  newEvent: MatchEvent
): Promise<ActionResult<Match>> {
  try {
    const updatedMatch = await matchService.updateEventToMatch(matchId, { oldEvent, newEvent });
    updateTag(`match-${matchId}`);
    revalidatePath(`/equipe/${teamId}/matchs/${matchId}`);
    return { success: true, data: updatedMatch };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        fieldErrors: error.fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la modification de l'événement",
    };
  }
}

/**
 * Server Action pour supprimer un événement d'un match.
 */
export async function deleteMatchEventAction(
  matchId: string,
  teamId: string,
  eventId: string
): Promise<ActionResult<Match>> {
  try {
    const updatedMatch = await matchService.deleteEventFromMatch(matchId, eventId);
    updateTag(`match-${matchId}`);
    revalidatePath(`/equipe/${teamId}/matchs/${matchId}`);
    return { success: true, data: updatedMatch };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        fieldErrors: error.fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la suppression de l'événement",
    };
  }
}
