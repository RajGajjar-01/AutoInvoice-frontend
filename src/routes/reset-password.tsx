import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import {
  Link as RouterLink,
  redirect,
  useNavigate,
  useSearchParams,
} from "react-router"
import { z } from "zod"
import { AuthService } from "@/client/sdk.gen"
import { AuthLayout } from "@/components/Common/AuthLayout"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"

import useCustomToast from "@/hooks/useCustomToast"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { handleError } from "@/utils"

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url)
  const hasToken =
    url.searchParams.get("token") ||
    (typeof window !== "undefined" &&
      window.location.hash.includes("access_token"))
  if (!hasToken) {
    throw redirect("/login")
  }
  return null
}

const formSchema = z
  .object({
    new_password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" }),
    confirm_password: z
      .string()
      .min(1, { message: "Password confirmation is required" }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "The passwords don't match",
    path: ["confirm_password"],
  })

type FormValues = z.infer<typeof formSchema>

function ResetPassword() {
  useDocumentTitle("Reset Password")
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? undefined
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const navigate = useNavigate()

  const getAccessToken = (): string => {
    if (token) return token
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    return params.get("access_token") || ""
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const accessToken = getAccessToken()
      await AuthService.resetPassword({
        requestBody: {
          token: accessToken,
          new_password: data.new_password,
        },
      })
    },
    onSuccess: () => {
      showSuccessToast("Password updated successfully")
      form.reset()
      navigate("/login")
    },
    onError: (error) => handleError.call(showErrorToast, error),
  })

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data)
  }

  return (
    <AuthLayout>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Reset Password</h1>
          </div>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      data-testid="new-password-input"
                      placeholder="New Password"
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
                      placeholder="Confirm Password"
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
              loading={mutation.isPending}
            >
              Reset Password
            </LoadingButton>
          </div>

          <div className="text-center text-sm">
            Remember your password?{" "}
            <RouterLink to="/login" className="underline underline-offset-4">
              Log in
            </RouterLink>
          </div>
        </form>
      </Form>
    </AuthLayout>
  )
}

export default ResetPassword
