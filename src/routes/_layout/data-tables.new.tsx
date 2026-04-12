import { createFileRoute } from "@tanstack/react-router"
import { CreateTablePage } from "@/components/DataTables/CreateTablePage"

export const Route = createFileRoute("/_layout/data-tables/new")({
  validateSearch: (s: Record<string, unknown>) =>
    s.templateId ? { templateId: s.templateId as string } : {},
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Create Table" }],
  }),
})

function RouteComponent() {
  const { templateId } = Route.useSearch()
  return <CreateTablePage templateId={templateId} />
}
