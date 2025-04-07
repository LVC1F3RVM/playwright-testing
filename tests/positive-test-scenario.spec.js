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

test("Successful form submission with valid data", async ({ page }) => {
  await page.goto("https://demoqa.com/automation-practice-form/");

  // Fill all required fields with valid data
  await page.locator(selectors.formFields.firstName).fill("John");
  await page.locator(selectors.formFields.lastName).fill("Doe");
  await page
    .locator(selectors.formFields.userEmail)
    .fill("john.doe@example.com");
  await page.locator(selectors.formFields.userNumber).fill("1234567890");
  await page.locator(selectors.gender("Male")).click();

  // Submit and verify
  await page.locator(selectors.submitButton).click();
  await expect(page.locator(selectors.successModal)).toBeVisible();
});
