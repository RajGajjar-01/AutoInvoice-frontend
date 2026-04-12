import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Bell, MessageSquare, Phone } from "lucide-react"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
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
import { tablesQueryKeys } from "@/features/data-tables/queries"
import { queryClient } from "@/queryClient"

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const reminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  notificationType: z.enum(["App", "SMS", "WhatsApp"]),
})

type FormValues = z.infer<typeof reminderSchema>

interface ReminderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tableId: string
  rowId: string
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

  const createReminderMutation = useMutation({
    mutationFn: async (reminderData: {
      row_id: string
      title: string
      description: string
      date: string
      notificationType: string
    }) => {
      return TablesService.createTableReminder({
        tableId,
        requestBody: {
          reminder_data: reminderData,
        },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: tablesQueryKeys.detail(tableId),
      })
      toast.success("Reminder set successfully")
      onOpenChange(false)
    },
    onError: () => {
      toast.error("Failed to set reminder")
    },
  })

  const onSubmit = (data: FormValues) => {
    createReminderMutation.mutate({
      row_id: rowId,
      title: data.title,
      description: data.description ?? "",
      date: data.date,
      notificationType: data.notificationType,
    })
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

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reminder Date <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                    <Tabs value={field.value} onValueChange={field.onChange}>
                      <TabsList className="w-full">
                        <TabsTrigger value="App" className="flex-1 gap-1.5">
                          <Bell className="h-3.5 w-3.5" />
                          App
                        </TabsTrigger>
                        <TabsTrigger value="SMS" className="flex-1 gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5" />
                          SMS
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
