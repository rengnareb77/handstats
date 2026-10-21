import { createTeamAction } from "../team.actions";
import { teamService } from "@/lib/services/team.services";
import { updateTag, revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api/errors";

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

  it("should fail validation when team name is blank or missing", async () => {
    const result = await createTeamAction({ name: "   ", championship: "N2" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("obligatoire");
      expect(result.fieldErrors?.name).toBeDefined();
    }
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
    if (result.success) {
      expect(result.data).toEqual(mockTeam);
    }
    expect(teamService.create).toHaveBeenCalledWith({
      name: "INAM SG",
      championship: "Nationale 2",
    });
    expect(updateTag).toHaveBeenCalledWith("teams");
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("should return graceful error message on API failure with generic Error", async () => {
    (teamService.create as jest.Mock).mockRejectedValueOnce(
      new Error("Network timeout")
    );

    const result = await createTeamAction({
      name: "INAM SG",
      championship: "Nationale 2",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Network timeout");
    }
  });

  it("should return ApiError details and field errors", async () => {
    const apiError = new ApiError(400, "Bad Request", "Nom déjà utilisé", {
      errors: { name: "Le nom d'équipe existe déjà" },
    });
    (teamService.create as jest.Mock).mockRejectedValueOnce(apiError);

    const result = await createTeamAction({
      name: "INAM SG",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Nom déjà utilisé");
      expect(result.fieldErrors).toEqual({ name: "Le nom d'équipe existe déjà" });
    }
  });

  it("should return fallback error message on unknown non-Error rejection", async () => {
    (teamService.create as jest.Mock).mockRejectedValueOnce("Unknown crash");

    const result = await createTeamAction({
      name: "INAM SG",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Erreur inattendue lors de la création de l'équipe");
    }
  });
});
