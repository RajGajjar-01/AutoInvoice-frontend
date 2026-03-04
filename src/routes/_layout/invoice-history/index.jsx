import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/invoice-history/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/invoice-history/"!</div>
}
