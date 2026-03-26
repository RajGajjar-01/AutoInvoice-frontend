import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

export const Route = createFileRoute("/_layout/create-challan")({
  component: CreateChallanPage,
  head: () => ({
    meta: [{ title: "Create Delivery Challan" }],
  }),
})

function CreateChallanPage() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate({
      to: "/create-invoice",
      search: { documentType: "challan" },
      replace: true,
    })
  }, [navigate])

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
      <div className="rounded-full bg-muted p-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
          <path d="M15 18H9" />
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.653a1 1 0 0 0-.545-.893l-3.455-1.977" />
          <path d="M11 6h.01" />
          <path d="M11 10h.01" />
          <circle cx="17" cy="18" r="2" />
          <circle cx="7" cy="18" r="2" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Redirecting to delivery challan creation page.
        </p>
      </div>
    </div>
  )
}

export default CreateChallanPage
