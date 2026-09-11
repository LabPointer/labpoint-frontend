import createClient, { type Middleware } from "openapi-fetch";
import type { components, paths } from "./api";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return "http://localhost:3001";
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
        console.log("User logged out due to unauthorized access.");
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

export const useApi = () => client;