import { Match } from "@/types/match.types";
import { apiFetch } from "../api";

export const parserService = {

    parseMatchPDF: (formData: FormData, serverSide: boolean = false, options?: RequestInit) => {
        return apiFetch<Match>("/api/parse", {
            ...options,
            method: "POST",
            serverSide,
            cache: options?.cache || "no-store",
            body: formData,
        });
    },
}