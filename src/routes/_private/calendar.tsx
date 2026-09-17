import { createFileRoute } from '@tanstack/react-router'
import { HistoryCalendar } from '#/components/calendar/HistoryCalendar'

export const Route = createFileRoute('/_private/calendar')({
  component: RouteComponent,
})

function RouteComponent() {
  return <HistoryCalendar />
}
