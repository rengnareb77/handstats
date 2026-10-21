import { apiFetch, apiClient } from "../client";
import { ApiError } from "../errors";

describe("apiFetch & apiClient", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("apiFetch", () => {
    it("should perform a successful GET request and parse JSON", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ message: "hello" }),
      });

      const data = await apiFetch<{ message: string }>("/teams");
      expect(data).toEqual({ message: "hello" });
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/teams",
        expect.objectContaining({
          headers: expect.anything(),
        })
      );
    });

    it("should append query parameters correctly", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify([]),
      });

      await apiFetch("/matches?season=2026", {
        params: {
          search: "Paris",
          page: 1,
          active: true,
          empty: "",
          omitted: undefined,
          nulled: null,
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/matches?season=2026&search=Paris&page=1&active=true",
        expect.any(Object)
      );
    });

    it("should append query parameters when no previous query parameters exist", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify([]),
      });

      await apiFetch("/matches", {
        params: { page: 2 },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/matches?page=2",
        expect.any(Object)
      );
    });

    it("should handle 204 No Content response gracefully", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 204,
      });

      const result = await apiFetch("/teams/1", { method: "DELETE" });
      expect(result).toEqual({});
    });

    it("should handle empty body response gracefully", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => "",
      });

      const result = await apiFetch("/empty");
      expect(result).toEqual({});
    });

    it("should return raw text if JSON parsing fails", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => "Plain text response",
      });

      const result = await apiFetch("/text");
      expect(result).toBe("Plain text response");
    });

    it("should auto-serialize json option and set Content-Type", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        text: async () => JSON.stringify({ id: "10" }),
      });

      await apiFetch("/teams", {
        method: "POST",
        json: { name: "Team 1" },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/teams",
        expect.objectContaining({
          body: JSON.stringify({ name: "Team 1" }),
          headers: expect.anything(),
        })
      );
    });

    it("should set Content-Type if body is a string and header is absent", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => "{}",
      });

      await apiFetch("/custom", {
        method: "POST",
        body: '{"raw":"data"}',
      });

      const callHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers as Headers;
      expect(callHeaders.get("Content-Type")).toBe("application/json");
    });

    it("should not set Content-Type header when body is FormData", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => "{}",
      });

      const formData = new FormData();
      formData.append("file", "fake-file");

      await apiFetch("/upload", {
        method: "POST",
        body: formData,
      });

      const callHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers as Headers;
      expect(callHeaders.get("Content-Type")).toBeNull();
    });

    it("should throw ApiError when response is not ok", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: async () => JSON.stringify({ detail: "Team not found" }),
      });

      await expect(apiFetch("/teams/999")).rejects.toThrow(ApiError);
    });
  });

  describe("apiClient shortcuts", () => {
    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true }),
      });
    });

    it("should call apiFetch with method GET", async () => {
      await apiClient.get("/test");
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should call apiFetch with method POST and json body", async () => {
      await apiClient.post("/test", { a: 1 });
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ a: 1 }),
        })
      );
    });

    it("should call apiFetch with method PUT and json body", async () => {
      await apiClient.put("/test", { b: 2 });
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ b: 2 }),
        })
      );
    });

    it("should call apiFetch with method DELETE", async () => {
      await apiClient.delete("/test");
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });
});
