import { playerService } from "../player.services";
import { apiClient } from "../../api";
import { Player } from "@/types/player.types";

jest.mock("../../api", () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe("playerService", () => {
  it("should get player by id with cache tags", async () => {
    const mockPlayer = { id: "p1", name: "Player 1" } as unknown as Player;
    (apiClient.get as jest.Mock).mockResolvedValueOnce(mockPlayer);

    const result = await playerService.getPlayerById("p1");
    expect(result).toEqual(mockPlayer);
    expect(apiClient.get).toHaveBeenCalledWith("/players/p1", {
      next: { tags: ["player-p1"] },
    });
  });
});
