import createClient, { type Middleware } from "openapi-fetch";
import type { components, paths } from "./api";

/**
 * Endereço da API.
 * - Dev (navegador): http(s)://<host da página>:8080, como antes.
 * - Produção (navegador): "/api" no próprio domínio do front. A Vercel repassa para o backend (ver vercel.json),
 *   então os cookies de login são do mesmo site do front, sem depender de cookie de terceiros nem de CORS.
 * - Servidor (SSR): VITE_API_URL (URL do backend, ex.: https://labpoint-backend.onrender.com) ou localhost:8080.
 */
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return import.meta.env.DEV
      ? `${window.location.protocol}//${window.location.hostname}:8080`
      : `${window.location.origin}/api`;
  }
  return import.meta.env.VITE_API_URL ?? "http://localhost:8080";
};

const client = createClient<paths>({ 
  baseUrl: getBaseUrl(),
  credentials: "include"
});

const authMiddleware: Middleware = {
  async onResponse({ response, request }) {
    const isAuthRequest =
      request.url.includes("/auth/sign-in") ||
      request.url.includes("/auth/sign-out");
    let shouldLogout = (response.status === 401 || response.status === 403) && !isAuthRequest;

    if (!shouldLogout && response.status >= 400) {
      try {
        const error = (await response.clone().json()) as Partial<
          components["schemas"]["ErroResponseDTO"]
        >;
        shouldLogout = error.logout === true;
      } catch {
        // The response may not contain a JSON error body.
      }
    }

    if (shouldLogout && !isAuthRequest) {
      try {
        await client.POST("/auth/sign-out");
        console.error("User logged out due to unauthorized access.");
      } catch (err) {
        console.error("Error signing out:", err);
      }
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return response;
  },
};
client.use(authMiddleware);

/** Cliente tipado (singleton). Prefira importar `api` direto: não é um hook. */
export const api = client;

/** @deprecated mantido por compatibilidade; use `api`. */
export const useApi = () => client;
