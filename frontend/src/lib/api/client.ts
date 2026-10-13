import { ApiError } from "./errors";
import { resolveApiUrl, type ApiServiceTarget } from "./config";

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  target?: ApiServiceTarget;
  params?: Record<string, string | number | boolean | undefined | null>;
  json?: unknown;
  body?: BodyInit | null;
}

/**
 * Client HTTP Fetch isomorphe unifié pour Next.js (App Router).
 * Détecte automatiquement l'environnement Serveur ou Client sans nécessiter de flag manuel.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { target = "core", params, json, headers: customHeaders, body, ...fetchOptions } = options;

  let url = resolveApiUrl(endpoint, target);

  // Ajout des query parameters si fournis
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const isFormData = body instanceof FormData;
  const headers = new Headers(customHeaders);

  let requestBody = body;
  if (json !== undefined) {
    requestBody = JSON.stringify(json);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  } else if (!isFormData && requestBody && typeof requestBody === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...fetchOptions,
    body: requestBody,
    headers,
  });

  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }

  // 204 No Content ou corps vide
  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

/**
 * Interface pratique pour des appels API concis.
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: Omit<ApiFetchOptions, "method" | "json" | "body">) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, json?: unknown, options?: Omit<ApiFetchOptions, "method" | "json">) =>
    apiFetch<T>(endpoint, { ...options, method: "POST", json }),

  put: <T>(endpoint: string, json?: unknown, options?: Omit<ApiFetchOptions, "method" | "json">) =>
    apiFetch<T>(endpoint, { ...options, method: "PUT", json }),

  delete: <T>(endpoint: string, options?: Omit<ApiFetchOptions, "method" | "json" | "body">) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};
