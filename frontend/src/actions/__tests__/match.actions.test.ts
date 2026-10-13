import { addMatchEventAction, updateMatchEventAction } from "../match.actions";
import { matchService } from "@/lib/services/match.services";
import { updateTag, revalidatePath } from "next/cache";
import { Match, MatchEvent } from "@/types/match.types";

jest.mock("next/cache", () => ({
  updateTag: jest.fn(),
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/services/match.services", () => ({
  matchService: {
    addEventToMatch: jest.fn(),
    updateEventToMatch: jest.fn(),
  },
}));

describe("match.actions", () => {
  const dummyMatch: Match = {
    codeRencontre: "M-101",
    homeTeamName: "Equipe A",
    awayTeamName: "Equipe B",
    homeScore: { halfScore: 10, finalScore: 25 },
    awayScore: { halfScore: 12, finalScore: 24 },
    isHome: true,
    date: "19/09/2026 17:30",
    homeTeamPlayers: [],
    awayTeamPlayers: [],
    events: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addMatchEventAction", () => {
    it("should append event, update cache tag and revalidate route", async () => {
      const event: MatchEvent = {
        type: "GOAL",
        time: "12:34",
        matchPlayerName: "BELLEC Corentin",
        team: "HOME",
        sector: null,
      };

      (matchService.addEventToMatch as jest.Mock).mockResolvedValueOnce({
        ...dummyMatch,
        events: [event],
      });

      const result = await addMatchEventAction("M-101", "team-1", event);
      expect(result.success).toBe(true);
      expect(matchService.addEventToMatch).toHaveBeenCalledWith("M-101", event);
      expect(updateTag).toHaveBeenCalledWith("match-M-101");
      expect(revalidatePath).toHaveBeenCalledWith("/equipe/team-1/matchs/M-101");
    });
  });

  describe("updateMatchEventAction", () => {
    it("should update event and revalidate match page", async () => {
      const oldEvent: MatchEvent = {
        type: "SHOT",
        time: "10:00",
        matchPlayerName: "Player 1",
        team: "HOME",
        sector: null,
      };
      const newEvent: MatchEvent = {
        type: "GOAL",
        time: "10:00",
        matchPlayerName: "Player 1",
        team: "HOME",
        sector: null,
      };

      (matchService.updateEventToMatch as jest.Mock).mockResolvedValueOnce({
        ...dummyMatch,
        events: [newEvent],
      });

      const result = await updateMatchEventAction(
        "M-101",
        "team-1",
        oldEvent,
        newEvent
      );

      expect(result.success).toBe(true);
      expect(matchService.updateEventToMatch).toHaveBeenCalledWith("M-101", [
        oldEvent,
        newEvent,
      ]);
      expect(updateTag).toHaveBeenCalledWith("match-M-101");
    });
  });
});
