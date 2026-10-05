/**
 * Configuration centralisée de l'API.
 * Utilise le DNS Docker interne côté serveur et l'URL publique côté client.
 */

/** URL de l'API pour les appels côté client (navigateur) */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api";

/** URLs des microservices pour les appels côté serveur (Server Components) */
export const INTERNAL_CORE_URL =
  process.env.CORE_API_URL || "http://localhost:8080";

export const INTERNAL_PARSER_URL =
  process.env.PARSER_API_URL || "http://localhost:8081";

/**
 * Fetch wrapper avec gestion d'erreurs de base.
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit & { serverSide?: boolean }
): Promise<T> {
  const { serverSide = false, ...fetchOptions } = options || {};
  let baseUrl = API_BASE_URL;

  if (serverSide) {
    // Routage manuel des microservices pour les Server Components
    if (endpoint.startsWith("/parse") || endpoint.startsWith("/api/parse")) {
      baseUrl = INTERNAL_PARSER_URL;
    } else {
      baseUrl = INTERNAL_CORE_URL;
    }
  }

  // Évite de faire /api/api/parse si l'endpoint contient déjà /api
  if (!serverSide && endpoint.startsWith("/api")) {
    baseUrl = "";
  }

  // Nettoyage des slashs (évite //)
  const url = `${baseUrl}${endpoint}`.replace(/([^:])(\/\/+)/g, "$1/");

  const isFormData = fetchOptions.body instanceof FormData;

  const headers = new Headers(fetchOptions.headers);
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const message = await res.json();
    throw new Error(`API Error ${res.status}: ${res.statusText}\n - Message: ${message}`);
  }

  const text = await res.text();
  if (!text) {
    return {} as T;
  }
  return JSON.parse(text) as T;
}
