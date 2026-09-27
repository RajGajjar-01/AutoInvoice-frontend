import { expect, test } from "@playwright/test"

test("Business identity shows an inline error before sending empty name", async ({
  page,
}) => {
  await page.goto("/profile")
  await page.getByRole("button", { name: "Edit business identity" }).click()
  await page.getByLabel("Business name").fill("")
  await page.getByRole("button", { name: "Save", exact: true }).click()
  await expect(page.getByText("Business name is required")).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Save", exact: true }),
  ).toBeVisible()
})

test("Failed business save keeps the editor open and hides server details", async ({
  page,
}) => {
  await page.route("**/api/v1/company-settings/**", async (route) => {
    if (route.request().method() === "PUT") {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          detail: "Traceback: private database password",
        }),
      })
    } else {
      await route.continue()
    }
  })
  await page.goto("/profile")
  await page.getByRole("button", { name: "Edit business identity" }).click()
  await page.getByLabel("Business name").fill("Test Traders")
  await page.getByRole("button", { name: "Save", exact: true }).click()
  await expect(page.getByText(/Could not save business identity/)).toBeVisible()
  await expect(page.getByLabel("Business name")).toHaveValue("Test Traders")
  await expect(
    page.getByRole("button", { name: "Save", exact: true }),
  ).toBeVisible()
  await expect(page.getByText(/private database password/)).toHaveCount(0)
})

test("Business details fit a phone screen without horizontal page scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/profile")
  await expect(page.getByText("essentials added")).toBeVisible()
  const width = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }))
  expect(width.page).toBeLessThanOrEqual(width.viewport)
})
