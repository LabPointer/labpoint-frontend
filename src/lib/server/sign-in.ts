import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import z from "zod";
import { UserRole } from "@/lib/service";

const sessionStorageKey = "session-info";

export const sessionSchema = z.object({
	username: z.string().optional(),
    role: z.union([UserRole, z.literal("")]),
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