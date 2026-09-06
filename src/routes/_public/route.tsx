import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_public")({
    beforeLoad: async ({ context }) => {
        const { isAuthenticated } = context;
        if (isAuthenticated) {
            throw redirect({ to: "/home" });
        }
    },
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <>
            <main className="flex min-h-screen flex-col items-center justify-center px-6">
                <Outlet />
            </main>
        </>
    );
}
