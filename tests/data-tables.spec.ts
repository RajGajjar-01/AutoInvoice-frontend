import { expect, test } from "@playwright/test"
import { createUser } from "./utils/privateApi"
import { randomEmail, randomPassword } from "./utils/random"
import { logInUser } from "./utils/user"

test.describe("Data tables", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("shows the rebuilt template catalog", async ({ page }) => {
    const email = randomEmail()
    const password = randomPassword()

    await createUser({ email, password })
    await logInUser(page, email, password)

    await page.goto("/data-tables")
    await page.getByRole("tab", { name: "Templates" }).click()

    for (const templateName of [
      "Invoice Tracker",
      "Client Directory",
      "Expense Tracker",
      "Contract Tracker",
      "Sales Pipeline",
      "Project Tracker",
      "Subscription Billing",
      "Lead CRM",
      "Purchase Orders",
      "Vendor Tracker",
    ]) {
      await expect(page.getByText(templateName, { exact: true })).toBeVisible()
    }
  })

  test("can add a row to a table created from a template", async ({ page }) => {
    const email = randomEmail()
    const password = randomPassword()

    await createUser({ email, password })
    await logInUser(page, email, password)

    await page.goto("/data-tables/new?templateId=invoice-tracker")
    await page.getByRole("button", { name: "Save Table" }).click()
    await page.waitForURL(/\/data-tables\/.+/)

    const emptyState = page.getByText(
      'No rows yet. Click "Add Row" to get started.',
    )
    await expect(emptyState).toBeVisible()

    await page.getByRole("button", { name: "Add Row" }).first().click()

    await expect(emptyState).not.toBeVisible()
    await expect(
      page.getByRole("cell", { name: "1", exact: true }),
    ).toBeVisible()
  })
})
