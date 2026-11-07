import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link as RouterLink } from "react-router"
import { z } from "zod"
import { AuthEntryLayout } from "@/components/Common/AuthEntryLayout"
import { GoogleAuthButton } from "@/components/Common/GoogleAuthButton"
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
import useAuth from "@/hooks/useAuth"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { useGoogleAuthMessage } from "@/hooks/useGoogleAuthMessage"

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
})

type FormValues = z.infer<typeof formSchema>

function Login() {
  useDocumentTitle(
    "Log In",
    "Log in to UnifiedDesk to create GST invoices, track payments, and manage your customers and inventory.",
  )
  useGoogleAuthMessage()
  const { loginMutation } = useAuth()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (data: FormValues) => {
    if (loginMutation.isPending) return
    loginMutation.mutate(data)
  }

  return (
    <AuthEntryLayout>
      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="auth-form"
        >
          <div className="auth-heading">
            <h1 className="auth-title">
              <span className="auth-eyebrow">YOUR WORKSPACE AWAITS</span>
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              A fresh start to your business day.
            </p>
          </div>

          <div className="auth-social">
            <GoogleAuthButton />
            <div className="relative text-center text-xs">
              <span className="relative z-10 bg-card px-3 text-muted-foreground">
                or continue with email
              </span>
              <div className="absolute inset-0 top-1/2 border-t" />
            </div>
          </div>

          <div className="auth-fields">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="email-input"
                      placeholder="you@business.com"
                      inputMode="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      type="email"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel>Password</FormLabel>
                    <RouterLink
                      to="/recover-password"
                      className="auth-forgot ml-auto"
                    >
                      Forgot your password?
                    </RouterLink>
                  </div>
                  <FormControl>
                    <PasswordInput
                      data-testid="password-input"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <LoadingButton
              type="submit"
              className="auth-submit w-full"
              loading={loginMutation.isPending}
            >
              Sign In <ArrowRight size={18} aria-hidden="true" />
            </LoadingButton>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account yet?{" "}
            <RouterLink
              to="/signup"
              className="underline underline-offset-4 hover:text-foreground transition-colors font-medium"
            >
              Sign up
            </RouterLink>
          </div>
        </form>
      </Form>
    </AuthEntryLayout>
  )
}

export default Login
