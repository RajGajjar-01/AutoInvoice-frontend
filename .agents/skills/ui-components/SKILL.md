---
name: AutoInvoice UI Component Patterns
description: UI design patterns, layouts, and component recipes for AutoInvoice. Use this skill when building new UI sections, refining existing pages, or making design decisions. Ensures every surface follows the project's warm-orange, professional SaaS aesthetic.
---

# AutoInvoice UI Component Patterns

> Always use the CSS design tokens from `index.css` (listed in the `architecture-reference` skill). **Never use hardcoded colors.** All components must work in both light and dark modes.

---

## Core Design Principles

1. **Warm but professional** — the brand is `--primary` orange. Use it for primary CTAs, active states, and accents. Don't overuse it.
2. **Generous whitespace** — use `gap-6` between sections, `gap-4` inside cards, `p-6 md:p-8` for page padding (inherited from layout).
3. **Subtle depth** — `border-border` edges, `bg-muted/20` for zebra rows and footer bars, `shadow-sm` for cards.
4. **Clear hierarchy** — `text-2xl font-bold tracking-tight` for page titles, `text-lg font-semibold` for card headers, `text-sm text-muted-foreground` for secondary text.
5. **Dark-mode-first** — all colors must use CSS token classes, never arbitrary values.

---

## Page Header Pattern

**Use on every page — always consistent:**

```jsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold tracking-tight">Page Title</h1>
    <p className="text-muted-foreground text-sm mt-1">
      Short, helpful description.
    </p>
  </div>
  {/* Optional: primary action */}
  <Button>
    <Plus className="mr-2 h-4 w-4" />
    Add Something
  </Button>
</div>
```

---

## Stat / KPI Card Grid

For dashboard summary numbers — use a responsive 2-to-4 column grid:

```jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, FileText, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"

function StatsGrid() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$12,450",
      trend: "+12%",
      trendUp: true,
      icon: DollarSign,
      description: "vs. last month",
    },
    // ...
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2">
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center gap-1 mt-1">
              <Badge
                variant={stat.trendUp ? "default" : "destructive"}
                className="text-xs font-medium"
              >
                {stat.trend}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {stat.description}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

---

## Card / Section Block

For grouping related content:

```jsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Section Title</CardTitle>
    <CardDescription>Optional subtitle or explanation.</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* content */}
  </CardContent>
</Card>
```

For a simple bordered section without a Card (lighter weight):
```jsx
<div className="rounded-lg border border-border p-6 space-y-4">
  {/* content */}
</div>
```

---

## Empty State Pattern

Always used inside data pages when there's no content:

```jsx
import { FileSearch } from "lucide-react"
import { Button } from "@/components/ui/button"

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted p-5 mb-5">
        <FileSearch className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        {description}
      </p>
      {actionLabel && (
        <Button onClick={onAction}>
          <Plus className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
```

---

## Badge / Status Chips

Use `<Badge>` for status indicators. Map status values to appropriate variants:

```jsx
import { Badge } from "@/components/ui/badge"

// Variant guide:
// "default"     → primary orange (active, success)
// "secondary"   → muted (draft, pending)
// "destructive" → red (error, overdue, cancelled)
// "outline"     → bordered (info labels)

const statusVariant = {
  active:    "default",
  paid:      "default",
  draft:     "secondary",
  pending:   "secondary",
  overdue:   "destructive",
  cancelled: "destructive",
}

<Badge variant={statusVariant[item.status] ?? "outline"}>
  {item.status}
</Badge>
```

---

## Data Table with Action Column

Column definition pattern with a row actions dropdown:

```jsx
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// In your actions cell:
function RowActions({ item, onEdit, onDelete }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(item)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(item)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## Loading Skeleton Pattern

Match the actual layout structure in your skeletons:

```jsx
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// Stats grid skeleton
function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Table skeleton
function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full rounded-md" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-md" />
      ))}
    </div>
  )
}
```

---

## Tabs Layout Pattern

For pages with multiple sub-sections (e.g. Settings):

```jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const tabsConfig = [
  { value: "overview", title: "Overview", component: OverviewSection },
  { value: "details",  title: "Details",  component: DetailsSection },
  { value: "history",  title: "History",  component: HistorySection },
]

function TabbedPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Page Title</h1>
        <p className="text-muted-foreground text-sm mt-1">Description</p>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          {tabsConfig.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabsConfig.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-6">
            <tab.component />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
```

---

## Icon Usage Rules

1. **Always import from `lucide-react`** — not react-icons unless there's no Lucide equivalent
2. **Size in data tables:** `className="h-4 w-4"`
3. **Size in stat card icons:** `className="h-4 w-4"` inside a `rounded-lg bg-primary/10 p-2` container
4. **Size in empty states:** `className="h-8 w-8 text-muted-foreground"`
5. **Inline with text:** always add `mr-2` (left icon) or `ml-2` (right icon)
6. **Accessibility:** always add `<span className="sr-only">Description</span>` for icon-only buttons

---

## Tooltip Pattern

For icon buttons that need labels:

```jsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon">
        <Copy className="h-4 w-4" />
        <span className="sr-only">Copy to clipboard</span>
      </Button>
    </TooltipTrigger>
    <TooltipContent>Copy to clipboard</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## Common Anti-Patterns to Avoid

| ❌ Don't | ✅ Do instead |
|---|---|
| `className="text-gray-500"` | `className="text-muted-foreground"` |
| `className="bg-gray-100"` | `className="bg-muted"` |
| `className="border-gray-200"` | `className="border-border"` |
| Hardcode `#fba267` | `className="text-primary"` |
| `text-red-500` | `text-destructive` |
| Big layout shifts on load | Always use skeleton fallbacks |
| Generic `<button>` tag | Always use `<Button>` from `@/components/ui/button` |
| Inline `style={{}}` | Always use Tailwind classes with CSS token vars |
