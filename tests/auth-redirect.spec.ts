import { expect, test } from "@playwright/test"

test("Authenticated users are redirected away from auth routes", async ({
  page,
}) => {
  await page.goto("/login")
  await page.waitForURL("/dashboard")
  await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible()

  await page.goto("/signup")
  await page.waitForURL("/dashboard")
  await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible()
})
