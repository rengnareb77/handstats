import { Match, MatchEvent, MatchPlayer } from "@/types/match.types";
import { apiFetch } from "../api";
import { PlayerStats } from "@/types/player.types";

export const matchService = {
    getAll: (teamId: string, serverSide: boolean = false, options?: RequestInit) => {
        return apiFetch<Match[]>(`/team/${teamId}/match`, {
            ...options,
            serverSide,
            cache: options?.cache || "no-store",
        });
    },
    getMatchById: (matchId: string, serverSide: boolean = false, options?: RequestInit) => {
        return apiFetch<Match>(`/match/${matchId}`, {
            ...options,
            serverSide,
            cache: options?.cache || "no-store",
        });
    },
    addPlayerStats: (matchPlayer: MatchPlayer, teamId: string, matchId: string, serverSide: boolean = false, options?: RequestInit) => {
        return apiFetch<void>(`/match/${matchId}/stats/${teamId}`, {
            ...options,
            serverSide,
            cache: options?.cache || "no-store",
            method: "POST",
            body: JSON.stringify(matchPlayer),
        });
    },
    addAllPlayersStats: async (players: MatchPlayer[], teamId: string, matchId: string, serverSide: boolean = false, options?: RequestInit) => {
        const promises = players.map(p => matchService.addPlayerStats(p, teamId, matchId, serverSide, options));
        await Promise.all(promises);
    },
    addEventToMatch: (matchId: string, event: MatchEvent, serverSide: boolean = false, options?: RequestInit) => {
        return apiFetch<void>(`/match/${matchId}/event`, {
            ...options,
            serverSide,
            cache: options?.cache || "no-store",
            method: "POST",
            body: JSON.stringify(event),
        });
    },
    /**
     * 
     * @param matchId codeRencontre
     * @param events un tableau d'événements de taille 2 contenant l'ancien evenement et sa nouvelle version
     */
    updateEventToMatch: (matchId: string, events: MatchEvent[], serverSide: boolean = false, options?: RequestInit) => {
        return apiFetch<void>(`/match/${matchId}/event`, {
            ...options,
            serverSide,
            cache: options?.cache || "no-store",
            method: "PUT",
            body: JSON.stringify(events),
        });
    }
}