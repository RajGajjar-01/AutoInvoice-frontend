import { Mail } from "lucide-react"
import { useEffect, useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"

interface SendEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultEmail: string
  defaultSubject: string
  defaultMessage: string
  sending: boolean
  onSend: (toEmail: string, subject: string, message: string) => void
}

export function SendEmailDialog({
  open,
  onOpenChange,
  defaultEmail,
  defaultSubject,
  defaultMessage,
  sending,
  onSend,
}: SendEmailDialogProps) {
  const [toEmail, setToEmail] = useState(defaultEmail)
  const [subject, setSubject] = useState(defaultSubject)
  const [message, setMessage] = useState(defaultMessage)

  useEffect(() => {
    if (open) {
      setToEmail(defaultEmail)
      setSubject(defaultSubject)
      setMessage(defaultMessage)
    }
  }, [open, defaultEmail, defaultSubject, defaultMessage])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send via Email</DialogTitle>
          <DialogDescription>
            Sends a PDF copy from your connected Gmail account.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="send-email-to">To</Label>
            <Input
              id="send-email-to"
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="customer@example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="send-email-subject">Subject</Label>
            <Input
              id="send-email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="send-email-message">Message</Label>
            <Textarea
              id="send-email-message"
              rows={4}
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
            loading={sending}
            disabled={!toEmail}
            onClick={() => onSend(toEmail, subject, message)}
          >
            <Mail className="mr-2 h-4 w-4" />
            Send
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
