import { matchService } from "../match.services";
import { apiClient } from "../../api";
import { Match, MatchEvent, MatchPlayer } from "@/types/match.types";

jest.mock("../../api", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("matchService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should get all matches for a team with next cache tags", async () => {
    const mockMatches = [{ codeRencontre: "M1" }] as Match[];
    (apiClient.get as jest.Mock).mockResolvedValueOnce(mockMatches);

    const result = await matchService.getAll("team-1");
    expect(result).toEqual(mockMatches);
    expect(apiClient.get).toHaveBeenCalledWith("/teams/team-1/matches", {
      next: { tags: ["team-team-1-matches"] },
    });
  });

  it("should get match by id with next cache tags", async () => {
    const mockMatch = { codeRencontre: "M1" } as Match;
    (apiClient.get as jest.Mock).mockResolvedValueOnce(mockMatch);

    const result = await matchService.getMatchById("M1");
    expect(result).toEqual(mockMatch);
    expect(apiClient.get).toHaveBeenCalledWith("/matches/M1", {
      next: { tags: ["match-M1"] },
    });
  });

  it("should add player stats for a single player", async () => {
    const player = { playerId: "P1" } as unknown as MatchPlayer;
    (apiClient.post as jest.Mock).mockResolvedValueOnce({});

    await matchService.addPlayerStats(player, "team-1", "M1");
    expect(apiClient.post).toHaveBeenCalledWith(
      "/matches/M1/stats/team-1",
      player,
      undefined
    );
  });

  it("should add all players stats in batch", async () => {
    const players = [{ playerId: "P1" }, { playerId: "P2" }] as unknown as MatchPlayer[];
    (apiClient.post as jest.Mock).mockResolvedValueOnce({});

    await matchService.addAllPlayersStats(players, "team-1", "M1");
    expect(apiClient.post).toHaveBeenCalledWith(
      "/matches/M1/stats/team-1/batch",
      players,
      undefined
    );
  });

  it("should add event to match", async () => {
    const event = { type: "GOAL", time: "10:00" } as MatchEvent;
    const updated = { codeRencontre: "M1" } as Match;
    (apiClient.post as jest.Mock).mockResolvedValueOnce(updated);

    const result = await matchService.addEventToMatch("M1", event);
    expect(result).toEqual(updated);
    expect(apiClient.post).toHaveBeenCalledWith("/matches/M1/events", event, undefined);
  });

  it("should update event in match", async () => {
    const payload = {
      oldEvent: { type: "SHOT", time: "10:00" } as MatchEvent,
      newEvent: { type: "GOAL", time: "10:00" } as MatchEvent,
    };
    const updated = { codeRencontre: "M1" } as Match;
    (apiClient.put as jest.Mock).mockResolvedValueOnce(updated);

    const result = await matchService.updateEventToMatch("M1", payload);
    expect(result).toEqual(updated);
    expect(apiClient.put).toHaveBeenCalledWith("/matches/M1/events", payload, undefined);
  });

  it("should delete event from match", async () => {
    const updated = { codeRencontre: "M1" } as Match;
    (apiClient.delete as jest.Mock).mockResolvedValueOnce(updated);

    const result = await matchService.deleteEventFromMatch("M1", "evt-123");
    expect(result).toEqual(updated);
    expect(apiClient.delete).toHaveBeenCalledWith("/matches/M1/events/evt-123", undefined);
  });
});
