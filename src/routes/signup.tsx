import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link as RouterLink } from "react-router"
import { z } from "zod"
import { AuthLayout } from "@/components/Common/AuthLayout"
import { GoogleAuthButton } from "@/components/Common/GoogleAuthButton"
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
import { PasswordInput } from "@/components/ui/password-input"
import useAuth, { isExistingSignupEmailError } from "@/hooks/useAuth"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { useGoogleAuthMessage } from "@/hooks/useGoogleAuthMessage"

const formSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    full_name: z.string().min(1, { message: "Full Name is required" }),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" }),
    confirm_password: z
      .string()
      .min(1, { message: "Password confirmation is required" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "The passwords don't match",
    path: ["confirm_password"],
  })

type FormValues = z.infer<typeof formSchema>

function SignUp() {
  useDocumentTitle(
    "Sign Up for Free GST Invoicing",
    "Create a free UnifiedDesk account and start making GST invoices, quotations, and delivery challans for your Indian business. No credit card required.",
  )
  useGoogleAuthMessage()
  const { signUpMutation } = useAuth()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      confirm_password: "",
    },
  })

  const onSubmit = (data: FormValues) => {
    if (signUpMutation.isPending) return
    const { confirm_password: _confirm_password, ...submitData } = data
    signUpMutation.mutate(submitData, {
      onError: (error) => {
        if (
          isExistingSignupEmailError(error) &&
          form.getValues("email").trim().toLowerCase() ===
            submitData.email.trim().toLowerCase()
        ) {
          form.setError(
            "email",
            { type: "server", message: "This email already has an account." },
            { shouldFocus: true },
          )
        }
      },
    })
  }

  return (
    <AuthLayout>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Start free GST invoicing
            </h1>
            <p className="text-sm text-muted-foreground">
              Free for Indian businesses. No credit card required.
            </p>
          </div>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="full-name-input"
                      placeholder="John Doe"
                      type="text"
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="email-input"
                      placeholder="user@example.com"
                      type="email"
                      autoComplete="email"
                      {...field}
                      onChange={(event) => {
                        field.onChange(event)
                        if (form.formState.errors.email?.type === "server") {
                          form.clearErrors("email")
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage
                    role={
                      form.formState.errors.email?.type === "server"
                        ? "alert"
                        : undefined
                    }
                  />
                  {form.formState.errors.email?.type === "server" && (
                    <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-3">
                      <p className="text-sm text-foreground">
                        Sign in to continue, or reset your password if you need
                        help.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                        <Button variant="link" asChild className="h-auto p-0">
                          <RouterLink to="/login">Sign in instead</RouterLink>
                        </Button>
                        <Button variant="link" asChild className="h-auto p-0">
                          <RouterLink to="/recover-password">
                            Reset password
                          </RouterLink>
                        </Button>
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      data-testid="password-input"
                      placeholder="Create a password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      data-testid="confirm-password-input"
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
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
              loading={signUpMutation.isPending}
            >
              Create Account
            </LoadingButton>

            <div className="relative text-center text-xs">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                or
              </span>
              <div className="absolute inset-0 top-1/2 border-t" />
            </div>

            <GoogleAuthButton />
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By signing up, you agree to our{" "}
            <RouterLink
              to="/privacy-policy"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Privacy Policy
            </RouterLink>
            .
          </p>

          {form.formState.errors.email?.type !== "server" && (
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <RouterLink
                to="/login"
                className="underline underline-offset-4 hover:text-foreground transition-colors font-medium"
              >
                Log in
              </RouterLink>
            </div>
          )}
        </form>
      </Form>
    </AuthLayout>
  )
}

export default SignUp
