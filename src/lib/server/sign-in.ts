import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import z from "zod";
import { UserRole } from "@/lib/service";

const sessionStorageKey = "auth-info";

export const sessionSchema = z.object({
	username: z.string(),
	registration: z.string(),
    roles: z.array(z.union([UserRole, z.literal("")])),
});

export const getSessionServerFn = createServerFn().handler(() => {
	const encodedSession = getCookie(sessionStorageKey);
	const session = encodedSession ? decodeURIComponent(encodedSession) : undefined;
	
	const result = sessionSchema.safeParse(JSON.parse(session || "{}"));
	return result.success ? result.data : undefined;
})

export const setSessionServerFn = createServerFn().validator(sessionSchema)
	.handler(({ data }) => {
		setCookie(sessionStorageKey, btoa(JSON.stringify(data)));
	});