---
name: AutoInvoice Forms & API Integration
description: Complete patterns for building forms with validation, connecting them to the API, handling loading states, and showing feedback via toasts. Use this every time you add a form, dialog, or mutation to the frontend.
---

# Forms & API Integration in AutoInvoice

> This skill covers the full pattern from form definition → validation → API call → success/error feedback. Every form in the project should follow this pattern.

---

## The Core Pattern (at a Glance)

```
Zod schema → useForm(zodResolver) → useMutation → onSuccess / onError
                                                        ↓               ↓
                                               showSuccessToast   handleError (showErrorToast)
                                               form.reset()
                                               setIsOpen(false)
                                               queryClient.invalidateQueries
```

---

## Step 1 — Define the Zod Schema

Always define the schema **outside** the component for a stable reference:

```jsx
import { z } from "zod"

const formSchema = z.object({
  // String — required, with max length
  title: z.string().min(1, { message: "Title is required" }).max(255),

  // String — optional
  description: z.string().optional(),

  // Email
  email: z.string().email({ message: "Please enter a valid email" }),

  // Password with constraints
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128),

  // Password confirmation match
  confirm_password: z.string(),

  // Number
  amount: z.number({ required_error: "Amount is required" }).positive(),

  // Select / enum
  status: z.enum(["draft", "active", "archived"]),

  // Boolean
  is_active: z.boolean().default(true),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
})
```

---

## Step 2 — Initialize the Form

```jsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const form = useForm({
  resolver: zodResolver(formSchema),
  mode: "onBlur",          // validate on field blur (consistent with project)
  criteriaMode: "all",     // show all errors at once
  defaultValues: {
    title: "",
    description: "",
    is_active: true,
    // always provide defaults for all fields
  },
})
```

**For edit forms**, populate `defaultValues` from the existing record:
```jsx
defaultValues: {
  title: item?.title ?? "",
  description: item?.description ?? "",
},
```

---

## Step 3 — Build the Mutation

```jsx
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { YourService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const queryClient = useQueryClient()
const { showSuccessToast, showErrorToast } = useCustomToast()

const mutation = useMutation({
  mutationFn: (data) => YourService.createYourThing({ requestBody: data }),
  onSuccess: () => {
    showSuccessToast("Item created successfully")
    form.reset()
    setIsOpen(false)
  },
  onError: handleError.bind(showErrorToast), // always this exact pattern
  onSettled: () => {
    // Always invalidate the relevant query so the list refreshes
    queryClient.invalidateQueries({ queryKey: ["your-things"] })
  },
})

const onSubmit = (data) => {
  mutation.mutate(data)
}
```

**For edit mutations**, pass the ID:
```jsx
mutationFn: (data) => YourService.updateYourThing({
  id: item.id,
  requestBody: data,
}),
```

---

## Step 4 — Dialog Wrapper (Add / Edit)

All create/edit actions use a Dialog, not a full-page form:

```jsx
import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

function AddYourThing() {
  const [isOpen, setIsOpen] = useState(false)

  // form + mutation defined above...

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new item.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              {/* Fields go here */}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <LoadingButton type="submit" loading={mutation.isPending}>
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Step 5 — Form Field Templates

### Text Input
```jsx
<FormField
  control={form.control}
  name="title"
  render={({ field }) => (
    <FormItem>
      <FormLabel>
        Title <span className="text-destructive">*</span>
      </FormLabel>
      <FormControl>
        <Input placeholder="Enter title" type="text" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Optional Field (no asterisk)
```jsx
<FormField
  control={form.control}
  name="description"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Description</FormLabel>
      <FormControl>
        <Input placeholder="Optional description" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Password Input
```jsx
import { PasswordInput } from "@/components/ui/password-input"

<FormField
  control={form.control}
  name="password"
  render={({ field }) => (
    <FormItem>
      <FormLabel>
        Password <span className="text-destructive">*</span>
      </FormLabel>
      <FormControl>
        <PasswordInput placeholder="Min. 8 characters" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Select Dropdown
```jsx
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"

<FormField
  control={form.control}
  name="status"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Status</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Checkbox
```jsx
import { Checkbox } from "@/components/ui/checkbox"

<FormField
  control={form.control}
  name="is_active"
  render={({ field }) => (
    <FormItem className="flex items-center gap-2 space-y-0">
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
      <FormLabel className="font-normal cursor-pointer">
        Active
      </FormLabel>
    </FormItem>
  )}
/>
```

---

## Submit Button Rules

| State | Component |
|---|---|
| Normal submit | `<LoadingButton type="submit" loading={mutation.isPending}>Save</LoadingButton>` |
| Cancel | `<Button variant="outline" disabled={mutation.isPending}>Cancel</Button>` |
| Destructive | `<Button variant="destructive" disabled={mutation.isPending}>Delete</Button>` |

**Never use a plain `<Button type="submit">`** — always `<LoadingButton>` so the loading spinner appears.

---

## Toast Usage

```jsx
import useCustomToast from "@/hooks/useCustomToast"

const { showSuccessToast, showErrorToast } = useCustomToast()

// Success
showSuccessToast("Invoice created successfully")

// Error (manual — prefer handleError for API errors)
showErrorToast("Something went wrong")
```

**API error handling** — always use this exact pattern for `onError`:
```jsx
onError: handleError.bind(showErrorToast)
```
This parses the API error response and shows a human-readable toast automatically.

---

## Delete Confirmation Pattern

For destructive actions — use a Dialog with a destructive button, **not** a browser `confirm()`:

```jsx
function DeleteYourThing({ item }) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const deleteMutation = useMutation({
    mutationFn: () => YourService.deleteYourThing({ id: item.id }),
    onSuccess: () => {
      showSuccessToast("Item deleted")
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["your-things"] })
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={(e) => { e.preventDefault(); setIsOpen(true) }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Item</DialogTitle>
          <DialogDescription>
            Are you sure? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <LoadingButton
            variant="destructive"
            loading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            Delete
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Checklist

- [ ] Zod schema defined outside the component
- [ ] `useForm({ resolver: zodResolver(schema), mode: "onBlur" })`
- [ ] `defaultValues` provided for every field
- [ ] `useMutation` used (not direct `async` calls)
- [ ] `onError: handleError.bind(showErrorToast)` in every mutation
- [ ] `queryClient.invalidateQueries` in `onSettled`
- [ ] Submit button is `<LoadingButton loading={mutation.isPending}>`
- [ ] Cancel button has `disabled={mutation.isPending}`
- [ ] Destructive actions use Dialog confirmation, not `window.confirm()`
- [ ] `form.reset()` called in `onSuccess`
