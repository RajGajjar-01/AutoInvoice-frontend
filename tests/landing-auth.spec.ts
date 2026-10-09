import { expect, test } from "@playwright/test"

test.use({
  storageState: { cookies: [], origins: [] },
  viewport: { width: 390, height: 844 },
})

test("dashboard link is usable before the landing session check finishes", async ({
  page,
}) => {
  let releaseSession: () => void = () => {}
  const sessionGate = new Promise<void>((resolve) => {
    releaseSession = resolve
  })
  await page.route("**/api/v1/auth/me", async (route) => {
    await sessionGate
    await route.fulfill({
      json: {
        id: "00000000-0000-4000-8000-000000000001",
        email: "review@example.com",
        full_name: "Mobile Review",
        is_active: true,
        is_verified: true,
        is_superuser: false,
      },
    })
  })
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" })
    const dashboard = page
      .locator("header")
      .getByRole("link", { name: "Go to Dashboard" })
    await expect(dashboard).toBeVisible({ timeout: 2000 })
    await expect(dashboard).toHaveAttribute("href", "/dashboard")
    const sessionResponse = page.waitForResponse("**/api/v1/auth/me")
    releaseSession()
    await sessionResponse
    await expect(
      page.locator("header").getByRole("link", { name: "Log In" }),
    ).toHaveCount(0)
    await expect(dashboard).toBeVisible()
  } finally {
    releaseSession()
  }
})

test("a confirmed guest still gets the landing login action", async ({
  page,
}) => {
  await page.route("**/api/v1/**", (route) =>
    route.fulfill({ status: 401, json: { detail: "Not authenticated" } }),
  )
  await page.goto("/")
  await expect(
    page.locator("header").getByRole("link", { name: "Log In" }),
  ).toBeVisible()
  await expect(
    page.locator("header").getByRole("link", { name: "Go to Dashboard" }),
  ).toHaveCount(0)
})
