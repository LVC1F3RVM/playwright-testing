function createProfilePage(page) {
  const getBookRow = (isbn) => page.locator(`a[href*="${isbn}"]`).first();

  // NEW: Add a debug function to print the entire table
  const debugTableContents = async () => {
    const tableHtml = await page.locator(".rt-tbody").innerHTML();
    console.log("Current Table Contents:", tableHtml);
  };

  async function navigate() {
    await page.goto("https://demoqa.com/profile");
  }

  const isBookVisible = async (isbn) => {
    const row = getBookRow(isbn);
    return await row.isVisible();
  };

  return {
    getBookRow,
    debugTableContents,
    navigate,
    isBookVisible,
  };
}

export default createProfilePage;
