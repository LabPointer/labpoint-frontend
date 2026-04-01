import createClient from "openapi-fetch";
import type { paths } from "~~/types";

const client = createClient<paths>({ baseUrl: "http://localhost:3001/" });

export const useFastify = () => client;