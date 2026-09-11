import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import z from "zod";
import { UserRole } from "@/lib/service";

const sessionStorageKey = "session-info";

export const sessionSchema = z.object({
	username: z.string().optional(),
    role: UserRole,
});

export const getSessionServerFn = createServerFn().handler(() => {
	const base64Session = getCookie(sessionStorageKey);
	const session = base64Session ? atob(base64Session) : undefined;
	
	const result = sessionSchema.safeParse(JSON.parse(session || "{}"));
	return result.success ? result.data : undefined;
})

export const setSessionServerFn = createServerFn().validator(sessionSchema)
	.handler(({ data }) => {
		setCookie(sessionStorageKey, btoa(JSON.stringify(data)));
	});

const authStorageKey = "is-authenticated";

export const authSchema = z.boolean().default(false);

export const getIsAuthenticated = createServerFn().handler(() => {
	const isAuth = getCookie(authStorageKey);
	const result = authSchema.safeParse(isAuth ? isAuth.toString().toLowerCase() === "true" : false);
	return result.success ? result.data : false;
})

export const setIsAuthenticated = createServerFn().validator(authSchema)
	.handler(({ data }) => {
		setCookie(authStorageKey, data.toString());
	});