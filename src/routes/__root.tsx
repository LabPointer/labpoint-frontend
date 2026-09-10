import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
    createRootRouteWithContext,
    HeadContent,
    Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";
import type z from "zod";
import {
    type authSchema,
    getIsAuthenticated,
    getSessionServerFn,
    type sessionSchema,
    setIsAuthenticated,
    setSessionServerFn,
} from "#/lib/server/sign-in";
import { getThemeServerFn, type setThemeValidator } from "#/lib/server/theme";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
    queryClient: QueryClient;
    theme: z.infer<typeof setThemeValidator>;
    sessionInfo: z.infer<typeof sessionSchema>;
    isAuthenticated: z.infer<typeof authSchema>;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    staleTime: 1000 * 60,
    beforeLoad: async () => {
        const theme = (await getThemeServerFn()) as z.infer<
            typeof setThemeValidator
        >;
        const authInfo = await getIsAuthenticated();
        const sessionInfo = await getSessionServerFn();

        if (authInfo) {
            if (sessionInfo) {
                const expireTime = new Date(sessionInfo.expire_in);
                const currentTime = new Date();
                if (expireTime < currentTime) {
                    await setIsAuthenticated({ data: false });
                    await setSessionServerFn({
                        data: {
                            expire_in: "",
                            role: "USER",
                            username: undefined,
                        },
                    });
                }
            }
        }

        return {
            theme,
            sessionInfo: sessionInfo || {
                expire_in: "",
                role: "USER",
                username: undefined,
            },
            isAuthenticated: authInfo,
        };
    },
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            {
                title: "Labpoint",
            },
        ],
        links: [
            {
                rel: "stylesheet",
                href: appCss,
            },
        ],
    }),
    shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
    const { theme } = Route.useRouteContext();

    return (
        <html
            lang="pt-BR"
            className={theme === "light" ? "" : "dark"}
            suppressHydrationWarning
        >
            <head>
                <HeadContent />
            </head>
            <body>
                <Toaster />
                {children}
                <TanStackDevtools
                    config={{
                        position: "bottom-right",
                    }}
                    plugins={[
                        {
                            name: "Tanstack Router",
                            render: <TanStackRouterDevtoolsPanel />,
                        },
                        TanStackQueryDevtools,
                    ]}
                />
                <Scripts />
            </body>
        </html>
    );
}
