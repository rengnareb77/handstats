import { Match } from "./match.types";
import { Player } from "./player.types";

export interface Team {
    id: string;
    name: string;
    championship?: string;
    championshipId?: string;
    players: Player[];
    matchs: Match[];
}