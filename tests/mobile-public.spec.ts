import { expect, test } from "@playwright/test"

test.use({ storageState: { cookies: [], origins: [] } })

for (const path of [
  "/",
  "/login",
  "/signup",
  "/recover-password",
  "/reset-password?token=layout-check",
  "/verify-email",
  "/privacy-policy",
]) {
  test(`public page ${path} stays within the viewport`, async ({ page }) => {
    await page.route("**/api/v1/**", (route) => {
      if (
        path === "/verify-email" &&
        route.request().url().endsWith("/auth/me")
      ) {
        return route.fulfill({
          json: {
            id: "00000000-0000-4000-8000-000000000001",
            email: "review@example.com",
            full_name: "Mobile Review",
            is_active: true,
            is_verified: false,
            is_superuser: false,
          },
        })
      }
      return route.fulfill({
        status: 401,
        json: { detail: "Not authenticated" },
      })
    })
    await page.goto(path)
    await expect(page.locator("h1").first()).toBeVisible()
    await expect(async () => {
      const width = await page.evaluate(
        () => document.documentElement.scrollWidth,
      )
      expect(width).toBeLessThanOrEqual(page.viewportSize()!.width + 1)
      for (const input of await page.locator("input").all()) {
        if (!(await input.isVisible())) continue
        const box = (await input.boundingBox())!
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(
          page.viewportSize()!.width + 1,
        )
      }
    }).toPass({ timeout: 5000 })
  })
}

test("pending landing dashboard action fits even on a small phone", async ({
  page,
}) => {
  await page.route("**/api/v1/auth/me", () => {})
  await page.goto("/", { waitUntil: "domcontentloaded" })
  const link = page
    .locator("header")
    .getByRole("link", { name: "Go to Dashboard" })
  await expect(link).toBeVisible()
  const box = (await link.boundingBox())!
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width)
})
