import {
  addMatchAction,
  addMatchEventAction,
  updateMatchEventAction,
  deleteMatchEventAction,
} from "../match.actions";
import { parserService } from "@/lib/services/parser.services";
import { teamService } from "@/lib/services/team.services";
import { matchService } from "@/lib/services/match.services";
import { updateTag, revalidatePath } from "next/cache";
import { Match, MatchEvent, MatchPlayer } from "@/types/match.types";
import { ApiError } from "@/lib/api/errors";

jest.mock("next/cache", () => ({
  updateTag: jest.fn(),
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/services/parser.services", () => ({
  parserService: {
    parseMatchPDF: jest.fn(),
  },
}));

jest.mock("@/lib/services/team.services", () => ({
  teamService: {
    addMatchToTeam: jest.fn(),
  },
}));

jest.mock("@/lib/services/match.services", () => ({
  matchService: {
    addAllPlayersStats: jest.fn(),
    addEventToMatch: jest.fn(),
    updateEventToMatch: jest.fn(),
    deleteEventFromMatch: jest.fn(),
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
    homeTeamPlayers: [{ playerId: "P1", name: "Player 1" } as unknown as MatchPlayer],
    awayTeamPlayers: [{ playerId: "P2", name: "Player 2" } as unknown as MatchPlayer],
    events: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addMatchAction", () => {
    it("should parse PDF, save match, save home player stats when isHome is true", async () => {
      (parserService.parseMatchPDF as jest.Mock).mockResolvedValueOnce(dummyMatch);
      (teamService.addMatchToTeam as jest.Mock).mockResolvedValueOnce({});
      (matchService.addAllPlayersStats as jest.Mock).mockResolvedValueOnce({});

      const formData = new FormData();
      const result = await addMatchAction("team-1", formData, true);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isHome).toBe(true);
      }
      expect(teamService.addMatchToTeam).toHaveBeenCalledWith("team-1", {
        ...dummyMatch,
        isHome: true,
      });
      expect(matchService.addAllPlayersStats).toHaveBeenCalledWith(
        dummyMatch.homeTeamPlayers,
        "team-1",
        "M-101"
      );
      expect(updateTag).toHaveBeenCalledWith("team-team-1");
      expect(updateTag).toHaveBeenCalledWith("team-team-1-matches");
      expect(revalidatePath).toHaveBeenCalledWith("/equipe/team-1");
    });

    it("should save away player stats when isHome is false", async () => {
      (parserService.parseMatchPDF as jest.Mock).mockResolvedValueOnce(dummyMatch);
      (teamService.addMatchToTeam as jest.Mock).mockResolvedValueOnce({});
      (matchService.addAllPlayersStats as jest.Mock).mockResolvedValueOnce({});

      const formData = new FormData();
      const result = await addMatchAction("team-1", formData, false);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isHome).toBe(false);
      }
      expect(matchService.addAllPlayersStats).toHaveBeenCalledWith(
        dummyMatch.awayTeamPlayers,
        "team-1",
        "M-101"
      );
    });

    it("should not call addAllPlayersStats if players array is empty", async () => {
      const matchWithoutPlayers: Match = {
        ...dummyMatch,
        homeTeamPlayers: [],
        awayTeamPlayers: [],
      };
      (parserService.parseMatchPDF as jest.Mock).mockResolvedValueOnce(matchWithoutPlayers);
      (teamService.addMatchToTeam as jest.Mock).mockResolvedValueOnce({});

      const result = await addMatchAction("team-1", new FormData(), true);
      expect(result.success).toBe(true);
      expect(matchService.addAllPlayersStats).not.toHaveBeenCalled();
    });

    it("should handle ApiError properly", async () => {
      const apiError = new ApiError(400, "Bad Request", "Fichier invalide", {
        errors: { file: "Format non supporté" },
      });
      (parserService.parseMatchPDF as jest.Mock).mockRejectedValueOnce(apiError);

      const result = await addMatchAction("team-1", new FormData(), true);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Fichier invalide");
        expect(result.fieldErrors).toEqual({ file: "Format non supporté" });
      }
    });

    it("should handle generic Error and unknown exceptions", async () => {
      (parserService.parseMatchPDF as jest.Mock).mockRejectedValueOnce(new Error("Crash parser"));

      const result = await addMatchAction("team-1", new FormData(), true);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Crash parser");
      }

      // Non-Error exception
      (parserService.parseMatchPDF as jest.Mock).mockRejectedValueOnce("Simple string rejection");
      const result2 = await addMatchAction("team-1", new FormData(), true);
      expect(result2.success).toBe(false);
      if (!result2.success) {
        expect(result2.error).toBe("Erreur inattendue lors de l'ajout du match");
      }
    });
  });

  describe("addMatchEventAction", () => {
    const event: MatchEvent = {
      type: "GOAL",
      time: "12:34",
      matchPlayerName: "BELLEC Corentin",
      team: "HOME",
      sector: null,
    };

    it("should append event, update cache tag and revalidate route", async () => {
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

    it("should handle ApiError properly", async () => {
      const apiError = new ApiError(422, "Unprocessable", "Score invalide", {
        errors: { time: "Temps incorrect" },
      });
      (matchService.addEventToMatch as jest.Mock).mockRejectedValueOnce(apiError);

      const result = await addMatchEventAction("M-101", "team-1", event);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Score invalide");
        expect(result.fieldErrors).toEqual({ time: "Temps incorrect" });
      }
    });

    it("should handle generic and non-Error properly", async () => {
      (matchService.addEventToMatch as jest.Mock).mockRejectedValueOnce(new Error("Erreur DB"));
      const result = await addMatchEventAction("M-101", "team-1", event);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Erreur DB");
      }

      (matchService.addEventToMatch as jest.Mock).mockRejectedValueOnce(undefined);
      const result2 = await addMatchEventAction("M-101", "team-1", event);
      expect(result2.success).toBe(false);
      if (!result2.success) {
        expect(result2.error).toBe("Erreur lors de l'ajout de l'événement");
      }
    });
  });

  describe("updateMatchEventAction", () => {
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

    it("should update event and revalidate match page", async () => {
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
      expect(matchService.updateEventToMatch).toHaveBeenCalledWith("M-101", {
        oldEvent,
        newEvent,
      });
      expect(updateTag).toHaveBeenCalledWith("match-M-101");
    });

    it("should handle ApiError properly", async () => {
      const apiError = new ApiError(404, "Not Found", "Evénement inexistant");
      (matchService.updateEventToMatch as jest.Mock).mockRejectedValueOnce(apiError);

      const result = await updateMatchEventAction("M-101", "team-1", oldEvent, newEvent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Evénement inexistant");
      }
    });

    it("should handle generic Error and non-Error rejection", async () => {
      (matchService.updateEventToMatch as jest.Mock).mockRejectedValueOnce(
        new Error("Update failed")
      );
      const result1 = await updateMatchEventAction("M-101", "team-1", oldEvent, newEvent);
      expect(result1.success).toBe(false);
      if (!result1.success) {
        expect(result1.error).toBe("Update failed");
      }

      (matchService.updateEventToMatch as jest.Mock).mockRejectedValueOnce(null);
      const result2 = await updateMatchEventAction("M-101", "team-1", oldEvent, newEvent);
      expect(result2.success).toBe(false);
      if (!result2.success) {
        expect(result2.error).toBe("Erreur lors de la modification de l'événement");
      }
    });
  });

  describe("deleteMatchEventAction", () => {
    it("should delete event and revalidate match page", async () => {
      (matchService.deleteEventFromMatch as jest.Mock).mockResolvedValueOnce({
        ...dummyMatch,
        events: [],
      });

      const result = await deleteMatchEventAction("M-101", "team-1", "event-uuid");

      expect(result.success).toBe(true);
      expect(matchService.deleteEventFromMatch).toHaveBeenCalledWith("M-101", "event-uuid");
      expect(updateTag).toHaveBeenCalledWith("match-M-101");
      expect(revalidatePath).toHaveBeenCalledWith("/equipe/team-1/matchs/M-101");
    });

    it("should handle ApiError properly", async () => {
      const apiError = new ApiError(404, "Not Found", "Evénement introuvable");
      (matchService.deleteEventFromMatch as jest.Mock).mockRejectedValueOnce(apiError);

      const result = await deleteMatchEventAction("M-101", "team-1", "event-uuid");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Evénement introuvable");
      }
    });

    it("should handle generic Error and non-Error rejection", async () => {
      (matchService.deleteEventFromMatch as jest.Mock).mockRejectedValueOnce(
        new Error("Delete failed")
      );
      const result1 = await deleteMatchEventAction("M-101", "team-1", "event-uuid");
      expect(result1.success).toBe(false);
      if (!result1.success) {
        expect(result1.error).toBe("Delete failed");
      }

      (matchService.deleteEventFromMatch as jest.Mock).mockRejectedValueOnce(1234);
      const result2 = await deleteMatchEventAction("M-101", "team-1", "event-uuid");
      expect(result2.success).toBe(false);
      if (!result2.success) {
        expect(result2.error).toBe("Erreur lors de la suppression de l'événement");
      }
    });
  });
});
