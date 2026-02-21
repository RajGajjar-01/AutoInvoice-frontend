import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import useAuth from "@/hooks/useAuth"

export function DangerZonePanel() {
  const { user, logout } = useAuth()
  const [deleteInput, setDeleteInput] = useState("")
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleExport = () => {
    toast.success("Export requested. You'll receive a download link by email.")
  }

  const handleDeactivate = () => {
    // TODO: connect to API — deactivate account endpoint
    toast.success("Account deactivated. Log in again to reactivate.")
  }

  const handleDeleteConfirm = () => {
    // TODO: connect to API — UsersService.deleteUserMe()
    toast.error("Account deleted.")
    logout()
  }

  const emailMatches = deleteInput.trim() === (user?.email ?? "")

  return (
    <div className="flex flex-col gap-8">
      {/* ── Export Data ───────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">Export My Data</p>
        <Separator />
        <p className="text-sm text-muted-foreground max-w-md">
          Download all your data including invoices, tables, and settings as a
          ZIP file.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={handleExport}
        >
          Export Data
        </Button>
      </div>

      {/* ── Deactivate ────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">Deactivate Account</p>
        <Separator />
        <p className="text-sm text-muted-foreground max-w-md">
          Temporarily disable your account. You can reactivate by logging back
          in.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="self-start border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            >
              Deactivate Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate account?</AlertDialogTitle>
              <AlertDialogDescription>
                Your account will be temporarily disabled. Log in again to
                reactivate.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeactivate}>
                Deactivate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* ── Delete Account ────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-destructive">Delete Account</p>
        <Separator className="bg-destructive/20" />
        <p className="text-sm text-muted-foreground max-w-md">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>

        <AlertDialog
          open={deleteOpen}
          onOpenChange={(o) => {
            setDeleteOpen(o)
            if (!o) setDeleteInput("")
          }}
        >
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="self-start">
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Permanently delete account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your account and all associated
                data.
                <strong> This action cannot be undone.</strong>
                <br />
                <br />
                Type your email address{" "}
                <span className="font-mono font-semibold text-foreground">
                  {user?.email}
                </span>{" "}
                below to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Input
              placeholder={user?.email}
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
            />

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={!emailMatches}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40"
                onClick={handleDeleteConfirm}
              >
                Delete permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default DangerZonePanel
