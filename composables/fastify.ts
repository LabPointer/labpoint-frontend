import createClient from "openapi-fetch";
import type { paths } from "~~/types";

const client = createClient<paths>({ baseUrl: "http://192.168.1.3:3001/" });

export const useFastify = () => client;