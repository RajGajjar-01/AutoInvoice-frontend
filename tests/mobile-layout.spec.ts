import { expect, test } from "@playwright/test"

const recordId = "00000000-0000-4000-8000-000000000002"
const ownerId = "00000000-0000-4000-8000-000000000001"
const timestamps = {
  created_at: "2026-10-09T12:00:00Z",
  updated_at: "2026-10-09T12:00:00Z",
}

for (const [path, action] of [
  [`/invoice-history/${recordId}`, "Preview"],
  ["/create-invoice", "Preview Invoice"],
]) {
  test(`${path} invoice preview keeps its close action inside the dialog`, async ({
    page,
  }) => {
    await page.goto(path)
    await page.getByRole("button", { name: action, exact: true }).click()
    const dialog = page.getByRole("dialog", {
      name: "Invoice Preview",
      exact: true,
    })
    await expect(dialog).toBeVisible()
    const close = dialog
      .getByRole("button", { name: "Close", exact: true })
      .and(dialog.locator('[data-slot="button"]'))
    await expect(async () => {
      const dialogBox = (await dialog.boundingBox())!
      const closeBox = (await close.boundingBox())!
      expect(closeBox.y + closeBox.height).toBeLessThanOrEqual(
        dialogBox.y + dialogBox.height,
      )
    }).toPass({ timeout: 5000 })
    await close.click()
    await expect(dialog).not.toBeVisible()
  })
}
const customer = {
  id: recordId,
  owner_id: ownerId,
  name: "A long business name for mobile layout review",
  email: "accounts@example.com",
  phone: "9876543210",
  party_type: "customer",
  tags: [],
  opening_balance: 0,
  ...timestamps,
}
const item = {
  id: recordId,
  owner_id: ownerId,
  name: "Inventory product for mobile review",
  price: 250,
  stock: 12,
  unit: "pcs",
  tax_rate: 18,
  stock_history: [],
  ...timestamps,
}
const invoice = {
  id: recordId,
  owner_id: ownerId,
  customer_id: recordId,
  invoice_number: "INV-2026-001",
  invoice_date: "2026-10-09",
  currency: "INR",
  grand_total: 295,
  subtotal: 250,
  total_tax: 45,
  status: "unpaid",
  items: [],
  customer,
  ...timestamps,
}
const table = {
  id: recordId,
  owner_id: ownerId,
  name: "Mobile review table",
  columns: [{ id: "name", name: "Name", type: "Text" }],
  rows: [],
  reminders: [],
  ...timestamps,
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("vite-ui-theme", "light"))
  // Isolate layout checks from account data and external integrations.
  await page.route("**/api/v1/**", (route) => {
    const path = new URL(route.request().url()).pathname
    if (path === "/api/v1/auth/me" || path === "/api/v1/users/me") {
      return route.fulfill({
        json: {
          id: "00000000-0000-4000-8000-000000000001",
          email: "review@example.com",
          full_name: "Mobile Review",
          is_active: true,
          is_verified: true,
          is_superuser: true,
        },
      })
    }
    if (path.includes("company-settings")) return route.fulfill({ json: {} })
    if (path.includes("stats")) return route.fulfill({ json: {} })
    if (path.endsWith("/categories")) return route.fulfill({ json: [] })
    for (const [resource, record] of [
      ["customers", customer],
      ["items", item],
      ["invoices", invoice],
      ["tables", table],
    ] as const) {
      if (path === `/api/v1/${resource}/${recordId}`)
        return route.fulfill({ json: record })
      if (path === `/api/v1/${resource}/` || path === `/api/v1/${resource}`)
        return route.fulfill({ json: { data: [record], count: 1 } })
    }
    return route.fulfill({ json: { data: [], count: 0 } })
  })
})

for (const [path, trigger, title] of [
  ["/customers", "Add Customer", "Add Party"],
  ["/items", "Add Item", "Add Item"],
] as const) {
  test(`${title} form is centered, contained and scrollable`, async ({
    page,
  }) => {
    await page.goto(path)
    await page.getByRole("button", { name: trigger, exact: true }).click()
    const dialog = page.getByRole("dialog", { name: title, exact: true })
    await expect(dialog).toBeVisible()
    await expect(async () => {
      const box = await dialog.boundingBox()
      const viewport = page.viewportSize()!
      expect(box).not.toBeNull()
      expect(box!.x).toBeGreaterThanOrEqual(12)
      expect(box!.y).toBeGreaterThanOrEqual(12)
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width - 12)
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height - 12)
      expect(
        Math.abs(box!.y + box!.height / 2 - viewport.height / 2),
      ).toBeLessThan(3)
    }).toPass({ timeout: 5000 })
    const input = dialog.locator("input").first()
    await input.fill("Mobile entry")
    await expect(input).toHaveValue("Mobile entry")
    const last = dialog.locator("input, textarea").last()
    await last.scrollIntoViewIfNeeded()
    await expect(last).toBeInViewport()
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click()
    await expect(dialog).not.toBeVisible()
  })
}

for (const [resource, title] of [
  ["customers", "Edit Party"],
  ["items", "Edit Item"],
]) {
  test(`${title} fields and cancel stay reachable`, async ({ page }) => {
    await page.goto(`/${resource}/${recordId}`)
    await page.getByRole("button", { name: "Edit", exact: true }).click()
    const dialog = page.getByRole("dialog", { name: title, exact: true })
    await expect(dialog).toBeVisible()
    const input = dialog.locator("input").first()
    await input.fill("Edited mobile entry")
    await expect(input).toHaveValue("Edited mobile entry")
    await dialog.locator("input, textarea").last().scrollIntoViewIfNeeded()
    await expect(dialog.locator("input, textarea").last()).toBeInViewport()
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click()
    await expect(dialog).not.toBeVisible()
  })
}

test("table creation controls and properties fit the viewport", async ({
  page,
}) => {
  await page.goto("/data-tables/new")
  const save = page.getByRole("button", { name: "Save Table", exact: true })
  await expect(save).toBeVisible()
  for (const control of [save, page.locator('[data-panel="side-column"]')]) {
    const box = (await control.boundingBox())!
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width)
  }
  await page.getByLabel("Table Name", { exact: false }).fill("Mobile table")
  const add = page.getByRole("button", { name: "Add New Column", exact: true })
  await add.scrollIntoViewIfNeeded()
  await add.click()
  await expect(page.locator('[data-panel="side-column"]')).toContainText(
    "2 columns",
  )
})

for (const path of [
  "/dashboard",
  "/invoices",
  "/create-invoice",
  "/create-quotation",
  "/create-challan",
  "/create-proforma",
  "/customers",
  "/items",
  "/data-tables",
  "/data-tables/new",
  "/invoice-templates",
  "/template-builder",
  "/insights",
  "/notifications",
  "/profile",
  "/settings",
  "/admin",
  "/invoice-history",
  `/customers/${recordId}`,
  `/items/${recordId}`,
  `/invoice-history/${recordId}`,
  `/data-tables/${recordId}`,
]) {
  test(`${path} fits the viewport`, async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.goto(path)
    await expect(
      page.locator("main").first().getByRole("heading").first(),
    ).toBeVisible()
    await expect(
      page.getByText("Something went wrong", { exact: true }),
    ).toHaveCount(0)
    await expect(async () => {
      const bounds = await page
        .locator("main")
        .first()
        .evaluate((el) => {
          const r = el.getBoundingClientRect()
          return {
            left: r.left,
            right: r.right,
            scroll: el.scrollWidth,
            width: el.clientWidth,
          }
        })
      expect(bounds.left).toBeGreaterThanOrEqual(0)
      expect(bounds.right).toBeLessThanOrEqual(page.viewportSize()!.width + 1)
      expect(bounds.scroll).toBeLessThanOrEqual(bounds.width + 1)
    }).toPass({ timeout: 5000 })
    expect(errors).toEqual([])
  })
}
