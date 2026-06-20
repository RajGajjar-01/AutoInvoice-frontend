import { Suspense } from "react"
import { useNavigate, useParams, type LoaderFunctionArgs } from "react-router"
import { ItemDetail, type Item as ItemDetailItem } from "@/components/Items/ItemDetail"
import PendingItemDetail from "@/components/Pending/PendingItemDetail"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import useLocalStorage from "@/hooks/useLocalStorage"

export function loader({ params }: LoaderFunctionArgs) {
  // We handle the actual data fetch inside the component to use our hook,
  // but we can throw notFound if we want to do strict routing here.
  // For localStorage, it's easier to handle inside the component.
  return { itemId: params.itemId }
}

function ItemDetailContent() {
  const { itemId } = useParams<{ itemId: string }>()
  const navigate = useNavigate()
  const [items] = useLocalStorage<ItemDetailItem[]>("items", [])

  const item = items.find((i) => i.id === itemId)

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

  return <ItemDetail item={item} onDeleted={() => navigate("/items")} />
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
