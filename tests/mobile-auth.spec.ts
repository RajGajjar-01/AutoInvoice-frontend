import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/**", (route) =>
    route.fulfill({ status: 401, json: { detail: "Not authenticated" } }),
  )
})

for (const theme of ["light", "dark"]) {
  test(`auth screens fit and remain usable in ${theme} mode`, async ({
    page,
  }) => {
    await page.addInitScript(
      (value) => localStorage.setItem("vite-ui-theme", value),
      theme,
    )
    for (const path of ["/login", "/signup"]) {
      await page.goto(path)
      const main = page.getByRole("main")
      await expect(main).toBeVisible()
      await expect(main.getByRole("heading", { level: 1 })).toBeVisible()
      const submit = main.getByRole("button", {
        name: path === "/login" ? "Sign In" : "Create Account",
        exact: true,
      })
      await submit.scrollIntoViewIfNeeded()
      await expect(submit).toBeInViewport()
      for (const input of await main.locator("input").all()) {
        const box = (await input.boundingBox())!
        expect(box.height).toBeGreaterThanOrEqual(48)
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(
          page.viewportSize()!.width + 1,
        )
        expect(
          await input.evaluate((el) =>
            Number.parseFloat(getComputedStyle(el).fontSize),
          ),
        ).toBeGreaterThanOrEqual(16)
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
      await expect(
        main.getByRole("link", { name: "Continue with Google" }),
      ).toHaveAttribute("href", /\/auth\/google\/login$/)
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.screenshot({
        path: `/tmp/unifieddesk-${path.slice(1)}-${theme}-${page.viewportSize()!.width}.png`,
        fullPage: true,
        animations: "disabled",
      })
    }
  })
}

test("auth forms preserve validation, visibility and navigation", async ({
  page,
}) => {
  await page.goto("/login")
  await page.getByTestId("email-input").fill("owner@example.com")
  await page.getByTestId("password-input").fill("short")
  await page.getByRole("button", { name: "Show password", exact: true }).click()
  await expect(page.getByTestId("password-input")).toHaveAttribute(
    "type",
    "text",
  )
  await page.getByRole("button", { name: "Sign In", exact: true }).click()
  await expect(
    page.getByText("Password must be at least 8 characters"),
  ).toBeVisible()
  await page.getByRole("link", { name: "Sign up", exact: true }).click()
  await page.getByTestId("full-name-input").fill("Aarav Patel")
  await page.getByTestId("email-input").fill("owner@example.com")
  await page.getByTestId("password-input").fill("long-password-one")
  await page.getByTestId("confirm-password-input").fill("long-password-two")
  await page
    .getByRole("button", { name: "Create Account", exact: true })
    .click()
  await expect(page.getByText("The passwords don't match")).toBeVisible()
  await page.getByRole("link", { name: "Log in", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible()
})
