import { createTeamAction } from "../team.actions";
import { teamService } from "@/lib/services/team.services";
import { updateTag, revalidatePath } from "next/cache";

// Mock next/cache
jest.mock("next/cache", () => ({
  updateTag: jest.fn(),
  revalidatePath: jest.fn(),
}));

// Mock teamService
jest.mock("@/lib/services/team.services", () => ({
  teamService: {
    create: jest.fn(),
  },
}));

describe("team.actions - createTeamAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fail validation when team name is blank", async () => {
    const result = await createTeamAction({ name: "   ", championship: "N2" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("obligatoire");
    expect(result.fieldErrors?.name).toBeDefined();
    expect(teamService.create).not.toHaveBeenCalled();
  });

  it("should create team and trigger cache revalidation on valid input", async () => {
    const mockTeam = {
      id: "team-123",
      name: "INAM SG",
      championship: "Nationale 2",
      players: [],
      matchs: [],
    };
    (teamService.create as jest.Mock).mockResolvedValueOnce(mockTeam);

    const result = await createTeamAction({
      name: "INAM SG",
      championship: "Nationale 2",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockTeam);
    expect(teamService.create).toHaveBeenCalledWith({
      name: "INAM SG",
      championship: "Nationale 2",
    });
    expect(updateTag).toHaveBeenCalledWith("teams");
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("should return graceful error message on API failure", async () => {
    (teamService.create as jest.Mock).mockRejectedValueOnce(
      new Error("Network timeout")
    );

    const result = await createTeamAction({
      name: "INAM SG",
      championship: "Nationale 2",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Network timeout");
  });
});
