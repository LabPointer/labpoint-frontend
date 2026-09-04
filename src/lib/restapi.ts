import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./api";

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
    if (
      response.status === 401 && 
      !request.url.includes("/auth/sign-in") && 
      !request.url.includes("/auth/sign-out")
    ) {
      try {
        await client.POST("/auth/sign-out");
      } catch (err) {
        console.error("Error signing out in 401:", err);
      }
      if (typeof window !== "undefined" && window.location.pathname !== "/sign-in") {
        window.location.href = "/sign-in";
      }
    }
    return response;
  },
};
client.use(authMiddleware);

export const useApi = () => client;