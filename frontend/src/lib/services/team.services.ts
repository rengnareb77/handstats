import { Team } from "@/types/team.types";
import { apiFetch } from "../api";
import { Match } from "@/types/match.types";


export const teamService = {
    getAll: (serverSide: boolean = false, options?: RequestInit) => {
        return apiFetch<Team[]>("/team", {
            ...options,
            serverSide,
            cache: options?.cache || "no-store", // Souvent utile de forcer la fraicheur des listes
        });
    },
    getTeamById: (id: string, serverSide: boolean = false, options?: RequestInit) => {
        return apiFetch<Team>("/team/" + id, {
            ...options,
            serverSide,
            cache: options?.cache || "no-store",
        });
    },
    getTeamMatch: (id: string, serverSide: boolean = false, options?: RequestInit) => {
        return apiFetch<Match[]>("/team/" + id + "/match", {
            ...options,
            serverSide,
            cache: options?.cache || "no-store",
        });
    },

    create: (data: Omit<Team, 'id' | 'players' | 'matchs'>, serverSide = false, options: RequestInit = {}) => {
        return apiFetch<Team>("/team", {
            ...options,
            serverSide,
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    addMatchToTeam: (teamId: string, match: Match, serverSide = false, options: RequestInit = {}) => {
        return apiFetch<Team>("/team/" + teamId + "/match", {
            ...options,
            serverSide,
            method: "POST",
            body: JSON.stringify(match),
        });
    }
}