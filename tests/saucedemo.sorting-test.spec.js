// @ts-check
import { test, expect } from "@playwright/test";

// test.beforeEach(async ({ page }) => {
//   await page.goto("https://www.saucedemo.com/", {
//     waitUntil: "domcontentloaded",
//   });
// });

test.describe("Testing of how product sorting by price (High to Low)", async () => {
  const credentials = { username: "standard_user", password: "secret_sauce" };

  test("Verify product sorting by price (High to Low)", async ({ page }) => {
    // 1. Navigate to Saucedemo
    await page.goto("https://www.saucedemo.com/", {
      waitUntil: "domcontentloaded",
    });
    await expect(page).toHaveTitle("Swag Labs");

    // 2. Login with valid credentials
    await page.locator('[data-test="username"]').fill(credentials.username);
    await page.locator('[data-test="password"]').fill(credentials.password);
    await page.locator('[data-test="login-button"]').click();
    // Verify successful login
    await expect(page.locator('[data-test="title"]')).toHaveText("Products");

    // 3. Sort products by price (High to Low)
    await page
      .locator('[data-test="product-sort-container"]')
      .selectOption("hilo");

    // 4. Verify products are sorted correctly
    const prices = await page
      .locator('[data-test="inventory_item_price"]')
      .allTextContents();
    const numericPrices = prices.map((price) =>
      parseFloat(price.replace("$", ""))
    );
    // Check if prices are in descending order
    for (let i = 0; i < numericPrices.length - 1; i++) {
      expect(numericPrices[i]).toBeGreaterThanOrEqual(numericPrices[i + 1]);
    }
    // Visual confirmation (optional)
    await page.screenshot({ path: "products-sorted-high-to-low.png" });
  });
});
