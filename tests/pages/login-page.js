function createLoginPage(page) {
  const usernameInput = page.locator("#userName");
  const passwordInput = page.locator("#password");
  const loginButton = page.locator("#login");

  async function navigate() {
    await page.goto("https://demoqa.com/login");
  }

  async function login(username, password) {
    await usernameInput.fill(username);
    await passwordInput.fill(password);
    await loginButton.click();
    await page.waitForURL("https://demoqa.com/profile");
  }

  return {
    navigate,
    login,
  };
}

export default createLoginPage;
