import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/profile"!</div>
}
