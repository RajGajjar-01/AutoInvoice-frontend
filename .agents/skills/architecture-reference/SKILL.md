---
name: AutoInvoice Architecture Reference
description: Complete reference for the AutoInvoice frontend stack, design tokens, folder conventions, routing, and available components. Use this before building anything to ensure consistency.
---

# AutoInvoice Frontend Architecture Reference

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vite + React 19 |
| Routing | TanStack Router v1 (file-based) |
| Data Fetching | TanStack Query v5 |
| UI Library | shadcn/ui — **New York** style |
| Styling | Tailwind CSS v4 + `tw-animate-css` |
| Forms | react-hook-form v7 + Zod v4 |
| Table | @tanstack/react-table v8 |
| Icons | Lucide React (`lucide-react`) + react-icons |
| Toasts | Sonner (`sonner`) via `useCustomToast` hook |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Theme | next-themes (dark/light toggle) |
| API Client | Auto-generated via `@hey-api/openapi-ts` — import from `@/client` |
| Linter | Biome |

---

## Design System

### Primary Brand Color
- **Light mode:** `#fba267` (warm orange)
- **Dark mode:** `#fab283` (slightly lighter orange)
- Used as: `bg-primary`, `text-primary`, `border-primary`

### Typography
- **Font:** Poppins (400, 500, 600, 700)
- Applied globally via `--font-sans`
- Weights: use Tailwind `font-normal`, `font-medium`, `font-semibold`, `font-bold`

### CSS Design Tokens (always prefer these over arbitrary values)

```
--background / --foreground         → page background and text
--card / --card-foreground          → card surfaces
--primary / --primary-foreground    → brand orange, action color
--secondary / --secondary-foreground
--muted / --muted-foreground        → subtle backgrounds and subdued text
--accent / --accent-foreground      → hover highlights
--destructive                       → error/delete states (red)
--border                            → borders (use border-border)
--input                             → form input borders
--ring                              → focus rings
--sidebar / --sidebar-foreground    → sidebar-specific tokens
--radius: 0.625rem                  → default border radius
```

Colors use the **oklch** color space for consistent dark mode.

### Tailwind Utility Conventions
```
text-muted-foreground     → secondary/helper text
bg-muted/20               → subtle background tints (tables, footers)
border-border             → standard borders
bg-primary text-primary-foreground → primary button/accent fills
rounded-lg                → standard card radius (--radius-lg)
```

---

## Folder Structure

```
src/
├── routes/               # TanStack Router pages (file-based)
│   ├── __root.jsx        # Root route (providers, error boundaries)
│   ├── _layout.jsx       # Auth+sidebar shell (wraps all protected pages)
│   ├── _layout/          # Protected page files
│   │   ├── dashboard.jsx
│   │   ├── items.jsx
│   │   ├── admin.jsx
│   │   ├── settings.jsx
│   │   └── profile.jsx
│   ├── login.jsx         # Public routes
│   ├── signup.jsx
│   └── recover-password.jsx
├── components/
│   ├── ui/               # shadcn/ui primitives (DO NOT edit these)
│   ├── Common/           # Shared across pages (DataTable, Logo, Footer, etc.)
│   ├── Sidebar/          # AppSidebar, Main nav, User footer
│   ├── Admin/            # Admin-page components
│   ├── Items/            # Items-page components
│   ├── DataTables/       # Data Tables feature components
│   ├── Profile/          # Profile page components
│   ├── Pending/          # Suspense skeleton fallbacks per feature
│   └── UserSettings/     # Settings page components
├── hooks/
│   ├── useAuth.js        # Auth state, login/logout/signup mutations
│   ├── useCustomToast.js # showSuccessToast / showErrorToast
│   ├── useCopyToClipboard.js
│   └── useMobile.js      # isMobile boolean
├── client/               # Auto-generated API client (never edit)
│   └── sdk.gen.js        # Services: UsersService, ItemsService, LoginService, etc.
├── lib/utils.js          # cn() helper (clsx + tailwind-merge)
├── utils.js              # handleError() for API errors
└── index.css             # Global styles + all CSS design tokens
```

---

## Route & Component Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Route file | `kebab-case.jsx` | `invoice-history.jsx` |
| Route path | `/kebab-case` | `/_layout/invoice-history` |
| Component name | `PascalCase` | `InvoiceHistory` |
| Component folder | `PascalCase` | `components/InvoiceHistory/` |
| Feature components | `PascalCase` | `AddInvoice.jsx`, `EditInvoice.jsx` |
| Columns file | `columns.jsx` | `components/InvoiceHistory/columns.jsx` |
| Pending fallback | `PendingX.jsx` | `components/Pending/PendingInvoices.jsx` |
| Query key | `["resource-name"]` | `["invoices"]` |
| Query options fn | `getXQueryOptions()` | `getInvoicesQueryOptions()` |

---

## Available shadcn/ui Components (`@/components/ui/`)

```
alert, avatar, badge, button, button-group, card, checkbox,
dialog, dropdown-menu, form, input, label, loading-button,
pagination, password-input, select, separator, sheet, sidebar,
skeleton, sonner, table, tabs, tooltip
```

**Always import from `@/components/ui/...`** — never from `@radix-ui` directly.

---

## Page Shell / Layout

All protected pages live inside `_layout.jsx` which provides:
- `<AppSidebar />` — collapsible icon sidebar
- `<SidebarInset>` — content area with sticky header
- `<main className="flex-1 p-6 md:p-8">` — page padding
- `<div className="mx-auto max-w-7xl">` — max width container
- `<Footer />` — bottom footer

Pages only need to render their own content, the shell is inherited.

---

## Sidebar Navigation

Add new pages to the sidebar by editing `src/components/Sidebar/AppSidebar.jsx`:

```jsx
const baseItems = [
  { icon: Home, title: "Dashboard", path: "/dashboard" },
  { icon: Briefcase, title: "Items", path: "/items" },
  { icon: Table2, title: "Data Tables", path: "/data-tables" },
  { icon: UserCircle, title: "Account", path: "/profile" },
  // Add new item here:
  { icon: FileText, title: "Invoices", path: "/invoices" },
]
```

Icons must be imported from `lucide-react`. Superuser-only items go in the conditional that appends `{ icon: Users, title: "Admin", path: "/admin" }`.

---

## Key Patterns Summary

- **Data fetching:** `useSuspenseQuery` (not `useQuery`) inside `<Suspense>` wrappers
- **Mutations:** `useMutation` from TanStack Query + `queryClient.invalidateQueries`
- **Error handling:** `handleError.bind(showErrorToast)` as `onError` callback
- **Toasts:** always `useCustomToast()` → `showSuccessToast` / `showErrorToast`
- **Forms:** always `useForm({ resolver: zodResolver(schema), mode: "onBlur" })`
- **Submit button:** always `<LoadingButton loading={mutation.isPending}>` not plain `<Button>`
- **Path aliases:** use `@/` for `src/` (configured in `jsconfig.json`)
