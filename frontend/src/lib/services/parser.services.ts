import { Match } from "@/types/match.types";
import { apiFetch, type ApiFetchOptions } from "../api";

export const parserService = {
  parseMatchPDF: (
    formData: FormData,
    options?: Omit<ApiFetchOptions, "body" | "target">
  ) => {
    return apiFetch<Match>("/api/parse", {
      target: "parser",
      method: "POST",
      body: formData,
      cache: "no-store",
      ...options,
    });
  },
};