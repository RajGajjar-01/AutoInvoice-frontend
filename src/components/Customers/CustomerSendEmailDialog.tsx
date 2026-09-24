import { useMutation, useQuery } from "@tanstack/react-query"
import { Mail } from "lucide-react"
import { useEffect, useState } from "react"
import { CustomersService } from "@/client/sdk.gen"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { companySettingsQueryOptions } from "@/features/company-settings/queries"
import type { adaptInvoiceToUi } from "@/features/invoices/queries"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const NO_ATTACHMENT = "none"

type AdaptedInvoice = NonNullable<ReturnType<typeof adaptInvoiceToUi>>

function defaultGreeting(customerName: string): string {
  return `Dear ${customerName || "Customer"},\n\n`
}

function defaultSignOff(companyName: string): string {
  return `\n\nIf you have any questions, please don't hesitate to reach out.\n\nBest regards,\n${companyName}`
}

function defaultMessageFor(
  customerName: string,
  companyName: string,
  invoice?: AdaptedInvoice,
): string {
  const body = invoice
    ? `Please find attached invoice ${invoice.invoiceNumber} for your review. Kindly process payment at your earliest convenience.`
    : "I hope this message finds you well."
  return defaultGreeting(customerName) + body + defaultSignOff(companyName)
}

interface CustomerSendEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  customerName: string
  defaultEmail: string
  invoices: AdaptedInvoice[]
}

export function CustomerSendEmailDialog({
  open,
  onOpenChange,
  customerId,
  customerName,
  defaultEmail,
  invoices,
}: CustomerSendEmailDialogProps) {
  const { data: companySettings } = useQuery(companySettingsQueryOptions())
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const [toEmail, setToEmail] = useState(defaultEmail)
  const [invoiceId, setInvoiceId] = useState(NO_ATTACHMENT)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  const companyName = companySettings?.name || "AutoInvoice"

  useEffect(() => {
    if (!open) return
    setToEmail(defaultEmail)
    setInvoiceId(NO_ATTACHMENT)
    setSubject(`Message from ${companyName}`)
    setMessage(defaultMessageFor(customerName, companyName))
  }, [open, defaultEmail, companyName, customerName])

  const handleInvoiceChange = (value: string) => {
    setInvoiceId(value)
    const invoice = invoices.find((inv) => inv.id === value)
    setSubject(
      invoice
        ? `Invoice ${invoice.invoiceNumber} from ${companyName}`
        : `Message from ${companyName}`,
    )
    setMessage(defaultMessageFor(customerName, companyName, invoice))
  }

  const sendMutation = useMutation({
    mutationFn: () =>
      CustomersService.sendCustomerEmail({
        id: customerId,
        requestBody: {
          to_email: toEmail,
          subject,
          message,
          invoice_id: invoiceId === NO_ATTACHMENT ? null : invoiceId,
        },
      }),
    onSuccess: () => {
      showSuccessToast("Email sent")
      onOpenChange(false)
    },
    onError: (error) => handleError.call(showErrorToast, error),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>
            Sends from your connected Gmail account.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="cust-email-to">To</Label>
            <Input
              id="cust-email-to"
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="customer@example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cust-email-invoice">Attach invoice</Label>
            <Select value={invoiceId} onValueChange={handleInvoiceChange}>
              <SelectTrigger id="cust-email-invoice">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_ATTACHMENT}>No attachment</SelectItem>
                {invoices.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.invoiceNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cust-email-subject">Subject</Label>
            <Input
              id="cust-email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cust-email-message">Message</Label>
            <Textarea
              id="cust-email-message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message…"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <LoadingButton
            type="button"
            loading={sendMutation.isPending}
            disabled={!toEmail || !message}
            onClick={() => sendMutation.mutate()}
          >
            <Mail className="mr-2 h-4 w-4" />
            Send
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
