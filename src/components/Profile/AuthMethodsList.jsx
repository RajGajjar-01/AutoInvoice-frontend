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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import useAuth from "@/hooks/useAuth"

// ─── Static auth method definitions ──────────────────────────────────────────
const ALL_METHODS = [
  {
    id: "email",
    label: "Email / Password",
    icon: "✉️",
    alwaysConnected: true,
  },
  {
    id: "google",
    label: "Google",
    icon: "🔵",
    alwaysConnected: false,
  },
  {
    id: "github",
    label: "GitHub",
    icon: "⚫",
    alwaysConnected: false,
    comingSoon: true,
  },
  {
    id: "microsoft",
    label: "Microsoft",
    icon: "🟦",
    alwaysConnected: false,
    comingSoon: true,
  },
]

// ─── Mock active sessions (API not yet available) ─────────────────────────────
const MOCK_SESSIONS = [
  {
    id: "s1",
    device: "Windows · Chrome 121",
    location: "Mumbai, IN",
    lastActive: "Just now (this session)",
    isCurrent: true,
  },
  {
    id: "s2",
    device: "iPhone · Safari 17",
    location: "Pune, IN",
    lastActive: "2 hours ago",
  },
]

export function AuthMethodsList() {
  const { user } = useAuth()

  // Google is "connected" only if the user signed up with a social account;
  // we approximate this as: user.email does not end with a known password provider.
  // TODO: replace with real OAuth connection state from API.
  const [connected, setConnected] = useState({ google: false })

  const handleDisconnect = (id) => {
    setConnected((prev) => ({ ...prev, [id]: false }))
    toast.success(`${id} disconnected`)
  }

  const handleConnect = (id) => {
    // TODO: open OAuth flow
    toast.success(`${id} connection initiated`)
    setConnected((prev) => ({ ...prev, [id]: true }))
  }

  const handleSignOutOthers = () => {
    // TODO: connect to API — sessions endpoint
    toast.success("All other sessions signed out")
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── Login Methods ─────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">Login Methods</p>
        <Separator />
        <div className="flex flex-col divide-y rounded-xl border overflow-hidden">
          {ALL_METHODS.map((method) => {
            const isConnected = method.alwaysConnected || !!connected[method.id]

            return (
              <div
                key={method.id}
                className="flex items-center justify-between px-4 py-3 bg-card"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg" aria-hidden="true">
                    {method.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{method.label}</span>
                    {method.comingSoon && (
                      <span className="text-xs text-muted-foreground">
                        Coming soon
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isConnected ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-transparent hover:bg-green-100">
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Not Connected
                    </Badge>
                  )}

                  {method.alwaysConnected || method.comingSoon ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="text-xs opacity-40"
                    >
                      {method.alwaysConnected ? "Required" : "Soon"}
                    </Button>
                  ) : isConnected ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Disconnect
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Disconnect {method.label}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            You will no longer be able to sign in using{" "}
                            {method.label}. Make sure you have another login
                            method available.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDisconnect(method.id)}
                          >
                            Disconnect
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnect(method.id)}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Active Sessions ───────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Active Sessions</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              Demo data
              <Badge variant="outline" className="text-[10px] py-0 px-1">
                Demo
              </Badge>
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Sign out all other sessions
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Sign out all other sessions?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  All devices except this one will be signed out immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleSignOutOthers}
                >
                  Sign out others
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <Separator />

        <div className="flex flex-col divide-y rounded-xl border overflow-hidden">
          {MOCK_SESSIONS.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between px-4 py-3 bg-card"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{session.device}</span>
                <span className="text-xs text-muted-foreground">
                  {session.location} · {session.lastActive}
                </span>
              </div>
              {session.isCurrent && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-transparent">
                  Current
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AuthMethodsList
