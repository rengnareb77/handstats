import { teamService } from "../team.services";
import { apiClient } from "../../api";
import { Team } from "@/types/team.types";
import { Match } from "@/types/match.types";

jest.mock("../../api", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe("teamService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should get all teams with default cache tags", async () => {
    const mockTeams = [{ id: "t1", name: "Team 1", players: [], matchs: [] }];
    (apiClient.get as jest.Mock).mockResolvedValueOnce(mockTeams);

    const result = await teamService.getAll();
    expect(result).toEqual(mockTeams);
    expect(apiClient.get).toHaveBeenCalledWith("/teams", {
      next: { tags: ["teams"] },
    });
  });

  it("should get team by id with specific cache tag", async () => {
    const mockTeam = { id: "t1", name: "Team 1", players: [], matchs: [] };
    (apiClient.get as jest.Mock).mockResolvedValueOnce(mockTeam);

    const result = await teamService.getTeamById("t1");
    expect(result).toEqual(mockTeam);
    expect(apiClient.get).toHaveBeenCalledWith("/teams/t1", {
      next: { tags: ["team-t1"] },
    });
  });

  it("should get team matches with specific cache tag", async () => {
    const mockMatches = [{ codeRencontre: "M1" }];
    (apiClient.get as jest.Mock).mockResolvedValueOnce(mockMatches);

    const result = await teamService.getTeamMatch("t1");
    expect(result).toEqual(mockMatches);
    expect(apiClient.get).toHaveBeenCalledWith("/teams/t1/matches", {
      next: { tags: ["team-t1-matches"] },
    });
  });

  it("should create team with championship fallback to championshipId or empty", async () => {
    const mockCreated = { id: "t2", name: "Team 2", championship: "N2" };
    (apiClient.post as jest.Mock).mockResolvedValueOnce(mockCreated);

    // With championship
    const result1 = await teamService.create({ name: "Team 2", championship: "N2" });
    expect(result1).toEqual(mockCreated);
    expect(apiClient.post).toHaveBeenCalledWith(
      "/teams",
      { name: "Team 2", championship: "N2" },
      undefined
    );

    // With championshipId fallback
    await teamService.create({ name: "Team 3", championshipId: "champ-3" });
    expect(apiClient.post).toHaveBeenCalledWith(
      "/teams",
      { name: "Team 3", championship: "champ-3" },
      undefined
    );

    // With neither
    await teamService.create({ name: "Team 4" });
    expect(apiClient.post).toHaveBeenCalledWith(
      "/teams",
      { name: "Team 4", championship: "" },
      undefined
    );
  });

  it("should add match to team", async () => {
    const mockMatch = { codeRencontre: "M2" } as Match;
    const mockUpdatedTeam = { id: "t1", name: "Team 1" } as Team;
    (apiClient.post as jest.Mock).mockResolvedValueOnce(mockUpdatedTeam);

    const result = await teamService.addMatchToTeam("t1", mockMatch);
    expect(result).toEqual(mockUpdatedTeam);
    expect(apiClient.post).toHaveBeenCalledWith("/teams/t1/matches", mockMatch, undefined);
  });

  describe("getTeamNames", () => {
    it("should resolve team names, deduplicate IDs and handle failures with fallback", async () => {
      (apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url === "/teams/t1") return Promise.resolve({ id: "t1", name: "Team One" });
        if (url === "/teams/t2") return Promise.reject(new Error("Not found"));
        return Promise.resolve(null);
      });

      const dict = await teamService.getTeamNames(["t1", "t2", "t1", "", "t3"]);

      expect(dict["t1"]).toBe("Team One");
      expect(dict["t2"]).toBe("Équipe inconnue");
      // t3 returned null, which falsy doesn't set dict[id], or stays undefined
      expect(dict["t3"]).toBeUndefined();
      expect(dict[""]).toBeUndefined();
    });
  });
});
