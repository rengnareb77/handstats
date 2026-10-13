import { Player } from "@/types/player.types";
import { apiClient, type ApiFetchOptions } from "../api";

export const playerService = {
  getPlayerById: (playerId: string, options?: ApiFetchOptions) => {
    return apiClient.get<Player>(`/players/${playerId}`, {
      next: { tags: [`player-${playerId}`] },
      ...options,
    });
  },
};