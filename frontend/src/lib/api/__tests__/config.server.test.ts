/**
 * @jest-environment node
 */
import { resolveApiUrl, isServer, API_CONFIG } from "../config";

describe("api/config in server environment", () => {
  it("should detect isServer as true", () => {
    expect(isServer).toBe(true);
  });

  it("should resolve server Core and Parser URLs correctly", () => {
    const coreBase = API_CONFIG.serverCoreUrl.replace(/\/+$/, "");
    const parserBase = API_CONFIG.serverParserUrl.replace(/\/+$/, "");

    // Core target
    expect(resolveApiUrl("teams", "core")).toBe(`${coreBase}/teams`);
    expect(resolveApiUrl("/api/teams", "core")).toBe(`${coreBase}/teams`);
    expect(resolveApiUrl("/teams/42", "core")).toBe(`${coreBase}/teams/42`);

    // Parser target
    expect(resolveApiUrl("parse", "parser")).toBe(`${parserBase}/parse`);
    expect(resolveApiUrl("/api/parse", "parser")).toBe(`${parserBase}/api/parse`);
  });
});
