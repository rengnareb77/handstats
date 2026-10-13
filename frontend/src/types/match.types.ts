export interface Match {
    codeRencontre: string;
    homeTeamName: string;
    awayTeamName: string;
    homeTeamId?: string;
    awayTeamId?: string;
    championshipId?: string;
    date: string;
    homeScore: Score;
    awayScore: Score;
    homeTeamPlayers: MatchPlayer[];
    awayTeamPlayers: MatchPlayer[];
    events: MatchEvent[];
    isHome?: boolean;
}


export interface Score {
    halfScore: number;
    finalScore: number;
}
export interface MatchPlayer {
    isCaptain: boolean;
    tshirtNumber: number;
    fullName: string;
    licenseNumber: string;
    goal: number;
    sevenMeter: number;
    shot: number;
    save: number;
    avertissement: boolean;
    twoMinutes: number;
    redCard: boolean;
}

export interface MatchEvent {
    type: "GOAL" | "SEVEN_METER" | "TWO_MINUTE" | "YELLOW_CARD" | "RED_CARD" | "SAVE" | "SHOT" | "TIMEOUT";
    time: string;
    team: "HOME" | "AWAY";
    matchPlayerName: string;
    sector: "WING_L" | "WING_R" | "CENTER" | "PIVOT" | "BACK_L" | "BACK_R" | "GOALKEEPER" | null;
    goalType?: string
}

