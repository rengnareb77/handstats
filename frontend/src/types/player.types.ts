import { Match } from "./match.types"
import { Team } from "./team.types"

export interface Player {
    licenseNumber: string
    fullName: string
    stats: PlayerStats
    matchs: Match[]
    teamId: string
}

export interface PlayerStats {
    goal: number,
    sevenMeter: number,
    shot: number,
    save: number,
    avertissement: number,
    avertissements?: number,
    twoMinutes: number,
    redCard: number,
}