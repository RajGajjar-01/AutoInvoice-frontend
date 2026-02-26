---
name: AutoInvoice New Page Creation
description: Step-by-step guide and template for creating a new protected page in the AutoInvoice frontend. Follow these steps in order every time a new route/page is needed.
---

# Creating a New Page in AutoInvoice

> Always read the `architecture-reference` skill first to understand folder conventions, naming, and the layout shell.

---

## Step 1 — Create the Route File

Create `src/routes/_layout/your-page-name.jsx`.

Use the **page template** below and customize it. The file name becomes the URL path automatically via TanStack Router's file-based routing.

```jsx
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"
import { YourService } from "@/client"
// Import your feature components
import AddYourThing from "@/components/YourFeature/AddYourThing"
import { columns } from "@/components/YourFeature/columns"
import { DataTable } from "@/components/Common/DataTable"
import PendingYourThings from "@/components/Pending/PendingYourThings"

// 1. Define query options outside the component for stable references
function getYourThingsQueryOptions() {
  return {
    queryFn: () => YourService.readYourThings({ skip: 0, limit: 100 }),
    queryKey: ["your-things"],
  }
}

// 2. Register the route with TanStack Router
export const Route = createFileRoute("/_layout/your-page-name")({
  component: YourPage,
  head: () => ({
    meta: [{ title: "Your Page Title" }],
  }),
})

// 3. Inner component that uses suspense query (must be inside <Suspense>)
function YourPageTableContent() {
  const { data } = useSuspenseQuery(getYourThingsQueryOptions())

  if (data.data.length === 0) {
    return <YourPageEmptyState />
  }

  return <DataTable columns={columns} data={data.data} />
}

// 4. Suspense wrapper with skeleton fallback
function YourPageTable() {
  return (
    <Suspense fallback={<PendingYourThings />}>
      <YourPageTableContent />
    </Suspense>
  )
}

// 5. Page root component — uses the standard page shell
function YourPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header — always use this pattern */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Page Title</h1>
          <p className="text-muted-foreground">
            Short description of what this page does
          </p>
        </div>
        <AddYourThing />
      </div>

      {/* Main content */}
      <YourPageTable />
    </div>
  )
}
```

---

## Step 2 — Create the Empty State Component (inline or separate)

Use this pattern for empty states inside the page:

```jsx
function YourPageEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <div className="rounded-full bg-muted p-4 mb-4">
        <YourIcon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">No items yet</h3>
      <p className="text-muted-foreground text-sm mb-4">
        Get started by creating your first item.
      </p>
      <AddYourThing />
    </div>
  )
}
```

---

## Step 3 — Create Feature Components Folder

Create `src/components/YourFeature/`:
- `AddYourThing.jsx` — Dialog with form (see `forms-and-api` skill)
- `EditYourThing.jsx` — Edit dialog (if needed)
- `columns.jsx` — TanStack Table column definitions

**columns.jsx template:**

```jsx
import { createColumnHelper } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { YourThingActions } from "./YourThingActions"

const columnHelper = createColumnHelper()

export const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => (
      <span className="font-medium">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <Badge variant={info.getValue() === "active" ? "default" : "secondary"}>
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor("created_at", {
    header: "Created",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: (info) => <YourThingActions item={info.row.original} />,
  }),
]
```

---

## Step 4 — Create the Pending Skeleton Fallback

Create `src/components/Pending/PendingYourThings.jsx`:

```jsx
import { Skeleton } from "@/components/ui/skeleton"

function PendingYourThings() {
  return (
    <div className="flex flex-col gap-4">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Table skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  )
}

export default PendingYourThings
```

---

## Step 5 — Register in Sidebar (if needed)

Open `src/components/Sidebar/AppSidebar.jsx` and add to `baseItems`:

```jsx
import { YourIcon } from "lucide-react"

const baseItems = [
  // ... existing items ...
  { icon: YourIcon, title: "Your Page", path: "/your-page-name" },
]
```

---

## Step 6 — Static Page Template (no data fetching)

For pages that don't need API data (e.g. settings tabs, dashboards, forms):

```jsx
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/your-page-name")({
  component: YourPage,
  head: () => ({
    meta: [{ title: "Page Title" }],
  }),
})

function YourPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Page Title</h1>
        <p className="text-muted-foreground">Description</p>
      </div>

      {/* Content sections */}
      <section className="space-y-4">
        {/* ... */}
      </section>
    </div>
  )
}
```

---

## Step 7 — Superuser-Only Route Guard

To restrict a page to admins only:

```jsx
export const Route = createFileRoute("/_layout/admin-page")({
  component: AdminPage,
  beforeLoad: async () => {
    const user = await UsersService.readUserMe()
    if (!user.is_superuser) {
      throw redirect({ to: "/dashboard" })
    }
  },
  head: () => ({ meta: [{ title: "Admin Page" }] }),
})
```

---

## Checklist

- [ ] Route file created at `src/routes/_layout/page-name.jsx`
- [ ] `createFileRoute` path matches the file path exactly
- [ ] `head()` with `meta: [{ title: "..." }]` set
- [ ] Page uses `flex flex-col gap-6` root container
- [ ] Header uses `h1.text-2xl.font-bold.tracking-tight` + `p.text-muted-foreground`
- [ ] Data fetching uses `useSuspenseQuery` inside `<Suspense fallback={<Pending... />}>`
- [ ] Empty state handled with icon + heading + CTA
- [ ] Pending skeleton created in `src/components/Pending/`
- [ ] Feature components in their own folder: `src/components/YourFeature/`
- [ ] Sidebar entry added (if it's a main navigation page)
