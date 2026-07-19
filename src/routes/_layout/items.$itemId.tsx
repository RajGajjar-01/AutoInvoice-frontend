import { useQuery } from "@tanstack/react-query"
import { Suspense } from "react"
import { type LoaderFunctionArgs, useNavigate, useParams } from "react-router"
import {
  ItemDetail,
  type Item as ItemDetailItem,
} from "@/components/Items/ItemDetail"
import PendingItemDetail from "@/components/Pending/PendingItemDetail"
import { itemDetailQueryOptions } from "@/features/items/queries"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

export function loader({ params }: LoaderFunctionArgs) {
  return { itemId: params.itemId }
}

function ItemDetailContent() {
  const { itemId } = useParams<{ itemId: string }>()
  const navigate = useNavigate()
  const { data: item } = useQuery(itemDetailQueryOptions(itemId))

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h3 className="text-xl font-semibold mb-2">Item not found</h3>
        <p className="text-muted-foreground mb-6">
          The item you're looking for doesn't exist or was deleted.
        </p>
        <button
          onClick={() => navigate("/items")}
          className="text-primary hover:underline"
        >
          Return to items
        </button>
      </div>
    )
  }

  return (
    <ItemDetail
      item={item as unknown as ItemDetailItem}
      onDeleted={() => navigate("/items")}
    />
  )
}

function ItemDetailPage() {
  useDocumentTitle("Item Details")
  return (
    <Suspense fallback={<PendingItemDetail />}>
      <ItemDetailContent />
    </Suspense>
  )
}

export default ItemDetailPage
