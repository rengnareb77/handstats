jest.mock("next/cache", () => ({
  updateTag: jest.fn(),
  revalidatePath: jest.fn(),
}));

import * as actionsIndex from "@/actions/index";
import * as apiBarrel from "@/lib/api/index";
import * as apiFile from "../api";

describe("Barrels and Re-exports", () => {
  it("should expose action exports", () => {
    expect(actionsIndex.addMatchAction).toBeDefined();
    expect(actionsIndex.createTeamAction).toBeDefined();
    expect(actionsIndex.addMatchEventAction).toBeDefined();
    expect(actionsIndex.updateMatchEventAction).toBeDefined();
    expect(actionsIndex.deleteMatchEventAction).toBeDefined();
  });

  it("should expose api client and error exports", () => {
    expect(apiBarrel.apiClient).toBeDefined();
    expect(apiBarrel.ApiError).toBeDefined();
    expect(apiBarrel.resolveApiUrl).toBeDefined();
  });

  it("should expose root api file re-export", () => {
    expect(apiFile.apiClient).toBeDefined();
  });
});
