import { test, expect } from "@playwright/test";

import { generateUser, getRandomBook } from "./test-data/test-data";
import createApiClient from "./api/api-client";
import createLoginPage from "./pages/login-page";
import createProfilePage from "./pages/profile-page.js";

test.describe("Book Store Tests", () => {
  test("should register, login, add book and verify in UI", async ({
    page,
    request,
  }) => {
    // Initialize all components
    const apiClient = createApiClient(request);
    const loginPage = createLoginPage(page);
    const profilePage = createProfilePage(page);
    const user = generateUser();
    const book = getRandomBook();

    // Test execution
    const registerResponse = await apiClient.registerUser(user);
    expect(registerResponse.status()).toBe(201);

    const loginResponse = await apiClient.login(user);
    expect(loginResponse.status()).toBe(200);

    const addBookResponse = await apiClient.addBookToUser(book);
    expect(addBookResponse.status()).toBe(201);
    // await apiClient.registerUser(user);
    // await apiClient.login(user);
    // await apiClient.addBookToUser(book);
    await loginPage.navigate();
    await loginPage.login(user.username, user.password);
    await profilePage.navigate();
    await page.waitForURL(/profile$/); // Ensure navigation completed
    await page.waitForSelector('a[href*="book="]'); // Wait for book links
    // 1. Print the entire table contents
    await profilePage.debugTableContents();
    await expect(profilePage.getBookRow(book.isbn)).toBeVisible();

    // Cleanup
    await apiClient.deleteUser();
  });
});
