import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/admin/report')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="text-red-500 w-full text-center">Indisponivel</div>
}
