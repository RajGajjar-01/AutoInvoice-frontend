import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Suspense } from "react"
import { ItemDetail } from "@/components/Items/ItemDetail"
import PendingItemDetail from "@/components/Pending/PendingItemDetail"
import useLocalStorage from "@/hooks/useLocalStorage"

export const Route = createFileRoute("/_layout/items/$itemId")({
  component: ItemDetailPage,
  loader: ({ params }) => {
    // We handle the actual data fetch inside the component to use our hook,
    // but we can throw notFound if we want to do strict routing here.
    // For localStorage, it's easier to handle inside the component.
    return { itemId: params.itemId }
  },
  head: () => ({
    meta: [{ title: "Item Details" }],
  }),
})

function ItemDetailContent() {
  const { itemId } = Route.useParams()
  const navigate = useNavigate()
  const [items] = useLocalStorage("items", [])

  const item = items.find((i) => i.id === itemId)

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h3 className="text-xl font-semibold mb-2">Item not found</h3>
        <p className="text-muted-foreground mb-6">
          The item you're looking for doesn't exist or was deleted.
        </p>
        <button
          onClick={() => navigate({ to: "/items" })}
          className="text-primary hover:underline"
        >
          Return to items
        </button>
      </div>
    )
  }

  return <ItemDetail item={item} onDeleted={() => navigate({ to: "/items" })} />
}

function ItemDetailPage() {
  return (
    <Suspense fallback={<PendingItemDetail />}>
      <ItemDetailContent />
    </Suspense>
  )
}
