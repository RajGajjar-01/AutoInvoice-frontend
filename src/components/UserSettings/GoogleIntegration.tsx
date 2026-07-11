import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Mail } from "lucide-react"
import { GoogleService } from "@/client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { Separator } from "@/components/ui/separator"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const GoogleIntegration = () => {
  const queryClient = useQueryClient()
  const { showErrorToast } = useCustomToast()

  const { data: status, isLoading } = useQuery({
    queryKey: ["googleStatus"],
    queryFn: () => GoogleService.googleStatus(),
  })

  const connectMutation = useMutation({
    mutationFn: () => GoogleService.connectGoogle(),
    onSuccess: (data) => {
      window.location.href = data.url
    },
    onError: handleError.bind(showErrorToast),
  })

  const disconnectMutation = useMutation({
    mutationFn: () => GoogleService.disconnectGoogle(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["googleStatus"] })
    },
    onError: handleError.bind(showErrorToast),
  })

  const connected = status?.connected ?? false

  return (
    <div className="flex flex-col gap-4 pt-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">
                Send invoices with Gmail
              </CardTitle>
              <CardDescription className="text-xs">
                Connect your Google account so invoice emails are sent from your
                own Gmail address instead of a shared inbox
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Checking status…</p>
          ) : connected ? (
            <>
              <p className="text-sm">
                Connected as{" "}
                <span className="font-medium">{status?.email}</span>
              </p>
              <LoadingButton
                variant="outline"
                loading={disconnectMutation.isPending}
                onClick={() => disconnectMutation.mutate()}
              >
                Disconnect Google Account
              </LoadingButton>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Not connected. You need to connect a Google account before you
                can email invoices to customers.
              </p>
              <LoadingButton
                loading={connectMutation.isPending}
                onClick={() => connectMutation.mutate()}
              >
                Connect Google Account
              </LoadingButton>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default GoogleIntegration
