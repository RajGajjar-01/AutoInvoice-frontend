import { useEffect } from "react"
import { useSearchParams } from "react-router"
import ChangePassword from "@/components/UserSettings/ChangePassword"
import DeleteAccount from "@/components/UserSettings/DeleteAccount"
import GoogleIntegration from "@/components/UserSettings/GoogleIntegration"
import UserInformation from "@/components/UserSettings/UserInformation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

// ─── Route ────────────────────────────────────────────────────────────────────

import type { ComponentType } from "react"

interface TabConfig {
  value: string
  title: string
  component: ComponentType
}

const tabsConfig: TabConfig[] = [
  { value: "my-profile", title: "My profile", component: UserInformation },
  {
    value: "integrations",
    title: "Integrations",
    component: GoogleIntegration,
  },
  { value: "password", title: "Password", component: ChangePassword },
  { value: "danger-zone", title: "Danger zone", component: DeleteAccount },
]

function UserSettings() {
  useDocumentTitle("Settings")
  const { user: currentUser } = useAuth()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const finalTabs = currentUser?.is_superuser
    ? tabsConfig.slice(0, 4)
    : tabsConfig

  useEffect(() => {
    const googleStatus = searchParams.get("google")
    if (!googleStatus) return
    if (googleStatus === "connected") {
      showSuccessToast("Google account connected")
    } else if (googleStatus === "error") {
      showErrorToast("Could not connect your Google account. Please try again.")
    }
    setSearchParams(
      (prev) => {
        prev.delete("google")
        return prev
      },
      { replace: true },
    )
  }, [searchParams, setSearchParams, showSuccessToast, showErrorToast])

  if (!currentUser) {
    return null
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="animate-in">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          User Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="my-profile" className="animate-in animate-in-delay-1">
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
