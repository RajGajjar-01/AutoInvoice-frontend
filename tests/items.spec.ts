import { expect, test } from "@playwright/test"
import { createUser } from "./utils/privateApi"
import {
  randomEmail,
  randomItemDescription,
  randomItemTitle,
  randomPassword,
} from "./utils/random"
import { logInUser } from "./utils/user"

test("Items page is accessible and shows correct title", async ({ page }) => {
  await page.goto("/items")
  await expect(
    page.getByRole("heading", { name: "Items", exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText("Manage your product catalogue and track stock"),
  ).toBeVisible()
})
test("Add Item button is visible", async ({ page }) => {
  await page.goto("/items")
  await expect(page.getByRole("button", { name: "Add Item" })).toBeVisible()
})
test.describe("Items management", () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  let email
  const password = randomPassword()
  test.beforeAll(async () => {
    email = randomEmail()
    await createUser({ email, password })
  })
  test.beforeEach(async ({ page }) => {
    await logInUser(page, email, password)
    await page.goto("/items")
  })
  test("Create a new item successfully", async ({ page }) => {
    const title = randomItemTitle()
    const description = randomItemDescription()
    await page.getByRole("button", { name: "Add Item" }).click()
    await page.getByLabel("Item Name").fill(title)
    await page.getByLabel("Description").fill(description)
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Add Item" })
      .click()
    await expect(page.getByText("Item added successfully")).toBeVisible()
    await expect(page.getByText(title)).toBeVisible()
  })
  test("Create item with only required fields", async ({ page }) => {
    const title = randomItemTitle()
    await page.getByRole("button", { name: "Add Item" }).click()
    await page.getByLabel("Item Name").fill(title)
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Add Item" })
      .click()
    await expect(page.getByText("Item added successfully")).toBeVisible()
    await expect(page.getByText(title)).toBeVisible()
  })
  test("Cancel item creation", async ({ page }) => {
    await page.getByRole("button", { name: "Add Item" }).click()
    await page.getByLabel("Item Name").fill("Test Item")
    await page.getByRole("button", { name: "Cancel" }).click()
    await expect(page.getByRole("dialog")).not.toBeVisible()
  })
  test("Item name is required", async ({ page }) => {
    await page.getByRole("button", { name: "Add Item" }).click()
    await page.getByLabel("Item Name").fill("")
    await page.getByLabel("Item Name").blur()
    await expect(page.getByText("Item name is required")).toBeVisible()
  })
  test.describe("Edit and Delete", () => {
    let itemTitle
    test.beforeEach(async ({ page }) => {
      itemTitle = randomItemTitle()
      await page.getByRole("button", { name: "Add Item" }).click()
      await page.getByLabel("Item Name").fill(itemTitle)
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Add Item" })
        .click()
      await expect(page.getByText("Item added successfully")).toBeVisible()
      await expect(page.getByRole("dialog")).not.toBeVisible()
    })
    test("Edit an item successfully", async ({ page }) => {
      const itemRow = page.getByRole("row").filter({ hasText: itemTitle })
      await itemRow.getByRole("button").last().click()
      await page.getByRole("menuitem", { name: "Edit" }).click()
      const updatedTitle = randomItemTitle()
      await page.getByLabel("Item Name").fill(updatedTitle)
      await page.getByRole("button", { name: "Save" }).click()
      await expect(page.getByText("Item updated successfully")).toBeVisible()
      await expect(page.getByText(updatedTitle)).toBeVisible()
    })
    test("Delete an item successfully", async ({ page }) => {
      const itemRow = page.getByRole("row").filter({ hasText: itemTitle })
      await itemRow.getByRole("button").last().click()
      await page.getByRole("menuitem", { name: "Delete" }).click()
      await page.getByRole("button", { name: "Delete" }).click()
      await expect(page.getByText("Item deleted")).toBeVisible()
      await expect(page.getByText(itemTitle)).not.toBeVisible()
    })
  })
})
test.describe("Items empty state", () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  test("Shows empty state message when no items exist", async ({ page }) => {
    const email = randomEmail()
    const password = randomPassword()
    await createUser({ email, password })
    await logInUser(page, email, password)
    await page.goto("/items")
    await expect(page.getByText("No items yet")).toBeVisible()
    await expect(
      page.getByText(
        "Add your first product or service to start tracking stock and creating invoices.",
      ),
    ).toBeVisible()
  })
})
