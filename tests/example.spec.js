// @ts-check
import { test, expect } from "@playwright/test";

test.describe("filling inputs and click submit button", async () => {
  const testData = {
    firstName: "Homer",
    lastName: "Simpson",
    userEmail: "homer.simpson@dohmail.com",
    userNumber: "1234567890",
    currentAddress: "742 Evergreen Terrace, Springfield, IL 62704, USA",
    gender: "Male",
    hobby: "Sports",
    birthDate: "28 Oct 1995",
    subject: "Maths",
    picturePath: "./tests/test-attachments/IMG_20230223_1010410.png",
    state: "NCR",
    city: "Delhi",
  };

  const selectors = {
    formFields: {
      firstName: "#firstName",
      lastName: "#lastName",
      userEmail: "#userEmail",
      userNumber: "#userNumber",
      currentAddress: "textarea#currentAddress",
    },
    gender: (/** @type {any} */ gender) => `input[value="${gender}"] + label`,
    hobby: (/** @type {any} */ hobby) => `label:has-text("${hobby}")`,
    dateOfBirth: "#dateOfBirthInput",
    subjectsInput: "#subjectsInput",
    uploadPicture: "#uploadPicture",
    stateDropdown: "#state",
    stateOption: (/** @type {any} */ state) => `text=${state}`,
    removeAds: "#fixedban",
    cityDropdown: "#city",
    cityOption: (/** @type {any} */ city) => `text=${city}`,
    submitButton: "#submit",
    successModal: "#example-modal-sizes-title-lg",
    subjectTag:
      "css-12jo7m5 subjects-auto-complete__multi-value__label >> text=Maths",
  };

  test("Complete form submission with validation", async ({ page }) => {
    // Navigate to form
    await page.goto("https://demoqa.com/automation-practice-form/", {
      waitUntil: "domcontentloaded", // or 'load' or 'networkidle'
    });

    // Fill basic form fields
    for (const [field, selector] of Object.entries(selectors.formFields)) {
      await page.locator(selector).fill(testData[field]);
    }

    // Select gender
    await page.locator(selectors.gender(testData.gender)).click();

    // Select hobby
    await page.locator(selectors.hobby(testData.hobby)).click();

    // Set date of birth
    await page.locator(selectors.dateOfBirth).fill(testData.birthDate);
    await page.keyboard.press("Enter");

    // Add subject
    const subjectsInput = page.locator("#subjectsInput");
    await page.locator("#subjectsInput").fill("Maths", { timeout: 5000 });
    const inputValue = await subjectsInput.inputValue();
    if (inputValue.trim() !== "Maths") {
      throw new Error(`Input value is "${inputValue}" instead of "Maths"`);
    }
    await page
      .waitForSelector(".subjects-auto-complete__menu", {
        state: "attached",
        timeout: 3000,
      })
      .catch(() => console.log("No suggestion dropdown appeared"));

    await page.keyboard.press("Enter");

    await expect(
      page.locator(
        '.subjects-auto-complete__multi-value__label:has-text("Maths")'
      )
    ).toBeVisible({ timeout: 5000 });

    // Upload picture
    await page.setInputFiles(selectors.uploadPicture, testData.picturePath);

    // Select state and city
    await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (element) element.remove();
    }, selectors.removeAds);
    await page.locator("#state").press("Enter");
    await page.keyboard.type("NCR");
    await page.keyboard.press("Enter");

    await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (element) element.remove();
    }, selectors.removeAds);
    await page.locator("#city").press("Enter");
    await page.keyboard.type("Delhi");
    await page.keyboard.press("Enter");

    // Submit form
    await page.locator("#submit").click({ force: true });

    // Verify successful submission
    await expect(page.locator(selectors.successModal)).toHaveText(
      "Thanks for submitting the form"
    );

    // Verify form data
    for (const [field, selector] of Object.entries(selectors.formFields)) {
      await expect(page.locator(selector)).toHaveValue(testData[field]);
    }

    await expect(page.getByText("Maths").first()).toBeVisible({
      timeout: 15000,
    });
  });
});
