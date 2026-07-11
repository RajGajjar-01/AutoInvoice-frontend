import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Navigate } from "react-router"
import { z } from "zod"
import { AuthLayout } from "@/components/Common/AuthLayout"
import { Button } from "@/components/ui/button"
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
import useAuth from "@/hooks/useAuth"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

const RESEND_COOLDOWN_SECONDS = 60

const formSchema = z.object({
  code: z
    .string()
    .length(6, { message: "Enter the 6-digit code" })
    .regex(/^\d{6}$/, { message: "Code must be 6 digits" }),
})

type FormValues = z.infer<typeof formSchema>

function VerifyEmail() {
  useDocumentTitle("Verify Email")
  const {
    user,
    isLoading,
    verifyEmailMutation,
    resendVerificationEmailMutation,
  } = useAuth()
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: { code: "" },
  })

  const onSubmit = (data: FormValues) => {
    if (verifyEmailMutation.isPending) return
    verifyEmailMutation.mutate(data.code)
  }

  const onResend = () => {
    if (resendVerificationEmailMutation.isPending || cooldown > 0) return
    resendVerificationEmailMutation.mutate(undefined, {
      onSuccess: () => setCooldown(RESEND_COOLDOWN_SECONDS),
    })
  }

  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.is_verified) return <Navigate to="/dashboard" replace />

  return (
    <AuthLayout>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Verify your email
            </h1>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-foreground">{user.email}</span>
            </p>
          </div>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification code</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="verify-code-input"
                      placeholder="123456"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      className="text-center text-lg tracking-[0.5em]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton
              type="submit"
              className="w-full"
              loading={verifyEmailMutation.isPending}
            >
              Verify Email
            </LoadingButton>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Didn't get a code?{" "}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-sm font-medium"
              disabled={
                cooldown > 0 || resendVerificationEmailMutation.isPending
              }
              onClick={onResend}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </Button>
          </div>
        </form>
      </Form>
    </AuthLayout>
  )
}

export default VerifyEmail
