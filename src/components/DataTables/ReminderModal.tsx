import { zodResolver } from "@hookform/resolvers/zod"
import { Bell, Mail, Phone } from "lucide-react"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { useRevalidator } from "react-router"
import { toast } from "sonner"
import { z } from "zod"
import { TablesService } from "@/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useAuth from "@/hooks/useAuth"

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const reminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date and time is required"),
  notificationType: z.enum(["App", "Email", "WhatsApp"]),
})

type FormValues = z.infer<typeof reminderSchema>

interface ReminderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tableId: string
  rowId: string | null
  rowLabel: string
}

/**
 * Props:
 *   open          – boolean
 *   onOpenChange  – (open: boolean) => void
 *   tableId       – string
 *   rowId         – string
 *   rowLabel      – string  (first text cell value or "Row #n")
 */
export function ReminderModal({
  open,
  onOpenChange,
  tableId,
  rowId,
  rowLabel,
}: ReminderModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(reminderSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      date: "",
      notificationType: "App",
    },
  })

  // Reset on open
  useEffect(() => {
    if (open) {
      form.reset({
        title: "",
        description: "",
        date: "",
        notificationType: "App",
      })
    }
  }, [open, form])

  const { isSubmitting } = form.formState
  const { revalidate } = useRevalidator()
  const { user } = useAuth()
  const gmailConnected = user?.google_connected ?? false

  const onSubmit = async (data: FormValues) => {
    if (!rowId) return
    try {
      await TablesService.createTableReminder({
        tableId,
        requestBody: {
          reminder_data: {
            row_id: rowId,
            title: data.title,
            description: data.description ?? "",
            date: data.date,
            notificationType: data.notificationType,
          },
        },
      })
      revalidate()
      toast.success("Reminder set successfully")
      onOpenChange(false)
    } catch {
      toast.error("Failed to set reminder")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Reminder</DialogTitle>
          <DialogDescription>
            Setting reminder for row:{" "}
            <span className="font-medium text-foreground">{rowLabel}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Title <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Reminder title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      placeholder="Optional notes…"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date & Time */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reminder Date &amp; Time{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notification Type — Tabs */}
            <Controller
              control={form.control}
              name="notificationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notify via</FormLabel>
                  <FormControl>
                    <Tabs
                      value={field.value}
                      onValueChange={(value) => {
                        if (value === "Email" && !gmailConnected) {
                          toast.error("Connect Gmail to send email reminders", {
                            description:
                              "Go to Settings and connect your Google account first.",
                          })
                          return
                        }
                        field.onChange(value)
                      }}
                    >
                      <TabsList className="w-full">
                        <TabsTrigger value="App" className="flex-1 gap-1.5">
                          <Bell className="h-3.5 w-3.5" />
                          App
                        </TabsTrigger>
                        <TabsTrigger value="Email" className="flex-1 gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          Email
                        </TabsTrigger>
                        <TabsTrigger
                          value="WhatsApp"
                          className="flex-1 gap-1.5"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          WhatsApp
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <LoadingButton type="submit" loading={isSubmitting}>
                Set Reminder
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default ReminderModal
