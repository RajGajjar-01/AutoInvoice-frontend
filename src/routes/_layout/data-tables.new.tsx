import { useSearchParams } from "react-router"
import { CreateTablePage } from "@/components/DataTables/CreateTablePage"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

function RouteComponent() {
  useDocumentTitle("Create Table")
  const [searchParams] = useSearchParams()
  const templateId = searchParams.get("templateId") ?? undefined
  return <CreateTablePage templateId={templateId} />
}

export default RouteComponent
