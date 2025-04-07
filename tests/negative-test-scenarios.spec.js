import { test, expect } from "@playwright/test";

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
// 1. Missing Required Fields
test("Submission fails when required fields are missing", async ({ page }) => {
  await page.goto("https://demoqa.com/automation-practice-form/");

  // Fill only some fields
  await page.locator(selectors.formFields.firstName).fill("John");
  await page.locator(selectors.gender("Male")).click();
  await page.locator(selectors.formFields.userEmail).fill("invalid-email");

  // Submit and verify error
  await page.locator(selectors.submitButton).click();
  await expect(page.locator(selectors.successModal)).not.toBeVisible();
  await expect(page.locator("#userEmail")).toHaveCSS(
    "border-color",
    "rgb(220, 53, 69)"
  ); // Red border for error
});

// 2. Invalid Email Format
test("Submission fails with invalid email format", async ({ page }) => {
  await page.goto("https://demoqa.com/automation-practice-form/");

  // Fill form with invalid email
  await page.locator(selectors.formFields.userEmail).fill("invalid-email");

  // Verify client-side validation
  const isInvalid = await page
    .locator(selectors.formFields.userEmail)
    .evaluate((el) => el.checkValidity() === false);
  expect(isInvalid).toBeTruthy();
});

// 3. Phone Number Validation
test("Submission fails with invalid phone number", async ({ page }) => {
  await page.goto("https://demoqa.com/automation-practice-form/");

  // Test various invalid patterns
  const invalidNumbers = ["123", "abcdefghij", "12345678901"];

  for (const number of invalidNumbers) {
    await page.locator(selectors.formFields.userNumber).fill(number);
    const isValid = await page
      .locator(selectors.formFields.userNumber)
      .evaluate((el) => el.checkValidity() === false);
    expect(isValid).toBeTruthy();
  }
});
// 4. Boundary Test
test("Field character limits are enforced", async ({ page }) => {
  await page.goto("https://demoqa.com/automation-practice-form/");

  // Test firstName max length
  const longName = "A".repeat(101); // Assuming max is 100
  await page.locator(selectors.formFields.firstName).fill(longName);

  const inputValue = await page
    .locator(selectors.formFields.firstName)
    .inputValue();
  expect(inputValue.length).toBeLessThanOrEqual(100);
});
