import { expect, test } from "@playwright/test";

test("keeps the temporary consent and workspace usable at a mobile width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products/thoughtform/editor");

  await expect(
    page.getByRole("heading", { name: "Before you begin" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI processing" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Temporary storage" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Use appropriate information" }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveJSProperty(
    "scrollWidth",
    await page.locator("html").evaluate((element) => element.clientWidth),
  );

  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Open the editor" }).click();

  await expect(
    page.getByRole("heading", { name: "What would you like to think through?" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Conversation" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.locator("html")).toHaveJSProperty(
    "scrollWidth",
    await page.locator("html").evaluate((element) => element.clientWidth),
  );
});
