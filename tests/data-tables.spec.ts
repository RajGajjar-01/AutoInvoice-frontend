import { expect, test } from "@playwright/test"
import { createUser } from "./utils/privateApi"
import { randomEmail, randomPassword } from "./utils/random"
import { logInUser } from "./utils/user"

const isTableRowUpdate = (url: string) =>
  /\/api\/v1\/tables\/[^/]+\/rows\/[^/]+$/.test(new URL(url).pathname)

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

  test("clicking into an unchanged cell does not select all text or send an update", async ({
    page,
  }) => {
    const email = randomEmail()
    const password = randomPassword()

    await createUser({ email, password })
    await logInUser(page, email, password)

    const updateRequests: string[] = []
    page.on("request", (request) => {
      if (request.method() === "PUT" && isTableRowUpdate(request.url())) {
        updateRequests.push(request.url())
      }
    })

    await page.goto("/data-tables/new?templateId=invoice-tracker")
    await page.getByRole("button", { name: "Save Table" }).click()
    await page.waitForURL(/\/data-tables\/.+/)
    await page.getByRole("button", { name: "Add Row" }).first().click()

    const clientCell = page.locator('[data-row="0"][data-col="1"]')
    const clientInput = clientCell.locator("input")

    await clientCell.locator("button").click()
    await expect(clientInput).toBeFocused()
    await clientInput.fill("Acme Labs")

    const firstUpdate = page.waitForResponse(
      (response) =>
        response.request().method() === "PUT" &&
        isTableRowUpdate(response.url()),
    )
    await page.getByRole("columnheader", { name: /Invoice No/i }).click()
    await firstUpdate
    await expect(
      clientCell.getByText("Acme Labs", { exact: true }),
    ).toBeVisible()

    updateRequests.length = 0

    await clientCell.getByRole("button", { name: "Acme Labs" }).click()
    await expect(clientInput).toBeFocused()

    const selection = await clientInput.evaluate((input) => ({
      selectionStart: input.selectionStart,
      selectionEnd: input.selectionEnd,
    }))

    expect(selection.selectionStart).toBe(selection.selectionEnd)

    await page.getByRole("columnheader", { name: /Invoice No/i }).click()
    await page.waitForTimeout(400)

    expect(updateRequests).toHaveLength(0)
  })
})
