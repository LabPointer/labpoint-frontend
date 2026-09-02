import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_public')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <Outlet />
    </main>
    </>
  )
}
