import { Match, MatchEvent, MatchPlayer } from "@/types/match.types";
import { apiClient, type ApiFetchOptions } from "../api";

export const matchService = {
  getAll: (teamId: string, options?: ApiFetchOptions) => {
    return apiClient.get<Match[]>(`/teams/${teamId}/matches`, {
      next: { tags: [`team-${teamId}-matches`] },
      ...options,
    });
  },

  getMatchById: (matchId: string, options?: ApiFetchOptions) => {
    return apiClient.get<Match>(`/matches/${matchId}`, {
      next: { tags: [`match-${matchId}`] },
      ...options,
    });
  },

  addPlayerStats: (
    matchPlayer: MatchPlayer,
    teamId: string,
    matchId: string,
    options?: ApiFetchOptions
  ) => {
    return apiClient.post<void>(`/matches/${matchId}/stats/${teamId}`, matchPlayer, options);
  },

  addAllPlayersStats: async (
    players: MatchPlayer[],
    teamId: string,
    matchId: string,
    options?: ApiFetchOptions
  ) => {
    return apiClient.post<void>(`/matches/${matchId}/stats/${teamId}/batch`, players, options);
  },

  addEventToMatch: (
    matchId: string,
    event: MatchEvent,
    options?: ApiFetchOptions
  ) => {
    return apiClient.post<Match>(`/matches/${matchId}/events`, event, options);
  },

  updateEventToMatch: (
    matchId: string,
    payload: { oldEvent: MatchEvent; newEvent: MatchEvent },
    options?: ApiFetchOptions
  ) => {
    return apiClient.put<Match>(`/matches/${matchId}/events`, payload, options);
  },

  deleteEventFromMatch: (
    matchId: string,
    eventId: string,
    options?: ApiFetchOptions
  ) => {
    return apiClient.delete<Match>(`/matches/${matchId}/events/${eventId}`, options);
  },
};