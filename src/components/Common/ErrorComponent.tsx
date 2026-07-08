import { AlertTriangle, Home, RefreshCw } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"

const ErrorComponent = () => {
  return (
    <div
      className="flex min-h-screen items-center justify-center flex-col p-4"
      data-testid="error-component"
    >
      <div className="flex flex-col items-center text-center max-w-md animate-in">
        <div className="rounded-full bg-destructive/10 p-5 mb-6">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Error</h1>
        <p className="text-lg text-muted-foreground mb-2">
          Something went wrong
        </p>
        <p className="text-sm text-muted-foreground mb-8 max-w-xs">
          An unexpected error occurred. Please try again or return to the
          homepage.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Link to="/">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
export default ErrorComponent
