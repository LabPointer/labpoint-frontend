import { createFileRoute } from '@tanstack/react-router'
import { Pattern } from '#/components/examples/c-event-calendar-1'

export const Route = createFileRoute('/_private/calendar')({
  component: RouteComponent,
})

function RouteComponent() {
  {/*Implementar o calendario histórico aqui*/ }
  return <Pattern />
}
