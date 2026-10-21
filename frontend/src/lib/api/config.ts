export const isServer = typeof window === "undefined";

export const API_CONFIG = {
  // Côté navigateur (utilise le proxy de Next.js)
  clientBaseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",

  // Côté serveur (Server Components, SSR, Server Actions)
  serverCoreUrl: process.env.CORE_API_URL || "http://localhost:8080",
  serverParserUrl: process.env.PARSER_API_URL || "http://localhost:8000",
} as const;

export type ApiServiceTarget = "core" | "parser";

/**
 * Résout automatiquement l'URL selon l'environnement d'exécution (Serveur ou Navigateur).
 */
export function resolveApiUrl(endpoint: string, target: ApiServiceTarget = "core"): string {
  if (isServer) {
    const base = target === "parser" ? API_CONFIG.serverParserUrl : API_CONFIG.serverCoreUrl;
    let cleanEndpoint = endpoint;
    if (target === "core" && cleanEndpoint.startsWith("/api/")) {
      cleanEndpoint = cleanEndpoint.replace(/^\/api/, "");
    }
    return `${base.replace(/\/+$/, "")}/${cleanEndpoint.replace(/^\/+/, "")}`;
  }

  // Côté navigateur : passe par les rewrites /api/... de Next.js
  let cleanEndpoint = endpoint;
  if (!cleanEndpoint.startsWith("/api")) {
    cleanEndpoint = `/api/${cleanEndpoint.replace(/^\/+/, "")}`;
  }
  return cleanEndpoint;
}
