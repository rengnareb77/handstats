import { ApiError } from "../errors";

function mockResponse(body: string, status = 200, statusText = "OK"): Response {
  return {
    status,
    statusText,
    ok: status >= 200 && status < 300,
    text: async () => body,
  } as unknown as Response;
}

describe("ApiError", () => {
  it("should initialize with default fieldErrors when problemDetail is undefined", () => {
    const error = new ApiError(404, "Not Found", "Item not found");
    expect(error.status).toBe(404);
    expect(error.statusText).toBe("Not Found");
    expect(error.message).toBe("Item not found");
    expect(error.problemDetail).toBeUndefined();
    expect(error.fieldErrors).toEqual({});
    expect(error.name).toBe("ApiError");
  });

  it("should extract fieldErrors from problemDetail.errors", () => {
    const error = new ApiError(400, "Bad Request", "Validation failed", {
      title: "Validation error",
      errors: { name: "Name is required" },
    });
    expect(error.fieldErrors).toEqual({ name: "Name is required" });
  });

  it("should extract fieldErrors from problemDetail.invalidFields if errors is absent", () => {
    const error = new ApiError(400, "Bad Request", "Validation failed", {
      title: "Validation error",
      invalidFields: { email: "Invalid email" },
    });
    expect(error.fieldErrors).toEqual({ email: "Invalid email" });
  });

  describe("fromResponse", () => {
    it("should parse RFC 7807 problem detail with detail field", async () => {
      const response = mockResponse(
        JSON.stringify({
          title: "Not Found",
          detail: "Team with id 123 does not exist",
          status: 404,
        }),
        404,
        "Not Found"
      );

      const error = await ApiError.fromResponse(response);
      expect(error.status).toBe(404);
      expect(error.statusText).toBe("Not Found");
      expect(error.message).toBe("Team with id 123 does not exist");
      expect(error.problemDetail?.title).toBe("Not Found");
    });

    it("should fallback to title when detail is absent in json", async () => {
      const response = mockResponse(
        JSON.stringify({
          title: "Forbidden access",
          status: 403,
        }),
        403,
        "Forbidden"
      );

      const error = await ApiError.fromResponse(response);
      expect(error.status).toBe(403);
      expect(error.message).toBe("Forbidden access");
    });

    it("should handle short plain text error", async () => {
      const response = mockResponse("Gateway timed out", 504, "Gateway Timeout");

      const error = await ApiError.fromResponse(response);
      expect(error.status).toBe(504);
      expect(error.message).toBe("Gateway timed out");
      expect(error.problemDetail).toBeUndefined();
    });

    it("should fallback to HTTP status text when plain text is very long (HTML error page)", async () => {
      const longHtml = "<html><body>" + "A".repeat(400) + "</body></html>";
      const response = mockResponse(longHtml, 502, "Bad Gateway");

      const error = await ApiError.fromResponse(response);
      expect(error.status).toBe(502);
      expect(error.message).toBe("Erreur HTTP 502: Bad Gateway");
    });

    it("should fallback to HTTP status text when response body is empty", async () => {
      const response = mockResponse("", 500, "Internal Server Error");

      const error = await ApiError.fromResponse(response);
      expect(error.status).toBe(500);
      expect(error.message).toBe("Erreur HTTP 500: Internal Server Error");
    });

    it("should handle response.text() rejection gracefully", async () => {
      const badResponse = {
        status: 500,
        statusText: "Internal Server Error",
        text: jest.fn().mockRejectedValue(new Error("Stream aborted")),
      } as unknown as Response;

      const error = await ApiError.fromResponse(badResponse);
      expect(error.status).toBe(500);
      expect(error.message).toBe("Erreur HTTP 500: Internal Server Error");
    });
  });
});
