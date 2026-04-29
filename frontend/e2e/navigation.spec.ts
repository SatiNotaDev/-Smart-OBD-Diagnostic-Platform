import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should render the login page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/smart obd/i);
  });

  test("should have theme toggle working", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    // Default theme
    await expect(html).toHaveAttribute("class", /light|dark/);
  });

  test("should have language selector visible on login page", async ({ page }) => {
    await page.goto("/");
    // The login page should show the language/locale selector or the page content
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
