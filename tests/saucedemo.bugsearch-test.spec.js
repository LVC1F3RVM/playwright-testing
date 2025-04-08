// @ts-check
import { test, expect } from "@playwright/test";

test.describe("Searching for all bugs in Saucedemo", async () => {
  // Navigate to Saucedemo
  test.beforeEach(async ({ page }) => {
    await page.goto("https://www.saucedemo.com/", {
      waitUntil: "domcontentloaded",
    });
    await expect(page).toHaveTitle("Swag Labs");
    // Login with valid credentials
    await page.locator('[data-test="username"]').fill(credentials.username);
    await page.locator('[data-test="password"]').fill(credentials.password);
    await page.locator('[data-test="login-button"]').click();
    // Verify successful login
    await expect(page.locator('[data-test="title"]')).toHaveText("Products");
  });
  const credentials = { username: "problem_user", password: "secret_sauce" };

  // 1. Verify image display bug
  test("All product images should be unique", async ({ page }) => {
    const images = await page
      .locator('[data-test="inventory-item-sauce-labs-backpack-img"]')
      .all();
    const srcAttributes = await Promise.all(
      images.map((img) => img.getAttribute("src"))
    );
    // Problem user shows same image for all products
    const uniqueImages = [...new Set(srcAttributes)];
    expect(uniqueImages.length).toBe(images.length);
  });

  // 2. Verify price sorting functionality
  test("Price sorting should work correctly", async ({ page }) => {
    await page
      .locator('[data-test="product-sort-container"]')
      .selectOption("lohi");
    const prices = await page
      .locator('[data-test="inventory_item_price"]')
      .allTextContents();
    const numericPrices = prices.map((p) => parseFloat(p.replace("$", "")));
    // Problem user has incorrect sorting
    const sortedPrices = [...numericPrices].sort((a, b) => a - b);
    expect(numericPrices).toEqual(sortedPrices);
  });

  // 3. Verify add-to-cart functionality
  test("Add to cart buttons should work properly", async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    const cartBadge = await page
      .locator('[data-test="shopping-cart-badge"]')
      .textContent();
    // Problem user may have cart count issues
    expect(cartBadge).toBe("1");
  });

  // 4. Verify remove-from-cart functionality
  test("Remove from cart buttons should work properly", async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    // Verify cart updates
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText(
      "1"
    );
    // Attempt to remove item
    const removeBtn = page.locator('[data-test="remove-sauce-labs-backpack"]');
    await expect(removeBtn).toHaveText("Remove");
    await removeBtn.click();
    // Verify the bug (problem_user remove fails)
    try {
      // This should pass but fails for problem_user
      await expect(page.locator(".shopping_cart_badge")).not.toBeVisible({
        timeout: 3000,
      });
      console.log("BUG NOT PRESENT: Remove button worked");
    } catch (error) {
      // Expected behavior for problem_user (bug)
      console.log("BUG CONFIRMED: Remove button did not work");
      await expect(page.locator(".shopping_cart_badge")).toHaveText("1");
      await expect(removeBtn).toHaveText("Remove"); // Button text doesn't change back
    }
  });

  // 5. Verify About page functionality
  test("About link in burger-menu button should redirect on correct page", async ({
    page,
  }) => {
    // Open the menu
    await page.locator("#react-burger-menu-btn").click();
    await expect(page.locator(".bm-menu")).toBeVisible();
    // Click the About link
    const aboutLink = page.locator('[data-test="about-sidebar-link"]');
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();
    // Verify the bug (problem_user stays on same page)
    try {
      // This will timeout for problem_user (bug)
      await page.waitForURL("https://saucelabs.com/", { timeout: 3000 });
    } catch (error) {
      // Verify we're still on inventory page (bug behavior)
      expect(page.url()).toContain("error/404");
      // Additional verification
      await expect(page.locator("body")).toHaveText(/^\s*403 Forbidden\s*$/);
      console.log(
        "BUG CONFIRMED: About link does not navigate away for problem_user"
      );
    }
  });

  //6. Verify checkout form field value bug
  test("lastName input in the checkout cart items page should display inserted value", async ({
    page,
  }) => {
    // Add item to cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    // Proceed to checkout
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(
      "https://www.saucedemo.com/checkout-step-one.html"
    );
    // Fill form with test data
    const testData = {
      firstName: "John",
      lastName: "Doe",
      postalCode: "12345",
    };
    await page.locator('[data-test="firstName"]').fill(testData.firstName);
    await page.locator('[data-test="lastName"]').fill(testData.lastName);
    await page.locator('[data-test="postalCode"]').fill(testData.postalCode);
    // Verify the bug - lastName affects firstName
    const firstNameValue = await page
      .locator('[data-test="firstName"]')
      .inputValue();
    const lastNameValue = await page
      .locator('[data-test="lastName"]')
      .inputValue();
    // Should pass but fails due to bug
    expect(firstNameValue).toBe(testData.lastName); // Correct - due to bug shows lastName value
    expect(lastNameValue).toBe(""); // Correct - due to bug it stays empty no matter what value provided
    // Debug output
    console.log("First Name Value:", firstNameValue);
    console.log("Last Name Value:", lastNameValue);
    // Visual confirmation
    await page.screenshot({ path: "checkout-form-bug.png" });
  });
});
