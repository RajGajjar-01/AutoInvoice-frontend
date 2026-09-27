import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CircleCheck, ContactRound } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { z } from "zod"
import { UsersService } from "@/client"
import type { UserUpdateMe } from "@/client/types.gen"
import { ProfileSection } from "@/components/Profile/ProfileSection"
import { Form } from "@/components/ui/form"
import { Field, InfoRow } from "@/features/profile/components/shared"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { formResolver } from "@/lib/form"
import { getInitials, getSafeErrorMessage } from "@/utils"

const personalSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(255, "Use 255 characters or fewer"),
  email: z.email("Enter a valid email address").max(255),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine(
      (value) =>
        !value ||
        (/^[+\d\s()-]+$/.test(value) && value.replace(/\D/g, "").length >= 7),
      "Enter a valid phone number",
    ),
})
type PersonalValues = z.infer<typeof personalSchema>

const UserInformation = () => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [editMode, setEditMode] = useState(false)
  const { user } = useAuth()
  const form = useForm<PersonalValues>({
    resolver: formResolver(personalSchema),
    mode: "onBlur",
    defaultValues: {
      full_name: user?.full_name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  })

  useEffect(() => {
    if (user && !editMode) {
      form.reset({
        full_name: user.full_name ?? "",
        email: user.email,
        phone: user.phone ?? "",
      })
    }
  }, [user, editMode, form])

  const mutation = useMutation({
    mutationFn: (data: UserUpdateMe) =>
      UsersService.updateUserMe({ requestBody: data }),
    onSuccess: async (updated) => {
      form.reset({
        full_name: updated.full_name ?? "",
        email: updated.email,
        phone: updated.phone ?? "",
      })
      setEditMode(false)
      showSuccessToast("Personal details saved")
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
    onError: (error) =>
      showErrorToast(
        `Could not save personal details. ${getSafeErrorMessage(error)}`,
      ),
  })

  const onSubmit = (data: PersonalValues) => {
    if (!user || mutation.isPending) return
    const changes: UserUpdateMe = {}
    if (data.full_name !== (user.full_name ?? ""))
      changes.full_name = data.full_name
    if (data.email !== user.email) changes.email = data.email
    if (data.phone !== (user.phone ?? "")) changes.phone = data.phone || null
    if (Object.keys(changes).length === 0) {
      setEditMode(false)
      return
    }
    mutation.mutate(changes)
  }

  const cancel = () => {
    form.reset({
      full_name: user?.full_name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    })
    setEditMode(false)
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center gap-4 border-b border-border/70 py-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border bg-muted text-lg font-semibold">
          {getInitials(user?.full_name || user?.email || "U")}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold">
            {user?.full_name || "Your profile"}
          </h2>
          <p className="truncate text-sm text-muted-foreground">
            {user?.email}
          </p>
        </div>
        {user?.is_verified && (
          <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
            <CircleCheck className="h-3.5 w-3.5" /> Verified email
          </span>
        )}
        {user && !user.is_verified && (
          <Link
            to="/verify-email"
            className="text-sm font-medium underline underline-offset-4"
          >
            Verify email
          </Link>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ProfileSection
            id="personal-details"
            icon={ContactRound}
            title="Personal details"
            description="The name and contact information you use to sign in. Business details are managed separately."
            isEditing={editMode}
            onEdit={() => {
              form.reset({
                full_name: user?.full_name ?? "",
                email: user?.email ?? "",
                phone: user?.phone ?? "",
              })
              setEditMode(true)
            }}
            onSave={() => void form.handleSubmit(onSubmit)()}
            onCancel={cancel}
            isSaving={mutation.isPending}
            viewContent={
              <>
                <InfoRow
                  label="Full name"
                  value={user?.full_name || "Not added"}
                />
                <InfoRow label="Email address" value={user?.email} />
                <InfoRow
                  label="Phone number"
                  value={user?.phone || "Not added"}
                />
              </>
            }
            editContent={
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field
                    name="full_name"
                    label="Full name"
                    placeholder="Your full name"
                    required
                    autoComplete="name"
                  />
                </div>
                <Field
                  name="email"
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
                <Field
                  name="phone"
                  label="Phone number"
                  type="tel"
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                />
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  Changing your email address will require you to verify the new
                  address.
                </p>
              </div>
            }
          />
        </form>
      </Form>
    </div>
  )
}

export default UserInformation
