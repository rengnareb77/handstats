/**
 * Configuration centralisée de l'API.
 * Utilise le DNS Docker interne côté serveur et l'URL publique côté client.
 */

/** URL de l'API pour les appels côté client (navigateur) */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

/** URL de l'API pour les appels côté serveur (Server Components / Route Handlers) */
export const INTERNAL_API_URL =
  process.env.CORE_API_URL || "http://core-api:8080/api";

/**
 * Fetch wrapper avec gestion d'erreurs de base.
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit & { serverSide?: boolean }
): Promise<T> {
  const { serverSide = false, ...fetchOptions } = options || {};
  const baseUrl = serverSide ? INTERNAL_API_URL : API_BASE_URL;

  const res = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  });

  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}
