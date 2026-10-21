"use server";

import { revalidatePath, updateTag } from "next/cache";
import { teamService } from "@/lib/services/team.services";
import { Team } from "@/types/team.types";
import { ApiError } from "@/lib/api/errors";
import { ActionResult } from "./types";

export interface CreateTeamInput {
  name: string;
  championship?: string;
}

/**
 * Server Action pour créer une nouvelle équipe.
 * Revalide automatiquement le cache et la page d'accueil.
 */
export async function createTeamAction(
  input: CreateTeamInput
): Promise<ActionResult<Team>> {
  const name = input.name?.trim();
  const championship = input.championship?.trim() || "";

  if (!name) {
    return {
      success: false,
      error: "Le nom de l'équipe est obligatoire.",
      fieldErrors: { name: "Le nom de l'équipe est obligatoire." },
    };
  }

  try {
    const newTeam = await teamService.create({ name, championship });
    updateTag("teams");
    revalidatePath("/");
    return { success: true, data: newTeam };
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
      error: error instanceof Error ? error.message : "Erreur inattendue lors de la création de l'équipe",
    };
  }
}
