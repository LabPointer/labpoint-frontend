import { createFileRoute } from '@tanstack/react-router'
import { ForgetPasswordForm } from '@/components/ForgetPasswordForm'

export const Route = createFileRoute('/_public/forget-password')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ForgetPasswordForm />
}
