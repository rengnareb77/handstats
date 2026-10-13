import { Team } from "@/types/team.types";
import { Match } from "@/types/match.types";
import { apiClient, type ApiFetchOptions } from "../api";

export const teamService = {
  getAll: (options?: ApiFetchOptions) => {
    return apiClient.get<Team[]>("/teams", {
      next: { tags: ["teams"] },
      ...options,
    });
  },

  getTeamById: (id: string, options?: ApiFetchOptions) => {
    return apiClient.get<Team>(`/teams/${id}`, {
      next: { tags: [`team-${id}`] },
      ...options,
    });
  },

  getTeamMatch: (id: string, options?: ApiFetchOptions) => {
    return apiClient.get<Match[]>(`/teams/${id}/matches`, {
      next: { tags: [`team-${id}-matches`] },
      ...options,
    });
  },

  create: (
    data: { id?: string; name: string; championship?: string; championshipId?: string },
    options?: ApiFetchOptions
  ) => {
    return apiClient.post<Team>(
      "/teams",
      {
        name: data.name,
        championship: data.championship || data.championshipId || "",
      },
      options
    );
  },

  addMatchToTeam: (
    teamId: string,
    match: Match,
    options?: ApiFetchOptions
  ) => {
    return apiClient.post<Team>(`/teams/${teamId}/matches`, match, options);
  },

  getTeamNames: async (teamIds: string[]): Promise<Record<string, string>> => {
    const uniqueIds = Array.from(new Set(teamIds)).filter(Boolean);
    const dict: Record<string, string> = {};
    await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const t = await apiClient.get<Team>(`/teams/${id}`);
          if (t) dict[id] = t.name;
        } catch {
          dict[id] = "Équipe inconnue";
        }
      })
    );
    return dict;
  },
};