import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/**", (route) =>
    route.fulfill({
      json: /\/(auth|users)\/me\/?$/.test(
        new URL(route.request().url()).pathname,
      )
        ? {
            id: "settings-user",
            email: "owner@example.com",
            full_name: "Business Owner",
            is_active: true,
            is_verified: true,
            is_superuser: true,
          }
        : { data: [], count: 0 },
    }),
  )
})

test("settings sheets preserve appearance and account controls", async ({
  page,
}) => {
  await page.goto("/settings")
  await page.getByRole("button", { name: /^Appearance Choose/ }).click()
  await page.getByRole("radio", { name: "Dark", exact: true }).check()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await page.keyboard.press("Escape")
  await page.reload()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await page.getByRole("button", { name: /^My profile/ }).click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: /^Password/ }).click()
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Password", exact: true }),
  ).toBeVisible()
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: /^Integrations/ }).click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: /^Log out Sign out/ }).click()
  await page.getByRole("button", { name: "Stay signed in" }).click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})
