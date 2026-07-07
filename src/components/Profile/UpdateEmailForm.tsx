import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Info } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
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
import { PasswordInput } from "@/components/ui/password-input"

const formSchema = z.object({
  new_email: z.string().email("Please enter a valid email address"),
  current_password: z.string().min(1, "Password is required to confirm"),
})

type FormValues = z.infer<typeof formSchema>

export function UpdateEmailForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: { new_email: "", current_password: "" },
  })

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      await new Promise((r) => setTimeout(r, 1000))
      return data
    },
    onSuccess: () => {
      toast.success("Email updated. Please verify your new email.")
      form.reset()
    },
    onError: () => {
      toast.error("Failed to update email. Please try again.")
    },
  })

  const onSubmit = (data: FormValues) => mutation.mutate(data)

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 max-w-md"
      >
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />A verification link
          will be sent to your new email address.
        </div>

        <FormField
          control={form.control}
          name="new_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Email Address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@newdomain.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="current_password"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="••••••••"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton
          type="submit"
          loading={mutation.isPending}
          className="self-start"
        >
          Update Email
        </LoadingButton>
      </form>
    </Form>
  )
}

export default UpdateEmailForm
