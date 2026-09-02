import { SignInForm } from '#/components/SignInForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/')({ component: Home })

function Home() {
  return (
    <SignInForm />
  )
}
