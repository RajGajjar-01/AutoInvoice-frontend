import { FlaskConical, RotateCcw, Trash2 } from "lucide-react"
import ChangePassword from "@/components/UserSettings/ChangePassword"
import DeleteAccount from "@/components/UserSettings/DeleteAccount"
import UserInformation from "@/components/UserSettings/UserInformation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { clearDemoData, seedDemoData } from "@/lib/seedDemoData"

// ─── Demo Data Tab ────────────────────────────────────────────────────────────

function DemoDataTab() {
  const { showSuccessToast } = useCustomToast()

  const handleLoad = () => {
    seedDemoData()
    showSuccessToast("Demo data loaded — reloading…")
    setTimeout(() => window.location.reload(), 800)
  }

  const handleClear = () => {
    clearDemoData()
    showSuccessToast("All app data cleared")
  }

  return (
    <div className="flex flex-col gap-4 pt-6">
      {/* Load Demo Data */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <FlaskConical className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Load Demo Data</CardTitle>
              <CardDescription className="text-xs">
                Populate the app with realistic sample customers, items, and
                invoices
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-3">
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>20 customers & suppliers across India (mix of types)</li>
            <li>
              20 items — Electronics, Stationery, Services, Printing, Furniture
            </li>
            <li>25 invoices over 6 months (paid, unpaid, overdue)</li>
            <li>
              4 data tables with realistic row data (Invoice Tracker, Client
              Directory, Expenses, Contracts)
            </li>
            <li>Full stock history for every inventory item</li>
          </ul>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <RotateCcw className="mr-2 h-4 w-4" />
                Load Demo Data
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Load Demo Data?</DialogTitle>
                <DialogDescription>
                  This will <strong>replace all existing data</strong>{" "}
                  (customers, items, invoices) with sample demo data. This
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleLoad}>Load Demo Data</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Clear All Data */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-destructive/10 p-2">
              <Trash2 className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-base text-destructive">
                Clear All App Data
              </CardTitle>
              <CardDescription className="text-xs">
                Permanently delete all customers, items, and invoices from local
                storage
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Clear All App Data?</DialogTitle>
                <DialogDescription>
                  This will permanently delete{" "}
                  <strong>all customers, items, and invoices</strong> from this
                  device. This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive" onClick={handleClear}>
                    Yes, Clear Everything
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Route ────────────────────────────────────────────────────────────────────

import type { ComponentType } from "react"

interface TabConfig {
  value: string
  title: string
  component: ComponentType
}

const tabsConfig: TabConfig[] = [
  { value: "my-profile", title: "My profile", component: UserInformation },
  { value: "password", title: "Password", component: ChangePassword },
  { value: "danger-zone", title: "Danger zone", component: DeleteAccount },
  { value: "demo-data", title: "Demo Data", component: DemoDataTab },
]

function UserSettings() {
  useDocumentTitle("Settings")
  const { user: currentUser } = useAuth()
  const finalTabs = currentUser?.is_superuser
    ? tabsConfig.slice(0, 3)
    : tabsConfig
  if (!currentUser) {
    return null
  }
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="my-profile">
        <TabsList>
          {finalTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {finalTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <tab.component />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default UserSettings
