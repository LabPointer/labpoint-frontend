import createClient from "openapi-fetch";
import type { paths } from "~~/shared/types";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:3001/`;
  }
  return "http://localhost:3001/";
};

const client = createClient<paths>({ baseUrl: getBaseUrl() });

export const useFastify = () => client;