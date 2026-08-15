import { test, expect } from "@playwright/test";

test("Usama AI Assistant handles mocked API failure", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        reply: "Something went wrong while processing your request.",
        sources: [],
        tool: "error",
      }),
    });
  });

  await page.goto("/");

  await expect(page).toHaveTitle(/Usama/i);

  const chatButton = page.getByRole("button", {
    name: /chat|assistant|ask/i,
  });

  await expect(chatButton).toBeVisible();
  await chatButton.click();

  const input = page.getByRole("textbox");
  await expect(input).toBeVisible();

  await input.fill("Tell me about Usama's projects");

  await page.getByRole("button", { name: /send/i }).click();

  await expect(
    page.getByRole("heading", { name: "Tool Error" })
  ).toBeVisible({ timeout: 10000 });
});