// @ts-check
import { test, expect } from "@playwright/test";

test.describe("filling inputs and click submit button", async () => {
  const testData = {
    userName: "Homer Simpson",
    userEmail: "homer.simpson@dohmail.com",
    currentAddress: "742 Evergreen Terrace, Springfield, IL 62704, USA",
    permanentAddress: "Same as current address",
  };

  const fieldMap = {
    "#userName": "userName",
    "#userEmail": "userEmail",
    "textarea#currentAddress": "currentAddress",
    "textarea#permanentAddress": "permanentAddress",
  };
  // Fill and submit form, checks for data entered
  test("filling inputs", async ({ page }) => {
    await page.goto("https://demoqa.com/text-box/");

    for (const [selector, dataKey] of Object.entries(fieldMap)) {
      await page.locator(selector).fill(testData[dataKey]);
    }

    await page.getByRole("button", { name: "Submit" }).click();

    for (const [selector, key] of Object.entries(fieldMap)) {
      await expect(page.locator(selector)).toHaveValue(testData[key]);
    }
  });
  //Verify form accepts and displays valid input after submission
  test("positive scenario for input fields", async ({ page }) => {
    await page.goto("https://demoqa.com/text-box/");

    for (const [selector, dataKey] of Object.entries(fieldMap)) {
      await page.locator(selector).fill(testData[dataKey]);
    }

    await page.getByRole("button", { name: "Submit" }).click();
    // Assert output section shows correct data
    await expect(page.locator("#output #name")).toHaveText(
      `Name:${testData.userName}`
    );
    await expect(page.locator("#output #email")).toHaveText(
      `Email:${testData.userEmail}`
    );
    await expect(page.locator("#output #currentAddress")).toContainText(
      testData.currentAddress
    );
    await expect(page.locator("#output #permanentAddress")).toContainText(
      testData.permanentAddress
    );
  });

  test("negative scenario for input fields", async ({ page }) => {
    await page.goto("https://demoqa.com/text-box/");

    const testData = {
      userEmail: "invalid-email", // Missing '@' and domain
    };

    // Enter only invalid email (skip other fields)
    await page.locator("#userEmail").fill(testData.userEmail);
    await page.getByRole("button", { name: "Submit" }).click();

    // Assert field gets error state
    await expect(page.locator("#userEmail")).toHaveClass(/field-error/); // Checks for error CSS class
    await expect(page.locator("#output")).toBeHidden(); // Output section shouldn't appear
  });
});
