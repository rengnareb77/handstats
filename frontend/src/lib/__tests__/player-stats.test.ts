import { calculatePlayerMatches, calculatePlayerStats } from "@/lib/player-stats";
import { Player } from "@/types/player.types";
import { Match } from "@/types/match.types";

describe("player-stats calculation", () => {
  const dummyPlayer: Player = {
    licenseNumber: "5356012101052",
    fullName: "LAUNAY Aliaume",
    teamId: "team-1",
    stats: {
      goal: 6,
      sevenMeter: 0,
      shot: 10,
      save: 0,
      avertissement: 0,
      twoMinutes: 1,
      redCard: 0,
    },
    matchs: [],
  };

  const sampleMatch1: Match = {
    codeRencontre: "M1",
    homeTeamName: "INAM HB",
    awayTeamName: "EXT TEAM",
    homeScore: { halfScore: 10, finalScore: 20 },
    awayScore: { halfScore: 8, finalScore: 18 },
    isHome: true,
    date: "19/09/2026 17:30",
    homeTeamPlayers: [
      {
        licenseNumber: "5356012101052",
        fullName: "LAUNAY Aliaume",
        goal: 3,
        sevenMeter: 0,
        shot: 5,
        save: 0,
        avertissement: false,
        twoMinutes: 0,
        redCard: false,
        isCaptain: false,
        tshirtNumber: 6,
      },
    ],
    awayTeamPlayers: [],
    events: [],
  } as unknown as Match;

  const sampleMatch2: Match = {
    codeRencontre: "M2",
    homeTeamName: "ADV TEAM",
    awayTeamName: "INAM HB",
    homeScore: { halfScore: 15, finalScore: 30 },
    awayScore: { halfScore: 12, finalScore: 25 },
    isHome: false,
    date: "26/09/2026 20:00",
    homeTeamPlayers: [],
    awayTeamPlayers: [
      {
        licenseNumber: "5356012101052",
        fullName: "LAUNAY Aliaume",
        goal: 3,
        sevenMeter: 0,
        shot: 5,
        save: 0,
        avertissement: false,
        twoMinutes: 1,
        redCard: false,
        isCaptain: false,
        tshirtNumber: 6,
      },
    ],
    events: [],
  } as unknown as Match;

  describe("calculatePlayerMatches", () => {
    it("should return player.matchs when player.matchs is non-empty", () => {
      const playerWithMatches: Player = {
        ...dummyPlayer,
        matchs: [sampleMatch1],
      };
      const result = calculatePlayerMatches(playerWithMatches, [sampleMatch2]);
      expect(result).toHaveLength(1);
      expect(result[0].codeRencontre).toBe("M1");
    });

    it("should fallback to teamMatches when player.matchs is empty", () => {
      const result = calculatePlayerMatches(dummyPlayer, [sampleMatch1, sampleMatch2]);
      expect(result).toHaveLength(2);
      expect(result.map((m) => m.codeRencontre)).toEqual(["M1", "M2"]);
    });

    it("should filter out teamMatches where the player did not participate", () => {
      const matchWithoutPlayer: Match = {
        ...sampleMatch1,
        codeRencontre: "M3",
        homeTeamPlayers: [],
        awayTeamPlayers: [],
      };
      const result = calculatePlayerMatches(dummyPlayer, [sampleMatch1, matchWithoutPlayer]);
      expect(result).toHaveLength(1);
      expect(result[0].codeRencontre).toBe("M1");
    });

    it("should return empty array when player has no licenseNumber and no player.matchs", () => {
      const playerWithoutLicense: Player = {
        ...dummyPlayer,
        licenseNumber: "",
        matchs: [],
      };
      const result = calculatePlayerMatches(playerWithoutLicense, [sampleMatch1]);
      expect(result).toEqual([]);
    });
  });

  describe("calculatePlayerStats", () => {
    it("should return 0 matches and 0 goals/match when no matches are found", () => {
      const stats = calculatePlayerStats(dummyPlayer, []);
      expect(stats.matchesPlayed).toBe(0);
      expect(stats.goalsPerMatch).toBe(0);
      expect(stats.savesPerMatch).toBe(0);
    });

    it("should accurately calculate goalsPerMatch and matchesPlayed from teamMatches", () => {
      const stats = calculatePlayerStats(dummyPlayer, [sampleMatch1, sampleMatch2]);
      expect(stats.matchesPlayed).toBe(2);
      // 6 goals / 2 matches = 3.0
      expect(stats.goalsPerMatch).toBe(3);
    });

    it("should calculate goalkeeper stats correctly", () => {
      const goalkeeper: Player = {
        licenseNumber: "GK1",
        fullName: "QUEMENER Anthony",
        teamId: "team-1",
        stats: {
          goal: 0,
          sevenMeter: 0,
          shot: 0,
          save: 30,
          avertissement: 0,
          twoMinutes: 0,
          redCard: 0,
        },
        matchs: [sampleMatch1, sampleMatch2],
      };

      const stats = calculatePlayerStats(goalkeeper);
      expect(stats.isGoalkeeper).toBe(true);
      expect(stats.matchesPlayed).toBe(2);
      expect(stats.savesPerMatch).toBe(15);
      expect(stats.goalsPerMatch).toBe(0);
    });

    it("should calculate precision percentage accurately", () => {
      const stats = calculatePlayerStats(dummyPlayer, [sampleMatch1]);
      // 6 goals / 10 shots = 60%
      expect(stats.precision).toBe(60);
    });
  });
});
