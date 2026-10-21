import { parserService } from "../parser.services";
import { apiFetch } from "../../api";
import { Match } from "@/types/match.types";

jest.mock("../../api", () => ({
  apiFetch: jest.fn(),
}));

describe("parserService", () => {
  it("should post formData to /api/parse targeting parser service", async () => {
    const mockMatch = { codeRencontre: "M1" } as Match;
    (apiFetch as jest.Mock).mockResolvedValueOnce(mockMatch);

    const formData = new FormData();
    formData.append("file", "dummy-file");

    const result = await parserService.parseMatchPDF(formData);
    expect(result).toEqual(mockMatch);
    expect(apiFetch).toHaveBeenCalledWith("/api/parse", {
      target: "parser",
      method: "POST",
      body: formData,
      cache: "no-store",
    });
  });
});
