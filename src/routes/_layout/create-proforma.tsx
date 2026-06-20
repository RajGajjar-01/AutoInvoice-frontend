import { useEffect } from "react"
import { useNavigate } from "react-router"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

function CreateProformaPage() {
  useDocumentTitle("Create Proforma Invoice")
  const navigate = useNavigate()

  useEffect(() => {
    navigate(`/create-invoice?documentType=proforma`, { replace: true })
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
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M10 9H8" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Redirecting to proforma invoice creation page.
        </p>
      </div>
    </div>
  )
}

export default CreateProformaPage
