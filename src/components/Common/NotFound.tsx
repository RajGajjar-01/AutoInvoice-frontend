import { Home, Search } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"

const NotFound = () => {
  return (
    <div
      className="flex min-h-screen items-center justify-center flex-col p-4"
      data-testid="not-found"
    >
      <div className="flex flex-col items-center text-center max-w-md animate-in">
        <div className="rounded-full bg-muted p-5 mb-6">
          <Search className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-7xl font-bold tracking-tight mb-1">404</h1>
        <p className="text-xl font-semibold mb-2">Page not found</p>
        <p className="text-sm text-muted-foreground mb-8 max-w-xs">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3">
          <Link to="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
export default NotFound
