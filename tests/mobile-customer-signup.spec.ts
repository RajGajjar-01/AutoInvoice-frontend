import { expect, type Page, test } from "@playwright/test"

test.use({
  storageState: { cookies: [], origins: [] },
  viewport: { width: 390, height: 844 },
})

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("vite-ui-theme", "light"))
})

async function mockCustomersPage(page: Page) {
  await page.route("**/api/v1/**", async (route) => {
    const { pathname } = new URL(route.request().url())
    if (pathname === "/api/v1/auth/me") {
      return route.fulfill({
        json: {
          id: "00000000-0000-4000-8000-000000000001",
          email: "raj@example.com",
          full_name: "Raj Patel",
          is_active: true,
          is_superuser: false,
          is_verified: true,
        },
      })
    }
    if (pathname === "/api/v1/customers/") {
      return route.fulfill({ json: { data: [], count: 0 } })
    }
    return route.fulfill({ status: 404, json: { detail: "Not found" } })
  })
}

test("empty customers page offers one add action", async ({ page }) => {
  await mockCustomersPage(page)
  await page.goto("/customers")

  await expect(page.getByText("No parties yet")).toBeVisible()
  await expect(page.getByRole("button", { name: "Add Customer" })).toHaveCount(
    1,
  )
})

test("mobile More opens destinations without opening a sidebar", async ({
  page,
}) => {
  await mockCustomersPage(page)
  await page.goto("/customers")

  await expect(
    page.getByRole("img", { name: "UnifiedDesk logo" }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Toggle Sidebar" }),
  ).toHaveCount(0)
  await page.getByRole("button", { name: "Open all navigation" }).click()
  const more = page.getByRole("dialog", { name: "More" })
  await expect(more).toBeVisible()
  await expect(more.getByRole("link", { name: "Items" })).toBeVisible()
})

test("duplicate signup explains the email conflict beside the form", async ({
  page,
}) => {
  await page.route("**/api/v1/**", async (route) => {
    const { pathname } = new URL(route.request().url())
    if (pathname === "/api/v1/auth/signup") {
      return route.fulfill({
        status: 400,
        json: { detail: "A user with this email already exists" },
      })
    }
    return route.fulfill({ status: 401, json: { detail: "Not authenticated" } })
  })
  await page.goto("/signup")
  await page.getByTestId("full-name-input").fill("Raj Patel")
  await page.getByTestId("email-input").fill("raj@example.com")
  await page.getByTestId("password-input").fill("password123")
  await page.getByTestId("confirm-password-input").fill("password123")
  await page.getByRole("button", { name: "Create Account" }).click()

  await expect(
    page.getByText("This email already has an account."),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Sign in instead" }),
  ).toHaveAttribute("href", "/login")
  await expect(
    page.getByRole("link", { name: "Reset password" }),
  ).toHaveAttribute("href", "/recover-password")
  await expect(
    page.getByText("Some details were rejected. Check the form and try again."),
  ).toHaveCount(0)
})

test("a stale duplicate response does not mark a newly edited email", async ({
  page,
}) => {
  let releaseResponse: () => void = () => {}
  let requestReceived: () => void = () => {}
  const responseGate = new Promise<void>((resolve) => {
    releaseResponse = resolve
  })
  const requestGate = new Promise<void>((resolve) => {
    requestReceived = resolve
  })

  await page.route("**/api/v1/**", async (route) => {
    const { pathname } = new URL(route.request().url())
    if (pathname === "/api/v1/auth/signup") {
      requestReceived()
      await responseGate
      return route.fulfill({
        status: 400,
        json: { detail: "A user with this email already exists" },
      })
    }
    return route.fulfill({ status: 401, json: { detail: "Not authenticated" } })
  })
  await page.goto("/signup")
  await page.getByTestId("full-name-input").fill("Raj Patel")
  await page.getByTestId("email-input").fill("old@example.com")
  await page.getByTestId("password-input").fill("password123")
  await page.getByTestId("confirm-password-input").fill("password123")
  await page.getByRole("button", { name: "Create Account" }).click()
  await requestGate

  await page.getByTestId("email-input").fill("new@example.com")
  const responsePromise = page.waitForResponse((response) =>
    response.url().endsWith("/api/v1/auth/signup"),
  )
  releaseResponse()
  await responsePromise
  await expect(
    page.getByText("This email already has an account."),
  ).toHaveCount(0)
})
