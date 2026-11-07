import { expect, type Page, test } from "@playwright/test"

const ownerId = "00000000-0000-4000-8000-000000000001"
const ts = {
  created_at: "2026-10-09T12:00:00Z",
  updated_at: "2026-10-09T12:00:00Z",
}
const customers = [
  {
    id: "c1",
    owner_id: ownerId,
    name: "Sharma Traders",
    party_type: "customer",
    phone: "9876543210",
    tags: [],
    ...ts,
  },
  {
    id: "c2",
    owner_id: ownerId,
    name: "Gupta Electricals",
    party_type: "supplier",
    tags: [],
    ...ts,
  },
  {
    id: "c3",
    owner_id: ownerId,
    name: "Both Ways Ltd",
    party_type: "both",
    tags: [],
    ...ts,
  },
]
const invoice = {
  id: "i1",
  owner_id: ownerId,
  customer_id: "c1",
  invoice_number: "INV-2026-001",
  invoice_date: "2026-10-09",
  currency: "INR",
  grand_total: 295,
  subtotal: 250,
  total_tax: 45,
  status: "unpaid",
  items: [],
  ...ts,
}

async function mockApi(page: Page, opts: { slowPatch?: boolean } = {}) {
  await page.addInitScript(() => localStorage.setItem("vite-ui-theme", "light"))
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path.endsWith("/auth/me") || path.endsWith("/users/me"))
      return route.fulfill({
        json: {
          id: ownerId,
          email: "r@example.com",
          is_active: true,
          is_superuser: false,
        },
      })
    if (route.request().method() === "PATCH" && opts.slowPatch) {
      await new Promise((r) => setTimeout(r, 1500))
      return route.fulfill({ json: { ...invoice, status: "paid" } })
    }
    if (path === "/api/v1/customers/")
      return route.fulfill({
        json: { data: customers, count: customers.length },
      })
    if (path === "/api/v1/invoices/")
      return route.fulfill({ json: { data: [invoice], count: 1 } })
    return route.fulfill({ json: { data: [], count: 0 } })
  })
}

test.beforeEach(({ page }) => {
  test.skip(page.viewportSize()!.width >= 768, "phone layout only")
})

test("offline banner shows while offline and confirms reconnect", async ({
  page,
  context,
}) => {
  await mockApi(page)
  await page.goto("/invoices")
  await expect(page.getByText("INV-2026-001").first()).toBeVisible()
  await context.setOffline(true)
  await expect(
    page.getByRole("status").getByText("You're offline"),
  ).toBeVisible()
  await context.setOffline(false)
  await expect(page.getByRole("status").getByText("Back online")).toBeVisible()
})

test("mark as paid updates the row before the server replies", async ({
  page,
}) => {
  await mockApi(page, { slowPatch: true })
  await page.goto("/invoices")
  await page
    .getByRole("button", { name: "Actions for invoice INV-2026-001" })
    .click()
  await page.getByRole("menuitem", { name: "Mark as paid" }).click()
  // The PATCH takes 1.5 s; the badge must change well before that.
  await expect(
    page.locator(".md\\:hidden").getByText("paid", { exact: true }),
  ).toBeVisible({
    timeout: 500,
  })
})

test("create invoice keeps Save pinned and hides the tab bar", async ({
  page,
}) => {
  await mockApi(page)
  await page.goto("/create-invoice")
  const save = page.getByRole("button", { name: "Save Invoice" }).last()
  await expect(save).toBeInViewport()
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeHidden()
  await page.mouse.wheel(0, 3000)
  await expect(save).toBeInViewport()
})

test("customer chips count and filter 'both' parties into each type", async ({
  page,
}) => {
  await mockApi(page)
  await page.goto("/customers")
  const chips = page.getByRole("group", { name: "Party type" })
  await chips.getByRole("button", { name: /Suppliers/ }).click()
  await expect(
    page.getByRole("link", { name: "Gupta Electricals" }).first(),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Both Ways Ltd" }).first(),
  ).toBeVisible()
  await expect(page.getByRole("link", { name: "Sharma Traders" })).toHaveCount(
    0,
  )
})
