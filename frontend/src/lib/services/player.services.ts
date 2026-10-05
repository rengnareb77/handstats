import { Player } from "@/types/player.types";
import { apiFetch } from "../api";

export const playerService = {
    getPlayerById: (playerId: string, serverSide: boolean = false, options?: RequestInit) => {
        return apiFetch<Player>(`/player/${playerId}`, {
            ...options,
            serverSide,
            cache: options?.cache || "no-store",
        });
    },
}