import { useEffect } from "react"
import { useNavigate } from "react-router"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

function CreateQuotationPage() {
  useDocumentTitle("Create Quotation")
  const navigate = useNavigate()

  useEffect(() => {
    navigate(`/create-invoice?documentType=quotation`, { replace: true })
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
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
          <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Redirecting to quotation creation page.
        </p>
      </div>
    </div>
  )
}

export default CreateQuotationPage
