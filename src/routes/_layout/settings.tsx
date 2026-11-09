import type { Icon as LucideIcon } from "@phosphor-icons/react"
import {
  CaretRight as ChevronRight,
  LockKey as LockKeyhole,
  SignOut as LogOut,
  Monitor,
  Moon,
  Palette,
  Sun,
  Trash as Trash2,
  User as UserRound,
} from "@phosphor-icons/react"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import { useTheme } from "@/components/theme-provider"
import ChangePassword from "@/components/UserSettings/ChangePassword"
import DeleteAccount from "@/components/UserSettings/DeleteAccount"
import GoogleIntegration from "@/components/UserSettings/GoogleIntegration"
import UserInformation from "@/components/UserSettings/UserInformation"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { getInitials } from "@/utils"

const panels = {
  integrations: {
    title: "Integrations",
    description: "Connect your Google account and manage linked services.",
    component: GoogleIntegration,
  },
  profile: {
    title: "My profile",
    description: "Manage your name and email address.",
    component: UserInformation,
  },
  password: {
    title: "Password",
    description: "Keep your account secure with a strong password.",
    component: ChangePassword,
  },
  delete: {
    title: "Delete account",
    description: "Review what happens before deleting your account.",
    component: DeleteAccount,
  },
}
const themes = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
]

function SettingsRow({
  icon: Icon,
  label,
  description,
  value,
  danger,
  onClick,
}: {
  icon: LucideIcon
  label: string
  description: string
  value?: string
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-18 w-full items-center gap-3 px-4 py-3 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring active:bg-muted"
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl ${danger ? "bg-destructive/10 text-destructive" : "bg-primary/15 text-foreground"}`}
      >
        <Icon size={19} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm font-medium ${danger ? "text-destructive" : ""}`}
        >
          {label}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
      {value && <span className="text-xs text-muted-foreground">{value}</span>}
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </button>
  )
}
function SettingsGroup({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-xs font-semibold text-muted-foreground">
        {title}
      </h2>
      <div className="divide-y overflow-hidden rounded-2xl border bg-card">
        {children}
      </div>
    </section>
  )
}
function UserSettings() {
  useDocumentTitle("Settings")
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [searchParams, setSearchParams] = useSearchParams()
  useEffect(() => {
    const status = searchParams.get("google")
    if (!status) return
    if (status === "connected") showSuccessToast("Google account connected")
    else if (status === "already_linked")
      showErrorToast("That Google account is already linked to another user.")
    else if (status === "error")
      showErrorToast("Could not connect your Google account. Please try again.")
    setSearchParams(
      (prev) => {
        prev.delete("google")
        return prev
      },
      { replace: true },
    )
  }, [searchParams, setSearchParams, showSuccessToast, showErrorToast])
  const { user, logout } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [panel, setPanel] = useState<
    keyof typeof panels | "theme" | "logout" | null
  >(null)
  if (!user) return null
  const active =
    panel && panel in panels ? panels[panel as keyof typeof panels] : undefined
  const Panel = active?.component
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header>
        <h1 className="max-md:sr-only text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A workspace that feels like yours.
        </p>
      </header>
      <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
          {getInitials(user.full_name || user.email)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold">
            {user.full_name || "Your account"}
          </p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {user.is_superuser ? "Administrator" : "Personal account"}
          </p>
        </div>
      </div>
      <SettingsGroup title="Account">
        <SettingsRow
          icon={UserRound}
          label="My profile"
          description="Name and email address"
          onClick={() => setPanel("profile")}
        />
        <SettingsRow
          icon={LockKeyhole}
          label="Password"
          description="Update your account password"
          onClick={() => setPanel("password")}
        />
      </SettingsGroup>
      <SettingsGroup title="Connections">
        <SettingsRow
          icon={LockKeyhole}
          label="Integrations"
          description="Google account and connected services"
          onClick={() => setPanel("integrations")}
        />
      </SettingsGroup>
      <SettingsGroup title="Preferences">
        <SettingsRow
          icon={Palette}
          label="Appearance"
          description="Choose how AutoInvoice looks"
          value={themes.find((t) => t.value === theme)?.label}
          onClick={() => setPanel("theme")}
        />
      </SettingsGroup>
      <SettingsGroup title="Account actions">
        <SettingsRow
          icon={LogOut}
          label="Log out"
          description="Sign out on this device"
          onClick={() => setPanel("logout")}
        />
        <SettingsRow
          icon={Trash2}
          label="Delete account"
          description="Permanently remove your account"
          danger
          onClick={() => setPanel("delete")}
        />
      </SettingsGroup>
      <p className="pb-2 text-center text-xs text-muted-foreground">
        AutoInvoice · Your business, organized
      </p>
      <Drawer
        showSwipeHandle
        open={panel !== null}
        onOpenChange={(open) => {
          if (!open) setPanel(null)
        }}
      >
        <DrawerContent className="mx-auto w-full max-w-2xl rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <DrawerHeader className="px-5 pb-4 pt-2 text-left">
            <DrawerTitle>
              {active?.title || (panel === "theme" ? "Appearance" : "Log out?")}
            </DrawerTitle>
            <DrawerDescription>
              {active?.description ||
                (panel === "theme"
                  ? "Choose a theme or follow your device settings."
                  : "You can sign back in whenever you’re ready.")}
            </DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">
            {Panel && <Panel />}
            {panel === "theme" && (
              <fieldset className="space-y-2">
                <legend className="sr-only">Appearance</legend>
                {themes.map(({ value, label, icon: Icon }) => (
                  <label
                    key={value}
                    className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border px-4 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring ${theme === value ? "border-primary bg-primary/10" : "hover:bg-muted"}`}
                  >
                    <Icon size={20} aria-hidden="true" />
                    <span className="flex-1 text-sm font-medium">
                      {label}
                      {value === "system" && (
                        <span className="block text-xs font-normal text-muted-foreground">
                          Currently {resolvedTheme}
                        </span>
                      )}
                    </span>
                    <input
                      type="radio"
                      name="appearance"
                      value={value}
                      checked={theme === value}
                      onChange={() => setTheme(value)}
                      className="size-5 accent-primary"
                    />
                  </label>
                ))}
              </fieldset>
            )}
            {panel === "logout" && (
              <div className="flex flex-col gap-2">
                <Button onClick={() => setPanel(null)}>Stay signed in</Button>
                <Button
                  variant="ghost"
                  className="text-destructive"
                  onClick={logout}
                >
                  Log out
                </Button>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default UserSettings
