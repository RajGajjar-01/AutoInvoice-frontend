import { expect, test } from "@playwright/test"
import { firstSuperuser, firstSuperuserPassword } from "./config.js"
import { randomPassword } from "./utils/random.js"

test.use({ storageState: { cookies: [], origins: [] } })
const fillForm = async (page, email, password) => {
  await page.getByTestId("email-input").fill(email)
  await page.getByTestId("password-input").fill(password)
}
const verifyInput = async (page, testId) => {
  const input = page.getByTestId(testId)
  await expect(input).toBeVisible()
  await expect(input).toHaveText("")
  await expect(input).toBeEditable()
}

const replaceAccessTokenCookie = async (page, value) => {
  await page.context().addCookies([
    {
      name: "access_token",
      value,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ])
}

test("Inputs are visible, empty and editable", async ({ page }) => {
  await page.goto("/login")
  await verifyInput(page, "email-input")
  await verifyInput(page, "password-input")
})
test("Log In button is visible", async ({ page }) => {
  await page.goto("/login")
  await expect(page.getByRole("button", { name: "Log In" })).toBeVisible()
})
test("Forgot Password link is visible", async ({ page }) => {
  await page.goto("/login")
  await expect(
    page.getByRole("link", { name: "Forgot your password?" }),
  ).toBeVisible()
})
test("Log in with valid email and password ", async ({ page }) => {
  await page.goto("/login")
  await fillForm(page, firstSuperuser, firstSuperuserPassword)
  await page.getByRole("button", { name: "Log In" }).click()
  await page.waitForURL("/dashboard")
  await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible()
})
test("Log in with invalid email", async ({ page }) => {
  await page.goto("/login")
  await fillForm(page, "invalidemail", firstSuperuserPassword)
  await page.getByRole("button", { name: "Log In" }).click()
  await expect(page.getByText("Invalid email address")).toBeVisible()
})
test("Log in with invalid password", async ({ page }) => {
  const password = randomPassword()
  await page.goto("/login")
  await fillForm(page, firstSuperuser, password)
  await page.getByRole("button", { name: "Log In" }).click()
  await expect(page.getByText("Incorrect email or password")).toBeVisible()
})
test("Successful log out", async ({ page }) => {
  await page.goto("/login")
  await fillForm(page, firstSuperuser, firstSuperuserPassword)
  await page.getByRole("button", { name: "Log In" }).click()
  await page.waitForURL("/dashboard")
  await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible()
  await page.getByTestId("user-menu").click()
  await page.getByRole("menuitem", { name: "Log out" }).click()
  await page.waitForURL("/login")
})
test("Logged-out user cannot access protected routes", async ({ page }) => {
  await page.goto("/login")
  await fillForm(page, firstSuperuser, firstSuperuserPassword)
  await page.getByRole("button", { name: "Log In" }).click()
  await page.waitForURL("/dashboard")
  await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible()
  await page.getByTestId("user-menu").click()
  await page.getByRole("menuitem", { name: "Log out" }).click()
  await page.waitForURL("/login")
  await page.goto("/settings")
  await page.waitForURL("/login")
})
test("Redirects to /login when token is wrong", async ({ page }) => {
  await page.goto("/settings")
  await page.evaluate(() => {
    localStorage.setItem("access_token", "invalid_token")
  })
  await page.goto("/settings")
  await page.waitForURL("/login")
  await expect(page).toHaveURL("/login")
})

test("Keeps user signed in by refreshing expired access token", async ({
  page,
}) => {
  await page.goto("/login")
  await fillForm(page, firstSuperuser, firstSuperuserPassword)
  await page.getByRole("button", { name: "Log In" }).click()
  await page.waitForURL("/dashboard")

  const refreshResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/v1/auth/refresh") &&
      response.request().method() === "POST",
  )

  await replaceAccessTokenCookie(page, "invalid_access_token")
  await page.goto("/settings")

  const refreshResponse = await refreshResponsePromise
  expect(refreshResponse.ok()).toBeTruthy()
  await page.waitForURL("/settings")
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible()
})

test("Keeps invoice templates accessible after access token expires", async ({
  page,
}) => {
  await page.goto("/login")
  await fillForm(page, firstSuperuser, firstSuperuserPassword)
  await page.getByRole("button", { name: "Log In" }).click()
  await page.waitForURL("/dashboard")

  const refreshResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/v1/auth/refresh") &&
      response.request().method() === "POST",
  )

  await replaceAccessTokenCookie(page, "invalid_access_token")
  await page.goto("/invoice-templates")

  const refreshResponse = await refreshResponsePromise
  expect(refreshResponse.ok()).toBeTruthy()
  await expect(
    page.getByRole("heading", { name: "Invoice Templates" }),
  ).toBeVisible()
})

test("Refreshes session for invoice template actions after access token expires", async ({
  page,
}) => {
  await page.goto("/login")
  await fillForm(page, firstSuperuser, firstSuperuserPassword)
  await page.getByRole("button", { name: "Log In" }).click()
  await page.waitForURL("/dashboard")

  await page.goto("/invoice-templates")
  await expect(
    page.getByRole("heading", { name: "Invoice Templates" }),
  ).toBeVisible()

  const refreshResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/v1/auth/refresh") &&
      response.request().method() === "POST",
  )

  await replaceAccessTokenCookie(page, "invalid_access_token")
  await page.getByRole("button", { name: "Use This" }).first().click()

  const refreshResponse = await refreshResponsePromise
  expect(refreshResponse.ok()).toBeTruthy()
  await expect(
    page.getByText("Template selected! It will be used for new invoices."),
  ).toBeVisible()
})
