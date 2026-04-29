import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should show login page by default", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /welcome back|с возвращением|bon retour/i })).toBeVisible();
  });

  test("should show register form when clicking create account", async ({ page }) => {
    await page.goto("/");
    await page.getByText(/create account|создать аккаунт|créer un compte/i).click();
    await expect(page.getByRole("heading", { name: /create account|создать аккаунт|créer un compte/i })).toBeVisible();
  });

  test("should validate email format", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder(/your@email/i).fill("invalid-email");
    await page.getByPlaceholder(/enter your password|введите пароль/i).fill("password123");
    await page.getByRole("button", { name: /sign in|войти|se connecter/i }).click();
    // Should not navigate away
    await expect(page).toHaveURL("/");
  });

  test("should show forgot password form", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByRole("heading", { name: /reset password|сброс пароля|réinitialiser/i })).toBeVisible();
  });

  test("should navigate to settings when authenticated", async ({ page }) => {
    // This test checks the route guard redirects unauthenticated users
    await page.goto("/settings");
    // Should redirect to login
    await expect(page).toHaveURL("/");
  });
});
