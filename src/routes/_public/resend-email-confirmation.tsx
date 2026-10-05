import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/resend-email-confirmation')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_public/resend-email-confirmation"!</div>
}
