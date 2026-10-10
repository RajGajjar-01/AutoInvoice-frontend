import { expect, test } from "@playwright/test"

test.use({ storageState: { cookies: [], origins: [] } })

const user = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "review@example.com",
  full_name: "Routing Review",
  is_active: true,
  is_verified: true,
  is_superuser: false,
}

// Replace the external API; routing, auth queries and UI stay real.
test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/**", (route) => {
    const path = new URL(route.request().url()).pathname
    return route.fulfill({
      json: path === "/api/v1/auth/me" ? user : { data: [], count: 0 },
    })
  })
})

test("signed-in users opening the root go directly to the dashboard", async ({
  page,
}) => {
  await page.goto("/")
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.locator("main").getByRole("heading").first()).toBeVisible()
})

test("a pending session check does not flash the landing page", async ({
  page,
}) => {
  let releaseSession: () => void = () => {}
  const gate = new Promise<void>((resolve) => {
    releaseSession = resolve
  })
  await page.route("**/api/v1/auth/me", async (route) => {
    await gate
    await route.fulfill({ json: user })
  })
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" })
    await expect(page.locator("main")).toHaveCount(0)
    await expect(page.getByRole("link", { name: "Log In" })).toHaveCount(0)
    releaseSession()
    await expect(page).toHaveURL(/\/dashboard$/)
  } finally {
    releaseSession()
  }
})

for (const path of ["/", "/landing"]) {
  test(`guests can see the landing page at ${path}`, async ({ page }) => {
    await page.route("**/api/v1/**", (route) =>
      route.fulfill({ status: 401, json: { detail: "Not authenticated" } }),
    )
    await page.goto(path)
    await expect(
      page.locator("header").getByRole("link", { name: "Log In" }),
    ).toBeVisible()
    await expect(
      page.locator("main").getByRole("heading").first(),
    ).toBeVisible()
    await expect(page).toHaveURL(`http://localhost:5173${path}`)
  })
}

for (const [name, viewport] of [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
] as const) {
  test(`${name} dashboard logo opens landing and dashboard action returns`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await page.goto("/dashboard")
    const logo = page.getByRole("link", {
      name: "UnifiedDesk logo",
      exact: true,
    })
    await expect(logo).toBeVisible()
    await logo.click()
    await expect(page).toHaveURL(/\/landing$/)
    await expect(
      page.locator("main").getByRole("heading").first(),
    ).toBeVisible()
    await page.reload()
    await expect(page).toHaveURL(/\/landing$/)
    await page
      .locator("header")
      .getByRole("link", { name: "Go to Dashboard" })
      .click()
    await expect(page).toHaveURL(/\/dashboard$/)
    await page.goBack()
    await expect(page).toHaveURL(/\/landing$/)
  })
}
