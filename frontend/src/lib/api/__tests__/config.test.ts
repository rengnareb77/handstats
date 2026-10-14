import { resolveApiUrl, isServer } from "../config";

describe("api/config in browser environment (jsdom)", () => {
  it("should have isServer as false", () => {
    expect(isServer).toBe(false);
  });

  it("should format client endpoint with /api prefix if missing", () => {
    expect(resolveApiUrl("teams")).toBe("/api/teams");
    expect(resolveApiUrl("/teams")).toBe("/api/teams");
  });

  it("should keep /api prefix if already present", () => {
    expect(resolveApiUrl("/api/teams")).toBe("/api/teams");
    expect(resolveApiUrl("/api/matches/123")).toBe("/api/matches/123");
  });
});
