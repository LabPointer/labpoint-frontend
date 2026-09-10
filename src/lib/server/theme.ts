import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import * as z from "zod";

const storageKey = "app-theme";
export const getThemeServerFn = createServerFn().handler(
	() => getCookie(storageKey) ?? "light",
);
export const setThemeValidator = z.enum(["light", "dark"]);
export const setThemeServerFn = createServerFn()
	.validator(setThemeValidator)
	.handler(({ data }) => setCookie(storageKey, data));
