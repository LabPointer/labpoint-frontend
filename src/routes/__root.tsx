import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";
import type z from "zod";
import {
  getSessionServerFn,
  type sessionSchema,
} from "#/lib/server/sign-in";
import { getThemeServerFn, type setThemeValidator } from "#/lib/server/theme";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
  theme: z.infer<typeof setThemeValidator>;
  sessionInfo: z.infer<typeof sessionSchema> | undefined;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    const theme = (await getThemeServerFn()) as z.infer<typeof setThemeValidator>;

    const sessionInfo = await getSessionServerFn();

    /*
    if (sessionInfo) {
      await setSessionServerFn({
        data: {
          username: undefined,
          role: "",
        },
      });
    }
    */

    return {
      theme,
      sessionInfo
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
    <html lang="pt-BR" className={theme === "light" ? "" : "dark"} suppressHydrationWarning>
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
